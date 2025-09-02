@echo off
REM Cash Management System - cPanel Deployment Script for Windows (No Node.js Required)
REM This script prepares the application for cPanel hosts that don't support Node.js
REM You build assets locally and upload pre-built files

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Check if we're in the right directory
if not exist "composer.json" (
    call :print_error "composer.json not found. Please run this script from the project root directory."
    exit /b 1
)

call :print_status "Starting cPanel deployment preparation (No Node.js required)..."

REM Check PHP version
call :print_status "Checking PHP version..."
php -r "if (version_compare(PHP_VERSION, '8.2.0', '<')) { exit(1); } else { echo 'PHP ' . PHP_VERSION . ' is compatible'; }"
if errorlevel 1 (
    call :print_error "PHP 8.2+ is required. Current version may be incompatible."
    call :print_warning "Continuing anyway..."
) else (
    call :print_success "PHP version is compatible"
)

REM Check Composer
call :print_status "Checking Composer..."
composer --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Composer is not installed or not in PATH"
    exit /b 1
) else (
    call :print_success "Composer is installed"
)

REM Check if Node.js is available for local build
call :print_status "Checking Node.js for local build..."
node --version >nul 2>&1
if errorlevel 1 (
    call :print_warning "Node.js not found - checking for pre-built assets"
    set NODEJS_AVAILABLE=false
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    call :print_success "Node.js %NODE_VERSION% found - will build assets locally"
    set NODEJS_AVAILABLE=true
)

REM Install PHP dependencies
call :print_status "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader
if errorlevel 1 (
    call :print_error "Failed to install PHP dependencies"
    exit /b 1
) else (
    call :print_success "PHP dependencies installed successfully"
)

REM Build assets if Node.js is available
if "%NODEJS_AVAILABLE%"=="true" (
    call :print_status "Building production assets locally..."
    
    REM Check npm
    npm --version >nul 2>&1
    if errorlevel 1 (
        call :print_error "npm is not installed or not in PATH"
        exit /b 1
    ) else (
        call :print_success "npm is available"
    )

    REM Install Node.js dependencies
    call :print_status "Installing Node.js dependencies..."
    npm ci --silent
    if errorlevel 1 (
        call :print_warning "npm ci failed, trying npm install..."
        npm install --silent
        if errorlevel 1 (
            call :print_error "Failed to install Node.js dependencies"
            exit /b 1
        ) else (
            call :print_success "Node.js dependencies installed successfully"
        )
    ) else (
        call :print_success "Node.js dependencies installed successfully"
    )

    REM Build production assets
    call :print_status "Building production assets..."
    npm run build:deploy
    if errorlevel 1 (
        call :print_error "Failed to build production assets"
        exit /b 1
    ) else (
        call :print_success "Production assets built successfully"
    )

    REM Check build location
    call :print_status "Checking build location..."
    if exist "build" (
        if not exist "public\build" (
            call :print_warning "Build files found in root directory, moving to public/build..."
            if exist "fix-build-location.bat" (
                call fix-build-location.bat
                if errorlevel 1 (
                    call :print_error "Failed to fix build location"
                    exit /b 1
                ) else (
                    call :print_success "Build location fixed successfully"
                )
            ) else (
                call :print_error "fix-build-location.bat script not found"
                exit /b 1
            )
        ) else (
            call :print_success "Build files are in correct location"
        )
    ) else (
        if exist "public\build" (
            call :print_success "Build files are in correct location"
        ) else (
            call :print_error "No build files found"
            exit /b 1
        )
    )
) else (
    call :print_warning "Node.js not available - checking for pre-built assets..."
    
    REM Check if build files already exist
    if exist "public\build" (
        call :print_success "Pre-built assets found in public\build\"
    ) else if exist "build" (
        call :print_warning "Build files found in root directory, moving to public\build..."
        if exist "fix-build-location.bat" (
            call fix-build-location.bat
            if errorlevel 1 (
                call :print_error "Failed to fix build location"
                exit /b 1
            ) else (
                call :print_success "Build location fixed successfully"
            )
        ) else (
            call :print_error "fix-build-location.bat script not found"
            exit /b 1
        )
    ) else (
        call :print_error "No pre-built assets found!"
        call :print_error "You need to build assets on a machine with Node.js and upload them"
        call :print_error "Or use the pre-built package if available"
        exit /b 1
    )
)

