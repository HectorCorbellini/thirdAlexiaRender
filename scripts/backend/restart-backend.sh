#!/bin/bash
# restart-backend.sh
# Fully restart the backend: kill all Node processes, clean dist, rebuild, and restart backend

set -e

cd "$(dirname "$0")/../backend"

# Kill all Node.js processes
pkill -9 node || true
sleep 2

# Remove compiled dist directory
rm -rf dist

# Build backend
pnpm build

# Start backend (in background)
pnpm start &

echo "✅ Backend restarted with clean build."
