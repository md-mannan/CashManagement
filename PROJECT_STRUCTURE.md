# 📁 Project Structure

## Cash Management System - Directory Structure

This document outlines the complete project structure and explains the purpose of each directory and important files.

---

## 🏗️ **Root Directory**

```
CashManagement/
├── 📁 app/                     # Laravel application core
├── 📁 bootstrap/               # Laravel bootstrap files
├── 📁 config/                  # Configuration files
├── 📁 database/                # Database migrations, seeders, factories
├── 📁 public/                  # Web server document root
├── 📁 resources/               # Frontend assets and views
├── 📁 routes/                  # Route definitions
├── 📁 storage/                 # Application storage (logs, cache, uploads)
├── 📁 tests/                   # Test files
├── 📄 .env                     # Environment configuration
├── 📄 .env.example             # Environment template
├── 📄 artisan                  # Laravel command-line interface
├── 📄 composer.json            # PHP dependencies
├── 📄 package.json             # Node.js dependencies
└── 📄 README.md                # Project documentation
```

---

## 🚀 **Application Directory (`app/`)**

### **Console Commands**
```
app/Console/Commands/
├── EnvironmentConfigCommand.php    # Generate environment-specific configs
└── EnvironmentDetectCommand.php    # Detect hosting environment type
```

### **Event System**
```
app/Events/
├── NotificationDeleted.php         # Notification deletion event
├── NotificationRead.php            # Notification read event
└── NotificationSent.php            # Notification sent event
```

### **Facades**
```
app/Facades/
└── EnvironmentDetector.php         # Environment detection facade
```

### **HTTP Layer**
```
app/Http/
├── Controllers/                    # Request handlers
│   ├── Admin/                     # Admin-specific controllers
│   │   ├── ActivityLogController.php
│   │   ├── AdminAnalyticsController.php
│   │   ├── AdminDashboardController.php
│   │   ├── BackupRestoreController.php
│   │   ├── DatabaseManagementController.php
│   │   ├── NotificationController.php
│   │   ├── RolePermissionController.php
│   │   ├── SuperAdminController.php
│   │   ├── SystemAuditController.php
│   │   ├── SystemHealthController.php
│   │   ├── SystemSettingsController.php
│   │   └── UserManagementController.php
│   ├── Api/                       # API controllers
│   │   └── ExchangeRateController.php
│   ├── Auth/                      # Authentication controllers
│   │   ├── AuthenticatedSessionController.php
│   │   ├── ConfirmablePasswordController.php
│   │   ├── EmailVerificationNotificationController.php
│   │   ├── EmailVerificationPromptController.php
│   │   ├── NewPasswordController.php
│   │   ├── PasswordResetLinkController.php
│   │   ├── RegisteredUserController.php
│   │   ├── SocialiteController.php
│   │   └── VerifyEmailController.php
│   ├── Settings/                  # User settings controllers
│   │   ├── AppearanceController.php
│   │   ├── CurrencyController.php
│   │   ├── ExchangeRateController.php
│   │   ├── PasswordController.php
│   │   └── ProfileController.php
│   ├── CategoryController.php     # Category management
│   ├── Controller.php             # Base controller
│   ├── DashboardController.php    # Main dashboard
│   ├── NotificationController.php # User notifications
│   ├── TestController.php         # Development testing
│   └── TransactionController.php  # Transaction management
├── Middleware/                    # HTTP middleware
│   ├── AdminMiddleware.php        # Admin access control
│   ├── Cors.php                   # CORS handling
│   ├── HandleAppearance.php       # Theme/appearance handling
│   ├── HandleInertiaRequests.php  # Inertia.js middleware
│   └── SuperAdminMiddleware.php   # Super admin access control
└── Requests/                      # Form request validation
    ├── Auth/
    │   └── LoginRequest.php
    ├── Settings/
    │   ├── ProfileUpdateRequest.php
    │   ├── UpdateAppearanceRequest.php
    │   ├── UpdateCurrencyRequest.php
    │   └── UpdateExchangeRateRequest.php
    ├── StoreTransactionRequest.php
    └── UpdateTransactionRequest.php
```

