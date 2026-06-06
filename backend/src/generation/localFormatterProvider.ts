import type {
  ContentPayload,
  EmailPayload,
  GeneratedPayload,
  GenerationRequest,
  JournalPayload,
  NotePayload,
  OutputType,
  TodoPayload,
} from "../types";
import type {
  GenerationProvider,
  GenerationProviderResult,
} from "./types";

const instructionPrefixes = [
  /^(?:please\s+)?(?:capture|make|save|turn|write|create|draft)\s+(?:this\s+)?(?:as|into)?\s*(?:a|an)?\s*(?:clean\s+)?(?:note|todo list|to-do list|task list|email|journal entry|content post|linkedin post|instagram post)?\s*[:.,-]?\s*/i,
  /^(?:please\s+)?(?:make|turn)\s+this\s+into\s+(?:a|an)\s+[^.]+[.:,-]\s*/i,
];

export class LocalFormatterProvider implements GenerationProvider {
  readonly name = "local" as const;

  async generate(request: GenerationRequest): Promise<GenerationProviderResult> {
    const content = contentText(request.transcript);
    const payload = buildPayload(request.outputType, request.transcript);
    const warnings = [
      "Created with the local transcript formatter. AI polishing is not configured yet.",
    ];
    if (
      payload.type === "todo" &&
      payload.tasks.some((task) => task.ambiguous)
    ) {
      warnings.push(
        "Some task details are ambiguous, so the formatter kept the uncertainty instead of guessing.",
      );
    }

    return {
      title: titleFrom(content, `New ${request.outputType}`),
      preview: previewFrom(content),
      warnings,
      payload,
    };
  }
}

function normalizeTranscript(transcript: string): string {
  return transcript.replace(/\s+/g, " ").trim();
}

function contentText(transcript: string): string {
  let content = normalizeTranscript(transcript);
  for (const prefix of instructionPrefixes) {
    content = content.replace(prefix, "").trim();
  }
  return content || normalizeTranscript(transcript);
}

function sentenceParts(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences.length > 0 ? sentences : [text];
}

function titleFrom(text: string, fallback: string): string {
  const words = text
    .replace(/[^\p{L}\p{N}'-]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 7);

  if (words.length === 0) {
    return fallback;
  }

  return words
    .map((word) => `${word.charAt(0).toLocaleUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function previewFrom(text: string): string {
  const normalized = normalizeTranscript(text);
  return normalized.length <= 120
    ? normalized
    : `${normalized.slice(0, 117).trimEnd()}...`;
}

function taskParts(text: string): string[] {
  const clauses = text
    .split(/[.;]|\s+(?:and then|then)\s+|,\s+(?=(?:and\s+)?(?:call|send|email|ask|buy|bring|prepare|finish|schedule|review|add|check|submit|write|draft)\b)/i)
    .map((part) => part.replace(/^(?:and\s+)?/i, "").trim())
    .filter((part) => part.length > 1);

  return clauses.length > 0 ? clauses : [text];
}

function buildPayload(outputType: OutputType, transcript: string): GeneratedPayload {
  const content = contentText(transcript);
  const sentences = sentenceParts(content);

  switch (outputType) {
    case "note":
      return {
        type: "note",
        summary: sentences[0],
        mainPoints: sentences,
      } satisfies NotePayload;
    case "todo":
      return {
        type: "todo",
        tasks: taskParts(content).map((text) => ({
          text,
          ...(isAmbiguousTask(text) ? { ambiguous: true } : {}),
        })),
      } satisfies TodoPayload;
    case "email":
      return {
        type: "email",
        subject: titleFrom(content, "Voice Note Follow-Up"),
        greeting: "Hi,",
        body: content,
        closing: "Thanks,",
      } satisfies EmailPayload;
    case "journal":
      return {
        type: "journal",
        entryBody: content,
      } satisfies JournalPayload;
    case "content":
      return {
        type: "content",
        hook: sentences[0],
        draft: content,
      } satisfies ContentPayload;
  }
}

function isAmbiguousTask(text: string): boolean {
  return /\b(?:maybe|sometime|possibly|unclear|not sure|nobody committed|when ready)\b/i.test(
    text,
  );
}
