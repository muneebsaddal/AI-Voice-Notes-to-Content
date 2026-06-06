import { readFile } from "node:fs/promises";

import {
  transcriptionFailedError,
  transcriptionUnavailableError,
} from "../errors";
import type {
  TranscriptionProvider,
  TranscriptionProviderInput,
  TranscriptionProviderResult,
} from "./types";

type Fetch = typeof fetch;

type LocalProviderOptions = {
  baseUrl: string;
  timeoutMs: number;
  fetchImplementation?: Fetch;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateLocalUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid local transcription service configuration.");
  }

  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
  ) {
    throw new Error("Invalid local transcription service configuration.");
  }

  return url.toString().replace(/\/$/, "");
}

function parseResult(value: unknown): TranscriptionProviderResult {
  if (!isRecord(value) || typeof value.text !== "string" || value.text.trim().length === 0) {
    throw transcriptionFailedError;
  }

  if (value.language !== undefined && typeof value.language !== "string") {
    throw transcriptionFailedError;
  }
  if (
    value.durationSeconds !== undefined &&
    (typeof value.durationSeconds !== "number" || !Number.isFinite(value.durationSeconds))
  ) {
    throw transcriptionFailedError;
  }

  return {
    text: value.text.trim(),
    language: value.language,
    durationSeconds: value.durationSeconds,
  };
}

export class LocalFasterWhisperProvider implements TranscriptionProvider {
  readonly name = "local-faster-whisper";
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImplementation: Fetch;

  constructor(options: LocalProviderOptions) {
    this.baseUrl = validateLocalUrl(options.baseUrl);
    this.timeoutMs = options.timeoutMs;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
  }

  async transcribe(input: TranscriptionProviderInput): Promise<TranscriptionProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const bytes = await readFile(input.filePath);
      controller.signal.throwIfAborted();
      const form = new FormData();
      form.append("file", new Blob([bytes], { type: input.mimeType }), input.filename);
      if (input.language) {
        form.append("language", input.language);
      }

      const response = await this.fetchImplementation(`${this.baseUrl}/transcribe`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw transcriptionUnavailableError;
        }
        throw transcriptionFailedError;
      }

      return parseResult(await response.json());
    } catch (error) {
      if (error === transcriptionFailedError || error === transcriptionUnavailableError) {
        throw error;
      }
      if (
        error instanceof TypeError ||
        (error instanceof Error && error.name === "AbortError")
      ) {
        throw transcriptionUnavailableError;
      }
      throw transcriptionFailedError;
    } finally {
      clearTimeout(timeout);
    }
  }

  async isReady(): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(this.timeoutMs, 2_000));
    try {
      const response = await this.fetchImplementation(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        return false;
      }
      const body: unknown = await response.json();
      return isRecord(body) && body.ready === true;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }
}
