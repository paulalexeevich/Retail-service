#!/bin/bash

# Manual deployment update script
# Run this script on the Hetzner server to manually update the application

set -e  # Exit on error

echo "🔄 Starting manual deployment update..."
echo ""

# Change to application directory
cd /opt/detector-api

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create /opt/detector-api/.env file first"
    exit 1
fi

# Load environment variables
export $(cat .env | xargs)

# Pull latest code (if using git deployment)
if [ -d .git ]; then
    echo "📥 Pulling latest code from git..."
    git pull origin main
fi

# Pull latest Docker images
echo "🐋 Pulling latest Docker images..."
docker compose pull

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose down

# Start new containers
echo "🚀 Starting new containers..."
docker compose up -d --remove-orphans

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🏥 Running health check..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    echo "Checking logs..."
    docker compose logs --tail=50
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -af

echo ""
echo "=============================================="
echo "✅ Deployment update completed successfully!"
echo "=============================================="
echo ""
echo "Service status:"
docker compose ps

echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""

