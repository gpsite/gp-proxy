#!/bin/bash

echo "🔄 Updating Nebula Proxy..."

# 1. Pull latest code
echo "⬇️ Pulling from GitHub..."
git pull

# 2. Install new dependencies (if any)
echo "📦 Installing Dependencies..."
npm install

# 3. Restart Application
echo "🚀 Restarting Server..."
pm2 restart proxy-portal

echo "✅ Update Complete!"
