#!/bin/bash

# Production Build Script for Cash Management System
# Optimized for cPanel/Shared Hosting Deployment

echo "🚀 Starting Production Build for cPanel Deployment..."

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

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf public/build
rm -rf node_modules/.vite
print_success "Previous builds cleaned"

# Step 2: Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Step 3: Build for production with optimizations
print_status "Building production assets with optimizations..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    print_success "Production build completed successfully"
else
    print_error "Build failed! Please check the errors above."
    exit 1
fi

# Step 4: Verify build output
print_status "Verifying build output..."

# Check if manifest exists
if [ -f "public/build/.vite/manifest.json" ]; then
    print_success "Vite manifest generated"
else
    print_error "Vite manifest not found!"
    exit 1
fi

# Check build directory structure
print_status "Checking build directory structure..."
ls -la public/build/assets/ | head -10

# Step 5: Optimize for cPanel
print_status "Optimizing for cPanel deployment..."

# Set proper permissions
chmod -R 755 public/build/
chmod 644 public/build/.vite/manifest.json

# Step 6: Create deployment package
print_status "Creating deployment package..."

# Create a temporary directory for deployment files
mkdir -p deployment-package

# Copy necessary files for cPanel
cp -r app/ deployment-package/
cp -r bootstrap/ deployment-package/
cp -r config/ deployment-package/
cp -r database/ deployment-package/
cp -r resources/ deployment-package/
cp -r routes/ deployment-package/
cp -r storage/ deployment-package/
cp -r vendor/ deployment-package/
cp -r public/build/ deployment-package/public/
cp public/.htaccess deployment-package/public/
cp public/index.php deployment-package/public/
cp public/favicon.ico deployment-package/public/
cp public/favicon.svg deployment-package/public/
cp public/apple-touch-icon.png deployment-package/public/
cp public/logo.svg deployment-package/public/
cp public/robots.txt deployment-package/public/
cp artisan deployment-package/
cp composer.json deployment-package/
cp composer.lock deployment-package/

# Create deployment instructions
cat > deployment-package/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# cPanel Deployment Instructions

## 📁 File Structure for cPanel

### Upload to public_html/ (Web Root):
- `.htaccess`
- `index.php`
- `build/` (entire directory)
- `favicon.ico`
- `favicon.svg`
- `apple-touch-icon.png`
- `logo.svg`
- `robots.txt`

### Upload to directory outside public_html/ (e.g., /laravel/):
- `app/`
- `bootstrap/`
- `config/`
- `database/`
- `resources/`
- `routes/`
- `storage/`
- `vendor/`
- `artisan`
- `composer.json`
- `composer.lock`

## ⚙️ Configuration Steps

1. **Update public_html/index.php**:
   ```php
   // Change these lines:
   require __DIR__.'/../vendor/autoload.php';
   $app = require_once __DIR__.'/../bootstrap/app.php';
   
   // To:
   require __DIR__.'/../laravel/vendor/autoload.php';
   $app = require_once __DIR__.'/../laravel/bootstrap/app.php';
   ```

2. **Create .env file** in the laravel directory with your database credentials

3. **Set permissions**:
   ```bash
   chmod 644 laravel/.env
   chmod -R 755 laravel/storage/
   chmod -R 755 laravel/bootstrap/cache/
   ```

4. **Run Laravel commands**:
   ```bash
   cd laravel
   php artisan key:generate
   php artisan config:clear
   php artisan cache:clear
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## 🔍 Troubleshooting

- If assets don't load, check the .htaccess file
- If database connection fails, verify credentials in .env
- Check Laravel logs in laravel/storage/logs/
EOF

print_success "Deployment package created in 'deployment-package/' directory"

# Step 7: Build summary
print_status "Build Summary:"
echo "✅ Production assets built and optimized"
echo "✅ Chunk splitting configured for better performance"
echo "✅ Bundle sizes optimized for shared hosting"
echo "✅ Deployment package ready"
echo "📦 Deployment files available in: deployment-package/"

# Step 8: Performance check
print_status "Checking bundle sizes..."
echo "Bundle sizes:"
ls -lh public/build/assets/*.js | awk '{print $5, $9}'

print_success "Production build completed! Ready for cPanel deployment."
echo ""
echo "Next steps:"
echo "1. Upload files to cPanel following the instructions in deployment-package/DEPLOYMENT_INSTRUCTIONS.md"
echo "2. Configure your database credentials"
echo "3. Run Laravel setup commands"
echo "4. Test the application"
