@echo off
echo 🔧 Fixing build location for cPanel hosting...

REM Check if build directory exists in root
if exist "build" (
    echo 📁 Found build directory in root, moving to public/build...
    
    REM Remove existing public/build if it exists
    if exist "public\build" (
        echo 🗑️  Removing existing public/build directory...
        rmdir /s /q "public\build"
    )
    
    REM Move build from root to public
    move "build" "public\"
    echo ✅ Moved build directory to public/build
) else (
    echo ℹ️  No build directory found in root
)

REM Check if build files exist in public/build
if exist "public\build" (
    echo ✅ Build files found in public/build
    
    REM Check if manifest exists
    if exist "public\build\.vite\manifest.json" (
        echo ✅ Manifest file found
    ) else (
        echo ❌ Manifest file not found in public/build/.vite/
        echo 💡 You may need to run: npm run build
    )
) else (
    echo ❌ No build files found in public/build
    echo 💡 Please run: npm run build
)

echo 🎉 Build location fix completed!
echo.
echo 📋 Next steps:
echo 1. If you see 'Build files found in public/build' above, your site should work
echo 2. If you see 'No build files found', run: npm run build
echo 3. Clear Laravel caches: php artisan cache:clear

pause
