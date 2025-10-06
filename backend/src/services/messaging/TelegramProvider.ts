// src/services/messaging/TelegramProvider.ts

import TelegramBot from 'node-telegram-bot-api';
import { MessagingProvider, Message, CallbackQuery, MessageOptions } from './MessagingProvider';
import { logger } from '../../utils/logger';

/**
 * Enhanced Telegram Provider for ALEXIA messaging system
 * Combines existing structure with miniZapia operational features
 */

// Telegram-specific types (enhanced from miniZapia)
interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number;
  text?: string;
  photo?: any[];
  document?: any;
  audio?: any;
  video?: any;
  voice?: any;
  sticker?: any;
  contact?: any;
  location?: any;
  venue?: any;
  reply_to_message?: TelegramMessage;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: any;
  inline_query?: any;
}

interface TelegramResponse<T = any> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
}

export class TelegramProvider extends MessagingProvider {
  private bot: TelegramBot;
  private messageHandler?: (message: Message) => Promise<void>;
  private pollingInterval?: NodeJS.Timeout;
  private webhookUrl?: string;
  private messageHandlers: Map<string, (message: Message) => Promise<void>> = new Map();

  constructor(config?: {
    botToken?: string;
    webhookUrl?: string;
    polling?: boolean;
    pollingInterval?: number;
  }) {
    super('telegram');

    // Use environment variable or provided token
    const token = config?.botToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }

    this.bot = new TelegramBot(token, {
      polling: config?.polling !== false // Default to polling unless explicitly disabled
    });
    this.webhookUrl = config?.webhookUrl;

    // Set up enhanced bot handlers
    this.setupEnhancedBotHandlers();

