import Groq from 'groq-sdk';
import { AIProvider, AIProviderConfig, AIResponse } from './AIProvider';
import { logger } from '../../../utils/logger';

/**
 * Groq AI provider.
 * Known for extremely fast inference.
 */
export class GroqProvider extends AIProvider {
  private client: Groq;

  constructor(config: AIProviderConfig = {}) {
    super(config);
    this.client = new Groq({
      apiKey: this.config.apiKey || process.env.GROQ_API_KEY,
    });
  }

  async generateResponse(systemPrompt: string, userMessage: string, context?: any): Promise<AIResponse> {
    try {
      const model = this.config.model || 'llama-3.1-8b-instant'; // Updated to current Groq model
      logger.info(`[DEBUG] Using Groq model: ${model}`);

      const messages: Groq.Chat.CompletionCreateParams.Message[] = [
        { role: 'system', content: systemPrompt },
        // You can add conversation history from context here if needed
        { role: 'user', content: userMessage },
      ];

      const chatCompletion = await this.client.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const response = chatCompletion.choices[0]?.message?.content || '';
      const tokensUsed = chatCompletion.usage?.total_tokens || 0;

      return {
        response,
        tokensUsed,
        model,
      };
    } catch (error: any) {
      logger.error('Groq API error:', error);
      throw new Error(`GROQ_API_ERROR: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.client.apiKey) {
        logger.warn('Groq API key is not configured.');
        return false;
      }
      // Test the connection by making a small request
      await this.client.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: this.config.model || 'llama-3.1-8b-instant',
        max_tokens: 2,
      });
      return true;
    } catch (error: any) {
      logger.warn(`Groq availability check failed: ${error.message}`);
      return false;
    }
  }
}
