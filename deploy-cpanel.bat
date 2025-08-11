@echo off
echo ========================================
echo Cash Management - cPanel Deployment
echo ========================================
echo.

echo This script helps you deploy to cPanel shared hosting
echo.
echo Prerequisites:
echo - cPanel access with Git support
echo - SSH access or cPanel Terminal
echo - PHP 8.2+ support
echo - MySQL/MariaDB database
echo.

echo Step 1: Access cPanel
echo - Login to your cPanel account
echo - Go to Files ^> File Manager or Terminal
echo - Navigate to public_html directory
echo.
pause

echo.
echo Step 2: Clone the Repository
echo.
echo In cPanel Terminal, run these commands:
echo.
echo cd public_html
echo git clone -b client ^<your-repository-url^> cash-management
echo cd cash-management
echo.
pause

echo.
echo Step 3: Set Up Environment
echo.
echo 1. Copy environment template:
echo    cp env.production.template .env
echo.
echo 2. Edit .env file with your settings:
echo    - Database credentials
echo    - Domain settings
echo    - Mail configuration
echo.
pause

echo.
echo Step 4: Install Dependencies
echo.
echo If Composer is available:
echo composer install --optimize-autoloader --no-dev
echo.
echo If npm is available:
echo npm install --production
echo npm run build
echo.
pause

echo.
echo Step 5: Set Permissions
echo.
echo chmod -R 755 storage bootstrap/cache
echo chmod 644 .env
echo.
pause

echo.
echo Step 6: Generate Application Key
echo.
echo php artisan key:generate
echo.
pause

echo.
echo Step 7: Run Installation
echo.
echo 1. Create database in cPanel MySQL Databases
echo 2. Visit: https://yourdomain.com/cash-management/install
echo 3. Follow the installation wizard
echo.
pause

echo.
echo Step 8: Optimize Application
echo.
echo php artisan config:cache
echo php artisan route:cache
echo php artisan view:cache
echo.
pause

echo.
echo ========================================
echo Deployment Instructions Complete!
echo ========================================
echo.
echo Your application should now be accessible at:
echo - Main App: https://yourdomain.com/cash-management
echo - Installer: https://yourdomain.com/cash-management/install
echo.
echo For detailed instructions, see CPANEL_DEPLOYMENT_GUIDE.md
echo.
pause
