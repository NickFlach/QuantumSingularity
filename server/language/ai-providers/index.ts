/**
 * SINGULARIS PRIME AI Provider Interface
 * 
 * This module defines a flexible AI provider system that supports multiple AI backends,
 * including OpenAI, local models, and other API-based systems.
 */

// Base interface for all AI providers
export interface AIProvider {
  id: string;
  name: string;
  description: string;
  isAvailable(): Promise<boolean>;
  
  // Core AI capabilities
  generateText(prompt: string, options?: any): Promise<string>;
  generateJson<T>(prompt: string, options?: any): Promise<T>;
  
  // Optional features (provider may not support all)
  supportsImages?: boolean;
  generateImage?(prompt: string, options?: any): Promise<{ url: string }>;
}

// Configuration for providers
export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  modelName?: string;
  [key: string]: any; // Additional provider-specific configuration
}

// Registry of available AI providers
class AIProviderRegistry {
  private providers: Map<string, () => Promise<AIProvider>> = new Map();
  private activeProvider: string | null = null;
  private config: Record<string, AIProviderConfig> = {};

  // Register a provider factory function
  register(id: string, factory: () => Promise<AIProvider>): void {
    this.providers.set(id, factory);
  }

  // Configure a provider
  configure(id: string, config: AIProviderConfig): void {
    this.config[id] = config;
  }

  // Get the configuration for a provider
  getConfig(id: string): AIProviderConfig {
    return this.config[id] || {};
  }

  // Set the active provider
  setActiveProvider(id: string): void {
    if (!this.providers.has(id)) {
      throw new Error(`AI provider '${id}' is not registered`);
    }
    this.activeProvider = id;
  }

  // Get the active provider
  async getActiveProvider(): Promise<AIProvider> {
    if (!this.activeProvider) {
      // Find the first available provider
      const entries = Array.from(this.providers.entries());
      for (const [id, factory] of entries) {
        try {
          const provider = await factory();
          if (await provider.isAvailable()) {
            this.activeProvider = id;
            return provider;
          }
        } catch (error) {
          console.warn(`Provider ${id} failed availability check:`, error);
        }
      }
      throw new Error("No available AI providers found");
    }

    const factory = this.providers.get(this.activeProvider);
    if (!factory) {
      throw new Error(`AI provider '${this.activeProvider}' is not registered`);
    }

    return factory();
  }

  // Get all registered providers
  async getProviders(): Promise<{ id: string; provider: AIProvider; available: boolean }[]> {
    const result = [];
    const entries = Array.from(this.providers.entries());
    for (const [id, factory] of entries) {
      try {
        const provider = await factory();
        const available = await provider.isAvailable();
        result.push({ id, provider, available });
      } catch (error) {
        result.push({ id, provider: null as any, available: false });
      }
    }
    return result;
  }
}

// Singleton instance
export const aiProviders = new AIProviderRegistry();