export type OutputType = "note" | "todo" | "email" | "journal" | "content";

export type PermissionStatus = "prompt" | "granted" | "denied";

export type AudioLifecycleState =
  | "idle"
  | "recording"
  | "recordingFailed"
  | "playbackAvailable"
  | "transcribing"
  | "transcriptionFailed"
  | "suggested"
  | "generating"
  | "generationFailed";

export type LifecyclePreviewState =
  | "recordingFailed"
  | "playbackAvailable"
  | "transcriptionFailed"
  | "generationFailed";

export type BackendFlowFailureKind =
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

export type GeneratedOutput = {
  id: string;
  outputType: OutputType;
  title: string;
  body: string;
  preview: string;
  createdAtLabel: string;
};

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
