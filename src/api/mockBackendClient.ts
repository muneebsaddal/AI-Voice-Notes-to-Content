import type { GeneratedOutput, IntentRoutingResult, OutputType } from "../types";
import {
  MockBackendClientError,
  toApiErrorCode,
  type ApiErrorResponse,
} from "./backendError";
import { getApiBaseUrl } from "./backendConfig";

export { MockBackendClientError };

export type TranscriptionRequest = {
  audioId: string;
  durationMs: number;
  simulate?: "recording_upload_failed" | "transcription_failed";
};

export type TranscriptionResponse = {
  transcript: string;
  language: "en";
  durationMs: number;
  suggestedOutputType: OutputType;
  routing: IntentRoutingResult;
};

export type GenerationRequest = {
  transcript: string;
  outputType: OutputType;
  simulate?: "generation_failed" | "invalid_generated_output";
};

export async function transcribeMockAudio(
  request: TranscriptionRequest,
): Promise<TranscriptionResponse> {
  return await postJson<TranscriptionResponse>("/api/transcriptions", request);
}

export async function generateMockOutput(
  request: GenerationRequest,
): Promise<GeneratedOutput> {
  return await postJson<GeneratedOutput>("/api/generations", request);
}

async function postJson<ResponseBody>(path: string, body: unknown): Promise<ResponseBody> {
  let response: Response;
  const requestId = createRequestId();

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new MockBackendClientError(
      "backend_unavailable",
      "The local mock backend is unavailable.",
      0,
      {
        boundary: "network",
        requestId,
      },
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiErrorResponse | ResponseBody | null;

  if (!response.ok) {
    const structuredError = payload && typeof payload === "object" && "error" in payload
      ? payload.error
      : undefined;

    throw new MockBackendClientError(
      toApiErrorCode(structuredError?.code),
      structuredError?.message ?? "The mock API could not complete the request.",
      response.status,
      {
        boundary: path === "/api/generations" ? "generation" : undefined,
        requestId: response.headers.get("x-request-id") ?? requestId,
      },
    );
  }

  if (!payload) {
    throw new MockBackendClientError(
      "internal_error",
      "The mock API returned an empty response.",
      response.status,
      {
        boundary: path === "/api/generations" ? "generation" : undefined,
        requestId: response.headers.get("x-request-id") ?? requestId,
      },
    );
  }

  return payload as ResponseBody;
}

function createRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
