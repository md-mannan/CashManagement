#!/bin/bash

# Production Build Script for Cash Management System
# Optimized for cPanel/Shared Hosting Deployment

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 Starting Production Build for cPanel Deployment..."

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf public/build
rm -rf node_modules/.vite
print_success "Previous builds cleaned"

# Step 2: Install dependencies
print_status "Installing Node.js dependencies..."
npm install --omit=dev
print_success "Node.js dependencies installed"

# Step 3: Run Vite production build
print_status "Running Vite production build..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Vite production build completed"
else
    print_error "Vite build failed"
    exit 1
fi

# Step 4: Optimize Laravel for production
print_status "Optimizing Laravel for production..."

# Clear all caches
php artisan cache:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear

# Cache for production
php artisan route:cache
php artisan config:cache
php artisan view:cache

print_success "Laravel optimization completed"

# Step 5: Create storage link
print_status "Creating storage link..."
php artisan storage:link
print_success "Storage link created"

# Step 6: Set proper permissions
print_status "Setting proper permissions..."
chmod -R 755 public/build
chmod -R 644 public/build/assets/*
print_success "Permissions set"

# Step 7: Verify build
print_status "Verifying build..."
if [ -f "public/build/.vite/manifest.json" ]; then
    print_success "Build manifest found"
else
    print_error "Build manifest not found"
    exit 1
fi

if [ -f "public/build/assets/app.js" ]; then
    print_success "Main app.js found"
else
    print_error "Main app.js not found"
    exit 1
fi

# Step 8: Display build summary
echo ""
echo "🎉 Production Build Summary:"
echo "=============================="
echo "📁 Build directory: public/build/"
echo "📄 Manifest: public/build/.vite/manifest.json"
echo "📦 Assets: public/build/assets/"
echo "🔧 Laravel optimized for production"
echo "🔗 Storage link created"
echo "📋 Permissions set correctly"
echo ""
echo "🚀 Ready for cPanel deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Upload all files to your cPanel hosting"
echo "2. Set APP_ENV=production in your .env file"
echo "3. Run: php artisan migrate"
echo "4. Ensure your domain points to the public/ directory"
echo ""
