export type TranscriptionProviderInput = {
  filePath: string;
  filename: string;
  mimeType: string;
  language?: string;
};

export type TranscriptionProviderResult = {
  text: string;
  language?: string;
  durationSeconds?: number;
};

export type TranscriptionProvider = {
  readonly name: "mock" | "local-faster-whisper";
  transcribe(input: TranscriptionProviderInput): Promise<TranscriptionProviderResult>;
  isReady?(): Promise<boolean>;
};
