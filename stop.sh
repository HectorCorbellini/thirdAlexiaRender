#!/bin/bash

# Ports to check and kill
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ALEXIA - Shutdown Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "Killing processes on port $port (PIDs: $pids)..."
        kill -9 $pids
        echo -e "${GREEN}✓ Port $port is now free.${NC}\n"
    else
        echo -e "${GREEN}✓ Port $port is already free.${NC}\n"
    fi
}

# Kill processes on both ports
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

echo -e "${GREEN}All ALEXIA processes have been stopped.${NC}"