### **Models**
```
app/Models/
├── ActivityLog.php                 # Activity logging model
├── Category.php                    # Transaction categories
├── ExchangeRate.php               # Currency exchange rates
├── Notification.php               # User notifications
├── SocialAccount.php              # Social authentication accounts
├── Transaction.php                # Financial transactions
└── User.php                       # User accounts
```

### **Service Providers**
```
app/Providers/
├── AppServiceProvider.php         # Main service provider
└── DynamicEnvironmentServiceProvider.php  # Environment detection
```

### **Services**
```
app/Services/
├── ActivityLogService.php         # Activity logging logic
├── AdminNotificationService.php   # Admin notification system
├── EnvironmentDetectionService.php # Environment detection logic
├── ExchangeRateService.php        # Currency exchange rate handling
└── TransactionService.php         # Transaction business logic
```

---

## ⚙️ **Configuration (`config/`)**

```
config/
├── app.php                        # Main application config
├── auth.php                       # Authentication config
├── broadcasting.php               # WebSocket broadcasting
├── cache.php                      # Cache configuration
├── database.php                   # Database connections
├── environment.php                # Environment-specific settings
├── filesystems.php               # File storage systems
├── inertia.php                    # Inertia.js configuration
├── installer.php                  # Installation settings
├── logging.php                    # Logging configuration
├── mail.php                       # Email configuration
├── production.php                 # Production-specific settings
├── queue.php                      # Queue configuration
├── reverb.php                     # WebSocket server config
├── services.php                   # External services
└── session.php                    # Session configuration
```

---

## 🗄️ **Database (`database/`)**

### **Factories**
```
database/factories/
├── CategoryFactory.php            # Category test data
├── TransactionFactory.php         # Transaction test data
└── UserFactory.php               # User test data
```

### **Migrations**
```
database/migrations/
├── 0001_01_01_000000_create_users_table.php
├── 0001_01_01_000001_create_cache_table.php
├── 0001_01_01_000002_create_jobs_table.php
├── 2025_08_08_203705_add_currency_fields_to_users_table.php
├── 2025_08_09_045439_create_categories_table.php
├── 2025_08_09_045440_create_transactions_table.php
├── 2025_08_09_054225_add_appearance_fields_to_users_table.php
├── 2025_08_09_122749_create_exchange_rates_table.php
├── 2025_08_09_123106_add_exchange_rate_api_key_to_users_table.php
├── 2025_08_09_162444_create_notifications_table.php
├── 2025_08_09_165238_add_admin_role_to_users_table.php
├── 2025_08_09_170430_add_role_and_permissions_to_users_table.php
├── 2025_08_09_192206_remove_admin_role_columns_from_users_table.php
├── 2025_08_10_000000_create_social_accounts_table.php
├── 2025_08_10_000001_add_password_reset_fields_to_users_table.php
├── 2025_08_10_000002_create_activity_logs_table.php
└── 2025_08_10_180835_add_comprehensive_fields_to_users_table.php
```

### **Seeders**
```
database/seeders/
├── AdminSeeder.php                # Admin user creation
├── CategorySeeder.php             # Default categories (removed)
├── DatabaseSeeder.php             # Main seeder orchestrator
├── SuperAdminSeeder.php           # Super admin creation
└── TransactionSeeder.php          # Sample transaction data
```

---

## 🌐 **Public Directory (`public/`)**

```
public/
├── 📁 build/                      # Built frontend assets
├── apple-touch-icon.png           # iOS app icon
├── favicon.ico                    # Browser favicon
├── favicon.svg                    # SVG favicon
├── hot                            # Vite hot reload indicator
├── index.php                      # Application entry point
├── logo.svg                       # Application logo
├── robots.txt                     # Search engine instructions
├── .htaccess                      # Apache configuration
├── .htaccess.local                # Local development Apache config
└── .htaccess.production           # Production Apache config
```

---

## 🎨 **Resources (`resources/`)**

### **Stylesheets**
```
resources/css/
└── app.css                        # Main stylesheet with Tailwind CSS
```

