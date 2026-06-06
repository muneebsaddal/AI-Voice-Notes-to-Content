export type OutputPresentation =
  | {
      mode: "editable";
      origin: "generation";
    }
  | {
      mode: "readOnly";
      origin: "history";
      historyOffset: number;
    };

export type OutputBackTarget = "listening" | "history";

export function resolveOutputBackTarget(
  presentation: OutputPresentation,
): OutputBackTarget {
  return presentation.origin === "history" ? "history" : "listening";
}

export function canEditOutput(presentation: OutputPresentation): boolean {
  return presentation.mode === "editable";
}
