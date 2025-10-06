// src/services/messaging/providerFactory.ts

import { MessagingProvider } from './MessagingProvider';
import { WhatsAppProvider } from './WhatsAppProvider';
import { TelegramProvider } from './TelegramProvider';
import { logger } from '../../utils/logger';

/**
 * Factory for creating an instance of the messaging provider based on configuration.
 * @param platform - Optional platform override (defaults to env variable)
 * @param config - Optional configuration override
 * @returns {MessagingProvider} An instance of a messaging provider.
 */
export function createMessagingProvider(platform?: string, config?: any): MessagingProvider {
  const selectedPlatform = platform || process.env.MESSAGING_PLATFORM || 'whatsapp';

  logger.info(`Selected messaging platform: ${selectedPlatform}`);

  switch (selectedPlatform.toLowerCase()) {
    case 'whatsapp':
      return new WhatsAppProvider();

    case 'telegram':
      // Enhanced Telegram provider with configuration
      const telegramConfig = config || {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
        polling: process.env.TELEGRAM_POLLING !== 'false', // Default to true
        pollingInterval: parseInt(process.env.TELEGRAM_POLLING_INTERVAL || '30000')
      };
      return new TelegramProvider(telegramConfig);

    default:
      logger.error(`Unsupported messaging platform: '${selectedPlatform}'. Using WhatsApp as fallback.`);
      return new WhatsAppProvider();
  }
}

/**
 * Get available messaging platforms
 */
export function getAvailablePlatforms(): string[] {
  return ['whatsapp', 'telegram'];
}

/**
 * Check if a platform is supported
 */
export function isPlatformSupported(platform: string): boolean {
  return getAvailablePlatforms().includes(platform.toLowerCase());
}

/**
 * Get platform configuration requirements
 */
export function getPlatformConfig(platform: string): any {
  switch (platform.toLowerCase()) {
    case 'whatsapp':
      return {
        required: ['WHATSAPP_TOKEN', 'WHATSAPP_VERIFY_TOKEN'],
        optional: ['WHATSAPP_WEBHOOK_URL']
      };

    case 'telegram':
      return {
        required: ['TELEGRAM_BOT_TOKEN'],
        optional: ['TELEGRAM_WEBHOOK_URL', 'TELEGRAM_POLLING', 'TELEGRAM_POLLING_INTERVAL']
      };

    default:
      return { required: [], optional: [] };
  }
}
