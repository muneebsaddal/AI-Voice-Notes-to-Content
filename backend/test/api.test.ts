import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, before, describe, it } from "node:test";

import { createApp } from "../src/app";

type JsonRecord = Record<string, unknown>;

let server: Server;
let baseUrl = "";

async function requestJson(
  path: string,
  options: { method?: string; body?: JsonRecord } = {},
): Promise<{ status: number; json: JsonRecord }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: options.body ? { "content-type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return {
    status: response.status,
    json: (await response.json()) as JsonRecord,
  };
}

before(async () => {
  server = createServer(createApp());

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("mock API contracts", () => {
  it("returns mock health status", async () => {
    const response = await requestJson("/api/health");

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      ok: true,
      service: "voice-notes-api",
      mode: "mock",
    });
  });

  it("returns a mock transcription with a suggested output type", async () => {
    const response = await requestJson("/api/transcriptions", {
      method: "POST",
      body: {
        audioId: "mock-audio-1",
        durationMs: 42000,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(typeof response.json.transcript, "string");
    assert.equal(response.json.language, "en");
    assert.equal(response.json.durationMs, 42000);
    assert.equal(response.json.suggestedOutputType, "email");
  });

  it("returns generated output for each MVP output type", async () => {
    for (const outputType of ["note", "todo", "email", "journal", "content"]) {
      const response = await requestJson("/api/generations", {
        method: "POST",
        body: {
          transcript: "Please turn this voice note into something useful.",
          outputType,
        },
      });

      assert.equal(response.status, 200);
      assert.equal(response.json.outputType, outputType);
      assert.equal(typeof response.json.id, "string");
      assert.equal(typeof response.json.title, "string");
      assert.equal(typeof response.json.body, "string");
      assert.equal(typeof response.json.preview, "string");
      assert.equal(response.json.createdAtLabel, "Today");
    }
  });

  it("rejects unsupported output types with a structured error", async () => {
    const response = await requestJson("/api/generations", {
      method: "POST",
      body: {
        transcript: "Make this a calendar event.",
        outputType: "calendar",
      },
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.json, {
      error: {
        code: "unsupported_output_type",
        message: "Unsupported output type.",
      },
    });
  });

  it("returns a structured recording upload failure when requested", async () => {
    const response = await requestJson("/api/transcriptions", {
      method: "POST",
      body: {
        audioId: "mock-audio-1",
        durationMs: 42000,
        simulate: "recording_upload_failed",
      },
    });

    assert.equal(response.status, 502);
    assert.deepEqual(response.json, {
      error: {
        code: "recording_upload_failed",
        message: "Recording upload failed.",
      },
    });
  });

  it("returns a structured transcription failure when requested", async () => {
    const response = await requestJson("/api/transcriptions", {
      method: "POST",
      body: {
        audioId: "mock-audio-1",
        durationMs: 42000,
        simulate: "transcription_failed",
      },
    });

    assert.equal(response.status, 502);
    assert.deepEqual(response.json, {
      error: {
        code: "transcription_failed",
        message: "Transcription failed.",
      },
    });
  });

  it("returns a structured generation failure when requested", async () => {
    const response = await requestJson("/api/generations", {
      method: "POST",
      body: {
        transcript: "Please turn this into something useful.",
        outputType: "note",
        simulate: "generation_failed",
      },
    });

    assert.equal(response.status, 502);
    assert.deepEqual(response.json, {
      error: {
        code: "generation_failed",
        message: "Generation failed.",
      },
    });
  });

  it("rejects invalid request bodies with a structured error", async () => {
    const response = await requestJson("/api/transcriptions", {
      method: "POST",
      body: {
        durationMs: -1,
      },
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.json, {
      error: {
        code: "invalid_request_body",
        message: "Invalid request body.",
      },
    });
  });
});
