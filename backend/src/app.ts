import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";

import { validateGenerationRequest, validateTranscriptionRequest } from "./contracts";
import {
  ApiError,
  invalidGeneratedOutputError,
  invalidRequestBodyError,
  toErrorResponse,
} from "./errors";
import { validateGeneratedOutput } from "./outputContracts";
import {
  generateMockOutput,
  generateWithProvider,
} from "./services/generationService";
import type { GenerationProvider } from "./generation/types";
import {
  transcribeMockAudio,
  transcribeWithProvider,
} from "./services/transcriptionService";
import { MockTranscriptionProvider } from "./transcription/mockTranscriptionProvider";
import { readMultipartTranscriptionUpload } from "./transcription/multipart";
import type { TranscriptionProvider } from "./transcription/types";
import type {
  ApiErrorResponse,
  GenerationRequest,
  HealthResponse,
  TranscriptionRequest,
  TranscriptionResponse,
} from "./types";

const maxJsonBodyBytes = 128 * 1024;

type AppHandler = (request: IncomingMessage, response: ServerResponse) => Promise<void>;

type AppDependencies = {
  transcribeAudio?: (request: TranscriptionRequest) => Promise<TranscriptionResponse>;
  transcriptionProvider?: TranscriptionProvider;
  maxAudioUploadBytes?: number;
  generateOutput?: (request: GenerationRequest) => Promise<unknown>;
  generationProvider?: GenerationProvider;
};

type ResolvedAppDependencies = {
  transcribeAudio: (request: TranscriptionRequest) => Promise<TranscriptionResponse>;
  transcriptionProvider: TranscriptionProvider;
  maxAudioUploadBytes: number;
  generateOutput: (request: GenerationRequest) => Promise<unknown>;
};

function setBaseHeaders(response: ServerResponse): void {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type,x-request-id");
  response.setHeader("access-control-expose-headers", "x-request-id");
}

function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  setBaseHeaders(response);
  response.statusCode = status;
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > maxJsonBodyBytes) {
      throw invalidRequestBodyError;
    }

    chunks.push(buffer);
  }

  const body = Buffer.concat(chunks, totalBytes).toString("utf8");

  if (body.trim().length === 0) {
    throw invalidRequestBodyError;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw invalidRequestBodyError;
  }
}

async function handleHealth(
  response: ServerResponse,
  dependencies: ResolvedAppDependencies,
): Promise<void> {
  const payload: HealthResponse = {
    ok: true,
    service: "voice-notes-api",
    mode: dependencies.transcriptionProvider.name === "mock" ? "mock" : "local",
  };
  if (dependencies.transcriptionProvider.name === "local-faster-whisper") {
    payload.transcription = {
      provider: "local-faster-whisper",
      ready: await dependencies.transcriptionProvider.isReady?.() ?? false,
    };
  }

  sendJson(response, 200, payload);
}

async function handleTranscriptions(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: ResolvedAppDependencies,
): Promise<void> {
  const contentType = request.headers["content-type"] ?? "";
  if (contentType.toLowerCase().startsWith("multipart/form-data")) {
    const upload = await readMultipartTranscriptionUpload(
      request,
      dependencies.maxAudioUploadBytes,
    );
    let transcription: TranscriptionResponse;
    try {
      transcription = await transcribeWithProvider(
        dependencies.transcriptionProvider,
        {
          filePath: upload.filePath,
          filename: upload.filename,
          mimeType: upload.mimeType,
          language: upload.language,
        },
        upload.durationMs,
      );
    } finally {
      await upload.cleanup();
    }
    sendJson(response, 200, transcription);
    return;
  }

  // Temporary compatibility bridge until the Expo client switches to multipart.
  if (contentType.toLowerCase().startsWith("application/json")) {
    const body = await readJsonBody(request);
    const validation = validateTranscriptionRequest(body);

    if (!validation.ok) {
      sendJson(response, validation.error.status, toErrorResponse(validation.error));
      return;
    }

    const transcription = await dependencies.transcribeAudio(validation.value);
    sendJson(response, 200, transcription);
    return;
  }

  throw invalidRequestBodyError;
}

async function handleGenerations(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: ResolvedAppDependencies,
): Promise<void> {
  const body = await readJsonBody(request);
  const validation = validateGenerationRequest(body);

  if (!validation.ok) {
    sendJson(response, validation.error.status, toErrorResponse(validation.error));
    return;
  }

  const generatedOutput = await dependencies.generateOutput(validation.value);
  const outputValidation = validateGeneratedOutput(generatedOutput, validation.value.transcript);

  if (!outputValidation.ok) {
    throw invalidGeneratedOutputError;
  }

  sendJson(response, 200, outputValidation.value);
}

function methodNotAllowed(response: ServerResponse): void {
  const payload: ApiErrorResponse = {
    error: {
      code: "method_not_allowed",
      message: "Method not allowed.",
    },
  };

  sendJson(response, 405, payload);
}

function notFound(response: ServerResponse): void {
  const payload: ApiErrorResponse = {
    error: {
      code: "not_found",
      message: "Endpoint not found.",
    },
  };

  sendJson(response, 404, payload);
}

function handleError(
  error: unknown,
  response: ServerResponse,
  requestId: string,
): void {
  if (error instanceof ApiError) {
    sendJson(response, error.status, toErrorResponse(error));
    return;
  }

  console.error("Unhandled API error", {
    errorType: error instanceof Error ? error.name : "UnknownError",
    requestId,
  });

  sendJson(response, 500, {
    error: {
      code: "internal_error",
      message: "The mock API could not complete the request.",
    },
  });
}

export function createApp(dependencies: AppDependencies = {}): AppHandler {
  const generationProvider = dependencies.generationProvider;
  const generateOutput = dependencies.generateOutput ??
    (generationProvider
      ? async (request: GenerationRequest) =>
          await generateWithProvider(generationProvider, request)
      : generateMockOutput);
  const resolvedDependencies: ResolvedAppDependencies = {
    transcribeAudio: dependencies.transcribeAudio ?? transcribeMockAudio,
    transcriptionProvider: dependencies.transcriptionProvider ?? new MockTranscriptionProvider(),
    maxAudioUploadBytes: dependencies.maxAudioUploadBytes ?? 24 * 1024 * 1024,
    generateOutput,
  };

  return async (request, response) => {
    const requestId = resolveRequestId(request.headers["x-request-id"]);
    response.setHeader("x-request-id", requestId);

    try {
      const url = new URL(request.url ?? "/", "http://localhost");

      if (request.method === "OPTIONS") {
        setBaseHeaders(response);
        response.statusCode = 204;
        response.end();
        return;
      }

      if (url.pathname === "/api/health") {
        if (request.method !== "GET") {
          methodNotAllowed(response);
          return;
        }

        await handleHealth(response, resolvedDependencies);
        return;
      }

      if (url.pathname === "/api/transcriptions") {
        if (request.method !== "POST") {
          methodNotAllowed(response);
          return;
        }

        await handleTranscriptions(request, response, resolvedDependencies);
        return;
      }

      if (url.pathname === "/api/generations") {
        if (request.method !== "POST") {
          methodNotAllowed(response);
          return;
        }

        await handleGenerations(request, response, resolvedDependencies);
        return;
      }

      notFound(response);
    } catch (error) {
      handleError(error, response, requestId);
    }
  };
}

function resolveRequestId(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && /^[a-zA-Z0-9_-]{8,80}$/.test(candidate)) {
    return candidate;
  }
  return `req-${randomUUID()}`;
}
