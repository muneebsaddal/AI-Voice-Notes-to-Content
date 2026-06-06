import type { IncomingMessage, ServerResponse } from "node:http";

import { validateGenerationRequest, validateTranscriptionRequest } from "./contracts";
import {
  ApiError,
  invalidGeneratedOutputError,
  invalidRequestBodyError,
  toErrorResponse,
} from "./errors";
import { validateGeneratedOutput } from "./outputContracts";
import { generateMockOutput } from "./services/generationService";
import { transcribeMockAudio } from "./services/transcriptionService";
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
  generateOutput?: (request: GenerationRequest) => Promise<unknown>;
};

function setBaseHeaders(response: ServerResponse): void {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
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

async function handleHealth(response: ServerResponse): Promise<void> {
  const payload: HealthResponse = {
    ok: true,
    service: "voice-notes-api",
    mode: "mock",
  };

  sendJson(response, 200, payload);
}

async function handleTranscriptions(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: Required<AppDependencies>,
): Promise<void> {
  const body = await readJsonBody(request);
  const validation = validateTranscriptionRequest(body);

  if (!validation.ok) {
    sendJson(response, validation.error.status, toErrorResponse(validation.error));
    return;
  }

  const transcription = await dependencies.transcribeAudio(validation.value);
  sendJson(response, 200, transcription);
}

async function handleGenerations(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: Required<AppDependencies>,
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

function handleError(error: unknown, response: ServerResponse): void {
  if (error instanceof ApiError) {
    sendJson(response, error.status, toErrorResponse(error));
    return;
  }

  console.error("Unhandled API error", {
    message: error instanceof Error ? error.message : "Unknown error",
  });

  sendJson(response, 500, {
    error: {
      code: "internal_error",
      message: "The mock API could not complete the request.",
    },
  });
}

export function createApp(dependencies: AppDependencies = {}): AppHandler {
  const resolvedDependencies: Required<AppDependencies> = {
    transcribeAudio: dependencies.transcribeAudio ?? transcribeMockAudio,
    generateOutput: dependencies.generateOutput ?? generateMockOutput,
  };

  return async (request, response) => {
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

        await handleHealth(response);
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
      handleError(error, response);
    }
  };
}
