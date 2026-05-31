import { ApiError } from "../errors";
import { mockTranscript, mockTranscriptsByAudioId } from "../mockData";
import type { TranscriptionRequest, TranscriptionResponse } from "../types";

export async function transcribeMockAudio(
  request: TranscriptionRequest,
): Promise<TranscriptionResponse> {
  if (request.simulate === "recording_upload_failed") {
    throw new ApiError("recording_upload_failed", "Recording upload failed.", 502);
  }

  if (request.simulate === "transcription_failed") {
    throw new ApiError("transcription_failed", "Transcription failed.", 502);
  }

  const fixture = mockTranscriptsByAudioId[request.audioId] ?? {
    transcript: mockTranscript,
    suggestedOutputType: "note" as const,
  };

  return {
    transcript: fixture.transcript,
    language: "en",
    durationMs: request.durationMs,
    suggestedOutputType: fixture.suggestedOutputType,
  };
}
