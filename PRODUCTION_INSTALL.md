# Cash Management System - Production Installation Guide

## 🚀 Quick Start Installation

### Prerequisites

- PHP 8.2 or higher
- MySQL 8.0+ or MariaDB 10.4+
- Web server (Apache 2.4+ or Nginx 1.18+)
- Composer 2.0+
- Node.js 18+

### Step 1: Upload Files

1. Upload all files to your web server
2. Ensure the `public/` directory is your web root
3. Set proper file permissions:
    ```bash
    chmod -R 755 storage/
    chmod -R 755 bootstrap/cache/
    chmod -R 755 public/
    ```

### Step 2: Environment Setup

1. Copy `env.production.template` to `.env`
2. Update the following values:
    - `APP_URL`: Your domain (e.g., https://yourdomain.com)
    - `DB_DATABASE`: Your database name
    - `DB_USERNAME`: Your database username
    - `DB_PASSWORD`: Your database password
    - `MAIL_*`: Your email server settings

### Step 3: Install Dependencies

```bash
composer install --optimize-autoloader --no-dev
npm install
npm run build
```

### Step 4: Generate Application Key

```bash
php artisan key:generate
```

### Step 5: Run Web Installer (WordPress-Style!)

1. Visit your domain: `https://yourdomain.com`
2. **The system will automatically redirect you to the installer** if not installed
3. Follow the step-by-step installation wizard:
    - System requirements check
    - Database configuration
    - Application settings
    - Admin user creation
4. The installer will automatically:
    - Test database connection
    - Run migrations
    - Create admin user
    - Configure the system
    - Set `APP_INSTALLED=true`

### Step 6: Complete Setup

1. After installation, you'll be redirected to the completion page
2. Log in with your admin credentials
3. Start using the system!

## 🔧 Manual Installation (Alternative)

If you prefer manual installation:

### Database Setup

```bash
php artisan migrate --force
php artisan db:seed --force
```

### Create Admin User

```bash
php artisan make:user
```

### Set Installation Flag

```bash
php artisan config:set app.installed true
```

## 📁 Directory Structure

```
cash-management/
├── app/                 # Application logic
├── config/             # Configuration files
├── database/           # Database migrations & seeders
├── public/             # Web root (public files)
├── resources/          # Frontend resources
├── routes/             # Application routes
├── storage/            # File storage & logs
├── .env                # Environment configuration
├── .zipignore          # Files to exclude from production
└── PRODUCTION_INSTALL.md  # This file
```

## 🛡️ Security Checklist

- [ ] HTTPS enabled
- [ ] Strong database passwords
- [ ] File permissions set correctly
- [ ] Environment variables configured
- [ ] Debug mode disabled
- [ ] Error logging configured
- [ ] Backup system enabled

## 🚨 Troubleshooting

### Common Issues

1. **500 Internal Server Error**: Check file permissions and .env configuration
2. **Database Connection Failed**: Verify database credentials and connection
3. **Installation Page Not Found**: Ensure web server is configured correctly
4. **Permission Denied**: Check storage and bootstrap/cache permissions
5. **Vite Manifest Error**: Run `npm run build` to compile frontend assets

### Installation Check

Visit `https://yourdomain.com/install-check.php` to verify installation status.

### Support

- Check the main README.md for detailed documentation
- Review Laravel logs in `storage/logs/`
- Ensure all requirements are met

## 📞 Need Help?

If you encounter issues during installation:

1. Check the error logs
2. Verify system requirements
3. Review this guide
4. Contact support if needed

---

**Cash Management System** - Professional financial management for modern businesses.
