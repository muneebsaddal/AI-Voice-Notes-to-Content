import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ApiError } from "../src/errors";
import { createTranscriptionProvider } from "../src/transcription/providerConfig";
import type { TranscriptionProvider } from "../src/transcription/types";

describe("transcription provider configuration", () => {
  it("selects the deterministic mock provider by default", async () => {
    const provider = createTranscriptionProvider({});
    const result = await provider.transcribe({
      filePath: "unused",
      filename: "voice-note.m4a",
      mimeType: "audio/mp4",
    });

    assert.match(result.text, /Quick note before Thursday/i);
    assert.equal(result.language, "en");
  });

  it("selects the local faster-whisper provider", () => {
    const provider = createTranscriptionProvider({
      TRANSCRIPTION_PROVIDER: "local-faster-whisper",
      LOCAL_WHISPER_URL: "http://127.0.0.1:8001",
    });

    assert.equal(provider.name, "local-faster-whisper");
  });

  it("rejects unsupported providers without exposing configuration details", () => {
    assert.throws(
      () => createTranscriptionProvider({ TRANSCRIPTION_PROVIDER: "unknown-provider" }),
      (error: unknown) =>
        error instanceof Error &&
        error.message === "Unsupported transcription provider configuration.",
    );
  });

  it("maps sidecar connection failures to transcription_unavailable", async () => {
    const provider = createTranscriptionProvider(
      {
        TRANSCRIPTION_PROVIDER: "local-faster-whisper",
        LOCAL_WHISPER_URL: "http://127.0.0.1:8001",
      },
      async () => {
        throw new TypeError("connection refused");
      },
    );

    await assert.rejects(
      provider.transcribe({
        filePath: __filename,
        filename: "voice-note.wav",
        mimeType: "audio/wav",
      }),
      (error: unknown) =>
        error instanceof ApiError && error.code === "transcription_unavailable",
    );
  });

  it("maps sidecar timeouts to transcription_unavailable", async () => {
    const provider = createTranscriptionProvider(
      {
        TRANSCRIPTION_PROVIDER: "local-faster-whisper",
        LOCAL_WHISPER_URL: "http://127.0.0.1:8001",
        TRANSCRIPTION_TIMEOUT_MS: "1",
      },
      async (_input, init) =>
        await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );

    await assert.rejects(
      provider.transcribe({
        filePath: __filename,
        filename: "voice-note.wav",
        mimeType: "audio/wav",
      }),
      (error: unknown) =>
        error instanceof ApiError && error.code === "transcription_unavailable",
    );
  });

  it("maps empty sidecar results to transcription_failed", async () => {
    const provider = createTranscriptionProvider(
      {
        TRANSCRIPTION_PROVIDER: "local-faster-whisper",
        LOCAL_WHISPER_URL: "http://127.0.0.1:8001",
      },
      async () =>
        new Response(JSON.stringify({ text: "  ", language: "en", durationSeconds: 1 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    await assert.rejects(
      provider.transcribe({
        filePath: __filename,
        filename: "voice-note.wav",
        mimeType: "audio/wav",
      }),
      (error: unknown) =>
        error instanceof ApiError && error.code === "transcription_failed",
    );
  });

  it("accepts a provider-compatible injected fake", async () => {
    const fake: TranscriptionProvider = {
      name: "mock",
      transcribe: async () => ({ text: "Make this a note.", language: "en" }),
    };

    assert.equal((await fake.transcribe({
      filePath: "unused",
      filename: "voice-note.webm",
      mimeType: "audio/webm",
    })).text, "Make this a note.");
  });
});
