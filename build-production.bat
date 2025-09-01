@echo off
echo Building production assets...
npm run build

echo Moving build files to public/build...
if exist "build" (
    if exist "public\build" (
        rmdir /s /q "public\build"
    )
    move "build" "public\build"
    echo Build completed successfully!
) else (
    echo Build failed - build directory not found
    exit /b 1
)

echo Production build is ready!
pause
