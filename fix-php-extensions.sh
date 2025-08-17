#!/bin/bash

# PHP Extensions Fix Script for CashManagement
# This script fixes common PHP extension issues during deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons. Use sudo when prompted."
   exit 1
fi

log "Starting PHP extensions fix..."

# Detect OS
if [ -f /etc/debian_version ]; then
    OS="debian"
    DISTRO=$(lsb_release -si 2>/dev/null || echo "Debian")
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
    DISTRO=$(cat /etc/redhat-release | cut -d' ' -f1)
else
    OS="unknown"
    warn "Unknown OS. Attempting generic fixes..."
fi

info "Detected OS: $DISTRO ($OS)"

# Get PHP version
PHP_VERSION=$(php -v 2>/dev/null | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2 || echo "")
if [ -z "$PHP_VERSION" ]; then
    error "PHP is not installed or not in PATH"
    exit 1
fi

info "PHP Version: $PHP_VERSION"

# Check current extensions
log "Current PHP extensions:"
php -m | grep -E "(pdo|mysql|mbstring|xml|json|bcmath|fileinfo|tokenizer|ctype)" || echo "None found"

# Required extensions for Laravel
REQUIRED_EXTENSIONS=("pdo" "pdo_mysql" "mbstring" "xml" "ctype" "json" "bcmath" "fileinfo" "tokenizer")

# Check missing extensions
MISSING_EXTENSIONS=()
for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if ! php -m | grep -q "^$ext$" && ! php -m | grep -q "^${ext//_/}$"; then
        MISSING_EXTENSIONS+=("$ext")
    fi
done

if [ ${#MISSING_EXTENSIONS[@]} -eq 0 ]; then
    log "All required PHP extensions are already installed!"
    exit 0
fi

warn "Missing extensions: ${MISSING_EXTENSIONS[*]}"

# Install missing extensions based on OS
install_extensions() {
    case $OS in
        "debian")
            log "Installing PHP extensions for Debian/Ubuntu..."
            
            # Update package list
            sudo apt-get update
            
            # Install extensions
            for ext in "${MISSING_EXTENSIONS[@]}"; do
                case $ext in
                    "pdo"|"pdo_mysql")
                        info "Installing PDO and MySQL extensions..."
                        sudo apt-get install -y php${PHP_VERSION}-mysql php${PHP_VERSION}-pdo
                        ;;
                    "mbstring")
                        info "Installing mbstring extension..."
                        sudo apt-get install -y php${PHP_VERSION}-mbstring
                        ;;
                    "xml")
                        info "Installing XML extension..."
                        sudo apt-get install -y php${PHP_VERSION}-xml
                        ;;
                    "bcmath")
                        info "Installing bcmath extension..."
                        sudo apt-get install -y php${PHP_VERSION}-bcmath
                        ;;
                    "json")
                        info "Installing JSON extension..."
                        sudo apt-get install -y php${PHP_VERSION}-json
                        ;;
                    "ctype")
                        info "Installing ctype extension..."
                        sudo apt-get install -y php${PHP_VERSION}-ctype
                        ;;
                    "fileinfo")
                        info "Installing fileinfo extension..."
                        sudo apt-get install -y php${PHP_VERSION}-fileinfo
                        ;;
                    "tokenizer")
                        info "Installing tokenizer extension..."
                        sudo apt-get install -y php${PHP_VERSION}-tokenizer
                        ;;
                    *)
                        warn "Unknown extension: $ext, attempting generic install..."
                        sudo apt-get install -y php${PHP_VERSION}-${ext} || true
                        ;;
                esac
            done
            ;;
            
        "redhat")
            log "Installing PHP extensions for RedHat/CentOS..."
            
            # Update package list
            sudo yum update -y || sudo dnf update -y
            
            # Install extensions
            for ext in "${MISSING_EXTENSIONS[@]}"; do
                case $ext in
                    "pdo"|"pdo_mysql")
                        info "Installing PDO and MySQL extensions..."
                        sudo yum install -y php-pdo php-mysql || sudo dnf install -y php-pdo php-mysql
                        ;;
                    "mbstring")
                        sudo yum install -y php-mbstring || sudo dnf install -y php-mbstring
                        ;;
                    "xml")
                        sudo yum install -y php-xml || sudo dnf install -y php-xml
                        ;;
                    "bcmath")
                        sudo yum install -y php-bcmath || sudo dnf install -y php-bcmath
                        ;;
                    "json")
                        sudo yum install -y php-json || sudo dnf install -y php-json
                        ;;
                    *)
                        warn "Attempting to install php-$ext..."
                        sudo yum install -y php-${ext} || sudo dnf install -y php-${ext} || true
                        ;;
                esac
            done
            ;;
            
        *)
            error "Unsupported OS. Please install PHP extensions manually:"
            echo "Required extensions: ${REQUIRED_EXTENSIONS[*]}"
            echo "Missing extensions: ${MISSING_EXTENSIONS[*]}"
            exit 1
            ;;
    esac
}

# Install the extensions
install_extensions

# Restart web servers to load new extensions
log "Restarting web servers to load new extensions..."
sudo systemctl restart apache2 2>/dev/null || true
sudo systemctl restart httpd 2>/dev/null || true
sudo systemctl restart nginx 2>/dev/null || true
sudo systemctl restart php-fpm 2>/dev/null || true

# Wait a moment for services to restart
sleep 2

# Verify installation
log "Verifying extension installation..."
STILL_MISSING=()
for ext in "${MISSING_EXTENSIONS[@]}"; do
    if ! php -m | grep -q "^$ext$" && ! php -m | grep -q "^${ext//_/}$"; then
        STILL_MISSING+=("$ext")
    else
        log "✓ $ext extension is now available"
    fi
done

if [ ${#STILL_MISSING[@]} -eq 0 ]; then
    log "✅ All PHP extensions installed successfully!"
    echo
    info "Current PHP extensions:"
    php -m | grep -E "(pdo|mysql|mbstring|xml|json|bcmath|fileinfo|tokenizer|ctype)"
    echo
    log "You can now run the deployment script: ./deploy.sh"
else
    error "❌ Some extensions are still missing: ${STILL_MISSING[*]}"
    echo
    warn "Manual installation may be required:"
    for ext in "${STILL_MISSING[@]}"; do
        echo "  sudo apt-get install php${PHP_VERSION}-${ext}  # For Debian/Ubuntu"
        echo "  sudo yum install php-${ext}                    # For RedHat/CentOS"
    done
    echo
    info "After manual installation, restart your web server:"
    echo "  sudo systemctl restart apache2"
    exit 1
fi

log "PHP extensions fix completed successfully!"
