#!/bin/bash

# Cash Management System - cPanel Deployment Script (No Node.js Required)
# This script prepares the application for cPanel hosts that don't support Node.js
# You build assets locally and upload pre-built files

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
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

# Check if we're in the right directory
if [ ! -f "composer.json" ]; then
    print_error "composer.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Starting cPanel deployment preparation (No Node.js required)..."

# Check PHP version
print_status "Checking PHP version..."
if command_exists php; then
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    PHP_MAJOR=$(echo $PHP_VERSION | cut -d. -f1)
    PHP_MINOR=$(echo $PHP_VERSION | cut -d. -f2)

    if [ "$PHP_MAJOR" -ge 8 ] && [ "$PHP_MINOR" -ge 2 ]; then
        print_success "PHP version $PHP_VERSION is compatible"
    else
        print_error "PHP version $PHP_VERSION is not compatible. Required: PHP 8.2+"
        exit 1
    fi
else
    print_error "PHP is not installed or not in PATH"
    exit 1
fi

# Check Composer
print_status "Checking Composer..."
if command_exists composer; then
    print_success "Composer is installed"
else
    print_error "Composer is not installed or not in PATH"
    exit 1
fi

# Check if Node.js is available for local build
print_status "Checking Node.js for local build..."
if command_exists node; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

    if [ "$NODE_MAJOR" -ge 16 ]; then
        print_success "Node.js version $NODE_VERSION found - will build assets locally"
        NODEJS_AVAILABLE=true
    else
        print_error "Node.js version $NODE_VERSION is not compatible. Required: Node.js 16+"
        print_warning "You'll need to build assets on another machine or use pre-built assets"
        NODEJS_AVAILABLE=false
    fi
else
    print_warning "Node.js not found - you'll need to build assets on another machine"
    NODEJS_AVAILABLE=false
fi

# Install PHP dependencies
print_status "Installing PHP dependencies..."
if composer install --no-dev --optimize-autoloader; then
    print_success "PHP dependencies installed successfully"
else
    print_error "Failed to install PHP dependencies"
    exit 1
fi

# Build assets if Node.js is available
if [ "$NODEJS_AVAILABLE" = true ]; then
    print_status "Building production assets locally..."
    
    # Check npm
    if command_exists npm; then
        print_success "npm is available"
    else
        print_error "npm is not installed or not in PATH"
        exit 1
    fi

    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    if npm ci --silent; then
        print_success "Node.js dependencies installed successfully"
    else
        print_warning "npm ci failed, trying npm install..."
        if npm install --silent; then
            print_success "Node.js dependencies installed successfully"
        else
            print_error "Failed to install Node.js dependencies"
            exit 1
        fi
    fi

    # Build production assets
    print_status "Building production assets..."
    if npm run build:deploy; then
        print_success "Production assets built successfully"
    else
        print_error "Failed to build production assets"
        exit 1
    fi

    # Check build location
    print_status "Checking build location..."
    if [ -d "build" ] && [ ! -d "public/build" ]; then
        print_warning "Build files found in root directory, moving to public/build..."
        if [ -f "fix-build-location.sh" ]; then
            chmod +x fix-build-location.sh
            if ./fix-build-location.sh; then
                print_success "Build location fixed successfully"
            else
                print_error "Failed to fix build location"
                exit 1
            fi
        else
            print_error "fix-build-location.sh script not found"
            exit 1
        fi
    elif [ -d "public/build" ]; then
        print_success "Build files are in correct location"
    else
        print_error "No build files found"
        exit 1
    fi
else
    print_warning "Node.js not available - checking for pre-built assets..."
    
    # Check if build files already exist
    if [ -d "public/build" ]; then
        print_success "Pre-built assets found in public/build/"
    elif [ -d "build" ]; then
        print_warning "Build files found in root directory, moving to public/build..."
        if [ -f "fix-build-location.sh" ]; then
            chmod +x fix-build-location.sh
            if ./fix-build-location.sh; then
                print_success "Build location fixed successfully"
            else
                print_error "Failed to fix build location"
                exit 1
            fi
        else
            print_error "fix-build-location.sh script not found"
            exit 1
        fi
    else
        print_error "No pre-built assets found!"
        print_error "You need to build assets on a machine with Node.js and upload them"
        print_error "Or use the pre-built package if available"
        exit 1
    fi
fi

# Setup environment file
print_status "Setting up environment file..."

if [ -f "env-cpanel.example" ]; then
    if [ ! -f ".env" ]; then
        cp env-cpanel.example .env
        print_success "Environment file created from template"
    else
        print_warning "Environment file already exists"
    fi
else
    print_error "env-cpanel.example template not found"
    exit 1
fi

# Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env; then
    print_status "Generating application key..."
    if php artisan key:generate --force; then
        print_success "Application key generated"
    else
        print_error "Failed to generate application key"
        exit 1
    fi
else
    print_success "Application key already set"
fi

# Setup .htaccess for cPanel
print_status "Setting up .htaccess for cPanel..."

if [ -f "public/.htaccess.cpanel" ]; then
    cp public/.htaccess.cpanel public/.htaccess
    print_success ".htaccess configured for cPanel"
else
    print_error "public/.htaccess.cpanel not found"
    exit 1
fi

# Set file permissions
print_status "Setting file permissions..."

# Set directory permissions
find storage -type d -exec chmod 755 {} \; 2>/dev/null || true
find bootstrap/cache -type d -exec chmod 755 {} \; 2>/dev/null || true
find public/build -type d -exec chmod 755 {} \; 2>/dev/null || true

