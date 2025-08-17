#!/bin/bash

# Pre-deployment script for CashManagement
# This script prepares the application for deployment on resource-limited servers
# It builds assets locally and packages everything for deployment

set -e

# Configuration
APP_NAME="cashmanagement"
BUILD_DIR="build_$(date +%Y%m%d_%H%M%S)"
CURRENT_DIR=$(pwd)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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
check_environment() {
    log "Checking environment..."
    
    if [ ! -f "artisan" ]; then
        error "Please run this script from the Laravel project root directory."
    fi
    
    if [ ! -f "package.json" ]; then
        error "package.json not found. Make sure this is a Laravel project with frontend assets."
    fi
    
    # Check for required commands
    local deps=("php" "composer" "npm" "tar" "gzip")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            error "$dep is not installed. Please install it first."
        fi
    done
    
    log "Environment check passed."
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install PHP dependencies for production
    composer install --optimize-autoloader --no-dev --no-interaction
    
    # Install Node.js dependencies
    npm ci
    
    log "Dependencies installed."
}

# Build frontend assets
build_assets() {
    log "Building frontend assets for production..."
    
    # Build assets
    npm run build
    
    # Verify build directory exists
    if [ ! -d "public/build" ]; then
        error "Build failed - public/build directory not found."
    fi
    
    log "Frontend assets built successfully."
}

# Optimize Laravel
optimize_laravel() {
    log "Optimizing Laravel for production..."
    
    # Clear all caches first
    php artisan config:clear || true
    php artisan route:clear || true
    php artisan view:clear || true
    php artisan cache:clear || true
    
    # Create optimized autoloader
    composer dump-autoload --optimize
    
    log "Laravel optimized."
}

# Create deployment package
create_package() {
    log "Creating deployment package..."
    
    # Create build directory
    mkdir -p "$BUILD_DIR"
    
    # Copy application files (excluding development files)
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
    
    # Copy production htaccess to public directory
    if [ -f ".htaccess-production" ]; then
        cp .htaccess-production "$BUILD_DIR/public/.htaccess"
    fi
    
    # Create required directories
    mkdir -p "$BUILD_DIR/storage/logs"
    mkdir -p "$BUILD_DIR/storage/framework/cache/data"
    mkdir -p "$BUILD_DIR/storage/framework/sessions"
    mkdir -p "$BUILD_DIR/storage/framework/views"
    mkdir -p "$BUILD_DIR/bootstrap/cache"
    
    # Create .env.example with production settings
    cat > "$BUILD_DIR/.env.example" <<'EOF'
APP_NAME="CashManagement"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost/cashmanagement

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
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

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
EOF
    
    log "Deployment package created in $BUILD_DIR"
}

# Create compressed archive
create_archive() {
    log "Creating compressed archive..."
    
    local archive_name="${APP_NAME}_production_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    tar -czf "$archive_name" -C "$BUILD_DIR" .
    
    # Get archive size
    local size=$(du -h "$archive_name" | cut -f1)
    
    log "Archive created: $archive_name (Size: $size)"
    
    # Clean up build directory
    rm -rf "$BUILD_DIR"
    
    echo
    echo -e "${BLUE}=== Pre-deployment Summary ===${NC}"
    echo -e "Archive: ${GREEN}$archive_name${NC}"
    echo -e "Size: ${GREEN}$size${NC}"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Upload $archive_name to your server"
    echo "2. Extract: tar -xzf $archive_name -C /var/www/html/cashmanagement"
    echo "3. Run: chmod +x deploy.sh && ./deploy.sh"
    echo "4. Or use the deployment script on your server"
    echo
    echo -e "${GREEN}Production build completed!${NC}"
}

# Generate deployment instructions
create_instructions() {
    log "Creating deployment instructions..."
    
    cat > "DEPLOYMENT_INSTRUCTIONS.md" <<'EOF'
# CashManagement Deployment Instructions

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ or CentOS 8+ (Oracle Cloud Free Tier compatible)
- PHP 8.1 or higher
- Apache 2.4+
- MySQL 8.0+
- At least 1GB RAM (Oracle Free Tier: 1GB)
- At least 10GB disk space

### Required PHP Extensions
- PDO
- pdo_mysql
- mbstring
- xml
- ctype
- json
- bcmath
- fileinfo
- tokenizer

## Deployment Steps

### 1. Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y apache2 mysql-server php8.1 php8.1-cli php8.1-common \
    php8.1-mysql php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-json \
    php8.1-tokenizer php8.1-fileinfo php8.1-ctype unzip curl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

### 2. Setup MySQL
```bash
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE cashmanagement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cashmanagement_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON cashmanagement_db.* TO 'cashmanagement_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Deploy Application
```bash
# Upload and extract the archive
cd /var/www/html
sudo mkdir -p cashmanagement
cd cashmanagement
sudo wget YOUR_ARCHIVE_URL  # or upload via SCP/FTP
sudo tar -xzf cashmanagement_production_*.tar.gz
sudo rm cashmanagement_production_*.tar.gz

# Make deploy script executable
sudo chmod +x deploy.sh

# Run deployment script
sudo ./deploy.sh
```

### 4. Configure Firewall (if needed)
```bash
# For Ubuntu with UFW
sudo ufw allow 'Apache Full'
sudo ufw enable

# For CentOS with firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### 5. Access Application
Your application will be available at: `http://YOUR_SERVER_IP/cashmanagement`

## Maintenance

### Backup Database
```bash
cd /var/www/html/cashmanagement
sudo ./backup.sh
```

### Update Application
```bash
cd /var/www/html/cashmanagement
sudo ./update.sh
```

### Monitor Logs
```bash
sudo tail -f /var/www/html/cashmanagement/storage/logs/laravel.log
sudo tail -f /var/log/apache2/error.log
```

## Troubleshooting

### Common Issues

1. **Permission Issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/html/cashmanagement
   sudo chmod -R 775 /var/www/html/cashmanagement/storage
   sudo chmod -R 775 /var/www/html/cashmanagement/bootstrap/cache
   ```

2. **Database Connection Issues**
   - Check `.env` file for correct database credentials
   - Ensure MySQL is running: `sudo systemctl status mysql`
   - Test connection: `mysql -u cashmanagement_user -p cashmanagement_db`

3. **Apache Issues**
   - Check Apache status: `sudo systemctl status apache2`
   - Check error logs: `sudo tail -f /var/log/apache2/error.log`
   - Restart Apache: `sudo systemctl restart apache2`

4. **Application Errors**
   - Check Laravel logs: `sudo tail -f /var/www/html/cashmanagement/storage/logs/laravel.log`
   - Clear caches: `sudo php artisan cache:clear`

### Oracle Cloud Free Tier Specific

1. **Open Ports in Security List**
   - Go to Oracle Cloud Console
   - Navigate to Networking > Virtual Cloud Networks
   - Select your VCN > Security Lists > Default Security List
   - Add Ingress Rule: Source CIDR: 0.0.0.0/0, Destination Port: 80

2. **Resource Optimization**
   - The application is optimized for 1GB RAM
   - Database queries are optimized for performance
   - Static assets are cached and compressed

## Support

For issues and support, check the application logs and refer to Laravel documentation.
EOF

    log "Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md"
}

# Main function
main() {
    log "Starting pre-deployment build process..."
    
    check_environment
    install_dependencies
    build_assets
    optimize_laravel
    create_package
    create_archive
    create_instructions
    
    log "Pre-deployment build completed successfully!"
}

# Run main function
main "$@"
