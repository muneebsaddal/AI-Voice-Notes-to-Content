import type { OutputType } from "../types";

export type GenerationQualityFixture = {
  id: string;
  caseType: "explicit" | "implicit" | "change-type" | "sparse" | "long";
  selectedType: OutputType;
  transcript: string;
  expectedFacts: string[];
  expectAmbiguityWarning?: boolean;
};

const changeTypeTranscript =
  "Draft an email about Project Atlas, but I changed the output type. Priya owns the launch checklist for Friday.";
const longTranscript =
  "After the Northstar review, Mina confirmed 17 beta invitations for Thursday. The blue prototype still needs the pricing screen, Omar will verify the export flow, and nobody committed to a release date. Keep the uncertainty about timing instead of guessing.";

function fixturesFor(
  selectedType: OutputType,
  explicitTranscript: string,
  implicitTranscript: string,
): GenerationQualityFixture[] {
  return [
    {
      id: `${selectedType}-explicit`,
      caseType: "explicit",
      selectedType,
      transcript: explicitTranscript,
      expectedFacts: factsFor(explicitTranscript),
    },
    {
      id: `${selectedType}-implicit`,
      caseType: "implicit",
      selectedType,
      transcript: implicitTranscript,
      expectedFacts: factsFor(implicitTranscript),
    },
    {
      id: `${selectedType}-change-type`,
      caseType: "change-type",
      selectedType,
      transcript: changeTypeTranscript,
      expectedFacts: ["Project Atlas", "Priya", "Friday"],
    },
    {
      id: `${selectedType}-sparse`,
      caseType: "sparse",
      selectedType,
      transcript: "ZX-42 needs review.",
      expectedFacts: ["ZX-42"],
    },
    {
      id: `${selectedType}-long`,
      caseType: "long",
      selectedType,
      transcript: longTranscript,
      expectedFacts: ["Northstar", "Mina", "17", "Thursday", "blue prototype"],
      ...(selectedType === "todo" ? { expectAmbiguityWarning: true } : {}),
    },
  ];
}

function factsFor(transcript: string): string[] {
  const matches = transcript.match(/\b(?:Priya|Jamie|Mina|Omar|Tuesday|Friday|Thursday|4821|ZX-42)\b/gi);
  return matches?.slice(0, 3) ?? [transcript.split(/\s+/).at(-1)?.replace(/[^\w-]/g, "") ?? "note"];
}

export const generationQualityFixtures: GenerationQualityFixture[] = [
  ...fixturesFor(
    "note",
    "Turn this into a note about Jamie reviewing invoice 4821 on Tuesday.",
    "Jamie reviewed invoice 4821 and will check it again Tuesday.",
  ),
  ...fixturesFor(
    "todo",
    "Make a todo list: ask Priya about invoice 4821 on Friday.",
    "I still need to ask Priya about invoice 4821 before Friday.",
  ),
  ...fixturesFor(
    "email",
    "Write an email to Priya about invoice 4821 for Tuesday.",
    "Priya needs a polite update about invoice 4821 before Tuesday.",
  ),
  ...fixturesFor(
    "journal",
    "Turn this into a journal entry: I felt relieved after Jamie approved ZX-42 Tuesday.",
    "I felt relieved when Jamie approved ZX-42 on Tuesday.",
  ),
  ...fixturesFor(
    "content",
    "Create a content post about Priya launching ZX-42 on Friday.",
    "The useful lesson from Priya's ZX-42 launch on Friday is to test the smallest promise first.",
  ),
];
