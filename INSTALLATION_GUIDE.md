# Cash Management - Installation Guide

## Overview

This guide explains how to install the Cash Management application. The installation system has been improved to:

1. **Check if the app is already installed** before proceeding
2. **Use configuration files instead of .env** for easier setup
3. **Provide a streamlined installation process** with better error handling

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- Web server (Apache/Nginx) or PHP built-in server

## Quick Installation

### 1. Clone and Setup

```bash
git clone <repository-url>
cd CashManagement
composer install
npm install
```

### 2. Start the Application

```bash
# Start Laravel server
php artisan serve

# Start Vite (in another terminal)
npm run dev
```

### 3. Access the Installer

Open your browser and go to: `http://localhost:8000/install`

The installer will automatically:

- Check if the application is already installed
- Verify system requirements
- Guide you through the configuration

## Installation Process

### Step 1: Welcome & Status Check

The installer shows:

- Current installation status
- Database connection status
- Migration status
- Admin user status

### Step 2: System Requirements

Checks for:

- PHP version and extensions
- Directory permissions
- Database connectivity

### Step 3: Database Configuration

Choose between:

- **SQLite (Recommended)**: File-based, no setup required
- **MySQL**: Traditional database server

### Step 4: Application Configuration

Configure:

- Application name and URL
- Timezone and locale
- Default currencies
- Feature toggles

### Step 5: Admin User Setup

Create the first administrator account with:

- Name and email
- Secure password
- Role permissions

### Step 6: Installation

The system will:

- Run database migrations
- Seed default data
- Create admin user
- Configure the application

## Configuration Files

### Installer Configuration (`config/installer.php`)

Contains default values for:

- Application settings
- Database configurations
- Feature flags
- System requirements

### Database Configuration

The installer automatically configures the database connection based on your choice:

- **SQLite**: Creates `database/database.sqlite` automatically
- **MySQL**: Uses your provided credentials

## Post-Installation

After successful installation:

1. **Access the application**: `http://localhost:8000`
2. **Login with admin credentials** created during installation
3. **Configure additional settings** through the admin panel

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
    - Check if database server is running
    - Verify credentials and permissions
    - For SQLite, ensure directory is writable

2. **Permission Errors**
    - Make sure `storage/` and `bootstrap/cache/` are writable
    - Run: `chmod -R 755 storage bootstrap/cache`

3. **Installation Already Complete**
    - If you see "Already Installed" message, the app is ready
    - Access the main application directly

### Manual Installation Check

You can manually check installation status:

```bash
php artisan tinker
$service = new App\Services\InstallationService();
echo $service->isInstalled() ? 'Installed' : 'Not Installed';
```

## Development vs Production

### Development

- Use SQLite for simplicity
- Enable debug mode
- Use local URLs

### Production

- Use MySQL/PostgreSQL for performance
- Disable debug mode
- Configure proper URLs and SSL
- Set up proper file permissions

## Support

If you encounter issues:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Verify system requirements
3. Check database connectivity
4. Review error messages in the installer

## Security Notes

- Change default admin password after installation
- Configure proper database permissions
- Set up SSL in production
- Regular backups of database and files
