import type { IntentRoutingResult, OutputType } from "./types";

type RouteOutputIntentInput = {
  transcript: string;
  userSelectedOutputType?: OutputType;
};

const explicitPatterns: Record<OutputType, RegExp[]> = {
  note: [
    /\b(?:capture|make|save|turn|write)\b.{0,24}\b(?:clean\s+)?note\b/i,
    /\b(?:take|create)\s+(?:a\s+)?note\b/i,
  ],
  todo: [
    /\b(?:make|create|turn)\b.{0,24}\b(?:to-?do\s+list|task\s+list|checklist)\b/i,
    /\b(?:list|extract)\s+(?:the\s+)?tasks\b/i,
  ],
  email: [
    /\b(?:write|draft|create|turn)\b.{0,24}\bemail\b/i,
    /\b(?:email draft|draft an email)\b/i,
  ],
  journal: [
    /\b(?:make|write|create|turn)\b.{0,24}\bjournal entry\b/i,
    /\b(?:journal this|daily journal)\b/i,
  ],
  content: [
    /\b(?:make|write|create|turn)\b.{0,30}\b(?:content|social|linkedin|instagram)\s+post\b/i,
    /\b(?:reel script|caption|x thread)\b/i,
  ],
};

const inferencePatterns: Record<OutputType, [RegExp, number][]> = {
  note: [
    [/\b(?:summary|main point|idea|remember this|capture this)\b/i, 2],
  ],
  todo: [
    [/\b(?:i need to|remember to|don't forget to|tasks?|to-?do)\b/i, 2],
    [/\b(?:call|buy|submit|schedule|finish|prepare|send)\b/i, 1],
  ],
  email: [
    [/\b(?:email|message|reply|follow[- ]?up)\b/i, 2],
    [/\bask\b.{0,20}\bto send\b/i, 3],
    [/\b(?:ask|tell|send)\s+(?:him|her|them|[A-Z][a-z]+)\b/, 1],
  ],
  journal: [
    [/\b(?:i felt|i feel|today i|reflection|grateful|my day)\b/i, 2],
    [/\b(?:relieved|anxious|calm|overwhelmed|proud|sad|happy)\b/i, 1],
  ],
  content: [
    [/\b(?:audience|followers|publish|linkedin|instagram|reel|newsletter)\b/i, 2],
    [/\b(?:hook|caption|call to action|cta)\b/i, 1],
  ],
};

function findExplicitIntent(transcript: string): OutputType | undefined {
  let earliest: { outputType: OutputType; index: number } | undefined;

  for (const [outputType, patterns] of Object.entries(explicitPatterns) as [
    OutputType,
    RegExp[],
  ][]) {
    for (const pattern of patterns) {
      const match = pattern.exec(transcript);
      if (match && (!earliest || match.index < earliest.index)) {
        earliest = { outputType, index: match.index };
      }
    }
  }

  return earliest?.outputType;
}

export function routeOutputIntent({
  transcript,
  userSelectedOutputType,
}: RouteOutputIntentInput): IntentRoutingResult {
  if (userSelectedOutputType) {
    return {
      suggestedOutputType: userSelectedOutputType,
      source: "user_selection",
      confidence: "high",
      uncertain: false,
      matchedSignals: [userSelectedOutputType],
      warnings: [],
    };
  }

  const explicitIntent = findExplicitIntent(transcript);
  if (explicitIntent) {
    return {
      suggestedOutputType: explicitIntent,
      source: "explicit",
      confidence: "high",
      uncertain: false,
      matchedSignals: [explicitIntent],
      warnings: [],
    };
  }

  const scores = (Object.entries(inferencePatterns) as [
    OutputType,
    [RegExp, number][],
  ][]).map(([outputType, patterns]) => ({
    outputType,
    score: patterns.reduce(
      (total, [pattern, weight]) => total + (pattern.test(transcript) ? weight : 0),
      0,
    ),
  }));
  const ranked = scores.filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  const matchedSignals = ranked.map(({ outputType }) => outputType);
  const best = ranked[0];
  const runnerUp = ranked[1];

  if (best && best.score >= 2 && (!runnerUp || best.score - runnerUp.score >= 2)) {
    return {
      suggestedOutputType: best.outputType,
      source: "inference",
      confidence: "medium",
      uncertain: false,
      matchedSignals,
      warnings: [],
    };
  }

  return {
    suggestedOutputType: "note",
    source: "default",
    confidence: "low",
    uncertain: true,
    matchedSignals,
    warnings: ["The intended format is unclear. Review the suggestion or choose Change Type."],
  };
}
