#!/bin/bash

# CashManagement Laravel React App Deployment Script
# This script deploys the application to Apache server in a subdirectory
# Suitable for Oracle Cloud Free Tier or any limited resource server

set -e  # Exit on any error

# Configuration
APP_NAME="cashmanagement"
APACHE_ROOT="/var/www/html"
APP_DIR="${APACHE_ROOT}/${APP_NAME}"
BACKUP_DIR="/tmp/backup_$(date +%Y%m%d_%H%M%S)"
DB_NAME="cashmanagement_db"
CURRENT_DIR=$(pwd)

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons. Use sudo only when needed."
fi

# Check required commands
check_dependencies() {
    log "Checking dependencies..."
    
    local deps=("php" "composer" "mysql" "apache2" "git")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            error "$dep is not installed. Please install it first."
        fi
    done
    
    # Check PHP version
    local php_version=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    log "PHP version: $php_version"
    
    # Check PHP extensions for both CLI and Apache
    log "Checking PHP extensions..."
    local php_exts=("pdo" "pdo_mysql" "mbstring" "xml" "ctype" "json" "bcmath" "fileinfo" "tokenizer")
    local missing_exts=()
    
    for ext in "${php_exts[@]}"; do
        # Handle case-insensitive matching and special cases
        case $ext in
            "pdo")
                if ! php -m | grep -qi "^PDO$" && ! php -m | grep -qi "^pdo$"; then
                    missing_exts+=("$ext")
                fi
                ;;
            "pdo_mysql")
                if ! php -m | grep -qi "^pdo_mysql$"; then
                    missing_exts+=("$ext")
                fi
                ;;
            *)
                if ! php -m | grep -qi "^$ext$" && ! php -m | grep -qi "^${ext//_/}$"; then
                    missing_exts+=("$ext")
                fi
                ;;
        esac
    done
    
    if [ ${#missing_exts[@]} -gt 0 ]; then
        warn "Missing PHP extensions: ${missing_exts[*]}"
        log "Attempting to install missing PHP extensions..."
        
        # Determine PHP version for package names
        local php_ver=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
        
        # Install missing extensions
        for ext in "${missing_exts[@]}"; do
            case $ext in
                "pdo"|"pdo_mysql")
                    sudo apt-get update && sudo apt-get install -y php${php_ver}-mysql php${php_ver}-pdo || \
                    sudo yum install -y php-pdo php-mysql || \
                    error "Failed to install PDO extensions. Please install manually: sudo apt-get install php${php_ver}-mysql"
                    ;;
                "mbstring")
                    sudo apt-get install -y php${php_ver}-mbstring || sudo yum install -y php-mbstring
                    ;;
                "xml")
                    sudo apt-get install -y php${php_ver}-xml || sudo yum install -y php-xml
                    ;;
                "bcmath")
                    sudo apt-get install -y php${php_ver}-bcmath || sudo yum install -y php-bcmath
                    ;;
                *)
                    sudo apt-get install -y php${php_ver}-${ext} || sudo yum install -y php-${ext} || \
                    warn "Could not install php${php_ver}-${ext}. Please install manually."
                    ;;
            esac
        done
        
        # Restart Apache to load new extensions
        sudo systemctl restart apache2 || sudo systemctl restart httpd || true
        
        # Recheck extensions
        log "Rechecking PHP extensions after installation..."
        for ext in "${php_exts[@]}"; do
            case $ext in
                "pdo")
                    if ! php -m | grep -qi "^PDO$" && ! php -m | grep -qi "^pdo$"; then
                        error "PHP extension '$ext' is still not available after installation attempt."
                    else
                        log "✓ PDO extension is available"
                    fi
                    ;;
                "pdo_mysql")
                    if ! php -m | grep -qi "^pdo_mysql$"; then
                        error "PHP extension '$ext' is still not available after installation attempt."
                    else
                        log "✓ pdo_mysql extension is available"
                    fi
                    ;;
                *)
                    if ! php -m | grep -qi "^$ext$" && ! php -m | grep -qi "^${ext//_/}$"; then
                        error "PHP extension '$ext' is still not available after installation attempt."
                    else
                        log "✓ $ext extension is available"
                    fi
                    ;;
            esac
        done
    fi
    
    log "All dependencies are satisfied."
}

# Create database if it doesn't exist
setup_database() {
    log "Setting up database..."
    
    read -p "Enter MySQL root password: " -s mysql_root_pass
    echo
    read -p "Enter database username (will be created if doesn't exist): " db_user
    read -p "Enter database password: " -s db_pass
    echo
    read -p "Enter database host (default: localhost): " db_host
    db_host=${db_host:-localhost}
    
    # Create database and user
    mysql -u root -p${mysql_root_pass} -h ${db_host} -e "
        CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER IF NOT EXISTS '${db_user}'@'${db_host}' IDENTIFIED BY '${db_pass}';
        GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${db_user}'@'${db_host}';
        FLUSH PRIVILEGES;
    " || error "Failed to setup database"
    
    log "Database setup completed."
}

