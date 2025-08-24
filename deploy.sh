#!/bin/bash

# Production Deployment Script for Meal Scamp
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting Production Deployment for Meal Scamp..."

# Step 1: Stop any existing services
echo "📋 Step 1: Stopping existing services..."
sudo systemctl stop meal-scamp 2>/dev/null || echo "No existing service to stop"
pkill -f "node www/index.js" 2>/dev/null || echo "No existing processes to kill"

# Step 2: Clean and build
echo "🔨 Step 2: Building production application..."
npm run clean
npm run build

# Step 3: Verify build output
if [ ! -f "www/index.js" ]; then
    echo "❌ Build failed - www/index.js not found"
    exit 1
fi

echo "✅ Build successful - www/index.js created"

# Step 4: Test the build locally
echo "🧪 Step 3: Testing build locally..."
PORT=3003 node www/index.js &
SERVER_PID=$!
sleep 5

if curl -s http://localhost:3003 > /dev/null; then
    echo "✅ Local test successful - server responding"
else
    echo "❌ Local test failed - server not responding"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Step 5: Stop local test server
kill $SERVER_PID 2>/dev/null || echo "Local server stopped"

# Step 6: Install/Update systemd service
echo "⚙️  Step 4: Installing systemd service..."
sudo cp meal-scamp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable meal-scamp

# Step 7: Start production service
echo "🚀 Step 5: Starting production service..."
sudo systemctl start meal-scamp

# Step 8: Wait for service to be ready
echo "⏳ Step 6: Waiting for service to be ready..."
sleep 5

# Step 9: Check service status
echo "📊 Step 7: Checking service status..."
if sudo systemctl is-active --quiet meal-scamp; then
    echo "✅ Service is running successfully"
else
    echo "❌ Service failed to start"
    sudo systemctl status meal-scamp
    exit 1
fi

# Step 10: Test production endpoint
echo "🌐 Step 8: Testing production endpoint..."
if curl -s http://localhost:3003 > /dev/null; then
    echo "✅ Production endpoint responding"
else
    echo "❌ Production endpoint not responding"
    exit 1
fi

# Step 11: Final status check
echo "📋 Final Status:"
sudo systemctl status meal-scamp --no-pager -l

echo ""
echo "🎉 PRODUCTION DEPLOYMENT COMPLETE!"
echo "🌐 Your app is now running at: http://localhost:3003"
echo "📱 Caddy should be serving it at: https://meal-scamp.tibocin.xyz"
echo ""
echo "📊 Service Management Commands:"
echo "  View logs: sudo journalctl -u meal-scamp -f"
echo "  Restart:  sudo systemctl restart meal-scamp"
echo "  Stop:     sudo systemctl stop meal-scamp"
echo "  Status:   sudo systemctl status meal-scamp"
