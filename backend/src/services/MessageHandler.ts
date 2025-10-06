import { AIAgent } from './ai/AIAgent';
import { Message as PrismaMessage } from '@prisma/client';
import { logger } from '../utils/logger';
import { Message } from './messaging/MessagingProvider';
import { UserService } from './UserService';
import { prisma } from '../index';

export class MessageHandler {
  private aiAgent: AIAgent;
  private userService: UserService;

  constructor() {
    this.aiAgent = new AIAgent();
    this.userService = new UserService();
  }

  public async handleMessage(message: Message): Promise<string> {
    const { chatId, text, userId, userInfo, messageId } = message;

    if (!text) {
      logger.warn('Received a message with no text content.', { chatId });
      return 'I can only process text messages at the moment.';
    }

    try {
      logger.info(`Processing message from ${userInfo?.username || userId}: "${text}"`);

      const user = await this.userService.findOrCreateUser(userId, message.platform, userInfo);
      const conversation = await this.findOrCreateConversation(user.id);

      const conversationHistory = await this.getConversationHistory(conversation.id);

      const intentResult = await this.aiAgent.detectIntent(text);
      logger.info(`Intent detected: ${intentResult.intent} with confidence ${intentResult.confidence}`);

      const aiResponse = await this.aiAgent.generateResponse(text, intentResult, conversationHistory);

      await this.saveConversation(conversation.id, text, aiResponse.response, messageId);

      logger.info(`Sending response to ${userInfo?.username || userId}: "${aiResponse.response}"`);
      return aiResponse.response;

    } catch (error) {
      logger.error('Error handling message:', error);
      return 'I seem to be having some technical difficulties. Please try again in a moment.';
    }
  }

  // User management is now handled by UserService

  private async findOrCreateConversation(userId: string) {
    const existingConversation = await prisma.conversation.findFirst({
      where: { waUserId: userId, status: 'ACTIVE' },
    });

    if (existingConversation) {
      return existingConversation;
    }

    return prisma.conversation.create({
      data: {
        waUserId: userId,
      },
    });
  }

  private async getConversationHistory(conversationId: string) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    // The AI expects a specific format, so we adapt our message model to it.
    return messages.map((msg: PrismaMessage) => ({
      message_text: msg.content,
      timestamp: msg.timestamp,
      // We can add more fields here if the AI agent needs them
    }));
  }

  private async saveConversation(conversationId: string, userMessage: string, aiMessage: string, messageId?: string) {
    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          messageId: messageId || new Date().getTime().toString(),
          content: userMessage,
          direction: 'INBOUND',
        },
      }),
      prisma.message.create({
        data: {
          conversationId,
          messageId: `${messageId || new Date().getTime().toString()}-ai`,
          content: aiMessage,
          direction: 'OUTBOUND',
        },
      }),
    ]);
  }
}
