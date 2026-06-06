import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MockBackendClientError,
  buildTranscriptionFormData,
  getApiBaseUrl,
  isMockFallbackEnabled,
  transcribeRecordingAsset,
} from "../src/api/transcriptionClient.ts";
import { processRetainedRecording } from "../src/flows/transcriptionFlow.ts";

const asset = {
  id: "recording-1",
  uri: "blob:http://localhost/recording-1",
  durationMs: 42000,
  mimeType: "audio/webm",
  createdAt: "2026-06-06T12:00:00.000Z",
};

const transcription = {
  transcript: "Write a follow-up email.",
  language: "en",
  durationMs: 42000,
  suggestedOutputType: "email",
  routing: {
    suggestedOutputType: "email",
    source: "explicit",
    confidence: "high",
    uncertain: false,
    matchedSignals: ["email"],
    warnings: [],
  },
};

describe("frontend transcription client", () => {
  it("builds web multipart data with the retained recording metadata", async () => {
    const form = await buildTranscriptionFormData(asset, {
      platform: "web",
      language: "en",
      fetchImplementation: async () =>
        new Response(new Blob(["voice"], { type: "audio/webm" })),
    });

    const file = form.get("file");
    assert(file instanceof File);
    assert.equal(file.name, "recording.webm");
    assert.equal(file.type, "audio/webm");
    assert.equal(form.get("durationMs"), "42000");
    assert.equal(form.get("audioId"), "recording-1");
    assert.equal(form.get("language"), "en");
  });

  it("builds native multipart data from an iOS file URI without reading it", async () => {
    const nativeAsset = {
      ...asset,
      uri: "file:///var/mobile/recording-1.m4a",
      mimeType: "audio/mp4",
    };
    const appended = [];
    const form = await buildTranscriptionFormData(nativeAsset, {
      platform: "native",
      formDataFactory: () => ({
        append(name, value, filename) {
          appended.push([name, value, filename]);
        },
      }),
    });

    assert.ok(form);
    assert.deepEqual(appended[0], [
      "file",
      {
        uri: nativeAsset.uri,
        name: "recording-1.m4a",
        type: "audio/mp4",
      },
      undefined,
    ]);
    assert.deepEqual(appended.slice(1), [
      ["durationMs", "42000", undefined],
      ["audioId", "recording-1", undefined],
    ]);
  });

  it("uses the configured API base URL and lets fetch set the multipart boundary", async () => {
    let receivedUrl = "";
    let receivedInit;

    const result = await transcribeRecordingAsset(asset, {
      apiBaseUrl: "http://192.168.1.20:3333/",
      platform: "web",
      fetchImplementation: async (input, init) => {
        if (String(input).startsWith("blob:")) {
          return new Response(new Blob(["voice"], { type: "audio/webm" }));
        }
        receivedUrl = String(input);
        receivedInit = init;
        return Response.json(transcription);
      },
    });

    assert.equal(receivedUrl, "http://192.168.1.20:3333/api/transcriptions");
    assert.equal(receivedInit.method, "POST");
    assert.equal(receivedInit.headers, undefined);
    assert(receivedInit.body instanceof FormData);
    assert.deepEqual(result, transcription);
  });

  it("maps structured backend errors and rejects invalid success payloads", async () => {
    await assert.rejects(
      transcribeRecordingAsset(asset, {
        platform: "web",
        fetchImplementation: async (input) => {
          if (String(input).startsWith("blob:")) {
            return new Response(new Blob(["voice"], { type: "audio/webm" }));
          }
          return Response.json(
            {
              error: {
                code: "transcription_unavailable",
                message: "Transcription is temporarily unavailable.",
              },
            },
            { status: 503 },
          );
        },
      }),
      (error) =>
        error instanceof MockBackendClientError &&
        error.code === "transcription_unavailable" &&
        error.status === 503,
    );

    await assert.rejects(
      transcribeRecordingAsset(asset, {
        platform: "web",
        fetchImplementation: async (input) => {
          if (String(input).startsWith("blob:")) {
            return new Response(new Blob(["voice"], { type: "audio/webm" }));
          }
          return Response.json({ ...transcription, transcript: " " });
        },
      }),
      (error) =>
        error instanceof MockBackendClientError &&
        error.code === "transcription_failed",
    );
  });

  it("maps request timeouts to transcription_unavailable", async () => {
    await assert.rejects(
      transcribeRecordingAsset(asset, {
        platform: "native",
        timeoutMs: 5,
        fetchImplementation: async (_input, init) =>
          await new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      }),
      (error) =>
        error instanceof MockBackendClientError &&
        error.code === "transcription_unavailable",
    );
  });

  it("uses documented environment defaults and requires an explicit mock flag", () => {
    assert.equal(getApiBaseUrl({}), "http://127.0.0.1:3333");
    assert.equal(
      getApiBaseUrl({ EXPO_PUBLIC_API_BASE_URL: "http://10.0.0.8:4000/" }),
      "http://10.0.0.8:4000",
    );
    assert.equal(isMockFallbackEnabled(undefined), false);
    assert.equal(isMockFallbackEnabled("false"), false);
    assert.equal(isMockFallbackEnabled("true"), true);
  });
});

describe("retained recording transcription flow", () => {
  it("discards only after an accepted transcription", async () => {
    const calls = [];

    const result = await processRetainedRecording(asset, {
      transcribe: async (receivedAsset) => {
        calls.push(["transcribe", receivedAsset]);
        return transcription;
      },
      discard: async () => {
        calls.push(["discard"]);
        return { ok: true };
      },
    });

    assert.deepEqual(result, { response: transcription, cleanupFailed: false });
    assert.deepEqual(calls, [
      ["transcribe", asset],
      ["discard"],
    ]);
  });

  it("retains the same asset after failure and reuses it on retry", async () => {
    const receivedAssets = [];
    let attempts = 0;
    let discardCalls = 0;
    const dependencies = {
      transcribe: async (receivedAsset) => {
        receivedAssets.push(receivedAsset);
        attempts += 1;
        if (attempts === 1) {
          throw new MockBackendClientError(
            "transcription_unavailable",
            "Unavailable",
            503,
          );
        }
        return transcription;
      },
      discard: async () => {
        discardCalls += 1;
        return { ok: true };
      },
    };

    await assert.rejects(processRetainedRecording(asset, dependencies));
    assert.equal(discardCalls, 0);

    await processRetainedRecording(asset, dependencies);
    assert.equal(receivedAssets.length, 2);
    assert.strictEqual(receivedAssets[0], asset);
    assert.strictEqual(receivedAssets[1], asset);
    assert.equal(discardCalls, 1);
  });

  it("reports cleanup failure after preserving the accepted transcript", async () => {
    const result = await processRetainedRecording(asset, {
      transcribe: async () => transcription,
      discard: async () => ({
        ok: false,
        error: {
          code: "discard_failed",
          message: "The temporary recording could not be deleted.",
        },
      }),
    });

    assert.deepEqual(result, { response: transcription, cleanupFailed: true });
  });
});
