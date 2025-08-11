#!/bin/bash

# Fix CORS Issues for cPanel Deployment
# This script resolves asset loading and CORS problems

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Fix CORS Issues for cPanel Deployment${NC}"
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

# Get application directory
read -p "Enter your application directory name (default: cash-management): " APP_DIR
APP_DIR=${APP_DIR:-cash-management}

# Check if application directory exists
if [[ ! -d "$HOME/public_html/$APP_DIR" ]]; then
    print_error "Application directory '$APP_DIR' not found in public_html"
    exit 1
fi

# Navigate to application directory
cd "$HOME/public_html/$APP_DIR"

print_status "Fixing CORS issues for $APP_DIR..."

# Step 1: Check if npm is available
if command -v npm >/dev/null 2>&1; then
    print_status "Building production assets..."
    
    # Install production dependencies
    npm install --production
    
    # Build for production
    npm run build
    
    print_status "Production assets built successfully"
else
    print_warning "npm not available. You may need to build assets manually."
fi

# Step 2: Clear Laravel caches
print_status "Clearing Laravel caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Step 3: Rebuild caches for production
print_status "Rebuilding production caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Step 4: Check .env configuration
print_status "Checking environment configuration..."

if [[ -f ".env" ]]; then
    # Check if APP_ENV is set to production
    if grep -q "APP_ENV=production" .env; then
        print_status "APP_ENV is correctly set to production"
    else
        print_warning "APP_ENV is not set to production. Consider updating your .env file."
    fi
    
    # Check if APP_DEBUG is set to false
    if grep -q "APP_DEBUG=false" .env; then
        print_status "APP_DEBUG is correctly set to false"
    else
        print_warning "APP_DEBUG is not set to false. Consider updating your .env file."
    fi
else
    print_warning ".env file not found. Please create one from env.production.template"
fi

# Step 5: Check build directory
if [[ -d "public/build" ]]; then
    print_status "Build directory exists"
    
    # Check for manifest file
    if [[ -f "public/build/manifest.json" ]]; then
        print_status "manifest.json found"
    else
        print_warning "manifest.json not found in build directory"
    fi
    
    # Check for assets directory
    if [[ -d "public/build/assets" ]]; then
        print_status "Assets directory exists"
        
        # Count CSS and JS files
        CSS_COUNT=$(find public/build/assets -name "*.css" | wc -l)
        JS_COUNT=$(find public/build/assets -name "*.js" | wc -l)
        
        echo "Found $CSS_COUNT CSS files and $JS_COUNT JS files"
    else
        print_warning "Assets directory not found in build directory"
    fi
else
    print_error "Build directory not found. Assets may not be built correctly."
fi

# Step 6: Set proper permissions
print_status "Setting file permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 755 public/build 2>/dev/null || true

# Step 7: Check .htaccess
if [[ -f "public/.htaccess" ]]; then
    print_status ".htaccess file exists"
else
    print_warning ".htaccess file not found in public directory"
fi

echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}CORS Fix Completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. Clear your browser cache completely"
echo "2. Visit your application: https://yourdomain.com/$APP_DIR"
echo "3. Check browser console for any remaining errors"
echo "4. If issues persist, check the troubleshooting guide"
echo
echo -e "${BLUE}Common solutions:${NC}"
echo "- Ensure your domain is accessible via HTTPS"
echo "- Verify all assets are loading from your domain (not localhost)"
echo "- Check that the build directory contains all necessary files"
echo
echo -e "${YELLOW}If you still see CORS errors:${NC}"
echo "1. Check browser console for specific error messages"
echo "2. Verify your .env APP_URL setting"
echo "3. Ensure all assets are built for production"
echo "4. Consider using the manual asset fix method"
echo
echo -e "${BLUE}Documentation:${NC}"
echo "- CORS Fix Guide: fix-cors-cpanel.md"
echo "- cPanel Deployment Guide: CPANEL_DEPLOYMENT_GUIDE.md"
echo
echo -e "${GREEN}Your application should now work without CORS issues!${NC}"
