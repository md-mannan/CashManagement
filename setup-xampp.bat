@echo off
echo ========================================
echo Cash Management - XAMPP Setup
echo ========================================
echo.

set XAMPP_PATH=C:\xampp
set APP_NAME=cash-management
set HTDOCS_PATH=%XAMPP_PATH%\htdocs\%APP_NAME%

echo [1/7] Checking XAMPP installation...
if not exist "%XAMPP_PATH%" (
    echo ERROR: XAMPP not found at %XAMPP_PATH%
    echo Please install XAMPP first or update the path in this script.
    pause
    exit /b 1
)

echo [2/7] Creating application directory...
if not exist "%HTDOCS_PATH%" (
    mkdir "%HTDOCS_PATH%"
    echo Created directory: %HTDOCS_PATH%
) else (
    echo Directory already exists: %HTDOCS_PATH%
)

echo [3/7] Copying application files...
xcopy /E /I /Y "." "%HTDOCS_PATH%"
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy application files.
    pause
    exit /b 1
)

echo [4/7] Setting file permissions...
icacls "%HTDOCS_PATH%\storage" /grant "Everyone":(OI)(CI)F /T
icacls "%HTDOCS_PATH%\bootstrap\cache" /grant "Everyone":(OI)(CI)F /T
echo Permissions set successfully.

echo [5/7] Creating .env file...
if not exist "%HTDOCS_PATH%\.env" (
    copy "%HTDOCS_PATH%\env.production.template" "%HTDOCS_PATH%\.env"
    echo Created .env file from template.
) else (
    echo .env file already exists.
)

echo [6/7] Installing dependencies...
cd /d "%HTDOCS_PATH%"
composer install --optimize-autoloader --no-dev --no-interaction
if %errorlevel% neq 0 (
    echo WARNING: Failed to install PHP dependencies.
    echo You may need to run this manually.
)

echo [7/7] Building frontend...
npm install --production
if %errorlevel% neq 0 (
    echo WARNING: Failed to install Node.js dependencies.
    echo You may need to run this manually.
)

npm run build
if %errorlevel% neq 0 (
    echo WARNING: Failed to build frontend assets.
    echo You may need to run this manually.
)

echo.
echo ========================================
echo XAMPP setup completed!
echo ========================================
echo.
echo Application installed at: %HTDOCS_PATH%
echo.
echo Next steps:
echo 1. Start XAMPP Apache and MySQL services
echo 2. Create database 'cash_management' in phpMyAdmin
echo 3. Update .env file with your database settings
echo 4. Run the installer: http://localhost/%APP_NAME%/install
echo.
echo For detailed instructions, see XAMPP_DEPLOYMENT_GUIDE.md
echo.
pause
