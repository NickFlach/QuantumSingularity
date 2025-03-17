/**
 * SINGULARIS PRIME AI Provider Registration
 * 
 * This module registers all available AI providers with the registry.
 */

import { aiProviders } from "./index";
import { OpenAIProvider } from "./openai-provider";
import { FallbackProvider } from "./fallback-provider";

// Register OpenAI provider
aiProviders.register("openai", async () => {
  return new OpenAIProvider();
});

// Register fallback provider
aiProviders.register("fallback", async () => {
  return new FallbackProvider();
});

// Set fallback as the default provider if no OpenAI key is available
if (!process.env.OPENAI_API_KEY) {
  aiProviders.setActiveProvider("fallback");
  console.log("Using fallback AI provider (no OpenAI API key)");
} else {
  aiProviders.setActiveProvider("openai");
  console.log("Using OpenAI as the default AI provider");
}

console.log("AI providers registered");

// Export providers for easier imports
export { OpenAIProvider, FallbackProvider };