# Backup existing installation
backup_existing() {
    if [ -d "$APP_DIR" ]; then
        log "Backing up existing installation..."
        sudo mkdir -p "$BACKUP_DIR"
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/"
        log "Backup created at $BACKUP_DIR"
    fi
}

# Deploy application files
deploy_files() {
    log "Deploying application files..."
    
    # Create app directory
    sudo mkdir -p "$APP_DIR"
    
    # Copy application files (excluding development files)
    sudo rsync -av \
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
        --exclude='deploy.sh' \
        "$CURRENT_DIR/" "$APP_DIR/"
    
    log "Application files deployed."
}

# Configure environment
configure_environment() {
    log "Configuring environment..."
    
    # Generate app key if .env doesn't exist
    if [ ! -f "$APP_DIR/.env" ]; then
        sudo cp "$APP_DIR/.env.example" "$APP_DIR/.env"
        
        # Generate application key
        cd "$APP_DIR"
        sudo php artisan key:generate --force
        cd "$CURRENT_DIR"
    fi
    
    # Update .env file with database credentials
    sudo sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=mysql/" "$APP_DIR/.env"
    sudo sed -i "s/DB_HOST=.*/DB_HOST=${db_host}/" "$APP_DIR/.env"
    sudo sed -i "s/DB_PORT=.*/DB_PORT=3306/" "$APP_DIR/.env"
    sudo sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" "$APP_DIR/.env"
    sudo sed -i "s/DB_USERNAME=.*/DB_USERNAME=${db_user}/" "$APP_DIR/.env"
    sudo sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${db_pass}/" "$APP_DIR/.env"
    
    # Set APP_URL for subdirectory
    local server_ip=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")
    sudo sed -i "s|APP_URL=.*|APP_URL=http://${server_ip}/${APP_NAME}|" "$APP_DIR/.env"
    
    # Set other production settings
    sudo sed -i "s/APP_ENV=.*/APP_ENV=production/" "$APP_DIR/.env"
    sudo sed -i "s/APP_DEBUG=.*/APP_DEBUG=false/" "$APP_DIR/.env"
    
    log "Environment configured."
}

# Set proper permissions
set_permissions() {
    log "Setting file permissions..."
    
    # Get Apache user (usually www-data or apache)
    local apache_user=$(ps aux | grep -E '(apache|httpd)' | grep -v root | head -1 | awk '{print $1}')
    if [ -z "$apache_user" ]; then
        apache_user="www-data"  # Default for Ubuntu/Debian
    fi
    
    # Set ownership
    sudo chown -R $apache_user:$apache_user "$APP_DIR"
    
    # Set directory permissions
    sudo find "$APP_DIR" -type d -exec chmod 755 {} \;
    
    # Set file permissions
    sudo find "$APP_DIR" -type f -exec chmod 644 {} \;
    
    # Set executable permissions for artisan
    sudo chmod +x "$APP_DIR/artisan"
    
    # Set writable permissions for storage and cache
    sudo chmod -R 775 "$APP_DIR/storage"
    sudo chmod -R 775 "$APP_DIR/bootstrap/cache"
    
    # Create required directories if they don't exist
    sudo mkdir -p "$APP_DIR/storage/logs"
    sudo mkdir -p "$APP_DIR/storage/framework/cache/data"
    sudo mkdir -p "$APP_DIR/storage/framework/sessions"
    sudo mkdir -p "$APP_DIR/storage/framework/views"
    
    # Set permissions for these directories
    sudo chown -R $apache_user:$apache_user "$APP_DIR/storage"
    sudo chown -R $apache_user:$apache_user "$APP_DIR/bootstrap/cache"
    
    log "File permissions set."
}

# Install/update Composer dependencies
install_dependencies() {
    log "Installing/updating Composer dependencies..."
    
    cd "$APP_DIR"
    
    # Install composer dependencies for production
    sudo -u $(ps aux | grep -E '(apache|httpd)' | grep -v root | head -1 | awk '{print $1}') \
        composer install --optimize-autoloader --no-dev --no-interaction
    
    cd "$CURRENT_DIR"
    
    log "Dependencies installed."
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    cd "$APP_DIR"
    
    # Run migrations
    sudo php artisan migrate --force
    
    # Seed database (optional)
    read -p "Do you want to seed the database with initial data? (y/N): " seed_choice
    if [[ $seed_choice =~ ^[Yy]$ ]]; then
        sudo php artisan db:seed --force
    fi
    
    cd "$CURRENT_DIR"
    
    log "Database migrations completed."
}

