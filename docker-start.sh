#!/bin/bash

# =============================================================================
# ALEXIA Docker Quick Start Script
# =============================================================================

set -e

echo "========================================="
echo "   ALEXIA Docker Quick Start"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from example..."
    if [ -f .env.docker.example ]; then
        cp .env.docker.example .env
        echo "✅ Created .env file from .env.docker.example"
        echo ""
        echo "⚠️  IMPORTANT: Please edit the .env file with your actual configuration:"
        echo "   - JWT_SECRET (required for authentication)"
        echo "   - TELEGRAM_BOT_TOKEN or WHATSAPP_ACCESS_TOKEN (required for messaging)"
        echo "   - GROQ_API_KEY or OPENAI_API_KEY (required for AI responses)"
        echo ""
        read -p "Press Enter after you've configured the .env file..."
    else
        echo "❌ .env.docker.example not found. Cannot create .env file."
        exit 1
    fi
else
    echo "✅ .env file found"
fi

echo ""
echo "🐳 Building and starting Docker containers..."
echo ""

# Build and start services
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to initialize..."
echo "   (Database migrations and admin user creation happen automatically)"
sleep 15

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

# Check if backend is healthy
echo ""
echo "🔍 Checking backend health..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend is still starting up. Check logs with: docker compose logs backend"
fi

echo ""
echo "========================================="
echo "✅ ALEXIA is now running with Docker!"
echo "========================================="
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"
echo ""
echo "🔑 Default Admin Credentials:"
echo "  Email:    admin@alexia.com"
echo "  Password: admin123456"
echo ""
echo "📝 Useful commands:"
echo "  View logs:        docker compose logs -f"
echo "  View backend logs: docker compose logs -f backend"
echo "  Stop services:    docker compose down"
echo "  Restart services: docker compose restart"
echo ""
echo "📚 For more information, see DOCKER_README.md"
echo "========================================="
