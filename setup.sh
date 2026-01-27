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

# 4. Install Git
sudo apt-get install -y git

# 5. Clone Repository
echo "⬇️ Cloning repository..."
if [ -d "gp-proxy" ]; then
    echo "⚠️ Directory gp-proxy already exists. Pulling latest changes..."
    cd gp-proxy
    git pull
else
    git clone https://github.com/gpsite/gp-proxy.git
    cd gp-proxy
fi

# 6. Install Dependencies
echo "📂 Installing Project Dependencies..."
npm install

# 7. Configure Nginx
echo "🔧 Configuring Nginx..."
if [ -f "nginx.conf" ]; then
    # Backup default config if it exists
    if [ -f "/etc/nginx/sites-available/default" ]; then
        sudo mv /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    fi
    
    sudo cp nginx.conf /etc/nginx/sites-available/default
    
    # Test configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo service nginx restart
    echo "✅ Nginx Configured."
else
    echo "⚠️ nginx.conf not found in repository. Skipping Nginx config update."
fi

# 8. Start App with PM2
echo "🚀 Starting Application..."
sudo npm install -g pm2
# Stop existing instance if running
pm2 stop proxy-portal 2>/dev/null || true
pm2 delete proxy-portal 2>/dev/null || true

# Start new instance
pm2 start server.js --name "proxy-portal"
pm2 save
pm2 startup | tail -n 1 | sudo bash

echo "✅ Deployment Complete! Visit your EC2 URL."
