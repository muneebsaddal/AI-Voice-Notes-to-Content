export type RecordingPermission = "undetermined" | "granted" | "denied";

export type RecordingPhase =
  | "idle"
  | "starting"
  | "recording"
  | "stopping"
  | "recorded"
  | "failed";

export type RecordingAsset = {
  id: string;
  uri: string;
  durationMs: number;
  mimeType?: string;
  createdAt: string;
};

export type RecordingErrorCode =
  | "permission_denied"
  | "permission_failed"
  | "start_failed"
  | "stop_failed"
  | "cancel_failed"
  | "discard_failed"
  | "invalid_state";

export type RecordingError = {
  code: RecordingErrorCode;
  message: string;
};

export type RecordingSnapshot = {
  permission: RecordingPermission;
  phase: RecordingPhase;
  asset: RecordingAsset | null;
  error: RecordingError | null;
};

export type RecordingActionResult =
  | { ok: true }
  | { ok: false; error: RecordingError };

export type RecordingStopResult =
  | { ok: true; asset: RecordingAsset }
  | { ok: false; error: RecordingError };

export interface RecordingProvider {
  getPermissionStatus(): Promise<RecordingPermission>;
  requestPermission(): Promise<RecordingPermission>;
  start(): Promise<void>;
  stop(): Promise<RecordingAsset>;
  cancel(): Promise<void>;
  discard(asset: RecordingAsset): Promise<void>;
}

type RecordingListener = (snapshot: RecordingSnapshot) => void;

const initialSnapshot: RecordingSnapshot = {
  permission: "undetermined",
  phase: "idle",
  asset: null,
  error: null,
};

export class RecordingSession {
  private snapshot: RecordingSnapshot = initialSnapshot;
  private readonly listeners = new Set<RecordingListener>();
  private readonly provider: RecordingProvider;

  constructor(provider: RecordingProvider) {
    this.provider = provider;
  }

  getSnapshot(): RecordingSnapshot {
    return this.snapshot;
  }

  subscribe(listener: RecordingListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async initialize(): Promise<RecordingActionResult> {
    try {
      const permission = await this.provider.getPermissionStatus();
      this.update({ permission, error: null });
      return { ok: true };
    } catch {
      return this.fail(
        "permission_failed",
        "Microphone permission could not be checked. Try again.",
        "idle",
      );
    }
  }

  async requestPermission(): Promise<RecordingActionResult> {
    try {
      const permission = await this.provider.requestPermission();
      this.update({ permission, error: null });

      if (permission !== "granted") {
        return this.resultError(
          "permission_denied",
          "Microphone permission is required to record.",
        );
      }

      return { ok: true };
    } catch {
      return this.fail(
        "permission_failed",
        "Microphone permission could not be requested. Try again.",
        "idle",
      );
    }
  }

  async start(): Promise<RecordingActionResult> {
    if (this.snapshot.permission !== "granted") {
      return this.resultError(
        "permission_denied",
        "Microphone permission is required to record.",
      );
    }

    if (this.snapshot.phase !== "idle" && this.snapshot.phase !== "failed") {
      return this.resultError("invalid_state", "Recording is already in progress.");
    }

    this.update({ phase: "starting", asset: null, error: null });

    try {
      await this.provider.start();
      this.update({ phase: "recording", error: null });
      return { ok: true };
    } catch {
      return this.fail("start_failed", "Recording could not start. Try again.");
    }
  }

  async stop(): Promise<RecordingStopResult> {
    if (this.snapshot.phase !== "recording") {
      return this.resultError("invalid_state", "There is no active recording to stop.");
    }

    this.update({ phase: "stopping", error: null });

    try {
      const asset = await this.provider.stop();
      this.update({ phase: "recorded", asset, error: null });
      return { ok: true, asset };
    } catch {
      return this.fail("stop_failed", "Recording could not stop cleanly. Try again.");
    }
  }

  async cancel(): Promise<RecordingActionResult> {
    if (this.snapshot.asset) {
      return this.discard();
    }

    const shouldTearDownProvider =
      this.snapshot.phase === "starting" ||
      this.snapshot.phase === "recording" ||
      this.snapshot.phase === "stopping" ||
      this.snapshot.phase === "failed";

    if (!shouldTearDownProvider) {
      this.update({ phase: "idle", asset: null, error: null });
      return { ok: true };
    }

    try {
      await this.provider.cancel();
      this.update({ phase: "idle", asset: null, error: null });
      return { ok: true };
    } catch {
      return this.fail("cancel_failed", "Recording could not be cancelled. Try again.");
    }
  }

  async discard(): Promise<RecordingActionResult> {
    const asset = this.snapshot.asset;

    if (!asset) {
      this.update({ phase: "idle", error: null });
      return { ok: true };
    }

    try {
      await this.provider.discard(asset);
      this.update({ phase: "idle", asset: null, error: null });
      return { ok: true };
    } catch {
      return this.fail(
        "discard_failed",
        "The temporary recording could not be deleted.",
        "recorded",
      );
    }
  }

  private update(patch: Partial<RecordingSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener(this.snapshot));
  }

  private resultError(code: RecordingErrorCode, message: string): {
    ok: false;
    error: RecordingError;
  } {
    return { ok: false, error: { code, message } };
  }

  private fail(
    code: RecordingErrorCode,
    message: string,
    phase: RecordingPhase = "failed",
  ): { ok: false; error: RecordingError } {
    const result = this.resultError(code, message);
    this.update({ phase, error: result.error });
    return result;
  }
}
