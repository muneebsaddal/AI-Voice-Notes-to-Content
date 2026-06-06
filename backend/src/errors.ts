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
