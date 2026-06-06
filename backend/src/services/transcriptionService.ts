import { ApiError, transcriptionFailedError } from "../errors";
import { mockTranscript, mockTranscriptsByAudioId } from "../mockData";
import { routeOutputIntent } from "../intentRouter";
import type { TranscriptionRequest, TranscriptionResponse } from "../types";
import type {
  TranscriptionProvider,
  TranscriptionProviderInput,
} from "../transcription/types";

export async function transcribeMockAudio(
  request: TranscriptionRequest,
): Promise<TranscriptionResponse> {
  if (request.simulate === "recording_upload_failed") {
    throw new ApiError("recording_upload_failed", "Recording upload failed.", 502);
  }

  if (request.simulate === "transcription_failed") {
    throw new ApiError("transcription_failed", "Transcription failed.", 502);
  }

  const transcript = mockTranscriptsByAudioId[request.audioId] ?? mockTranscript;
  const routing = routeOutputIntent({ transcript });

  return {
    transcript,
    language: "en",
    durationMs: request.durationMs,
    suggestedOutputType: routing.suggestedOutputType,
    routing,
  };
}

export async function transcribeWithProvider(
  provider: TranscriptionProvider,
  input: TranscriptionProviderInput,
  durationMs: number,
): Promise<TranscriptionResponse> {
  const result = await provider.transcribe(input);
  const transcript = result.text.trim();
  if (transcript.length === 0) {
    throw transcriptionFailedError;
  }
  const routing = routeOutputIntent({ transcript });

  return {
    transcript,
    language: result.language?.trim() || "en",
    durationMs,
    suggestedOutputType: routing.suggestedOutputType,
    routing,
  };
}
