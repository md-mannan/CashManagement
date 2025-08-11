#!/bin/bash

# Cash Management - cPanel Deployment Script
# This script automates the deployment process for cPanel shared hosting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL=""
BRANCH="client"
APP_NAME="cash-management"
DOMAIN="yourdomain.com"
SUBDOMAIN="cash"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Cash Management - cPanel Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo

# Check if running in cPanel environment
if [[ ! -d "$HOME/public_html" ]]; then
    echo -e "${RED}ERROR: This script must be run in a cPanel environment${NC}"
    echo "Please run this script from your cPanel home directory"
    exit 1
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists git; then
    print_error "Git is not available. Please enable Git in cPanel."
    exit 1
fi

if ! command_exists php; then
    print_error "PHP is not available. Please check your PHP installation."
    exit 1
fi

if ! command_exists composer; then
    print_warning "Composer is not available. You may need to install dependencies manually."
fi

if ! command_exists npm; then
    print_warning "Node.js/npm is not available. You may need to build assets manually."
fi

print_status "Prerequisites check completed."

# Get repository URL if not set
if [[ -z "$REPO_URL" ]]; then
    echo -e "${YELLOW}Please enter your Git repository URL:${NC}"
    read -p "Repository URL: " REPO_URL
fi

# Navigate to public_html
cd "$HOME/public_html"

# Check if application directory exists
if [[ -d "$APP_NAME" ]]; then
    print_warning "Application directory '$APP_NAME' already exists."
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing existing application directory..."
        rm -rf "$APP_NAME"
    else
        print_status "Updating existing application..."
        cd "$APP_NAME"
        git fetch origin
        git reset --hard "origin/$BRANCH"
        cd ..
    fi
fi

# Clone the repository
if [[ ! -d "$APP_NAME" ]]; then
    print_status "Cloning repository from $REPO_URL..."
    git clone -b "$BRANCH" "$REPO_URL" "$APP_NAME"
fi

# Navigate to application directory
cd "$APP_NAME"

print_status "Setting up application..."

# Create .env file if it doesn't exist
if [[ ! -f ".env" ]]; then
    print_status "Creating .env file from template..."
    if [[ -f "env.production.template" ]]; then
        cp env.production.template .env
        print_status "Please update .env file with your database credentials and domain settings."
    else
        print_warning "No environment template found. Please create .env file manually."
    fi
fi

# Install PHP dependencies if Composer is available
if command_exists composer; then
    print_status "Installing PHP dependencies..."
    composer install --optimize-autoloader --no-dev --no-interaction
else
    print_warning "Composer not available. Please install PHP dependencies manually."
fi

# Install Node.js dependencies if npm is available
if command_exists npm; then
    print_status "Installing Node.js dependencies..."
    npm ci --production
    
    print_status "Building frontend assets..."
    npm run build
else
    print_warning "npm not available. Please build frontend assets manually."
fi

# Set proper permissions
print_status "Setting file permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 644 .env 2>/dev/null || true

# Generate application key if .env exists
if [[ -f ".env" ]]; then
    print_status "Generating application key..."
    php artisan key:generate --force
fi

# Create .htaccess in public directory if it doesn't exist
if [[ ! -f "public/.htaccess" ]]; then
    print_status "Creating .htaccess file..."
    cat > public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF
fi

# Optimize application
print_status "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

print_status "Deployment completed successfully!"
echo
echo -e "${GREEN}Next steps:${NC}"
echo "1. Update your .env file with database credentials and domain settings"
echo "2. Create your database in cPanel MySQL Databases"
echo "3. Run the installer: https://$DOMAIN/$APP_NAME/install"
echo "4. Set up cron jobs for scheduled tasks"
echo
echo -e "${BLUE}Documentation:${NC}"
echo "- cPanel Deployment Guide: CPANEL_DEPLOYMENT_GUIDE.md"
echo "- XAMPP Deployment Guide: XAMPP_DEPLOYMENT_GUIDE.md"
echo "- Installation Guide: INSTALLATION_GUIDE.md"
echo
echo -e "${YELLOW}Important:${NC}"
echo "- Make sure your hosting supports PHP 8.2+"
echo "- Enable required PHP extensions (pdo_mysql, mbstring, openssl, etc.)"
echo "- Set up SSL certificate for security"
echo "- Configure proper file permissions"
echo
echo -e "${GREEN}Your application is now deployed at:${NC}"
echo "- Main App: https://$DOMAIN/$APP_NAME"
echo "- Installer: https://$DOMAIN/$APP_NAME/install"
echo
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
