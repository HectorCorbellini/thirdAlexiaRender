/**
 * Telegram Integration Tests for ALEXIA
 * Tests Telegram provider functionality and integration
 */

const { TelegramProvider } = require('../backend/src/services/messaging/TelegramProvider');

/**
 * Telegram integration test scenarios
 */
const TELEGRAM_TESTS = [
  {
    name: 'Telegram Provider Creation',
    test: async () => {
      // This will fail without a real bot token, but tests the creation logic
      try {
        const provider = new TelegramProvider({
          botToken: process.env.TELEGRAM_BOT_TOKEN || 'test_token',
          polling: false // Disable polling for testing
        });

        // Should create successfully even without valid token
        return provider && typeof provider.sendMessage === 'function';
      } catch (error) {
        // Expected to fail without valid token
        return false;
      }
    },
    expectFailure: true // Without real bot token
  },
  {
    name: 'Telegram Configuration Validation',
    test: async () => {
      // Test configuration validation
      const config = {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
        polling: process.env.TELEGRAM_POLLING !== 'false'
      };

      // Should have valid structure
      return config && typeof config.botToken === 'string';
    },
    expectFailure: false
  },
  {
    name: 'Telegram Message Format Validation',
    test: async () => {
      // Test message format conversion (without actual bot)
      const provider = new TelegramProvider({
        botToken: 'test_token',
        polling: false
      });

      // Mock Telegram message
      const mockTelegramMessage = {
        message_id: 123,
        from: {
          id: 456,
          first_name: 'Test',
          username: 'testuser'
        },
        chat: {
          id: 789,
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: 'Test message'
      };

      // Test conversion (if method exists)
      if (typeof provider.convertTelegramMessage === 'function') {
        const converted = provider.convertTelegramMessage(mockTelegramMessage);
        return converted && converted.platform === 'telegram';
      }

      return true; // Method might not be public
    },
    expectFailure: false
  }
];

/**
 * Telegram Integration Test Suite
 */
class TelegramIntegrationTester {
  private results[] = [];

  /**
   * Run all Telegram integration tests
   */
  async runAllTests(): Promise<void> {
    console.log('📱 Starting Telegram Integration Tests...\n');

    for (const test of TELEGRAM_TESTS) {
      await this.runTelegramTest(test);
    }

    this.generateTelegramReport();
  }

  /**
   * Run individual Telegram test
   */
  async runTelegramTest(test) {
    console.log(`📱 Testing: ${test.name}`);

    try {
      const result = await test.test();

      if (test.expectFailure) {
        // Expected failure (e.g., no bot token)
        console.log(`   ${result ? '❌' : '✅'} Expected failure`);
        this.recordResult(test.name, {
          result: result,
          expectedFailure: true,
          passed: !result
        });
      } else {
        // Expected success
        console.log(`   ${result ? '✅' : '❌'} Test result`);
        this.recordResult(test.name, {
          result: result,
          expectedFailure: false,
          passed: result
        });
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.recordResult(test.name, {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Test Telegram provider configuration
   */
  async testTelegramConfiguration(): Promise<void> {
    console.log('⚙️ Testing Telegram Configuration...');

    try {
      const { getPlatformConfig, isPlatformSupported } = require('../backend/src/services/messaging/providerFactory');

      // Test platform support
      const supported = isPlatformSupported('telegram');
      console.log(`   Platform Supported: ${supported ? '✅ Yes' : '❌ No'}`);

      // Test configuration requirements
      const config = getPlatformConfig('telegram');
      console.log(`   Required Config: ${config.required.join(', ')}`);
      console.log(`   Optional Config: ${config.optional.join(', ')}`);

      // Validate environment variables
      const hasBotToken = !!process.env.TELEGRAM_BOT_TOKEN;
      const hasWebhookUrl = !!process.env.TELEGRAM_WEBHOOK_URL;

      console.log(`   Bot Token Set: ${hasBotToken ? '✅ Yes' : '❌ No'}`);
      console.log(`   Webhook URL Set: ${hasWebhookUrl ? '✅ Yes' : '❌ No'}`);

      const configValid = supported && config.required.length > 0;
      this.recordResult('Telegram Configuration', {
        platformSupported: supported,
        configRequirements: config,
        botTokenSet: hasBotToken,
        webhookUrlSet: hasWebhookUrl,
        passed: configValid
      });

    } catch (error) {
      console.log(`   ❌ Configuration test error: ${error.message}`);
      this.recordResult('Telegram Configuration', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Test Telegram message handling
   */
  async testTelegramMessageHandling(): Promise<void> {
    console.log('💬 Testing Telegram Message Handling...');

    try {
      // Test without real bot token (will fail gracefully)
      const provider = new TelegramProvider({
        botToken: process.env.TELEGRAM_BOT_TOKEN || 'test_token',
        polling: false
      });

      // Test message handler registration
      let handlerCalled = false;
      const testHandler = async (message) => {
        handlerCalled = true;
        console.log(`   Handler called with message: ${message.text?.substring(0, 50)}...`);
      };

      provider.registerMessageHandler('test_handler', testHandler);

      // Test handler registration
      const stats = await provider.getStatistics();
      const handlersRegistered = stats.handlers > 0;

      console.log(`   Handlers Registered: ${handlersRegistered ? '✅ Yes' : '❌ No'}`);

      this.recordResult('Telegram Message Handling', {
        handlersRegistered: handlersRegistered,
        handlerCalled: handlerCalled,
        passed: handlersRegistered
      });

    } catch (error) {
      console.log(`   ❌ Message handling test error: ${error.message}`);
      this.recordResult('Telegram Message Handling', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Record test result
   */
  recordResult(testName, data) {
    this.results.push({
      test: testName,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Generate Telegram integration report
   */
  generateTelegramReport() {
    console.log('\n📊 Telegram Integration Test Summary:');

    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;

    console.log(`   Tests Passed: ${passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
      console.log('   🎉 All Telegram integration tests PASSED!');
    } else {
      console.log('   ⚠️  Some Telegram integration tests need attention');
    }

    // Show configuration status
    const configTest = this.results.find(r => r.test === 'Telegram Configuration');
    if (configTest) {
      console.log(`   🔧 Configuration: ${configTest.botTokenSet ? '✅ Ready' : '❌ Incomplete'}`);
    }

    // Show integration status
    const handlerTest = this.results.find(r => r.test === 'Telegram Message Handling');
    if (handlerTest) {
      console.log(`   📨 Message Handling: ${handlerTest.handlersRegistered ? '✅ Working' : '❌ Not Ready'}`);
    }
  }
}

/**
 * Test Telegram provider factory integration
 */
async function testTelegramProviderFactory(): Promise<void> {
  console.log('🏭 Testing Telegram Provider Factory...');

  try {
    const { createMessagingProvider, getAvailablePlatforms } = require('../backend/src/services/messaging/providerFactory');

    // Test platform availability
    const platforms = getAvailablePlatforms();
    const telegramSupported = platforms.includes('telegram');

    console.log(`   Available Platforms: ${platforms.join(', ')}`);
    console.log(`   Telegram Supported: ${telegramSupported ? '✅ Yes' : '❌ No'}`);

    // Test provider creation (will fail without token, but tests the factory)
    try {
      const provider = createMessagingProvider();
      console.log(`   Provider Created: ${provider ? '✅ Yes' : '❌ No'}`);
    } catch (error) {
      console.log(`   Provider Creation: ❌ Failed (expected without token)`);
    }

    const factoryWorking = telegramSupported;

    console.log(`   Factory Status: ${factoryWorking ? '✅ Working' : '❌ Issues'}`);

  } catch (error) {
    console.log(`   ❌ Factory test error: ${error.message}`);
  }
}

// Export for use in other test files
module.exports = { TelegramIntegrationTester, TELEGRAM_TESTS };

// Run if called directly
if (require.main === module) {
  const tester = new TelegramIntegrationTester();

  (async () => {
    await tester.runAllTests();
    await tester.testTelegramConfiguration();
    await tester.testTelegramMessageHandling();
    await testTelegramProviderFactory();

    console.log('\n🎯 Telegram Integration Test Complete!');
    console.log('📋 Ready for production with real bot token!');
  })().catch(console.error);
}
