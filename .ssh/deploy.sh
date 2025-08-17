#!/bin/bash

# CashManagement Deployment Script
# This script sets up the application to run on port 80 with proper permissions

echo "🚀 Starting CashManagement deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to run as root for port 80 access"
    echo "Run: sudo bash .ssh/deploy.sh"
    exit 1
fi

# Get the actual user (not root when using sudo)
ACTUAL_USER=${SUDO_USER:-$USER}
PROJECT_DIR="/var/www/cashmanagement"

echo "📁 Setting up project directory..."
mkdir -p $PROJECT_DIR
chown -R $ACTUAL_USER:www-data $PROJECT_DIR

# Copy project files
echo "📋 Copying project files..."
cp -r . $PROJECT_DIR/
cd $PROJECT_DIR

# Set proper file permissions
echo "🔐 Setting file permissions..."
# Directories should be 755
find $PROJECT_DIR -type d -exec chmod 755 {} \;
# Files should be 644
find $PROJECT_DIR -type f -exec chmod 644 {} \;
# Make scripts executable
chmod +x $PROJECT_DIR/.ssh/deploy.sh
chmod +x $PROJECT_DIR/artisan
chmod +x $PROJECT_DIR/.ssh/start-server.sh

# Storage and cache directories need write permissions
echo "📝 Setting storage permissions..."
chmod -R 775 $PROJECT_DIR/storage
chmod -R 775 $PROJECT_DIR/bootstrap/cache
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/storage
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/bootstrap/cache

# Create .env from example if not exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "⚙️ Creating .env file..."
    cp $PROJECT_DIR/.env.example $PROJECT_DIR/.env
    chown $ACTUAL_USER:www-data $PROJECT_DIR/.env
    chmod 644 $PROJECT_DIR/.env
fi

# Install PHP dependencies (Composer)
echo "📦 Installing PHP dependencies..."
if command -v composer &> /dev/null; then
    sudo -u $ACTUAL_USER composer install --no-dev --optimize-autoloader
else
    echo "⚠️ Composer not found. Install it first:"
    echo "curl -sS https://getcomposer.org/installer | php"
    echo "sudo mv composer.phar /usr/local/bin/composer"
fi

# Generate application key
echo "🔑 Generating application key..."
sudo -u $ACTUAL_USER php artisan key:generate

# Set up database (if SQLite)
echo "🗄️ Setting up database..."
if [ ! -f "$PROJECT_DIR/database/database.sqlite" ]; then
    sudo -u $ACTUAL_USER touch $PROJECT_DIR/database/database.sqlite
    chmod 664 $PROJECT_DIR/database/database.sqlite
    chown $ACTUAL_USER:www-data $PROJECT_DIR/database/database.sqlite
fi

# Run migrations
sudo -u $ACTUAL_USER php artisan migrate --force

# Clear and cache config
echo "🧹 Optimizing application..."
sudo -u $ACTUAL_USER php artisan config:clear
sudo -u $ACTUAL_USER php artisan cache:clear
sudo -u $ACTUAL_USER php artisan config:cache
sudo -u $ACTUAL_USER php artisan route:cache

echo "✅ Deployment complete!"
echo "🌐 Your application is ready to run on port 80"
echo "📍 Project location: $PROJECT_DIR"
echo ""
echo "To start the server:"
echo "cd $PROJECT_DIR && sudo bash .ssh/start-server.sh"
echo ""
echo "Your app will be available at: http://141.144.235.74"
