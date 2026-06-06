import { mockTranscript } from "../mockData";
import type { TranscriptionProvider } from "./types";

export class MockTranscriptionProvider implements TranscriptionProvider {
  readonly name = "mock";

  async transcribe() {
    return {
      text: mockTranscript,
      language: "en",
    };
  }

  async isReady() {
    return true;
  }
}
