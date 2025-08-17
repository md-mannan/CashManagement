#!/bin/bash

# Fix Storage Permissions Script for CashManagement
# This script fixes Laravel storage permission issues

echo "🔧 Fixing CashManagement storage permissions..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to run as root"
    echo "Run: sudo bash .ssh/fix-storage-permissions.sh"
    exit 1
fi

# Get actual user
ACTUAL_USER=${SUDO_USER:-$USER}
PROJECT_DIR="/var/www/cashmanagement"

echo "📁 Target directory: $PROJECT_DIR"
echo "👤 User: $ACTUAL_USER"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    echo "Run deployment first: sudo bash .ssh/deploy.sh"
    exit 1
fi

cd $PROJECT_DIR

# Create storage directories if they don't exist
echo "📂 Creating storage directories..."
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/app/public
mkdir -p bootstrap/cache

# Set proper ownership for entire project
echo "👥 Setting ownership..."
chown -R $ACTUAL_USER:www-data $PROJECT_DIR

# Set directory permissions (755 - readable/executable by all, writable by owner)
echo "🔐 Setting directory permissions..."
find $PROJECT_DIR -type d -exec chmod 755 {} \;

# Set file permissions (644 - readable by all, writable by owner)
echo "📄 Setting file permissions..."
find $PROJECT_DIR -type f -exec chmod 644 {} \;

# Set special permissions for storage and cache (775 - writable by group)
echo "💾 Setting storage permissions..."
chmod -R 775 $PROJECT_DIR/storage
chmod -R 775 $PROJECT_DIR/bootstrap/cache

# Set ownership for storage and cache
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/storage
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/bootstrap/cache

# Make scripts executable
echo "⚡ Making scripts executable..."
chmod +x $PROJECT_DIR/.ssh/*.sh
chmod +x $PROJECT_DIR/artisan

# Create log file if it doesn't exist
echo "📝 Setting up log file..."
touch $PROJECT_DIR/storage/logs/laravel.log
chmod 664 $PROJECT_DIR/storage/logs/laravel.log
chown $ACTUAL_USER:www-data $PROJECT_DIR/storage/logs/laravel.log

# Fix database permissions if it exists
if [ -f "$PROJECT_DIR/database/database.sqlite" ]; then
    echo "🗄️ Fixing database permissions..."
    chmod 664 $PROJECT_DIR/database/database.sqlite
    chown $ACTUAL_USER:www-data $PROJECT_DIR/database/database.sqlite
fi

# Clear Laravel caches to refresh permissions
echo "🧹 Clearing Laravel caches..."
sudo -u $ACTUAL_USER php artisan config:clear
sudo -u $ACTUAL_USER php artisan cache:clear
sudo -u $ACTUAL_USER php artisan view:clear

echo "✅ Storage permissions fixed!"
echo ""
echo "📋 Summary:"
echo "  - Storage directories: 775 (writable)"
echo "  - Log file: 664 (writable)"
echo "  - Owner: $ACTUAL_USER:www-data"
echo "  - Laravel caches cleared"
echo ""
echo "🚀 Try accessing your app now: http://141.144.235.74:8080"
