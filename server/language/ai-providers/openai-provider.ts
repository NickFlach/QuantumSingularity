/**
 * SINGULARIS PRIME OpenAI Provider
 * 
 * This module implements the AIProvider interface for OpenAI's API.
 */

import OpenAI from "openai";
import { AIProvider } from "./index";
import type { AIProviderConfig } from "./index";

export class OpenAIProvider implements AIProvider {
  id = "openai";
  name = "OpenAI";
  description = "Integration with OpenAI API (GPT-4o, DALL-E, etc.)";
  supportsImages = true;
  
  private client: OpenAI | null = null;
  private modelName: string = "gpt-4o"; // Default to gpt-4o which was released May 13, 2024
  private imageModel: string = "dall-e-3";
  
  constructor(config?: AIProviderConfig) {
    this.initialize(config);
  }
  
  private initialize(config?: AIProviderConfig) {
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn("OpenAI API key not provided");
      return;
    }
    
    try {
      this.client = new OpenAI({ 
        apiKey,
        baseURL: config?.baseUrl
      });
      
      if (config?.modelName) {
        this.modelName = config.modelName;
      }
    } catch (error) {
      console.error("Failed to initialize OpenAI client:", error);
      this.client = null;
    }
  }
  
  async isAvailable(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      // Attempt a simple models.list call to verify API access
      await this.client.models.list();
      return true;
    } catch (error) {
      console.warn("OpenAI API not available:", error);
      return false;
    }
  }
  
  async generateText(prompt: string, options?: any): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }
    
    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      
      if (options?.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      
      messages.push({ role: "user", content: prompt });
      
      const response = await this.client.chat.completions.create({
        model: options?.model || this.modelName,
        messages: messages,
        temperature: options?.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options?.maxTokens,
      });
      
      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("OpenAI text generation failed:", error);
      throw error;
    }
  }
  
  async generateJson<T>(prompt: string, options?: any): Promise<T> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }
    
    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      
      if (options?.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      
      messages.push({ role: "user", content: prompt });
      
      const response = await this.client.chat.completions.create({
        model: options?.model || this.modelName,
        messages: messages,
        temperature: options?.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options?.maxTokens,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content) as T;
    } catch (error) {
      console.error("OpenAI JSON generation failed:", error);
      throw error;
    }
  }
  
  async generateImage(prompt: string, options?: any): Promise<{ url: string }> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }
    
    try {
      const response = await this.client.images.generate({
        model: options?.imageModel || this.imageModel,
        prompt,
        n: 1,
        size: options?.size || "1024x1024",
        quality: options?.quality || "standard",
        style: options?.style || "natural"
      });
      
      const url = response.data[0]?.url;
      if (!url) {
        throw new Error("No image URL returned from OpenAI");
      }
      
      return { url };
    } catch (error) {
      console.error("OpenAI image generation failed:", error);
      throw error;
    }
  }
}