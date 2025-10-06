// src/services/messaging/MessagingProvider.ts

import { logger } from '../../utils/logger';

export interface Message {
  chatId: string;
  text: string;
  userId: string;
  userInfo?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    languageCode?: string;
  };
  platform: string;
  messageId?: string;
  timestamp?: Date;
  messageType?: string;
  metadata?: any;
}

export interface CallbackQuery {
  id: string;
  chatId: string;
  data: string;
  userId: string;
}

export interface MessageOptions {
  replyMarkup?: any;
  parseMode?: string;
  disableWebPagePreview?: boolean;
  replyToMessageId?: string;
}

/**
 * @interface MessagingProvider
 * @description Abstract base class for all messaging platform providers (WhatsApp, Telegram, etc.).
 * Defines the interface that each provider must implement.
 */
export abstract class MessagingProvider {
  protected platform: string;

  constructor(platform: string) {
    this.platform = platform;
    if (this.constructor === MessagingProvider) {
      throw new Error("Abstract class 'MessagingProvider' cannot be instantiated directly.");
    }
  }

  /**
   * Initialize the provider, establish connections and start listening for messages.
   */
  abstract initialize(): Promise<void>;

  /**
   * Stop the provider and clean up resources.
   */
  abstract stop(): Promise<void>;

  /**
   * Send a text message to a chat.
   * @param chatId - The ID of the chat.
   * @param text - The text to send.
   */
  abstract sendMessage(chatId: string, text: string): Promise<boolean>;

  /**
   * Register a handler to be called when a new message is received.
   * @param handler - The function that will process the generic message.
   */
  abstract onMessage(handler: (message: Message) => Promise<void>): void;
  /**
   * (Optional) Send an options keyboard.
   * @param chatId - The ID of the chat.
   * @param text - The text that accompanies the keyboard.
   * @param keyboard - The keyboard definition.
   */
  async sendOptionsKeyboard(chatId: string, text: string, keyboard: any): Promise<boolean> {
    logger.warn(`sendOptionsKeyboard not implemented for ${this.platform}. Sending as plain text.`);
    return this.sendMessage(chatId, text);
  }

  /**
   * Answer a callback query (removes loading state from buttons).
   * @param callbackQueryId - The ID of the callback query to answer.
   */
  abstract answerCallbackQuery?(callbackQueryId: string): Promise<void>;

  /**
   * Get the platform name.
   */
  getPlatform(): string {
    return this.platform;
  }

  /**
   * (Optional) Process an incoming webhook payload.
   * @param payload - The raw payload from the webhook.
   */
  async handleWebhookPayload?(payload: any): Promise<void> {
    logger.warn(`handleWebhookPayload not implemented for ${this.platform}.`);
    return Promise.resolve();
  }
}
