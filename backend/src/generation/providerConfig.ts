import { LocalFormatterProvider } from "./localFormatterProvider";
import { OpenAIProvider } from "./openAIProvider";
import type { GenerationProvider } from "./types";

type Environment = Record<string, string | undefined>;

const defaultTimeoutMs = 15_000;

export function createGenerationProvider(
  environment: Environment = process.env,
  fetchImplementation?: typeof fetch,
): GenerationProvider {
  const provider = environment.GENERATION_PROVIDER ?? "local";

  if (provider === "local") {
    return new LocalFormatterProvider();
  }
  if (provider === "openai") {
    const apiKey = environment.OPENAI_API_KEY?.trim();
    const model = environment.OPENAI_GENERATION_MODEL?.trim();
    if (!apiKey || !model) {
      throw new Error("OpenAI generation configuration is incomplete.");
    }
    return new OpenAIProvider({
      apiKey,
      model,
      timeoutMs: positiveInteger(
        environment.GENERATION_TIMEOUT_MS,
        defaultTimeoutMs,
        "generation timeout",
      ),
      fetchImplementation,
    });
  }

  throw new Error("Unsupported generation provider configuration.");
}

function positiveInteger(
  value: string | undefined,
  fallback: number,
  label: string,
): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label} configuration.`);
  }
  return parsed;
}
