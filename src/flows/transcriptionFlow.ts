import type {
  RecordingActionResult,
  RecordingAsset,
} from "../audio/recordingSession.ts";
import type { TranscriptionResponse } from "../api/transcriptionClient.ts";

type TranscriptionFlowDependencies = {
  transcribe(asset: RecordingAsset): Promise<TranscriptionResponse>;
  discard(): Promise<RecordingActionResult>;
};

export async function processRetainedRecording(
  asset: RecordingAsset,
  dependencies: TranscriptionFlowDependencies,
): Promise<{ response: TranscriptionResponse; cleanupFailed: boolean }> {
  const response = await dependencies.transcribe(asset);
  const discardResult = await dependencies.discard();

  return {
    response,
    cleanupFailed: !discardResult.ok,
  };
}
