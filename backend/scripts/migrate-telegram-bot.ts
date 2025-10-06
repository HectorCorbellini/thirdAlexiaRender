import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function migrateTelegramBot() {
  try {
    console.log('🔄 Migrating Telegram bot from .env to database...');

    // Get bot token from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.log('⚠️  No TELEGRAM_BOT_TOKEN found in .env - skipping migration');
      return;
    }

    // Get or create a business
    let business = await prisma.business.findFirst();
    
    if (!business) {
      console.log('📝 Creating default business...');
      business = await prisma.business.create({
        data: {
          name: 'Default Business',
          description: 'Auto-created for Telegram bot migration',
          isActive: true
        }
      });
      console.log(`✅ Created business: ${business.name} (${business.id})`);
    } else {
      console.log(`✅ Using existing business: ${business.name} (${business.id})`);
    }

    // Check if bot already exists
    const existingBot = await prisma.bot.findFirst({
      where: {
        botToken,
        platform: 'TELEGRAM'
      }
    });

    if (existingBot) {
      console.log(`⚠️  Bot already exists in database (${existingBot.id})`);
      return;
    }

    // Create bot configuration
    const config = {
      polling: process.env.TELEGRAM_POLLING !== 'false',
      pollingInterval: parseInt(process.env.TELEGRAM_POLLING_INTERVAL || '30000'),
      webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || undefined
    };

    // Try to get bot username from Telegram API
    let botUsername: string | undefined;
    try {
      const TelegramBot = require('node-telegram-bot-api');
      const tempBot = new TelegramBot(botToken);
      const me = await tempBot.getMe();
      botUsername = me.username;
      console.log(`✅ Retrieved bot username: @${botUsername}`);
    } catch (error) {
      console.log('⚠️  Could not retrieve bot username from Telegram API');
    }

    // Create bot in database
    const bot = await prisma.bot.create({
      data: {
        businessId: business.id,
        platform: 'TELEGRAM',
        botToken,
        botUsername,
        status: 'OFFLINE', // Will be started by BotManager
        config
      }
    });

    console.log(`✅ Successfully migrated Telegram bot to database!`);
    console.log(`   Bot ID: ${bot.id}`);
    console.log(`   Username: @${bot.botUsername || 'unknown'}`);
    console.log(`   Platform: ${bot.platform}`);
    console.log(`   Status: ${bot.status}`);
    console.log('');
    console.log('🎉 Migration complete! The bot will be managed through the dashboard now.');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Restart the backend server');
    console.log('   2. The bot will be loaded from the database');
    console.log('   3. Use the dashboard to start/stop/manage the bot');

  } catch (error) {
    console.error('❌ Error migrating Telegram bot:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateTelegramBot()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
