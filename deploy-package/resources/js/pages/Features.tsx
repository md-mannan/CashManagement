import React from 'react';
import { Link } from '@inertiajs/react';

export default function Features() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Powerful Features for Financial Management
                    </h1>
                    <p className="text-xl text-gray-600">
                        Everything you need to take control of your finances
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-3xl mb-4">💳</div>
                        <h3 className="text-lg font-semibold mb-2">Transaction Management</h3>
                        <p className="text-gray-600">Track income, expenses, receivables, and payables with detailed categorization</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-3xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold mb-2">Financial Analytics</h3>
                        <p className="text-gray-600">Visualize your spending patterns and financial health with interactive charts</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-3xl mb-4">🏷️</div>
                        <h3 className="text-lg font-semibold mb-2">Smart Categorization</h3>
                        <p className="text-gray-600">Organize transactions with customizable categories and tags</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-3xl mb-4">🌍</div>
                        <h3 className="text-lg font-semibold mb-2">Multi-Currency Support</h3>
                        <p className="text-gray-600">Handle transactions in different currencies with real-time exchange rates</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-3xl mb-4">🔔</div>
                        <h3 className="text-lg font-semibold mb-2">Smart Notifications</h3>
                        <p className="text-gray-600">Get alerts for due payments, budget limits, and important financial events</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-3xl mb-4">📱</div>
                        <h3 className="text-lg font-semibold mb-2">Responsive Design</h3>
                        <p className="text-gray-600">Access your finances from any device with our mobile-friendly interface</p>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href={route('welcome')}
                        className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>

                {/* Author Information */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">
                            Developed with ❤️ by
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Mohammad Abdul Mannan</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <a 
                                    href="mailto:mdmdnnan580@outlook.com" 
                                    className="text-green-600 hover:text-green-800 hover:underline flex items-center gap-1"
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
    );
}
