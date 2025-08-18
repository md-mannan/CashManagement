# 🏠 cPanel/Shared Hosting Deployment Guide

## Cash Management System - cPanel/Shared Hosting Setup

This guide provides step-by-step instructions for deploying the Cash Management System on cPanel-based shared hosting providers.

---

## 📋 Prerequisites

### Hosting Requirements
- **PHP**: 8.2 or higher
- **MySQL**: 5.7 or higher (8.0+ recommended)
- **Storage**: 500MB minimum, 1GB recommended
- **SSL Certificate**: Free Let's Encrypt or paid SSL
- **cPanel Access**: Full cPanel access required

### Recommended Hosting Providers
- **Namecheap** (Stellar Plus or higher)
- **Hostinger** (Business or higher)
- **SiteGround** (GrowBig or higher)
- **A2 Hosting** (Swift or higher)
- **InMotion Hosting** (Launch or higher)

---

## 🚀 Step-by-Step Deployment

### 1. Prepare Your Files

#### Download and Prepare Application
```bash
# On your local machine
git clone https://github.com/yourusername/cashmanagement.git
cd cashmanagement

# Install dependencies and build
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# Create deployment package
zip -r cashmanagement-cpanel.zip . -x "node_modules/*" ".git/*" "tests/*" "*.md"
```

### 2. cPanel Database Setup

#### Create MySQL Database
1. **Login to cPanel**
2. **Go to "MySQL Databases"**
3. **Create New Database**:
   - Database Name: `cashmanagement` (will be prefixed with your username)
   - Click "Create Database"

#### Create Database User
1. **In "MySQL Users" section**:
   - Username: `cashmanagement_user`
   - Password: Generate strong password
   - Click "Create User"

#### Assign User to Database
1. **In "Add User To Database" section**:
   - User: Select `cashmanagement_user`
   - Database: Select `cashmanagement`
   - Privileges: **ALL PRIVILEGES**
   - Click "Make Changes"

### 3. File Upload and Structure

#### Upload Files via File Manager
1. **Go to cPanel File Manager**
2. **Navigate to public_html**
3. **Upload your zip file**
4. **Extract the files**

#### Organize Directory Structure
```
public_html/
├── cashmanagement/          # Laravel application root
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env                 # Environment file
│   └── public/             # Laravel public directory
│       ├── index.php
│       ├── build/          # Built assets
│       └── .htaccess
└── (move Laravel public contents here if needed)
```

#### Alternative Structure (Subdomain)
```
public_html/
├── subdomain.yourdomain.com/  # Subdomain document root
│   ├── index.php             # From Laravel public/
│   ├── build/                # Built assets
│   ├── .htaccess
│   └── ...                   # Other public files
└── cashmanagement/           # Laravel app (outside public_html)
    ├── app/
    ├── bootstrap/
    └── ...
```

### 4. Environment Configuration

#### Copy and Configure .env
```bash
# In cPanel File Manager or via SSH
cp env-cpanel.example .env
```

#### Edit .env File
```env
# Application
APP_NAME="Cash Management System"
APP_ENV=production
APP_KEY=                      # Will generate later
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database (use your cPanel database details)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=username_cashmanagement
DB_USERNAME=username_cashmanagement_user
DB_PASSWORD=your_database_password

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=file

# Mail (use cPanel email)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com

# Broadcasting (Laravel Reverb for WebSockets)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=cpanel_app_id
REVERB_APP_KEY=cpanel_app_key
REVERB_APP_SECRET=cpanel_app_secret
REVERB_HOST=yourdomain.com
REVERB_PORT=8080
REVERB_SCHEME=https

# Alternative: Disable WebSockets if not needed
# BROADCAST_CONNECTION=null
```

### 5. Laravel Setup Commands

#### Via SSH (if available)
```bash
# Navigate to your Laravel directory
cd public_html/cashmanagement

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Create super admin user
php artisan db:seed --class=SuperAdminSeeder --force

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod -R 775 storage bootstrap/cache
```

#### Via cPanel Terminal (if available)
1. **Go to cPanel Terminal**
2. **Navigate to your application**
3. **Run the same commands as above**

#### Manual Setup (if no SSH/Terminal)
If SSH is not available, create a setup script:

**Create `setup.php` in your Laravel root:**
```php
<?php
// setup.php - Run this once via browser
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Generate key
$kernel->call('key:generate');

// Run migrations
$kernel->call('migrate', ['--force' => true]);

// Seed super admin
$kernel->call('db:seed', ['--class' => 'SuperAdminSeeder', '--force' => true]);

// Cache config
$kernel->call('config:cache');
$kernel->call('route:cache');
$kernel->call('view:cache');

echo "Setup completed successfully!";
// Delete this file after running
unlink(__FILE__);
?>
```

**Access via browser**: `https://yourdomain.com/setup.php`

### 6. Web Server Configuration

