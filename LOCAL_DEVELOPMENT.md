# 💻 Cash Management - Local Development Guide

Complete guide for setting up Cash Management application for local development.

## 📋 **Prerequisites**

- PHP 8.2 or higher
- MySQL 8.0 or higher
- Composer 2.0+
- Node.js 18+ and npm
- Git

## 🏗️ **Development Architecture**

```
Local Development Structure:
CashManagement/
├── app/                    # Laravel application logic
├── config/                 # Configuration files
├── database/              # Migrations, seeders, factories
├── resources/             # Views, assets, translations
│   ├── js/               # React/TypeScript frontend
│   ├── css/              # Styles
│   └── views/            # Blade templates
├── routes/               # Application routes
├── storage/              # Logs, cache, uploads
├── vendor/               # PHP dependencies
├── node_modules/         # Node.js dependencies
├── .env                  # Local environment variables
└── package.json          # Frontend dependencies
```

## 🚀 **Quick Start**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd CashManagement
```

### **2. Install Dependencies**
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### **3. Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run dynamic environment detection
php artisan env:detect
php artisan env:config --generate
```

### **4. Database Setup**
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE cashmanagement_local;"

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed
```

### **5. Start Development Servers**
```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Vite development server (for hot reloading)
npm run dev

# Terminal 3: Laravel Reverb WebSocket server
php artisan reverb:start
```

## ⚙️ **Environment Configuration**

### **Local .env Configuration**

The dynamic environment system automatically configures your local environment. Your `.env` should look like:

```env
# Application
APP_NAME="Cash Management"
APP_ENV=local
APP_KEY=base64:your-generated-key-here
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cashmanagement_local
DB_USERNAME=root
DB_PASSWORD=

# Laravel Reverb (WebSockets)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=123456
REVERB_APP_KEY=your-reverb-key
REVERB_APP_SECRET=your-reverb-secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Development Settings
SESSION_DRIVER=database
CACHE_STORE=file
QUEUE_CONNECTION=sync
LOG_LEVEL=debug

# Mail (Development - use Mailtrap or Log)
MAIL_MAILER=log
# For Mailtrap testing:
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.mailtrap.io
# MAIL_PORT=2525
# MAIL_USERNAME=your-mailtrap-username
# MAIL_PASSWORD=your-mailtrap-password

# Frontend Development
VITE_APP_NAME="${APP_NAME}"
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## 🔧 **Dynamic Environment System**

This application includes an intelligent environment detection system that automatically configures settings based on your environment.

### **Available Commands**

```bash
# Detect current environment
php artisan env:detect

# Generate .env file with optimal settings
php artisan env:config --generate

# Force regenerate (overwrites existing .env)
php artisan env:config --generate --force
```

### **Environment Types**

- **Local** (`localhost`, `.local`, `.test`) - MySQL database, file cache, Reverb WebSockets, debug enabled
- **Shared Hosting** (cPanel, Plesk) - MySQL database, Reverb optimized, database cache/sessions
- **VPS/Dedicated** - MySQL database, Reverb WebSockets, Redis cache/sessions
- **Cloud** (AWS, GCP, Azure) - Managed services, Reverb WebSockets, cloud queues

## 🎨 **Frontend Development**

### **Technology Stack**
- **React 18** with TypeScript
- **Inertia.js** for SPA-like experience
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **Shadcn/ui** components

### **Development Workflow**

```bash
# Start development with hot reloading
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Frontend Structure**

```
resources/js/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── [feature-components]
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin panel pages
│   ├── settings/       # Settings pages
│   └── transactions/   # Transaction pages
├── layouts/            # Layout components
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript definitions
├── lib/                # Utility functions
└── app.tsx             # Main application entry
```

## 🔄 **WebSocket Development**

### **Laravel Reverb Setup**

Laravel Reverb provides real-time WebSocket functionality:

```bash
# Start Reverb server
php artisan reverb:start

# Install Reverb (if not already installed)
php artisan reverb:install
```

### **Frontend WebSocket Integration**

```typescript
// Example WebSocket usage
import { usePage } from '@inertiajs/react';

// Real-time notifications
Echo.private(`user.${user.id}`)
    .notification((notification) => {
        // Handle real-time notifications
    });

// Transaction updates
Echo.channel('transactions')
    .listen('TransactionCreated', (e) => {
        // Handle real-time transaction updates
    });
```

## 🧪 **Testing**

### **Backend Testing**

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/TransactionTest.php
```

### **Frontend Testing**

```bash
# Run frontend tests (if configured)
npm run test

# E2E testing with Cypress (if configured)
npm run cypress:open
```

