import type { LLMProvider } from "./types.js";
import { OllamaProvider } from "./ollama.js";
import type { Config } from "../types/index.js";

export type { LLMProvider } from "./types.js";
export { OllamaProvider } from "./ollama.js";

/**
 * Create an LLM provider based on config.
 * Falls back to Ollama if provider is unknown.
 */
export function createProvider(llmConfig: Config["llm"]): LLMProvider {
  switch (llmConfig.provider) {
    case "ollama":
      return new OllamaProvider({
        baseUrl: llmConfig.baseUrl,
        model: llmConfig.model,
      });
    case "openai":
      // TODO: Implement OpenAIProvider
      throw new Error(
        'OpenAI provider is not yet implemented. Please use "ollama" for now.',
      );
    default:
      throw new Error(`Unknown LLM provider: ${llmConfig.provider}`);
  }
}
