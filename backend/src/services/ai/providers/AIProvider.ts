import { logger } from '../../../utils/logger';

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
}

export interface AIResponse {
  response: string;
  tokensUsed: number;
  model: string;
}

/**
 * Abstract base class for AI providers.
 * Defines the interface that all AI providers must implement.
 */
export abstract class AIProvider {
  protected config: AIProviderConfig;
  readonly name: string;

  constructor(config: AIProviderConfig = {}) {
    this.config = config;
    this.name = this.constructor.name;
  }

  /**
   * Generate a response for the given message and context.
   * @param systemPrompt - The system prompt to guide the AI.
   * @param userMessage - The user's message.
   * @param context - Additional context (e.g., conversation history).
   * @returns A promise that resolves to an AIResponse object.
   */
  abstract generateResponse(systemPrompt: string, userMessage: string, context?: any): Promise<AIResponse>;

  /**
   * Check if the provider is available and properly configured.
   * @returns A promise that resolves to true if the provider is ready.
   */
  async isAvailable(): Promise<boolean> {
    logger.warn(`isAvailable() not implemented for ${this.name}.`);
    return true; // Default to true, subclasses should override
  }

  /**
   * Get usage statistics for this provider.
   * @returns A promise that resolves to an object with usage stats.
   */
  async getUsageStats(): Promise<object> {
    return {
      provider: this.name,
      requests: 0,
      tokensUsed: 0,
      errors: 0,
    };
  }

  /**
   * Clean up any resources if needed.
   */
  async cleanup(): Promise<void> {
    // Optional cleanup method
  }
}
