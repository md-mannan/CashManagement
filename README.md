# Cash Management System

A comprehensive personal finance management system built with Laravel 12, React 18, TypeScript, and Inertia.js. Features dual currency support, real-time exchange rates, interactive charts, and beautiful modern UI components with exact amount preservation.

## 🚀 Features

### 💰 Dual Currency System

- **Multi-Currency Support**: Handle transactions in multiple currencies (USD, EUR, KWD, BDT, AED, SAR, QAR, BHD, OMR, JOD, LBP, EGP)
- **Real-Time Exchange Rates**: Automatic fetching of live exchange rates with fallback mechanisms
- **Bidirectional Conversion**: Convert between primary and secondary currencies seamlessly
- **Smart Decimal Handling**: KWD displays 3 decimal places, all others display 2 decimal places
- **Currency Settings**: User-configurable primary and secondary currency preferences

### 📊 Transaction Management

- **Complete CRUD Operations**: Create, read, update, and delete transactions with instant feedback
- **Multiple Transaction Types**: Income, Expense, Receivable, and Payable
- **Dual Currency Recording**: Store both primary and secondary amounts with exchange rates
- **Advanced Filtering**: Filter transactions by type, date range, and search terms including transaction types
- **Export Functionality**: Export to Excel, PDF, or print directly
- **Animated Confirmations**: Beautiful confirmation modals for edit and delete actions
- **Toast Notifications**: Centered success/error messages with sound effects for all operations
- **Auto-redirect**: Automatic return to transaction list after save/update operations
- **Precise Amount Handling**: Exact amount preservation without floating-point conversion errors

### 📈 Dashboard & Analytics

- **Interactive Charts**: Bar and pie charts with Chart.js integration and smooth animations
- **Multiple Time Periods**: Monthly, yearly analytics with 6-month and 5-year trends
- **Modern Donut Charts**: Clean donut-style pie charts with proper color coding
- **Organized Chart Layout**: Bar charts in one row, pie charts in another for better visual organization
- **Exact Amount Display**: Shows original entered amounts instead of re-converted values
- **Real-Time Updates**: Dynamic currency display based on user settings with accurate exchange rates
- **Responsive Design**: Mobile-friendly dashboard layout with progressive enhancement
- **Financial Summary Cards**: Net balance, income, expenses, receivables, and payables with month-over-month changes

### ⚙️ Settings & Configuration

- **Currency Management**: Set primary and secondary currencies
- **Exchange Rate Configuration**: Manual and automatic rate updates
- **User Preferences**: Customizable currency symbols and formats
- **Profile Management**: User profile and password settings
- **Appearance Settings**: Theme and appearance customization
- **Remember Me**: Secure login persistence with proper token management
- **Auto-Login Redirect**: Automatic dashboard redirect after successful authentication

## 🛠️ Tech Stack

### Backend

- **Laravel 12**: Latest PHP framework for robust backend API
- **MySQL**: Database for data persistence
- **Eloquent ORM**: Database relationships and queries
- **Laravel Sanctum**: API authentication
- **Inertia.js**: Server-side rendering with SPA experience

### Frontend

- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Beautiful and accessible UI components
- **Chart.js**: Interactive data visualization
- **React Chart.js 2**: React wrapper for Chart.js
- **Lucide React**: Beautiful icon library

### Development Tools

- **Vite**: Fast build tool and development server
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **PHPUnit**: PHP testing framework
- **Pest**: Elegant PHP testing framework

## 📦 Installation

### Prerequisites

- PHP 8.2 or higher
- Node.js 18 or higher
- Composer
- MySQL 8.0 or higher

