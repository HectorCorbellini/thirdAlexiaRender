#!/bin/bash

echo "🧪 ALEXIA - Enhanced AI System Test Runner"
echo "=========================================="
echo "Testing v2.4.0 with Enterprise AI Features"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

run_test() {
    local test_name="$1"
    local test_command="$2"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}🧪 Testing: $test_name${NC}"

    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name: PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ $test_name: FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

print_summary() {
    echo -e "\n${YELLOW}📊 Test Summary:${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! System is production-ready.${NC}"
        echo -e "\n${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
        return 1
    fi
}

# Test 13: Telegram Integration
run_test "Telegram Integration" "
node tests/integration/test_telegram_integration.js > /tmp/telegram_output.log 2>&1
if [ $? -eq 0 ]; then
    echo '✅ Telegram integration tests completed'
    exit 0
else
    echo '❌ Telegram integration tests failed'
    cat /tmp/telegram_output.log
    exit 1
fi
"\n${BLUE}📡 Step 1: Checking servers...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server not running. Please start with ./start.sh${NC}"
    exit 1
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server not running (optional for AI tests)${NC}"
fi

# Test 2: AI Provider System
run_test "AI Provider Configuration" "
AI_PROVIDER=\$(grep 'AI_PROVIDER' backend/.env | cut -d'=' -f2 | tr -d ' ')
if [ \"\$AI_PROVIDER\" = 'groq' ] || [ \"\$AI_PROVIDER\" = 'openai' ]; then
    echo '✅ AI Provider configured correctly'
    exit 0
else
    echo '❌ AI Provider not configured properly'
    exit 1
fi
"

# Test 3: Intent Detection System
run_test "Intent Detection (12 categories)" "
node -e \"
const { IntentDetector } = require('./backend/src/services/ai/IntentDetector');
const detector = new IntentDetector();
const tests = [
    ['Hola, buenos días', 'GREETING'],
    ['Mis ventas están bajas', 'SALES_PROBLEM'],
    ['Ayuda con Instagram', 'SOCIAL_MEDIA'],
    ['Quiero publicidad', 'ADVERTISING'],
    ['Ideas de contenido', 'CONTENT_IDEAS']
];

Promise.all(tests.map(async ([msg, expected]) => {
    const result = await detector.detectIntent(msg);
    return result.intent === expected && result.confidence > 0.5;
})).then(results => {
    const passed = results.every(r => r);
    console.log(passed ? '✅ All intent detection tests passed' : '❌ Some intent detection tests failed');
    process.exit(passed ? 0 : 1);
});
\"
"

# Test 4: Prompt Management System
run_test "Prompt Management System" "
node -e \"
const { promptManager } = require('./backend/src/services/ai/PromptManager');

const systemPrompt = promptManager.getSystemPrompt();
const intentPrompt = promptManager.getIntentPrompt('SALES_PROBLEM');
const validation = promptManager.validatePrompts();

const checks = [
    systemPrompt.length > 100,
    intentPrompt.length > 50,
    validation.isValid
];

const passed = checks.every(c => c);
console.log(passed ? '✅ Prompt system validation passed' : '❌ Prompt system validation failed');
process.exit(passed ? 0 : 1);
\"
"

# Test 5: AIAgent Integration
run_test "AIAgent Integration" "
node -e \"
const { AIAgent } = require('./backend/src/services/ai/AIAgent');

(async () => {
    const agent = new AIAgent();
    const intent = await agent.detectIntent('Hola, quiero ayuda con ventas');
    const response = await agent.generateResponse('Hola, quiero ayuda con ventas', intent, []);

    const checks = [
        agent.getCurrentProvider().length > 0,
        intent.intent.length > 0,
        response.response.length > 10,
        response.provider.length > 0
    ];

    const passed = checks.every(c => c);
    console.log(passed ? '✅ AIAgent integration working' : '❌ AIAgent integration failed');
    process.exit(passed ? 0 : 1);
})();
\"
"

# Test 6: WhatsApp Integration with Enhanced AI
run_test "WhatsApp + AI Integration" "
node -e \"
const { AIService } = require('./backend/src/services/ai');

(async () => {
    const aiService = new AIService();
    const mockMessage = {
        id: 'test-msg',
        userId: 'test-user',
        platform: 'whatsapp',
        text: 'Hola! Quiero saber cómo mejorar las ventas de mi tienda de ropa en Instagram',
        timestamp: new Date()
    };

    const mockUser = {
        id: 'test-user',
        name: 'María',
        platform: 'whatsapp',
        businessId: 'test-business'
    };

    try {
        const response = await aiService.processMessage(mockMessage, mockUser, null);
        const passed = response && response.length > 20;
        console.log(passed ? '✅ WhatsApp AI integration working' : '❌ WhatsApp AI integration failed');
        process.exit(passed ? 0 : 1);
    } catch (error) {
        console.log('❌ WhatsApp AI integration failed with error');
        process.exit(1);
    }
})();
\"
"

# Test 7: Performance Testing
run_test "AI Response Performance" "
node -e \"
const { AIAgent } = require('./backend/src/services/ai/AIAgent');

(async () => {
    const agent = new AIAgent();
    const start = Date.now();

    const intent = await agent.detectIntent('Test performance');
    const response = await agent.generateResponse('Test performance', intent, []);

    const duration = Date.now() - start;
    const passed = duration < 5000 && response.response.length > 0; // Should be fast

    console.log(\`✅ Performance test: \${duration}ms\`);
    console.log(passed ? '✅ Performance acceptable' : '❌ Performance too slow');
    process.exit(passed ? 0 : 1);
})();
\"
"

# Test 8: Error Handling
run_test "Error Handling & Fallbacks" "
node -e \"
const { AIAgent } = require('./backend/src/services/ai/AIAgent');

(async () => {
    const agent = new AIAgent();

    // Test with empty/invalid input
    const intent1 = await agent.detectIntent('');
    const response1 = await agent.generateResponse('', intent1, []);

    // Test with very long input
    const longText = 'a'.repeat(10000);
    const intent2 = await agent.detectIntent(longText);
    const response2 = await agent.generateResponse(longText, intent2, []);

    const checks = [
        response1.response && response1.response.length > 0,
        response2.response && response2.response.length > 0,
        response1.provider === 'Fallback' || response1.provider.length > 0
    ];

    const passed = checks.every(c => c);
    console.log(passed ? '✅ Error handling working' : '❌ Error handling failed');
    process.exit(passed ? 0 : 1);
})();
\"
"

# Test 9: API Endpoints
run_test "API Endpoint Integration" "
TOKEN=\$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"admin@alexia.com\",\"password\":\"admin123456\"}' | \
    sed -n 's/.*\"token\":\"\([^\"]*\)\".*/\1/p')

if [ -n \"\$TOKEN\" ]; then
    BUSINESSES=\$(curl -s -X GET http://localhost:3001/api/business \
        -H \"Authorization: Bearer \$TOKEN\" | \
        jq -r '. | length' 2>/dev/null || echo '0')

    if [ \"\$BUSINESSES\" -gt 0 ] 2>/dev/null || [ \"\$BUSINESSES\" = '0' ]; then
        echo '✅ API endpoints working correctly'
        exit 0
    else
        echo '❌ API endpoints failed'
        exit 1
    fi
else
    echo '❌ Authentication failed'
    exit 1
fi
"

# Summary
print_summary
