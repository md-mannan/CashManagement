import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, CheckCircle, CreditCard, Database, Settings, Shield, Users, Zap } from 'lucide-react';

export default function InstallerWelcome() {
    return (
        <>
            <Head title="Welcome - Cash Management Installer" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                                <CreditCard className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">Welcome to Cash Management</h1>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            A powerful and intuitive application for managing your personal and business finances. Track income, expenses, manage
                            budgets, and gain insights into your financial health.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <CreditCard className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle className="text-lg">Transaction Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">Track income, expenses, receivables, and payables with ease</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg">Analytics & Reports</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">Powerful insights and visualizations of your financial data</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle className="text-lg">Multi-User Support</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">Role-based access control for teams and organizations</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader className="pb-3">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                    <Settings className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-lg">Customizable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">Flexible categories, currencies, and personalization options</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Requirements */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                System Requirements
                            </CardTitle>
                            <CardDescription>Make sure your server meets the following requirements before proceeding</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">PHP 8.1 or higher</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">MySQL 5.7 or higher</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm">Required PHP extensions</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Installation Steps */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Installation Process</CardTitle>
                            <CardDescription>The installation will guide you through the following steps</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-medium">System Requirements Check</h4>
                                        <p className="text-sm text-gray-600">Verify your server meets all requirements</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Database Configuration</h4>
                                        <p className="text-sm text-gray-600">Set up your database connection</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Application Setup</h4>
                                        <p className="text-sm text-gray-600">Configure app settings and create admin user</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
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
                                <CheckCircle className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <p className="mt-3 text-sm text-gray-500">By continuing, you agree to our terms of service and privacy policy</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-sm text-gray-500">
                        <p>Cash Management v1.0.0 • Built with Laravel & React</p>
                        <p className="mt-1">© 2024 Cash Management. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