# Set file permissions
find storage -type f -exec chmod 644 {} \; 2>/dev/null || true
find bootstrap/cache -type f -exec chmod 644 {} \; 2>/dev/null || true
find public/build -type f -exec chmod 644 {} \; 2>/dev/null || true

# Set .env permissions
chmod 644 .env 2>/dev/null || true

print_success "File permissions set"

# Create storage link
print_status "Creating storage link..."

if [ -L "public/storage" ]; then
    print_success "Storage link already exists"
else
    if php artisan storage:link; then
        print_success "Storage link created"
    else
        print_warning "Failed to create storage link via artisan, creating manually..."
        if ln -sf ../storage/app/public public/storage; then
            print_success "Storage link created manually"
        else
            print_error "Failed to create storage link"
            exit 1
        fi
    fi
fi

# Clear and cache configuration
print_status "Optimizing application..."

# Clear all caches
php artisan optimize:clear 2>/dev/null || true

# Cache configuration
php artisan config:cache 2>/dev/null || true

# Cache routes
php artisan route:cache 2>/dev/null || true

# Cache views
php artisan view:cache 2>/dev/null || true

print_success "Application optimized"

# Create deployment package
print_status "Creating deployment package..."

if [ -d "deploy-package" ]; then
    rm -rf deploy-package
fi
mkdir deploy-package

# Copy necessary files to deployment package
print_status "Copying files to deployment package..."
cp -r app deploy-package/
cp -r bootstrap deploy-package/
cp -r config deploy-package/
cp -r database deploy-package/
cp -r lang deploy-package/
cp -r public deploy-package/
cp -r resources deploy-package/
cp -r routes deploy-package/
cp -r storage deploy-package/
cp -r vendor deploy-package/
cp .env deploy-package/
cp artisan deploy-package/
cp composer.json deploy-package/
cp composer.lock deploy-package/

# Create deployment instructions
print_status "Creating deployment instructions..."
cat > deploy-package/DEPLOYMENT_INSTRUCTIONS.txt << 'EOF'
# Cash Management System - cPanel Deployment Instructions (No Node.js Required)

## Quick Deployment Steps:

1. **Upload Files**: Upload all contents of the 'deploy-package' folder to your cPanel public_html directory
2. **Database Setup**: Create a MySQL database in cPanel and update .env with credentials
3. **File Permissions**: Set storage/ and bootstrap/cache/ to 755 permissions
4. **Run Migrations**: Via SSH: php artisan migrate --force
5. **Create Storage Link**: Via SSH: php artisan storage:link
6. **Test**: Visit your domain to test the application

## Important Notes:
- Ensure PHP 8.2+ is available on your hosting
- Make sure .env file is properly configured with your domain and database details
- The .htaccess file is already configured for cPanel
- Build files are included in public/build/ (pre-built locally)
- No Node.js required on the server - all assets are pre-built

## Troubleshooting:
- If you see a white screen, check .env file and database connection
- If assets don't load, verify public/build/ directory exists
- For detailed troubleshooting, see CPANEL_DEPLOYMENT_CHECKLIST.md

## Support:
- Check CPANEL_DEPLOYMENT_CHECKLIST.md for comprehensive guide
- Review README.md for additional information
- Contact your hosting provider for server-specific issues

## No Node.js Required:
This deployment package includes pre-built assets, so you don't need Node.js on your cPanel hosting.
All JavaScript and CSS files are already compiled and optimized for production.
EOF

print_success "Deployment package created successfully"

# Create alternative deployment method for hosts without SSH
print_status "Creating alternative deployment method..."
cat > deploy-package/ALTERNATIVE_DEPLOYMENT.md << 'EOF'
# Alternative Deployment Method (No SSH Required)

If your cPanel hosting doesn't provide SSH access, you can use these alternative methods:

## Method 1: Browser-based Migration
1. Upload all files to your cPanel hosting
2. Create a temporary route for migrations by adding this to your routes/web.php:
   ```php
   Route::get('/migrate', function () {
       Artisan::call('migrate', ['--force' => true]);
       return 'Migrations completed successfully!';
   });
   ```
3. Visit https://yourdomain.com/migrate
4. Remove the migration route after successful migration

## Method 2: phpMyAdmin Import
1. Export your local database structure and data
2. Import via phpMyAdmin in cPanel
3. Update .env file with your database credentials

## Method 3: Contact Hosting Support
Many hosting providers can run migrations for you if you provide the migration files.

## Important:
- Always backup your database before making changes
- Test on a staging environment first if possible
- Remove any temporary routes after deployment
EOF

print_success "Alternative deployment methods documented"

# Final summary
echo
print_success "=== DEPLOYMENT PREPARATION COMPLETE (No Node.js Required) ==="
echo
print_status "Next steps:"
echo "  1. Upload the contents of 'deploy-package' folder to your cPanel hosting"
echo "  2. Configure your database in cPanel"
echo "  3. Update .env file with your domain and database details"
echo "  4. Set proper file permissions on the server"
echo "  5. Run database migrations"
echo "  6. Test your application"
echo
print_status "For detailed instructions, see:"
echo "  - deploy-package/DEPLOYMENT_INSTRUCTIONS.txt"
echo "  - deploy-package/ALTERNATIVE_DEPLOYMENT.md"
echo "  - CPANEL_DEPLOYMENT_CHECKLIST.md"
echo "  - README.md"
echo
print_success "Your Cash Management System is ready for cPanel deployment (No Node.js required)! 🚀"
echo
print_warning "Note: This package includes pre-built assets, so Node.js is not needed on your hosting server."
