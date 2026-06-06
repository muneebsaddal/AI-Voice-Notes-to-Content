export const outputTypes = ["note", "todo", "email", "journal", "content"] as const;

export type OutputType = (typeof outputTypes)[number];
export type OutputSchemaVersion = "1.0";

export type NotePayload = {
  type: "note";
  summary: string;
  mainPoints: string[];
  nextSteps?: string[];
};

export type TodoDueDate = {
  text: string;
  sourceText: string;
};

export type TodoTask = {
  text: string;
  dueDate?: TodoDueDate;
  prioritySuggestion?: "low" | "medium" | "high";
  ambiguous?: boolean;
};

export type TodoPayload = {
  type: "todo";
  tasks: TodoTask[];
};

export type EmailPayload = {
  type: "email";
  subject: string;
  greeting: string;
  body: string;
  closing: string;
};

export type JournalPayload = {
  type: "journal";
  entryBody: string;
  mood?: string;
  theme?: string;
  tomorrowFocus?: string;
};

export type ContentPayload = {
  type: "content";
  hook: string;
  draft: string;
  caption?: string;
  cta?: string;
};

export type GeneratedPayload =
  | NotePayload
  | TodoPayload
  | EmailPayload
  | JournalPayload
  | ContentPayload;

type GeneratedOutputBase = {
  id: string;
  title: string;
  body: string;
  preview: string;
  createdAt: string;
  createdAtLabel: string;
  schemaVersion: OutputSchemaVersion;
  warnings: string[];
};

export type GeneratedOutput = {
  [Type in OutputType]: GeneratedOutputBase & {
    outputType: Type;
    payload: Extract<GeneratedPayload, { type: Type }>;
  };
}[OutputType];

export type IntentRoutingSource = "user_selection" | "explicit" | "inference" | "default";
export type IntentConfidence = "high" | "medium" | "low";

export type IntentRoutingResult = {
  suggestedOutputType: OutputType;
  source: IntentRoutingSource;
  confidence: IntentConfidence;
  uncertain: boolean;
  matchedSignals: OutputType[];
  warnings: string[];
};

export type ApiMode = "mock" | "local";

export type HealthResponse = {
  ok: true;
  service: "voice-notes-api";
  mode: ApiMode;
  transcription?: {
    provider: "local-faster-whisper";
    ready: boolean;
  };
};

export type TranscriptionRequest = {
  audioId: string;
  durationMs: number;
  simulate?: "recording_upload_failed" | "transcription_failed";
};

export type TranscriptionResponse = {
  transcript: string;
  language: string;
  durationMs: number;
  suggestedOutputType: OutputType;
  routing: IntentRoutingResult;
};

export type GenerationRequest = {
  transcript: string;
  outputType: OutputType;
  simulate?: "generation_failed" | "invalid_generated_output";
};

export type ApiErrorCode =
  | "recording_upload_failed"
  | "unsupported_audio_type"
  | "audio_too_large"
  | "transcription_unavailable"
  | "transcription_failed"
  | "generation_failed"
  | "generation_unavailable"
  | "generation_configuration_error"
  | "invalid_generated_output"
  | "internal_error"
  | "unsupported_output_type"
  | "invalid_request_body"
  | "not_found"
  | "method_not_allowed";

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
