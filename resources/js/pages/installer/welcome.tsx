import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Database, Shield, Zap, BarChart3, CreditCard, Users, Settings } from 'lucide-react';

export default function InstallerWelcome() {
    return (
        <>
            <Head title="Welcome - Cash Management Installer" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                <CreditCard className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome to Cash Management
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            A powerful and intuitive application for managing your personal and business finances.
                            Track income, expenses, manage budgets, and gain insights into your financial health.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CreditCard className="w-6 h-6 text-green-600" />
                                </div>
                                <CardTitle className="text-lg">Transaction Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Track income, expenses, receivables, and payables with ease
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </CardHeader>
                                <CardTitle className="text-lg">Analytics & Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Powerful insights and visualizations of your financial data
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </CardHeader>
                                <CardTitle className="text-lg">Multi-User Support</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Role-based access control for teams and organizations
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Settings className="w-6 h-6 text-orange-600" />
                                </CardHeader>
                                <CardTitle className="text-lg">Customizable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Flexible categories, currencies, and personalization options
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Requirements */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                System Requirements
                            </CardTitle>
                            <CardDescription>
                                Make sure your server meets the following requirements before proceeding
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm">PHP 8.1 or higher</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-green-600" />
                                    <span className="text-sm">MySQL 5.7 or higher</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm">Required PHP extensions</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Installation Steps */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Installation Process</CardTitle>
                            <CardDescription>
                                The installation will guide you through the following steps
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-medium">System Requirements Check</h4>
                                        <p className="text-sm text-gray-600">Verify your server meets all requirements</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Database Configuration</h4>
                                        <p className="text-sm text-gray-600">Set up your database connection</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Application Setup</h4>
                                        <p className="text-sm text-gray-600">Configure app settings and create admin user</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        4
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Installation Complete</h4>
                                        <p className="text-sm text-gray-600">Start using your Cash Management application</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="text-center">
                        <Link href="/install/requirements">
                            <Button size="lg" className="px-8">
                                Get Started
                                <CheckCircle className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <p className="text-sm text-gray-500 mt-3">
                            By continuing, you agree to our terms of service and privacy policy
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-12 text-sm text-gray-500">
                        <p>Cash Management v1.0.0 • Built with Laravel & React</p>
                        <p className="mt-1">© 2024 Cash Management. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
