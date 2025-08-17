#!/bin/bash

# Optimize CashManagement for 1GB Cloud Server
# Run this before committing to git

echo "🔧 Optimizing CashManagement for cloud deployment..."

# Build production assets locally
echo "🏗️ Building production assets..."
if command -v npm &> /dev/null; then
    npm run build
    echo "✅ Assets built successfully"
else
    echo "❌ npm not found. Install Node.js first"
    exit 1
fi

# Create optimized .env.production template
echo "⚙️ Creating production environment template..."
cat > .env.production << 'EOF'
APP_NAME="CashManagement"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=http://141.144.235.74

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=single
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/cashmanagement/database/database.sqlite

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=file
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
EOF

# Create .gitignore additions for cloud deployment
echo "📝 Updating .gitignore for cloud deployment..."
cat >> .gitignore << 'EOF'

# Cloud deployment files
/var/
*.pid
/logs/
.env.production.local
EOF

# Create deployment checklist
echo "📋 Creating deployment checklist..."
cat > .ssh/DEPLOYMENT_CHECKLIST.md << 'EOF'
# Pre-Deployment Checklist

## Local Machine (Before git push)
- [ ] Run `bash .ssh/optimize-for-cloud.sh`
- [ ] Test build: `npm run build`
- [ ] Commit built assets: `git add public/build/ && git commit -m "Update build assets"`
- [ ] Push to repository: `git push origin main`

## Cloud Server (After git clone)
- [ ] Clone repository: `git clone <your-repo-url>`
- [ ] Run deployment: `sudo bash .ssh/deploy.sh`
- [ ] Copy production env: `cp .env.production .env`
- [ ] Generate app key: `php artisan key:generate`
- [ ] Set database path in .env
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Start server: `sudo bash .ssh/start-server.sh`
- [ ] Test access: `curl http://141.144.235.74`

## Post-Deployment
- [ ] Check logs: `sudo bash .ssh/status.sh`
- [ ] Verify file permissions
- [ ] Test all major features
- [ ] Set up monitoring/backups
EOF

# Make all scripts executable
echo "🔐 Setting script permissions..."
chmod +x .ssh/*.sh

# Show summary
echo ""
echo "✅ Optimization complete!"
echo ""
echo "📁 Files created/updated:"
echo "  - .env.production (production environment template)"
echo "  - .ssh/DEPLOYMENT_CHECKLIST.md (step-by-step guide)"
echo "  - .gitignore (updated for cloud deployment)"
echo ""
echo "🚀 Next steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'Add cloud deployment configuration'"
echo "   git push origin main"
echo ""
echo "2. On your cloud server:"
echo "   git clone <your-repository-url>"
echo "   cd CashManagement"
echo "   sudo bash .ssh/deploy.sh"
echo ""
echo "3. Your app will be available at: http://141.144.235.74"
