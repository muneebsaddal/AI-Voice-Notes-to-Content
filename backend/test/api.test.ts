import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
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

async function requestChunkedJson(
  path: string,
  chunks: Buffer[],
): Promise<{ status: number; json: JsonRecord }> {
  const url = new URL(`${baseUrl}${path}`);

  return await new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      },
      (response) => {
        const responseChunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => responseChunks.push(chunk));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            json: JSON.parse(Buffer.concat(responseChunks).toString("utf8")) as JsonRecord,
          });
        });
      },
    );

    request.on("error", reject);
    for (const chunk of chunks) {
      request.write(chunk);
    }
    request.end();
  });
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

  it("parses valid chunked Unicode JSON without corrupting transcript text", async () => {
    let receivedTranscript = "";
    const unicodeServer = createServer(
      createApp({
        generateOutput: async (request) => {
          receivedTranscript = request.transcript;
          return {
            id: "unicode-note",
            outputType: request.outputType,
            title: "Unicode Note",
            body: "ok",
            preview: "ok",
            createdAtLabel: "Today",
          };
        },
      }),
    );

    await new Promise<void>((resolve) => {
      unicodeServer.listen(0, "127.0.0.1", resolve);
    });

    const originalBaseUrl = baseUrl;
    const address = unicodeServer.address();
    assert(address && typeof address === "object");
    baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const transcript = "Voice note with café, 🚀, and اردو text.";
      const payload = Buffer.from(
        JSON.stringify({
          transcript,
          outputType: "note",
        }),
        "utf8",
      );
      const splitAt = payload.indexOf(Buffer.from("🚀", "utf8")) + 1;
      const response = await requestChunkedJson("/api/generations", [
        payload.subarray(0, splitAt),
        payload.subarray(splitAt),
      ]);

      assert.equal(response.status, 200);
      assert.equal(receivedTranscript, transcript);
    } finally {
      baseUrl = originalBaseUrl;
      await new Promise<void>((resolve, reject) => {
        unicodeServer.close((error) => (error ? reject(error) : resolve()));
      });
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

  it("returns internal_error for unhandled exceptions", async () => {
    const originalConsoleError = console.error;
    console.error = () => undefined;

    const failingServer = createServer(
      createApp({
        generateOutput: async () => {
          throw new Error("unexpected failure");
        },
      }),
    );

    await new Promise<void>((resolve) => {
      failingServer.listen(0, "127.0.0.1", resolve);
    });

    const originalBaseUrl = baseUrl;
    const address = failingServer.address();
    assert(address && typeof address === "object");
    baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const response = await requestJson("/api/generations", {
        method: "POST",
        body: {
          transcript: "Please turn this into something useful.",
          outputType: "note",
        },
      });

      assert.equal(response.status, 500);
      assert.deepEqual(response.json, {
        error: {
          code: "internal_error",
          message: "The mock API could not complete the request.",
        },
      });
    } finally {
      console.error = originalConsoleError;
      baseUrl = originalBaseUrl;
      await new Promise<void>((resolve, reject) => {
        failingServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
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
