@echo off
echo ========================================
echo Fix CORS Issues for cPanel Deployment
echo ========================================
echo.

echo This script helps fix CORS and asset loading issues
echo when deploying to cPanel shared hosting.
echo.

echo Prerequisites:
echo - cPanel access with Terminal or SSH
echo - PHP and npm available on your hosting
echo - Application already cloned and set up
echo.

echo Step 1: Access cPanel Terminal
echo - Login to cPanel
echo - Go to Advanced ^> Terminal
echo - Navigate to your application directory
echo.
pause

echo.
echo Step 2: Build Production Assets
echo.
echo Run these commands in cPanel Terminal:
echo.
echo cd public_html/cash-management
echo npm install --production
echo npm run build
echo.
pause

echo.
echo Step 3: Clear Laravel Caches
echo.
echo php artisan config:clear
echo php artisan route:clear
echo php artisan view:clear
echo php artisan cache:clear
echo.
pause

echo.
echo Step 4: Rebuild Production Caches
echo.
echo php artisan config:cache
echo php artisan route:cache
echo php artisan view:cache
echo.
pause

echo.
echo Step 5: Check Environment Configuration
echo.
echo Ensure your .env file has:
echo APP_ENV=production
echo APP_DEBUG=false
echo APP_URL=https://yourdomain.com/cash-management
echo.
pause

echo.
echo Step 6: Verify Build Directory
echo.
echo Check that public/build directory contains:
echo - manifest.json
echo - assets/ folder with CSS and JS files
echo.
pause

echo.
echo Step 7: Set Permissions
echo.
echo chmod -R 755 storage bootstrap/cache
echo chmod -R 755 public/build
echo.
pause

echo.
echo ========================================
echo CORS Fix Instructions Complete!
echo ========================================
echo.
echo After running these commands:
echo 1. Clear your browser cache completely
echo 2. Visit your application
echo 3. Check browser console for errors
echo.
echo If you still see CORS errors:
echo - Verify assets are loading from your domain (not localhost)
echo - Check that build directory exists with all files
echo - Ensure APP_URL is set correctly in .env
echo.
echo For detailed troubleshooting, see fix-cors-cpanel.md
echo.
pause
