import type { AudioLifecycleState } from "../types/index.ts";

export function nextStateAfterSuccessfulTranscription(): AudioLifecycleState {
  return "suggested";
}
