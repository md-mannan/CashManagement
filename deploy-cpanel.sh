#!/bin/bash

# Cash Management System - cPanel Deployment Script
# This script automates the deployment process for cPanel shared hosting

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

# Function to check PHP version
check_php_version() {
    if command_exists php; then
        PHP_VERSION=$(php -r "echo PHP_VERSION;")
        PHP_MAJOR=$(echo $PHP_VERSION | cut -d. -f1)
        PHP_MINOR=$(echo $PHP_VERSION | cut -d. -f2)
        
        if [ "$PHP_MAJOR" -ge 8 ] && [ "$PHP_MINOR" -ge 2 ]; then
            print_success "PHP version $PHP_VERSION is compatible"
            return 0
        else
            print_error "PHP version $PHP_VERSION is not compatible. Required: PHP 8.2+"
            return 1
        fi
    else
        print_error "PHP is not installed or not in PATH"
        return 1
    fi
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
        
        if [ "$NODE_MAJOR" -ge 16 ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is not compatible. Required: Node.js 16+"
            return 1
        fi
    else
        print_error "Node.js is not installed or not in PATH"
        return 1
    fi
}

# Function to check if Composer is installed
check_composer() {
    if command_exists composer; then
        print_success "Composer is installed"
        return 0
    else
        print_error "Composer is not installed or not in PATH"
        return 1
    fi
}

# Function to check if npm is installed
check_npm() {
    if command_exists npm; then
        print_success "npm is installed"
        return 0
    else
        print_error "npm is not installed or not in PATH"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing PHP dependencies..."
    if composer install --no-dev --optimize-autoloader; then
        print_success "PHP dependencies installed successfully"
    else
        print_error "Failed to install PHP dependencies"
        return 1
    fi
    
    print_status "Installing Node.js dependencies..."
    if npm ci --silent; then
        print_success "Node.js dependencies installed successfully"
    else
        print_warning "npm ci failed, trying npm install..."
        if npm install --silent; then
            print_success "Node.js dependencies installed successfully"
        else
            print_error "Failed to install Node.js dependencies"
            return 1
        fi
    fi
}

# Function to build assets
build_assets() {
    print_status "Building production assets..."
    if npm run build:deploy; then
        print_success "Production assets built successfully"
    else
        print_error "Failed to build production assets"
        return 1
    fi
}

# Function to fix build location
fix_build_location() {
    print_status "Checking build location..."
    if [ -d "build" ] && [ ! -d "public/build" ]; then
        print_warning "Build files found in root directory, moving to public/build..."
        if [ -f "fix-build-location.sh" ]; then
            chmod +x fix-build-location.sh
            if ./fix-build-location.sh; then
                print_success "Build location fixed successfully"
            else
                print_error "Failed to fix build location"
                return 1
            fi
        else
            print_error "fix-build-location.sh script not found"
            return 1
        fi
    elif [ -d "public/build" ]; then
        print_success "Build files are in correct location"
    else
        print_error "No build files found"
        return 1
    fi
}

# Function to setup environment file
setup_environment() {
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
        return 1
    fi
    
    # Generate application key if not set
    if ! grep -q "APP_KEY=base64:" .env; then
        print_status "Generating application key..."
        if php artisan key:generate --force; then
            print_success "Application key generated"
        else
            print_error "Failed to generate application key"
            return 1
        fi
    else
        print_success "Application key already set"
    fi
}

# Function to setup .htaccess
setup_htaccess() {
    print_status "Setting up .htaccess for cPanel..."
    
    if [ -f "public/.htaccess.cpanel" ]; then
        cp public/.htaccess.cpanel public/.htaccess
        print_success ".htaccess configured for cPanel"
    else
        print_error "public/.htaccess.cpanel not found"
        return 1
    fi
}

# Function to set file permissions
set_permissions() {
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
}

# Function to create storage link
create_storage_link() {
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
                return 1
            fi
        fi
    fi
}

# Function to clear and cache configuration
optimize_application() {
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
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if php artisan migrate --force; then
        print_success "Database migrations completed"
    else
        print_error "Failed to run database migrations"
        return 1
    fi
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."
    
    if php artisan db:seed --force; then
        print_success "Database seeded successfully"
    else
        print_warning "Failed to seed database (this is optional)"
    fi
}

# Function to create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    # Create a temporary directory for the package
    PACKAGE_DIR="cash-management-cpanel-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$PACKAGE_DIR"
    
    # Copy necessary files
    cp -r app "$PACKAGE_DIR/"
    cp -r bootstrap "$PACKAGE_DIR/"
    cp -r config "$PACKAGE_DIR/"
    cp -r database "$PACKAGE_DIR/"
    cp -r lang "$PACKAGE_DIR/"
    cp -r resources "$PACKAGE_DIR/"
    cp -r routes "$PACKAGE_DIR/"
    cp -r storage "$PACKAGE_DIR/"
    cp -r vendor "$PACKAGE_DIR/"
    cp -r public "$PACKAGE_DIR/"
    cp artisan "$PACKAGE_DIR/"
    cp composer.json "$PACKAGE_DIR/"
    cp composer.lock "$PACKAGE_DIR/"
    cp .env "$PACKAGE_DIR/"
    cp .htaccess "$PACKAGE_DIR/"
    
    # Create deployment instructions
    cat > "$PACKAGE_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# cPanel Deployment Instructions

## Quick Deployment Steps

1. **Upload Files**: Upload all files to your cPanel `public_html` directory
2. **Set Permissions**: 
   - Directories: 755
   - Files: 644
   - Storage and cache: 775
3. **Configure Database**: Update `.env` with your database credentials
4. **Run Migrations**: Visit `https://yourdomain.com/migrate` or use SSH
5. **Test Application**: Visit your domain to test the application

## File Structure
- All Laravel files should be in the root directory
- The `public` folder contents should be accessible via your domain
- The `storage` folder should be outside the web root (if possible)

## Common Issues
- If you get a 500 error, check file permissions
- If assets don't load, ensure `public/build` exists
- If database connection fails, verify credentials in `.env`

## Support
For issues, check the troubleshooting section in the main README.md
EOF
    
    # Create ZIP file
    if command_exists zip; then
        zip -r "$PACKAGE_DIR.zip" "$PACKAGE_DIR"
        print_success "Deployment package created: $PACKAGE_DIR.zip"
        print_status "You can now upload this ZIP file to your cPanel hosting"
    else
        print_warning "zip command not found, package directory created: $PACKAGE_DIR"
        print_status "You can manually compress this directory and upload to cPanel"
    fi
    
    # Clean up temporary directory
    rm -rf "$PACKAGE_DIR"
}

