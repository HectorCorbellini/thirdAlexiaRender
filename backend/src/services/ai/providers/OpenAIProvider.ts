import OpenAI from 'openai';
import { AIProvider, AIProviderConfig, AIResponse } from './AIProvider';
import { logger } from '../../../utils/logger';

export class OpenAIProvider extends AIProvider {
  private client: OpenAI;

  constructor(config: AIProviderConfig = {}) {
    super(config);
    this.client = new OpenAI({
      apiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(systemPrompt: string, userMessage: string, context?: any): Promise<AIResponse> {
    try {
      const model = this.config.model || 'gpt-3.5-turbo';

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
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
      logger.error('OpenAI API error:', error);
      throw new Error(`OPENAI_API_ERROR: ${error.message}`);
    }
  }
}
