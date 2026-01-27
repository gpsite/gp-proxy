#!/bin/bash

echo "🚀 Applying Adblocker Updates on Ubuntu..."

# 1. Install new dependencies
echo "📦 Installing Dependencies..."
npm install

# 2. Restart Application
echo "🔄 Restarting Application..."

if command -v pm2 &> /dev/null; then
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
            exit 1
        fi
    fi
else
    echo "⚠️ PM2 not found. Starting with node..."
    node server.js
fi

echo "✅ Adblocker Update Applied!"
