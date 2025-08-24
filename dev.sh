#!/bin/bash

# Development script for Meal Scamp
# This ensures clean process management and prevents collisions

echo "🧹 Cleaning up any existing processes..."
pkill -f "node www/index.js" 2>/dev/null
sudo systemctl stop meal-scamp 2>/dev/null

echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting production server on port 3003..."
    echo "📱 Access your app at: http://localhost:3003"
    echo "🛑 Press Ctrl+C to stop the server"
    echo ""
    echo "ℹ️  Note: Build warnings about Svelte 5 compatibility are expected"
    echo "   and don't affect functionality. They will be addressed in future updates."
    echo ""
    
    # Start the server
    PORT=3003 node www/index.js
else
    echo "❌ Build failed!"
    exit 1
fi
