import type { GeneratedOutput, LifecyclePreviewState, OutputType } from "../types";

export const outputTypeLabels: Record<OutputType, string> = {
  note: "Note",
  todo: "Todo List",
  email: "Email",
  journal: "Journal Entry",
  content: "Content Post",
};

export const mockTranscript =
  "Quick note before Thursday. I want to walk Jamie through the onboarding flow first, then discuss pricing. Ask them to send the agenda by tomorrow so I can add the wireframes and a couple of metrics.";

export const mockRecording = {
  durationLabel: "0:42",
  qualityLabel: "Clear voice detected",
  fileSizeLabel: "820 KB",
};

export const lifecyclePreviewLabels: Record<LifecyclePreviewState, string> = {
  recordingFailed: "Recording failed",
  transcriptionFailed: "Transcription failed",
  generationFailed: "Generation failed",
};

export const mockGeneratedOutput: Record<OutputType, GeneratedOutput> = {
  note: {
    id: "note-1",
    outputType: "note",
    title: "Thursday Workshop Plan",
    createdAt: "2026-06-06T09:00:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    preview: "Open with onboarding flow, then move into pricing discussion.",
    body:
      "Summary\nOpen Thursday's workshop with the new onboarding flow, then move into pricing once the team has context.\n\nMain points\n- Ask Jamie for the agenda by tomorrow.\n- Add wireframes before the workshop.\n- Include a couple of metrics from last week.\n\nNext steps\n- Send Jamie a short request for the agenda.",
    payload: {
      type: "note",
      summary:
        "Open Thursday's workshop with the new onboarding flow, then move into pricing once the team has context.",
      mainPoints: [
        "Ask Jamie for the agenda by tomorrow.",
        "Add wireframes before the workshop.",
        "Include a couple of metrics from last week.",
      ],
      nextSteps: ["Send Jamie a short request for the agenda."],
    },
  },
  todo: {
    id: "todo-1",
    outputType: "todo",
    title: "Workshop Prep Tasks",
    createdAt: "2026-06-06T09:01:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    preview: "Ask for agenda, add wireframes, pull metrics.",
    body:
      "- Ask Jamie to send the workshop agenda (Due: tomorrow, Priority: high)\n- Add onboarding wireframes to the agenda\n- Pull two metrics from last week's onboarding review\n- Prepare a short pricing discussion opener",
    payload: {
      type: "todo",
      tasks: [
        {
          text: "Ask Jamie to send the workshop agenda",
          dueDate: { text: "tomorrow", sourceText: "tomorrow" },
          prioritySuggestion: "high",
        },
        { text: "Add onboarding wireframes to the agenda" },
        { text: "Pull two metrics from last week's onboarding review" },
        { text: "Prepare a short pricing discussion opener" },
      ],
    },
  },
  email: {
    id: "email-1",
    outputType: "email",
    title: "Re: Thursday workshop",
    createdAt: "2026-06-06T09:02:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    preview: "Hi Jamie, quick note before Thursday. I'd love to walk the team through...",
    body:
      "Subject: Thursday workshop agenda\n\nHi Jamie,\n\nQuick note before Thursday. I'd love to walk the team through the new onboarding flow first, then open the floor for the pricing discussion.\n\nIf you can send the agenda by tomorrow, I'll add the wireframes and a couple of metrics from last week.\n\nThanks,\nAlex",
    payload: {
      type: "email",
      subject: "Thursday workshop agenda",
      greeting: "Hi Jamie,",
      body:
        "Quick note before Thursday. I'd love to walk the team through the new onboarding flow first, then open the floor for the pricing discussion.\n\nIf you can send the agenda by tomorrow, I'll add the wireframes and a couple of metrics from last week.",
      closing: "Thanks,\nAlex",
    },
  },
  journal: {
    id: "journal-1",
    outputType: "journal",
    title: "Feeling Clear About The Workshop",
    createdAt: "2026-06-06T09:03:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    preview: "I feel more settled now that the workshop has a shape.",
    body:
      "I feel more settled now that Thursday's workshop has a shape. The main thing is to start with the onboarding flow so the pricing conversation has context instead of feeling abstract.\n\nTheme: Clarity before decisions\n\nTomorrow's focus: Get the agenda from Jamie and add the wireframes while the plan is still fresh.",
    payload: {
      type: "journal",
      entryBody:
        "I feel more settled now that Thursday's workshop has a shape. The main thing is to start with the onboarding flow so the pricing conversation has context instead of feeling abstract.",
      theme: "Clarity before decisions",
      tomorrowFocus:
        "Get the agenda from Jamie and add the wireframes while the plan is still fresh.",
    },
  },
  content: {
    id: "content-1",
    outputType: "content",
    title: "A Better Way To Run Product Workshops",
    createdAt: "2026-06-06T09:04:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    preview: "Start with the user journey before you debate pricing.",
    body:
      "Hook\nBefore you debate pricing, show the user journey.\n\nDraft\nA lot of product workshops jump straight to business questions. The better move is to anchor the room in the actual customer experience first.\n\nShow the onboarding flow. Walk through the moments where value appears. Then talk pricing with shared context.\n\nCTA\nWhat do you always cover before a pricing discussion?",
    payload: {
      type: "content",
      hook: "Before you debate pricing, show the user journey.",
      draft:
        "A lot of product workshops jump straight to business questions. The better move is to anchor the room in the actual customer experience first.\n\nShow the onboarding flow. Walk through the moments where value appears. Then talk pricing with shared context.",
      cta: "What do you always cover before a pricing discussion?",
    },
  },
};

