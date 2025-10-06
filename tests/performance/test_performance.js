/**
 * Performance Benchmark Tests for ALEXIA AI System
 * Tests response times, throughput, and resource usage
 */

const { AIAgent } = require('../backend/src/services/ai/AIAgent');
const { IntentDetector } = require('../backend/src/services/ai/IntentDetector');

/**
 * Performance test configuration
 */
const PERF_CONFIG = {
  // Response time benchmarks (milliseconds)
  benchmarks: {
    intentDetection: 50,    // Should detect intent in < 50ms
    responseGeneration: 3000, // Should generate response in < 3s
    aiAgentCreation: 100,   // Should create agent in < 100ms
    promptBuilding: 10      // Should build prompts in < 10ms
  },

  // Load testing
  load: {
    concurrentUsers: 10,
    messagesPerUser: 5,
    duration: 10000 // 10 seconds
  },

  // Memory usage limits
  memory: {
    maxHeapMB: 100,        // Max heap usage in MB
    maxExternalMB: 50      // Max external memory in MB
  }
};

/**
 * Performance Test Suite
 */
class PerformanceTester {
  constructor() {
    this.results = [];
  }

  /**
   * Run all performance tests
   */
  async runAllTests() {
    console.log('🚀 Starting Performance Tests...\n');

    try {
      // Individual component benchmarks
      await this.testIntentDetectionPerformance();
      await this.testPromptBuildingPerformance();
      await this.testAIAgentCreationPerformance();
      await this.testResponseGenerationPerformance();

      // Load testing
      await this.testConcurrentLoad();

      // Memory usage analysis
      this.analyzeMemoryUsage();

      // Generate performance report
      this.generatePerformanceReport();

    } catch (error) {
      console.error('❌ Performance test failed:', error.message);
      throw error;
    }
  }
  /**
   * Test intent detection performance
   */
  private async testIntentDetectionPerformance()() {
    console.log('🎯 Testing Intent Detection Performance...');

    const detector = new IntentDetector();
    const testMessages = [
      'Hola, buenos días',
      'Mis ventas están bajas, necesito ayuda',
      'Quiero hacer publicidad en Instagram',
      'Necesito ideas de contenido para redes sociales',
      'Cómo mejoro mi tienda online'
    ];

    const times[] = [];

    for (const message of testMessages) {
      const start = performance.now();
      await detector.detectIntent(message);
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    this.recordResult('Intent Detection', {
      averageTime: avgTime,
      maxTime: maxTime,
      sampleSize: testMessages.length,
      benchmark: PERF_CONFIG.benchmarks.intentDetection,
      passed: avgTime < PERF_CONFIG.benchmarks.intentDetection
    });

    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Max: ${maxTime.toFixed(2)}ms`);
    console.log(`   Benchmark: < ${PERF_CONFIG.benchmarks.intentDetection}ms`);
    console.log(`   Status: ${avgTime < PERF_CONFIG.benchmarks.intentDetection ? '✅ PASS' : '❌ FAIL'}`);
  }

  /**
   * Test prompt building performance
   */
  private async testPromptBuildingPerformance()() {
    console.log('📝 Testing Prompt Building Performance...');

    const { promptManager } = require('../backend/src/services/ai/PromptManager');

    const intents = ['GREETING', 'SALES_PROBLEM', 'SOCIAL_MEDIA', 'ADVERTISING'];
    const times[] = [];

    for (const intent of intents) {
      const start = performance.now();
      promptManager.buildSystemPrompt(intent);
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    this.recordResult('Prompt Building', {
      averageTime: avgTime,
      benchmark: PERF_CONFIG.benchmarks.promptBuilding,
      passed: avgTime < PERF_CONFIG.benchmarks.promptBuilding
    });

    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Benchmark: < ${PERF_CONFIG.benchmarks.promptBuilding}ms`);
    console.log(`   Status: ${avgTime < PERF_CONFIG.benchmarks.promptBuilding ? '✅ PASS' : '❌ FAIL'}`);
  }

