import type { ApiErrorCode, ApiErrorResponse } from "./types";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function toErrorResponse(error: ApiError): ApiErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
    },
  };
}

export const invalidRequestBodyError = new ApiError(
  "invalid_request_body",
  "Invalid request body.",
  400,
);

export const unsupportedOutputTypeError = new ApiError(
  "unsupported_output_type",
  "Unsupported output type.",
  400,
);

export const invalidGeneratedOutputError = new ApiError(
  "invalid_generated_output",
  "The generated output was invalid. Try again.",
  502,
);

export const generationUnavailableError = new ApiError(
  "generation_unavailable",
  "Generation is temporarily unavailable. Try again.",
  503,
);

export const generationConfigurationError = new ApiError(
  "generation_configuration_error",
  "Generation is not configured correctly.",
  503,
);

export const generationFailedError = new ApiError(
  "generation_failed",
  "Generation could not process this transcript.",
  422,
);

export const unsupportedAudioTypeError = new ApiError(
  "unsupported_audio_type",
  "Unsupported audio type.",
  415,
);

export const audioTooLargeError = new ApiError(
  "audio_too_large",
  "Audio upload is too large.",
  413,
);

export const transcriptionUnavailableError = new ApiError(
  "transcription_unavailable",
  "Transcription is temporarily unavailable. Try again.",
  503,
);

export const transcriptionFailedError = new ApiError(
  "transcription_failed",
  "Transcription failed.",
  502,
);
