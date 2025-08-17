#!/bin/bash

# Cash Management - Production Deployment Script for cPanel/Shared Hosting
# This script prepares the application for production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    error "Please run this script from the Laravel project root directory."
fi

log "Starting Cash Management production deployment preparation..."

# Check for Node.js and npm
if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install Node.js and npm first."
fi

if ! command -v composer &> /dev/null; then
    error "Composer is not installed. Please install Composer first."
fi

# Build frontend assets for production
log "Building frontend assets for production..."
npm run build

if [ $? -ne 0 ]; then
    error "Failed to build frontend assets. Please check for errors."
fi

# Install/update composer dependencies for production
log "Installing Composer dependencies for production..."
composer install --optimize-autoloader --no-dev --no-interaction

if [ $? -ne 0 ]; then
    error "Failed to install Composer dependencies."
fi

# Generate application key if not exists
log "Generating application key..."
php artisan key:generate --force

# Detect environment and generate configuration
log "Detecting environment and generating optimal configuration..."
php artisan env:detect
php artisan env:config --generate --force

# Clear all caches
log "Clearing all caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
php artisan event:clear

# Optimize for production
log "Optimizing Laravel for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Set proper permissions for local testing
log "Setting proper permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Create production archive
log "Creating production deployment archive..."
ARCHIVE_NAME="cashmanagement-production-$(date +%Y%m%d_%H%M%S).zip"

# Create temporary directory for clean files
TEMP_DIR="/tmp/cashmanagement-production"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy files excluding development files
rsync -av \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='node_modules' \
    --exclude='tests' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/data/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='.gitignore' \
    --exclude='*.md' \
    --exclude='deploy*.sh' \
    --exclude='*.sh' \
    --exclude='phpunit.xml' \
    --exclude='.phpunit.cache' \
    --exclude='package-lock.json' \
    --exclude='eslint.config.js' \
    --exclude='tailwind.config.js' \
    --exclude='tsconfig.json' \
    --exclude='vite.config.ts' \
    --exclude='components.json' \
    ./ "$TEMP_DIR/"

# Create the archive
cd "$TEMP_DIR"
zip -r "../$ARCHIVE_NAME" .
cd - > /dev/null

# Move archive to project root
mv "/tmp/$ARCHIVE_NAME" "./"

# Cleanup
rm -rf "$TEMP_DIR"

log "Production deployment preparation completed successfully!"
echo
echo -e "${BLUE}=== Production Deployment Summary ===${NC}"
echo -e "Archive created: ${GREEN}$ARCHIVE_NAME${NC}"
echo -e "Environment template: ${GREEN}env-production-template.txt${NC}"
echo -e "Deployment guide: ${GREEN}PRODUCTION_DEPLOYMENT_GUIDE.md${NC}"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Upload $ARCHIVE_NAME to your cPanel File Manager"
echo "2. Extract the archive in your hosting account"
echo "3. Follow the instructions in PRODUCTION_DEPLOYMENT_GUIDE.md"
echo "4. Create .env file using env-production-template.txt"
echo "5. Configure your database and other settings"
echo
echo -e "${GREEN}Your application is ready for production deployment!${NC}"

# Generate Reverb keys for reference
log "Generating Laravel Reverb keys for reference..."
echo
echo -e "${BLUE}=== Laravel Reverb Configuration ===${NC}"
echo "Add these to your production .env file:"
echo
echo "REVERB_APP_ID=$(openssl rand -hex 4)"
echo "REVERB_APP_KEY=$(openssl rand -base64 32 | tr -d '=' | head -c 32)"
echo "REVERB_APP_SECRET=$(openssl rand -base64 64 | tr -d '=' | head -c 64)"
echo
echo -e "${YELLOW}Note: For shared hosting, consider using Pusher instead of Reverb${NC}"
echo "See PRODUCTION_DEPLOYMENT_GUIDE.md for WebSocket alternatives"
