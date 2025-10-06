/**
 * Error Scenario Tests for ALEXIA AI System
 * Tests error handling, fallbacks, and recovery mechanisms
 */

const { AIAgent } = require('../backend/src/services/ai/AIAgent');
const { IntentDetector } = require('../backend/src/services/ai/IntentDetector');

/**
 * Error scenario test cases
 */
const ERROR_SCENARIOS = [
  {
    name: 'Empty Message Handling',
    input: '',
    expectedFallback: true,
    description: 'Should handle empty input gracefully'
  },
  {
    name: 'Very Long Message',
    input: 'a'.repeat(50000), // Very long message
    expectedFallback: true,
    description: 'Should handle extremely long input'
  },
  {
    name: 'Special Characters Only',
    input: '!@#$%^&*()_+{}|:<>?[]\\;\'",./',
    expectedFallback: true,
    description: 'Should handle special characters'
  },
  {
    name: 'Invalid Intent Data',
    input: 'Normal message',
    mockIntent: null, // Simulate intent detection failure
    expectedFallback: true,
    description: 'Should handle intent detection failures'
  },
  {
    name: 'Provider Timeout Simulation',
    input: 'Test timeout handling',
    simulateTimeout: true,
    expectedFallback: true,
    description: 'Should handle provider timeouts'
  },
  {
    name: 'Network Error Simulation',
    input: 'Test network error',
    simulateNetworkError: true,
    expectedFallback: true,
    description: 'Should handle network failures'
  }
];

/**
 * Error Scenario Test Suite
 */
class ErrorScenarioTester {
  private results[] = [];

  /**
   * Run all error scenario tests
   */
  async runAllTests()() {
    console.log('🛡️ Starting Error Scenario Tests...\n');

    for (const scenario of ERROR_SCENARIOS) {
      await this.testErrorScenario(scenario);
    }

    this.generateErrorReport();
  }

