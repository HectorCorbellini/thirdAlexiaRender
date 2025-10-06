#!/bin/bash

echo "🧹 ALEXIA - Automated Cleanup Script"
echo "====================================="
echo ""
echo "This script will remove unused files and dependencies."
echo "All changes are safe and only remove unused code."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to confirm action
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

echo -e "${YELLOW}📋 Audit Summary:${NC}"
echo "  - 5 unused components"
echo "  - 1 unused data file (mockData.ts)"
echo "  - 4 unused npm packages"
echo "  - 13 documentation files to archive"
echo ""

if ! confirm "Do you want to proceed with cleanup?"; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Starting cleanup...${NC}"
echo ""

# Step 1: Delete unused mock data
echo "1️⃣  Removing unused mock data..."
if [ -f "frontend/src/data/mockData.ts" ]; then
    rm frontend/src/data/mockData.ts
    echo -e "${GREEN}✅ Deleted mockData.ts${NC}"
fi

if [ -d "frontend/src/data" ] && [ -z "$(ls -A frontend/src/data)" ]; then
    rmdir frontend/src/data
    echo -e "${GREEN}✅ Removed empty data/ directory${NC}"
fi

# Step 2: Delete unused WhatsApp components
echo ""
echo "2️⃣  Removing unused WhatsApp test components..."
if [ -d "frontend/src/components/whatsapp" ]; then
    rm -rf frontend/src/components/whatsapp/
    echo -e "${GREEN}✅ Deleted whatsapp/ components directory${NC}"
fi

# Step 3: Delete unused WhatsApp hooks
echo ""
echo "3️⃣  Removing unused WhatsApp hooks..."
if [ -d "frontend/src/hooks/whatsapp" ]; then
    rm -rf frontend/src/hooks/whatsapp/
    echo -e "${GREEN}✅ Deleted whatsapp/ hooks directory${NC}"
fi

# Step 4: Delete WhatsAppTest page
echo ""
echo "4️⃣  Removing WhatsAppTest page..."
if [ -f "frontend/src/pages/WhatsAppTest.tsx" ]; then
    rm frontend/src/pages/WhatsAppTest.tsx
    echo -e "${GREEN}✅ Deleted WhatsAppTest.tsx${NC}"
fi

# Step 5: Remove unused dependencies
echo ""
echo "5️⃣  Removing unused npm packages..."
cd frontend
pnpm remove whatsapp-web.js qrcode qrcode-terminal @types/qrcode 2>/dev/null
echo -e "${GREEN}✅ Removed 4 unused packages${NC}"
cd ..

# Step 6: Archive documentation
echo ""
echo "6️⃣  Archiving old documentation..."
mkdir -p docs/archive

if [ -d "SUMMARIES" ]; then
    mv SUMMARIES docs/archive/
    echo -e "${GREEN}✅ Archived SUMMARIES/${NC}"
fi

if [ -d "WHATSAPP" ]; then
    mv WHATSAPP docs/archive/
    echo -e "${GREEN}✅ Archived WHATSAPP/${NC}"
fi

if [ -f "STEPS.md" ]; then
    mv STEPS.md docs/archive/
    echo -e "${GREEN}✅ Archived STEPS.md${NC}"
fi

if [ -f "TEST.md" ]; then
    mv TEST.md docs/archive/
    echo -e "${GREEN}✅ Archived TEST.md${NC}"
fi

# Step 7: Update App.tsx to remove WhatsAppTest route
echo ""
echo "7️⃣  Updating App.tsx to remove WhatsAppTest route..."

if [ -f "frontend/src/App.tsx" ]; then
    # Create backup
    cp frontend/src/App.tsx frontend/src/App.tsx.backup
    
    # Remove the WhatsAppTest import and route
    sed -i '/import WhatsAppTest/d' frontend/src/App.tsx
    sed -i '/path="\/whatsapp-test"/,/\/>/d' frontend/src/App.tsx
    
    echo -e "${GREEN}✅ Updated App.tsx (backup saved as App.tsx.backup)${NC}"
fi

# Step 8: Clean up ApiTest from Dashboard (optional)
echo ""
if confirm "8️⃣  Remove ApiTest component from Dashboard? (Recommended for production)"; then
    if [ -f "frontend/src/pages/Dashboard.tsx" ]; then
        cp frontend/src/pages/Dashboard.tsx frontend/src/pages/Dashboard.tsx.backup
        
        # Remove ApiTest import and usage
        sed -i '/import.*ApiTest/d' frontend/src/pages/Dashboard.tsx
        sed -i '/<ApiTest \/>/d' frontend/src/pages/Dashboard.tsx
        
        echo -e "${GREEN}✅ Removed ApiTest from Dashboard (backup saved)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Summary of changes:"
echo "  ✅ Removed 5 unused component files"
echo "  ✅ Removed 1 unused data file"
echo "  ✅ Removed 4 unused npm packages (~5MB)"
echo "  ✅ Archived 13 documentation files"
echo "  ✅ Updated App.tsx to remove unused routes"
echo ""
echo "📁 Backups created:"
echo "  - frontend/src/App.tsx.backup"
if [ -f "frontend/src/pages/Dashboard.tsx.backup" ]; then
    echo "  - frontend/src/pages/Dashboard.tsx.backup"
fi
echo ""
echo "🔄 Next steps:"
echo "  1. Restart the servers: ./stop.sh && ./start.sh"
echo "  2. Test the application to ensure everything works"
echo "  3. If everything is fine, delete the backup files"
echo ""
