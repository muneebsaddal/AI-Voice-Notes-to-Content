import type {
  GeneratedOutput as VoiceGeneratedOutput,
  IntentRoutingResult as VoiceIntentRoutingResult,
  OutputType as VoiceOutputType,
} from "../../backend/src/types";
import type {
  RecordingActionResult,
  RecordingAsset,
} from "../audio/recordingSession.ts";

export type OutputType = VoiceOutputType;
export type GeneratedOutput = VoiceGeneratedOutput;
export type IntentRoutingResult = VoiceIntentRoutingResult;

export type OutputDocument = Pick<
  GeneratedOutput,
  "id" | "outputType" | "title" | "body" | "preview"
>;

export type SavedHistoryItem = OutputDocument & {
  sourceOutputId: string;
  createdAt: string;
  updatedAt: string;
};

export type PermissionStatus = "prompt" | "granted" | "denied";

export type AudioLifecycleState =
  | "idle"
  | "starting"
  | "recording"
  | "stopping"
  | "recordingFailed"
  | "transcribing"
  | "transcriptionFailed"
  | "suggested"
  | "generating"
  | "generationFailed";

export type LifecyclePreviewState =
  | "recordingFailed"
  | "transcriptionFailed"
  | "generationFailed";

export type BackendFlowFailureKind =
  | "recordingCaptureFailed"
  | "recordingUploadFailed"
  | "transcriptionFailed"
  | "generationFailed"
  | "serverError"
  | "backendUnavailable";

export type BackendFlowFailure = {
  state: "recordingFailed" | "transcriptionFailed" | "generationFailed";
  kind: BackendFlowFailureKind;
  message: string;
  canUseMockFallback: boolean;
};

export type BackendFlowResult = { ok: true } | { ok: false; failure: BackendFlowFailure };

export type RecordingStartFlowResult =
  | { ok: true }
  | { ok: false; failure: BackendFlowFailure };

export type RecordingStopFlowResult =
  | { ok: true; asset: RecordingAsset }
  | { ok: false; failure: BackendFlowFailure };

export type RecordingCancelFlowResult = RecordingActionResult;

export type Theme = {
  name: "dark" | "light";
  colors: {
    background: string;
    foreground: string;
    mutedForeground: string;
    surface: string;
    surfaceElevated: string;
    popover: string;
    secondary: string;
    secondaryForeground: string;
    border: string;
    listen: string;
    listenSoft: string;
    destructive: string;
    success: string;
    backdrop: string;
    shadow: string;
    white: string;
  };
};
