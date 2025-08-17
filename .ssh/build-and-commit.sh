#!/bin/bash

# Build Assets and Commit Script for CashManagement
# Run this on your LOCAL machine before deploying

echo "🏗️ Building and committing CashManagement assets..."

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel project directory"
    echo "Make sure you're in the CashManagement root directory"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Install Node.js first"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Build production assets
echo "🔨 Building production assets..."
npm run build

# Check if build was successful
if [ ! -f "public/build/.vite/manifest.json" ]; then
    echo "❌ Build failed - .vite/manifest.json not found"
    echo "Check for build errors above"
    exit 1
fi

echo "✅ Build successful!"

# Show build files
echo "📁 Built assets:"
ls -la public/build/

# Add to git
echo "📝 Adding built assets to git..."
git add public/build/

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️ No changes to commit (assets already up to date)"
else
    # Commit the built assets
    echo "💾 Committing built assets..."
    git commit -m "🏗️ Update built assets for production deployment

- Built with npm run build
- Updated manifest.json
- Ready for cloud deployment"

    echo "✅ Assets committed successfully!"
    
    # Ask if user wants to push
    read -p "🚀 Push to repository now? (y/N): " push_now
    if [[ $push_now =~ ^[Yy]$ ]]; then
        echo "📤 Pushing to repository..."
        git push origin client
        echo "✅ Pushed to repository!"
    else
        echo "⏸️ Not pushed. Run 'git push origin client' when ready."
    fi
fi

echo ""
echo "🎉 Build and commit complete!"
echo "🌐 Your assets are ready for cloud deployment"
echo ""
echo "Next steps on your cloud server:"
echo "1. cd /var/www/html/CashManagement"
echo "2. git pull origin client"
echo "3. sudo bash .ssh/deploy.sh"
echo "4. sudo bash .ssh/start-server.sh"