### Setup Instructions

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd PersonalAcc
    ```

2. **Install PHP dependencies**

    ```bash
    composer install
    ```

3. **Install Node.js dependencies**

    ```bash
    npm install
    ```

4. **Environment Configuration**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

5. **Database Setup**

    ```bash
    # Configure database credentials in .env
    php artisan migrate
    php artisan db:seed
    ```

6. **Build Assets**

    ```bash
    npm run build
    # or for development
    npm run dev
    ```

7. **Start the Application**
    ```bash
    php artisan serve
    ```

## 🎯 Usage

### Getting Started

1. **Register/Login**: Create an account or login to access the system
2. **Configure Currency**: Go to Settings > Currency to set your preferred currencies
3. **Add Transactions**: Start adding your income, expenses, receivables, and payables
4. **View Analytics**: Check the dashboard for insights into your financial data

### Currency Configuration

1. Navigate to **Settings > Currency**
2. Select your **Primary Currency** (main accounting currency)
3. Choose a **Secondary Currency** (for dual currency transactions)
4. Set the **Exchange Rate** or let the system fetch it automatically
5. Preview how amounts will be displayed

### Adding Transactions

1. Click **Add Transaction** from the navigation or dashboard
2. Select transaction type (Income/Expense/Receivable/Payable)
3. Enter the amount in either primary or secondary currency
4. The system will automatically convert and show both amounts
5. Add description, source, category, and notes
6. Save the transaction

### Managing Transactions

- **View**: Click the eye icon to see detailed transaction information
- **Edit**: Click the edit icon to modify transaction details
- **Delete**: Click the delete icon and confirm to remove transactions
- **Filter**: Use the filter options to find specific transactions
- **Export**: Export your data in Excel, PDF, or print format

## 🔔 Toast Notification System

### Features

- **Centered Display**: Notifications appear in the center of the screen for maximum visibility
- **Sound Effects**: Different audio tones for each notification type:
    - **Success**: Pleasant chord progression (C5, E5, G5)
    - **Error**: Warning tones (A3, G3)
    - **Warning**: Alert tones (A4, C5)
    - **Info**: Simple notification tone (C5)
- **Auto-dismiss**: Notifications automatically fade out after 3 seconds
- **Manual Close**: Users can close notifications manually with the X button
- **Smooth Animations**: Fade in/out with scale and translate effects
- **Color-coded**: Each notification type has distinct visual styling

### Notification Types

- ✅ **Success**: Transaction saved, updated, or deleted successfully
- ❌ **Error**: Operation failed with helpful error messages
- ⚠️ **Warning**: Important alerts and warnings
- ℹ️ **Info**: General information and tips

## 🔧 Configuration

### Currency Settings

Configure supported currencies in the currency settings page:

- **Primary Currency**: Your main accounting currency
- **Secondary Currency**: Alternative currency for transactions
- **Exchange Rate**: Manual or automatic rate fetching
- **Decimal Places**: Automatic formatting (KWD: 3, Others: 2)

### Exchange Rate Service

The system includes a built-in exchange rate service with:

- **Hardcoded Rate Matrix**: Reliable fallback rates
- **Real-Time Fetching**: Live rates from external APIs
- **Caching Mechanism**: Efficient rate storage and retrieval
- **Error Handling**: Graceful fallback when APIs are unavailable

## 🎨 UI Components

### Custom Components

- **Beautiful Modals**: Animated confirmation dialogs with smooth transitions
- **Currency Inputs**: Smart currency input fields with proper formatting and conversion
- **Interactive Charts**: Responsive charts with animations and hover effects
- **Form Components**: Accessible and user-friendly forms with real-time validation
- **Navigation**: Intuitive sidebar and breadcrumb navigation
- **Toast System**: Centered notification system with sound effects and auto-dismiss
- **Loading States**: Facebook-style skeleton loaders during form initialization
- **Dynamic Selects**: Smart dropdowns that handle category creation and currency selection
- **Amount Preview**: Real-time currency conversion preview with exact amounts

### Design System

- **Consistent Styling**: Unified design language throughout
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **Dark Mode Ready**: Theme system for appearance customization

## 📱 Mobile Support

The application is fully responsive and optimized for:

- **Mobile Phones**: Touch-friendly interface
- **Tablets**: Optimized layout for medium screens
- **Desktop**: Full-featured experience

## 🔐 Security

- **Authentication**: Secure user authentication system
- **Authorization**: Role-based access control
- **Data Validation**: Server and client-side validation
- **CSRF Protection**: Cross-site request forgery protection
- **SQL Injection Prevention**: Parameterized queries with Eloquent

## 🧪 Testing

### Running Tests

```bash
# PHP Tests
php artisan test
# or with Pest
./vendor/bin/pest

# Frontend Tests (if configured)
npm test
```

### Test Coverage

- **Feature Tests**: End-to-end functionality testing
- **Unit Tests**: Individual component testing
- **Browser Tests**: UI interaction testing

## 📈 Performance

### Optimization Features

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Efficient data caching strategies
- **Database Indexing**: Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- [Laravel](https://laravel.com/) - The PHP framework
- [React](https://reactjs.org/) - UI library
- [Inertia.js](https://inertiajs.com/) - Modern monolith approach
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Chart.js](https://www.chartjs.org/) - Data visualization

## 🆕 Latest Updates

### Version 2.0 Features

- ✅ **Laravel 12 Upgrade**: Latest framework with enhanced performance
- ✅ **Exact Amount Display**: Shows original entered amounts instead of re-converted values
- ✅ **Chart Layout Reorganization**: Bar charts and pie charts in separate rows
- ✅ **Modern Donut Charts**: Clean donut-style pie charts with dynamic color mapping
- ✅ **Facebook-Style Skeleton Loaders**: Improved loading experience
- ✅ **Remember Me Functionality**: Secure login persistence
- ✅ **Auto Dashboard Redirect**: Streamlined login flow
- ✅ **Hardcoded Data Removal**: Clean codebase with real data only
- ✅ **Third Currency Removal**: Simplified to dual currency system
- ✅ **Enhanced Toast System**: Better notifications with sound effects
- ✅ **Transaction Search Improvements**: Partial match support for transaction types

## 📊 Project Stats

- **Laravel Version**: 12.21.0 (Latest)
- **Languages**: PHP 8.2+, TypeScript, JavaScript
- **Framework**: Laravel 12 + React 18
- **Database**: MySQL 8.0+
- **UI Components**: 60+ custom components
- **Features**: 20+ major features
- **Currency Support**: 12 currencies with real-time rates
- **Chart Types**: Bar charts, donut charts with animations
- **Tests**: Comprehensive test suite with Pest

## 🚀 Performance Metrics

- **Page Load Time**: < 2 seconds
- **Chart Rendering**: < 500ms with animations
- **Currency Conversion**: Real-time with caching
- **Database Queries**: Optimized with Eloquent relationships
- **Bundle Size**: Optimized with code splitting

---

**Built with ❤️ using Laravel 12 & React 18**
