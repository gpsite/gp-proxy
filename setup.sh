#!/bin/bash

echo "🚀 Starting Nebula Proxy Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update -y

# 2. Install Node.js (Latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# 4. Install Git (usually installed, just making sure)
sudo apt-get install -y git

# 5. Project Setup (Assuming code is uploaded to ~/proxy-portal)
# User needs to upload files first or git clone. 
# We'll assume the directory exists or user is running this script inside it.

echo "📂 Installing Project Dependencies..."
# Ensure we are in the right directory, if running from inside the project
if [ -f "package.json" ]; then
    npm install
else
    echo "⚠️ package.json not found in current directory. Please run this script inside the project folder."
fi

# 6. Configure Nginx
echo "🔧 Configuring Nginx..."
# Create a temp config file based on our local nginx.conf
# Note: In a real scenario, we'd copy the nginx.conf from the repo to /etc/nginx/sites-available
# Since we have the file locally in the project:
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/default
    sudo service nginx restart
    echo "✅ Nginx Configured."
else
    echo "⚠️ nginx.conf not found. Skipping Nginx config update."
fi

# 7. Start App with PM2 (Process Manager)
echo "🚀 Starting Application..."
sudo npm install -g pm2
pm2 start server.js --name "proxy-portal"
pm2 save
pm2 startup | tail -n 1 | sudo bash

echo "✅ Deployment Complete! Visit your EC2 URL."
