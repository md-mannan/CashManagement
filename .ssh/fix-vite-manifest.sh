#!/bin/bash

# Fix Vite Manifest Path for Laravel
# This script fixes the Vite manifest path issue in Laravel

echo "🔧 Fixing Vite manifest path for Laravel..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to run as root"
    echo "Run: sudo bash .ssh/fix-vite-manifest.sh"
    exit 1
fi

# Get actual user
ACTUAL_USER=${SUDO_USER:-$USER}
PROJECT_DIR="/var/www/cashmanagement"

cd $PROJECT_DIR

# Check if .vite/manifest.json exists
if [ -f "$PROJECT_DIR/public/build/.vite/manifest.json" ]; then
    echo "✅ Found Vite manifest at: public/build/.vite/manifest.json"
    
    # Copy the manifest to the expected location
    echo "📋 Copying manifest to Laravel's expected location..."
    cp "$PROJECT_DIR/public/build/.vite/manifest.json" "$PROJECT_DIR/public/build/manifest.json"
    
    # Set proper permissions
    chown $ACTUAL_USER:www-data "$PROJECT_DIR/public/build/manifest.json"
    chmod 644 "$PROJECT_DIR/public/build/manifest.json"
    
    echo "✅ Manifest copied successfully!"
    
else
    echo "❌ Vite manifest not found at: public/build/.vite/manifest.json"
    echo "⚠️ You need to build assets first"
    echo ""
    echo "On your local machine, run:"
    echo "  bash .ssh/build-and-commit.sh"
    echo "  git push origin client"
    echo ""
    echo "Then on this server:"
    echo "  git pull origin client"
    echo "  sudo bash .ssh/fix-vite-manifest.sh"
    exit 1
fi

# Also create a symlink as backup
echo "🔗 Creating symlink for future compatibility..."
ln -sf "$PROJECT_DIR/public/build/.vite/manifest.json" "$PROJECT_DIR/public/build/manifest.json.backup"

echo "✅ Vite manifest path fixed!"
echo ""
echo "📋 Files created:"
echo "  - public/build/manifest.json (copy)"
echo "  - public/build/manifest.json.backup (symlink)"
echo ""
echo "🚀 Laravel should now find the Vite manifest correctly!"
