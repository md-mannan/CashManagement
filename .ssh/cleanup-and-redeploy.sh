#!/bin/bash

# Cleanup and Redeploy Script for CashManagement
# Use this when you have permission issues with existing deployment

echo "🧹 CashManagement Cleanup and Redeploy..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to run as root"
    echo "Run: sudo bash .ssh/cleanup-and-redeploy.sh"
    exit 1
fi

# Get the actual user
ACTUAL_USER=${SUDO_USER:-$USER}
PROJECT_DIR="/var/www/cashmanagement"

echo "⚠️ This will completely remove and redeploy CashManagement"
echo "📍 Target directory: $PROJECT_DIR"
echo ""
read -p "Continue? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Stop any running servers
echo "🛑 Stopping any running servers..."
bash .ssh/stop-server.sh 2>/dev/null || true
pkill -f "php artisan serve" 2>/dev/null || true

# Remove existing deployment completely
if [ -d "$PROJECT_DIR" ]; then
    echo "🗑️ Removing existing deployment..."
    rm -rf $PROJECT_DIR
    echo "✅ Cleanup complete"
fi

# Fix git safe directory globally
echo "🔧 Fixing git configuration..."
sudo -u $ACTUAL_USER git config --global --add safe.directory $PROJECT_DIR

# Run fresh deployment
echo "🚀 Starting fresh deployment..."
bash .ssh/deploy.sh

echo ""
echo "✅ Cleanup and redeploy complete!"
echo "🚀 Start your server with: sudo bash .ssh/start-server.sh"
