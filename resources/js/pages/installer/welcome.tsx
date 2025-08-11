import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, BarChart3, CheckCircle, CreditCard, Database, Settings, Shield, Users, Zap } from 'lucide-react';

interface InstallerWelcomeProps {
    installationStatus: {
        is_installed: boolean;
        database_connected: boolean;
        migrations_run: boolean;
        admin_user_exists: boolean;
        can_proceed: boolean;
    };
    defaultConfig: any;
}

export default function InstallerWelcome({ installationStatus, defaultConfig }: InstallerWelcomeProps) {
    const canInstall = installationStatus.can_proceed && !installationStatus.is_installed;

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

                    {/* Installation Status */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {installationStatus.is_installed ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                )}
                                Installation Status
                            </CardTitle>
                            <CardDescription>
                                {installationStatus.is_installed
                                    ? 'Your application is already installed and ready to use!'
                                    : 'Check the status of your installation requirements'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    <span className="text-sm">Database Connection</span>
                                    <span
                                        className={`ml-auto rounded px-2 py-1 text-xs ${
                                            installationStatus.database_connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {installationStatus.database_connected ? 'Connected' : 'Not Connected'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    <span className="text-sm">Migrations</span>
                                    <span
                                        className={`ml-auto rounded px-2 py-1 text-xs ${
                                            installationStatus.migrations_run ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {installationStatus.migrations_run ? 'Complete' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm">Admin User</span>
                                    <span
                                        className={`ml-auto rounded px-2 py-1 text-xs ${
                                            installationStatus.admin_user_exists ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {installationStatus.admin_user_exists ? 'Exists' : 'Not Created'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm">Overall Status</span>
                                    <span
                                        className={`ml-auto rounded px-2 py-1 text-xs ${
                                            installationStatus.is_installed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                        }`}
                                    >
                                        {installationStatus.is_installed ? 'Installed' : 'Ready to Install'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                    <span className="text-sm">SQLite (recommended) or MySQL</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm">Required PHP extensions</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        {installationStatus.is_installed ? (
                            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                                <Link href="/">Go to Application</Link>
                            </Button>
                        ) : canInstall ? (
                            <Button asChild size="lg">
                                <Link href="/install/requirements">Start Installation</Link>
                            </Button>
                        ) : (
                            <Button asChild size="lg" variant="outline" disabled>
                                <span>Check Database Connection First</span>
                            </Button>
                        )}

                        {!installationStatus.is_installed && (
                            <Button asChild size="lg" variant="outline">
                                <Link href="/install/database">Configure Database</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
