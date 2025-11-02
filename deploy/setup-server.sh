#!/bin/bash

# Hetzner Server Setup Script for Product Detector API
# Run this script on a fresh Hetzner Ubuntu server

set -e  # Exit on error

echo "🚀 Starting Hetzner Server Setup..."
echo ""

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker
echo "🐋 Installing Docker..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

echo "✅ Docker installed successfully"

# Install Docker Compose (standalone)
echo "📦 Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

echo "✅ Docker Compose installed successfully"

# Configure firewall
echo "🔥 Configuring firewall..."
apt-get install -y ufw

# Allow SSH, HTTP, and HTTPS
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Enable firewall
ufw --force enable

echo "✅ Firewall configured"

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/detector-api
cd /opt/detector-api

# Create directories for SSL certificates
mkdir -p certbot/conf certbot/www

echo "✅ Application directory created"

# Create .env file template
cat > .env << 'EOF'
# Domain Configuration
DOMAIN_NAME=your-domain.com
LETSENCRYPT_EMAIL=your-email@example.com

# GitHub Container Registry
GITHUB_REPOSITORY=your-username/detector-api

# Backend Configuration
MODEL_PATH=/app/best (1).pt
CONFIDENCE_THRESHOLD=0.25
ALLOWED_ORIGINS=https://your-domain.com
EOF

echo "📝 Created .env template - PLEASE EDIT THIS FILE!"

# Install Certbot for Let's Encrypt
echo "🔐 Installing Certbot..."
apt-get install -y certbot

echo "✅ Certbot installed"

# Set up log rotation
echo "📋 Setting up log rotation..."
cat > /etc/logrotate.d/detector-api << 'EOF'
/opt/detector-api/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
EOF

mkdir -p /opt/detector-api/logs

echo "✅ Log rotation configured"

# Create initial nginx configuration for HTTP (before SSL)
echo "🌐 Creating initial nginx configuration..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 "Server is ready for deployment";
            add_header Content-Type text/plain;
        }
    }
}
EOF

echo ""
echo "=============================================="
echo "✅ Server setup completed!"
echo "=============================================="
echo ""
echo "⚠️  NEXT STEPS:"
echo ""
echo "1. Edit /opt/detector-api/.env with your configuration:"
echo "   - Set DOMAIN_NAME to your domain"
echo "   - Set LETSENCRYPT_EMAIL to your email"
echo "   - Set GITHUB_REPOSITORY to your repo"
echo ""
echo "2. Point your domain's DNS A record to this server's IP"
echo ""
echo "3. Generate SSL certificate:"
echo "   certbot certonly --standalone -d your-domain.com --email your-email@example.com --agree-tos"
echo ""
echo "4. Set up GitHub Secrets in your repository:"
echo "   - HETZNER_SSH_KEY: Your SSH private key"
echo "   - HETZNER_HOST: This server's IP address"
echo "   - HETZNER_USER: root"
echo "   - DOMAIN_NAME: Your domain"
echo ""
echo "5. Push to main branch to trigger deployment"
echo ""
echo "=============================================="