### **JavaScript/TypeScript Frontend**
```
resources/js/
├── 📁 components/                 # Reusable UI components
│   ├── admin-notification.tsx
│   ├── admin-route-guard.tsx
│   ├── app-content.tsx
│   ├── app-header.tsx
│   ├── app-logo-icon.tsx
│   ├── app-logo.tsx
│   ├── app-shell.tsx
│   ├── app-sidebar-header.tsx
│   ├── app-sidebar.tsx
│   ├── appearance-dropdown.tsx
│   ├── appearance-tabs.tsx
│   ├── back-to-top.tsx
│   ├── breadcrumbs.tsx
│   ├── delete-user.tsx
│   ├── heading-small.tsx
│   ├── heading.tsx
│   ├── icon.tsx
│   ├── input-error.tsx
│   ├── nav-footer.tsx
│   ├── nav-main.tsx
│   ├── nav-user.tsx
│   ├── text-link.tsx
│   ├── theme-dropdown.tsx
│   ├── theme-preview.tsx
│   ├── theme-selector.tsx
│   ├── ui/                        # Base UI components
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── custom-date-input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form-skeleton.tsx
│   │   ├── icon.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── notification-toast.tsx
│   │   ├── pagination.tsx
│   │   ├── placeholder-pattern.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table-skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   ├── user-info.tsx
│   └── user-menu-content.tsx
├── 📁 config/                     # Frontend configuration
│   ├── environment.ts             # Environment-aware config
│   └── websocket.ts               # WebSocket configuration
├── 📁 contexts/                   # React contexts
│   └── RealTimeNotificationContext.tsx
├── 📁 hooks/                      # Custom React hooks
│   ├── use-appearance.tsx
│   ├── use-initials.tsx
│   ├── use-mobile-navigation.ts
│   ├── use-mobile.tsx
│   └── use-notifications.tsx
├── 📁 layouts/                    # Page layouts
│   ├── app/
│   │   ├── app-header-layout.tsx
│   │   └── app-sidebar-layout.tsx
│   ├── auth/
│   │   ├── auth-card-layout.tsx
│   │   ├── auth-simple-layout.tsx
│   │   └── auth-split-layout.tsx
│   ├── settings/
│   │   └── layout.tsx
│   ├── app-layout.tsx
│   └── auth-layout.tsx
├── 📁 lib/                        # Utility libraries
│   ├── axios.ts                   # HTTP client configuration
│   ├── chart-config.ts            # Chart.js configuration
│   ├── route.ts                   # Route helpers
│   └── utils.ts                   # Utility functions
├── 📁 pages/                      # Application pages
│   ├── admin/                     # Admin pages
│   │   ├── activity-log-view.tsx
│   │   ├── activity-logs.tsx
│   │   ├── analytics.tsx
│   │   ├── backup.tsx
│   │   ├── dashboard.tsx
│   │   ├── database.tsx
│   │   ├── notification-detail.tsx
│   │   ├── notifications.tsx
│   │   ├── role-permission.tsx
│   │   ├── super-admin.tsx
│   │   ├── system-audit.tsx
│   │   ├── system-health.tsx
│   │   ├── system-settings.tsx
│   │   ├── user-management.tsx
│   │   └── user-profile.tsx
│   ├── auth/                      # Authentication pages
│   │   ├── confirm-password.tsx
│   │   ├── forgot-password.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── reset-password.tsx
│   │   └── verify-email.tsx
│   ├── settings/                  # User settings pages
│   │   ├── appearance.tsx
│   │   ├── currency.tsx
│   │   ├── exchange-rate.tsx
│   │   ├── password.tsx
│   │   └── profile.tsx
│   ├── transactions/              # Transaction pages
│   │   ├── add-expense.tsx
│   │   ├── add-income.tsx
│   │   ├── add-payable.tsx
│   │   └── add-receivable.tsx
│   ├── add-transaction.tsx
│   ├── categories.tsx
│   ├── dashboard.tsx
│   ├── ledger.tsx
│   ├── notifications.tsx
│   ├── transaction-edit.tsx
│   ├── transaction-view.tsx
│   └── transaction.tsx
├── 📁 services/                   # Frontend services
│   ├── exchangeRateService.ts
│   ├── notificationService.ts
│   └── websocketService.ts
├── 📁 types/                      # TypeScript definitions
│   ├── global.d.ts
│   ├── index.d.ts
│   └── vite-env.d.ts
├── app.tsx                        # Main React application
├── ssr.tsx                        # Server-side rendering
└── ziggy.js                       # Laravel route helpers
```

