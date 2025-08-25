# 💻 Local Development Guide

## Cash Management System - Local Setup

This guide provides step-by-step instructions for setting up the Cash Management System for local development.

---

## 📋 Prerequisites

### System Requirements
- **PHP**: 8.2 or higher
- **MySQL**: 8.0 or higher (or MariaDB 10.4+)
- **Node.js**: 18+ with npm
- **Composer**: 2.0+
- **Git**: Latest version

### Recommended Development Tools
- **IDE**: VS Code, PhpStorm, or similar
- **Database Client**: MySQL Workbench, phpMyAdmin, or TablePlus
- **API Client**: Postman or Insomnia
- **Browser**: Chrome/Firefox with developer tools

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/cashmanagement.git
cd cashmanagement
```

### 2. Environment Setup
```bash
# Copy local environment template
cp env-local.example .env

# Generate application key
php artisan key:generate
```

### 3. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE cashmanagement_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Update .env with your database credentials
DB_DATABASE=cashmanagement_local
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

### 4. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 5. Database Migration and Seeding
```bash
# Run migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed

# Create super admin user
php artisan db:seed --class=SuperAdminSeeder
```

### 6. Build Assets
```bash
# Build frontend assets for development
npm run dev

# Or build for production
npm run build
```

### 7. Start Development Servers
```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Vite development server (for hot reload)
npm run dev

# Terminal 3: WebSocket server (if using real-time features)
php artisan reverb:start
```

### 8. Access Application
- **Application**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Default Super Admin**: 
  - Email: `super@admin.com`
  - Password: `password123`

---

## 🛠️ Development Workflow

### Daily Development Routine
```bash
# Pull latest changes
git pull origin main

# Update dependencies if needed
composer install
npm install

# Run migrations if there are new ones
php artisan migrate

# Clear caches if needed
php artisan cache:clear
php artisan config:clear

# Start development servers
php artisan serve & npm run dev
```

### Environment Configuration

#### Essential .env Variables
```env
# Application
APP_NAME="Cash Management System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cashmanagement_local
DB_USERNAME=root
DB_PASSWORD=

# Mail (for testing)
MAIL_MAILER=log

# Broadcasting (WebSockets)
BROADCAST_CONNECTION=reverb
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

---

## 🗄️ Database Management

### Migrations
```bash
# Create new migration
php artisan make:migration create_your_table_name

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Reset database
php artisan migrate:fresh --seed
```

### Seeders
```bash
# Create seeder
php artisan make:seeder YourSeeder

# Run specific seeder
php artisan db:seed --class=YourSeeder

# Run all seeders
php artisan db:seed
```

### Models
```bash
# Create model with migration and factory
php artisan make:model YourModel -mf

# Create model with controller and resource
php artisan make:model YourModel -cr
```

---

## 🎨 Frontend Development

### Asset Building
```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Watch for changes
npm run watch
```

### Frontend Stack
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **UI Components**: Custom component library
- **State Management**: React hooks and context
- **Routing**: Inertia.js

### Component Development
```bash
# Components are located in:
resources/js/components/

# Pages are located in:
resources/js/pages/

# Layouts are in:
resources/js/layouts/
```

---

## 🧪 Testing

### PHP Testing
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/YourTest.php

# Run with coverage
php artisan test --coverage

# Create new test
php artisan make:test YourFeatureTest
php artisan make:test YourUnitTest --unit
```

### Frontend Testing
```bash
# Run JavaScript tests (if configured)
npm run test

# Run with coverage
npm run test:coverage
```

---

## 🐛 Debugging

### Laravel Debugging
```bash
# Enable debug mode in .env
APP_DEBUG=true

# View logs
tail -f storage/logs/laravel.log

# Use Tinker for testing
php artisan tinker
```

### Database Debugging
```bash
# Enable query logging
DB_LOG_QUERIES=true

# Use database seeding for test data
php artisan db:seed --class=TestDataSeeder
```

### Frontend Debugging
- Use browser developer tools
- Check console for JavaScript errors
- Use React Developer Tools extension
- Check network tab for API calls

---

## 📦 Package Management

### Adding PHP Packages
```bash
# Add package
composer require vendor/package

