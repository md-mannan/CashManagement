import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    TrendingUp, 
    TrendingDown, 
    CreditCard, 
    BarChart3, 
    Shield, 
    Globe, 
    Bell, 
    Users, 
    Settings, 
    FileText,
    PieChart,
    Calendar,
    DollarSign,
    Wallet,
    ArrowRight,
    CheckCircle,
    Star
} from 'lucide-react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header Navigation */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Cash Management</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('login')}
                                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                            <Link
                                href={route('register')}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                            <Star className="w-4 h-4 mr-2" />
                            Professional Cash Management Solution
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Take Control of Your
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Financial Future</span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            A comprehensive cash management system designed for individuals and businesses to track, analyze, and optimize their financial operations with precision and ease.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                            <Link
                                href={route('features')}
                                className="inline-flex items-center bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                            >
                                Explore Features
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Features Overview */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need for Financial Success
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        From basic transaction tracking to advanced financial analytics, our platform provides all the tools you need to make informed financial decisions.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Transaction Management</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Track income, expenses, receivables, and payables with detailed categorization and smart organization.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Advanced Analytics</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Visualize spending patterns, track trends, and gain insights into your financial health with interactive charts.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                            <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Multi-Currency</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Handle transactions in multiple currencies with real-time exchange rates and automatic conversion.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Enterprise Security</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Bank-level security with encrypted data, secure authentication, and comprehensive audit trails.
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Comprehensive Financial Management
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover the powerful features that make our platform the ultimate choice for financial management.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 mb-16">
                        {/* Left Column */}
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Income & Expense Tracking</h3>
                                    <p className="text-gray-600 mb-3">
                                        Monitor all your financial inflows and outflows with detailed categorization, date tracking, and source identification.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Automatic categorization with smart suggestions
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Recurring transaction detection
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Detailed transaction history and notes
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Receivables & Payables</h3>
                                    <p className="text-gray-600 mb-3">
                                        Manage outstanding payments and debts with due date tracking, settlement features, and payment reminders.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Due date notifications and alerts
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Settlement tracking and history
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Outstanding balance calculations
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <PieChart className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Financial Analytics</h3>
                                    <p className="text-gray-600 mb-3">
                                        Gain deep insights into your financial patterns with interactive charts, trend analysis, and performance metrics.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Monthly and yearly trend analysis
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Category-wise spending breakdown
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Net balance and cash flow tracking
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Bell className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Smart Notifications</h3>
                                    <p className="text-gray-600 mb-3">
                                        Stay informed with intelligent alerts for due payments, budget limits, and important financial events.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Payment due date reminders
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Budget threshold alerts
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Financial milestone notifications
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Multi-User Support</h3>
                                    <p className="text-gray-600 mb-3">
                                        Collaborate with team members, family, or business partners with role-based access and permissions.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Role-based access control
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Activity logging and audit trails
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            User management and permissions
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Settings className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Customization & Settings</h3>
                                    <p className="text-gray-600 mb-3">
                                        Personalize your experience with customizable categories, themes, currency preferences, and appearance settings.
                                    </p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Custom categories and tags
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Dark/light theme options
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Currency and exchange rate settings
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Experience the difference with our comprehensive, secure, and user-friendly financial management solution.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Bank-Level Security</h3>
                            <p className="text-blue-100">
                                Your financial data is protected with enterprise-grade encryption, secure authentication, and comprehensive audit trails.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Real-Time Insights</h3>
                            <p className="text-blue-100">
                                Get instant access to your financial health with real-time analytics, charts, and performance metrics.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Always Available</h3>
                            <p className="text-blue-100">
                                Access your financial data 24/7 from any device with our responsive, cloud-based platform.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Ready to Transform Your Financial Management?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of users who have already taken control of their finances with our comprehensive cash management system.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href={route('register')}
                            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Start Your Free Trial
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                        <Link
                            href={route('login')}
                            className="inline-flex items-center bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                        >
                            Sign In to Account
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500 mt-6">
                        No credit card required • Free trial • Cancel anytime
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 py-4">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center text-gray-600">
                        {/* Author Information */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">
                                Developed with ❤️ by
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Mohammad Abdul Mannan</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a 
                                        href="mailto:mdmdnnan580@outlook.com" 
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        mdmdnnan580@outlook.com
                                    </a>
                                    <a 
                                        href="https://github.com/md-mannan" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-gray-700 hover:text-gray-900 hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                        </svg>
                                        GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
