# Cash Management - Client Branch

## Overview

This is the **production-ready** branch of the Cash Management application, specifically optimized for client deployment using XAMPP on Windows environments.

## 🚀 Quick Start (XAMPP)

### Prerequisites

- XAMPP 8.0+ installed
- Git
- Composer
- Node.js 18+

### Automated Setup

1. **Clone the client branch:**

    ```bash
    git clone -b client <repository-url> cash-management
    cd cash-management
    ```

2. **Run the XAMPP setup script:**

    ```bash
    setup-xampp.bat
    ```

3. **Start XAMPP services:**
    - Start Apache
    - Start MySQL

4. **Create database:**
    - Open phpMyAdmin: `http://localhost/phpmyadmin`
    - Create database: `cash_management`

5. **Run the installer:**
    - Visit: `http://localhost/cash-management/install`
    - Follow the installation wizard

## 📁 Branch Features

### Production Optimizations

- ✅ MySQL database support (XAMPP optimized)
- ✅ Production-ready configuration
- ✅ Optimized asset building
- ✅ Enhanced security settings
- ✅ XAMPP-specific deployment scripts

### Installation System

- ✅ Smart installation detection
- ✅ Configuration-based setup (no .env editing required)
- ✅ Real-time status monitoring
- ✅ Guided installation wizard
- ✅ Automatic database setup

## 🛠️ Manual Setup

### 1. Environment Configuration

```bash
# Copy production template
cp env.production.template .env

# Generate application key
php artisan key:generate

# Update database settings in .env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cash_management
DB_USERNAME=root
DB_PASSWORD=
```

### 2. Dependencies Installation

```bash
# PHP dependencies (production)
composer install --optimize-autoloader --no-dev

# Node.js dependencies (production)
npm ci --production

# Build frontend assets
npm run build
```

### 3. Application Setup

```bash
# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🌐 Access Points

- **Main Application**: `http://localhost/cash-management`
- **Installer**: `http://localhost/cash-management/install`
- **phpMyAdmin**: `http://localhost/phpmyadmin`

## 📋 Configuration Files

### Production Configuration

- `config/production.php` - Production-specific settings
- `config/installer.php` - Installer configuration
- `env.production.template` - Environment template

### Build Scripts

- `build-production.bat` - Production build automation
- `setup-xampp.bat` - XAMPP deployment automation

## 🔧 Customization

### Database Configuration

Update `config/production.php` for different database settings:

```php
'database' => [
    'default' => 'mysql',
    'connections' => [
        'mysql' => [
            'host' => env('DB_HOST', 'localhost'),
            'database' => env('DB_DATABASE', 'cash_management'),
            // ... other settings
        ],
    ],
],
```

### Application Settings

Modify `config/installer.php` for default values:

```php
'defaults' => [
    'app' => [
        'name' => 'Your Company Name',
        'timezone' => 'UTC',
        'locale' => 'en',
    ],
    // ... other defaults
],
```

## 📚 Documentation

- **XAMPP Deployment**: `XAMPP_DEPLOYMENT_GUIDE.md`
- **General Installation**: `INSTALLATION_GUIDE.md`
- **Production Configuration**: `config/production.php`

## 🚨 Important Notes

### Security

- Change default MySQL password after installation
- Use strong admin passwords
- Enable HTTPS in production environments
- Regular security updates

### Performance

- Enable OPcache in PHP
- Use Redis for caching (if available)
- Optimize database queries
- Enable compression in Apache

### Maintenance

- Regular database backups
- Monitor application logs
- Keep dependencies updated
- Regular security audits

## 🆘 Troubleshooting

### Common Issues

1. **Permission Errors**: Run `setup-xampp.bat` as Administrator
2. **Database Connection**: Verify MySQL service is running
3. **500 Errors**: Check Apache error logs and file permissions
4. **Route Issues**: Clear route cache with `php artisan route:clear`

### Support

- Check logs: `storage/logs/laravel.log`
- Verify XAMPP services are running
- Test database connection in phpMyAdmin
- Review error messages in the installer

## 🔄 Updates

### Application Updates

```bash
# Pull latest changes
git pull origin client

# Update dependencies
composer install --optimize-autoloader --no-dev
npm ci --production
npm run build

# Run migrations
php artisan migrate --force

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Database Backup

```bash
# Backup
C:\xampp\mysql\bin\mysqldump -u root -p cash_management > backup.sql

# Restore
C:\xampp\mysql\bin\mysql -u root -p cash_management < backup.sql
```

## 📞 Support

For technical support or questions:

- Review the deployment guides
- Check the troubleshooting section
- Contact the development team
- Submit issues through the repository

---

**Branch**: `client`  
**Environment**: Production  
**Target**: XAMPP on Windows  
**Last Updated**: August 2025