  /**
   * Test AIAgent creation performance
   */
  private async testAIAgentCreationPerformance()() {
    console.log('🤖 Testing AIAgent Creation Performance...');

    const times[] = [];

    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      new AIAgent();
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    this.recordResult('AIAgent Creation', {
      averageTime: avgTime,
      benchmark: PERF_CONFIG.benchmarks.aiAgentCreation,
      passed: avgTime < PERF_CONFIG.benchmarks.aiAgentCreation
    });

    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Benchmark: < ${PERF_CONFIG.benchmarks.aiAgentCreation}ms`);
    console.log(`   Status: ${avgTime < PERF_CONFIG.benchmarks.aiAgentCreation ? '✅ PASS' : '❌ FAIL'}`);
  }

  /**
   * Test response generation performance
   */
  private async testResponseGenerationPerformance()() {
    console.log('💬 Testing Response Generation Performance...');

    const agent = new AIAgent();
    const testCases = [
      { message: 'Hola, quiero ayuda con ventas', intent: 'SALES_PROBLEM' },
      { message: 'Necesito ideas para Instagram', intent: 'SOCIAL_MEDIA' },
      { message: 'Cómo hacer publicidad efectiva', intent: 'ADVERTISING' }
    ];

    const times[] = [];

    for (const testCase of testCases) {
      const intent = await agent.detectIntent(testCase.message);
      const start = performance.now();
      await agent.generateResponse(testCase.message, intent, []);
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    this.recordResult('Response Generation', {
      averageTime: avgTime,
      maxTime: maxTime,
      benchmark: PERF_CONFIG.benchmarks.responseGeneration,
      passed: avgTime < PERF_CONFIG.benchmarks.responseGeneration
    });

    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Max: ${maxTime.toFixed(2)}ms`);
    console.log(`   Benchmark: < ${PERF_CONFIG.benchmarks.responseGeneration}ms`);
    console.log(`   Status: ${avgTime < PERF_CONFIG.benchmarks.responseGeneration ? '✅ PASS' : '❌ FAIL'}`);
  }

  /**
   * Test concurrent load performance
   */
  private async testConcurrentLoad()() {
    console.log('⚡ Testing Concurrent Load Performance...');

    const start = Date.now();
    const promises: Promise<any>[] = [];

    // Simulate concurrent users
    for (let user = 0; user < PERF_CONFIG.load.concurrentUsers; user++) {
      const userPromise = this.simulateUserLoad(user);
      promises.push(userPromise);
    }

    await Promise.all(promises);
    const duration = Date.now() - start;

    const totalRequests = PERF_CONFIG.load.concurrentUsers * PERF_CONFIG.load.messagesPerUser;
    const requestsPerSecond = (totalRequests / duration) * 1000;

    this.recordResult('Concurrent Load', {
      duration: duration,
      totalRequests: totalRequests,
      requestsPerSecond: requestsPerSecond,
      concurrentUsers: PERF_CONFIG.load.concurrentUsers
    });

    console.log(`   Duration: ${duration}ms`);
    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   Throughput: ${requestsPerSecond.toFixed(2)} req/sec`);
    console.log(`   Concurrent Users: ${PERF_CONFIG.load.concurrentUsers}`);
  }

  /**
   * Simulate user load for testing
   */
  private async simulateUserLoad(userId)() {
    const agent = new AIAgent();

    for (let msg = 0; msg < PERF_CONFIG.load.messagesPerUser; msg++) {
      const testMessage = `User ${userId} message ${msg}`;
      const intent = await agent.detectIntent(testMessage);
      await agent.generateResponse(testMessage, intent, []);
    }
  }

  /**
   * Analyze memory usage
   */
  private analyzeMemoryUsage(): void {
    console.log('💾 Analyzing Memory Usage...');

    const endMemory = process.memoryUsage();
    const heapUsed = (endMemory.heapUsed - this.startMemory.heapUsed) / 1024 / 1024;
    const externalUsed = (endMemory.external - this.startMemory.external) / 1024 / 1024;

    this.recordResult('Memory Usage', {
      heapUsedMB: heapUsed,
      externalUsedMB: externalUsed,
      heapLimitMB: PERF_CONFIG.memory.maxHeapMB,
      externalLimitMB: PERF_CONFIG.memory.maxExternalMB,
      heapPassed: heapUsed < PERF_CONFIG.memory.maxHeapMB,
      externalPassed: externalUsed < PERF_CONFIG.memory.maxExternalMB
    });

    console.log(`   Heap Used: ${heapUsed.toFixed(2)}MB`);
    console.log(`   External Used: ${externalUsed.toFixed(2)}MB`);
    console.log(`   Heap Limit: < ${PERF_CONFIG.memory.maxHeapMB}MB`);
    console.log(`   External Limit: < ${PERF_CONFIG.memory.maxExternalMB}MB`);
    console.log(`   Status: ${heapUsed < PERF_CONFIG.memory.maxHeapMB && externalUsed < PERF_CONFIG.memory.maxExternalMB ? '✅ PASS' : '❌ FAIL'}`);
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
   * Generate performance report
   */
  private generatePerformanceReport(): void {
    console.log('\n📊 Performance Test Summary:');

    const passedTests = this.results.filter(r => r.passed !== false).length;
    const totalTests = this.results.filter(r => r.passed !== undefined).length;

    console.log(`   Tests Passed: ${passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
      console.log('   🎉 All performance benchmarks PASSED!');
    } else {
      console.log('   ⚠️  Some performance benchmarks failed');
    }

    // Show slowest operations
    const timedTests = this.results.filter(r => r.averageTime);
    if (timedTests.length > 0) {
      const slowest = timedTests.sort((a, b) => b.averageTime - a.averageTime)[0];
      console.log(`   🐌 Slowest Operation: ${slowest.test} (${slowest.averageTime.toFixed(2)}ms)`);
    }
  }
}

// Export for use in other test files
module.exports = { PerformanceTester, PERF_CONFIG };

// Run if called directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}
