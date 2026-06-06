import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { afterEach, describe, it } from "node:test";

import { createApp } from "../src/app";
import { ApiError } from "../src/errors";
import type {
  TranscriptionProvider,
  TranscriptionProviderInput,
} from "../src/transcription/types";

type JsonRecord = Record<string, unknown>;

const servers: Server[] = [];

async function startServer(provider: TranscriptionProvider, maxAudioUploadBytes = 1024 * 1024) {
  const server = createServer(createApp({ transcriptionProvider: provider, maxAudioUploadBytes }));
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}`;
}

async function postMultipart(
  baseUrl: string,
  options: {
    filename?: string;
    mimeType?: string;
    durationMs?: string;
    files?: { filename: string; mimeType: string; bytes: Uint8Array }[];
    bytes?: Uint8Array;
  } = {},
): Promise<{ status: number; json: JsonRecord; requestId: string | null }> {
  const form = new FormData();
  const files = options.files ?? [{
    filename: options.filename ?? "voice-note.m4a",
    mimeType: options.mimeType ?? "audio/mp4",
    bytes: options.bytes ?? new Uint8Array([1, 2, 3, 4]),
  }];

  for (const file of files) {
    form.append("file", new Blob([Buffer.from(file.bytes)], { type: file.mimeType }), file.filename);
  }
  if (options.durationMs !== "") {
    form.append("durationMs", options.durationMs ?? "42000");
  }

  const response = await fetch(`${baseUrl}/api/transcriptions`, {
    method: "POST",
    headers: {
      "x-request-id": "req-upload-test-123",
    },
    body: form,
  });

  return {
    status: response.status,
    json: (await response.json()) as JsonRecord,
    requestId: response.headers.get("x-request-id"),
  };
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        ),
    ),
  );
});

describe("multipart transcription route", () => {
  it("passes validated metadata to the provider and preserves the public response", async () => {
    let received: TranscriptionProviderInput | undefined;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async (input) => {
        received = input;
        return {
          text: "Please write a follow-up email and remind me to send the invoice.",
          language: "en",
          durationSeconds: 42.5,
          internalProviderField: "must-not-leak",
        } as never;
      },
    });

    const response = await postMultipart(baseUrl);

    assert.equal(response.status, 200);
    assert.equal(response.requestId, "req-upload-test-123");
    assert.equal(received?.filename, "voice-note.m4a");
    assert.equal(received?.mimeType, "audio/mp4");
    assert.equal(response.json.durationMs, 42000);
    assert.equal(response.json.suggestedOutputType, "email");
    assert.equal("internalProviderField" in response.json, false);
    assert.equal(typeof received?.filePath, "string");
    await assert.rejects(access(received!.filePath));
  });

  it("accepts wav and webm audio", async () => {
    let invocations = 0;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async () => {
        invocations += 1;
        return { text: "Turn this into a clean note.", language: "en" };
      },
    });

    assert.equal((await postMultipart(baseUrl, {
      filename: "voice.wav",
      mimeType: "audio/wav",
    })).status, 200);
    assert.equal((await postMultipart(baseUrl, {
      filename: "voice.webm",
      mimeType: "audio/webm",
    })).status, 200);
    assert.equal(invocations, 2);
  });

  it("accepts supported mobile MPEG-4 aliases when the extension agrees", async () => {
    let invocations = 0;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async () => {
        invocations += 1;
        return { text: "Turn this into a clean note.", language: "en" };
      },
    });

    for (const mimeType of ["audio/mp4", "video/mp4", "audio/x-m4a", "audio/m4a"]) {
      assert.equal((await postMultipart(baseUrl, {
        filename: "voice.m4a",
        mimeType,
      })).status, 200);
    }
    assert.equal(invocations, 4);
  });

  it("rejects mismatched extension and MIME metadata before provider invocation", async () => {
    let invocations = 0;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async () => {
        invocations += 1;
        return { text: "unused" };
      },
    });

    const response = await postMultipart(baseUrl, {
      filename: "voice.webm",
      mimeType: "audio/mp4",
    });

    assert.equal(response.status, 415);
    assert.equal(invocations, 0);
  });

  it("rejects generic MIME metadata before provider invocation", async () => {
    let invocations = 0;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async () => {
        invocations += 1;
        return { text: "unused" };
      },
    });

    const response = await postMultipart(baseUrl, {
      filename: "voice.m4a",
      mimeType: "application/octet-stream",
    });

    assert.equal(response.status, 415);
    assert.equal(invocations, 0);
  });

  it("rejects missing and multiple files before provider invocation", async () => {
    let invocations = 0;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async () => {
        invocations += 1;
        return { text: "unused" };
      },
    });

    const missingForm = new FormData();
    missingForm.append("durationMs", "1000");
    const missingResponse = await fetch(`${baseUrl}/api/transcriptions`, {
      method: "POST",
      body: missingForm,
    });
    const multiple = await postMultipart(baseUrl, {
      files: [
        { filename: "one.m4a", mimeType: "audio/mp4", bytes: new Uint8Array([1]) },
        { filename: "two.m4a", mimeType: "audio/mp4", bytes: new Uint8Array([2]) },
      ],
    });

    assert.equal(missingResponse.status, 400);
    assert.equal(multiple.status, 400);
    assert.equal(invocations, 0);
  });

  it("rejects invalid duration and unsupported audio", async () => {
    let invocations = 0;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async () => {
        invocations += 1;
        return { text: "unused" };
      },
    });

    const invalidDuration = await postMultipart(baseUrl, { durationMs: "0" });
    const unsupported = await postMultipart(baseUrl, {
      filename: "voice.txt",
      mimeType: "text/plain",
    });

    assert.equal(invalidDuration.status, 400);
    assert.equal(unsupported.status, 415);
    assert.equal(invocations, 0);
  });

  it("rejects oversized requests while reading the body", async () => {
    let invocations = 0;
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async () => {
        invocations += 1;
        return { text: "unused" };
      },
    }, 128);

    const response = await postMultipart(baseUrl, {
      bytes: new Uint8Array(512),
    });

    assert.equal(response.status, 413);
    assert.equal(response.json.error instanceof Object, true);
    assert.equal((response.json.error as JsonRecord).code, "audio_too_large");
    assert.equal(invocations, 0);
  });

  it("removes temporary files after provider failures", async () => {
    let filePath = "";
    const baseUrl = await startServer({
      name: "mock",
      transcribe: async (input) => {
        filePath = input.filePath;
        throw new ApiError("transcription_failed", "Transcription failed.", 502);
      },
    });

    const response = await postMultipart(baseUrl);

    assert.equal(response.status, 502);
    await assert.rejects(access(filePath));
  });
});
