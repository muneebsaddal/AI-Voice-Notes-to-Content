import { ApiError } from "../errors";
import { mockGeneratedOutputs } from "../mockData";
import type { GenerationRequest } from "../types";

export async function generateMockOutput(request: GenerationRequest): Promise<unknown> {
  if (request.simulate === "generation_failed") {
    throw new ApiError("generation_failed", "Generation failed.", 502);
  }

  if (request.simulate === "invalid_generated_output") {
    return {
      ...mockGeneratedOutputs[request.outputType],
      schemaVersion: "invalid",
    };
  }

  return mockGeneratedOutputs[request.outputType];
}
