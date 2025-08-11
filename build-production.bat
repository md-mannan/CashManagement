@echo off
echo ========================================
echo Cash Management - Production Build
echo ========================================
echo.

echo [1/6] Checking prerequisites...
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Composer not found. Please install Composer first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js/npm not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [2/6] Installing PHP dependencies...
composer install --optimize-autoloader --no-dev --no-interaction
if %errorlevel% neq 0 (
    echo ERROR: Failed to install PHP dependencies.
    pause
    exit /b 1
)

echo [3/6] Installing Node.js dependencies...
npm ci --production
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies.
    pause
    exit /b 1
)

echo [4/6] Building frontend assets...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend assets.
    pause
    exit /b 1
)

echo [5/6] Optimizing application...
php artisan config:cache
php artisan route:cache
php artisan view:cache
if %errorlevel% neq 0 (
    echo ERROR: Failed to optimize application.
    pause
    exit /b 1
)

echo [6/6] Setting production mode...
php artisan config:set app.debug false
php artisan config:set app.env production

echo.
echo ========================================
echo Production build completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Copy the application to your XAMPP htdocs folder
echo 2. Configure your .env file
echo 3. Set up the database
echo 4. Run the installer: /install
echo.
echo For detailed instructions, see XAMPP_DEPLOYMENT_GUIDE.md
echo.
pause
