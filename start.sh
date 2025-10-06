#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default admin credentials
DEFAULT_EMAIL="admin@alexia.com"
DEFAULT_PASSWORD="admin123456"
DEFAULT_NAME="Admin User"
DEFAULT_ROLE="SUPERADMIN"

# Ports to check and kill
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ALEXIA - Startup Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Killing processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        
        # Wait for processes to fully terminate
        local max_wait=5
        local count=0
        while lsof -ti:$port >/dev/null 2>&1 && [ $count -lt $max_wait ]; do
            sleep 1
            count=$((count + 1))
        done
        
        echo -e "${GREEN}✓ Port $port is now free${NC}"
    else
        echo -e "${GREEN}✓ Port $port is already free${NC}"
    fi
}

# Function to check if admin user exists
check_admin_exists() {
    local response=$(curl -s -X POST http://localhost:$BACKEND_PORT/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$DEFAULT_EMAIL\",\"password\":\"$DEFAULT_PASSWORD\"}" 2>/dev/null)
    
    if echo "$response" | grep -q "token"; then
        return 0  # Admin exists
    else
        return 1  # Admin doesn't exist
    fi
}

# Function to create admin user
create_admin_user() {
    local email=${1:-$DEFAULT_EMAIL}
    local password=${2:-$DEFAULT_PASSWORD}
    local name=${3:-$DEFAULT_NAME}
    local role=${4:-$DEFAULT_ROLE}
    
    echo -e "\n${BLUE}Creating admin user...${NC}"
    
    local response=$(curl -s -X POST http://localhost:$BACKEND_PORT/api/auth/register \
        -H "Content-Type: application/json" \
        -d "{
            \"email\":\"$email\",
            \"password\":\"$password\",
            \"name\":\"$name\",
            \"role\":\"$role\"
        }")
    
    if echo "$response" | grep -q "token"; then
        echo -e "${GREEN}✓ Admin user created successfully${NC}"
        echo -e "${GREEN}  Email: $email${NC}"
        echo -e "${GREEN}  Password: $password${NC}"
        echo -e "${GREEN}  Role: $role${NC}"
    else
        echo -e "${RED}✗ Failed to create admin user${NC}"
        echo -e "${RED}  Response: $response${NC}"
    fi
}

# Parse command line arguments
CREATE_USER=false
CUSTOM_EMAIL=""
CUSTOM_PASSWORD=""
CUSTOM_NAME=""
CUSTOM_ROLE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --create-user)
            CREATE_USER=true
            shift
            ;;
        --email)
            CUSTOM_EMAIL="$2"
            shift 2
            ;;
        --password)
            CUSTOM_PASSWORD="$2"
            shift 2
            ;;
        --name)
            CUSTOM_NAME="$2"
            shift 2
            ;;
        --role)
            CUSTOM_ROLE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: ./start.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --create-user          Create default admin user after startup"
            echo "  --email EMAIL          Custom admin email (default: admin@alexia.com)"
            echo "  --password PASSWORD    Custom admin password (default: admin123456)"
            echo "  --name NAME            Custom admin name (default: Admin User)"
            echo "  --role ROLE            Custom admin role (default: SUPERADMIN)"
            echo "  --help                 Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./start.sh --create-user"
            echo "  ./start.sh --create-user --email custom@email.com --password mypass123"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Step 1: Kill processes on required ports
echo -e "${BLUE}Step 1: Checking and freeing ports...${NC}"
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
echo ""

# Step 2: Start backend server
echo -e "${BLUE}Step 2: Starting backend server...${NC}"
cd backend
pnpm start > backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Backend server starting (PID: $BACKEND_PID)${NC}"
echo -e "${YELLOW}  Waiting for backend to be ready...${NC}"

# Wait for backend to be ready
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1 || \
       lsof -i:$BACKEND_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend server is ready on port $BACKEND_PORT${NC}"
        break
    fi
    sleep 1
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}✗ Backend server failed to start${NC}"
        echo -e "${YELLOW}  Check backend.log for details${NC}"
        exit 1
    fi
done
echo ""

# Step 3: Start frontend server
echo -e "${BLUE}Step 3: Starting frontend server...${NC}"
cd frontend
pnpm dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend server starting (PID: $FRONTEND_PID)${NC}"
echo -e "${YELLOW}  Waiting for frontend to be ready...${NC}"

# Wait for frontend to be ready
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if lsof -i:$FRONTEND_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend server is ready on port $FRONTEND_PORT${NC}"
        break
    fi
    sleep 1
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}✗ Frontend server failed to start${NC}"
        echo -e "${YELLOW}  Check frontend.log for details${NC}"
        exit 1
    fi
done
echo ""

# Step 4: Ensure admin user exists
sleep 2 # Give backend a moment to fully initialize

if ! check_admin_exists; then
    echo -e "${YELLOW}Admin user not found. Creating default admin...${NC}"
    create_admin_user
else
    echo -e "${GREEN}✓ Default admin user already exists.${NC}"
fi
echo ""

# Final summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ ALEXIA is now running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Backend:${NC}  http://localhost:$BACKEND_PORT"
echo -e "${GREEN}Frontend:${NC} http://localhost:$FRONTEND_PORT"
echo ""
echo -e "${YELLOW}Default Admin Credentials:${NC}"
echo -e "  Email:    ${DEFAULT_EMAIL}"
echo -e "  Password: ${DEFAULT_PASSWORD}"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:  tail -f backend/backend.log"
echo -e "  Frontend: tail -f frontend/frontend.log"
echo ""
echo -e "${YELLOW}To stop the servers:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID"
echo -e "  or use: ./stop.sh"
echo -e "${BLUE}========================================${NC}"

# Save PIDs to file for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
