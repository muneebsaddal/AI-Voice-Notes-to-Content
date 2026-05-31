import { invalidRequestBodyError, unsupportedOutputTypeError } from "./errors";
import { outputTypes, type GenerationRequest, type TranscriptionRequest } from "./types";

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: typeof invalidRequestBodyError | typeof unsupportedOutputTypeError };

const maxMockDurationMs = 10 * 60 * 1000;
const maxTranscriptLength = 20_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOutputType(value: unknown): value is GenerationRequest["outputType"] {
  return typeof value === "string" && outputTypes.includes(value as GenerationRequest["outputType"]);
}

export function validateTranscriptionRequest(input: unknown): ValidationResult<TranscriptionRequest> {
  if (!isRecord(input)) {
    return { ok: false, error: invalidRequestBodyError };
  }

  const { audioId, durationMs, simulate } = input;

  if (
    typeof audioId !== "string" ||
    audioId.trim().length === 0 ||
    audioId.length > 120 ||
    typeof durationMs !== "number" ||
    !Number.isInteger(durationMs) ||
    durationMs <= 0 ||
    durationMs > maxMockDurationMs
  ) {
    return { ok: false, error: invalidRequestBodyError };
  }

  if (
    simulate !== undefined &&
    simulate !== "recording_upload_failed" &&
    simulate !== "transcription_failed"
  ) {
    return { ok: false, error: invalidRequestBodyError };
  }

  return {
    ok: true,
    value: {
      audioId: audioId.trim(),
      durationMs,
      simulate,
    },
  };
}

export function validateGenerationRequest(input: unknown): ValidationResult<GenerationRequest> {
  if (!isRecord(input)) {
    return { ok: false, error: invalidRequestBodyError };
  }

  const { transcript, outputType, simulate } = input;

  if (typeof outputType === "string" && !isOutputType(outputType)) {
    return { ok: false, error: unsupportedOutputTypeError };
  }

  if (
    typeof transcript !== "string" ||
    transcript.trim().length === 0 ||
    transcript.length > maxTranscriptLength ||
    !isOutputType(outputType)
  ) {
    return { ok: false, error: invalidRequestBodyError };
  }

  if (simulate !== undefined && simulate !== "generation_failed") {
    return { ok: false, error: invalidRequestBodyError };
  }

  return {
    ok: true,
    value: {
      transcript: transcript.trim(),
      outputType,
      simulate,
    },
  };
}
