import { MockBackendClientError } from "../api/backendError.ts";
import type { BackendFlowFailure } from "../types/index.ts";

export function mapBackendErrorToFlowFailure(
  error: unknown,
  stage: "transcription" | "generation",
  allowMockFallback: boolean,
): BackendFlowFailure {
  const state = stage === "generation" ? "generationFailed" : "transcriptionFailed";

  if (!(error instanceof MockBackendClientError)) {
    return {
      state,
      kind: "serverError",
      message: "Processing hit an unexpected error. Try again.",
      canUseMockFallback: allowMockFallback,
    };
  }

  switch (error.code) {
    case "recording_upload_failed":
    case "unsupported_audio_type":
    case "audio_too_large":
    case "invalid_request_body":
      return {
        state: "transcriptionFailed",
        kind: "recordingUploadFailed",
        message: "The recording could not be uploaded. Your audio is still available to retry.",
        canUseMockFallback: allowMockFallback,
      };
    case "transcription_unavailable":
      return {
        state: "transcriptionFailed",
        kind: "backendUnavailable",
        message: "Transcription is temporarily unavailable. Your audio is safe; start the local service and try again.",
        canUseMockFallback: allowMockFallback,
      };
    case "backend_unavailable":
      return {
        state,
        kind: "backendUnavailable",
        message: "The local backend is unavailable. Start it, then try again.",
        canUseMockFallback: allowMockFallback,
      };
    case "transcription_failed":
      return {
        state: "transcriptionFailed",
        kind: "transcriptionFailed",
        message: "Could not transcribe this recording. The audio is still available.",
        canUseMockFallback: allowMockFallback,
      };
    case "generation_failed":
    case "invalid_generated_output":
      return {
        state: "generationFailed",
        kind: "generationFailed",
        message: "Could not create the output from this transcript.",
        canUseMockFallback: allowMockFallback,
      };
    case "generation_unavailable":
      return {
        state: "generationFailed",
        kind: "backendUnavailable",
        message: "Generation is temporarily unavailable. Try again.",
        canUseMockFallback: false,
      };
    case "generation_configuration_error":
      return {
        state: "generationFailed",
        kind: "generationFailed",
        message: "Generation is not configured correctly. Check the backend settings.",
        canUseMockFallback: false,
      };
    default:
      return {
        state,
        kind: "serverError",
        message: "The local API returned an error. Try again.",
        canUseMockFallback: allowMockFallback,
      };
  }
}
