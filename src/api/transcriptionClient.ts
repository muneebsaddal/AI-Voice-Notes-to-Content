import type { RecordingAsset } from "../audio/recordingSession.ts";
import {
  resolveRecordingUploadFormat,
  type RecordingUploadPlatform,
} from "../audio/recordingFormat.ts";
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
  resolveRecordingUploadFormat,
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
  platform: RecordingUploadPlatform;
  language?: string;
  fetchImplementation?: typeof fetch;
  formDataFactory?: () => FormDataLike;
  requestId?: string;
  diagnosticLogger?: UploadDiagnosticLogger;
};

type TranscriptionClientOptions = BuildFormDataOptions & {
  apiBaseUrl?: string;
  timeoutMs?: number;
  requestIdFactory?: () => string;
};

const defaultTimeoutMs = 120_000;
const outputTypes = new Set<OutputType>(["note", "todo", "email", "journal", "content"]);

type UploadDiagnosticMetadata = {
  requestId?: string;
  platform: RecordingUploadPlatform;
  durationMs: number;
  extension: string;
  mimeType: string;
  byteSize?: number;
  status?: number;
  errorCode?: string;
};

type UploadDiagnosticLogger = (
  event: "transcription_upload_prepared" | "transcription_upload_completed" | "transcription_upload_failed",
  metadata: UploadDiagnosticMetadata,
) => void;

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
  let format = resolveRecordingUploadFormat({
    platform: options.platform,
    uri: asset.uri,
    mimeType: asset.mimeType,
  });
  let byteSize: number | undefined;

  if (options.platform === "web") {
    const fetchImplementation = options.fetchImplementation ?? fetch;
    let audioResponse: Response;
    try {
      audioResponse = await fetchImplementation(asset.uri);
    } catch {
      options.diagnosticLogger?.("transcription_upload_failed", {
        requestId: options.requestId,
        platform: options.platform,
        durationMs: asset.durationMs,
        extension: format.extension,
        mimeType: format.mimeType,
        errorCode: "recording_preparation_failed",
      });
      throw new MockBackendClientError(
        "recording_upload_failed",
        "The recorded audio could not be prepared for upload.",
        0,
        {
          boundary: "preparation",
          requestId: options.requestId,
        },
      );
    }

    if (!audioResponse.ok) {
      options.diagnosticLogger?.("transcription_upload_failed", {
        requestId: options.requestId,
        platform: options.platform,
        durationMs: asset.durationMs,
        extension: format.extension,
        mimeType: format.mimeType,
        status: audioResponse.status,
        errorCode: "recording_preparation_failed",
      });
      throw new MockBackendClientError(
        "recording_upload_failed",
        "The recorded audio could not be prepared for upload.",
        audioResponse.status,
        {
          boundary: "preparation",
          requestId: options.requestId,
        },
      );
    }

    const sourceBlob = await audioResponse.blob();
    format = resolveRecordingUploadFormat({
      platform: "web",
      uri: asset.uri,
      mimeType: sourceBlob.type || asset.mimeType,
    });
    const audioBlob = sourceBlob.type.toLowerCase() === format.mimeType
      ? sourceBlob
      : sourceBlob.slice(0, sourceBlob.size, format.mimeType);
    byteSize = audioBlob.size;
    form.append("file", audioBlob, format.filename);
  } else {
    form.append("file", {
      uri: asset.uri,
      name: format.filename,
      type: format.mimeType,
    });
  }

  form.append("durationMs", String(asset.durationMs));
  if (asset.id.trim()) {
    form.append("audioId", asset.id);
  }
  if (options.language?.trim()) {
    form.append("language", options.language.trim());
  }

  options.diagnosticLogger?.("transcription_upload_prepared", {
    requestId: options.requestId,
    platform: options.platform,
    durationMs: asset.durationMs,
    extension: format.extension,
    mimeType: format.mimeType,
    ...(byteSize === undefined ? {} : { byteSize }),
  });

  return form as FormData;
}

export async function transcribeRecordingAsset(
  asset: RecordingAsset,
  options: TranscriptionClientOptions,
): Promise<TranscriptionResponse> {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const requestId = options.requestId ?? options.requestIdFactory?.() ?? createRequestId();
  const diagnosticLogger = options.diagnosticLogger ?? developmentDiagnosticLogger;
  const form = await buildTranscriptionFormData(asset, {
    ...options,
    requestId,
    diagnosticLogger,
  });
  const format = resolveRecordingUploadFormat({
    platform: options.platform,
    uri: asset.uri,
    mimeType: asset.mimeType,
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? defaultTimeoutMs);
  let response: Response;

  try {
    response = await fetchImplementation(
      `${(options.apiBaseUrl ?? getApiBaseUrl()).replace(/\/+$/, "")}/api/transcriptions`,
      {
        method: "POST",
        headers: {
          "x-request-id": requestId,
        },
        body: form,
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (controller.signal.aborted || isAbortError(error)) {
      diagnosticLogger?.("transcription_upload_failed", {
        requestId,
        platform: options.platform,
        durationMs: asset.durationMs,
        extension: format.extension,
        mimeType: format.mimeType,
        errorCode: "transcription_timeout",
      });
      throw new MockBackendClientError(
        "transcription_unavailable",
        "Transcription timed out.",
        0,
        {
          boundary: "timeout",
          requestId,
        },
      );
    }

    diagnosticLogger?.("transcription_upload_failed", {
      requestId,
      platform: options.platform,
      durationMs: asset.durationMs,
      extension: format.extension,
      mimeType: format.mimeType,
      errorCode: "backend_unavailable",
    });
    throw new MockBackendClientError(
      "backend_unavailable",
      "The backend is unavailable.",
      0,
      {
        boundary: "network",
        requestId,
      },
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
    diagnosticLogger?.("transcription_upload_failed", {
      requestId: response.headers.get("x-request-id") ?? requestId,
      platform: options.platform,
      durationMs: asset.durationMs,
      extension: format.extension,
      mimeType: format.mimeType,
      status: response.status,
      errorCode: structuredError?.code ?? "unstructured_backend_error",
    });
    throw new MockBackendClientError(
      toApiErrorCode(structuredError?.code),
      structuredError?.message ?? "Transcription could not be completed.",
      response.status,
      {
        boundary: boundaryForBackendError(structuredError?.code),
        requestId: response.headers.get("x-request-id") ?? requestId,
      },
    );
  }

  if (!isTranscriptionResponse(payload)) {
    throw new MockBackendClientError(
      "transcription_failed",
      "The transcription response was invalid.",
      response.status,
      {
        boundary: "inference",
        requestId: response.headers.get("x-request-id") ?? requestId,
      },
    );
  }

  diagnosticLogger?.("transcription_upload_completed", {
    requestId: response.headers.get("x-request-id") ?? requestId,
    platform: options.platform,
    durationMs: asset.durationMs,
    extension: format.extension,
    mimeType: format.mimeType,
    status: response.status,
  });

  return payload;
}

function createRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function developmentDiagnosticLogger(
  event: Parameters<UploadDiagnosticLogger>[0],
  metadata: UploadDiagnosticMetadata,
): void {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.info(`[voice-notes] ${event}`, metadata);
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function boundaryForBackendError(
  code: string | undefined,
): "backend_validation" | "sidecar" | "inference" {
  switch (code) {
    case "invalid_request_body":
    case "unsupported_audio_type":
    case "audio_too_large":
    case "recording_upload_failed":
      return "backend_validation";
    case "transcription_unavailable":
      return "sidecar";
    default:
      return "inference";
  }
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
