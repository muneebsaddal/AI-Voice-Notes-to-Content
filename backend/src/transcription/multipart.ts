import { mkdtemp, rm, writeFile } from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";

import {
  audioTooLargeError,
  invalidRequestBodyError,
  unsupportedAudioTypeError,
} from "../errors";

const supportedExtensions = new Set([
  ".m4a",
  ".mp4",
  ".wav",
  ".webm",
  ".mp3",
  ".mpeg",
  ".mpga",
]);
const supportedMimeTypes = new Set([
  "audio/mp4",
  "video/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
]);
const genericMimeTypes = new Set(["application/octet-stream", ""]);

type ParsedPart = {
  name: string;
  filename?: string;
  contentType: string;
  data: Buffer;
};

export type MultipartTranscriptionUpload = {
  filePath: string;
  filename: string;
  mimeType: string;
  durationMs: number;
  language?: string;
  audioId?: string;
  cleanup(): Promise<void>;
};

function getBoundary(contentType: string | undefined): string {
  const match = contentType?.match(
    /^multipart\/form-data\s*;\s*boundary=(?:"([^"]+)"|([^;\s]+))/i,
  );
  const boundary = match?.[1] ?? match?.[2];
  if (!boundary || boundary.length > 200) {
    throw invalidRequestBodyError;
  }
  return boundary;
}

async function readBoundedBody(request: IncomingMessage, maxBytes: number): Promise<Buffer> {
  const contentLength = Number(request.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw audioTooLargeError;
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;
    if (totalBytes > maxBytes) {
      throw audioTooLargeError;
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, totalBytes);
}

function parseDisposition(value: string): { name?: string; filename?: string } {
  const name = value.match(/(?:^|;)\s*name="([^"]*)"/i)?.[1];
  const filename = value.match(/(?:^|;)\s*filename="([^"]*)"/i)?.[1];
  return { name, filename };
}

function parseParts(body: Buffer, boundary: string): ParsedPart[] {
  const firstBoundary = Buffer.from(`--${boundary}`);
  const nextBoundary = Buffer.from(`\r\n--${boundary}`);
  const headerSeparator = Buffer.from("\r\n\r\n");
  const parts: ParsedPart[] = [];
  let cursor = body.indexOf(firstBoundary);

  if (cursor !== 0) {
    throw invalidRequestBodyError;
  }
  cursor += firstBoundary.length;

  while (cursor < body.length) {
    if (body.subarray(cursor, cursor + 2).equals(Buffer.from("--"))) {
      break;
    }
    if (!body.subarray(cursor, cursor + 2).equals(Buffer.from("\r\n"))) {
      throw invalidRequestBodyError;
    }
    cursor += 2;

    const headersEnd = body.indexOf(headerSeparator, cursor);
    if (headersEnd < 0) {
      throw invalidRequestBodyError;
    }
    const headersText = body.subarray(cursor, headersEnd).toString("utf8");
    const headers = new Map<string, string>();
    for (const line of headersText.split("\r\n")) {
      const separator = line.indexOf(":");
      if (separator <= 0) {
        throw invalidRequestBodyError;
      }
      headers.set(
        line.slice(0, separator).trim().toLowerCase(),
        line.slice(separator + 1).trim(),
      );
    }

    const disposition = parseDisposition(headers.get("content-disposition") ?? "");
    if (!disposition.name) {
      throw invalidRequestBodyError;
    }
    const dataStart = headersEnd + headerSeparator.length;
    const dataEnd = body.indexOf(nextBoundary, dataStart);
    if (dataEnd < 0) {
      throw invalidRequestBodyError;
    }

    parts.push({
      name: disposition.name,
      filename: disposition.filename,
      contentType: (headers.get("content-type") ?? "").toLowerCase(),
      data: body.subarray(dataStart, dataEnd),
    });
    cursor = dataEnd + 2 + firstBoundary.length;
  }

  return parts;
}

function singleTextField(parts: ParsedPart[], name: string, required: boolean): string | undefined {
  const matches = parts.filter((part) => part.name === name && part.filename === undefined);
  if (matches.length !== (required ? 1 : Math.min(matches.length, 1))) {
    throw invalidRequestBodyError;
  }
  if (matches.length === 0) {
    return undefined;
  }
  const value = matches[0].data.toString("utf8").trim();
  if (value.length === 0 || value.length > 120) {
    throw invalidRequestBodyError;
  }
  return value;
}

export async function readMultipartTranscriptionUpload(
  request: IncomingMessage,
  maxBytes: number,
): Promise<MultipartTranscriptionUpload> {
  const boundary = getBoundary(request.headers["content-type"]);
  const body = await readBoundedBody(request, maxBytes);
  const parts = parseParts(body, boundary);
  const fileParts = parts.filter((part) => part.filename !== undefined);

  if (fileParts.length !== 1 || fileParts[0].name !== "file" || fileParts[0].data.length === 0) {
    throw invalidRequestBodyError;
  }

  const file = fileParts[0];
  const filename = basename(file.filename ?? "");
  const extension = extname(filename).toLowerCase();
  if (
    !supportedExtensions.has(extension) ||
    (!supportedMimeTypes.has(file.contentType) && !genericMimeTypes.has(file.contentType))
  ) {
    throw unsupportedAudioTypeError;
  }

  const durationValue = singleTextField(parts, "durationMs", true);
  const durationMs = Number(durationValue);
  if (!Number.isSafeInteger(durationMs) || durationMs <= 0) {
    throw invalidRequestBodyError;
  }
  const language = singleTextField(parts, "language", false);
  const audioId = singleTextField(parts, "audioId", false);

  const directory = await mkdtemp(join(tmpdir(), "voice-notes-"));
  const filePath = join(directory, `upload${extension}`);
  try {
    await writeFile(filePath, file.data, { flag: "wx" });
  } catch {
    await rm(directory, { recursive: true, force: true });
    throw invalidRequestBodyError;
  }

  return {
    filePath,
    filename,
    mimeType: file.contentType || "application/octet-stream",
    durationMs,
    language,
    audioId,
    cleanup: async () => {
      await rm(directory, { recursive: true, force: true });
    },
  };
}
