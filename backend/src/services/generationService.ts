import { ApiError } from "../errors";
import { mockGeneratedOutputs } from "../mockData";
import type { GeneratedOutput, GenerationRequest } from "../types";

export async function generateMockOutput(request: GenerationRequest): Promise<GeneratedOutput> {
  if (request.simulate === "generation_failed") {
    throw new ApiError("generation_failed", "Generation failed.", 502);
  }

  return mockGeneratedOutputs[request.outputType];
}
