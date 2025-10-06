import express from 'express';
import crypto from 'crypto';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { botManager } from '../services/BotManager';

const router: express.Router = express.Router();

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    logger.warn('Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook message handler
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    logger.info('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    if (body.object === 'whatsapp_business_account' && body.entry && body.entry[0]) {
      // Find the first active WhatsApp bot
      const bot = await prisma.bot.findFirst({
        where: { 
          platform: 'WHATSAPP',
          status: { in: ['ONLINE', 'STARTING'] }
        },
      });

      if (bot) {
        // Delegate the entire payload to the BotManager
        await botManager.handleWebhookPayload(bot.id, body);
      } else {
        logger.warn('No active WhatsApp bot found to handle webhook');
      }
    }

    res.sendStatus(200); // Always respond with 200 OK immediately
  } catch (error) {
    logger.error('Error in WhatsApp webhook:', error);
    res.sendStatus(500);
  }
});


export default router;