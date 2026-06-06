import { projectGeneratedOutputBody } from "./outputContracts";
import type { GeneratedOutput, GeneratedPayload, OutputType } from "./types";

type GoldenOutput = GeneratedOutput & {
  sourceTranscript: string;
};

function createGoldenOutput<Type extends OutputType>(
  input: Omit<Extract<GeneratedOutput, { outputType: Type }>, "body"> & {
    sourceTranscript: string;
  },
): Extract<GoldenOutput, { outputType: Type }> {
  return {
    ...input,
    body: projectGeneratedOutputBody(input.payload as GeneratedPayload),
  } as Extract<GoldenOutput, { outputType: Type }>;
}

export const goldenGeneratedOutputs = {
  note: createGoldenOutput({
    id: "golden-note-1",
    outputType: "note",
    title: "Onboarding Review",
    preview: "Review hesitation points and test two onboarding changes.",
    createdAt: "2026-06-06T09:00:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    sourceTranscript:
      "Capture this as a clean note. Review where new users hesitate, then list the two onboarding changes we want to test next week.",
    payload: {
      type: "note",
      summary: "Review where new users hesitate in onboarding.",
      mainPoints: [
        "Identify the points where new users hesitate.",
        "Choose two onboarding changes to test next week.",
      ],
      nextSteps: ["Prepare the two proposed changes for the review."],
    },
  }),
  todo: createGoldenOutput({
    id: "golden-todo-1",
    outputType: "todo",
    title: "Workshop Prep Tasks",
    preview: "Email Jamie, add wireframes, and pull the activation metric.",
    createdAt: "2026-06-06T09:01:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    sourceTranscript:
      "Make this a todo list. Email Jamie by tomorrow, add the onboarding wireframes, and pull last week's activation metric.",
    payload: {
      type: "todo",
      tasks: [
        {
          text: "Email Jamie",
          dueDate: {
            text: "tomorrow",
            sourceText: "tomorrow",
          },
          prioritySuggestion: "high",
        },
        { text: "Add the onboarding wireframes" },
        { text: "Pull last week's activation metric" },
      ],
    },
  }),
  email: createGoldenOutput({
    id: "golden-email-1",
    outputType: "email",
    title: "Thursday Workshop Agenda",
    preview: "Ask Jamie for the agenda and offer to add the wireframes.",
    createdAt: "2026-06-06T09:02:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    sourceTranscript:
      "Write an email to Jamie asking for the Thursday agenda. Say I can add the onboarding wireframes and last week's metrics.",
    payload: {
      type: "email",
      subject: "Thursday workshop agenda",
      greeting: "Hi Jamie,",
      body:
        "Could you send me the agenda for Thursday's workshop? I can add the onboarding wireframes and last week's metrics.",
      closing: "Thanks,\nAlex",
    },
  }),
  journal: createGoldenOutput({
    id: "golden-journal-1",
    outputType: "journal",
    title: "A Clearer Workshop Plan",
    preview: "Narrowing the workshop to one goal made the day feel calmer.",
    createdAt: "2026-06-06T09:03:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    sourceTranscript:
      "Turn this into a journal entry. I felt calmer today after narrowing the workshop to one clear goal and deciding what can wait.",
    payload: {
      type: "journal",
      entryBody:
        "I felt calmer today after narrowing the workshop to one clear goal and deciding what can wait.",
      mood: "Calm",
      theme: "Clarity through focus",
    },
  }),
  content: createGoldenOutput({
    id: "golden-content-1",
    outputType: "content",
    title: "Start Product Workshops With The Journey",
    preview: "Anchor pricing discussions in the customer journey first.",
    createdAt: "2026-06-06T09:04:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    sourceTranscript:
      "Create a LinkedIn post about why product workshops should start with the customer journey before pricing debates.",
    payload: {
      type: "content",
      hook: "Before you debate pricing, show the customer journey.",
      draft:
        "Product workshops are more useful when the room first understands the customer experience. Walk through the journey, identify where value appears, and then discuss pricing with shared context.",
      cta: "What do you cover before a pricing discussion?",
    },
  }),
  todoAmbiguousTiming: createGoldenOutput({
    id: "golden-todo-ambiguous-1",
    outputType: "todo",
    title: "Invoice Follow-Up",
    preview: "Send the invoice after the remaining details are confirmed.",
    createdAt: "2026-06-06T09:05:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: ["The timing for the invoice is unclear, so no due date was added."],
    sourceTranscript: "Send the invoice sometime after the remaining details are confirmed.",
    payload: {
      type: "todo",
      tasks: [
        {
          text: "Send the invoice after the remaining details are confirmed",
          ambiguous: true,
        },
      ],
    },
  }),
} satisfies Record<string, GoldenOutput>;
