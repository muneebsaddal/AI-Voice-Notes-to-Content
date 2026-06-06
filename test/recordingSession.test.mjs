import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { RecordingSession } from "../src/audio/recordingSession.ts";

function createProvider(overrides = {}) {
  const calls = [];
  const asset = {
    id: "recording-1",
    uri: "file:///tmp/recording-1.m4a",
    durationMs: 42000,
    mimeType: "audio/mp4",
    createdAt: "2026-06-06T12:00:00.000Z",
  };

  return {
    calls,
    asset,
    provider: {
      async getPermissionStatus() {
        calls.push("getPermissionStatus");
        return "granted";
      },
      async requestPermission() {
        calls.push("requestPermission");
        return "granted";
      },
      async start() {
        calls.push("start");
      },
      async stop() {
        calls.push("stop");
        return asset;
      },
      async cancel() {
        calls.push("cancel");
      },
      async discard(recording) {
        calls.push(["discard", recording.id]);
      },
      ...overrides,
    },
  };
}

describe("RecordingSession", () => {
  it("loads the current microphone permission without prompting", async () => {
    const { provider, calls } = createProvider();
    const session = new RecordingSession(provider);

    const result = await session.initialize();

    assert.deepEqual(result, { ok: true });
    assert.equal(session.getSnapshot().permission, "granted");
    assert.deepEqual(calls, ["getPermissionStatus"]);
  });

  it("does not start when the permission request is denied", async () => {
    const { provider, calls } = createProvider({
      async requestPermission() {
        calls.push("requestPermission");
        return "denied";
      },
    });
    const session = new RecordingSession(provider);

    const permissionResult = await session.requestPermission();
    const startResult = await session.start();

    assert.deepEqual(permissionResult, {
      ok: false,
      error: {
        code: "permission_denied",
        message: "Microphone permission is required to record.",
      },
    });
    assert.deepEqual(startResult, {
      ok: false,
      error: {
        code: "permission_denied",
        message: "Microphone permission is required to record.",
      },
    });
    assert.equal(session.getSnapshot().phase, "idle");
    assert.deepEqual(calls, ["requestPermission"]);
  });

  it("starts and stops a recording while retaining the temporary asset", async () => {
    const { provider, asset, calls } = createProvider();
    const session = new RecordingSession(provider);

    await session.initialize();
    const startResult = await session.start();
    const stopResult = await session.stop();

    assert.deepEqual(startResult, { ok: true });
    assert.deepEqual(stopResult, { ok: true, asset });
    assert.equal(session.getSnapshot().phase, "recorded");
    assert.deepEqual(session.getSnapshot().asset, asset);
    assert.deepEqual(calls, ["getPermissionStatus", "start", "stop"]);
  });

  it("cancels an active recording and returns to an empty idle state", async () => {
    const { provider, calls } = createProvider();
    const session = new RecordingSession(provider);

    await session.initialize();
    await session.start();
    const result = await session.cancel();

    assert.deepEqual(result, { ok: true });
    assert.deepEqual(session.getSnapshot(), {
      permission: "granted",
      phase: "idle",
      asset: null,
      error: null,
    });
    assert.deepEqual(calls, ["getPermissionStatus", "start", "cancel"]);
  });

  it("deletes a completed temporary recording when the user abandons it", async () => {
    const { provider, calls } = createProvider();
    const session = new RecordingSession(provider);

    await session.initialize();
    await session.start();
    await session.stop();
    const result = await session.cancel();

    assert.deepEqual(result, { ok: true });
    assert.deepEqual(calls.at(-1), ["discard", "recording-1"]);
    assert.deepEqual(session.getSnapshot(), {
      permission: "granted",
      phase: "idle",
      asset: null,
      error: null,
    });
  });

  it("exposes a retryable failure when recording cannot start", async () => {
    const { provider } = createProvider({
      async start() {
        throw new Error("native recorder unavailable");
      },
    });
    const session = new RecordingSession(provider);

    await session.initialize();
    const result = await session.start();

    assert.deepEqual(result, {
      ok: false,
      error: {
        code: "start_failed",
        message: "Recording could not start. Try again.",
      },
    });
    assert.equal(session.getSnapshot().phase, "failed");
  });

  it("tears down the provider after a stop failure", async () => {
    const { provider, calls } = createProvider({
      async stop() {
        calls.push("stop");
        throw new Error("interrupted");
      },
    });
    const session = new RecordingSession(provider);

    await session.initialize();
    await session.start();
    await session.stop();
    const cancelResult = await session.cancel();

    assert.deepEqual(cancelResult, { ok: true });
    assert.deepEqual(calls, ["getPermissionStatus", "start", "stop", "cancel"]);
    assert.equal(session.getSnapshot().phase, "idle");
  });

  it("discards a retained temporary recording after processing", async () => {
    const { provider, calls } = createProvider();
    const session = new RecordingSession(provider);

    await session.initialize();
    await session.start();
    await session.stop();
    const result = await session.discard();

    assert.deepEqual(result, { ok: true });
    assert.deepEqual(session.getSnapshot(), {
      permission: "granted",
      phase: "idle",
      asset: null,
      error: null,
    });
    assert.deepEqual(calls.at(-1), ["discard", "recording-1"]);
  });
});