#### Configure .htaccess
```bash
# Copy cPanel-specific .htaccess
cp public/.htaccess.cpanel public/.htaccess
```

#### Edit .htaccess for Your Domain
Replace `yourdomain.com` with your actual domain in the .htaccess file.

#### Document Root Configuration
If your hosting provider allows document root changes:
1. **Go to cPanel "Subdomains" or "Addon Domains"**
2. **Set document root to**: `public_html/cashmanagement/public`

### 7. SSL Certificate Setup

#### Free SSL via cPanel
1. **Go to "SSL/TLS"**
2. **Select "Let's Encrypt"**
3. **Enable for your domain**
4. **Force HTTPS redirect**

#### Verify SSL Configuration
- Test: `https://yourdomain.com`
- Check certificate validity
- Ensure HTTP redirects to HTTPS

### 8. File Permissions

#### Set Correct Permissions
```bash
# Via SSH or Terminal
find /path/to/cashmanagement -type f -exec chmod 644 {} \;
find /path/to/cashmanagement -type d -exec chmod 755 {} \;

# Storage and cache need write permissions
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# Make sure .env is not publicly readable
chmod 600 .env
```

#### Via cPanel File Manager
1. **Select directories/files**
2. **Click "Permissions"**
3. **Set appropriate permissions**:
   - Directories: 755
   - Files: 644
   - Storage/Cache: 775
   - .env: 600

---

## ⚙️ cPanel-Specific Configurations

### PHP Configuration

#### Via php.ini (if available)
Create `php.ini` in your Laravel root:
```ini
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
upload_max_filesize = 10M
post_max_size = 10M
display_errors = Off
log_errors = On
```

#### Via .htaccess
The `.htaccess.cpanel` file includes PHP configurations.

### Cron Jobs Setup

#### Create Cron Job
1. **Go to cPanel "Cron Jobs"**
2. **Add New Cron Job**:
   - **Minute**: `*`
   - **Hour**: `*`
   - **Day**: `*`
   - **Month**: `*`
   - **Weekday**: `*`
   - **Command**: `/usr/local/bin/php /home/username/public_html/cashmanagement/artisan schedule:run`

#### Alternative Command Formats
```bash
# Try these if the above doesn't work
php /home/username/public_html/cashmanagement/artisan schedule:run
/usr/bin/php /home/username/public_html/cashmanagement/artisan schedule:run
/opt/cpanel/ea-php82/root/usr/bin/php /home/username/public_html/cashmanagement/artisan schedule:run
```

### WebSocket Server Setup (Laravel Reverb)

#### Option 1: Using Node.js (if available on cPanel)
If your cPanel hosting supports Node.js applications:

1. **Enable Node.js in cPanel**:
   - Go to "Node.js Apps"
   - Create new Node.js app
   - Set startup file to `server.js`

2. **Create Reverb startup script**:
```javascript
// server.js
const { spawn } = require('child_process');
const path = require('path');

const laravelPath = '/home/username/public_html/cashmanagement';
const reverbProcess = spawn('php', [
    path.join(laravelPath, 'artisan'),
    'reverb:start',
    '--host=0.0.0.0',
    '--port=8080'
], {
    cwd: laravelPath,
    stdio: 'inherit'
});

reverbProcess.on('close', (code) => {
    console.log(`Reverb process exited with code ${code}`);
    // Restart the process
    setTimeout(() => {
        spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: 'inherit'
        });
    }, 5000);
});
```

#### Option 2: Background Process (SSH required)
If you have SSH access:

```bash
# Start Reverb in background
nohup php artisan reverb:start --host=0.0.0.0 --port=8080 > /dev/null 2>&1 &

# Check if it's running
ps aux | grep reverb

# Stop Reverb (if needed)
pkill -f "artisan reverb:start"
```

#### Option 3: Disable WebSockets (Fallback)
If WebSocket server cannot be run on shared hosting:

```env
# In .env file
BROADCAST_CONNECTION=null

# Or use polling instead of WebSockets in frontend
VITE_WEBSOCKET_ENABLED=false
```

### Email Configuration

#### cPanel Email Setup
1. **Create email account** in cPanel
2. **Use SMTP settings**:
   - Host: `mail.yourdomain.com`
   - Port: `587` (TLS) or `465` (SSL)
   - Username: Full email address
   - Password: Email account password

#### Test Email Configuration
Create a test script to verify email:
```php
<?php
// test-email.php
use Illuminate\Support\Facades\Mail;

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

try {
    Mail::raw('Test email from Cash Management System', function ($message) {
        $message->to('your-email@domain.com')
                ->subject('Test Email');
    });
    echo "Email sent successfully!";
} catch (Exception $e) {
    echo "Email failed: " . $e->getMessage();
}
?>
```

---

## 🔧 Troubleshooting Common Issues

### 1. 500 Internal Server Error

