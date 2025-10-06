import { IntentDetector, IntentResult, IntentCategory } from './IntentDetector';
import { AIProvider } from './providers/AIProvider';
import { createAIProvider } from './providers/AIProviderFactory';
import { logger } from '../../utils/logger';
import { promptManager } from './PromptManager';

/**
 * AI response result interface
 */
export interface AIResponseResult {
  response: string;
  tokensUsed: number;
  processingTime: number;
  provider: string;
}

/**
 * Conversation message interface
 */
export interface ConversationMessage {
  message_text: string;
  timestamp?: Date;
  user_id?: string;
}

/**
 * Main AI Agent that orchestrates AI interactions
 * Provides intent detection, response generation, and fallback mechanisms
 */
export class AIAgent {
  private provider: AIProvider;
  private intentDetector: IntentDetector;

  constructor() {
    this.provider = createAIProvider();
    this.intentDetector = new IntentDetector();
    logger.info(`AIAgent initialized with provider: ${this.provider.name}`);
  }

  /**
   * Detect intent from user message
   */
  async detectIntent(message: string): Promise<IntentResult> {
    try {
      // Use the enhanced intent detector
      return await this.intentDetector.detectIntent(message);
    } catch (error: any) {
      logger.error('Error in intent detection:', error.message);
      return this.fallbackIntentDetection(message);
    }
  }

  /**
   * Generate AI response based on message and intent
   */
  async generateResponse(
    message: string,
    intent: IntentResult,
    conversationHistory: ConversationMessage[] = []
  ): Promise<AIResponseResult> {
    try {
      const context = {
        history: conversationHistory.slice(-5).map(conv => ({
          role: 'user' as const,
          content: conv.message_text
        }))
      };

      const result = await this.provider.generateResponse(
        this.buildSystemPrompt(intent.intent),
        message,
        context
      );

      return {
        response: result.response,
        tokensUsed: result.tokensUsed,
        processingTime: 0,
        provider: result.model || this.provider.name
      };
    } catch (error: any) {
      logger.error('Error generating response:', error.message);
      return this.fallbackResponse(intent);
    }
  }

  /**
   * Switch to a different AI provider
   */
  async switchProvider(providerType: string): Promise<boolean> {
    try {
      // For now, create a new provider instance
      // In a more sophisticated implementation, this could reuse existing instances
      this.provider = createAIProvider(providerType);
      logger.info(`Switched to provider: ${this.provider.name}`);
      return true;
    } catch (error: any) {
      logger.error('Failed to switch provider:', error.message);
      return false;
    }
  }

  /**
   * Get status of available providers
   */
  async getProviderStatus(): Promise<any> {
    // This would need to be implemented with a provider testing mechanism
    return {
      current: this.provider.name,
      available: await this.provider.isAvailable()
    };
  }

  /**
   * Get current provider name
   */
  getCurrentProvider(): string {
    return this.provider.name;
  }

  /**
   * Fallback intent detection using keywords
   */
  private fallbackIntentDetection(message: string, responseTime: number = 0): IntentResult {
    const lowerMessage = message.toLowerCase();

    // Greeting detection
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') ||
        lowerMessage.includes('saludos') || lowerMessage.includes('buenas')) {
      return {
        intent: IntentCategory.GREETING,
        confidence: 0.8,
        keywords: ['hola', 'saludo'],
        context: 'Saludo detectado por fallback',
        responseTime
      };
    }

    // Marketing consultation
    if (lowerMessage.includes('marketing') || lowerMessage.includes('estrategia') ||
        lowerMessage.includes('promoción') || lowerMessage.includes('publicidad')) {
      return {
        intent: IntentCategory.MARKETING_HELP,
        confidence: 0.7,
        keywords: ['marketing'],
        context: 'Consulta de marketing detectada por fallback',
        responseTime
      };
    }

    // Sales problems
    if (lowerMessage.includes('ventas') || lowerMessage.includes('vender') ||
        lowerMessage.includes('clientes') || lowerMessage.includes('comprar')) {
      return {
        intent: IntentCategory.SALES_PROBLEM,
        confidence: 0.7,
        keywords: ['ventas'],
        context: 'Problema de ventas detectado por fallback',
        responseTime
      };
    }

    // Social media
    if (lowerMessage.includes('instagram') || lowerMessage.includes('facebook') ||
        lowerMessage.includes('redes') || lowerMessage.includes('social')) {
      return {
        intent: IntentCategory.SOCIAL_MEDIA,
        confidence: 0.7,
        keywords: ['redes'],
        context: 'Consulta de redes sociales detectada por fallback',
        responseTime
      };
    }

    // Default fallback
    return {
      intent: IntentCategory.OTHER,
      confidence: 0.5,
      keywords: [],
      context: 'Intención no identificada - fallback',
      responseTime
    };
  }

  /**
   * Fallback response when AI provider fails
   */
  private fallbackResponse(intent: IntentResult): AIResponseResult {
    const intentType = intent.intent || IntentCategory.OTHER;

    // Use prompt manager for fallback responses
    const fallbackPrompt = promptManager.getFallbackPrompt('aiUnavailable');
    const intentPrompt = promptManager.getIntentPrompt(intentType);

    let response = fallbackPrompt;
    if (intentPrompt) {
      response += `\n\n${intentPrompt}`;
    }

    return {
      response,
      tokensUsed: 0,
      processingTime: 100,
      provider: 'Fallback'
    };
  }
  /**
   * Build system prompt based on intent
   */
  private buildSystemPrompt(intent: string): string {
    return promptManager.buildSystemPrompt(intent);
  }
}
