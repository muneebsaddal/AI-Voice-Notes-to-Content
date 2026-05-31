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
  playbackAvailable: "Playback ready",
  transcriptionFailed: "Transcription failed",
  generationFailed: "Generation failed",
};

export const mockGeneratedOutput: Record<OutputType, GeneratedOutput> = {
  note: {
    id: "note-1",
    outputType: "note",
    title: "Thursday Workshop Plan",
    createdAtLabel: "Today",
    preview: "Open with onboarding flow, then move into pricing discussion.",
    body:
      "Summary\nOpen Thursday's workshop with the new onboarding flow, then move into pricing once the team has context.\n\nMain points\n- Ask Jamie for the agenda by tomorrow.\n- Add wireframes before the workshop.\n- Include a couple of metrics from last week.\n\nNext step\nSend Jamie a short request for the agenda.",
  },
  todo: {
    id: "todo-1",
    outputType: "todo",
    title: "Workshop Prep Tasks",
    createdAtLabel: "Today",
    preview: "Ask for agenda, add wireframes, pull metrics.",
    body:
      "- Ask Jamie to send the workshop agenda by tomorrow.\n- Add onboarding wireframes to the agenda.\n- Pull two metrics from last week's onboarding review.\n- Prepare a short pricing discussion opener.",
  },
  email: {
    id: "email-1",
    outputType: "email",
    title: "Re: Thursday workshop",
    createdAtLabel: "Today",
    preview: "Hi Jamie, quick note before Thursday. I'd love to walk the team through...",
    body:
      "Hi Jamie,\n\nQuick note before Thursday. I'd love to walk the team through the new onboarding flow first, then open the floor for the pricing discussion.\n\nIf you can send the agenda by tomorrow, I'll add the wireframes and a couple of metrics from last week. Happy to keep it to 30 minutes.\n\nThanks,\nAlex",
  },
  journal: {
    id: "journal-1",
    outputType: "journal",
    title: "Feeling Clear About The Workshop",
    createdAtLabel: "Today",
    preview: "I feel more settled now that the workshop has a shape.",
    body:
      "I feel more settled now that Thursday's workshop has a shape. The main thing is to start with the onboarding flow so the pricing conversation has context instead of feeling abstract.\n\nTheme: clarity before decisions.\n\nTomorrow's focus: get the agenda from Jamie and add the wireframes while the plan is still fresh.",
  },
  content: {
    id: "content-1",
    outputType: "content",
    title: "A Better Way To Run Product Workshops",
    createdAtLabel: "Today",
    preview: "Start with the user journey before you debate pricing.",
    body:
      "Hook\nBefore you debate pricing, show the user journey.\n\nDraft\nA lot of product workshops jump straight to business questions. The better move is to anchor the room in the actual customer experience first.\n\nShow the onboarding flow. Walk through the moments where value appears. Then talk pricing with shared context.\n\nCTA\nWhat do you always cover before a pricing discussion?",
  },
};

export const historyItems: GeneratedOutput[] = [
  mockGeneratedOutput.email,
  {
    id: "todo-2",
    outputType: "todo",
    title: "Grocery Run",
    createdAtLabel: "Today",
    preview: "Oat milk, sourdough, tomatoes, parmesan, lemons.",
    body: "- Buy oat milk\n- Pick up sourdough\n- Get tomatoes, parmesan, and lemons\n- Check if there is coffee at home",
  },
  {
    id: "note-2",
    outputType: "note",
    title: "Standup Notes",
    createdAtLabel: "Yesterday",
    preview: "Shipped onboarding polish. Blocked on auth handoff.",
    body: "Shipped\n- Finished onboarding polish.\n- Tightened the permission copy.\n\nBlocked\n- Waiting on auth handoff.\n\nNext\n- Pair with backend on mock generation endpoint.",
  },
  {
    id: "journal-2",
    outputType: "journal",
    title: "Morning Pages",
    createdAtLabel: "Yesterday",
    preview: "The studio felt quieter today, which made it easier to think.",
    body: "The studio felt quieter today, which made it easier to think. I noticed I was less rushed when I started with one concrete task instead of opening every thread at once.\n\nTheme: quieter inputs, better decisions.",
  },
];
