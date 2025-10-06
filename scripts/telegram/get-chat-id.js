/**
 * Get Telegram Chat ID - Helper script
 * Usage: node scripts/get-chat-id.js
 */

const { TelegramProvider } = require('../backend/src/services/messaging/TelegramProvider');

/**
 * Get your Telegram chat ID for testing
 */
async function getChatID() {
  console.log('📱 Getting your Telegram Chat ID...\n');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log('❌ TELEGRAM_BOT_TOKEN not found');
    console.log('💡 Please create a bot first and add the token to .env');
    return;
  }

  console.log('✅ Bot token found, initializing...\n');

  const telegramProvider = new TelegramProvider({
    botToken: botToken,
    polling: true,
    pollingInterval: 3000 // Check every 3 seconds
  });

  await telegramProvider.initialize();

  console.log('👂 Listening for your message...\n');
  console.log('📝 Steps to get your chat ID:');
  console.log('1️⃣ Open Telegram on your phone');
  console.log('2️⃣ Find your bot (search for its username)');
  console.log('3️⃣ Send ANY message to your bot');
  console.log('4️⃣ Your chat ID will appear below');
  console.log('5️⃣ Copy the chat ID and add to .env as TELEGRAM_TEST_CHAT_ID\n');

  console.log('⏳ Waiting for your message...\n');

  // Register handler to capture chat ID
  telegramProvider.registerMessageHandler('chat_id_capture', async (message) => {
    console.log('🎯 MESSAGE RECEIVED!');
    console.log(`📱 Your Chat ID: ${message.chatId}`);
    console.log(`👤 From: ${message.userInfo?.firstName || 'Unknown'} (@${message.userInfo?.username || 'unknown'})`);
    console.log(`💬 Message: "${message.text}"`);
    console.log(`⏰ Time: ${message.timestamp}\n`);

    console.log('✅ Chat ID captured successfully!');
    console.log('💡 Add this to your .env file:');
    console.log(`   TELEGRAM_TEST_CHAT_ID=${message.chatId}`);

    // Stop listening after getting the chat ID
    await telegramProvider.cleanup();
    console.log('\n✨ Chat ID capture completed!');
    process.exit(0);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Stopping chat ID capture...');
    await telegramProvider.cleanup();
    console.log('✨ Chat ID capture stopped');
    process.exit(0);
  });

  // Timeout after 5 minutes
  setTimeout(async () => {
    console.log('\n⏰ Timeout reached (5 minutes)');
    console.log('💡 Try again if you need more time');
    await telegramProvider.cleanup();
    process.exit(0);
  }, 5 * 60 * 1000);
}

// Run if called directly
if (require.main === module) {
  getChatID().catch(console.error);
}

module.exports = { getChatID };
