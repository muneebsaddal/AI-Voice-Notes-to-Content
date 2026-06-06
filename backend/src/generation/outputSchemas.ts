import type { OutputType } from "../types";

type JsonSchema = Record<string, unknown>;

const stringSchema = { type: "string" };
const nullableString = {
  anyOf: [stringSchema, { type: "null" }],
};

const payloadSchemas: Record<OutputType, JsonSchema> = {
  note: {
    type: "object",
    additionalProperties: false,
    required: ["type", "summary", "mainPoints", "nextSteps"],
    properties: {
      type: { type: "string", enum: ["note"] },
      summary: stringSchema,
      mainPoints: {
        type: "array",
        items: stringSchema,
      },
      nextSteps: {
        anyOf: [
          {
            type: "array",
            items: stringSchema,
          },
          { type: "null" },
        ],
      },
    },
  },
  todo: {
    type: "object",
    additionalProperties: false,
    required: ["type", "tasks"],
    properties: {
      type: { type: "string", enum: ["todo"] },
      tasks: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["text", "dueDate", "prioritySuggestion", "ambiguous"],
          properties: {
            text: stringSchema,
            dueDate: {
              anyOf: [
                {
                  type: "object",
                  additionalProperties: false,
                  required: ["text", "sourceText"],
                  properties: {
                    text: stringSchema,
                    sourceText: stringSchema,
                  },
                },
                { type: "null" },
              ],
            },
            prioritySuggestion: {
              anyOf: [
                { type: "string", enum: ["low", "medium", "high"] },
                { type: "null" },
              ],
            },
            ambiguous: { type: "boolean" },
          },
        },
      },
    },
  },
  email: {
    type: "object",
    additionalProperties: false,
    required: ["type", "subject", "greeting", "body", "closing"],
    properties: {
      type: { type: "string", enum: ["email"] },
      subject: stringSchema,
      greeting: stringSchema,
      body: stringSchema,
      closing: stringSchema,
    },
  },
  journal: {
    type: "object",
    additionalProperties: false,
    required: ["type", "entryBody", "mood", "theme", "tomorrowFocus"],
    properties: {
      type: { type: "string", enum: ["journal"] },
      entryBody: stringSchema,
      mood: nullableString,
      theme: nullableString,
      tomorrowFocus: nullableString,
    },
  },
  content: {
    type: "object",
    additionalProperties: false,
    required: ["type", "hook", "draft", "caption", "cta"],
    properties: {
      type: { type: "string", enum: ["content"] },
      hook: stringSchema,
      draft: stringSchema,
      caption: nullableString,
      cta: nullableString,
    },
  },
};

export function generationResponseSchema(outputType: OutputType): JsonSchema {
  return {
    type: "object",
    additionalProperties: false,
    required: ["title", "preview", "warnings", "payload"],
    properties: {
      title: stringSchema,
      preview: stringSchema,
      warnings: {
        type: "array",
        items: stringSchema,
      },
      payload: payloadSchemas[outputType],
    },
  };
}
