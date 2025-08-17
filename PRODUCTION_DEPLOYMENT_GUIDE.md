# Cash Management - Production Deployment Guide

## Pre-Deployment Cleanup ✅

The following unnecessary files have been removed:
- `docker-deploy.sh` - Docker deployment script
- `test-extensions.sh` - Development test script
- `fix-php-extensions.sh` - Development script
- `pre-deploy.sh` - Old deployment script
- `verify-deployment.sh` - Deployment verification script
- `index.php` - Duplicate index file (Laravel uses public/index.php)
- `public/hot` - Vite hot reload file

## Step-by-Step cPanel Shared Hosting Deployment

### Step 1: Prepare Your Local Environment

1. **Build Production Assets**
   ```bash
   npm run build
   ```

2. **Optimize Laravel for Production**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan event:cache
   ```

3. **Generate Application Key** (if not already done)
   ```bash
   php artisan key:generate
   ```

### Step 2: Create Production Archive

1. **Create a ZIP file** of your entire project (excluding node_modules and .git):
   ```bash
   zip -r cashmanagement-production.zip . -x "node_modules/*" ".git/*" "storage/logs/*" ".env"
   ```

### Step 3: cPanel Setup

#### A. Upload Files

1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to your domain's root** (usually `public_html` or `www`)
4. **Upload the ZIP file** and extract it
5. **Move Laravel files correctly**:
   - Move everything from the Laravel `public` folder to your domain's public folder
   - Move all other Laravel files (app, config, database, etc.) to a folder **outside** the public directory (e.g., `laravel_app`)

#### B. Update File Paths

1. **Edit `public/index.php`**:
   ```php
   require __DIR__.'/../laravel_app/vendor/autoload.php';
   $app = require_once __DIR__.'/../laravel_app/bootstrap/app.php';
   ```

### Step 4: Database Setup

#### A. Create Database in cPanel

1. **Go to MySQL Databases** in cPanel
2. **Create a new database**: `yourusername_cashmanagement`
3. **Create a database user** with a strong password
4. **Assign the user to the database** with all privileges

#### B. Import Database

1. **Go to phpMyAdmin** in cPanel
2. **Select your database**
3. **Import your database dump** (if you have existing data)

### Step 5: Environment Configuration

1. **Create `.env` file** in your Laravel root directory (`laravel_app/.env`)
2. **Copy contents from `env-production-template.txt`**
3. **Update the following values**:

```env
APP_NAME="Cash Management"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=yourusername_cashmanagement
DB_USERNAME=yourusername_dbuser
DB_PASSWORD=your_strong_password

# Laravel Reverb Configuration
REVERB_APP_ID=12345
REVERB_APP_KEY=your-reverb-key
REVERB_APP_SECRET=your-reverb-secret
REVERB_HOST="yourdomain.com"
REVERB_PORT=443
REVERB_SCHEME=https

# Update these with your actual credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
```

### Step 6: Set Permissions

Set the following folder permissions:
- `storage/` and all subfolders: **755**
- `bootstrap/cache/`: **755**
- All files: **644**

### Step 7: Laravel Reverb Setup for All Hosting Types

**Great News**: The dynamic environment system now configures Laravel Reverb optimally for all hosting types, including shared hosting!

#### Primary Option: Laravel Reverb (Recommended for All Environments)

1. **Reverb is automatically configured** by the dynamic environment system
2. **For shared hosting**: Reverb is optimized with appropriate settings for stability
3. **For VPS/Dedicated**: Full Reverb server capabilities are enabled
4. **Configuration is generated automatically** with optimal settings

Your `.env` will include:
```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=auto_generated_id
REVERB_APP_KEY=auto_generated_key  
REVERB_APP_SECRET=auto_generated_secret
REVERB_HOST="yourdomain.com"
REVERB_PORT=443
REVERB_SCHEME=https

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

#### Fallback Option: Pusher (If Reverb Doesn't Work)

If you encounter issues with Reverb on your specific hosting:

1. **Uncomment Pusher config** in your `.env` file
2. **Change broadcast connection**: `BROADCAST_CONNECTION=pusher`
3. **Sign up for Pusher** at https://pusher.com and get your credentials

#### Starting Reverb Server

**For VPS/Dedicated servers**:
```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```

**For shared hosting**: Reverb works through your web server - no separate process needed!

### Step 8: Run Laravel Commands

Access your hosting's terminal (if available) or use cPanel's Terminal:

```bash
cd /path/to/your/laravel_app

# Install dependencies (if not included in upload)
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Seed database (if needed)
php artisan db:seed --force

# Clear and cache config
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create symbolic link for storage
php artisan storage:link
```

### Step 9: SSL Certificate

1. **Enable SSL** in cPanel (Let's Encrypt is usually free)
2. **Force HTTPS** by adding to `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### Step 10: Final Checks

1. **Test your application** at https://yourdomain.com
2. **Check error logs** in cPanel if issues occur
3. **Test WebSocket functionality** (if using Pusher/Ably)
4. **Test social authentication**
5. **Verify database connectivity**

## Laravel Reverb Keys Generation

To generate Reverb keys, run locally:
```bash
php artisan reverb:install
```

This will generate:
- `REVERB_APP_ID`
- `REVERB_APP_KEY`
- `REVERB_APP_SECRET`

## Troubleshooting

### Common Issues:

1. **500 Internal Server Error**
   - Check file permissions
   - Verify `.env` configuration
   - Check error logs in cPanel

2. **Database Connection Error**
   - Verify database credentials
   - Ensure database user has proper privileges
   - Check database host (usually `localhost`)

3. **WebSocket Connection Issues**
   - Verify Pusher/Ably credentials
   - Check firewall settings
   - Ensure SSL is properly configured

4. **File Upload Issues**
   - Check `storage/` permissions
   - Verify symbolic link: `php artisan storage:link`

### Performance Optimization:

1. **Enable OPcache** (ask your hosting provider)
2. **Use Redis** for caching (if available)
3. **Enable Gzip compression**
4. **Optimize images** and assets

## Post-Deployment Maintenance

1. **Regular Backups**: Set up automated backups in cPanel
2. **Monitor Logs**: Check Laravel logs regularly
3. **Update Dependencies**: Keep Laravel and packages updated
4. **Security**: Monitor for security updates

## Support

If you encounter issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check cPanel error logs
3. Verify all environment variables
4. Test locally first before deploying

---

**Note**: This guide assumes standard cPanel shared hosting. Some providers may have specific requirements or limitations.
