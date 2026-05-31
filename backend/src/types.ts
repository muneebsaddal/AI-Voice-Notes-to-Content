export const outputTypes = ["note", "todo", "email", "journal", "content"] as const;

export type OutputType = (typeof outputTypes)[number];

export type ApiMode = "mock";

export type HealthResponse = {
  ok: true;
  service: "voice-notes-api";
  mode: ApiMode;
};

export type TranscriptionRequest = {
  audioId: string;
  durationMs: number;
  simulate?: "recording_upload_failed" | "transcription_failed";
};

export type TranscriptionResponse = {
  transcript: string;
  language: "en";
  durationMs: number;
  suggestedOutputType: OutputType;
};

export type GenerationRequest = {
  transcript: string;
  outputType: OutputType;
  simulate?: "generation_failed";
};

export type GeneratedOutput = {
  id: string;
  outputType: OutputType;
  title: string;
  body: string;
  preview: string;
  createdAtLabel: string;
};

export type ApiErrorCode =
  | "recording_upload_failed"
  | "transcription_failed"
  | "generation_failed"
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
