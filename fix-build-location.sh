#!/bin/bash

# Fix Build Location for cPanel Hosting
# This script moves build files from root directory to public/build if they're in the wrong location

echo "🔧 Fixing build location for cPanel hosting..."

# Check if build directory exists in root
if [ -d "build" ]; then
    echo "📁 Found build directory in root, moving to public/build..."
    
    # Remove existing public/build if it exists
    if [ -d "public/build" ]; then
        echo "🗑️  Removing existing public/build directory..."
        rm -rf public/build
    fi
    
    # Move build from root to public
    mv build public/
    echo "✅ Moved build directory to public/build"
else
    echo "ℹ️  No build directory found in root"
fi

# Check if build files exist in public/build
if [ -d "public/build" ]; then
    echo "✅ Build files found in public/build"
    
    # Check if manifest exists
    if [ -f "public/build/.vite/manifest.json" ]; then
        echo "✅ Manifest file found"
    else
        echo "❌ Manifest file not found in public/build/.vite/"
        echo "💡 You may need to run: npm run build"
    fi
else
    echo "❌ No build files found in public/build"
    echo "💡 Please run: npm run build"
fi

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod -R 755 public/build 2>/dev/null || echo "⚠️  Could not set permissions (may not be needed)"

echo "🎉 Build location fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. If you see 'Build files found in public/build' above, your site should work"
echo "2. If you see 'No build files found', run: npm run build"
echo "3. Clear Laravel caches: php artisan cache:clear"
