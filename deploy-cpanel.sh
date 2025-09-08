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