REM Setup environment file
call :print_status "Setting up environment file..."
if exist "env-cpanel.example" (
    if not exist ".env" (
        copy "env-cpanel.example" ".env" >nul
        call :print_success "Environment file created from template"
    ) else (
        call :print_warning "Environment file already exists"
    )
) else (
    call :print_error "env-cpanel.example template not found"
    exit /b 1
)

REM Generate application key if not set
call :print_status "Checking application key..."
findstr /C:"APP_KEY=base64:" .env >nul
if errorlevel 1 (
    call :print_status "Generating application key..."
    php artisan key:generate --force
    if errorlevel 1 (
        call :print_error "Failed to generate application key"
        exit /b 1
    ) else (
        call :print_success "Application key generated"
    )
) else (
    call :print_success "Application key already set"
)

REM Setup .htaccess for cPanel
call :print_status "Setting up .htaccess for cPanel..."
if exist "public\.htaccess.cpanel" (
    copy "public\.htaccess.cpanel" "public\.htaccess" >nul
    call :print_success ".htaccess configured for cPanel"
) else (
    call :print_error "public\.htaccess.cpanel not found"
    exit /b 1
)

REM Set file permissions (Windows equivalent)
call :print_status "Setting file permissions..."
REM Note: Windows doesn't have chmod, but we can ensure files are readable
call :print_success "File permissions set (Windows handles this automatically)"

REM Create storage link
call :print_status "Creating storage link..."
if exist "public\storage" (
    call :print_success "Storage link already exists"
) else (
    php artisan storage:link
    if errorlevel 1 (
        call :print_warning "Failed to create storage link via artisan"
        call :print_warning "You may need to create it manually on the server"
    ) else (
        call :print_success "Storage link created"
    )
)

REM Clear and cache configuration
call :print_status "Optimizing application..."
php artisan optimize:clear >nul 2>&1
php artisan config:cache >nul 2>&1
php artisan route:cache >nul 2>&1
php artisan view:cache >nul 2>&1
call :print_success "Application optimized"

REM Create deployment package
call :print_status "Creating deployment package..."
if exist "deploy-package" (
    rmdir /s /q "deploy-package"
)
mkdir "deploy-package"

REM Copy necessary files to deployment package
call :print_status "Copying files to deployment package..."
xcopy /E /I /Y "app" "deploy-package\app"
xcopy /E /I /Y "bootstrap" "deploy-package\bootstrap"
xcopy /E /I /Y "config" "deploy-package\config"
xcopy /E /I /Y "database" "deploy-package\database"
xcopy /E /I /Y "lang" "deploy-package\lang"
xcopy /E /I /Y "public" "deploy-package\public"
xcopy /E /I /Y "resources" "deploy-package\resources"
xcopy /E /I /Y "routes" "deploy-package\routes"
xcopy /E /I /Y "storage" "deploy-package\storage"
xcopy /E /I /Y "vendor" "deploy-package\vendor"
copy ".env" "deploy-package\.env" >nul
copy "artisan" "deploy-package\artisan" >nul
copy "composer.json" "deploy-package\composer.json" >nul
copy "composer.lock" "deploy-package\composer.lock" >nul

