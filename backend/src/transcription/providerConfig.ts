import { LocalFasterWhisperProvider } from "./localFasterWhisperProvider";
import { MockTranscriptionProvider } from "./mockTranscriptionProvider";
import type { TranscriptionProvider } from "./types";

type Environment = Record<string, string | undefined>;

const defaultLocalWhisperUrl = "http://127.0.0.1:8001";
const defaultTimeoutMs = 120_000;

function positiveInteger(value: string | undefined, fallback: number, label: string): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label} configuration.`);
  }
  return parsed;
}

export function createTranscriptionProvider(
  environment: Environment = process.env,
  fetchImplementation?: typeof fetch,
): TranscriptionProvider {
  const provider = environment.TRANSCRIPTION_PROVIDER ?? "mock";

  if (provider === "mock") {
    return new MockTranscriptionProvider();
  }
  if (provider === "local-faster-whisper") {
    return new LocalFasterWhisperProvider({
      baseUrl: environment.LOCAL_WHISPER_URL ?? defaultLocalWhisperUrl,
      timeoutMs: positiveInteger(
        environment.TRANSCRIPTION_TIMEOUT_MS,
        defaultTimeoutMs,
        "transcription timeout",
      ),
      fetchImplementation,
    });
  }

  throw new Error("Unsupported transcription provider configuration.");
}

export function getMaxAudioUploadBytes(environment: Environment = process.env): number {
  return positiveInteger(
    environment.MAX_AUDIO_UPLOAD_BYTES,
    24 * 1024 * 1024,
    "maximum audio upload size",
  );
}