# Add development package
composer require vendor/package --dev

# Update packages
composer update
```

### Adding JavaScript Packages
```bash
# Add package
npm install package-name

# Add development package
npm install package-name --save-dev

# Update packages
npm update
```

---

## 🔧 Useful Commands

### Laravel Artisan Commands
```bash
# List all commands
php artisan list

# Clear all caches
php artisan optimize:clear

# Create controller
php artisan make:controller YourController

# Create middleware
php artisan make:middleware YourMiddleware

# Create request validation
php artisan make:request YourRequest

# Create job
php artisan make:job YourJob

# Create event
php artisan make:event YourEvent

# Create listener
php artisan make:listener YourListener

# Create notification
php artisan make:notification YourNotification
```

### Custom Commands
```bash
# Environment detection
php artisan env:detect

# System health check
php artisan system:health

# Generate backup
php artisan backup:run
```

---

## 🌐 API Development

### API Routes
```bash
# API routes are defined in:
routes/api.php

# Test API endpoints
curl -X GET http://localhost:8000/api/notifications \
  -H "Accept: application/json" \
  -H "Authorization: Bearer your-token"
```

### API Testing
- Use Postman or Insomnia
- Test authentication endpoints
- Verify CSRF token handling
- Test error responses

---

## 📱 Mobile Development

### Responsive Design
- Use Tailwind CSS responsive classes
- Test on different screen sizes
- Use browser device emulation
- Test touch interactions

### PWA Features (if enabled)
- Test offline functionality
- Verify service worker registration
- Test push notifications
- Check app manifest

---

## 🔍 Code Quality

### PHP Code Standards
```bash
# Install PHP CS Fixer
composer require friendsofphp/php-cs-fixer --dev

# Fix code style
./vendor/bin/php-cs-fixer fix

# Check code with PHPStan
composer require phpstan/phpstan --dev
./vendor/bin/phpstan analyse
```

### JavaScript Code Quality
```bash
# ESLint (if configured)
npm run lint

# Prettier (if configured)
npm run format

# Type checking
npm run type-check
```

---

## 📚 Documentation

### Code Documentation
- Use PHPDoc for PHP methods
- Use JSDoc for JavaScript functions
- Document API endpoints
- Keep README updated

### Database Documentation
- Document table relationships
- Explain complex queries
- Document stored procedures
- Keep migration notes

---

## 🚨 Common Issues & Solutions

### Permission Issues
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
```

### Composer Issues
```bash
# Clear Composer cache
composer clear-cache

# Reinstall dependencies
rm -rf vendor
composer install
```

### NPM Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
```bash
# Check MySQL service
sudo service mysql status

# Restart MySQL
sudo service mysql restart

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

---

## 🎯 Development Best Practices

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make commits with clear messages
git commit -m "Add: user authentication feature"

# Push and create pull request
git push origin feature/your-feature-name
```

### Code Organization
- Follow PSR-12 coding standards for PHP
- Use meaningful variable and function names
- Write self-documenting code
- Keep functions small and focused
- Use consistent naming conventions

### Database Best Practices
- Use migrations for schema changes
- Always use seeders for test data
- Index frequently queried columns
- Use foreign key constraints
- Backup before major changes

---

## 📞 Getting Help

### Resources
- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Inertia.js**: https://inertiajs.com

### Community
- Laravel Discord
- React Community
- Stack Overflow
- GitHub Issues

---

## ✅ Development Checklist

### Initial Setup
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Database created and migrated
- [ ] Environment configured
- [ ] Development servers running
- [ ] Application accessible

### Before Committing
- [ ] Code follows standards
- [ ] Tests are passing
- [ ] No console errors
- [ ] Database migrations work
- [ ] Documentation updated

### Before Deployment
- [ ] Production build works
- [ ] Environment variables set
- [ ] Database migrations tested
- [ ] Performance optimized
- [ ] Security reviewed

**🎉 Happy coding! Your local development environment is ready!**
