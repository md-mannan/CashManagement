# 💰 Cash Management System

A modern, full-featured financial management application built with Laravel 12 and React 19. Track income, expenses, manage categories, handle multiple currencies, and get real-time notifications with a beautiful, responsive interface.

![Cash Management Dashboard](https://img.shields.io/badge/Laravel-12.x-red?style=flat-square&logo=laravel)
![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![PHP](https://img.shields.io/badge/PHP-8.2+-purple?style=flat-square&logo=php)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ **Key Features**

### 📊 **Financial Management**
- **Transaction Tracking** - Income, expenses, payables, and receivables
- **Category Management** - Organize transactions with custom categories
- **Multi-Currency Support** - Handle multiple currencies with real-time exchange rates
- **Financial Reports** - Comprehensive analytics and reporting
- **Export/Import** - Excel/CSV export and import functionality

### 🎨 **Modern Interface**
- **Responsive Design** - Beautiful UI that works on all devices
- **Dark/Light Mode** - Toggle between themes with system preference detection
- **Theme Customization** - Multiple color themes (Neutral, Violet)
- **Real-time Updates** - Live notifications and data updates via WebSockets

### 🔐 **Security & Administration**
- **Role-based Access Control** - Admin, Super Admin, and User roles
- **User Management** - Complete user administration panel
- **Activity Logging** - Comprehensive audit trail
- **Social Authentication** - Login with Google, GitHub, etc.
- **Secure Authentication** - Laravel Sanctum with session management

### 🚀 **Technical Excellence**
- **Dynamic Environment Detection** - Automatic configuration for different hosting types
- **WebSocket Integration** - Laravel Reverb for real-time features
- **Modern Frontend** - React 19 with TypeScript and Tailwind CSS
- **API Ready** - RESTful API endpoints for mobile/external integrations
- **Testing Suite** - Comprehensive test coverage with Pest PHP

## 🛠️ **Technology Stack**

### **Backend**
- **Laravel 12** - Modern PHP framework
- **PHP 8.2+** - Latest PHP features
- **MySQL 8.0** - Reliable database
- **Laravel Reverb** - Real-time WebSocket server
- **Inertia.js** - SPA-like experience without API complexity

### **Frontend**
- **React 19** - Latest React with concurrent features
- **TypeScript 5.7** - Type-safe JavaScript
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Vite 7** - Fast build tool and dev server
- **Shadcn/ui** - Beautiful, accessible UI components

### **Development Tools**
- **Pest PHP** - Modern PHP testing framework
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Laravel Pint** - PHP code style fixer
- **Concurrently** - Run multiple dev servers

## 🚀 **Quick Start**

### **Prerequisites**
- PHP 8.2 or higher
- MySQL 8.0 or higher  
- Composer 2.0+
- Node.js 18+ and npm
- Git

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd CashManagement

# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Dynamic environment configuration
php artisan env:detect
php artisan env:config --generate

# Database setup
php artisan migrate
php artisan db:seed

# Start development servers
composer run dev
```

This will start:
- Laravel development server (http://localhost:8000)
- Vite development server (hot reloading)
- Queue worker for background jobs

## 📖 **Documentation**

### **Setup Guides**
- 📚 [**Local Development Guide**](LOCAL_DEVELOPMENT.md) - Complete local setup instructions
- 🚀 [**Production Setup Guide**](PRODUCTION_SETUP.md) - Deploy to production servers

### **Key Features Documentation**

#### **Dynamic Environment System**
Automatically detects and configures your environment:

```bash
# Detect current environment
php artisan env:detect

# Generate optimized .env file
php artisan env:config --generate --force
```

**Supported Environments:**
- **Local Development** - Optimized for development with debug tools
- **Shared Hosting** - cPanel/Plesk compatible with database sessions
- **VPS/Dedicated** - Full server control with Redis caching
- **Cloud Platforms** - AWS/GCP/Azure with managed services

#### **WebSocket Real-time Features**
Laravel Reverb provides real-time functionality:

```bash
# Start WebSocket server
php artisan reverb:start
```

**Real-time Features:**
- Live notifications
- Transaction updates
- User activity tracking
- Admin dashboard updates

## 🎨 **User Interface**

### **Dashboard Features**
- **Financial Overview** - Income, expenses, balance at a glance
- **Transaction History** - Searchable and filterable transaction list
- **Category Analytics** - Visual breakdown by categories
- **Currency Exchange** - Real-time exchange rate display
- **Quick Actions** - Fast transaction entry

### **Admin Panel**
- **User Management** - Create, edit, delete users and roles
- **System Settings** - Application configuration
- **Activity Logs** - Comprehensive audit trail
- **Database Management** - Backup and restore functionality
- **Analytics Dashboard** - System-wide financial analytics

### **Responsive Design**
- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Perfect tablet experience
- **Desktop Enhanced** - Full desktop functionality
- **Touch Friendly** - Gesture support for mobile interactions

## 🔧 **Configuration**

### **Environment Variables**

```env
# Application
APP_NAME="Cash Management"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_DATABASE=cashmanagement_local
DB_USERNAME=root
DB_PASSWORD=

# WebSockets (Laravel Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_KEY=your-reverb-key
REVERB_HOST="localhost"
REVERB_PORT=8080

# Mail Configuration
MAIL_MAILER=log  # or smtp for production

# Social Authentication (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### **Customization Options**

**Themes:** Neutral (default), Violet
**Appearance:** Light, Dark, System
**Currency:** Multiple currency support with real-time rates
**Localization:** Ready for multi-language support

## 🧪 **Testing**

### **Backend Testing**
```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Feature
```

### **Frontend Testing**
```bash
# Type checking
npm run types

# Linting
npm run lint

# Format code
npm run format
```

### **Test Coverage**
- **Feature Tests** - Complete user workflows
- **Unit Tests** - Individual component testing
- **API Tests** - Endpoint validation
- **Authentication Tests** - Security verification

## 📊 **Performance**

### **Optimization Features**
- **Laravel Caching** - Config, route, and view caching
- **Database Optimization** - Efficient queries and indexing
- **Asset Optimization** - Vite build optimization
- **Lazy Loading** - Frontend component lazy loading
- **Image Optimization** - Responsive image handling

### **Production Performance**
- **OPcache** - PHP bytecode caching
- **Redis** - Session and cache storage (VPS/Cloud)
- **CDN Ready** - Static asset distribution
- **Database Indexing** - Optimized database queries

## 🔐 **Security**

### **Security Features**
- **CSRF Protection** - Cross-site request forgery prevention
- **XSS Protection** - Cross-site scripting prevention
- **SQL Injection Prevention** - Parameterized queries
- **Rate Limiting** - API and login attempt limiting
- **Secure Headers** - Security headers implementation

### **Authentication**
- **Multi-factor Ready** - Prepared for 2FA implementation
- **Social Login** - OAuth integration with major providers
- **Password Security** - Bcrypt hashing with salt
- **Session Security** - Secure session management

## 🌍 **Deployment**

### **Supported Hosting Types**

**Shared Hosting (cPanel)**
- Automatic detection and configuration
- Database session storage for reliability
- Optimized for shared hosting limitations

**VPS/Dedicated Servers**
- Full server control features
- Redis caching support
- Background job processing

**Cloud Platforms**
- AWS, Google Cloud, Azure support
- Managed service integration
- Auto-scaling ready

## 📈 **Roadmap**

### **Upcoming Features**
- [ ] **Mobile App** - React Native companion app
- [ ] **Multi-language Support** - Internationalization
- [ ] **Advanced Reporting** - Custom report builder
- [ ] **Budget Planning** - Budget creation and tracking
- [ ] **Receipt Scanning** - OCR receipt processing
- [ ] **Bank Integration** - Direct bank account connectivity
- [ ] **Investment Tracking** - Portfolio management
- [ ] **Team Collaboration** - Multi-user workspace

### **Technical Improvements**
- [ ] **GraphQL API** - Alternative to REST API
- [ ] **PWA Support** - Progressive Web App features
- [ ] **Offline Mode** - Local data synchronization
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Microservices** - Service-oriented architecture

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite** (`php artisan test && npm run lint`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### **Development Guidelines**
- Follow PSR-12 PHP coding standards
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Getting Help**
- **Documentation** - Check the guides in this repository
- **Issues** - Report bugs or request features via GitHub Issues
- **Discussions** - Community discussions and Q&A

### **Common Issues**
- **CORS Errors** - Check production setup guide
- **Database Connection** - Verify MySQL credentials
- **Asset Loading** - Ensure build files are present
- **WebSocket Issues** - Check Reverb server status

## 🏆 **Acknowledgments**

### **Built With**
- [Laravel](https://laravel.com) - The PHP framework for web artisans
- [React](https://react.dev) - A JavaScript library for building user interfaces
- [Inertia.js](https://inertiajs.com) - The modern monolith
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com) - Beautifully designed components

### **Special Thanks**
- Laravel community for the excellent framework
- React team for the powerful UI library
- All contributors and testers

---

## 🚀 **Get Started Today**

Ready to take control of your finances? Follow our [Local Development Guide](LOCAL_DEVELOPMENT.md) to get started, or check out the [Production Setup Guide](PRODUCTION_SETUP.md) to deploy your own instance.

**Happy financial management! 💰**