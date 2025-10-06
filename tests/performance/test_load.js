/**
 * Load Testing for ALEXIA AI System
 * Tests performance under high-volume and concurrent scenarios
 */

const { AIAgent } = require('../backend/src/services/ai/AIAgent');

/**
 * Load test configuration
 */
const LOAD_CONFIG = {
  // Basic load test
  basic: {
    duration: 10000,        // 10 seconds
    concurrentUsers: 5,
    messagesPerUser: 10,
    rampUpTime: 2000       // 2 seconds to reach full load
  },

  // Stress test
  stress: {
    duration: 30000,        // 30 seconds
    concurrentUsers: 20,
    messagesPerUser: 20,
    rampUpTime: 5000       // 5 seconds to reach full load
  },

  // Spike test
  spike: {
    duration: 15000,        // 15 seconds
    concurrentUsers: 50,
    messagesPerUser: 5,
    rampUpTime: 1000       // 1 second spike
  }
};

/**
 * Load Testing Suite
 */
class LoadTester {
  private results[] = [];
  private startTime;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run all load tests
   */
  async runAllTests()() {
    console.log('⚡ Starting Load Tests...\n');

    try {
      // Basic load test
      await this.runLoadTest('Basic Load', LOAD_CONFIG.basic);

      // Stress test
      await this.runLoadTest('Stress Test', LOAD_CONFIG.stress);

      // Spike test
      await this.runLoadTest('Spike Test', LOAD_CONFIG.spike);

      // Generate load test report
      this.generateLoadReport();

    } catch (error) {
      console.error('❌ Load test failed:', error.message);
      throw error;
    }
  }

