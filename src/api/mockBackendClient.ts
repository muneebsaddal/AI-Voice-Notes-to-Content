import type { GeneratedOutput, OutputType } from "../types";

export const MOCK_BACKEND_BASE_URL = "http://127.0.0.1:3333";

export type ApiErrorCode =
  | "recording_upload_failed"
  | "transcription_failed"
  | "generation_failed"
  | "internal_error"
  | "unsupported_output_type"
  | "invalid_request_body"
  | "not_found"
  | "method_not_allowed"
  | "backend_unavailable";

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
};

export type GenerationRequest = {
  transcript: string;
  outputType: OutputType;
  simulate?: "generation_failed";
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class MockBackendClientError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.name = "MockBackendClientError";
    this.code = code;
    this.status = status;
  }
}

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

  try {
    response = await fetch(`${MOCK_BACKEND_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new MockBackendClientError(
      "backend_unavailable",
      "The local mock backend is unavailable.",
      0,
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
    );
  }

  if (!payload) {
    throw new MockBackendClientError(
      "internal_error",
      "The mock API returned an empty response.",
      response.status,
    );
  }

  return payload as ResponseBody;
}

function toApiErrorCode(code: string | undefined): ApiErrorCode {
  switch (code) {
    case "recording_upload_failed":
    case "transcription_failed":
    case "generation_failed":
    case "internal_error":
    case "unsupported_output_type":
    case "invalid_request_body":
    case "not_found":
    case "method_not_allowed":
      return code;
    default:
      return "internal_error";
  }
}
