#!/bin/bash

echo "🔗 ALEXIA - Integration Tests"
echo "============================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

run_integration_test() {
    local test_file="$1"
    local test_name="$2"

    echo -e "\n${BLUE}Testing: $test_name${NC}"

    if [ -f "$test_file" ]; then
        if node "$test_file" > /tmp/integration_output.log 2>&1; then
            echo -e "${GREEN}✅ $test_name: PASSED${NC}"
            return 0
        else
            echo -e "${RED}❌ $test_name: FAILED${NC}"
            echo "Error output:"
            cat /tmp/integration_output.log
            return 1
        fi
    else
        echo -e "${RED}❌ $test_name: FILE NOT FOUND${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}🔗 Integration Tests${NC}"

# Test WhatsApp Integration
run_integration_test "integration/test-whatsapp-integration.js" "WhatsApp + AI Integration"

echo -e "\n${BLUE}📋 Integration Test Summary${NC}"
echo "Testing component interactions..."
echo "- WhatsApp service + AI system integration"
echo "- End-to-end message processing"
echo "- Database integration"
echo "- API endpoint connectivity"

echo -e "\n${GREEN}Integration tests completed!${NC}"
