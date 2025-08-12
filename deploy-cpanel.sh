#!/bin/bash

# cPanel Deployment Script for Cash Management System
# This script prepares the project for cPanel deployment

echo "🚀 Preparing Cash Management System for cPanel deployment..."

# Step 1: Install dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Step 2: Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 3: Build frontend assets
echo "🔨 Building frontend assets..."
npm run build

# Step 4: Generate application key
echo "🔑 Generating application key..."
php artisan key:generate --show

# Step 5: Clear caches
echo "🧹 Clearing application caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Step 6: Create production .env file
echo "📝 Creating production .env file..."
if [ ! -f .env.production ]; then
    cp env.production.template .env.production
    echo "✅ Production .env file created. Please edit it with your database credentials."
else
    echo "✅ Production .env file already exists."
fi

# Step 7: Create deployment package
echo "📦 Creating deployment package..."
DEPLOY_DIR="cpanel-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp -r app $DEPLOY_DIR/
cp -r bootstrap $DEPLOY_DIR/
cp -r config $DEPLOY_DIR/
cp -r database $DEPLOY_DIR/
cp -r lang $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp -r resources $DEPLOY_DIR/
cp -r routes $DEPLOY_DIR/
cp -r storage $DEPLOY_DIR/
cp -r vendor $DEPLOY_DIR/
cp artisan $DEPLOY_DIR/
cp composer.json $DEPLOY_DIR/
cp composer.lock $DEPLOY_DIR/
cp .env.production $DEPLOY_DIR/.env

# Create .htaccess for cPanel
cat > $DEPLOY_DIR/public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# cPanel Deployment Instructions

## 1. Upload Files
- Upload all files from this directory to your cPanel public_html folder
- Make sure to maintain the directory structure

## 2. Set File Permissions
```bash
chmod 755 public/
chmod 644 public/.htaccess
chmod 755 storage/
chmod 755 bootstrap/cache/
```

## 3. Configure Database
- Edit the .env file with your database credentials
- Create a MySQL database in cPanel
- Import the database schema (if you have one)

## 4. Generate Application Key
```bash
php artisan key:generate
```

## 5. Run Migrations
```bash
php artisan migrate
```

## 6. Seed Database (Optional)
```bash
php artisan db:seed
```

## 7. Clear Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

## 8. Test Application
- Visit your domain to ensure the application is working
- Check for any error logs in storage/logs/

## Troubleshooting
- If you get permission errors, check file permissions
- If assets don't load, ensure the build directory is uploaded
- Check error logs in storage/logs/ for detailed error messages
EOF

# Create zip file
echo "📦 Creating deployment package..."
zip -r "${DEPLOY_DIR}.zip" $DEPLOY_DIR/

echo "✅ Deployment package created: ${DEPLOY_DIR}.zip"
echo "📁 Unpacked files are in: $DEPLOY_DIR/"
echo "📖 See DEPLOYMENT_INSTRUCTIONS.md for deployment steps"
echo ""
echo "🚀 Ready for cPanel deployment!"
