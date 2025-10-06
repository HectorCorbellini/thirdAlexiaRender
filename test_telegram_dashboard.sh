#!/bin/bash

echo "🧪 Testing ALEXIA Telegram Dashboard Integration"
echo "=============================================="

# Test 1: Check if frontend is running
echo -n "✅ Frontend (port 3000): "
if curl -s http://localhost:3000 | grep -q "vite"; then
    echo "✅ Running"
else
    echo "❌ Not accessible"
    exit 1
fi

# Test 2: Check if backend is running
echo -n "✅ Backend (port 3001): "
if curl -s http://localhost:3001/health | grep -q "ok"; then
    echo "✅ Running"
else
    echo "❌ Not accessible"
    exit 1
fi

# Test 3: Check if MessagingIntegrations component exists
echo -n "✅ MessagingIntegrations component: "
if [ -f "/home/uko/COLOMBIA/LOVABLE/alexia-/frontend/src/components/messaging/MessagingIntegrations.tsx" ]; then
    echo "✅ Exists"
else
    echo "❌ Missing"
    exit 1
fi

# Test 4: Check if messaging API service exists
echo -n "✅ Messaging API service: "
if [ -f "/home/uko/COLOMBIA/LOVABLE/alexia-/frontend/src/services/messagingAPI.ts" ]; then
    echo "✅ Exists"
else
    echo "❌ Missing"
    exit 1
fi

# Test 5: Check if TypeScript compiles (no errors)
echo -n "✅ TypeScript compilation: "
cd /home/uko/COLOMBIA/LOVABLE/alexia-/frontend
if npm run build > /tmp/build.log 2>&1; then
    echo "✅ Success"
else
    echo "❌ Failed"
    echo "Build errors:"
    cat /tmp/build.log | head -10
    exit 1
fi

# Test 6: Check if backend has basic structure for bot management
echo -n "✅ Backend structure: "
if [ -d "/home/uko/COLOMBIA/LOVABLE/alexia-/backend/src/services/messaging" ]; then
    echo "✅ Messaging services exist"
else
    echo "⚠️  Messaging services directory missing (expected for full implementation)"
fi

echo ""
echo "🎉 All basic tests passed!"
echo ""
echo "📋 Next Steps:"
echo "1. Backend API endpoints for bot management (/api/bots/*)"
echo "2. Database schema for Bots table"
echo "3. Bot orchestration service"
echo "4. Real API integration in frontend"
echo ""
echo "🚀 Ready for Phase 3: Backend Multi-Bot Orchestration"