    // Note: Using built-in polling from node-telegram-bot-api instead of custom polling
    // to avoid 409 conflicts. The built-in polling handles message events via setupEnhancedBotHandlers()
  }

  private setupEnhancedBotHandlers(): void {
    // Enhanced text message handling
    this.bot.on('message', async (msg: TelegramBot.Message) => {
      if (!msg.text) return; // Skip non-text messages for basic handler

      const message = this.convertTelegramMessage(msg);
      if (!message) return;

      // Notify all registered handlers
      for (const [handlerId, handler] of this.messageHandlers) {
        try {
          await handler(message);
        } catch (error: any) {
          logger.error(`Error in Telegram message handler ${handlerId}:`, error);
        }
      }

      // Also call legacy messageHandler if exists
      if (this.messageHandler) {
        try {
          await this.messageHandler(message);
        } catch (error: any) {
          logger.error('Error in legacy Telegram message handler:', error);
        }
      }
    });

    // Enhanced callback query handling
    this.bot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {
      const callbackQuery: CallbackQuery = {
        id: query.id,
        chatId: query.message?.chat.id?.toString() || '',
        data: query.data || '',
        userId: query.from.id.toString()
      };

      const message: Message = {
        chatId: callbackQuery.chatId,
        text: callbackQuery.data,
        userId: callbackQuery.userId,
        platform: 'telegram',
        timestamp: new Date()
      };

      // Notify all registered handlers
      for (const [handlerId, handler] of this.messageHandlers) {
        try {
          await handler(message);
        } catch (error: any) {
          logger.error(`Error in Telegram callback handler ${handlerId}:`, error);
        }
      }

      // Answer the callback query to remove loading state
      try {
        await this.bot.answerCallbackQuery(query.id);
      } catch (error: any) {
        logger.error('Error answering callback query:', error);
      }
    });

    // Handle polling errors with retry logic
    this.bot.on('polling_error', (error: Error) => {
      logger.error('Telegram polling error:', error);

      // Implement exponential backoff for polling errors
      setTimeout(() => {
        logger.info('Retrying Telegram polling...');
        this.bot.startPolling();
      }, 5000);
    });

    // Handle webhook errors
    this.bot.on('webhook_error', (error: Error) => {
      logger.error('Telegram webhook error:', error);
    });
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🔌 Initializing Enhanced Telegram Provider...');

      // Test bot token and get bot info
      const botInfo = await this.bot.getMe();
      logger.info(`✅ Telegram Bot initialized: @${botInfo.username} (${botInfo.first_name})`);

      // Set up webhook if configured
      if (this.webhookUrl) {
        await this.setupWebhook();
      } else {
        logger.info('📡 Telegram polling enabled (no webhook configured)');
      }

    } catch (error: any) {
      logger.error('❌ Telegram initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if Telegram service is available and responding
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Test connectivity with a simple API call
      await this.bot.getMe();
      return true;
    } catch (error: any) {
      logger.error('❌ Telegram service unavailable:', error.message);
      return false;
    }
  }

  onMessage(handler: (message: Message) => Promise<void>): void {
    this.messageHandler = handler;
    logger.info('Telegram message handler registered');
  }

  /**
   * Register enhanced message handler with ID
   */
  registerMessageHandler(handlerId: string, handler: (message: Message) => Promise<void>): void {
    this.messageHandlers.set(handlerId, handler);
    logger.info(`✅ Enhanced Telegram message handler registered: ${handlerId}`);
  }

  /**
   * Unregister message handler
   */
  unregisterMessageHandler(handlerId: string): void {
    this.messageHandlers.delete(handlerId);
    logger.info(`❌ Telegram message handler unregistered: ${handlerId}`);
  }

  async sendMessage(chatId: string, text: string, options?: MessageOptions): Promise<boolean> {
    try {
      const sendOptions: any = {};

      if (options?.replyMarkup) {
        sendOptions.reply_markup = options.replyMarkup;
      }

      if (options?.parseMode) {
        sendOptions.parse_mode = options.parseMode;
      }

      if (options?.disableWebPagePreview) {
        sendOptions.disable_web_page_preview = options.disableWebPagePreview;
      }

      if (options?.replyToMessageId) {
        sendOptions.reply_to_message_id = parseInt(options.replyToMessageId);
      }

      await this.bot.sendMessage(chatId, text, sendOptions);
      logger.info(`✅ Telegram message sent to ${chatId}`);
      return true;
    } catch (error: any) {
      logger.error('❌ Error sending Telegram message:', error.message);
      return false;
    }
  }

  async sendOptionsKeyboard(chatId: string, text: string, keyboard: any): Promise<boolean> {
    try {
      await this.bot.sendMessage(chatId, text, {
        reply_markup: keyboard
      });
      logger.info('✅ Telegram keyboard sent successfully');
      return true;
    } catch (error: any) {
      logger.error('❌ Error sending Telegram keyboard:', error.message);
      return false;
    }
  }

  async answerCallbackQuery(callbackQueryId: string): Promise<void> {
    try {
      await this.bot.answerCallbackQuery(callbackQueryId);
      logger.info('✅ Telegram callback query answered');
    } catch (error: any) {
      logger.error('❌ Error answering Telegram callback query:', error.message);
    }
  }

  /**
   * Enhanced message sending with media support
   */
  async sendMedia(chatId: string, mediaType: 'photo' | 'document' | 'audio' | 'video', mediaUrl: string, caption?: string): Promise<boolean> {
    try {
      let result;

      switch (mediaType) {
        case 'photo':
          result = await this.bot.sendPhoto(chatId, mediaUrl, { caption });
          break;
        case 'document':
          result = await this.bot.sendDocument(chatId, mediaUrl, { caption });
          break;
        case 'audio':
          result = await this.bot.sendAudio(chatId, mediaUrl, { caption });
          break;
        case 'video':
          result = await this.bot.sendVideo(chatId, mediaUrl, { caption });
          break;
        default:
          throw new Error(`Unsupported media type: ${mediaType}`);
      }

      logger.info(`✅ Telegram ${mediaType} sent successfully`);
      return true;
    } catch (error: any) {
      logger.error(`❌ Error sending Telegram ${mediaType}:`, error.message);
      return false;
    }
  }

  /**
   * Convert Telegram message to ALEXIA format with enhanced metadata
   */
  private convertTelegramMessage(msg: TelegramBot.Message): Message | null {
    try {
      if (!msg.text && !msg.photo && !msg.document) {
        return null; // Skip unsupported message types for now
      }

      const chatId = msg.chat.id.toString();
      const userId = msg.from?.id?.toString() || '';

      let content = msg.text || '';
      let messageType = 'text';

      // Handle media messages
      if (msg.photo && msg.photo.length > 0) {
        content = `[Photo: ${msg.photo.length} sizes]`;
        messageType = 'photo';
      } else if (msg.document) {
        content = `[Document: ${msg.document.file_name || 'unnamed'}]`;
        messageType = 'document';
      } else if (msg.audio) {
        content = `[Audio: ${msg.audio.duration || 0}s]`;
        messageType = 'audio';
      } else if (msg.video) {
        content = `[Video: ${msg.video.duration || 0}s]`;
        messageType = 'video';
      }

      return {
        chatId: chatId,
        text: content,
        userId: userId,
        userInfo: {
          username: msg.from?.username,
          firstName: msg.from?.first_name,
          lastName: msg.from?.last_name,
          languageCode: msg.from?.language_code
        },
        platform: 'telegram',
        messageId: msg.message_id?.toString(),
        timestamp: new Date(msg.date * 1000),
        messageType: messageType,
        metadata: {
          telegramMessageId: msg.message_id,
          chatType: msg.chat.type,
          replyToMessage: msg.reply_to_message?.message_id
        }
      };

    } catch (error: any) {
      logger.error('❌ Message conversion failed:', error.message);
      return null;
    }
  }

  /**
   * Set up webhook for Telegram (enhanced)
   */
  private async setupWebhook(): Promise<boolean> {
    try {
      if (!this.webhookUrl) {
        logger.warn('No webhook URL configured');
        return false;
      }

      const response = await this.bot.setWebHook(this.webhookUrl, {
        max_connections: 100,
              });

      logger.info(`✅ Telegram webhook configured: ${this.webhookUrl}`);
      return response;
    } catch (error: any) {
      logger.error('❌ Telegram webhook setup failed:', error.message);
      return false;
    }
  }

  /**
   * Start custom polling with enhanced error handling
   */
  private startCustomPolling(interval: number = 30000): void {
    logger.info(`🔄 Starting enhanced Telegram polling (interval: ${interval}ms)...`);

    this.pollingInterval = setInterval(async () => {
      try {
        const updates = await this.bot.getUpdates({
          timeout: 30,
          allowed_updates: ['message', 'callback_query']
        });

        for (const update of updates) {
          if (update.message) {
            const message = this.convertTelegramMessage(update.message);
            if (message) {
              // Notify all registered handlers
              for (const [handlerId, handler] of this.messageHandlers) {
                try {
                  await handler(message);
                } catch (error: any) {
                  logger.error(`❌ Message handler ${handlerId} failed:`, error.message);
                }
              }
            }
          }
        }

        // Acknowledge processed updates
        if (updates.length > 0) {
          const lastUpdateId = updates[updates.length - 1].update_id;
          await this.bot.getUpdates({ offset: lastUpdateId + 1 });
        }

      } catch (error: any) {
        logger.error('❌ Telegram polling error:', error.message);

        // Implement retry logic with exponential backoff
        if (error.code === 'ETELEGRAM' && error.response?.status === 429) {
          const retryAfter = error.response?.parameters?.retry_after || 30;
          logger.warn(`Rate limited. Retrying in ${retryAfter} seconds...`);
          setTimeout(() => this.startCustomPolling(), retryAfter * 1000);
        }
      }
    }, interval);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
      logger.info('⏹️ Telegram polling stopped');
    }
  }

  /**
   * Get provider statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const botInfo = await this.bot.getMe();

      return {
        provider: 'telegram',
        botName: botInfo.first_name,
        botUsername: botInfo.username,
        status: await this.isAvailable(),
        handlers: this.messageHandlers.size,
        polling: !!this.pollingInterval,
        webhook: !!this.webhookUrl,
        messageCount: 0 // Could be enhanced with counter
      };
    } catch (error: any) {
      logger.error('❌ Get statistics failed:', error.message);
      return {
        provider: 'telegram',
        status: false,
        error: error.message
      };
    }
  }

  async stop(): Promise<void> {
    logger.info('🛑 Stopping Enhanced Telegram provider...');

    this.stopPolling();

    try {
      await this.bot.stopPolling();
      this.bot.closeWebHook?.();
      this.messageHandlers.clear();
      logger.info('✅ Telegram provider stopped successfully');
    } catch (error: any) {
      logger.error('❌ Error stopping Telegram provider:', error.message);
    }
  }
}