## 🛠️ **Development Tools**

### **Laravel Artisan Commands**

```bash
# Create new controller
php artisan make:controller TransactionController

# Create new model with migration
php artisan make:model Transaction -m

# Create new request class
php artisan make:request StoreTransactionRequest

# Create new job
php artisan make:job ProcessTransaction

# Create new event
php artisan make:event TransactionCreated

# Create new listener
php artisan make:listener SendTransactionNotification
```

### **Database Management**

```bash
# Create new migration
php artisan make:migration create_transactions_table

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Refresh database with seeds
php artisan migrate:refresh --seed

# Create new seeder
php artisan make:seeder TransactionSeeder

# Create new factory
php artisan make:factory TransactionFactory
```

### **Debugging Tools**

```bash
# Laravel Tinker (REPL)
php artisan tinker

# Clear various caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# View routes
php artisan route:list

# View application info
php artisan about
```

## 📊 **Database Development**

### **Database Design**

Key tables:
- `users` - User management with roles
- `categories` - Transaction categories
- `transactions` - Financial transactions
- `exchange_rates` - Currency exchange rates
- `notifications` - User notifications
- `activity_logs` - Audit trail

### **Seeders**

```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=CategorySeeder

# Create sample data for development
php artisan db:seed --class=TransactionSeeder
```

## 🎯 **Feature Development**

### **Adding New Features**

1. **Backend Development**
   ```bash
   # Create model, migration, controller
   php artisan make:model NewFeature -mcr
   
   # Create request validation
   php artisan make:request StoreNewFeatureRequest
   ```

2. **Frontend Development**
   ```bash
   # Create new page component
   # resources/js/pages/new-feature.tsx
   
   # Add route in routes/web.php
   # Add Inertia route
   ```

3. **Testing**
   ```bash
   # Create feature test
   php artisan make:test NewFeatureTest
   ```

### **API Development**

```bash
# Create API controller
php artisan make:controller Api/NewFeatureController

# Add API routes in routes/api.php
Route::apiResource('new-features', NewFeatureController::class);

# Create API resource
php artisan make:resource NewFeatureResource
```

## 🔐 **Security Development**

### **Authentication & Authorization**

- Custom role-based access control
- Admin middleware protection
- CSRF protection enabled
- SQL injection prevention via Eloquent ORM

### **Security Best Practices**

```php
// Always use request validation
public function store(StoreTransactionRequest $request)
{
    // Validated data is automatically available
    $validated = $request->validated();
}

// Use authorization policies
public function update(Transaction $transaction)
{
    $this->authorize('update', $transaction);
}

// Sanitize user input
$cleanInput = strip_tags($request->input('description'));
```

## 🚀 **Performance Development**

### **Optimization Techniques**

```bash
# Database query optimization
php artisan db:monitor

# Cache frequently accessed data
Cache::remember('exchange-rates', 3600, function () {
    return ExchangeRate::latest()->get();
});

# Eager loading relationships
Transaction::with(['category', 'user'])->get();
```

### **Frontend Performance**

```bash
# Analyze bundle size
npm run build
npm run analyze

# Optimize images and assets
# Use lazy loading for components
const LazyComponent = lazy(() => import('./Component'));
```

## 🔄 **Development Workflow**

### **Git Workflow**

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### **Code Quality**

```bash
# PHP Code Sniffer
./vendor/bin/phpcs

# PHP CS Fixer
./vendor/bin/php-cs-fixer fix

# ESLint for frontend
npm run lint

# Prettier for code formatting
npm run format
```

## 🛠️ **Troubleshooting**

### **Common Issues**

**Database Connection Error**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check .env database credentials
```

**Vite Not Hot Reloading**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart development server
npm run dev
```

**Permission Errors**
```bash
# Fix storage permissions
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

**WebSocket Connection Issues**
```bash
# Check Reverb is running
php artisan reverb:start

# Verify ports are available
netstat -tulpn | grep :8080
```

## 📚 **Resources**

### **Documentation**
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Inertia.js Documentation](https://inertiajs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### **Development Tools**
- [Laravel Debugbar](https://github.com/barryvdh/laravel-debugbar)
- [Laravel Telescope](https://laravel.com/docs/telescope)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## 🎯 **Development Checklist**

- [ ] Repository cloned and dependencies installed
- [ ] Local database created and migrated
- [ ] Environment variables configured
- [ ] Development servers running (Laravel + Vite + Reverb)
- [ ] Hot reloading working
- [ ] WebSocket connections established
- [ ] Sample data seeded
- [ ] Tests passing

**Happy coding! Your local development environment is ready! 🚀**
