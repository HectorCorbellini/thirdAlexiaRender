#!/bin/bash

# =============================================================================
# ALEXIA Platform - Multi-Platform Deployment Script
# Version 3.0.0 - Enterprise Multi-Bot Orchestration
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Detect available deployment platforms
print_status "Detecting available deployment platforms..."

PLATFORMS=()
if [ -d "deployments/render" ]; then
    PLATFORMS+=("render")
fi
if [ -d "deployments/railway" ]; then
    PLATFORMS+=("railway")
fi

if [ ${#PLATFORMS[@]} -eq 0 ]; then
    print_error "No deployment configurations found in deployments/ directory"
    print_status "Available platforms should be in: deployments/{platform}/"
    exit 1
fi

print_success "Found deployment configurations for: ${PLATFORMS[*]}"

# Ask user to choose platform
echo ""
echo "Available deployment platforms:"
for i in "${!PLATFORMS[@]}"; do
    echo "$((i+1)). ${PLATFORMS[$i]}"
done

read -p "Choose deployment platform (1-${#PLATFORMS[@]}): " choice

if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#PLATFORMS[@]} ]; then
    print_error "Invalid choice. Please select a number between 1 and ${#PLATFORMS[@]}"
    exit 1
fi

PLATFORM=${PLATFORMS[$((choice-1))]}
print_status "Selected deployment platform: $PLATFORM"

# Copy deployment files to root
print_status "Preparing deployment files for $PLATFORM..."

if [ -f "deployments/$PLATFORM/${PLATFORM}.yaml" ]; then
    cp "deployments/$PLATFORM/${PLATFORM}.yaml" "./${PLATFORM}.yaml"
    print_success "Copied ${PLATFORM}.yaml to root"
fi

if [ -f "deployments/$PLATFORM/${PLATFORM}.toml" ]; then
    cp "deployments/$PLATFORM/${PLATFORM}.toml" "./${PLATFORM}.toml"
    print_success "Copied ${PLATFORM}.toml to root"
fi

# Run platform-specific deployment script if it exists
if [ -f "deployments/$PLATFORM/deploy-to-${PLATFORM}.sh" ]; then
    print_status "Running platform-specific deployment script..."
    chmod +x "deployments/$PLATFORM/deploy-to-${PLATFORM}.sh"
    "./deployments/$PLATFORM/deploy-to-${PLATFORM}.sh"
else
    print_status "No platform-specific script found. Here's how to deploy manually:"
    echo ""
    echo "For $PLATFORM deployment:"
    echo "1. Go to https://dashboard.${PLATFORM}.com"
    echo "2. Connect your GitHub repository"
    echo "3. Use the configuration files in deployments/$PLATFORM/"
    echo "4. Set environment variables as documented"
fi

print_success "Deployment preparation complete for $PLATFORM!"
echo ""
print_status "Next steps:"
echo "1. Push any changes to GitHub (if needed)"
echo "2. Follow the deployment instructions above"
echo "3. Set environment variables in your $PLATFORM dashboard"
echo ""
print_status "Your deployment configuration is ready!"
