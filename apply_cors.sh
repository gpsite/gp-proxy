#!/bin/bash

echo "🚀 Applying CORS Configuration..."

# 1. Install Dependencies (to ensure 'cors' is installed)
echo "📦 Installing Dependencies..."
npm install

# 2. Restart Application
echo "🔄 Restarting Application..."

# Check if pm2 is running the process
if pm2 list | grep -q "proxy-portal"; then
    echo "Found pm2 process 'proxy-portal'. Restarting..."
    pm2 restart proxy-portal
else
    echo "⚠️ PM2 process 'proxy-portal' not found. Trying to start it..."
    if [ -f "server.js" ]; then
        pm2 start server.js --name "proxy-portal"
        echo "✅ Started 'proxy-portal' with pm2."
    else
        echo "❌ server.js not found! Cannot start."
    fi
fi

echo "✅ CORS Configuration Applied!"