export const historyItems: GeneratedOutput[] = [
  mockGeneratedOutput.email,
  {
    id: "todo-2",
    outputType: "todo",
    title: "Grocery Run",
    createdAt: "2026-06-06T08:00:00.000Z",
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: [],
    preview: "Oat milk, sourdough, tomatoes, parmesan, lemons.",
    body: "- Buy oat milk\n- Pick up sourdough\n- Get tomatoes, parmesan, and lemons\n- Check if there is coffee at home",
    payload: {
      type: "todo",
      tasks: [
        { text: "Buy oat milk" },
        { text: "Pick up sourdough" },
        { text: "Get tomatoes, parmesan, and lemons" },
        { text: "Check if there is coffee at home" },
      ],
    },
  },
  {
    id: "note-2",
    outputType: "note",
    title: "Standup Notes",
    createdAt: "2026-06-05T09:00:00.000Z",
    createdAtLabel: "Yesterday",
    schemaVersion: "1.0",
    warnings: [],
    preview: "Shipped onboarding polish. Blocked on auth handoff.",
    body:
      "Summary\nShipped onboarding polish and identified the auth handoff blocker.\n\nMain points\n- Finished onboarding polish.\n- Tightened the permission copy.\n- Waiting on auth handoff.\n\nNext steps\n- Pair with backend on the mock generation endpoint.",
    payload: {
      type: "note",
      summary: "Shipped onboarding polish and identified the auth handoff blocker.",
      mainPoints: [
        "Finished onboarding polish.",
        "Tightened the permission copy.",
        "Waiting on auth handoff.",
      ],
      nextSteps: ["Pair with backend on the mock generation endpoint."],
    },
  },
  {
    id: "journal-2",
    outputType: "journal",
    title: "Morning Pages",
    createdAt: "2026-06-05T08:00:00.000Z",
    createdAtLabel: "Yesterday",
    schemaVersion: "1.0",
    warnings: [],
    preview: "The studio felt quieter today, which made it easier to think.",
    body:
      "The studio felt quieter today, which made it easier to think. I noticed I was less rushed when I started with one concrete task instead of opening every thread at once.\n\nTheme: Quieter inputs, better decisions",
    payload: {
      type: "journal",
      entryBody:
        "The studio felt quieter today, which made it easier to think. I noticed I was less rushed when I started with one concrete task instead of opening every thread at once.",
      theme: "Quieter inputs, better decisions",
    },
  },
];