#### Check Error Logs
1. **Go to cPanel "Error Logs"**
2. **Check latest entries**
3. **Common causes**:
   - Incorrect file permissions
   - Missing .env file
   - Database connection issues
   - PHP version incompatibility

#### Solutions
```bash
# Fix permissions
chmod -R 755 bootstrap/cache storage
chmod 644 .env

# Clear caches
php artisan config:clear
php artisan cache:clear
```

### 2. Database Connection Issues

#### Verify Database Details
- Check database name format: `username_dbname`
- Verify user has ALL PRIVILEGES
- Test connection with phpMyAdmin

#### Common Database Hosts
- Most shared hosts: `localhost`
- Some hosts: `mysql.yourdomain.com`
- Check with hosting provider

### 3. File Permission Issues

#### Storage Not Writable
```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

#### Via cPanel File Manager
1. **Select storage folder**
2. **Permissions → 775**
3. **Apply to all subdirectories**

### 4. SSL/HTTPS Issues

#### Mixed Content Errors
- Ensure all assets load via HTTPS
- Check .env APP_URL is https://
- Verify .htaccess HTTPS redirect

#### SSL Certificate Problems
- Wait 24-48 hours for propagation
- Clear browser cache
- Check certificate via SSL checker tools

### 5. Email Not Working

#### SMTP Authentication Failed
- Verify email account exists
- Check username (usually full email)
- Test with email client first

#### Alternative: Use Sendmail
```env
MAIL_MAILER=sendmail
MAIL_HOST=localhost
MAIL_PORT=25
```

### 6. WebSocket/Reverb Issues

#### Reverb Server Won't Start
```bash
# Check if port 8080 is available
netstat -tulpn | grep :8080

# Try different port
php artisan reverb:start --port=8081

# Check hosting provider limitations
# Some shared hosts block WebSocket connections
```

#### WebSocket Connection Failed
- **Check firewall settings** - Many shared hosts block WebSocket ports
- **Contact hosting provider** - Ask about WebSocket support
- **Use alternative port** - Try ports 80, 443, 8080, 8081
- **Fallback to polling** - Set `BROADCAST_CONNECTION=null`

#### Real-time Features Not Working
```env
# Disable WebSockets and use polling instead
BROADCAST_CONNECTION=null
VITE_WEBSOCKET_ENABLED=false

# Or try different WebSocket configuration
REVERB_HOST=your-domain.com
REVERB_PORT=443
REVERB_SCHEME=https
```

---

## 🔒 Security Best Practices

### File Protection
- Never upload `.env` to public directories
- Keep Laravel app outside `public_html` if possible
- Use strong database passwords
- Enable SSL certificate

### Regular Maintenance
- Keep Laravel updated
- Monitor error logs
- Regular database backups
- Update passwords periodically

### Backup Strategy
1. **Database Backups**:
   - Use cPanel "MySQL Databases" → "Download"
   - Schedule regular exports

2. **File Backups**:
   - Use cPanel "File Manager" → "Compress"
   - Download compressed files

---

## 📊 Performance Optimization

### Caching
- Enable OPcache if available
- Use file-based caching for sessions
- Cache Laravel configurations

### Asset Optimization
- Ensure assets are built (`npm run build`)
- Enable compression in .htaccess
- Use CDN if available

### Database Optimization
- Regular database maintenance
- Optimize tables periodically
- Monitor query performance

---

## 🆘 Getting Help

### Hosting Provider Support
- Contact your hosting provider for:
  - PHP version issues
  - Database connection problems
  - SSL certificate issues
  - File permission problems

### Common Support Requests
- "Please enable PHP 8.2 for my account"
- "I need help with SSL certificate installation"
- "Database connection is not working"
- "File permissions are not correct"

---

## ✅ Post-Deployment Checklist

### Functionality Tests
- [ ] Application loads without errors
- [ ] Database connection working
- [ ] User registration/login works
- [ ] Email sending functional
- [ ] File uploads working (if applicable)
- [ ] SSL certificate valid and enforcing HTTPS
- [ ] WebSocket/Reverb server running (if enabled)
- [ ] Real-time notifications working

### Security Checks
- [ ] .env file not publicly accessible
- [ ] Strong passwords used
- [ ] SSL certificate installed and working
- [ ] File permissions correctly set
- [ ] Error display disabled (APP_DEBUG=false)

### Performance Checks
- [ ] Page load times acceptable
- [ ] Assets loading correctly
- [ ] Caching enabled
- [ ] Compression working

### Backup Setup
- [ ] Database backup scheduled
- [ ] File backup strategy in place
- [ ] Recovery process tested

**🎉 Your Cash Management System is now live on cPanel shared hosting!**

---

## 📞 Support Resources

- **Laravel Documentation**: https://laravel.com/docs
- **cPanel Documentation**: https://docs.cpanel.net
- **Hosting Provider Support**: Contact your hosting provider
- **Community Forums**: Laravel community, hosting provider forums

Remember to keep your application updated and monitor the error logs regularly for any issues!