# Function to validate deployment
validate_deployment() {
    print_status "Validating deployment..."
    
    # Check if build files exist
    if [ ! -d "public/build" ]; then
        print_error "Build files not found in public/build"
        return 1
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found"
        return 1
    fi
    
    # Check if .htaccess exists
    if [ ! -f "public/.htaccess" ]; then
        print_error "public/.htaccess file not found"
        return 1
    fi
    
    # Check if storage link exists
    if [ ! -L "public/storage" ]; then
        print_warning "Storage link not found"
    fi
    
    print_success "Deployment validation completed"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "Cash Management System - cPanel Deployment"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! check_php_version; then
        print_error "PHP version check failed"
        exit 1
    fi
    
    if ! check_node_version; then
        print_error "Node.js version check failed"
        exit 1
    fi
    
    if ! check_composer; then
        print_error "Composer check failed"
        exit 1
    fi
    
    if ! check_npm; then
        print_error "npm check failed"
        exit 1
    fi
    
    print_success "All prerequisites met"
    echo ""
    
    # Install dependencies
    if ! install_dependencies; then
        print_error "Dependency installation failed"
        exit 1
    fi
    echo ""
    
    # Build assets
    if ! build_assets; then
        print_error "Asset building failed"
        exit 1
    fi
    echo ""
    
    # Fix build location
    if ! fix_build_location; then
        print_error "Build location fix failed"
        exit 1
    fi
    echo ""
    
    # Setup environment
    if ! setup_environment; then
        print_error "Environment setup failed"
        exit 1
    fi
    echo ""
    
    # Setup .htaccess
    if ! setup_htaccess; then
        print_error ".htaccess setup failed"
        exit 1
    fi
    echo ""
    
    # Set permissions
    set_permissions
    echo ""
    
    # Create storage link
    if ! create_storage_link; then
        print_error "Storage link creation failed"
        exit 1
    fi
    echo ""
    
    # Optimize application
    optimize_application
    echo ""
    
    # Run migrations (optional - can be done after upload)
    read -p "Do you want to run database migrations now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ! run_migrations; then
            print_error "Migration failed"
            exit 1
        fi
        
        read -p "Do you want to seed the database? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            seed_database
        fi
    fi
    echo ""
    
    # Validate deployment
    if ! validate_deployment; then
        print_error "Deployment validation failed"
        exit 1
    fi
    echo ""
    
    # Create deployment package
    read -p "Do you want to create a deployment package? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_status "Skipping package creation"
    else
        create_package
    fi
    echo ""
    
    print_success "Deployment preparation completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Upload all files to your cPanel hosting"
    echo "2. Configure your database in .env"
    echo "3. Run migrations if not done already"
    echo "4. Test your application"
    echo ""
    echo "For detailed instructions, see the README.md file"
}

# Run main function
main "$@"
