export type ApiErrorCode =
  | "recording_upload_failed"
  | "unsupported_audio_type"
  | "audio_too_large"
  | "transcription_unavailable"
  | "transcription_failed"
  | "generation_failed"
  | "generation_unavailable"
  | "generation_configuration_error"
  | "invalid_generated_output"
  | "internal_error"
  | "unsupported_output_type"
  | "invalid_request_body"
  | "not_found"
  | "method_not_allowed"
  | "backend_unavailable";

export type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class MockBackendClientError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly boundary?: ProcessingBoundary;
  readonly requestId?: string;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number,
    details: {
      boundary?: ProcessingBoundary;
      requestId?: string;
    } = {},
  ) {
    super(message);
    this.name = "MockBackendClientError";
    this.code = code;
    this.status = status;
    this.boundary = details.boundary;
    this.requestId = details.requestId;
  }
}

export type ProcessingBoundary =
  | "preparation"
  | "network"
  | "backend_validation"
  | "sidecar"
  | "timeout"
  | "inference"
  | "generation";

export function toApiErrorCode(code: string | undefined): ApiErrorCode {
  switch (code) {
    case "recording_upload_failed":
    case "unsupported_audio_type":
    case "audio_too_large":
    case "transcription_unavailable":
    case "transcription_failed":
    case "generation_failed":
    case "generation_unavailable":
    case "generation_configuration_error":
    case "invalid_generated_output":
    case "internal_error":
    case "unsupported_output_type":
    case "invalid_request_body":
    case "not_found":
    case "method_not_allowed":
    case "backend_unavailable":
      return code;
    default:
      return "internal_error";
  }
}
