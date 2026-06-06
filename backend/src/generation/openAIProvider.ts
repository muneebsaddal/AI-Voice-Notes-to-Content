import {
  generationConfigurationError,
  generationFailedError,
  generationUnavailableError,
  invalidGeneratedOutputError,
} from "../errors";
import type {
  ContentPayload,
  EmailPayload,
  GeneratedPayload,
  GenerationRequest,
  JournalPayload,
  NotePayload,
  TodoPayload,
  TodoTask,
} from "../types";
import { generationResponseSchema } from "./outputSchemas";
import type {
  GenerationProvider,
  GenerationProviderResult,
} from "./types";

type OpenAIProviderOptions = {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxAttempts?: number;
  fetchImplementation?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
};

const responsesUrl = "https://api.openai.com/v1/responses";
const defaultMaxAttempts = 2;
const retryDelayMs = 150;

const systemPolicy = [
  "Transform the transcript into the explicitly selected output type.",
  "Use only transcript facts.",
  "Do not invent recipients, names, dates, quantities, commitments, tasks, claims, or context.",
  "Retain uncertainty rather than guessing.",
  "Keep sourceText for a todo due date as an exact substring from the transcript.",
  "Use warnings for material ambiguity.",
].join(" ");

export class OpenAIProvider implements GenerationProvider {
  readonly name = "openai" as const;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly fetchImplementation: typeof fetch;
  private readonly sleep: (milliseconds: number) => Promise<void>;

  constructor(options: OpenAIProviderOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.timeoutMs = options.timeoutMs;
    this.maxAttempts = options.maxAttempts ?? defaultMaxAttempts;
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.sleep = options.sleep ?? delay;
  }

  async generate(request: GenerationRequest): Promise<GenerationProviderResult> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        return await this.requestGeneration(request);
      } catch (error) {
        if (!isRetryableError(error) || attempt === this.maxAttempts) {
          throw error;
        }
        await this.sleep(retryDelayMs * attempt);
      }
    }

    throw generationUnavailableError;
  }

  private async requestGeneration(
    request: GenerationRequest,
  ): Promise<GenerationProviderResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;

    try {
      response = await this.fetchImplementation(responsesUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          store: false,
          max_output_tokens: 2500,
          instructions: systemPolicy,
          input: JSON.stringify({
            selectedOutputType: request.outputType,
            transcript: request.transcript,
          }),
          text: {
            format: {
              type: "json_schema",
              name: `voice_note_${request.outputType}`,
              description: "A transcript-grounded structured voice-note output.",
              strict: true,
              schema: generationResponseSchema(request.outputType),
            },
          },
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) {
        throw generationUnavailableError;
      }
      if (error instanceof TypeError) {
        throw generationUnavailableError;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 || response.status === 403) {
      throw generationConfigurationError;
    }
    if (response.status === 408 || response.status === 429 || response.status >= 500) {
      throw generationUnavailableError;
    }
    if (!response.ok) {
      throw generationConfigurationError;
    }

    const responseBody = await response.json().catch(() => null);
    if (!isRecord(responseBody)) {
      throw invalidGeneratedOutputError;
    }
    if (hasRefusal(responseBody)) {
      throw generationFailedError;
    }
    if (responseBody.status !== "completed") {
      throw invalidGeneratedOutputError;
    }

    const outputText = extractOutputText(responseBody);
    if (!outputText) {
      throw invalidGeneratedOutputError;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText) as unknown;
    } catch {
      throw invalidGeneratedOutputError;
    }
    return parseProviderResult(parsed, request.outputType);
  }
}

function parseProviderResult(
  value: unknown,
  outputType: GenerationRequest["outputType"],
): GenerationProviderResult {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.preview) ||
    !isStringArray(value.warnings) ||
    !isRecord(value.payload) ||
    value.payload.type !== outputType
  ) {
    throw invalidGeneratedOutputError;
  }

  const payload = parsePayload(value.payload, outputType);
  return {
    title: value.title.trim(),
    preview: value.preview.trim(),
    warnings: value.warnings.map((warning) => warning.trim()),
    payload,
  };
}

