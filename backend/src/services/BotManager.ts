import { prisma } from '../index';
import { logger } from '../utils/logger';
import { BotPlatform, BotStatus } from '@prisma/client';
import { createMessagingProvider } from './messaging/providerFactory';
import { MessagingProvider, Message } from './messaging/MessagingProvider';
import { MessageHandler } from './MessageHandler';

interface BotInstance {
  id: string;
  provider: MessagingProvider;
  status: BotStatus;
}

export class BotManager {
  private activeBots: Map<string, BotInstance> = new Map();

  /**
   * Load all active bots from database and start them
   */
  async loadBotsFromDatabase(): Promise<void> {
    try {
      logger.info('[BotManager] Loading bots from database...');
      
      const bots = await prisma.bot.findMany({
        where: {
          status: {
            in: ['ONLINE', 'STARTING']
          }
        },
        include: {
          business: true
        }
      });

      logger.info(`[BotManager] Found ${bots.length} active bots`);

      for (const bot of bots) {
        try {
          await this.startBot(bot.id);
        } catch (error) {
          logger.error(`[BotManager] Failed to start bot ${bot.id}:`, error);
          await this.updateBotStatus(bot.id, 'ERROR', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } catch (error) {
      logger.error('[BotManager] Error loading bots from database:', error);
      throw error;
    }
  }

  /**
   * Start a bot by ID
   */
  async startBot(botId: string): Promise<void> {
    try {
      logger.info(`[BotManager] Starting bot ${botId}...`);

      // Check if bot is already running
      if (this.activeBots.has(botId)) {
        logger.warn(`[BotManager] Bot ${botId} is already running`);
        return;
      }

      // Get bot from database
      const bot = await prisma.bot.findUnique({
        where: { id: botId },
        include: { business: true }
      });

      if (!bot) {
        throw new Error(`Bot ${botId} not found`);
      }

      // Update status to STARTING
      await this.updateBotStatus(botId, 'STARTING');

      // Create messaging provider based on platform
      const config = bot.config as any;
      const provider = createMessagingProvider(bot.platform.toLowerCase(), {
        botToken: bot.botToken,
        ...config
      });

      // Initialize provider
      await provider.initialize();

      // Create message handler for this bot
      const messageHandler = new MessageHandler();

      // Register message handler to process incoming messages
      provider.onMessage(async (message: Message) => {
        try {
          const reply = await messageHandler.handleMessage(message);
          if (reply) {
            await provider.sendMessage(message.chatId, reply);
          }
        } catch (error) {
          logger.error(`[BotManager] Error handling message for bot ${botId}:`, error);
        }
      });

      // Store active bot instance
      this.activeBots.set(botId, {
        id: botId,
        provider,
        status: 'ONLINE'
      });

      // Update status to ONLINE
      await this.updateBotStatus(botId, 'ONLINE');

      logger.info(`[BotManager] Bot ${botId} started successfully`);
    } catch (error) {
      logger.error(`[BotManager] Error starting bot ${botId}:`, error);
      await this.updateBotStatus(botId, 'ERROR', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Stop a bot by ID
   */
  async stopBot(botId: string): Promise<void> {
    try {
      logger.info(`[BotManager] Stopping bot ${botId}...`);

      const botInstance = this.activeBots.get(botId);
      if (!botInstance) {
        logger.warn(`[BotManager] Bot ${botId} is not running`);
        return;
      }

      // Update status to STOPPING
      await this.updateBotStatus(botId, 'STOPPING');

      // Stop the provider
      await botInstance.provider.stop();

      // Remove from active bots
      this.activeBots.delete(botId);

      // Update status to OFFLINE
      await this.updateBotStatus(botId, 'OFFLINE');

      logger.info(`[BotManager] Bot ${botId} stopped successfully`);
    } catch (error) {
      logger.error(`[BotManager] Error stopping bot ${botId}:`, error);
      throw error;
    }
  }

  /**
   * Restart a bot by ID
   */
  async restartBot(botId: string): Promise<void> {
    logger.info(`[BotManager] Restarting bot ${botId}...`);
    await this.stopBot(botId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await this.startBot(botId);
  }

  /**
   * Get bot status
   */
  async getBotStatus(botId: string): Promise<BotStatus> {
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { status: true }
    });

    return bot?.status || 'OFFLINE';
  }

  /**
   * Update bot status in database
   */
  private async updateBotStatus(botId: string, status: BotStatus, errorLog?: string): Promise<void> {
    await prisma.bot.update({
      where: { id: botId },
      data: {
        status,
        lastActive: status === 'ONLINE' ? new Date() : undefined,
        errorLog: errorLog || null
      }
    });
  }

  /**
   * Stop all bots (for graceful shutdown)
   */
  async stopAllBots(): Promise<void> {
    logger.info('[BotManager] Stopping all bots...');
    
    const stopPromises = Array.from(this.activeBots.keys()).map(botId => 
      this.stopBot(botId).catch(error => 
        logger.error(`[BotManager] Error stopping bot ${botId}:`, error)
      )
    );

    await Promise.all(stopPromises);
    logger.info('[BotManager] All bots stopped');
  }

  /**
   * Get all active bot instances
   */
  getActiveBots(): string[] {
    return Array.from(this.activeBots.keys());
  }

  /**
   * Handle incoming webhook payload
   */
  async handleWebhookPayload(botId: string, payload: any): Promise<void> {
    const botInstance = this.activeBots.get(botId);
    if (!botInstance) {
      logger.warn(`[BotManager] Received webhook for inactive or non-existent bot ${botId}`);
      return;
    }

    // Delegate payload processing to the provider
    if (botInstance.provider.handleWebhookPayload) {
      await botInstance.provider.handleWebhookPayload(payload);
    } else {
      logger.warn(`[BotManager] Provider for bot ${botId} does not support webhook payloads.`);
    }
  }
}

// Singleton instance
export const botManager = new BotManager();
