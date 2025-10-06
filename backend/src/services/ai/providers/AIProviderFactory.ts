import { AIProvider, AIProviderConfig } from './AIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GroqProvider } from './GroqProvider';
import { logger } from '../../../utils/logger';

/**
 * Factory for creating AI provider instances.
 */
export function createAIProvider(providerType?: string): AIProvider {
  const type = providerType || process.env.AI_PROVIDER || 'openai';

  const config: AIProviderConfig = {
    apiKey: process.env[`${type.toUpperCase()}_API_KEY`],
    model: process.env[`${type.toUpperCase()}_MODEL`],
  };

  logger.info(`Initializing AI provider: ${type}`);

  switch (type.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'groq':
      return new GroqProvider(config);
    // Add other providers like HuggingFace here
    default:
      logger.warn(`Unknown AI provider type: ${type}. Falling back to OpenAI.`);
      return new OpenAIProvider(config);
  }
}
