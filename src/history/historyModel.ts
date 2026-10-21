import type { OutputDocument, OutputType, SavedHistoryItem } from "../types";

const outputTypes = new Set<OutputType>([
  "note",
  "todo",
  "email",
  "journal",
  "content",
]);

export class HistoryDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HistoryDataError";
  }
}

type CreateHistoryItemOptions = {
  existing?: SavedHistoryItem;
  id?: string;
  now?: Date;
};

function createHistoryId(now: Date): string {
  return `history-${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePreview(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 140);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toSavedHistoryItem(value: unknown): SavedHistoryItem | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;
  const valid =
    isNonEmptyString(item.id) &&
    isNonEmptyString(item.sourceOutputId) &&
    typeof item.outputType === "string" &&
    outputTypes.has(item.outputType as OutputType) &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.body) &&
    typeof item.preview === "string" &&
    isNonEmptyString(item.createdAt) &&
    !Number.isNaN(Date.parse(item.createdAt)) &&
    isNonEmptyString(item.updatedAt) &&
    !Number.isNaN(Date.parse(item.updatedAt));

  if (!valid) {
    return null;
  }

  return {
    id: item.id as string,
    sourceOutputId: item.sourceOutputId as string,
    outputType: item.outputType as OutputType,
    title: item.title as string,
    body: item.body as string,
    preview: item.preview as string,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  };
}

export function createHistoryItem(
  output: OutputDocument,
  options: CreateHistoryItemOptions = {},
): SavedHistoryItem {
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const title = output.title.trim();
  const body = output.body.trim();

  if (!title || !body) {
    throw new Error("Saved outputs require a title and body.");
  }

  return {
    id: options.existing?.id ?? options.id ?? createHistoryId(now),
    sourceOutputId: output.id,
    outputType: output.outputType,
    title,
    body,
    preview: normalizePreview(body),
    createdAt: options.existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export function upsertHistoryItem(
  items: SavedHistoryItem[],
  nextItem: SavedHistoryItem,
): SavedHistoryItem[] {
  return [
    nextItem,
    ...items.filter(
      (item) =>
        item.id !== nextItem.id &&
        item.sourceOutputId !== nextItem.sourceOutputId,
    ),
  ].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  );
}

export function parseHistoryItems(value: string | null): SavedHistoryItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      throw new HistoryDataError("Saved history has an unsupported format.");
    }

    const items = parsed.map(toSavedHistoryItem);
    if (items.some((item) => item === null)) {
      throw new HistoryDataError("Saved history contains an invalid record.");
    }

    return (items as SavedHistoryItem[]).sort(
      (left, right) =>
        Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
    );
  } catch (error) {
    if (error instanceof HistoryDataError) {
      throw error;
    }
    throw new HistoryDataError("Saved history could not be read.");
  }
}

export function formatHistoryDateLabel(
  timestamp: string,
  now = new Date(),
): string {
  const date = new Date(timestamp);
  const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.round(
    (currentDay.getTime() - itemDay.getTime()) / 86_400_000,
  );

  if (dayDifference === 0) return "Today";
  if (dayDifference === 1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear()
      ? { year: "numeric" }
      : {}),
  });
}
