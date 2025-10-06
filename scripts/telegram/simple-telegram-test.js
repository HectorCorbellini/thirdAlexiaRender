/**
 * Simple Telegram Bot Test - Send message to yourself
 * Usage: node scripts/simple-telegram-test.js
 */

require('dotenv').config({ path: './backend/.env' });
const TelegramBot = require('node-telegram-bot-api');

/**
 * Simple Telegram bot test
 */
async function testTelegramBot() {
  console.log('🤖 Simple Telegram Bot Test...\n');

  // Get bot token from environment
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log('❌ TELEGRAM_BOT_TOKEN not found in .env');
    console.log('💡 Please add your bot token to backend/.env');
    return;
  }

  console.log('✅ Bot token found, initializing bot...\n');

  // Create bot instance
  const bot = new TelegramBot(botToken, { polling: false });

  try {
    // Test bot connection
    const botInfo = await bot.getMe();
    console.log('🤖 Bot Info:');
    console.log(`   Name: ${botInfo.first_name}`);
    console.log(`   Username: @${botInfo.username}`);
    console.log(`   ID: ${botInfo.id}\n`);

    console.log('✅ Bot connected successfully!\n');

    // Get your chat ID - you'll need to send a message to the bot first
    console.log('📱 To get your chat ID for testing:');
    console.log('   1. Send ANY message to your bot');
    console.log('   2. Check the logs below for your chat ID');
    console.log('   3. Add that ID as TELEGRAM_TEST_CHAT_ID in .env\n');

    console.log('👂 Listening for your message...\n');

    // Set up polling to capture your chat ID
    bot.on('message', async (msg) => {
      console.log('🎯 MESSAGE RECEIVED!');
      console.log(`📱 Your Chat ID: ${msg.chat.id}`);
      console.log(`👤 From: ${msg.from.first_name} (@${msg.from.username})`);
      console.log(`💬 Message: "${msg.text}"`);
      console.log(`⏰ Time: ${new Date(msg.date * 1000)}\n`);

      console.log('✅ Chat ID captured!');
      console.log('💡 Add this to your .env file:');
      console.log(`   TELEGRAM_TEST_CHAT_ID="${msg.chat.id}"`);

      // Stop polling after getting the chat ID
      bot.stopPolling();
      console.log('\n✨ Chat ID capture completed!');
      process.exit(0);
    });

    // Start polling for messages
    await bot.startPolling();
    console.log('🔄 Polling started - send a message to your bot!');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n⏹️  Stopping polling...');
      bot.stopPolling();
      process.exit(0);
    });

    // Auto-stop after 5 minutes
    setTimeout(() => {
      console.log('\n⏰ Timeout reached (5 minutes)');
      bot.stopPolling();
      process.exit(0);
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('❌ Error testing bot:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your bot token is correct');
    console.log('2. Check your internet connection');
    console.log('3. Ensure the bot token has proper permissions');
  }
}

/**
 * Send test message to yourself
 */
async function sendTestMessage() {
  console.log('📨 Sending test message...\n');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_TEST_CHAT_ID;

  if (!botToken) {
    console.log('❌ TELEGRAM_BOT_TOKEN not found');
    return;
  }

  if (!chatId) {
    console.log('❌ TELEGRAM_TEST_CHAT_ID not found');
    console.log('💡 Run the chat ID capture first');
    return;
  }

  const bot = new TelegramBot(botToken, { polling: false });

  try {
    console.log(`📱 Sending message to chat ID: ${chatId}`);

    const sentMessage = await bot.sendMessage(chatId, '🎉 Hello from ALEXIA! This is a test message from your Telegram bot integration! 🤖');

    console.log('✅ Message sent successfully!');
    console.log(`📨 Message ID: ${sentMessage.message_id}`);
    console.log('📱 Check your phone - you should receive the message');

  } catch (error) {
    console.error('❌ Error sending message:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--send')) {
    await sendTestMessage();
  } else {
    await testTelegramBot();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testTelegramBot, sendTestMessage };
