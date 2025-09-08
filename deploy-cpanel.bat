@echo off
echo ========================================
echo  Cash Management System - cPanel Deploy
echo ========================================
echo.

echo [1/8] Installing PHP dependencies...
call composer install --no-dev --optimize-autoloader
if %errorlevel% neq 0 (
    echo ERROR: Composer install failed!
    pause
    exit /b 1
)

echo.
echo [2/8] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [3/8] Building production assets...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [4/8] Moving build files to public/build...
if exist "build" (
    if exist "public\build" (
        echo Removing existing build directory...
        rmdir /s /q "public\build"
    )
    echo Moving build files...
    move "build" "public\build"
    echo Build files moved successfully!
) else (
    echo ERROR: Build directory not found!
    pause
    exit /b 1
)

echo.
echo [5/8] Creating production environment file...
if not exist ".env" (
    if exist "env-cpanel.example" (
        copy "env-cpanel.example" ".env"
        echo Created .env file from template
        echo IMPORTANT: Please edit .env file with your production settings!
    ) else (
        echo WARNING: env-cpanel.example not found. Please create .env manually.
    )
) else (
    echo .env file already exists
)

echo.
echo [6/8] Generating application key...
call php artisan key:generate --force
if %errorlevel% neq 0 (
    echo WARNING: Could not generate application key automatically
    echo Please run: php artisan key:generate
)

echo.
echo [7/8] Optimizing for production...
call php artisan optimize:clear
call php artisan config:cache
call php artisan route:cache
call php artisan view:cache
if %errorlevel% neq 0 (
    echo WARNING: Some optimization commands failed
)

echo.
echo [8/8] Creating storage link...
call php artisan storage:link
if %errorlevel% neq 0 (
    echo WARNING: Could not create storage link automatically
    echo Please run: php artisan storage:link
)

echo.
echo ========================================
echo  DEPLOYMENT PREPARATION COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your production settings
echo 2. Upload all files to your cPanel public_html directory
echo 3. Set up your database in cPanel
echo 4. Run database migrations
echo 5. Set proper file permissions
echo 6. Test your application
echo.
echo For detailed instructions, see: CPANEL_PRODUCTION_DEPLOYMENT.md
echo.
pause
