#!/bin/bash

# Fix 419 CSRF Token Mismatch Error
# Run this script via SSH on your cPanel hosting

echo "🔧 Fixing 419 CSRF Token Error..."

# Step 1: Clear all Laravel caches
echo "📋 Clearing Laravel caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# Step 2: Regenerate application key
echo "🔑 Regenerating application key..."
php artisan key:generate

# Step 3: Clear session data
echo "🗑️ Clearing session data..."
php artisan session:table
php artisan migrate --force

# Step 4: Set proper permissions
echo "📁 Setting file permissions..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod -R 755 public/build/
chmod 644 .env

# Step 5: Rebuild caches
echo "🏗️ Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ 419 Error fix completed!"
echo "📝 Next steps:"
echo "1. Clear your browser cache and cookies"
echo "2. Try logging in again"
echo "3. If still having issues, check your .env file session settings"
