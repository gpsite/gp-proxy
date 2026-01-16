#!/bin/bash

echo "🔓 Disabling SSL and reverting to HTTP..."

# 1. Restore Nginx Config to HTTP
echo "🔧 Restoring Nginx HTTP configuration..."
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/default
    echo "✅ Restored default nginx.conf"
else
    echo "⚠️  nginx.conf not found! Cannot restore automatically."
    exit 1
fi

# 2. Remove SSL Certificates
echo "🗑️  Removing SSL Certificates..."
sudo rm -rf /etc/nginx/ssl
sudo rm -f /etc/nginx/sites-available/nginx-ssl.conf

# 3. Restart Nginx
echo "🔄 Restarting Nginx..."
sudo service nginx restart

echo "✅ SSL Disabled. Your site is back on HTTP."
echo "👉 http://ec2-3-92-139-4.compute-1.amazonaws.com"
