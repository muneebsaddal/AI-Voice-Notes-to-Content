import { ApiError } from "../errors";
import { LocalFormatterProvider } from "../generation/localFormatterProvider";
import type { GenerationProvider } from "../generation/types";
import { mockGeneratedOutputs } from "../mockData";
import { projectGeneratedOutputBody } from "../outputContracts";
import type { GeneratedOutput, GenerationRequest } from "../types";

const localProvider = new LocalFormatterProvider();

export async function generateWithProvider(
  provider: GenerationProvider,
  request: GenerationRequest,
): Promise<GeneratedOutput> {
  if (request.simulate === "generation_failed") {
    throw new ApiError("generation_failed", "Generation failed.", 502);
  }

  if (request.simulate === "invalid_generated_output") {
    return {
      ...mockGeneratedOutputs[request.outputType],
      schemaVersion: "invalid",
    } as unknown as GeneratedOutput;
  }

  const result = await provider.generate(request);
  const createdAt = new Date().toISOString();

  return {
    id: `${provider.name}-${request.outputType}-${Date.now()}`,
    outputType: request.outputType,
    title: result.title,
    body: projectGeneratedOutputBody(result.payload),
    preview: result.preview,
    createdAt,
    createdAtLabel: "Today",
    schemaVersion: "1.0",
    warnings: result.warnings,
    payload: result.payload,
  } as GeneratedOutput;
}

export async function generateMockOutput(
  request: GenerationRequest,
): Promise<unknown> {
  return await generateWithProvider(localProvider, request);
}
