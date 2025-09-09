#!/usr/bin/env bash
set -euo pipefail

ZIP_NAME=${1:-cashmanagement-cpanel.zip}

echo "[1/7] Cleaning previous build..."
rm -rf public/build build || true

echo "[2/7] Installing JS deps (if needed) and building assets..."
if [ ! -d node_modules ]; then
  npm ci
fi
npm run build

echo "[3/7] Moving build to public/build..."
if [ -d build ]; then
  rm -rf public/build || true
  mv build public/build
fi

if [ ! -f public/build/.vite/manifest.json ]; then
  echo "ERROR: Production build not found at public/build/.vite/manifest.json" >&2
  exit 1
fi

echo "[4/7] Preparing packaging staging directory..."
STAGING=dist-cpanel
rm -rf "$STAGING" || true
mkdir -p "$STAGING"

echo "[5/7] Copying application files..."
INCLUDE=(
  app bootstrap config database public resources/views routes storage vendor \
  artisan composer.json composer.lock phpunit.xml .env README.md
)

for p in "${INCLUDE[@]}"; do
  if [ -e "$p" ]; then
    mkdir -p "$STAGING/$(dirname "$p")"
    cp -a "$p" "$STAGING/$p"
  fi
done

# Ensure cPanel htaccess is active
if [ -f public/.htaccess.cpanel ]; then
  cp -f public/.htaccess.cpanel "$STAGING/public/.htaccess"
fi

echo "[6/7] Removing development artifacts from package..."
REMOVE=(node_modules resources/js resources/css .git .github tests)
for r in "${REMOVE[@]}"; do
  rm -rf "$STAGING/$r" || true
done

# Ensure writable dirs exist
for w in storage bootstrap/cache public/build; do
  mkdir -p "$STAGING/$w"
done

echo "[7/7] Creating ZIP archive $ZIP_NAME ..."
rm -f "$ZIP_NAME" || true
(cd "$STAGING" && zip -qr "../$ZIP_NAME" .)

echo "Done. Upload $ZIP_NAME to cPanel and extract in your document root."
#!/bin/bash

echo "========================================"
echo " Cash Management System - cPanel Deploy"
echo "========================================"
echo

echo "[1/8] Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader
if [ $? -ne 0 ]; then
    echo "ERROR: Composer install failed!"
    exit 1
fi

echo
echo "[2/8] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed!"
    exit 1
fi

echo
echo "[3/8] Building production assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

echo
echo "[4/8] Moving build files to public/build..."
if [ -d "build" ]; then
    if [ -d "public/build" ]; then
        echo "Removing existing build directory..."
        rm -rf "public/build"
    fi
    echo "Moving build files..."
    mv "build" "public/build"
    echo "Build files moved successfully!"
else
    echo "ERROR: Build directory not found!"
    exit 1
fi

echo
echo "[5/8] Creating production environment file..."
if [ ! -f ".env" ]; then
    if [ -f "env-cpanel.example" ]; then
        cp "env-cpanel.example" ".env"
        echo "Created .env file from template"
        echo "IMPORTANT: Please edit .env file with your production settings!"
    else
        echo "WARNING: env-cpanel.example not found. Please create .env manually."
    fi
else
    echo ".env file already exists"
fi

echo
echo "[6/8] Generating application key..."
php artisan key:generate --force
if [ $? -ne 0 ]; then
    echo "WARNING: Could not generate application key automatically"
    echo "Please run: php artisan key:generate"
fi

echo
echo "[7/8] Optimizing for production..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
if [ $? -ne 0 ]; then
    echo "WARNING: Some optimization commands failed"
fi

echo
echo "[8/8] Creating storage link..."
php artisan storage:link
if [ $? -ne 0 ]; then
    echo "WARNING: Could not create storage link automatically"
    echo "Please run: php artisan storage:link"
fi

echo
echo "========================================"
echo " DEPLOYMENT PREPARATION COMPLETE!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Edit .env file with your production settings"
echo "2. Upload all files to your cPanel public_html directory"
echo "3. Set up your database in cPanel"
echo "4. Run database migrations"
echo "5. Set proper file permissions"
echo "6. Test your application"
echo
echo "For detailed instructions, see: CPANEL_PRODUCTION_DEPLOYMENT.md"
echo
