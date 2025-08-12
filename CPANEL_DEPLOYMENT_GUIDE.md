# cPanel Deployment Guide for Cash Management System

## Overview

This guide will help you deploy the Cash Management System to cPanel shared hosting without the custom installer. The application will work directly after uploading files and configuring the database.

## Prerequisites

- cPanel hosting account with PHP 8.2+ support
- MySQL/MariaDB database access
- SSH access or cPanel Terminal (optional but recommended)
- Git access (optional)

## Step-by-Step Deployment

### Step 1: Prepare Your Local Project

#### Option A: Using Deployment Scripts (Recommended)

1. **Windows Users**: Run `deploy-cpanel.bat`
2. **Linux/Mac Users**: Run `./deploy-cpanel.sh`

This will:

- Install dependencies
- Build frontend assets
- Create a deployment package
- Generate production environment file

#### Option B: Manual Preparation

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run build:production

# Generate application key
php artisan key:generate --show
```

### Step 2: Create Database in cPanel

1. Login to cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `cash_management`)
4. Create a database user with full privileges
5. Note down:
    - Database name
    - Database username
    - Database password
    - Database host (usually `localhost`)

### Step 3: Upload Files to cPanel

#### Option A: File Manager Upload

1. Go to **File Manager** in cPanel
2. Navigate to `public_html` directory
3. Upload all files from your deployment package
4. Maintain the exact directory structure

#### Option B: SSH/Terminal Upload

```bash
# If you have SSH access
cd public_html
# Upload your deployment package and extract
unzip your-deployment-package.zip
```

### Step 4: Configure Environment

1. In File Manager, locate the `.env` file
2. Edit it with your database credentials:

```env
APP_NAME="Cash Management"
APP_ENV=production
APP_KEY=your_generated_key_here
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

### Step 5: Set File Permissions

In cPanel Terminal or SSH:

```bash
chmod 755 public/
chmod 644 public/.htaccess
chmod 755 storage/
chmod 755 bootstrap/cache/
chmod 644 .env
```

### Step 6: Run Database Migrations

In cPanel Terminal or SSH:

```bash
cd public_html
php artisan migrate
```

### Step 7: Seed Database (Optional)

```bash
php artisan db:seed
```

### Step 8: Clear Caches

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

### Step 9: Test Application

1. Visit your domain: `https://yourdomain.com`
2. You should see the login page
3. Create your first user account
4. Test the application functionality

## Troubleshooting

### Common Issues

#### 1. White Page or 500 Error

- Check file permissions
- Verify `.env` file exists and has correct database credentials
- Check error logs in `storage/logs/`

#### 2. Assets Not Loading

- Ensure `public/build` directory was uploaded
- Check if `.htaccess` file exists in `public` directory
- Verify Vite manifest file exists

#### 3. Database Connection Error

- Verify database credentials in `.env`
- Ensure database exists and user has proper privileges
- Check if MySQL service is running

#### 4. Permission Denied Errors

```bash
chmod -R 755 storage bootstrap/cache
chmod 644 .env
```

### Error Logs

Check error logs in:

- `storage/logs/laravel.log`
- cPanel Error Logs
- Browser Developer Console

## Post-Deployment

### 1. Security

- Set `APP_DEBUG=false` in production
- Use HTTPS (SSL certificate)
- Regularly update dependencies

### 2. Performance

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Backups

- Set up regular database backups
- Backup uploaded files
- Use cPanel's backup feature

### 4. Monitoring

- Monitor error logs
- Check application performance
- Set up uptime monitoring

## File Structure After Deployment

```
public_html/
├── app/
├── bootstrap/
├── config/
├── database/
├── lang/
├── public/
│   ├── build/          # Frontend assets
│   ├── .htaccess       # URL rewriting
│   └── index.php       # Entry point
├── resources/
├── routes/
├── storage/
├── vendor/
├── .env                 # Environment configuration
├── artisan             # Laravel command line
├── composer.json
└── composer.lock
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error logs
3. Verify all prerequisites are met
4. Ensure proper file permissions

## Notes

- The application no longer requires the custom installer
- Database setup is done through standard Laravel migrations
- Frontend assets are pre-built and ready for production
- The system works immediately after proper configuration

---

**Success!** Your Cash Management System is now deployed and ready to use on cPanel.
