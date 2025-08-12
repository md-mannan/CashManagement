@echo off
echo 🚀 Preparing Cash Management System for cPanel deployment...

REM Step 1: Install dependencies
echo 📦 Installing PHP dependencies...
composer install --no-dev --optimize-autoloader

REM Step 2: Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install

REM Step 3: Build frontend assets
echo 🔨 Building frontend assets...
npm run build

REM Step 4: Generate application key
echo 🔑 Generating application key...
php artisan key:generate --show

REM Step 5: Clear caches
echo 🧹 Clearing application caches...
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

REM Step 6: Create production .env file
echo 📝 Creating production .env file...
if not exist .env.production (
    copy env.production.template .env.production
    echo ✅ Production .env file created. Please edit it with your database credentials.
) else (
    echo ✅ Production .env file already exists.
)

REM Step 7: Create deployment package
echo 📦 Creating deployment package...
set DEPLOY_DIR=cpanel-deploy-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set DEPLOY_DIR=%DEPLOY_DIR: =0%
mkdir %DEPLOY_DIR%

REM Copy necessary files
xcopy /E /I app %DEPLOY_DIR%\app
xcopy /E /I bootstrap %DEPLOY_DIR%\bootstrap
xcopy /E /I config %DEPLOY_DIR%\config
xcopy /E /I database %DEPLOY_DIR%\database
xcopy /E /I lang %DEPLOY_DIR%\lang
xcopy /E /I public %DEPLOY_DIR%\public
xcopy /E /I resources %DEPLOY_DIR%\resources
xcopy /E /I routes %DEPLOY_DIR%\routes
xcopy /E /I storage %DEPLOY_DIR%\storage
xcopy /E /I vendor %DEPLOY_DIR%\vendor
copy artisan %DEPLOY_DIR%\
copy composer.json %DEPLOY_DIR%\
copy composer.lock %DEPLOY_DIR%\
copy .env.production %DEPLOY_DIR%\.env

REM Create .htaccess for cPanel
echo ^<IfModule mod_rewrite.c^> > %DEPLOY_DIR%\public\.htaccess
echo     ^<IfModule mod_negotiation.c^> >> %DEPLOY_DIR%\public\.htaccess
echo         Options -MultiViews -Indexes >> %DEPLOY_DIR%\public\.htaccess
echo     ^</IfModule^> >> %DEPLOY_DIR%\public\.htaccess
echo. >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteEngine On >> %DEPLOY_DIR%\public\.htaccess
echo. >> %DEPLOY_DIR%\public\.htaccess
echo     # Handle Authorization Header >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteCond %%{HTTP:Authorization} . >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteRule .* - [E=HTTP_AUTHORIZATION:%%{HTTP:Authorization}] >> %DEPLOY_DIR%\public\.htaccess
echo. >> %DEPLOY_DIR%\public\.htaccess
echo     # Redirect Trailing Slashes If Not A Folder... >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteCond %%{REQUEST_FILENAME} !-d >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteCond %%{REQUEST_URI} (.+)/$ >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteRule ^ %%1 [L,R=301] >> %DEPLOY_DIR%\public\.htaccess
echo. >> %DEPLOY_DIR%\public\.htaccess
echo     # Send Requests To Front Controller... >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteCond %%{REQUEST_FILENAME} !-d >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteCond %%{REQUEST_FILENAME} !-f >> %DEPLOY_DIR%\public\.htaccess
echo     RewriteRule ^ index.php [L] >> %DEPLOY_DIR%\public\.htaccess
echo ^</IfModule^> >> %DEPLOY_DIR%\public\.htaccess

echo ✅ Deployment package created: %DEPLOY_DIR%
echo 📁 Files are ready in: %DEPLOY_DIR%
echo.
echo 🚀 Ready for cPanel deployment!
echo 📖 Please follow the deployment instructions in the README
pause