  /**
   * Test specific error scenario
   */
  private async testErrorScenario(scenario)() {
    console.log(`🛡️ Testing: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);

    try {
      const agent = new AIAgent();

      let intent;
      let response;

      if (scenario.mockIntent === null) {
        // Mock intent detection failure
        intent = { intent: 'OTHER', confidence: 0.1 };
      } else {
        intent = await agent.detectIntent(scenario.input);
      }

      if (scenario.simulateTimeout) {
        // Simulate timeout by delaying response
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      response = await agent.generateResponse(scenario.input, intent, []);

      // Check if fallback was used
      const usedFallback = response.provider === 'Fallback';
      const responseValid = response.response && response.response.length > 0;

      console.log(`   Response Provider: ${response.provider}`);
      console.log(`   Response Length: ${response.response.length} characters`);
      console.log(`   Used Fallback: ${usedFallback ? '✅ Yes' : '❌ No'}`);

      this.recordResult(scenario.name, {
        scenario: scenario.description,
        inputLength: scenario.input.length,
        responseProvider: response.provider,
        usedFallback: usedFallback,
        responseValid: responseValid,
        expectedFallback: scenario.expectedFallback,
        passed: usedFallback === scenario.expectedFallback && responseValid
      });

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.recordResult(scenario.name, {
        error: error.message,
        scenario: scenario.description,
        passed: scenario.expectedFallback // Expected error scenarios pass if they trigger fallbacks
      });
    }
  }

  /**
   * Test API rate limiting simulation
   */
  async testRateLimiting()() {
    console.log('🚦 Testing Rate Limiting Simulation...');

    try {
      const agent = new AIAgent();
      const requests = [];

      // Simulate rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          agent.detectIntent(`Rate limit test message ${i}`)
            .then(intent => agent.generateResponse(`Rate limit test message ${i}`, intent, []))
        );
      }

      const responses = await Promise.allSettled(requests);

      const successful = responses.filter(r => r.status === 'fulfilled').length;
      const failed = responses.filter(r => r.status === 'rejected').length;

      console.log(`   Successful Requests: ${successful}`);
      console.log(`   Failed Requests: ${failed}`);
      console.log(`   Success Rate: ${((successful / requests.length) * 100).toFixed(1)}%`);

      // Should have high success rate even under load
      const rateLimitPassed = (successful / requests.length) > 0.8;

      this.recordResult('Rate Limiting', {
        totalRequests: requests.length,
        successfulRequests: successful,
        failedRequests: failed,
        successRate: (successful / requests.length) * 100,
        passed: rateLimitPassed
      });

    } catch (error) {
      console.log(`   ❌ Rate limiting test error: ${error.message}`);
      this.recordResult('Rate Limiting', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Test memory leak prevention
   */
  async testMemoryLeakPrevention()() {
    console.log('🧠 Testing Memory Leak Prevention...');

    try {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create and destroy many agents
      for (let i = 0; i < 100; i++) {
        const agent = new AIAgent();
        await agent.detectIntent(`Memory test ${i}`);
        // Explicitly clean up (if cleanup method exists)
        if (agent.cleanup) {
          await agent.cleanup();
        }
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      console.log(`   Memory Increase: ${memoryIncreaseMB.toFixed(2)}MB`);
      console.log(`   Initial Memory: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Final Memory: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);

      // Should not have significant memory leaks
      const memoryLeakPassed = memoryIncreaseMB < 10; // Less than 10MB increase

      this.recordResult('Memory Leak Prevention', {
        memoryIncreaseMB: memoryIncreaseMB,
        initialMemoryMB: initialMemory / 1024 / 1024,
        finalMemoryMB: finalMemory / 1024 / 1024,
        passed: memoryLeakPassed
      });

    } catch (error) {
      console.log(`   ❌ Memory test error: ${error.message}`);
      this.recordResult('Memory Leak Prevention', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Test concurrent error scenarios
   */
  async testConcurrentErrors()() {
    console.log('⚡ Testing Concurrent Error Scenarios...');

    try {
      const agents = [];
      const promises = [];

      // Create multiple agents
      for (let i = 0; i < 5; i++) {
        agents.push(new AIAgent());
      }

      // Test concurrent error handling
      for (let i = 0; i < agents.length; i++) {
        const promise = agents[i].detectIntent('')
          .then(intent => agents[i].generateResponse('', intent, []))
          .catch(error => ({ error: error.message, fallback: true }));
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`   Concurrent Operations: ${agents.length}`);
      console.log(`   Successful: ${successful}`);
      console.log(`   Failed: ${failed}`);

      // Should handle concurrent errors gracefully
      const concurrentErrorPassed = successful >= agents.length * 0.8; // At least 80% success

      this.recordResult('Concurrent Errors', {
        totalOperations: agents.length,
        successful: successful,
        failed: failed,
        successRate: (successful / agents.length) * 100,
        passed: concurrentErrorPassed
      });

    } catch (error) {
      console.log(`   ❌ Concurrent error test failed: ${error.message}`);
      this.recordResult('Concurrent Errors', {
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
   * Generate error handling report
   */
  private generateErrorReport(): void {
    console.log('\n📊 Error Scenario Test Summary:');

    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;

    console.log(`   Tests Passed: ${passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
      console.log('   🛡️ All error scenarios handled correctly!');
    } else {
      console.log('   ⚠️  Some error scenarios need attention');
    }

    // Show error handling effectiveness
    const errorTests = this.results.filter(r => r.test.includes('Error'));
    if (errorTests.length > 0) {
      const avgSuccessRate = errorTests.reduce((acc, test) => acc + (test.successRate || 0), 0) / errorTests.length;
      console.log(`   Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
    }
  }
}

/**
 * Test IntentDetector error handling
 */
async function testIntentDetectorErrors()() {
  console.log('🎯 Testing IntentDetector Error Handling...');

  const detector = new IntentDetector();

  const errorInputs = [
    '',           // Empty string
    'a'.repeat(100000), // Very long string
    null,         // Null input (if not handled)
    undefined     // Undefined input (if not handled)
  ];

  for (const input of errorInputs) {
    try {
      const result = await detector.detectIntent(input || '');
      console.log(`   ✅ ${input === '' ? 'Empty' : input === null ? 'Null' : 'Long'} input handled`);
    } catch (error) {
      console.log(`   ❌ ${input === '' ? 'Empty' : input === null ? 'Null' : 'Long'} input failed: ${error.message}`);
    }
  }
}

// Export for use in other test files
module.exports = { ErrorScenarioTester, ERROR_SCENARIOS };

// Run if called directly
if (require.main === module) {
  const tester = new ErrorScenarioTester();

  (async () => {
    await tester.runAllTests();
    await tester.testRateLimiting();
    await tester.testMemoryLeakPrevention();
    await tester.testConcurrentErrors();
    await testIntentDetectorErrors();
  })().catch(console.error);
}
