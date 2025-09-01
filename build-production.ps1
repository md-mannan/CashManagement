Write-Host "Building production assets..." -ForegroundColor Green
npm run build

Write-Host "Moving build files to public/build..." -ForegroundColor Green
if (Test-Path "build") {
    if (Test-Path "public\build") {
        Remove-Item "public\build" -Recurse -Force
    }
    Move-Item "build" "public\build"
    Write-Host "Build completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Build failed - build directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "Production build is ready!" -ForegroundColor Green
Read-Host "Press Enter to continue"