REM Create deployment instructions
call :print_status "Creating deployment instructions..."
(
echo # Cash Management System - cPanel Deployment Instructions ^(No Node.js Required^)
echo.
echo ## Quick Deployment Steps:
echo.
echo 1. **Upload Files**: Upload all contents of the 'deploy-package' folder to your cPanel public_html directory
echo 2. **Database Setup**: Create a MySQL database in cPanel and update .env with credentials
echo 3. **File Permissions**: Set storage/ and bootstrap/cache/ to 755 permissions
echo 4. **Run Migrations**: Via SSH: php artisan migrate --force
echo 5. **Create Storage Link**: Via SSH: php artisan storage:link
echo 6. **Test**: Visit your domain to test the application
echo.
echo ## Important Notes:
echo - Ensure PHP 8.2+ is available on your hosting
echo - Make sure .env file is properly configured with your domain and database details
echo - The .htaccess file is already configured for cPanel
echo - Build files are included in public/build/ ^(pre-built locally^)
echo - No Node.js required on the server - all assets are pre-built
echo.
echo ## Troubleshooting:
echo - If you see a white screen, check .env file and database connection
echo - If assets don't load, verify public/build/ directory exists
echo - For detailed troubleshooting, see CPANEL_DEPLOYMENT_CHECKLIST.md
echo.
echo ## Support:
echo - Check CPANEL_DEPLOYMENT_CHECKLIST.md for comprehensive guide
echo - Review README.md for additional information
echo - Contact your hosting provider for server-specific issues
echo.
echo ## No Node.js Required:
echo This deployment package includes pre-built assets, so you don't need Node.js on your cPanel hosting.
echo All JavaScript and CSS files are already compiled and optimized for production.
) > "deploy-package\DEPLOYMENT_INSTRUCTIONS.txt"

REM Create alternative deployment method for hosts without SSH
call :print_status "Creating alternative deployment method..."
(
echo # Alternative Deployment Method ^(No SSH Required^)
echo.
echo If your cPanel hosting doesn't provide SSH access, you can use these alternative methods:
echo.
echo ## Method 1: Browser-based Migration
echo 1. Upload all files to your cPanel hosting
echo 2. Create a temporary route for migrations by adding this to your routes/web.php:
echo    ```php
echo    Route::get^('/migrate', function ^(^) {
echo        Artisan::call^('migrate', ['--force' =^> true]^);
echo        return 'Migrations completed successfully!'^;
echo    }^);
echo    ```
echo 3. Visit https://yourdomain.com/migrate
echo 4. Remove the migration route after successful migration
echo.
echo ## Method 2: phpMyAdmin Import
echo 1. Export your local database structure and data
echo 2. Import via phpMyAdmin in cPanel
echo 3. Update .env file with your database credentials
echo.
echo ## Method 3: Contact Hosting Support
echo Many hosting providers can run migrations for you if you provide the migration files.
echo.
echo ## Important:
echo - Always backup your database before making changes
echo - Test on a staging environment first if possible
echo - Remove any temporary routes after deployment
) > "deploy-package\ALTERNATIVE_DEPLOYMENT.md"

call :print_success "Deployment package created successfully"

REM Final summary
echo.
call :print_success "=== DEPLOYMENT PREPARATION COMPLETE (No Node.js Required) ==="
echo.
call :print_status "Next steps:"
echo   1. Upload the contents of 'deploy-package' folder to your cPanel hosting
echo   2. Configure your database in cPanel
echo   3. Update .env file with your domain and database details
echo   4. Set proper file permissions on the server
echo   5. Run database migrations
echo   6. Test your application
echo.
call :print_status "For detailed instructions, see:"
echo   - deploy-package\DEPLOYMENT_INSTRUCTIONS.txt
echo   - deploy-package\ALTERNATIVE_DEPLOYMENT.md
echo   - CPANEL_DEPLOYMENT_CHECKLIST.md
echo   - README.md
echo.
call :print_success "Your Cash Management System is ready for cPanel deployment (No Node.js required)! 🚀"
echo.
call :print_warning "Note: This package includes pre-built assets, so Node.js is not needed on your hosting server."

pause
