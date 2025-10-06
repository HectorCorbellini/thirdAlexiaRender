import express, { Router } from 'express';
import { prisma } from '../index';
import { botManager } from '../services/BotManager';
import { logger } from '../utils/logger';
import { BotPlatform, BotStatus } from '@prisma/client';

const router: Router = express.Router();

/**
 * GET /api/bots
 * Get all bots for the authenticated user's business
 */
router.get('/', async (req, res) => {
  try {
    const { platform } = req.query;
    
    // TODO: Get businessId from authenticated user
    // For now, get the first business
    const business = await prisma.business.findFirst();
    
    if (!business) {
      return res.status(404).json({ error: 'No business found' });
    }

    const where: any = { businessId: business.id };
    if (platform) {
      where.platform = platform.toString().toUpperCase();
    }

    const bots = await prisma.bot.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(bots);
  } catch (error) {
    logger.error('[Bots API] Error fetching bots:', error);
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
});

/**
 * GET /api/bots/:id
 * Get a specific bot by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bot = await prisma.bot.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(bot);
  } catch (error) {
    logger.error('[Bots API] Error fetching bot:', error);
    res.status(500).json({ error: 'Failed to fetch bot' });
  }
});

/**
 * POST /api/bots
 * Create a new bot
 */
router.post('/', async (req, res) => {
  try {
    const { platform, botToken, webhookUrl, polling, pollingInterval } = req.body;

    if (!platform || !botToken) {
      return res.status(400).json({ error: 'Platform and botToken are required' });
    }

    // TODO: Get businessId from authenticated user
    const business = await prisma.business.findFirst();
    
    if (!business) {
      return res.status(404).json({ error: 'No business found' });
    }

    // Create bot configuration
    const config: any = {};
    if (webhookUrl) config.webhookUrl = webhookUrl;
    if (polling !== undefined) config.polling = polling;
    if (pollingInterval) config.pollingInterval = pollingInterval;

    // Create bot in database
    const bot = await prisma.bot.create({
      data: {
        businessId: business.id,
        platform: platform.toUpperCase() as BotPlatform,
        botToken,
        config,
        status: 'OFFLINE'
      }
    });

    // Try to get bot username from Telegram API
    if (platform.toLowerCase() === 'telegram') {
      try {
        const TelegramBot = require('node-telegram-bot-api');
        const tempBot = new TelegramBot(botToken);
        const me = await tempBot.getMe();
        
        await prisma.bot.update({
          where: { id: bot.id },
          data: { botUsername: me.username }
        });
        
        bot.botUsername = me.username;
      } catch (error) {
        logger.warn('[Bots API] Could not fetch bot username:', error);
      }
    }

    logger.info(`[Bots API] Created bot ${bot.id} for business ${business.id}`);
    res.status(201).json(bot);
  } catch (error) {
    logger.error('[Bots API] Error creating bot:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

/**
 * PATCH /api/bots/:id
 * Update a bot
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { botToken, config } = req.body;

    const updateData: any = {};
    if (botToken) updateData.botToken = botToken;
    if (config) updateData.config = config;

    const bot = await prisma.bot.update({
      where: { id },
      data: updateData
    });

    logger.info(`[Bots API] Updated bot ${id}`);
    res.json(bot);
  } catch (error) {
    logger.error('[Bots API] Error updating bot:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
});

/**
 * DELETE /api/bots/:id
 * Delete a bot
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Stop bot if running
    try {
      await botManager.stopBot(id);
    } catch (error) {
      logger.warn(`[Bots API] Could not stop bot ${id}:`, error);
    }

    // Delete from database
    await prisma.bot.delete({
      where: { id }
    });

    logger.info(`[Bots API] Deleted bot ${id}`);
    res.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    logger.error('[Bots API] Error deleting bot:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
});

/**
 * POST /api/bots/:id/control
 * Control bot lifecycle (start, stop, restart)
 */
router.post('/:id/control', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!['start', 'stop', 'restart'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be start, stop, or restart' });
    }

    logger.info(`[Bots API] ${action} bot ${id}`);

    switch (action) {
      case 'start':
        await botManager.startBot(id);
        break;
      case 'stop':
        await botManager.stopBot(id);
        break;
      case 'restart':
        await botManager.restartBot(id);
        break;
    }

    const bot = await prisma.bot.findUnique({
      where: { id }
    });

    res.json({ message: `Bot ${action} successful`, bot });
  } catch (error) {
    logger.error(`[Bots API] Error controlling bot:`, error);
    res.status(500).json({ error: `Failed to ${req.body.action} bot` });
  }
});

/**
 * GET /api/bots/:id/logs
 * Get bot error logs
 */
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const bot = await prisma.bot.findUnique({
      where: { id },
      select: { errorLog: true }
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Return error log as array of lines
    const logs = bot.errorLog ? bot.errorLog.split('\n').slice(0, Number(limit)) : [];
    
    res.json(logs);
  } catch (error) {
    logger.error('[Bots API] Error fetching bot logs:', error);
    res.status(500).json({ error: 'Failed to fetch bot logs' });
  }
});

export default router;
