import React from 'react';
import { Link } from '@inertiajs/react';

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        About Cash Management System
                    </h1>
                    <p className="text-xl text-gray-600">
                        Built with modern technologies for secure and efficient financial management
                    </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Mission</h2>
                    <p className="text-gray-600 mb-4">
                        We believe that everyone deserves access to powerful, yet simple financial management tools. 
                        Our system is designed to help individuals and businesses take control of their finances 
                        through intuitive interfaces and comprehensive features.
                    </p>
                    <p className="text-gray-600">
                        Whether you're tracking personal expenses, managing business cash flow, or planning for the future, 
                        our platform provides the tools you need to make informed financial decisions.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Technology Stack</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Backend</h3>
                            <ul className="text-gray-600 space-y-1">
                                <li>• Laravel 11 (PHP Framework)</li>
                                <li>• MySQL Database</li>
                                <li>• RESTful API Architecture</li>
                                <li>• Secure Authentication System</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Frontend</h3>
                            <ul className="text-gray-600 space-y-1">
                                <li>• React 18 with TypeScript</li>
                                <li>• Inertia.js for SPA Experience</li>
                                <li>• Tailwind CSS for Styling</li>
                                <li>• Responsive Design</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Security Features</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl mb-2">🔐</div>
                            <h4 className="font-semibold text-gray-700">Encryption</h4>
                            <p className="text-sm text-gray-600">All data is encrypted in transit and at rest</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-2">🛡️</div>
                            <h4 className="font-semibold text-gray-700">Authentication</h4>
                            <p className="text-sm text-gray-600">Multi-factor authentication support</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-2">📊</div>
                            <h4 className="font-semibold text-gray-700">Audit Logs</h4>
                            <p className="text-sm text-gray-600">Complete activity tracking and monitoring</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href={route('welcome')}
                        className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
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
                                    className="text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
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