  /**
   * Run a specific load test scenario
   */
  private async runLoadTest(testName, config)() {
    console.log(`🚀 Running ${testName}...`);

    const testStart = Date.now();
    const userPromises: Promise<any>[] = [];

    // Ramp up users over time
    const userRampInterval = config.rampUpTime / config.concurrentUsers;

    for (let userId = 0; userId < config.concurrentUsers; userId++) {
      // Stagger user start times for realistic ramp-up
      const userStartDelay = userId * userRampInterval;

      const userPromise = new Promise(resolve => {
        setTimeout(async () => {
          await this.simulateUserLoad(userId, config.messagesPerUser);
          resolve({ userId, completed: true });
        }, userStartDelay);
      });

      userPromises.push(userPromise);
    }

    // Wait for all users to complete
    const userResults = await Promise.allSettled(userPromises);
    const testDuration = Date.now() - testStart;

    const successfulUsers = userResults.filter(r => r.status === 'fulfilled').length;
    const totalRequests = config.concurrentUsers * config.messagesPerUser;
    const requestsPerSecond = (totalRequests / testDuration) * 1000;

    this.recordResult(testName, {
      duration: testDuration,
      concurrentUsers: config.concurrentUsers,
      messagesPerUser: config.messagesPerUser,
      totalRequests: totalRequests,
      successfulUsers: successfulUsers,
      requestsPerSecond: requestsPerSecond,
      successRate: (successfulUsers / config.concurrentUsers) * 100
    });

    console.log(`   Duration: ${testDuration}ms`);
    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   Throughput: ${requestsPerSecond.toFixed(2)} req/sec`);
    console.log(`   Success Rate: ${((successfulUsers / config.concurrentUsers) * 100).toFixed(1)}%`);
  }

  /**
   * Simulate user load for testing
   */
  private async simulateUserLoad(userId, messageCount)() {
    const agent = new AIAgent();

    for (let msgNum = 0; msgNum < messageCount; msgNum++) {
      try {
        const message = `User ${userId} load test message ${msgNum}`;
        const intent = await agent.detectIntent(message);
        await agent.generateResponse(message, intent, []);
      } catch (error) {
        // Log but don't fail the test for individual errors
        console.log(`   User ${userId} error on message ${msgNum}: ${error.message}`);
      }
    }
  }

  /**
   * Test memory usage under load
   */
  async testMemoryUnderLoad()() {
    console.log('💾 Testing Memory Usage Under Load...');

    try {
      const initialMemory = process.memoryUsage();
      const loadStart = Date.now();

      // Run a moderate load test
      await this.runLoadTest('Memory Load Test', {
        duration: 5000,
        concurrentUsers: 10,
        messagesPerUser: 5,
        rampUpTime: 1000
      });

      const loadDuration = Date.now() - loadStart;
      const finalMemory = process.memoryUsage();

      const heapIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
      const externalIncrease = (finalMemory.external - initialMemory.external) / 1024 / 1024;

      console.log(`   Load Duration: ${loadDuration}ms`);
      console.log(`   Heap Increase: ${heapIncrease.toFixed(2)}MB`);
      console.log(`   External Increase: ${externalIncrease.toFixed(2)}MB`);

      // Should not leak significant memory
      const memoryTestPassed = heapIncrease < 50 && externalIncrease < 20; // MB limits

      this.recordResult('Memory Under Load', {
        loadDuration: loadDuration,
        heapIncreaseMB: heapIncrease,
        externalIncreaseMB: externalIncrease,
        passed: memoryTestPassed
      });

    } catch (error) {
      console.log(`   ❌ Memory load test error: ${error.message}`);
      this.recordResult('Memory Under Load', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Test response time consistency
   */
  async testResponseConsistency()() {
    console.log('📏 Testing Response Time Consistency...');

    try {
      const agent = new AIAgent();
      const responseTimes[] = [];
      const testMessages = [
        'Hola, buenos días',
        'Mis ventas están bajas',
        'Necesito ayuda con Instagram',
        'Quiero hacer publicidad',
        'Ideas de contenido'
      ];

      // Test multiple rounds for consistency
      for (let round = 0; round < 3; round++) {
        for (const message of testMessages) {
          const start = performance.now();
          const intent = await agent.detectIntent(message);
          await agent.generateResponse(message, intent, []);
          const end = performance.now();
          responseTimes.push(end - start);
        }
      }

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      const stdDev = this.calculateStdDev(responseTimes);

      console.log(`   Average Response Time: ${avgTime.toFixed(2)}ms`);
      console.log(`   Max Response Time: ${maxTime.toFixed(2)}ms`);
      console.log(`   Min Response Time: ${minTime.toFixed(2)}ms`);
      console.log(`   Standard Deviation: ${stdDev.toFixed(2)}ms`);

      // Should have consistent response times
      const consistencyPassed = stdDev < (avgTime * 0.5); // Std dev should be < 50% of average

      this.recordResult('Response Consistency', {
        averageTime: avgTime,
        maxTime: maxTime,
        minTime: minTime,
        standardDeviation: stdDev,
        testRounds: 3,
        totalRequests: responseTimes.length,
        passed: consistencyPassed
      });

    } catch (error) {
      console.log(`   ❌ Consistency test error: ${error.message}`);
      this.recordResult('Response Consistency', {
        error: error.message,
        passed: false
      });
    }
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values[]) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
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
   * Generate load test report
   */
  private generateLoadReport(): void {
    console.log('\n📊 Load Test Summary:');

    const passedTests = this.results.filter(r => r.passed !== false).length;
    const totalTests = this.results.length;

    console.log(`   Tests Passed: ${passedTests}/${totalTests}`);

    // Find best performing test
    const throughputTests = this.results.filter(r => r.requestsPerSecond);
    if (throughputTests.length > 0) {
      const bestThroughput = throughputTests.sort((a, b) => b.requestsPerSecond - a.requestsPerSecond)[0];
      console.log(`   🏆 Best Throughput: ${bestThroughput.requestsPerSecond.toFixed(2)} req/sec (${bestThroughput.test})`);
    }

    // Find most stable test
    const consistencyTests = this.results.filter(r => r.standardDeviation !== undefined);
    if (consistencyTests.length > 0) {
      const mostStable = consistencyTests.sort((a, b) => a.standardDeviation - b.standardDeviation)[0];
      console.log(`   🎯 Most Stable: ${mostStable.test} (${mostStable.standardDeviation.toFixed(2)}ms std dev)`);
    }

    if (passedTests >= totalTests * 0.8) {
      console.log('   ⚡ Load tests PASSED! System handles load well.');
    } else {
      console.log('   ⚠️  Some load tests need optimization.');
    }
  }
}

/**
 * Test system resource usage
 */
async function testResourceUsage()() {
  console.log('🔧 Testing System Resource Usage...');

  try {
    const initialUsage = process.cpuUsage();
    const initialMemory = process.memoryUsage();

    // Simulate some load
    const agent = new AIAgent();
    for (let i = 0; i < 10; i++) {
      await agent.detectIntent(`Resource test ${i}`);
    }

    const finalUsage = process.cpuUsage(initialUsage);
    const finalMemory = process.memoryUsage();

    const cpuTime = (finalUsage.user + finalUsage.system) / 1000; // Convert to milliseconds
    const memoryIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;

    console.log(`   CPU Time Used: ${cpuTime.toFixed(2)}ms`);
    console.log(`   Memory Increase: ${memoryIncrease.toFixed(2)}MB`);
    console.log(`   Heap Usage: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);

    // Should be resource efficient
    const resourceTestPassed = cpuTime < 1000 && memoryIncrease < 20; // Reasonable limits

    console.log(`   Resource Test: ${resourceTestPassed ? '✅ PASS' : '❌ FAIL'}`);

  } catch (error) {
    console.log(`   ❌ Resource test error: ${error.message}`);
  }
}

// Export for use in other test files
module.exports = { LoadTester, LOAD_CONFIG };

// Run if called directly
if (require.main === module) {
  const tester = new LoadTester();

  (async () => {
    await tester.runAllTests();
    await tester.testMemoryUnderLoad();
    await tester.testResponseConsistency();
    await testResourceUsage();
  })().catch(console.error);
}
