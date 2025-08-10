# Cash Management System

A comprehensive cash management application built with Laravel, React, and Inertia.js, featuring robust user management, transaction tracking, and real-time notifications.

## 🚀 Features

### Core Functionality

- **User Management**: Multi-role system (User, Admin, Super Admin)
- **Transaction Management**: Create, read, update, delete transactions
- **Category Management**: Organize transactions by type and category
- **Ledger View**: Comprehensive financial overview with filtering
- **Multi-Currency Support**: USD, EUR, KWD, BDT, AED, SAR, QAR, BHD, OMR, JOD, LBP, EGP
- **Exchange Rate Integration**: Real-time currency conversion

### Admin Features

- **Admin Dashboard**: Comprehensive overview of system metrics
- **User Management**: Manage user accounts, roles, and permissions
- **System Health Monitoring**: Database, cache, storage, and performance metrics
- **Activity Logs**: Track all system activities and user actions
- **System Audit**: Monitor user activities and system changes
- **Backup & Restore**: Database backup and restoration capabilities
- **Role & Permission Management**: Granular control over user access

### Notification System

- **Bidirectional Notifications**:
    - User-facing: Role changes, account status, password resets
    - Admin-facing: User activities, transaction CRUD, category CRUD
- **Real-time Alerts**: Instant notification delivery
- **Notification Types**: Success, warning, error, info, and custom types
- **Icon Support**: Visual indicators for different notification types

### Security Features

- **Authentication**: Laravel Breeze with social login support
- **Role-based Access Control**: Granular permissions system
- **CSRF Protection**: Built-in security measures
- **Session Management**: Secure user sessions
- **Audit Logging**: Comprehensive activity tracking

## 🛠️ Technology Stack

### Backend

- **Laravel 12**: PHP framework for robust backend development
- **MySQL/MariaDB**: Primary database
- **Eloquent ORM**: Database interaction and relationships
- **Laravel Breeze**: Authentication scaffolding

### Frontend

- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript development
- **Inertia.js**: Seamless SPA experience
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Beautiful, accessible component library
- **Lucide Icons**: Consistent icon system

### Development Tools

- **Vite**: Fast build tool and dev server
- **ESLint**: Code quality and consistency
- **PHPUnit**: Testing framework
- **Artisan**: Laravel command-line interface

## 📋 Prerequisites

- PHP 8.2 or higher
- Composer 2.0 or higher
- Node.js 18 or higher
- MySQL 8.0 or MariaDB 10.4 or higher
- Git

## 🚀 Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd CashManagement
    ```

2. **Install PHP dependencies**

    ```bash
    composer install
    ```

3. **Install Node.js dependencies**

    ```bash
    npm install
    ```

4. **Environment setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

5. **Database configuration**

    ```bash
    # Update .env with your database credentials
    php artisan migrate
    php artisan db:seed
    ```

6. **Build frontend assets**

    ```bash
    npm run build
    ```

7. **Start the development server**
    ```bash
    php artisan serve
    ```

## 🔑 Default Accounts

### Super Admin

- **Email**: admin@cashmanagement.com
- **Password**: admin123
- **Role**: super_admin

### Admin

- **Email**: admin@example.com
- **Password**: password
- **Role**: admin

## 📱 Usage

### User Panel

1. **Dashboard**: Overview of financial status
2. **Ledger**: View all transactions with filtering
3. **Transactions**: Create and manage transactions
4. **Categories**: Organize transaction categories
5. **Settings**: Personal preferences and appearance

### Admin Panel

1. **Dashboard**: System overview and metrics
2. **User Management**: Manage user accounts
3. **System Health**: Monitor system performance
4. **Activity Logs**: Track user activities
5. **System Audit**: Comprehensive audit trail
6. **Backup & Restore**: Database management
7. **Notifications**: View all system notifications

## 🔧 Configuration

### Environment Variables

- `DB_CONNECTION`: Database connection type
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_DATABASE`: Database name
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

### Exchange Rate API

- Configure your preferred exchange rate API in the `.env` file
- Update API keys and endpoints as needed

## 📊 Database Schema

### Core Tables

- `users`: User accounts and authentication
- `transactions`: Financial transaction records
- `categories`: Transaction categorization
- `notifications`: System and user notifications
- `activity_logs`: System activity tracking
- `exchange_rates`: Currency conversion rates

### Relationships

- Users have many transactions
- Categories have many transactions
- Users have many notifications
- Activity logs track user actions

## 🧪 Testing

Run the test suite:

```bash
php artisan test
```

Run specific test files:

```bash
php artisan test --filter=TransactionTest
```

## 📝 API Endpoints

### Authentication

- `POST /login`: User authentication
- `POST /logout`: User logout
- `POST /register`: User registration

### Transactions

- `GET /transactions`: List transactions
- `POST /transactions`: Create transaction
- `PUT /transactions/{id}`: Update transaction
- `DELETE /transactions/{id}`: Delete transaction

### Admin

- `GET /admin/dashboard`: Admin dashboard
- `GET /admin/users`: User management
- `GET /admin/notifications`: System notifications
- `GET /admin/system-health`: System health check

## 🔒 Security

- **CSRF Protection**: All forms include CSRF tokens
- **Authentication Middleware**: Route protection
- **Role-based Access**: Admin and Super Admin restrictions
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Eloquent ORM protection

## 📈 Performance

- **Database Indexing**: Optimized queries
- **Caching**: Database and application caching
- **Asset Optimization**: Minified CSS/JS in production
- **Lazy Loading**: Efficient data loading

## 🚧 Incomplete Items

### Frontend Issues

- [ ] Fix sidebar active state conflicts for admin routes
- [ ] Complete system health page data display
- [ ] Implement file upload for backup restore functionality
- [ ] Resolve linter errors in app-sidebar.tsx

### Backend Issues

- [ ] Optimize notification query performance
- [ ] Add rate limiting for API endpoints
- [ ] Implement notification cleanup for old records
- [ ] Add comprehensive error logging

### Testing

- [ ] Complete unit test coverage
- [ ] Add integration tests for notification system
- [ ] Performance testing for large datasets
- [ ] Security testing and vulnerability assessment

### Documentation

- [ ] API documentation with examples
- [ ] User manual and tutorials
- [ ] Deployment guide
- [ ] Troubleshooting guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## 🔄 Changelog

### Version 1.0.0 (Current)

- Initial release with core functionality
- User management system
- Transaction management
- Notification system
- Admin dashboard
- Multi-currency support

## 🎯 Roadmap

### Short Term (Next 2 weeks)

- Fix remaining UI/UX issues
- Complete testing coverage
- Performance optimization
- Documentation completion

### Medium Term (Next 2 months)

- Mobile app development
- Advanced reporting features
- Integration with banking APIs
- Multi-tenant support

### Long Term (Next 6 months)

- AI-powered insights
- Advanced analytics dashboard
- Mobile-first redesign
- Enterprise features
