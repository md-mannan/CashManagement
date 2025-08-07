# 💰 Personal Account - Smart Financial Management

> A modern, intuitive financial management application built with Laravel 12, React, and TypeScript. Track your personal finances, manage transactions, and gain insights into your financial health with a beautiful, responsive interface.

![Laravel](https://img.shields.io/badge/Laravel-12.22.0-red.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 🎯 Core Functionality

- **Smart Transaction Management** - Add, edit, and categorize income, expenses, receivables, and payables
- **Real-time Financial Dashboard** - Live overview of your financial position with beautiful charts
- **Multi-Currency Support** - Handle KWD, USD, EUR, BDT with proper decimal formatting
- **Advanced Filtering** - Filter transactions by date, type, category, and amount
- **Search & Sort** - Find transactions quickly with powerful search capabilities

### 📊 Export & Reporting

- **Excel Export** - Beautiful, formatted spreadsheets with proper data types and styling
- **CSV Export** - Clean data export for analysis and backup
- **PDF Reports** - Print-friendly transaction reports and summaries
- **Date Range Exports** - Export specific time periods for detailed analysis

### 🎨 User Experience

- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes** - Toggle between neutral and violet themes
- **Color-Coded Transactions** - Visual distinction for different transaction types
- **Touch-Friendly Interface** - Large buttons and intuitive navigation
- **Professional UI** - Clean, modern design with excellent accessibility

### 🔐 Security & Authentication

- **Secure Authentication** - Laravel Sanctum-powered login and registration
- **Email Verification** - Complete email verification workflow
- **Password Management** - Secure password reset and update functionality
- **Profile Management** - User profile and preferences management

## 🛠️ Technology Stack

### Backend

- **Laravel 12** - Modern PHP framework with robust features
- **Inertia.js** - Seamless SPA experience without API complexity
- **MySQL/PostgreSQL** - Reliable database management
- **Laravel Sanctum** - Lightweight API authentication

### Frontend

- **React 18** - Modern JavaScript library with hooks and context
- **TypeScript** - Type-safe development for better code quality
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Lucide React** - Beautiful, customizable icon library
- **Radix UI** - Accessible UI primitives and components

### Development Tools

- **Vite** - Lightning-fast build tool and development server
- **ESLint** - Code linting and formatting
- **Pest** - Modern PHP testing framework
- **XLSX** - Excel file generation and manipulation

## 🚀 Quick Start

### Prerequisites

- PHP 8.2 or higher
- Composer 2.0+
- Node.js 18 or higher
- npm or yarn
- MySQL 8.0+ or PostgreSQL 13+

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd PersonalAcc
    ```

2. **Install dependencies**

    ```bash
    # Install PHP dependencies
    composer install

    # Install Node.js dependencies
    npm install
    ```

3. **Environment setup**

    ```bash
    # Copy environment file
    cp .env.example .env

    # Generate application key
    php artisan key:generate
    ```

4. **Database configuration**

    ```bash
    # Configure your database in .env file
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=personal_acc
    DB_USERNAME=your_username
    DB_PASSWORD=your_password

    # Run migrations
    php artisan migrate

    # Seed the database (optional)
    php artisan db:seed
    ```

5. **Build assets**

    ```bash
    # Development
    npm run dev

    # Production
    npm run build
    ```

6. **Start the application**
    ```bash
    php artisan serve
    # Visit http://localhost:8000
    ```

## 📖 Usage Guide

### Getting Started

1. **Register** - Create a new account with your email and password
2. **Verify Email** - Complete the email verification process
3. **Set Preferences** - Configure your primary currency and theme
4. **Add Transactions** - Start tracking your financial activities

### Adding Transactions

1. Navigate to the **Transactions** page
2. Click the **"Add Transaction"** button
3. Select transaction type:
    - 💚 **Income** - Money received (salary, freelance, investments)
    - 🔴 **Expense** - Money spent (food, utilities, entertainment)
    - 🔵 **Receivable** - Money owed to you (client payments, loans)
    - 🟠 **Payable** - Money you owe (bills, credit cards, rent)
4. Fill in the required details:
    - **Amount** - Transaction value with proper decimal places
    - **Date** - Transaction date
    - **Description** - Brief description of the transaction
    - **Source** - Where the transaction occurred
    - **Category** - Predefined categories for better organization
    - **Notes** - Optional additional information

### Exporting Data

1. Go to the **Transactions** page
2. Use the **export dropdown** menu
3. Select your preferred format:
    - 📊 **Excel** - Beautiful formatted spreadsheets
    - 📄 **CSV** - Simple data export
    - 🖨️ **PDF** - Print-friendly reports
4. Choose date range if needed
5. Download your file

### Managing Settings

- **Profile** - Update your personal information
- **Password** - Change your account password
- **Appearance** - Switch between themes and customize appearance
- **Currency** - Set your primary and secondary currencies

## 🎨 Design System

### Color Themes

- **Neutral** - Clean, minimal design with gray tones
- **Violet** - Elegant purple theme for enhanced visual appeal

### Transaction Types

- **Income** (Green) - Money received (salary, freelance, investments)
- **Expense** (Red) - Money spent (food, utilities, entertainment)
- **Receivable** (Blue) - Money owed to you (client payments, loans)
- **Payable** (Orange) - Money you owe (bills, credit cards, rent)

### Responsive Design

- **Mobile-First** - Optimized for mobile devices
- **Touch-Friendly** - Large buttons and touch targets
- **Adaptive Layout** - Responsive grid and flexible components

## 🔧 Development

### Project Structure

```
PersonalAcc/
├── app/                    # Laravel application logic
│   ├── Http/              # Controllers and middleware
│   ├── Models/            # Eloquent models
│   └── Providers/         # Service providers
├── resources/
│   ├── js/               # React/TypeScript components
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   └── types/        # TypeScript type definitions
│   └── css/              # Stylesheets
├── routes/               # Application routes
├── database/             # Migrations and seeders
└── tests/               # Test files
```

### Key Components

- **AppLayout** - Main application layout with sidebar and header
- **AddTransactionForm** - Comprehensive transaction form with validation
- **TransactionLedger** - Data table with sorting and filtering
- **ExportFunctions** - Excel, CSV, and PDF export utilities
- **ThemeSystem** - Dark/light theme management

### Available Scripts

```bash
# Development
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
php artisan test     # Run PHP tests

# Code Quality
npm run lint         # Lint JavaScript/TypeScript
npm run format       # Format code
```

## 🚀 Deployment

### Production Build

```bash
# Install dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Configure environment
cp .env.example .env
# Edit .env with production settings

# Run migrations
php artisan migrate --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Server Requirements

- PHP 8.2+
- MySQL 8.0+ or PostgreSQL 13+
- Node.js 18+ (for asset compilation)
- Web server (Apache/Nginx)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use TypeScript for all JavaScript code
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem
4. Provide system information and error logs

## 🎉 Acknowledgments

- **Laravel Team** - For the amazing PHP framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible UI primitives
- **Lucide** - For beautiful, customizable icons
- **Inertia.js** - For seamless SPA experience

---

**Built with ❤️ using modern web technologies**

_Transform your financial management with Personal Account - where simplicity meets sophistication._
