import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  projectGeneratedOutputBody,
  validateGeneratedOutput,
} from "../src/outputContracts";
import { goldenGeneratedOutputs } from "../src/goldenFixtures";

describe("generated output contracts", () => {
  it("validates one golden fixture for every MVP output type", () => {
    for (const output of Object.values(goldenGeneratedOutputs)) {
      const result = validateGeneratedOutput(output);

      assert.equal(result.ok, true);
      assert.equal(output.body, projectGeneratedOutputBody(output.payload));
    }
  });

  it("rejects a payload whose discriminator does not match the envelope", () => {
    const result = validateGeneratedOutput({
      ...goldenGeneratedOutputs.note,
      payload: goldenGeneratedOutputs.email.payload,
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.issues.join(" "), /output type/i);
    }
  });

  it("rejects empty optional fields instead of treating placeholders as data", () => {
    const result = validateGeneratedOutput({
      ...goldenGeneratedOutputs.content,
      payload: {
        ...goldenGeneratedOutputs.content.payload,
        caption: "",
      },
    });

    assert.equal(result.ok, false);
  });

  it("rejects a todo due date that is not grounded in the transcript", () => {
    const result = validateGeneratedOutput(
      {
        ...goldenGeneratedOutputs.todo,
        payload: {
          type: "todo",
          tasks: [
            {
              text: "Send the invoice",
              dueDate: {
                text: "Friday",
                sourceText: "Friday",
              },
            },
          ],
        },
        body: "- Send the invoice (Due: Friday)",
      },
      "Send the invoice when it is ready.",
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.issues.join(" "), /due date/i);
    }
  });

  it("represents unclear timing as ambiguity and a warning without inventing a date", () => {
    const output = goldenGeneratedOutputs.todoAmbiguousTiming;
    const result = validateGeneratedOutput(output, output.sourceTranscript);

    assert.equal(result.ok, true);
    assert.equal(output.payload.type, "todo");
    if (output.payload.type === "todo") {
      assert.equal(output.payload.tasks[0].dueDate, undefined);
      assert.equal(output.payload.tasks[0].ambiguous, true);
    }
    assert.ok(output.warnings.some((warning) => /timing/i.test(warning)));
  });
});
