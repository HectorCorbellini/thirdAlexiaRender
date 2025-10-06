/**
 * Provider Switching Tests for ALEXIA AI System
 * Tests switching between different AI providers (Groq, OpenAI)
 */

const { AIAgent } = require('../backend/src/services/ai/AIAgent');
const { createAIProvider } = require('../backend/src/services/ai/providers/AIProviderFactory');

/**
 * Provider switching test scenarios
 */
const PROVIDER_TESTS = [
  {
    name: 'Groq to OpenAI Switch',
    fromProvider: 'groq',
    toProvider: 'openai',
    testMessage: 'Hola, quiero ayuda con marketing digital',
    expectSwitch: true
  },
  {
    name: 'OpenAI to Groq Switch',
    fromProvider: 'openai',
    toProvider: 'groq',
    testMessage: 'Necesito consejos para redes sociales',
    expectSwitch: true
  },
  {
    name: 'Invalid Provider Switch',
    fromProvider: 'groq',
    toProvider: 'invalid_provider',
    testMessage: 'Test invalid provider',
    expectSwitch: false
  },
  {
    name: 'Same Provider Switch',
    fromProvider: 'groq',
    toProvider: 'groq',
    testMessage: 'Test same provider',
    expectSwitch: true
  }
];

/**
 * Provider Switching Test Suite
 */
class ProviderSwitchingTester {
  private results[] = [];

  /**
   * Run all provider switching tests
   */
  async runAllTests()() {
    console.log('🔄 Starting Provider Switching Tests...\n');

    for (const test of PROVIDER_TESTS) {
      await this.testProviderSwitch(test);
    }

    this.generateSwitchingReport();
  }

  /**
   * Test switching between providers
   */
  private async testProviderSwitch(test)() {
    console.log(`🔄 Testing: ${test.name}`);

    try {
      const agent = new AIAgent();

      // Get initial provider
      const initialProvider = agent.getCurrentProvider();
      console.log(`   Initial Provider: ${initialProvider}`);

      // Test provider switching
      const switchResult = await agent.switchProvider(test.toProvider);

      if (test.expectSwitch) {
        if (switchResult) {
          const newProvider = agent.getCurrentProvider();
          console.log(`   ✅ Switched to: ${newProvider}`);

          // Test that the new provider works
          const intent = await agent.detectIntent(test.testMessage);
          const response = await agent.generateResponse(test.testMessage, intent, []);

          const providerWorking = response && response.response.length > 0;
          console.log(`   ${providerWorking ? '✅' : '❌'} New provider functional`);

          this.recordResult(test.name, {
            initialProvider: initialProvider,
            targetProvider: test.toProvider,
            actualProvider: newProvider,
            switchSuccessful: switchResult,
            providerFunctional: providerWorking,
            passed: switchResult && providerWorking
          });

        } else {
          console.log(`   ❌ Provider switch failed`);
          this.recordResult(test.name, {
            switchSuccessful: false,
            error: 'Switch operation returned false',
            passed: false
          });
        }
      } else {
        // Expecting switch to fail
        console.log(`   ${!switchResult ? '✅' : '❌'} Expected switch failure`);
        this.recordResult(test.name, {
          switchSuccessful: switchResult,
          expectedFailure: true,
          passed: !switchResult
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
   * Test provider availability and status
   */
  async testProviderStatus()() {
    console.log('🔍 Testing Provider Status & Availability...');

    try {
      const agent = new AIAgent();
      const status = await agent.getProviderStatus();

      console.log(`   Current Provider: ${status.current}`);
      console.log(`   Provider Available: ${status.available ? '✅ Yes' : '❌ No'}`);

      this.recordResult('Provider Status', {
        currentProvider: status.current,
        available: status.available,
        passed: status.available
      });

    } catch (error) {
      console.log(`   ❌ Status check failed: ${error.message}`);
      this.recordResult('Provider Status', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Test fallback provider behavior
   */
  async testFallbackBehavior()() {
    console.log('🛡️ Testing Provider Fallback Behavior...');

    try {
      // Test with invalid API key (should fallback gracefully)
      process.env.GROQ_API_KEY = 'invalid_key';
      process.env.OPENAI_API_KEY = 'invalid_key';

      const agent = new AIAgent();
      const intent = await agent.detectIntent('Test fallback');
      const response = await agent.generateResponse('Test fallback', intent, []);

      // Should still work due to fallback system
      const fallbackWorked = response && response.provider === 'Fallback';

      console.log(`   Fallback Provider: ${response.provider}`);
      console.log(`   Fallback Working: ${fallbackWorked ? '✅ Yes' : '❌ No'}`);

      this.recordResult('Fallback Behavior', {
        fallbackProvider: response.provider,
        fallbackWorking: fallbackWorked,
        passed: fallbackWorked
      });

    } catch (error) {
      console.log(`   ❌ Fallback test error: ${error.message}`);
      this.recordResult('Fallback Behavior', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Record test result
   */
  private recordResult(testName, data): void {
    this.results.push({
      test: testName,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Generate switching report
   */
  private generateSwitchingReport(): void {
    console.log('\n📊 Provider Switching Test Summary:');

    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;

    console.log(`   Tests Passed: ${passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
      console.log('   🎉 All provider switching tests PASSED!');
    } else {
      console.log('   ⚠️  Some provider switching tests failed');
    }

    // Show provider availability
    const statusTest = this.results.find(r => r.test === 'Provider Status');
    if (statusTest) {
      console.log(`   🔌 Provider Status: ${statusTest.available ? '✅ Available' : '❌ Unavailable'}`);
    }
  }
}

/**
 * Test AI Provider Factory directly
 */
async function testProviderFactory()() {
  console.log('🏭 Testing AI Provider Factory...');

  const providers = ['groq', 'openai'];

  for (const providerType of providers) {
    try {
      const provider = createAIProvider(providerType);
      console.log(`   ✅ ${providerType}: ${provider.name}`);

      // Test basic functionality
      const isAvailable = await provider.isAvailable();
      console.log(`      Available: ${isAvailable ? '✅ Yes' : '❌ No'}`);

    } catch (error) {
      console.log(`   ❌ ${providerType}: ${error.message}`);
    }
  }
}

// Export for use in other test files
module.exports = { ProviderSwitchingTester, PROVIDER_TESTS };

// Run if called directly
if (require.main === module) {
  const tester = new ProviderSwitchingTester();

  (async () => {
    await tester.runAllTests();
    await tester.testProviderStatus();
    await tester.testFallbackBehavior();
    await testProviderFactory();
  })().catch(console.error);
}
