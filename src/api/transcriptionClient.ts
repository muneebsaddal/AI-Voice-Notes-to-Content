import type { RecordingAsset } from "../audio/recordingSession.ts";
import type { IntentRoutingResult, OutputType } from "../types/index.ts";
import {
  MockBackendClientError,
  toApiErrorCode,
  type ApiErrorResponse,
} from "./backendError.ts";
import {
  getApiBaseUrl,
  isMockFallbackEnabled,
} from "./backendConfig.ts";

export {
  getApiBaseUrl,
  isMockFallbackEnabled,
  MockBackendClientError,
};

export type TranscriptionResponse = {
  transcript: string;
  language: string;
  durationMs: number;
  suggestedOutputType: OutputType;
  routing: IntentRoutingResult;
};

type NativeUploadFile = {
  uri: string;
  name: string;
  type: string;
};

type FormDataLike = {
  append(name: string, value: string | Blob | NativeUploadFile, filename?: string): void;
};

type BuildFormDataOptions = {
  platform: "web" | "native";
  language?: string;
  fetchImplementation?: typeof fetch;
  formDataFactory?: () => FormDataLike;
};

type TranscriptionClientOptions = BuildFormDataOptions & {
  apiBaseUrl?: string;
  timeoutMs?: number;
};

const defaultTimeoutMs = 120_000;
const outputTypes = new Set<OutputType>(["note", "todo", "email", "journal", "content"]);
const supportedExtensions = new Set(["m4a", "mp4", "wav", "webm", "mp3", "mpeg", "mpga"]);

export async function buildTranscriptionFormData(
  asset: RecordingAsset,
  options: BuildFormDataOptions,
): Promise<FormData> {
  if (!Number.isSafeInteger(asset.durationMs) || asset.durationMs <= 0) {
    throw new MockBackendClientError(
      "invalid_request_body",
      "The recording duration is invalid.",
      0,
    );
  }

  const form = options.formDataFactory?.() ?? new FormData();
  const filename = filenameForAsset(asset);
  const mimeType = asset.mimeType || mimeTypeForFilename(filename);

  if (options.platform === "web") {
    const fetchImplementation = options.fetchImplementation ?? fetch;
    let audioResponse: Response;
    try {
      audioResponse = await fetchImplementation(asset.uri);
    } catch {
      throw new MockBackendClientError(
        "recording_upload_failed",
        "The recorded audio could not be prepared for upload.",
        0,
      );
    }

    if (!audioResponse.ok) {
      throw new MockBackendClientError(
        "recording_upload_failed",
        "The recorded audio could not be prepared for upload.",
        audioResponse.status,
      );
    }

    const sourceBlob = await audioResponse.blob();
    const audioBlob = sourceBlob.type || !mimeType
      ? sourceBlob
      : sourceBlob.slice(0, sourceBlob.size, mimeType);
    form.append("file", audioBlob, filename);
  } else {
    form.append("file", {
      uri: asset.uri,
      name: filename,
      type: mimeType || "application/octet-stream",
    });
  }

  form.append("durationMs", String(asset.durationMs));
  if (asset.id.trim()) {
    form.append("audioId", asset.id);
  }
  if (options.language?.trim()) {
    form.append("language", options.language.trim());
  }

  return form as FormData;
}

export async function transcribeRecordingAsset(
  asset: RecordingAsset,
  options: TranscriptionClientOptions,
): Promise<TranscriptionResponse> {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const form = await buildTranscriptionFormData(asset, options);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? defaultTimeoutMs);
  let response: Response;

  try {
    response = await fetchImplementation(
      `${(options.apiBaseUrl ?? getApiBaseUrl()).replace(/\/+$/, "")}/api/transcriptions`,
      {
        method: "POST",
        body: form,
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (controller.signal.aborted || isAbortError(error)) {
      throw new MockBackendClientError(
        "transcription_unavailable",
        "Transcription timed out.",
        0,
      );
    }

    throw new MockBackendClientError(
      "backend_unavailable",
      "The backend is unavailable.",
      0,
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | TranscriptionResponse
    | null;

  if (!response.ok) {
    const structuredError =
      payload && typeof payload === "object" && "error" in payload
        ? payload.error
        : undefined;
    throw new MockBackendClientError(
      toApiErrorCode(structuredError?.code),
      structuredError?.message ?? "Transcription could not be completed.",
      response.status,
    );
  }

  if (!isTranscriptionResponse(payload)) {
    throw new MockBackendClientError(
      "transcription_failed",
      "The transcription response was invalid.",
      response.status,
    );
  }

  return payload;
}

function filenameForAsset(asset: RecordingAsset): string {
  const path = asset.uri.split(/[?#]/, 1)[0];
  const rawName = path.slice(path.lastIndexOf("/") + 1);
  const extension = rawName.includes(".") ? rawName.split(".").pop()?.toLowerCase() : undefined;

  if (rawName && extension && supportedExtensions.has(extension)) {
    return rawName;
  }

  return `recording.${extensionForMimeType(asset.mimeType)}`;
}

function extensionForMimeType(mimeType: string | undefined): string {
  switch (mimeType?.toLowerCase()) {
    case "audio/mp4":
    case "audio/m4a":
    case "audio/x-m4a":
      return "m4a";
    case "audio/wav":
    case "audio/x-wav":
      return "wav";
    case "audio/mpeg":
    case "audio/mp3":
      return "mp3";
    default:
      return "webm";
  }
}

function mimeTypeForFilename(filename: string): string | undefined {
  const extension = filename.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "wav":
      return "audio/wav";
    case "webm":
      return "audio/webm";
    case "mp3":
    case "mpeg":
    case "mpga":
      return "audio/mpeg";
    default:
      return undefined;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function isTranscriptionResponse(value: unknown): value is TranscriptionResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TranscriptionResponse>;
  return (
    typeof candidate.transcript === "string" &&
    candidate.transcript.trim().length > 0 &&
    typeof candidate.language === "string" &&
    candidate.language.trim().length > 0 &&
    Number.isSafeInteger(candidate.durationMs) &&
    (candidate.durationMs ?? 0) > 0 &&
    outputTypes.has(candidate.suggestedOutputType as OutputType) &&
    isIntentRoutingResult(candidate.routing)
  );
}

function isIntentRoutingResult(value: unknown): value is IntentRoutingResult {
  if (!value || typeof value !== "object") {
    return false;
  }
  const routing = value as Partial<IntentRoutingResult>;
  return (
    outputTypes.has(routing.suggestedOutputType as OutputType) &&
    ["user_selection", "explicit", "inference", "default"].includes(routing.source ?? "") &&
    ["high", "medium", "low"].includes(routing.confidence ?? "") &&
    typeof routing.uncertain === "boolean" &&
    Array.isArray(routing.matchedSignals) &&
    routing.matchedSignals.every((signal) => outputTypes.has(signal)) &&
    Array.isArray(routing.warnings) &&
    routing.warnings.every((warning) => typeof warning === "string")
  );
}
