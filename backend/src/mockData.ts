import type { GeneratedOutput, OutputType } from "./types";

export const mockTranscript =
  "Quick note before Thursday. I want to walk Jamie through the onboarding flow first, then discuss pricing. Ask them to send the agenda by tomorrow so I can add the wireframes and a couple of metrics.";

export const mockTranscriptsByAudioId: Record<string, { transcript: string; suggestedOutputType: OutputType }> = {
  "mock-audio-1": {
    transcript: mockTranscript,
    suggestedOutputType: "email",
  },
  "mock-audio-note": {
    transcript:
      "Capture this as a clean note. The onboarding review should start with where new users hesitate, then list the two changes we want to test next week.",
    suggestedOutputType: "note",
  },
  "mock-audio-todo": {
    transcript:
      "Make this a todo list. Email Jamie, add the onboarding wireframes, pull last week's activation metric, and prep the pricing opener.",
    suggestedOutputType: "todo",
  },
  "mock-audio-journal": {
    transcript:
      "Make this a journal entry. I felt calmer today after narrowing the workshop to one clear goal and deciding what can wait.",
    suggestedOutputType: "journal",
  },
  "mock-audio-content": {
    transcript:
      "Turn this into a LinkedIn post about why product workshops should start with the customer journey before pricing debates.",
    suggestedOutputType: "content",
  },
};

export const mockGeneratedOutputs: Record<OutputType, GeneratedOutput> = {
  note: {
    id: "mock-note-1",
    outputType: "note",
    title: "Thursday Workshop Plan",
    createdAtLabel: "Today",
    preview: "Open with onboarding flow, then move into pricing discussion.",
    body:
      "Summary\nOpen Thursday's workshop with the new onboarding flow, then move into pricing once the team has context.\n\nMain points\n- Ask Jamie for the agenda by tomorrow.\n- Add wireframes before the workshop.\n- Include a couple of metrics from last week.\n\nNext step\nSend Jamie a short request for the agenda.",
  },
  todo: {
    id: "mock-todo-1",
    outputType: "todo",
    title: "Workshop Prep Tasks",
    createdAtLabel: "Today",
    preview: "Ask for agenda, add wireframes, pull metrics.",
    body:
      "- Ask Jamie to send the workshop agenda by tomorrow.\n- Add onboarding wireframes to the agenda.\n- Pull two metrics from last week's onboarding review.\n- Prepare a short pricing discussion opener.",
  },
  email: {
    id: "mock-email-1",
    outputType: "email",
    title: "Re: Thursday workshop",
    createdAtLabel: "Today",
    preview: "Hi Jamie, quick note before Thursday. I'd love to walk the team through...",
    body:
      "Subject: Thursday workshop agenda\n\nHi Jamie,\n\nQuick note before Thursday. I'd love to walk the team through the new onboarding flow first, then open the floor for the pricing discussion.\n\nIf you can send the agenda by tomorrow, I'll add the wireframes and a couple of metrics from last week.\n\nThanks,\nAlex",
  },
  journal: {
    id: "mock-journal-1",
    outputType: "journal",
    title: "Feeling Clear About The Workshop",
    createdAtLabel: "Today",
    preview: "I feel more settled now that the workshop has a shape.",
    body:
      "I feel more settled now that Thursday's workshop has a shape. The main thing is to start with the onboarding flow so the pricing conversation has context instead of feeling abstract.\n\nTheme: clarity before decisions.\n\nTomorrow's focus: get the agenda from Jamie and add the wireframes while the plan is still fresh.",
  },
  content: {
    id: "mock-content-1",
    outputType: "content",
    title: "A Better Way To Run Product Workshops",
    createdAtLabel: "Today",
    preview: "Start with the user journey before you debate pricing.",
    body:
      "Hook\nBefore you debate pricing, show the user journey.\n\nDraft\nA lot of product workshops jump straight to business questions. The better move is to anchor the room in the actual customer experience first.\n\nShow the onboarding flow. Walk through the moments where value appears. Then talk pricing with shared context.\n\nCTA\nWhat do you always cover before a pricing discussion?",
  },
};
