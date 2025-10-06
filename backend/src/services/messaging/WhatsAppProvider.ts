// src/services/messaging/WhatsAppProvider.ts

import axios from 'axios';
import { MessagingProvider, Message, MessageOptions } from './MessagingProvider';
import { logger } from '../../utils/logger';

export class WhatsAppProvider extends MessagingProvider {
  private accessToken: string;
  private phoneNumberId: string;
  private baseURL: string;
  private messageHandler?: (message: Message) => Promise<void>;

  constructor() {
    super('whatsapp');
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.baseURL = `https://graph.facebook.com/v18.0/${this.phoneNumberId}`;
  }

  async initialize(): Promise<void> {
    logger.info('WhatsApp provider initialized');
  }

  public async stop(): Promise<void> {
    logger.info('[WhatsAppProvider] Stopped');
    return Promise.resolve();
  }

  public onMessage(handler: (message: Message) => Promise<void>): void {
    this.messageHandler = handler;
  }

  public async handleWebhookPayload(payload: any): Promise<void> {
    try {
      const message = this.adaptWebhookMessage(payload);
      if (message && this.messageHandler) {
        await this.messageHandler(message);
      }
    } catch (error) {
      logger.error('Error processing WhatsApp webhook payload:', error);
    }
  }

  async sendMessage(chatId: string, text: string, options?: MessageOptions): Promise<boolean> {
    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        to: chatId,
        type: 'text',
        text: { body: text }
      };

      const response = await axios.post(
        `${this.baseURL}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('WhatsApp message sent successfully:', response.data);
      return true;
    } catch (error: any) {
      logger.error('Error sending WhatsApp message:', error.response?.data || error.message);
      return false;
    }
  }

  async answerCallbackQuery(callbackQueryId: string): Promise<void> {
    logger.info('answerCallbackQuery not applicable for WhatsApp provider');
    return Promise.resolve();
  }

  private adaptWebhookMessage(webhookData: any): Message | null {
    const message = webhookData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) {
      return null;
    }
    const contact = webhookData.entry[0].changes[0].value.contacts[0];
    return {
      chatId: message.from,
      text: message.text?.body || '',
      userId: message.from,
      userInfo: {
        username: contact?.profile?.name,
      },
      platform: 'whatsapp',
      messageId: message.id,
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      messageType: message.type,
      metadata: message,
    };
  }
}