# Configure Apache
configure_apache() {
    log "Configuring Apache..."
    
    # Create Apache virtual host configuration for subdirectory
    local config_file="/etc/apache2/conf-available/${APP_NAME}.conf"
    
    sudo tee "$config_file" > /dev/null <<EOF
# CashManagement Application Configuration
Alias /${APP_NAME} ${APP_DIR}/public

<Directory "${APP_DIR}/public">
    AllowOverride All
    Require all granted
    
    # Enable rewrite engine
    RewriteEngine On
    
    # Handle Angular/React routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</Directory>

<Directory "${APP_DIR}">
    Require all denied
</Directory>

<Directory "${APP_DIR}/public">
    Require all granted
</Directory>
EOF
    
    # Enable the configuration
    sudo a2enconf "${APP_NAME}"
    
    # Enable required Apache modules
    sudo a2enmod rewrite
    sudo a2enmod headers
    
    # Restart Apache
    sudo systemctl restart apache2
    
    log "Apache configured and restarted."
}

# Optimize Laravel
optimize_laravel() {
    log "Optimizing Laravel..."
    
    cd "$APP_DIR"
    
    # Clear and cache configurations
    sudo php artisan config:clear
    sudo php artisan config:cache
    
    # Clear and cache routes
    sudo php artisan route:clear
    sudo php artisan route:cache
    
    # Clear and cache views
    sudo php artisan view:clear
    sudo php artisan view:cache
    
    # Clear application cache
    sudo php artisan cache:clear
    
    # Optimize autoloader
    sudo composer dump-autoload --optimize
    
    cd "$CURRENT_DIR"
    
    log "Laravel optimized."
}

# Create maintenance scripts
create_maintenance_scripts() {
    log "Creating maintenance scripts..."
    
    # Create update script
    sudo tee "${APP_DIR}/update.sh" > /dev/null <<'EOF'
#!/bin/bash
# Quick update script for CashManagement

cd "$(dirname "$0")"

echo "Putting application into maintenance mode..."
php artisan down

echo "Pulling latest changes..."
git pull origin main

echo "Installing/updating dependencies..."
composer install --optimize-autoloader --no-dev

echo "Running migrations..."
php artisan migrate --force

echo "Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Bringing application back online..."
php artisan up

echo "Update completed!"
EOF
    
    sudo chmod +x "${APP_DIR}/update.sh"
    
    # Create backup script
    sudo tee "${APP_DIR}/backup.sh" > /dev/null <<EOF
#!/bin/bash
# Backup script for CashManagement

BACKUP_DIR="/var/backups/cashmanagement"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p "\$BACKUP_DIR"

# Backup database
mysqldump -u ${db_user} -p${db_pass} ${DB_NAME} > "\$BACKUP_DIR/database_\$DATE.sql"

# Backup files
tar -czf "\$BACKUP_DIR/files_\$DATE.tar.gz" -C "${APP_DIR}" .

echo "Backup completed: \$BACKUP_DIR"
EOF
    
    sudo chmod +x "${APP_DIR}/backup.sh"
    
    log "Maintenance scripts created."
}

# Main deployment function
main() {
    log "Starting CashManagement deployment..."
    
    # Check if we're in the right directory
    if [ ! -f "artisan" ]; then
        error "Please run this script from the Laravel project root directory."
    fi
    
    check_dependencies
    setup_database
    backup_existing
    deploy_files
    configure_environment
    set_permissions
    install_dependencies
    run_migrations
    configure_apache
    optimize_laravel
    create_maintenance_scripts
    
    local server_ip=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")
    
    log "Deployment completed successfully!"
    echo
    echo -e "${BLUE}=== Deployment Summary ===${NC}"
    echo -e "Application URL: ${GREEN}http://${server_ip}/${APP_NAME}${NC}"
    echo -e "Application Directory: ${GREEN}${APP_DIR}${NC}"
    echo -e "Database: ${GREEN}${DB_NAME}${NC}"
    echo -e "Backup Location: ${GREEN}${BACKUP_DIR}${NC}"
    echo
    echo -e "${YELLOW}Important Notes:${NC}"
    echo "1. Make sure your firewall allows HTTP traffic on port 80"
    echo "2. For HTTPS, configure SSL certificates separately"
    echo "3. Regular backups are recommended - use ${APP_DIR}/backup.sh"
    echo "4. For updates, use ${APP_DIR}/update.sh"
    echo "5. Monitor logs at ${APP_DIR}/storage/logs/"
    echo
    echo -e "${GREEN}Your CashManagement application is now live!${NC}"
}

# Run main function
main "$@"
