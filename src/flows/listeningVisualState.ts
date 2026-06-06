import type { AudioLifecycleState } from "../types";
import type { ListeningOrbState } from "../components/ListeningOrb";

type ListeningVisualState = {
  orbState: ListeningOrbState;
  status: string | null;
  interactive: boolean;
};

export function getListeningVisualState(
  state: AudioLifecycleState,
): ListeningVisualState {
  switch (state) {
    case "idle":
      return { orbState: "idle", status: null, interactive: true };
    case "starting":
      return { orbState: "starting", status: null, interactive: false };
    case "recording":
      return { orbState: "recording", status: null, interactive: true };
    case "stopping":
      return {
        orbState: "processing",
        status: "Finishing your recording",
        interactive: false,
      };
    case "transcribing":
      return {
        orbState: "processing",
        status: "Transcribing your note",
        interactive: false,
      };
    case "generating":
      return {
        orbState: "processing",
        status: "Creating your output",
        interactive: false,
      };
    default:
      return { orbState: "idle", status: null, interactive: false };
  }
}

export function shouldAnimateListeningStage(
  previous: AudioLifecycleState,
  next: AudioLifecycleState,
): boolean {
  if (isStableListeningState(previous) && isStableListeningState(next)) {
    return false;
  }

  return previous !== next;
}

function isStableListeningState(state: AudioLifecycleState): boolean {
  return (
    state === "idle" ||
    state === "starting" ||
    state === "recording" ||
    state === "stopping" ||
    state === "transcribing" ||
    state === "generating"
  );
}
