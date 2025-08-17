#!/bin/bash

# Deployment Verification Script for CashManagement
# Run this script after deployment to verify everything is working

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/var/www/html/cashmanagement"
TESTS_PASSED=0
TESTS_FAILED=0

log() {
    echo -e "${GREEN}[✓] $1${NC}"
    ((TESTS_PASSED++))
}

warn() {
    echo -e "${YELLOW}[!] $1${NC}"
}

error() {
    echo -e "${RED}[✗] $1${NC}"
    ((TESTS_FAILED++))
}

info() {
    echo -e "${BLUE}[i] $1${NC}"
}

# Test function
test_condition() {
    local description="$1"
    local command="$2"
    
    if eval "$command" >/dev/null 2>&1; then
        log "$description"
    else
        error "$description"
    fi
}

echo -e "${BLUE}=== CashManagement Deployment Verification ===${NC}"
echo

# Check if we're in the right directory
if [ ! -d "$APP_DIR" ]; then
    if [ -f "artisan" ]; then
        APP_DIR="$(pwd)"
        info "Running from current directory: $APP_DIR"
    else
        error "CashManagement not found. Please run from $APP_DIR or the application directory."
        exit 1
    fi
else
    cd "$APP_DIR"
    info "Checking deployment at: $APP_DIR"
fi

echo

# File Structure Tests
info "Testing file structure..."
test_condition "Application directory exists" "[ -d '$APP_DIR' ]"
test_condition "Artisan command exists" "[ -f '$APP_DIR/artisan' ]"
test_condition "Public directory exists" "[ -d '$APP_DIR/public' ]"
test_condition "Storage directory exists" "[ -d '$APP_DIR/storage' ]"
test_condition "Vendor directory exists" "[ -d '$APP_DIR/vendor' ]"
test_condition "Environment file exists" "[ -f '$APP_DIR/.env' ]"

echo

# Permission Tests
info "Testing file permissions..."
test_condition "Storage directory is writable" "[ -w '$APP_DIR/storage' ]"
test_condition "Bootstrap cache is writable" "[ -w '$APP_DIR/bootstrap/cache' ]"
test_condition "Logs directory is writable" "[ -w '$APP_DIR/storage/logs' ]"

echo

# PHP and Laravel Tests
info "Testing PHP and Laravel..."
test_condition "PHP is available" "command -v php"
test_condition "Composer is available" "command -v composer"
test_condition "Laravel artisan works" "php artisan --version"

echo

# Database Tests
info "Testing database connection..."
if php artisan migrate:status >/dev/null 2>&1; then
    log "Database connection working"
    log "Migrations table exists"
else
    error "Database connection failed or migrations not run"
fi

echo

# Frontend Assets Tests
info "Testing frontend assets..."
test_condition "Build directory exists" "[ -d '$APP_DIR/public/build' ]"
test_condition "Assets directory exists" "[ -d '$APP_DIR/public/build/assets' ]"
test_condition "Manifest file exists" "[ -f '$APP_DIR/public/build/.vite/manifest.json' ]"

if [ -f "$APP_DIR/public/build/.vite/manifest.json" ]; then
    local asset_count=$(ls -1 "$APP_DIR/public/build/assets/" 2>/dev/null | wc -l)
    if [ "$asset_count" -gt 0 ]; then
        log "Frontend assets built ($asset_count files)"
    else
        error "No frontend assets found"
    fi
fi

echo

# Apache Configuration Tests
info "Testing web server configuration..."
test_condition "Apache is running" "systemctl is-active apache2"

# Check if the site is accessible
local server_ip=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
if curl -s -o /dev/null -w "%{http_code}" "http://$server_ip/cashmanagement" | grep -q "200\|302"; then
    log "Application is accessible via web browser"
else
    warn "Application may not be accessible via web browser (check firewall/DNS)"
fi

echo

# Laravel Optimization Tests
info "Testing Laravel optimization..."
test_condition "Config cache exists" "[ -f '$APP_DIR/bootstrap/cache/config.php' ]"
test_condition "Route cache exists" "[ -f '$APP_DIR/bootstrap/cache/routes-v7.php' ]"

echo

# Security Tests
info "Testing security configuration..."
test_condition ".env file is not web accessible" "! curl -s http://$server_ip/cashmanagement/.env | grep -q 'APP_'"
test_condition "Storage directory is not web accessible" "! curl -s http://$server_ip/cashmanagement/storage/ | grep -q 'Index of'"

echo

# Performance Tests
info "Testing performance optimizations..."
local app_size=$(du -sh "$APP_DIR" 2>/dev/null | cut -f1)
local build_size=$(du -sh "$APP_DIR/public/build" 2>/dev/null | cut -f1)

info "Application size: $app_size"
info "Frontend build size: $build_size"

if [ -f "$APP_DIR/bootstrap/cache/config.php" ]; then
    log "Laravel configuration cached"
fi

if [ -f "$APP_DIR/bootstrap/cache/routes-v7.php" ]; then
    log "Laravel routes cached"
fi

echo

# Final Summary
echo -e "${BLUE}=== Verification Summary ===${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo
    echo -e "${GREEN}🎉 All tests passed! Your CashManagement application is properly deployed.${NC}"
    echo
    echo -e "${BLUE}Access your application at:${NC}"
    echo -e "${GREEN}http://$server_ip/cashmanagement${NC}"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Set up SSL certificate for HTTPS"
    echo "2. Configure regular backups using ./backup.sh"
    echo "3. Set up monitoring and log rotation"
    echo "4. Test all application features"
else
    echo
    echo -e "${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
    echo
    echo -e "${YELLOW}Common fixes:${NC}"
    echo "1. Fix file permissions: sudo chown -R www-data:www-data $APP_DIR"
    echo "2. Run migrations: php artisan migrate"
    echo "3. Rebuild caches: php artisan config:cache && php artisan route:cache"
    echo "4. Check Apache configuration and restart: sudo systemctl restart apache2"
fi

echo
echo -e "${BLUE}For support, check logs at:${NC}"
echo "- Laravel: $APP_DIR/storage/logs/laravel.log"
echo "- Apache: /var/log/apache2/error.log"
echo

exit $TESTS_FAILED
