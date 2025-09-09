Param(
    [string]$ZipName = "cashmanagement-cpanel.zip"
)

$ErrorActionPreference = "Stop"

Write-Host "[1/7] Cleaning previous build..."
if (Test-Path -Path "public/build") { Remove-Item -Recurse -Force "public/build" }
if (Test-Path -Path "build") { Remove-Item -Recurse -Force "build" }

Write-Host "[2/7] Installing JS deps (if needed) and building assets..."
if (-not (Test-Path -Path "node_modules")) { npm ci }
npm run build

Write-Host "[3/7] Moving build to public/build..."
if (Test-Path -Path "build") { 
    if (Test-Path -Path "public/build") { Remove-Item -Recurse -Force "public/build" }
    Move-Item -Path "build" -Destination "public/build"
}

if (-not (Test-Path -Path "public/build/.vite/manifest.json")) {
    throw "Production build not found at public/build/.vite/manifest.json"
}

Write-Host "[4/7] Preparing packaging staging directory..."
$staging = "dist-cpanel"
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging | Out-Null

# Copy project excluding dev-only directories
Write-Host "[5/7] Copying application files..."
$include = @(
    "app","bootstrap","config","database","public","resources/views","routes","storage","vendor",
    "artisan","composer.json","composer.lock","phpunit.xml",".env", "README.md"
)

foreach ($path in $include) {
    if (Test-Path $path) {
        Copy-Item $path -Destination (Join-Path $staging $path) -Recurse -Force
    }
}

# Ensure cPanel htaccess is active
if (Test-Path "public/.htaccess.cpanel") {
    Copy-Item "public/.htaccess.cpanel" -Destination (Join-Path $staging "public/.htaccess") -Force
}

# Remove dev files from staging
Write-Host "[6/7] Removing development artifacts from package..."
$remove = @("node_modules","resources/js","resources/css",".git",".github","tests")
foreach ($r in $remove) {
    $target = Join-Path $staging $r
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
}

# Ensure writable directories
$writable = @("storage","bootstrap/cache","public/build")
foreach ($w in $writable) {
    $target = Join-Path $staging $w
    if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
}

Write-Host "[7/7] Creating ZIP archive $ZipName ..."
if (Test-Path $ZipName) { Remove-Item $ZipName -Force }
Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $ZipName

Write-Host "Done. Upload $ZipName to cPanel and extract in your document root."
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
