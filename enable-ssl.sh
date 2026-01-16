#!/bin/bash

# Configuration
DOMAIN="ec2-3-92-139-4.compute-1.amazonaws.com"
CERT_DIR="/etc/nginx/ssl"

echo "🔒 Setting up Self-Signed SSL for $DOMAIN..."
echo "⚠️  NOTE: This will cause a 'Not Secure' warning in browsers because it is self-signed."
echo "⚠️  To get a green lock, you need a custom domain name (e.g., example.com) and use Certbot."

# 1. Create Directory
sudo mkdir -p $CERT_DIR

# 2. Generate Private Key and Certificate
# Valid for 365 days
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $CERT_DIR/nginx-selfsigned.key \
    -out $CERT_DIR/nginx-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=NebulaProxy/OU=IT/CN=$DOMAIN"

# 3. Generate Diffie-Hellman Group (for better security, optional but recommended)
# Skipping for speed in this demo, but good for production
# sudo openssl dhparam -out $CERT_DIR/dhparam.pem 2048

# 4. Create Nginx SSL Config
echo "🔧 Updating Nginx configuration..."

cat > nginx-ssl.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate $CERT_DIR/nginx-selfsigned.crt;
    ssl_certificate_key $CERT_DIR/nginx-selfsigned.key;

    # Basic SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 5. Apply Config
sudo cp nginx-ssl.conf /etc/nginx/sites-available/default
sudo nginx -t

echo "🔄 Restarting Nginx..."
sudo service nginx restart

echo "✅ HTTPS Enabled (Self-Signed)!"
echo "👉 https://$DOMAIN"
