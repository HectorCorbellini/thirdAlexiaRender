/**
 * Telegram Bot Test Script - Send messages to your phone
 * Usage: node scripts/test-telegram-bot.js
 */

const { TelegramProvider } = require('../backend/src/services/messaging/TelegramProvider');

/**
 * Test Telegram Bot Integration
 */
async function testTelegramBot() {
  console.log('🤖 Testing Telegram Bot Integration...\n');

  try {
    // Get bot token from environment or prompt user
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.log('❌ TELEGRAM_BOT_TOKEN not found in environment');
      console.log('📝 Please add your bot token to backend/.env file');
      console.log('💡 Format: TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz\n');
      return;
    }

    console.log('✅ Bot token found, initializing provider...\n');

    // Create Telegram provider (no polling for testing)
    const telegramProvider = new TelegramProvider({
      botToken: botToken,
      polling: false // Disable polling for manual testing
    });

    // Initialize the provider
    const initialized = await telegramProvider.initialize();
    if (!initialized) {
      console.log('❌ Failed to initialize Telegram provider');
      return;
    }

    console.log('✅ Telegram provider initialized successfully!\n');

    // Get bot information
    const botInfo = await telegramProvider.getBotInfo();
    console.log(`🤖 Bot Info:`);
    console.log(`   Name: ${botInfo.first_name}`);
    console.log(`   Username: @${botInfo.username}`);
    console.log(`   ID: ${botInfo.id}\n`);

    // Test message sending
    console.log('📱 Testing message sending to your phone...\n');

    console.log('💬 What message would you like to send to yourself?');
    console.log('📝 Type your message below and press Enter:\n');

    // Use readline for interactive input
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Your message: ', async (messageText) => {
      if (!messageText.trim()) {
        console.log('❌ No message provided');
        rl.close();
        return;
      }

      try {
        console.log(`\n📨 Sending: "${messageText}"`);

        // For testing, we'll send to the bot owner's chat
        // In real usage, you'd get the chat ID from incoming messages
        const testChatId = process.env.TELEGRAM_TEST_CHAT_ID;

        if (!testChatId) {
          console.log('\n⚠️  No TELEGRAM_TEST_CHAT_ID provided');
          console.log('💡 To get your chat ID:');
          console.log('   1. Send a message to your bot');
          console.log('   2. Check the logs for the chat ID');
          console.log('   3. Add it as TELEGRAM_TEST_CHAT_ID in .env\n');

          // Try to send to bot owner (you need to message the bot first)
          console.log('🔄 Attempting to send to bot owner...');
          console.log('💡 Please send a message to your bot first!\n');
        } else {
          console.log(`📱 Sending to chat ID: ${testChatId}`);

          const success = await telegramProvider.sendMessage(testChatId, messageText);

          if (success) {
            console.log('✅ Message sent successfully!');
            console.log('📱 Check your phone - you should receive the message');
          } else {
            console.log('❌ Failed to send message');
          }
        }

      } catch (error) {
        console.error('❌ Error sending message:', error.message);
      }

      // Test provider statistics
      console.log('\n📊 Provider Statistics:');
      const stats = await telegramProvider.getStatistics();
      console.log(JSON.stringify(stats, null, 2));

      rl.close();

      // Cleanup
      await telegramProvider.cleanup();
      console.log('\n🧹 Provider cleaned up');
      console.log('✨ Telegram bot test completed!');
    });

  } catch (error) {
    console.error('❌ Error testing Telegram bot:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your bot token is correct');
    console.log('2. Check your internet connection');
    console.log('3. Ensure the bot token has proper permissions');
  }
}

/**
 * Interactive message handler for incoming messages
 */
async function handleIncomingMessages() {
  console.log('\n📨 Setting up message handler...\n');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.log('❌ TELEGRAM_BOT_TOKEN required for message handling');
    return;
  }

  const telegramProvider = new TelegramProvider({
    botToken: botToken,
    polling: true, // Enable polling for message handling
    pollingInterval: 5000 // Check every 5 seconds
  });

  await telegramProvider.initialize();

  console.log('👂 Listening for incoming messages...');
  console.log('💬 Send a message to your bot to test!');
  console.log('⏹️  Press Ctrl+C to stop\n');

  // Register message handler
  telegramProvider.registerMessageHandler('test_handler', async (message) => {
    console.log('📨 New message received!');
    console.log(`   From: ${message.userInfo?.firstName || 'Unknown'} (@${message.userInfo?.username || 'unknown'})`);
    console.log(`   Chat ID: ${message.chatId}`);
    console.log(`   Message: "${message.text}"`);
    console.log(`   Platform: ${message.platform}`);
    console.log(`   Timestamp: ${message.timestamp}\n`);

    // Auto-reply for testing
    if (message.text.toLowerCase().includes('hello') || message.text.toLowerCase().includes('hola')) {
      await telegramProvider.sendMessage(
        message.chatId,
        `👋 Hello! I received your message: "${message.text}"\n🤖 This is ALEXIA responding via Telegram!`
      );
      console.log('✅ Auto-reply sent!');
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Stopping message handler...');
    await telegramProvider.cleanup();
    console.log('✨ Message handler stopped');
    process.exit(0);
  });
}

/**
 * Main test function
 */
async function runTelegramTests() {
  const args = process.argv.slice(2);

  if (args.includes('--listen')) {
    // Listen for incoming messages
    await handleIncomingMessages();
  } else {
    // Send test message
    await testTelegramBot();
  }
}

// Run if called directly
if (require.main === module) {
  runTelegramTests().catch(console.error);
}

module.exports = { testTelegramBot, handleIncomingMessages };
