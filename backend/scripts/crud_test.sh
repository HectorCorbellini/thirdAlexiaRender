#!/bin/bash

# Alexia Full-Stack CRUD Test Script
# This script tests the complete lifecycle (Create, Read, Update, Delete) of a business.

# --- Configuration ---
BASE_URL="http://localhost:3001/api"
ADMIN_EMAIL="admin@alexia.com"
ADMIN_PASSWORD="admin123456"

# --- Colors for output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- Helper Functions ---

# Function to print a formatted header
print_header() {
  echo -e "\n${YELLOW}=====================================================${NC}"
  echo -e "${YELLOW} $1${NC}"
  echo -e "${YELLOW}=====================================================${NC}"
}

# Function to check if the server is running
check_server() {
  print_header "Checking Server Status"
  if ! curl -s --head $BASE_URL/../health | head -n 1 | grep "200 OK" > /dev/null; then
    echo -e "${RED}Error: Backend server is not running or not accessible at $BASE_URL/../health${NC}"
    echo "Please start the server with './start.sh' before running this test."
    exit 1
  fi
  echo -e "${GREEN}✓ Backend server is running.${NC}"
}

# Function to get an authentication token
get_token() {
  echo "Authenticating as admin..."
  TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | sed -n 's/.*\"token\":\"\([^\"]*\)\”.*/\1/p')

  if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: Failed to retrieve authentication token. Check admin credentials.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Authentication successful.${NC}"
}

# --- Test Execution ---

main() {
  check_server
  get_token

  # 1. CREATE
  print_header "Step 1: CREATE Business"
  CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/business" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name": "Test Cafe", "description": "Best coffee on the block", "category": "Cafe"}')
  
  BUSINESS_ID=$(echo $CREATE_RESPONSE | sed -n 's/.*\"id\":\"\([^\"]*\)\”.*/\1/p')

  if [ -z "$BUSINESS_ID" ]; then
    echo -e "${RED}Error: CREATE failed. Could not extract business ID from response:${NC}"
    echo "$CREATE_RESPONSE"
    exit 1
  fi
  echo -e "${GREEN}✓ CREATE successful. New business ID: $BUSINESS_ID${NC}"
  echo "$CREATE_RESPONSE"

  # 2. READ
  print_header "Step 2: READ Business"
  READ_RESPONSE=$(curl -s -X GET "$BASE_URL/business/$BUSINESS_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  if ! echo "$READ_RESPONSE" | grep -q "$BUSINESS_ID"; then
    echo -e "${RED}Error: READ failed. Could not find the newly created business.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ READ successful. Found business:${NC}"
  echo "$READ_RESPONSE"

  # 3. UPDATE
  print_header "Step 3: UPDATE Business"
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/business/$BUSINESS_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name": "Test Cafe Deluxe", "description": "The absolute best coffee, now updated!"}')

  if ! echo "$UPDATE_RESPONSE" | grep -q "Test Cafe Deluxe"; then
    echo -e "${RED}Error: UPDATE failed. Response did not contain updated name.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ UPDATE successful. Business updated:${NC}"
  echo "$UPDATE_RESPONSE"

  # 4. DELETE
  print_header "Step 4: DELETE Business"
  DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/business/$BUSINESS_ID" \
    -H "Authorization: Bearer $TOKEN")

  if ! echo "$DELETE_RESPONSE" | grep -q "deleted successfully"; then
    echo -e "${RED}Error: DELETE failed.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ DELETE successful.${NC}"
  echo "$DELETE_RESPONSE"

  # 5. Final READ Confirmation
  print_header "Step 5: Final READ Confirmation"
  FINAL_READ_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/business/$BUSINESS_ID" \
    -H "Authorization: Bearer $TOKEN")

  if [ "$FINAL_READ_RESPONSE" -ne 404 ]; then
    echo -e "${RED}Error: Final READ confirmation failed. Business still exists. HTTP status: $FINAL_READ_RESPONSE${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Final READ successful. Business not found (HTTP 404), as expected.${NC}"

  print_header "🎉 CRUD Test Completed Successfully! 🎉"
}

# Run the main function
main
