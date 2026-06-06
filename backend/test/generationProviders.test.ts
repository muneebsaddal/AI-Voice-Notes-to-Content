import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ApiError } from "../src/errors";
import { generationQualityFixtures } from "../src/generation/qualityFixtures";
import { createGenerationProvider } from "../src/generation/providerConfig";
import { LocalFormatterProvider } from "../src/generation/localFormatterProvider";
import { OpenAIProvider } from "../src/generation/openAIProvider";
import { generateWithProvider } from "../src/services/generationService";
import { validateGeneratedOutput } from "../src/outputContracts";

describe("generation provider configuration", () => {
  it("selects the local formatter by default", () => {
    assert.equal(createGenerationProvider({}).name, "local");
  });

  it("requires complete OpenAI configuration", () => {
    assert.throws(
      () => createGenerationProvider({ GENERATION_PROVIDER: "openai" }),
      /OpenAI generation configuration is incomplete/,
    );
    assert.throws(
      () =>
        createGenerationProvider({
          GENERATION_PROVIDER: "openai",
          OPENAI_API_KEY: "test-key",
        }),
      /OpenAI generation configuration is incomplete/,
    );
  });

  it("rejects unsupported providers without exposing configuration values", () => {
    assert.throws(
      () => createGenerationProvider({ GENERATION_PROVIDER: "other" }),
      (error: unknown) =>
        error instanceof Error &&
        error.message === "Unsupported generation provider configuration.",
    );
  });
});

describe("local generation quality matrix", () => {
  it("keeps every fixture contract-valid and grounded in selected transcript facts", async () => {
    const provider = new LocalFormatterProvider();

    for (const fixture of generationQualityFixtures) {
      const output = await generateWithProvider(provider, {
        transcript: fixture.transcript,
        outputType: fixture.selectedType,
      });
      const validation = validateGeneratedOutput(output, fixture.transcript);

      assert.equal(validation.ok, true, fixture.id);
      assert.equal(output.outputType, fixture.selectedType, fixture.id);
      const serialized = JSON.stringify(output).toLocaleLowerCase();
      for (const fact of fixture.expectedFacts) {
        assert.match(serialized, new RegExp(escapeRegex(fact), "i"), fixture.id);
      }
      if (fixture.expectAmbiguityWarning) {
        assert.ok(
          output.warnings.some((warning) => /ambiguous|uncertain|guessing/i.test(warning)),
          fixture.id,
        );
      }
    }
  });
});

describe("OpenAI generation provider", () => {
  it("uses the Responses API structured-output contract and returns parsed content", async () => {
    let receivedBody: Record<string, unknown> | undefined;
    const provider = new OpenAIProvider({
      apiKey: "test-key",
      model: "configured-model",
      timeoutMs: 1000,
      fetchImplementation: async (_input, init) => {
        receivedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return Response.json({
          status: "completed",
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    title: "Invoice Follow-Up",
                    preview: "Ask Priya about invoice 4821 on Tuesday.",
                    warnings: [],
                    payload: {
                      type: "email",
                      subject: "Invoice 4821 follow-up",
                      greeting: "Hi Priya,",
                      body: "Could you confirm invoice 4821 on Tuesday?",
                      closing: "Thanks,",
                    },
                  }),
                },
              ],
            },
          ],
        });
      },
    });

    const output = await generateWithProvider(provider, {
      transcript: "Email Priya about invoice 4821 on Tuesday.",
      outputType: "email",
    });

    assert.equal(output.outputType, "email");
    assert.equal(output.payload.type, "email");
    assert.equal(receivedBody?.model, "configured-model");
    assert.equal(receivedBody?.store, false);
    assert.equal(
      ((receivedBody?.text as Record<string, unknown>).format as Record<string, unknown>).type,
      "json_schema",
    );
    assert.match(String(receivedBody?.instructions), /only.*transcript facts/i);
    assert.equal(JSON.stringify(receivedBody).includes("test-key"), false);
  });

  it("retries network, rate-limit, and provider 5xx failures once", async () => {
    for (const firstResponse of [
      new TypeError("network unavailable"),
      new Response("rate limited", { status: 429 }),
      new Response("provider unavailable", { status: 503 }),
    ]) {
      let attempts = 0;
      const provider = new OpenAIProvider({
        apiKey: "test-key",
        model: "configured-model",
        timeoutMs: 1000,
        maxAttempts: 2,
        sleep: async () => undefined,
        fetchImplementation: async () => {
          attempts += 1;
          if (attempts === 1) {
            if (firstResponse instanceof Error) {
              throw firstResponse;
            }
            return firstResponse;
          }
          return Response.json(completedNoteResponse());
        },
      });

      const output = await generateWithProvider(provider, {
        transcript: "Keep this as a note about launch code ZX-42.",
        outputType: "note",
      });

      assert.equal(attempts, 2);
      assert.equal(output.outputType, "note");
    }
  });

  it("does not retry authentication, configuration, or invalid-schema failures", async () => {
    for (const response of [
      new Response("unauthorized", { status: 401 }),
      Response.json(completedNoteResponse({ summary: "" })),
    ]) {
      let attempts = 0;
      const provider = new OpenAIProvider({
        apiKey: "test-key",
        model: "configured-model",
        timeoutMs: 1000,
        maxAttempts: 2,
        sleep: async () => undefined,
        fetchImplementation: async () => {
          attempts += 1;
          return response;
        },
      });

      await assert.rejects(
        generateWithProvider(provider, {
          transcript: "Keep this as a note about launch code ZX-42.",
          outputType: "note",
        }),
        (error: unknown) => error instanceof ApiError,
      );
      assert.equal(attempts, 1);
    }
  });
});

function completedNoteResponse(payloadOverrides: Record<string, unknown> = {}) {
  return {
    status: "completed",
    output: [
      {
        type: "message",
        content: [
          {
            type: "output_text",
            text: JSON.stringify({
              title: "Launch Code",
              preview: "Launch code ZX-42.",
              warnings: [],
              payload: {
                type: "note",
                summary: "Launch code ZX-42.",
                mainPoints: ["Launch code ZX-42."],
                nextSteps: null,
                ...payloadOverrides,
              },
            }),
          },
        ],
      },
    ],
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