function parsePayload(
  value: Record<string, unknown>,
  outputType: GenerationRequest["outputType"],
): GeneratedPayload {
  switch (outputType) {
    case "note":
      if (
        !isNonEmptyString(value.summary) ||
        !isNonEmptyStringArray(value.mainPoints) ||
        !isNullableStringArray(value.nextSteps)
      ) {
        throw invalidGeneratedOutputError;
      }
      return {
        type: "note",
        summary: value.summary.trim(),
        mainPoints: trimStrings(value.mainPoints),
        ...(value.nextSteps === null ? {} : { nextSteps: trimStrings(value.nextSteps) }),
      } satisfies NotePayload;
    case "todo":
      if (!Array.isArray(value.tasks) || value.tasks.length === 0) {
        throw invalidGeneratedOutputError;
      }
      return {
        type: "todo",
        tasks: value.tasks.map(parseTodoTask),
      } satisfies TodoPayload;
    case "email":
      if (
        !isNonEmptyString(value.subject) ||
        !isNonEmptyString(value.greeting) ||
        !isNonEmptyString(value.body) ||
        !isNonEmptyString(value.closing)
      ) {
        throw invalidGeneratedOutputError;
      }
      return {
        type: "email",
        subject: value.subject.trim(),
        greeting: value.greeting.trim(),
        body: value.body.trim(),
        closing: value.closing.trim(),
      } satisfies EmailPayload;
    case "journal":
      if (
        !isNonEmptyString(value.entryBody) ||
        !isNullableString(value.mood) ||
        !isNullableString(value.theme) ||
        !isNullableString(value.tomorrowFocus)
      ) {
        throw invalidGeneratedOutputError;
      }
      return {
        type: "journal",
        entryBody: value.entryBody.trim(),
        ...(value.mood === null ? {} : { mood: value.mood.trim() }),
        ...(value.theme === null ? {} : { theme: value.theme.trim() }),
        ...(value.tomorrowFocus === null
          ? {}
          : { tomorrowFocus: value.tomorrowFocus.trim() }),
      } satisfies JournalPayload;
    case "content":
      if (
        !isNonEmptyString(value.hook) ||
        !isNonEmptyString(value.draft) ||
        !isNullableString(value.caption) ||
        !isNullableString(value.cta)
      ) {
        throw invalidGeneratedOutputError;
      }
      return {
        type: "content",
        hook: value.hook.trim(),
        draft: value.draft.trim(),
        ...(value.caption === null ? {} : { caption: value.caption.trim() }),
        ...(value.cta === null ? {} : { cta: value.cta.trim() }),
      } satisfies ContentPayload;
  }
}

function parseTodoTask(value: unknown): TodoTask {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.text) ||
    typeof value.ambiguous !== "boolean" ||
    !isNullablePriority(value.prioritySuggestion) ||
    !isNullableDueDate(value.dueDate)
  ) {
    throw invalidGeneratedOutputError;
  }

  return {
    text: value.text.trim(),
    ...(value.dueDate === null
      ? {}
      : {
          dueDate: {
            text: value.dueDate.text.trim(),
            sourceText: value.dueDate.sourceText.trim(),
          },
        }),
    ...(value.prioritySuggestion === null
      ? {}
      : { prioritySuggestion: value.prioritySuggestion }),
    ambiguous: value.ambiguous,
  };
}

function extractOutputText(response: Record<string, unknown>): string | undefined {
  if (isNonEmptyString(response.output_text)) {
    return response.output_text;
  }
  if (!Array.isArray(response.output)) {
    return undefined;
  }
  for (const item of response.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) {
      continue;
    }
    for (const content of item.content) {
      if (
        isRecord(content) &&
        content.type === "output_text" &&
        isNonEmptyString(content.text)
      ) {
        return content.text;
      }
    }
  }
  return undefined;
}

function hasRefusal(response: Record<string, unknown>): boolean {
  if (!Array.isArray(response.output)) {
    return false;
  }
  return response.output.some(
    (item) =>
      isRecord(item) &&
      Array.isArray(item.content) &&
      item.content.some(
        (content) => isRecord(content) && content.type === "refusal",
      ),
  );
}

function isRetryableError(error: unknown): boolean {
  return error === generationUnavailableError;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return isStringArray(value) && value.length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value);
}

function isNullableStringArray(value: unknown): value is string[] | null {
  return value === null || isNonEmptyStringArray(value);
}

function isNullablePriority(
  value: unknown,
): value is "low" | "medium" | "high" | null {
  return value === null || value === "low" || value === "medium" || value === "high";
}

function isNullableDueDate(
  value: unknown,
): value is { text: string; sourceText: string } | null {
  return (
    value === null ||
    (isRecord(value) &&
      isNonEmptyString(value.text) &&
      isNonEmptyString(value.sourceText))
  );
}

function trimStrings(values: string[]): string[] {
  return values.map((value) => value.trim());
}

async function delay(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
