export type RecordingUploadPlatform = "web" | "native";

export type RecordingUploadFormat = {
  extension: "m4a" | "mp4" | "wav" | "webm" | "mp3" | "mpeg" | "mpga";
  filename: string;
  mimeType: string;
};

type RecordingFormatInput = {
  platform: RecordingUploadPlatform;
  uri: string;
  mimeType?: string;
};

const supportedExtensions = new Set<RecordingUploadFormat["extension"]>([
  "m4a",
  "mp4",
  "wav",
  "webm",
  "mp3",
  "mpeg",
  "mpga",
]);

export function resolveRecordingUploadFormat(
  input: RecordingFormatInput,
): RecordingUploadFormat {
  if (input.platform === "native") {
    const rawName = filenameFromUri(input.uri);
    return {
      extension: "m4a",
      filename: hasExtension(rawName, "m4a") ? rawName : "recording.m4a",
      mimeType: "audio/mp4",
    };
  }

  const extension =
    extensionForMimeType(input.mimeType) ??
    extensionFromUri(input.uri) ??
    "webm";
  const rawName = filenameFromUri(input.uri);

  return {
    extension,
    filename: hasExtension(rawName, extension) ? rawName : `recording.${extension}`,
    mimeType: mimeTypeForExtension(extension),
  };
}

function filenameFromUri(uri: string): string {
  const path = uri.split(/[?#]/, 1)[0];
  return path.slice(path.lastIndexOf("/") + 1);
}

function extensionFromUri(
  uri: string,
): RecordingUploadFormat["extension"] | undefined {
  const rawName = filenameFromUri(uri);
  const extension = rawName.includes(".")
    ? rawName.split(".").pop()?.toLowerCase()
    : undefined;
  return extension && supportedExtensions.has(extension as RecordingUploadFormat["extension"])
    ? extension as RecordingUploadFormat["extension"]
    : undefined;
}

function extensionForMimeType(
  mimeType: string | undefined,
): RecordingUploadFormat["extension"] | undefined {
  switch (mimeType?.toLowerCase().split(";", 1)[0].trim()) {
    case "audio/mp4":
    case "audio/m4a":
    case "audio/x-m4a":
    case "video/mp4":
      return "m4a";
    case "audio/wav":
    case "audio/x-wav":
      return "wav";
    case "audio/webm":
    case "video/webm":
      return "webm";
    case "audio/mpeg":
    case "audio/mp3":
      return "mp3";
    default:
      return undefined;
  }
}

function mimeTypeForExtension(
  extension: RecordingUploadFormat["extension"],
): string {
  switch (extension) {
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "wav":
      return "audio/wav";
    case "webm":
      return "audio/webm";
    case "mp3":
    case "mpeg":
    case "mpga":
      return "audio/mpeg";
  }
}

function hasExtension(
  filename: string,
  extension: RecordingUploadFormat["extension"],
): boolean {
  return filename.toLowerCase().endsWith(`.${extension}`);
}
