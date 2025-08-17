#!/bin/bash

# Docker-based deployment script for CashManagement
# Alternative deployment method for containerized environments

set -e

APP_NAME="cashmanagement"
CURRENT_DIR=$(pwd)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Create Dockerfile
create_dockerfile() {
    log "Creating Dockerfile..."
    
    cat > Dockerfile <<'EOF'
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache mod_rewrite
RUN a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copy production htaccess
COPY .htaccess-production /var/www/html/public/.htaccess

# Configure Apache for subdirectory
RUN echo "Alias /${APP_NAME} /var/www/html/public" > /etc/apache2/conf-available/${APP_NAME}.conf \
    && a2enconf ${APP_NAME}

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
EOF

    log "Dockerfile created."
}

# Create docker-compose file
create_docker_compose() {
    log "Creating docker-compose.yml..."
    
    cat > docker-compose.yml <<EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_CONNECTION=mysql
      - DB_HOST=db
      - DB_PORT=3306
      - DB_DATABASE=${APP_NAME}_db
      - DB_USERNAME=${APP_NAME}_user
      - DB_PASSWORD=secure_password_123
    volumes:
      - ./storage:/var/www/html/storage
      - ./bootstrap/cache:/var/www/html/bootstrap/cache
    depends_on:
      - db
    networks:
      - ${APP_NAME}_network

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: ${APP_NAME}_db
      MYSQL_USER: ${APP_NAME}_user
      MYSQL_PASSWORD: secure_password_123
      MYSQL_ROOT_PASSWORD: root_password_123
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - ${APP_NAME}_network

volumes:
  db_data:

networks:
  ${APP_NAME}_network:
    driver: bridge
EOF

    log "docker-compose.yml created."
}

# Build and deploy with Docker
deploy_docker() {
    log "Building and deploying with Docker..."
    
    # Build the application
    docker-compose build
    
    # Start the containers
    docker-compose up -d
    
    # Wait for MySQL to be ready
    log "Waiting for database to be ready..."
    sleep 30
    
    # Run migrations
    docker-compose exec app php artisan migrate --force
    
    # Seed database (optional)
    read -p "Do you want to seed the database? (y/N): " seed_choice
    if [[ $seed_choice =~ ^[Yy]$ ]]; then
        docker-compose exec app php artisan db:seed --force
    fi
    
    # Optimize Laravel
    docker-compose exec app php artisan config:cache
    docker-compose exec app php artisan route:cache
    docker-compose exec app php artisan view:cache
    
    log "Docker deployment completed!"
}

# Main function
main() {
    if [ ! -f "artisan" ]; then
        error "Please run this script from the Laravel project root directory."
    fi
    
    create_dockerfile
    create_docker_compose
    deploy_docker
    
    local server_ip=$(curl -s ifconfig.me || echo "localhost")
    
    echo
    echo -e "${GREEN}=== Docker Deployment Summary ===${NC}"
    echo -e "Application URL: ${GREEN}http://${server_ip}/${APP_NAME}${NC}"
    echo -e "Database: MySQL 8.0 (containerized)${NC}"
    echo
    echo -e "${YELLOW}Docker Commands:${NC}"
    echo "  Stop:    docker-compose down"
    echo "  Start:   docker-compose up -d"
    echo "  Logs:    docker-compose logs -f"
    echo "  Shell:   docker-compose exec app bash"
    echo
}

main "$@"
