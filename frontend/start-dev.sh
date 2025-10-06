#!/bin/bash

echo "🚀 Starting ALEXIA Frontend Development Server..."
echo "================================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Vite dev server
echo "🔥 Starting Vite dev server on port 8080..."
vite --port 8080 --host
