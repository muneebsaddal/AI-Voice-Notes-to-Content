import type {
  ContentPayload,
  EmailPayload,
  GeneratedOutput,
  GeneratedPayload,
  JournalPayload,
  NotePayload,
  OutputType,
  TodoPayload,
  TodoTask,
} from "./types";

export type OutputValidationResult =
  | { ok: true; value: GeneratedOutput }
  | { ok: false; issues: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalNonEmptyString(value: unknown): value is string | undefined {
  return value === undefined || isNonEmptyString(value);
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function validateNotePayload(value: Record<string, unknown>, issues: string[]): value is NotePayload {
  if (!isNonEmptyString(value.summary)) {
    issues.push("Note summary must be a non-empty string.");
  }
  if (!isNonEmptyStringArray(value.mainPoints)) {
    issues.push("Note main points must contain at least one item.");
  }
  if (value.nextSteps !== undefined && !isNonEmptyStringArray(value.nextSteps)) {
    issues.push("Note next steps must contain non-empty items when provided.");
  }
  return issues.length === 0;
}

function validateTodoTask(
  value: unknown,
  transcript: string | undefined,
  issues: string[],
): value is TodoTask {
  if (!isRecord(value) || !isNonEmptyString(value.text)) {
    issues.push("Todo tasks must have non-empty text.");
    return false;
  }

  if (
    value.prioritySuggestion !== undefined &&
    value.prioritySuggestion !== "low" &&
    value.prioritySuggestion !== "medium" &&
    value.prioritySuggestion !== "high"
  ) {
    issues.push("Todo priority suggestions must be low, medium, or high.");
  }

  if (value.ambiguous !== undefined && typeof value.ambiguous !== "boolean") {
    issues.push("Todo ambiguity flags must be boolean.");
  }

  if (value.dueDate !== undefined) {
    if (
      !isRecord(value.dueDate) ||
      !isNonEmptyString(value.dueDate.text) ||
      !isNonEmptyString(value.dueDate.sourceText)
    ) {
      issues.push("Todo due dates must include text and transcript source text.");
    } else if (
      transcript !== undefined &&
      !transcript.toLocaleLowerCase().includes(value.dueDate.sourceText.toLocaleLowerCase())
    ) {
      issues.push("Todo due date is not grounded in the transcript.");
    }
  }

  return issues.length === 0;
}

function validateTodoPayload(
  value: Record<string, unknown>,
  transcript: string | undefined,
  issues: string[],
): value is TodoPayload {
  if (!Array.isArray(value.tasks) || value.tasks.length === 0) {
    issues.push("Todo payload must contain at least one task.");
    return false;
  }

  value.tasks.forEach((task) => validateTodoTask(task, transcript, issues));
  return issues.length === 0;
}

function validateEmailPayload(value: Record<string, unknown>, issues: string[]): value is EmailPayload {
  for (const field of ["subject", "greeting", "body", "closing"] as const) {
    if (!isNonEmptyString(value[field])) {
      issues.push(`Email ${field} must be a non-empty string.`);
    }
  }
  return issues.length === 0;
}

function validateJournalPayload(
  value: Record<string, unknown>,
  issues: string[],
): value is JournalPayload {
  if (!isNonEmptyString(value.entryBody)) {
    issues.push("Journal entry body must be a non-empty string.");
  }
  for (const field of ["mood", "theme", "tomorrowFocus"] as const) {
    if (!isOptionalNonEmptyString(value[field])) {
      issues.push(`Journal ${field} must be non-empty when provided.`);
    }
  }
  return issues.length === 0;
}

function validateContentPayload(
  value: Record<string, unknown>,
  issues: string[],
): value is ContentPayload {
  if (!isNonEmptyString(value.hook)) {
    issues.push("Content hook must be a non-empty string.");
  }
  if (!isNonEmptyString(value.draft)) {
    issues.push("Content draft must be a non-empty string.");
  }
  for (const field of ["caption", "cta"] as const) {
    if (!isOptionalNonEmptyString(value[field])) {
      issues.push(`Content ${field} must be non-empty when provided.`);
    }
  }
  return issues.length === 0;
}

function validatePayload(
  value: unknown,
  outputType: OutputType,
  transcript: string | undefined,
  issues: string[],
): value is GeneratedPayload {
  if (!isRecord(value) || value.type !== outputType) {
    issues.push("Payload type must match the output type.");
    return false;
  }

  switch (outputType) {
    case "note":
      return validateNotePayload(value, issues);
    case "todo":
      return validateTodoPayload(value, transcript, issues);
    case "email":
      return validateEmailPayload(value, issues);
    case "journal":
      return validateJournalPayload(value, issues);
    case "content":
      return validateContentPayload(value, issues);
  }
}

export function projectGeneratedOutputBody(payload: GeneratedPayload): string {
  switch (payload.type) {
    case "note": {
      const sections = [
        `Summary\n${payload.summary}`,
        `Main points\n${payload.mainPoints.map((point) => `- ${point}`).join("\n")}`,
      ];
      if (payload.nextSteps) {
        sections.push(`Next steps\n${payload.nextSteps.map((step) => `- ${step}`).join("\n")}`);
      }
      return sections.join("\n\n");
    }
    case "todo":
      return payload.tasks
        .map((task) => {
          const details = [
            task.dueDate ? `Due: ${task.dueDate.text}` : undefined,
            task.prioritySuggestion ? `Priority: ${task.prioritySuggestion}` : undefined,
          ].filter((detail): detail is string => detail !== undefined);
          return `- ${task.text}${details.length > 0 ? ` (${details.join(", ")})` : ""}`;
        })
        .join("\n");
    case "email":
      return `Subject: ${payload.subject}\n\n${payload.greeting}\n\n${payload.body}\n\n${payload.closing}`;
    case "journal": {
      const sections = [payload.entryBody];
      if (payload.mood) sections.push(`Mood: ${payload.mood}`);
      if (payload.theme) sections.push(`Theme: ${payload.theme}`);
      if (payload.tomorrowFocus) sections.push(`Tomorrow's focus: ${payload.tomorrowFocus}`);
      return sections.join("\n\n");
    }
    case "content": {
      const sections = [`Hook\n${payload.hook}`, `Draft\n${payload.draft}`];
      if (payload.caption) sections.push(`Caption\n${payload.caption}`);
      if (payload.cta) sections.push(`CTA\n${payload.cta}`);
      return sections.join("\n\n");
    }
  }
}

function sanitizeGeneratedPayload(payload: GeneratedPayload): GeneratedPayload {
  switch (payload.type) {
    case "note":
      return {
        type: "note",
        summary: payload.summary,
        mainPoints: [...payload.mainPoints],
        ...(payload.nextSteps ? { nextSteps: [...payload.nextSteps] } : {}),
      };
    case "todo":
      return {
        type: "todo",
        tasks: payload.tasks.map((task) => ({
          text: task.text,
          ...(task.dueDate
            ? {
                dueDate: {
                  text: task.dueDate.text,
                  sourceText: task.dueDate.sourceText,
                },
              }
            : {}),
          ...(task.prioritySuggestion
            ? { prioritySuggestion: task.prioritySuggestion }
            : {}),
          ...(task.ambiguous !== undefined ? { ambiguous: task.ambiguous } : {}),
        })),
      };
    case "email":
      return {
        type: "email",
        subject: payload.subject,
        greeting: payload.greeting,
        body: payload.body,
        closing: payload.closing,
      };
    case "journal":
      return {
        type: "journal",
        entryBody: payload.entryBody,
        ...(payload.mood ? { mood: payload.mood } : {}),
        ...(payload.theme ? { theme: payload.theme } : {}),
        ...(payload.tomorrowFocus ? { tomorrowFocus: payload.tomorrowFocus } : {}),
      };
    case "content":
      return {
        type: "content",
        hook: payload.hook,
        draft: payload.draft,
        ...(payload.caption ? { caption: payload.caption } : {}),
        ...(payload.cta ? { cta: payload.cta } : {}),
      };
  }
}

export function validateGeneratedOutput(
  input: unknown,
  transcript?: string,
): OutputValidationResult {
  const issues: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, issues: ["Generated output must be an object."] };
  }

  const outputType = input.outputType;
  if (
    outputType !== "note" &&
    outputType !== "todo" &&
    outputType !== "email" &&
    outputType !== "journal" &&
    outputType !== "content"
  ) {
    return { ok: false, issues: ["Generated output has an unsupported output type."] };
  }

  for (const field of ["id", "title", "body", "preview", "createdAt", "createdAtLabel"] as const) {
    if (!isNonEmptyString(input[field])) {
      issues.push(`${field} must be a non-empty string.`);
    }
  }

  if (
    isNonEmptyString(input.createdAt) &&
    Number.isNaN(Date.parse(input.createdAt))
  ) {
    issues.push("createdAt must be an ISO-compatible timestamp.");
  }
  if (input.schemaVersion !== "1.0") {
    issues.push("schemaVersion must be 1.0.");
  }
  if (!isStringArray(input.warnings)) {
    issues.push("warnings must contain only non-empty strings.");
  }

  const payload = input.payload;
  const payloadIssues: string[] = [];
  const payloadIsValid = validatePayload(payload, outputType, transcript, payloadIssues);
  issues.push(...payloadIssues);

  if (
    payloadIsValid &&
    isNonEmptyString(input.body) &&
    input.body !== projectGeneratedOutputBody(payload)
  ) {
    issues.push("Body must match the deterministic payload projection.");
  }

  if (
    payloadIsValid &&
    payload.type === "todo" &&
    payload.tasks.some((task) => task.ambiguous) &&
    isStringArray(input.warnings) &&
    !input.warnings.some((warning) => /ambiguous|unclear|missing|timing/i.test(warning))
  ) {
    issues.push("Ambiguous todo tasks require a plain-language warning.");
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const output = input as GeneratedOutput;

  return {
    ok: true,
    value: {
      id: output.id,
      outputType: output.outputType,
      title: output.title,
      body: output.body,
      preview: output.preview,
      createdAt: output.createdAt,
      createdAtLabel: output.createdAtLabel,
      schemaVersion: output.schemaVersion,
      warnings: [...output.warnings],
      payload: sanitizeGeneratedPayload(output.payload),
    } as GeneratedOutput,
  };
}
