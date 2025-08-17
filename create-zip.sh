#!/bin/bash

# Quick ZIP deployment package creator for CashManagement
# Creates ZIP file instead of tar.gz for easier handling

set -e

APP_NAME="cashmanagement"
BUILD_DIR="build_$(date +%Y%m%d_%H%M%S)"
CURRENT_DIR=$(pwd)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log "Creating ZIP deployment package..."

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "Error: Please run this script from the Laravel project root directory."
    exit 1
fi

# Build frontend assets
log "Building frontend assets..."
npm run build

# Create build directory
mkdir -p "$BUILD_DIR"

# Copy application files (excluding development files)
log "Copying application files..."
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
    --exclude='README.md' \
    --exclude='*.md' \
    --exclude='docker-compose.yml' \
    --exclude='Dockerfile' \
    --exclude="$BUILD_DIR" \
    --exclude='create-zip.sh' \
    --exclude='pre-deploy.sh' \
    --exclude='docker-deploy.sh' \
    --exclude='.phpunit.result.cache' \
    --exclude='phpunit.xml' \
    --exclude='vite.config.js' \
    --exclude='tailwind.config.js' \
    --exclude='postcss.config.js' \
    --exclude='package.json' \
    --exclude='package-lock.json' \
    --exclude='eslint.config.js' \
    --exclude='tsconfig.json' \
    --exclude='components.json' \
    ./ "$BUILD_DIR/"

# Copy production htaccess
if [ -f ".htaccess-production" ]; then
    cp .htaccess-production "$BUILD_DIR/public/.htaccess"
fi

# Create required directories
mkdir -p "$BUILD_DIR/storage/logs"
mkdir -p "$BUILD_DIR/storage/framework/cache/data"
mkdir -p "$BUILD_DIR/storage/framework/sessions"
mkdir -p "$BUILD_DIR/storage/framework/views"
mkdir -p "$BUILD_DIR/bootstrap/cache"

# Create .env.example for production
cat > "$BUILD_DIR/.env.example" <<'EOF'
APP_NAME="CashManagement"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost/cashmanagement

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cashmanagement_db
DB_USERNAME=cashmanagement_user
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
EOF

# Create ZIP archive
log "Creating ZIP archive..."
local archive_name="${APP_NAME}_production_$(date +%Y%m%d_%H%M%S).zip"

# Check if zip command exists
if ! command -v zip &> /dev/null; then
    echo "Error: 'zip' command not found. Please install zip:"
    echo "Ubuntu/Debian: sudo apt-get install zip"
    echo "CentOS/RHEL: sudo yum install zip"
    exit 1
fi

zip -r "$archive_name" "$BUILD_DIR"/* -x "*.git*" "*.DS_Store*" > /dev/null

# Get archive size
local size=$(du -h "$archive_name" | cut -f1)

log "ZIP archive created: $archive_name (Size: $size)"

# Clean up build directory
rm -rf "$BUILD_DIR"

echo
echo -e "${BLUE}=== ZIP Deployment Package Created ===${NC}"
echo -e "Archive: ${GREEN}$archive_name${NC}"
echo -e "Size: ${GREEN}$size${NC}"
echo
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Upload $archive_name to your server (via SCP, FTP, or web upload)"
echo "2. On server, extract: sudo unzip $archive_name -d /var/www/html/cashmanagement"
echo "3. Run deployment: cd /var/www/html/cashmanagement && sudo chmod +x deploy.sh && sudo ./deploy.sh"
echo
echo -e "${GREEN}ZIP package ready for deployment! 🚀${NC}"
