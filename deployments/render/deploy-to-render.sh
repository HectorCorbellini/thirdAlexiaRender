#!/bin/bash

# =============================================================================
# ALEXIA Platform - Render Deployment Script
# Version 3.0.0 - Enterprise Multi-Bot Orchestration
# =============================================================================

echo "🚀 ALEXIA Platform - Render Deployment Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Checking deployment configuration..."

# Check required files
REQUIRED_FILES=("render.yaml" "netlify.toml" "backend/.env.example" "frontend/.env")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

echo ""
echo "🔧 Deployment Configuration Summary:"
echo "===================================="
echo "• Backend: Node.js web service with PostgreSQL"
echo "• Frontend: Static site with API proxy to backend"
echo "• Database: Managed PostgreSQL instance"
echo "• Auto-deploy: Enabled for both services"
echo ""

# Generate deployment commands
echo "📝 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. 🚀 Deploy to Render:"
echo "   a. Go to https://dashboard.render.com"
echo "   b. Click 'New +' → 'Blueprint'"
echo "   c. Connect your GitHub repository"
echo "   d. Select 'render.yaml' as your blueprint"
echo ""
echo "2. ⚙️  Configure Environment Variables:"
echo "   After deployment, set these in your Render dashboard:"
echo ""
echo "   Backend Service (alexia-backend):"
echo "   • TELEGRAM_BOT_TOKEN=your_bot_token_here"
echo "   • GROQ_API_KEY=your_groq_api_key"
echo "   • OPENAI_API_KEY=your_openai_api_key (optional)"
echo ""
echo "3. 🗄️  Database Setup:"
echo "   The PostgreSQL database will be created automatically"
echo "   Database migrations will run on first deployment"
echo ""
echo "4. 🌐 Access Your Application:"
echo "   • Frontend: https://alexia-frontend.onrender.com"
echo "   • Backend API: https://alexia-backend.onrender.com"
echo "   • Database: Internal service (alexia-db)"
echo ""

# Show current git status
echo "🔍 Git Status:"
echo "=============="
git status --porcelain || echo "Not a git repository or no changes"

echo ""
echo "⚠️  Important Notes:"
echo "==================="
echo "• Make sure your .env file has placeholder values (no real secrets)"
echo "• Real API keys should only be set in Render dashboard"
echo "• The deployment will fail if TELEGRAM_BOT_TOKEN is not set"
echo "• Database migrations run automatically on first deployment"
echo ""

echo "✅ Deployment configuration is ready!"
echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub (if not already)"
echo "2. Deploy via Render dashboard using render.yaml"
echo "3. Set environment variables in Render"
echo "4. Monitor deployment logs"
echo ""
echo "Happy deploying! 🚀"
