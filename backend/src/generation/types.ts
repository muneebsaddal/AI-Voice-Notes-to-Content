import type { GeneratedPayload, GenerationRequest } from "../types";

export type GenerationProviderResult = {
  title: string;
  preview: string;
  warnings: string[];
  payload: GeneratedPayload;
};

export type GenerationProvider = {
  readonly name: "local" | "openai";
  generate(request: GenerationRequest): Promise<GenerationProviderResult>;
};
