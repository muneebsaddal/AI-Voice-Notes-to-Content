import { goldenGeneratedOutputs } from "./goldenFixtures";
import type { GeneratedOutput, OutputType } from "./types";

export const mockTranscript =
  "Quick note before Thursday. I want to walk Jamie through the onboarding flow first, then discuss pricing. Ask them to send the agenda by tomorrow so I can add the wireframes and a couple of metrics.";

export const mockTranscriptsByAudioId: Record<string, string> = {
  "mock-audio-1": mockTranscript,
  "mock-audio-note":
    "Capture this as a clean note. The onboarding review should start with where new users hesitate, then list the two changes we want to test next week.",
  "mock-audio-todo":
    "Make this a todo list. Email Jamie, add the onboarding wireframes, pull last week's activation metric, and prep the pricing opener.",
  "mock-audio-journal":
    "Make this a journal entry. I felt calmer today after narrowing the workshop to one clear goal and deciding what can wait.",
  "mock-audio-content":
    "Turn this into a LinkedIn post about why product workshops should start with the customer journey before pricing debates.",
};

export const mockGeneratedOutputs: Record<OutputType, GeneratedOutput> = {
  note: goldenGeneratedOutputs.note,
  todo: goldenGeneratedOutputs.todo,
  email: goldenGeneratedOutputs.email,
  journal: goldenGeneratedOutputs.journal,
  content: goldenGeneratedOutputs.content,
};