### **Views**
```
resources/views/
└── app.blade.php                  # Main HTML template
```

---

## 🛣️ **Routes (`routes/`)**

```
routes/
├── api.php                        # API routes
├── channels.php                   # Broadcasting channels
├── console.php                    # Console commands
└── web.php                        # Web routes
```

---

## 💾 **Storage (`storage/`)**

```
storage/
├── 📁 app/                        # Application files
├── 📁 backups/                    # Database backups
│   └── backup_full_2025-08-10_11-59-47_1221.sql.gz
├── 📁 framework/                  # Framework cache and sessions
│   ├── cache/
│   ├── sessions/
│   ├── testing/
│   └── views/
└── 📁 logs/                       # Application logs
```

---

## 🧪 **Tests (`tests/`)**

```
tests/
├── Feature/                       # Feature tests
│   ├── Auth/
│   │   ├── AuthenticationTest.php
│   │   ├── EmailVerificationTest.php
│   │   ├── PasswordConfirmationTest.php
│   │   ├── PasswordResetTest.php
│   │   └── RegistrationTest.php
│   ├── Settings/
│   │   ├── PasswordUpdateTest.php
│   │   └── ProfileUpdateTest.php
│   ├── DashboardTest.php
│   └── ExampleTest.php
├── Unit/                          # Unit tests
│   └── ExampleTest.php
├── Pest.php                       # Pest PHP configuration
└── TestCase.php                   # Base test case
```

---

## 📄 **Configuration Files**

### **Environment Templates**
- `env-local.example` - Local development environment
- `env-production.example` - Production environment
- `env-cpanel.example` - cPanel/shared hosting environment

### **Web Server Configuration**
- `public/.htaccess.local` - Apache config for local development
- `public/.htaccess.production` - Apache config for production
- `public/.htaccess.cpanel` - Apache config for cPanel/shared hosting

### **Package Management**
- `composer.json` - PHP dependencies and scripts
- `package.json` - Node.js dependencies and scripts
- `composer.lock` - PHP dependency lock file
- `package-lock.json` - Node.js dependency lock file

### **Build Configuration**
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `phpunit.xml` - PHPUnit testing configuration
- `components.json` - UI components configuration

---

## 📚 **Documentation Files**

- `README.md` - Main project documentation
- `LOCAL_DEVELOPMENT.md` - Local development setup guide
- `PRODUCTION_DEPLOYMENT.md` - Production deployment guide
- `CPANEL_DEPLOYMENT.md` - cPanel/shared hosting deployment guide
- `PROJECT_STRUCTURE.md` - This file
- `NOTIFICATION_PRODUCTION_GUIDE.md` - Environment-aware features guide

---

## 🔧 **Key Features by Directory**

### **Real-time Features**
- WebSocket configuration: `config/reverb.php`
- Frontend WebSocket service: `resources/js/services/websocketService.ts`
- Notification context: `resources/js/contexts/RealTimeNotificationContext.tsx`

### **Environment Detection**
- Service: `app/Services/EnvironmentDetectionService.php`
- Commands: `app/Console/Commands/Environment*.php`
- Frontend config: `resources/js/config/environment.ts`

### **Multi-Currency Support**
- Model: `app/Models/ExchangeRate.php`
- Service: `app/Services/ExchangeRateService.php`
- Frontend service: `resources/js/services/exchangeRateService.ts`

### **Admin Panel**
- Controllers: `app/Http/Controllers/Admin/`
- Pages: `resources/js/pages/admin/`
- Middleware: `app/Http/Middleware/AdminMiddleware.php`

### **Authentication System**
- Controllers: `app/Http/Controllers/Auth/`
- Pages: `resources/js/pages/auth/`
- Social auth: `app/Http/Controllers/Auth/SocialiteController.php`

This structure provides a clear separation of concerns and follows Laravel and React best practices for maintainable, scalable applications.
