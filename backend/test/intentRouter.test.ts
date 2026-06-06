import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { routeOutputIntent } from "../src/intentRouter";
import type { OutputType } from "../src/types";

describe("deterministic MVP intent routing", () => {
  const explicitExamples: [OutputType, string][] = [
    ["note", "Capture this as a clean note about the onboarding review."],
    ["todo", "Make this a todo list: call Jamie and send the invoice."],
    ["email", "Write an email to Jamie asking for the agenda."],
    ["journal", "Turn this into a journal entry about how today felt."],
    ["content", "Create a LinkedIn post from this idea about product workshops."],
  ];

  for (const [outputType, transcript] of explicitExamples) {
    it(`routes an explicit ${outputType} request`, () => {
      const result = routeOutputIntent({ transcript });

      assert.equal(result.suggestedOutputType, outputType);
      assert.equal(result.source, "explicit");
      assert.equal(result.confidence, "high");
      assert.equal(result.uncertain, false);
    });
  }

  it("lets a user-selected output type override spoken intent", () => {
    const result = routeOutputIntent({
      transcript: "Write an email to Jamie asking for the agenda.",
      userSelectedOutputType: "journal",
    });

    assert.equal(result.suggestedOutputType, "journal");
    assert.equal(result.source, "user_selection");
    assert.equal(result.confidence, "high");
  });

  it("infers a todo list from several actionable tasks", () => {
    const result = routeOutputIntent({
      transcript: "I need to call the dentist, buy oat milk, and submit the report.",
    });

    assert.equal(result.suggestedOutputType, "todo");
    assert.equal(result.source, "inference");
    assert.equal(result.uncertain, false);
  });

  it("infers a journal entry from a personal reflection", () => {
    const result = routeOutputIntent({
      transcript: "I felt relieved today after slowing down, and I want to remember that feeling.",
    });

    assert.equal(result.suggestedOutputType, "journal");
    assert.equal(result.source, "inference");
    assert.equal(result.uncertain, false);
  });

  it("returns a safe uncertain note suggestion when signals conflict", () => {
    const result = routeOutputIntent({
      transcript:
        "I need to email Jamie, but this is also a personal reflection about how the launch felt.",
    });

    assert.equal(result.suggestedOutputType, "note");
    assert.equal(result.confidence, "low");
    assert.equal(result.uncertain, true);
    assert.ok(result.warnings.some((warning) => /change type/i.test(warning)));
  });

  it("lets an explicit email request win over journal-like inference signals", () => {
    const result = routeOutputIntent({
      transcript:
        "Write an email to Jamie based on this reflection: I felt relieved after the launch.",
    });

    assert.equal(result.suggestedOutputType, "email");
    assert.equal(result.source, "explicit");
    assert.equal(result.uncertain, false);
  });
});
