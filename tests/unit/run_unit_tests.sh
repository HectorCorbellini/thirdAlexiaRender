#!/bin/bash

echo "🧪 ALEXIA - Unit Tests"
echo "===================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

run_unit_test() {
    local test_file="$1"
    local test_name="$2"

    echo -e "\n${BLUE}Testing: $test_name${NC}"

    if [ -f "$test_file" ]; then
        if node "$test_file" > /tmp/test_output.log 2>&1; then
            echo -e "${GREEN}✅ $test_name: PASSED${NC}"
            return 0
        else
            echo -e "${RED}❌ $test_name: FAILED${NC}"
            echo "Error output:"
            cat /tmp/test_output.log
            return 1
        fi
    else
        echo -e "${RED}❌ $test_name: FILE NOT FOUND${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}🔧 Unit Tests for AI Components${NC}"

# Test AIAgent
run_unit_test "unit/test-ai-agent.js" "AIAgent Class"

# Test Intent Detection
run_unit_test "unit/test-intent-detection.js" "Intent Detection System"

# Test Prompt Manager
run_unit_test "unit/test-prompt-manager.js" "Prompt Management System"

echo -e "\n${BLUE}📋 Unit Test Summary${NC}"
echo "Testing individual AI components..."
echo "- AIAgent class functionality"
echo "- Intent detection accuracy"
echo "- Prompt management system"
echo "- Error handling and fallbacks"

echo -e "\n${GREEN}Unit tests completed!${NC}"
