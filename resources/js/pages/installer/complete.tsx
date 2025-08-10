import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, CheckCircle, Database, ExternalLink, Settings, Shield, Users } from 'lucide-react';

export default function InstallerComplete() {
    return (
        <>
            <Head title="Installation Complete - Cash Management" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
                <div className="w-full max-w-4xl">
                    {/* Success Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
                                <CheckCircle className="h-10 w-10 text-white" />
                            </div>
                        </div>
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">Installation Complete! 🎉</h1>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Congratulations! Your Cash Management application has been successfully installed and configured. You can now start
                            managing your finances with a powerful and intuitive system.
                        </p>
                    </div>

                    {/* Success Summary */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-green-700">What Was Installed</CardTitle>
                            <CardDescription>Your application has been configured with the following features</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                                    <Shield className="h-5 w-5 text-green-600" />
                                    <div>
                                        <h4 className="font-medium text-green-800">Admin Account</h4>
                                        <p className="text-sm text-green-600">Super admin user created</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                                    <Database className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <h4 className="font-medium text-blue-800">Database</h4>
                                        <p className="text-sm text-blue-600">All tables and data created</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
                                    <Settings className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <h4 className="font-medium text-purple-800">Configuration</h4>
                                        <p className="text-sm text-purple-600">App settings configured</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3">
                                    <BarChart3 className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <h4 className="font-medium text-orange-800">Sample Data</h4>
                                        <p className="text-sm text-orange-600">Categories and sample data</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Next Steps</CardTitle>
                            <CardDescription>Here's what you should do next to get started</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Login to Your Account</h4>
                                        <p className="text-sm text-gray-600">Use the admin credentials you created during installation</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Explore the Dashboard</h4>
                                        <p className="text-sm text-gray-600">Familiarize yourself with the admin dashboard and features</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Create User Accounts</h4>
                                        <p className="text-sm text-gray-600">Add team members and set appropriate roles</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                        4
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Start Managing Finances</h4>
                                        <p className="text-sm text-gray-600">Begin adding transactions and categories</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Get started immediately with these quick actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Link href="/login">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Go to Login
                                    </Button>
                                </Link>
                                <Link href="/admin/dashboard">
                                    <Button className="w-full bg-green-600 hover:bg-green-700">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Admin Dashboard
                                    </Button>
                                </Link>
                                <Link href="/admin/users">
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Users
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documentation & Support */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Documentation & Support</CardTitle>
                            <CardDescription>Learn more about your new Cash Management system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <h4 className="mb-2 font-medium text-blue-800">User Guide</h4>
                                    <p className="mb-3 text-sm text-blue-600">Learn how to use all the features of your Cash Management system</p>
                                    <Button variant="outline" size="sm" className="border-blue-600 text-blue-600">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Guide
                                    </Button>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4">
                                    <h4 className="mb-2 font-medium text-green-800">Admin Manual</h4>
                                    <p className="mb-3 text-sm text-green-600">Comprehensive guide for administrators and system management</p>
                                    <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Manual
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Reminder */}
                    <Card className="mb-8 border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="text-orange-800">Security Reminder</CardTitle>
                            <CardDescription className="text-orange-700">Important security considerations for your new installation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm text-orange-700">
                                <div className="flex items-start gap-2">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                                    <p>Change the default admin password after your first login</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                                    <p>Set up SSL/HTTPS for production environments</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                                    <p>Regularly backup your database and application files</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500"></div>
                                    <p>Keep your application and dependencies updated</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="text-center">
                        <Link href="/login">
                            <Button size="lg" className="bg-green-600 px-8 hover:bg-green-700">
                                Start Using Your Application
                                <CheckCircle className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <p className="mt-3 text-sm text-gray-500">You can now access your Cash Management application</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-sm text-gray-500">
                        <p>Cash Management v1.0.0 • Installation Complete</p>
                        <p className="mt-1">Thank you for choosing Cash Management!</p>
                    </div>
                </div>
            </div>
        </>
    );
}
