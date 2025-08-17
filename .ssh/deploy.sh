#!/bin/bash

# CashManagement Deployment Script
# This script sets up the application to run on port 80 with proper permissions

echo "🚀 Starting CashManagement deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to run as root for port 80 access"
    echo "Run: sudo bash .ssh/deploy.sh"
    exit 1
fi

# Get the actual user (not root when using sudo)
ACTUAL_USER=${SUDO_USER:-$USER}
PROJECT_DIR="/var/www/cashmanagement"

echo "📁 Setting up project directory..."
mkdir -p $PROJECT_DIR
chown -R $ACTUAL_USER:www-data $PROJECT_DIR

# Copy project files
echo "📋 Copying project files..."
cp -r . $PROJECT_DIR/
cd $PROJECT_DIR

# Fix git ownership issue
echo "🔧 Fixing git repository ownership..."
git config --global --add safe.directory $PROJECT_DIR
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/.git

# Set proper file permissions
echo "🔐 Setting file permissions..."
# Directories should be 755
find $PROJECT_DIR -type d -exec chmod 755 {} \;
# Files should be 644
find $PROJECT_DIR -type f -exec chmod 644 {} \;
# Make scripts executable
chmod +x $PROJECT_DIR/.ssh/deploy.sh
chmod +x $PROJECT_DIR/artisan
chmod +x $PROJECT_DIR/.ssh/start-server.sh

# Storage and cache directories need write permissions
echo "📝 Setting storage permissions..."
chmod -R 775 $PROJECT_DIR/storage
chmod -R 775 $PROJECT_DIR/bootstrap/cache
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/storage
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/bootstrap/cache

# Create .env file if not exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "⚙️ Creating production .env file..."
    
    # Check if .env.example exists, if not create .env directly
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        cp $PROJECT_DIR/.env.example $PROJECT_DIR/.env
    else
        echo "📄 No .env.example found, creating .env directly..."
        bash $PROJECT_DIR/.ssh/create-env.sh
        return 0
    fi
    
    # Configure database for production
    echo "🗄️ Configuring database settings..."
    sed -i "s|DB_CONNECTION=.*|DB_CONNECTION=sqlite|g" $PROJECT_DIR/.env
    sed -i "s|DB_DATABASE=.*|DB_DATABASE=$PROJECT_DIR/database/database.sqlite|g" $PROJECT_DIR/.env
    
    # Set production environment
    sed -i "s|APP_ENV=.*|APP_ENV=production|g" $PROJECT_DIR/.env
    sed -i "s|APP_DEBUG=.*|APP_DEBUG=false|g" $PROJECT_DIR/.env
    sed -i "s|APP_URL=.*|APP_URL=http://141.144.235.74|g" $PROJECT_DIR/.env
    
    # Set proper ownership and permissions
    chown $ACTUAL_USER:www-data $PROJECT_DIR/.env
    chmod 644 $PROJECT_DIR/.env
    
    echo "✅ .env configured for production with SQLite database"
else
    echo "✅ .env file already exists"
    # Update database path if it's not set correctly
    if ! grep -q "DB_DATABASE=$PROJECT_DIR/database/database.sqlite" $PROJECT_DIR/.env; then
        echo "🔧 Updating database path in existing .env..."
        sed -i "s|DB_DATABASE=.*|DB_DATABASE=$PROJECT_DIR/database/database.sqlite|g" $PROJECT_DIR/.env
    fi
fi

# Clean vendor directory if it exists and has permission issues
if [ -d "$PROJECT_DIR/vendor" ]; then
    echo "🧹 Cleaning existing vendor directory..."
    rm -rf $PROJECT_DIR/vendor
fi

# Install PHP dependencies (Composer)
echo "📦 Installing PHP dependencies..."
if command -v composer &> /dev/null; then
    # Set proper ownership before composer install
    chown -R $ACTUAL_USER:www-data $PROJECT_DIR
    sudo -u $ACTUAL_USER composer install --no-dev --optimize-autoloader --no-interaction
    # Fix permissions after composer install
    chown -R $ACTUAL_USER:www-data $PROJECT_DIR/vendor
    chmod -R 755 $PROJECT_DIR/vendor
else
    echo "⚠️ Composer not found. Install it first:"
    echo "curl -sS https://getcomposer.org/installer | php"
    echo "sudo mv composer.phar /usr/local/bin/composer"
fi

# Generate application key
echo "🔑 Generating application key..."
sudo -u $ACTUAL_USER php artisan key:generate

# Set up database (if SQLite)
echo "🗄️ Setting up database..."
# Ensure database directory has correct permissions
mkdir -p $PROJECT_DIR/database
chown -R $ACTUAL_USER:www-data $PROJECT_DIR/database
chmod 775 $PROJECT_DIR/database

if [ ! -f "$PROJECT_DIR/database/database.sqlite" ]; then
    echo "📄 Creating SQLite database file..."
    sudo -u $ACTUAL_USER touch $PROJECT_DIR/database/database.sqlite
    chmod 664 $PROJECT_DIR/database/database.sqlite
    chown $ACTUAL_USER:www-data $PROJECT_DIR/database/database.sqlite
    echo "✅ Database file created successfully"
else
    echo "✅ Database file already exists"
    # Fix permissions if file exists
    chmod 664 $PROJECT_DIR/database/database.sqlite
    chown $ACTUAL_USER:www-data $PROJECT_DIR/database/database.sqlite
fi

# Check if build assets exist
echo "🔍 Checking build assets..."
if [ ! -f "$PROJECT_DIR/public/build/.vite/manifest.json" ]; then
    echo "❌ Vite build assets not found!"
    echo "⚠️ You need to build assets locally and commit them to git"
    echo ""
    echo "📋 On your local machine, run:"
    echo "   npm install"
    echo "   npm run build"
    echo "   git add public/build/"
    echo "   git commit -m 'Add built assets'"
    echo "   git push origin client"
    echo ""
    echo "🔧 Or use the optimize script:"
    echo "   bash .ssh/optimize-for-cloud.sh"
    echo ""
    echo "⏸️ Deployment paused. Please build assets first."
    exit 1
else
    echo "✅ Build assets found"
fi

# Run migrations
sudo -u $ACTUAL_USER php artisan migrate --force

# Clear and cache config
echo "🧹 Optimizing application..."
sudo -u $ACTUAL_USER php artisan config:clear
sudo -u $ACTUAL_USER php artisan cache:clear
sudo -u $ACTUAL_USER php artisan config:cache
sudo -u $ACTUAL_USER php artisan route:cache

echo "✅ Deployment complete!"
echo "🌐 Your application is ready to run on port 80"
echo "📍 Project location: $PROJECT_DIR"
echo ""
echo "To start the server:"
echo "cd $PROJECT_DIR && sudo bash .ssh/start-server.sh"
echo ""
echo "Your app will be available at: http://141.144.235.74"
