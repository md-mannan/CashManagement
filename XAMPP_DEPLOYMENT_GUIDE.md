# Cash Management - XAMPP Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Cash Management application on XAMPP for production use. The application is optimized for Windows environments using XAMPP's Apache, MySQL, and PHP stack.

## Prerequisites

- **XAMPP** (version 8.0 or higher recommended)
- **Windows 10/11** (64-bit)
- **Git** (for cloning the repository)
- **Composer** (PHP package manager)
- **Node.js** (version 18+ for frontend build)

## Installation Steps

### 1. Install XAMPP

1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Run the installer as Administrator
3. Select components:
    - ✅ Apache
    - ✅ MySQL
    - ✅ PHP
    - ✅ phpMyAdmin
    - ✅ FileZilla (optional)
4. Install to `C:\xampp` (default location)
5. Start Apache and MySQL services

### 2. Configure XAMPP

#### Apache Configuration

1. Open `C:\xampp\apache\conf\httpd.conf`
2. Ensure these modules are enabled:
    ```apache
    LoadModule rewrite_module modules/mod_rewrite.so
    LoadModule headers_module modules/mod_headers.so
    ```
3. Set document root (optional):
    ```apache
    DocumentRoot "C:/xampp/htdocs/cash-management/public"
    <Directory "C:/xampp/htdocs/cash-management/public">
        AllowOverride All
        Require all granted
    </Directory>
    ```

#### MySQL Configuration

1. Open `C:\xampp\mysql\bin\my.ini`
2. Set memory limits:
    ```ini
    [mysqld]
    max_allowed_packet = 64M
    innodb_buffer_pool_size = 256M
    ```

### 3. Clone and Setup Application

```bash
# Navigate to XAMPP htdocs
cd C:\xampp\htdocs

# Clone the client branch
git clone -b client <repository-url> cash-management
cd cash-management

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies
npm install

# Build frontend assets
npm run build
```

### 4. Database Setup

#### Create Database

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create new database: `cash_management`
3. Character set: `utf8mb4_unicode_ci`
4. Collation: `utf8mb4_unicode_ci`

#### Configure Database Connection

1. Copy `env.production.template` to `.env`
2. Update database settings:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_DATABASE=cash_management
    DB_USERNAME=root
    DB_PASSWORD=
    ```

### 5. Application Configuration

#### Environment Setup

1. Generate application key:

    ```bash
    php artisan key:generate
    ```

2. Update `.env` file:

    ```env
    APP_NAME="Cash Management"
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=http://localhost/cash-management

    # Database
    DB_CONNECTION=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_DATABASE=cash_management
    DB_USERNAME=root
    DB_PASSWORD=

    # Mail (using XAMPP Mercury)
    MAIL_MAILER=smtp
    MAIL_HOST=localhost
    MAIL_PORT=25
    MAIL_FROM_ADDRESS="noreply@cashmanagement.local"
    ```

#### File Permissions

1. Ensure these directories are writable:
    ```bash
    # Windows (run as Administrator)
    icacls "storage" /grant "Everyone":(OI)(CI)F
    icacls "bootstrap/cache" /grant "Everyone":(OI)(CI)F
    ```

### 6. Install Application

#### Run Installation

1. Open browser: `http://localhost/cash-management/install`
2. Follow the installation wizard:
    - System requirements check
    - Database configuration
    - Application settings
    - Admin user creation

#### Manual Installation (Alternative)

```bash
# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 7. Final Configuration

#### Production Optimizations

```bash
# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Cache routes and views
php artisan route:cache
php artisan view:cache
php artisan config:cache

# Set production mode
php artisan config:set app.debug false
php artisan config:set app.env production
```

#### Security Settings

1. Update `.env`:

    ```env
    APP_DEBUG=false
    LOG_LEVEL=error
    SESSION_SECURE_COOKIE=false
    ```

2. Set file permissions:
    ```bash
    # Make .env read-only
    icacls ".env" /inheritance:r
    icacls ".env" /grant:r "Administrators":F
    ```

## Virtual Host Configuration (Optional)

### Apache Virtual Host

1. Create `C:\xampp\apache\conf\extra\cash-management.conf`:

    ```apache
    <VirtualHost *:80>
        ServerName cash-management.local
        DocumentRoot "C:/xampp/htdocs/cash-management/public"

        <Directory "C:/xampp/htdocs/cash-management/public">
            AllowOverride All
            Require all granted
        </Directory>

        ErrorLog "logs/cash-management-error.log"
        CustomLog "logs/cash-management-access.log" combined
    </VirtualHost>
    ```

2. Include in `httpd.conf`:

    ```apache
    Include conf/extra/cash-management.conf
    ```

3. Add to `C:\Windows\System32\drivers\etc\hosts`:
    ```
    127.0.0.1 cash-management.local
    ```

## Testing the Installation

### 1. Access Application

- Main app: `http://localhost/cash-management`
- Installer: `http://localhost/cash-management/install`
- phpMyAdmin: `http://localhost/phpmyadmin`

### 2. Verify Functionality

- ✅ User registration/login
- ✅ Dashboard access
- ✅ Transaction management
- ✅ Admin panel
- ✅ Database operations

### 3. Check Logs

- Application logs: `storage/logs/laravel.log`
- Apache logs: `C:\xampp\apache\logs\`
- MySQL logs: `C:\xampp\mysql\data\`

## Maintenance and Updates

### Regular Maintenance

```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Database Backup

```bash
# Using XAMPP MySQL
C:\xampp\mysql\bin\mysqldump -u root -p cash_management > backup.sql

# Restore
C:\xampp\mysql\bin\mysql -u root -p cash_management < backup.sql
```

### Application Updates

```bash
# Pull latest changes
git pull origin client

# Update dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Run migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Troubleshooting

### Common Issues

#### 1. Permission Errors

```bash
# Fix storage permissions
icacls "storage" /grant "Everyone":(OI)(CI)F
icacls "bootstrap/cache" /grant "Everyone":(OI)(CI)F
```

#### 2. Database Connection Failed

- Check MySQL service is running
- Verify database exists
- Check credentials in `.env`
- Test connection in phpMyAdmin

#### 3. 500 Internal Server Error

- Check Apache error logs
- Verify `.htaccess` file exists
- Check file permissions
- Enable error display temporarily

#### 4. Route Not Found

- Clear route cache: `php artisan route:clear`
- Check `.htaccess` configuration
- Verify mod_rewrite is enabled

### Performance Issues

#### 1. Slow Loading

- Enable OPcache in PHP
- Use Redis for caching (if available)
- Optimize database queries
- Enable compression in Apache

#### 2. Memory Issues

- Increase PHP memory limit
- Optimize MySQL settings
- Use file-based caching

## Security Considerations

### 1. Production Security

- Change default MySQL password
- Use strong admin passwords
- Enable HTTPS (if possible)
- Regular security updates

### 2. File Security

- Protect `.env` file
- Secure storage directory
- Regular backups
- Monitor access logs

### 3. Database Security

- Create dedicated database user
- Limit database permissions
- Regular backups
- Monitor database logs

## Support and Resources

### Documentation

- [Laravel Documentation](https://laravel.com/docs)
- [XAMPP Documentation](https://www.apachefriends.org/docs.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### Community Support

- Laravel Forums
- Stack Overflow
- GitHub Issues

### Contact Information

- Technical Support: [Your Support Email]
- Documentation: [Your Documentation URL]
- Repository: [Your Repository URL]

---

**Note**: This guide assumes you're using the `client` branch of the Cash Management application. Make sure you have the correct repository access and are working with the production-ready version.
