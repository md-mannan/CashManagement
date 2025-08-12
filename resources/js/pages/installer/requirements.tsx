import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface RequirementsProps {
    requirements: {
        php: {
            name: string;
            required: string;
            current: string;
            status: boolean;
        };
        extensions: {
            [key: string]: {
                name: string;
                required: string;
                current: string;
                status: boolean;
            };
        };
        directories: {
            [key: string]: {
                name: string;
                required: string;
                current: string;
                status: boolean;
            };
        };
        all_passed: boolean;
    };
}

export default function InstallerRequirements({ requirements }: RequirementsProps) {
    const getStatusIcon = (status: boolean) => {
        if (status) {
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        }
        return <XCircle className="h-5 w-5 text-red-600" />;
    };

    const getStatusBadge = (status: boolean) => {
        if (status) {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    Passed
                </Badge>
            );
        }
        return <Badge variant="destructive">Failed</Badge>;
    };

    return (
        <>
            <Head title="System Requirements - Cash Management Installer" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">System Requirements Check</h1>
                        <p className="text-lg text-gray-600">Let's verify that your server meets all the requirements for Cash Management</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8 flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">1</div>
                            <div className="h-1 w-16 bg-green-600"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</div>
                            <div className="h-1 w-16 bg-gray-300"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-500">3</div>
                            <div className="h-1 w-16 bg-gray-300"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-500">4</div>
                        </div>
                    </div>

                    {/* Overall Status */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {requirements.all_passed ? (
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                ) : (
                                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                )}
                                Overall Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {requirements.all_passed ? (
                                <div className="text-center">
                                    <p className="mb-2 text-lg font-medium text-green-600">All requirements are met! 🎉</p>
                                    <p className="text-gray-600">Your server is ready for installation. You can proceed to the next step.</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="mb-2 text-lg font-medium text-yellow-600">Some requirements are not met ⚠️</p>
                                    <p className="text-gray-600">Please fix the issues below before proceeding with installation.</p>
                                    <div className="mt-4">
                                        <Link href="/install/requirements-error">
                                            <Button variant="destructive" className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                View Detailed Error Report
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* PHP Version */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>PHP Version</span>
                                {getStatusBadge(requirements.php.status)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">Required: {requirements.php.required}</p>
                                    <p className="text-sm text-gray-600">Current: {requirements.php.current}</p>
                                </div>
                                {getStatusIcon(requirements.php.status)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* PHP Extensions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span>PHP Extensions</span>
                                <span className="text-sm font-normal text-gray-500">({Object.keys(requirements.extensions).length} required)</span>
                            </CardTitle>
                            <CardDescription>
                                Required PHP extensions for the application to function properly. All extensions must be enabled.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {Object.entries(requirements.extensions).map(([key, extension]) => (
                                    <div
                                        key={key}
                                        className={`flex items-center justify-between rounded-lg border p-3 ${
                                            extension.status ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-medium">{extension.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Required: {extension.required} | Current: {extension.current}
                                            </p>
                                        </div>
                                        {getStatusIcon(extension.status)}
                                    </div>
                                ))}
                            </div>
                            {Object.values(requirements.extensions).some((ext) => !ext.status) && (
                                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> Some PHP extensions are missing. Please enable them in your PHP configuration before
                                        proceeding.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Directory Permissions */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Directory Permissions</CardTitle>
                            <CardDescription>These directories must be writable for the application to function</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(requirements.directories).map(([key, directory]) => (
                                    <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="font-medium">{directory.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Required: {directory.required} | Current: {directory.current}
                                            </p>
                                        </div>
                                        {getStatusIcon(directory.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <Link href="/install">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>

                        {requirements.all_passed ? (
                            <Link href="/install/database">
                                <Button className="flex items-center gap-2">
                                    Continue
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Button disabled className="flex items-center gap-2">
                                Fix Requirements First
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Help Section */}
                    {!requirements.all_passed && (
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    Need Help?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600">If you're having trouble meeting the requirements:</p>
                                    <ul className="ml-4 space-y-1 text-sm text-gray-600">
                                        <li>• Contact your hosting provider to enable required PHP extensions</li>
                                        <li>• For XAMPP: Enable extensions in php.ini file</li>
                                        <li>• For cPanel: Use PHP Selector to enable extensions</li>
                                        <li>• Ensure directory permissions are set to 755 or 775</li>
                                        <li>• Upgrade PHP to version 8.2 or higher</li>
                                        <li>• Check your server's error logs for more details</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
