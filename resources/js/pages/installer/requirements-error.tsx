import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, RefreshCw, XCircle } from 'lucide-react';

interface RequirementsErrorProps {
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

export default function RequirementsError({ requirements }: RequirementsErrorProps) {
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

    const getFailedRequirements = () => {
        const failed = [];

        if (!requirements.php.status) {
            failed.push({
                type: 'PHP Version',
                name: requirements.php.name,
                required: requirements.php.required,
                current: requirements.php.current,
                solution: 'Upgrade PHP to version ' + requirements.php.required + ' or higher',
            });
        }

        Object.entries(requirements.extensions).forEach(([key, ext]) => {
            if (!ext.status) {
                failed.push({
                    type: 'PHP Extension',
                    name: ext.name,
                    required: ext.required,
                    current: ext.current,
                    solution: 'Install and enable the ' + ext.name + ' PHP extension',
                });
            }
        });

        Object.entries(requirements.directories).forEach(([key, dir]) => {
            if (!dir.status) {
                failed.push({
                    type: 'Directory Permission',
                    name: dir.name,
                    required: dir.required,
                    current: dir.current,
                    solution: 'Set write permissions (755 or 775) on the ' + dir.name + ' directory',
                });
            }
        });

        return failed;
    };

    const handleRetry = () => {
        window.location.reload();
    };

    const getSpecificSolutions = () => {
        const solutions = [];

        if (!requirements.php.status) {
            solutions.push(
                'Contact your hosting provider to upgrade PHP version',
                'Use a local development environment with the required PHP version',
                'Check if your hosting plan supports the required PHP version',
            );
        }

        const hasExtensionIssues = Object.values(requirements.extensions).some((ext) => !ext.status);
        if (hasExtensionIssues) {
            solutions.push(
                'Contact your hosting provider to enable required PHP extensions',
                'Check your php.ini file and uncomment required extensions',
                'Restart your web server after enabling extensions',
            );
        }

        const hasPermissionIssues = Object.values(requirements.directories).some((dir) => !dir.status);
        if (hasPermissionIssues) {
            solutions.push(
                'Use chmod command: chmod 755 directory_name',
                'Check ownership: chown www-data:www-data directory_name',
                'Ensure the web server user has write access',
            );
        }

        return solutions;
    };

    const failedRequirements = getFailedRequirements();
    const specificSolutions = getSpecificSolutions();

    return (
        <>
            <Head title="Requirements Not Met - Cash Management Installer" />

            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <XCircle className="h-16 w-16 text-red-600" />
                        </div>
                        <h1 className="mb-2 text-4xl font-bold text-red-600">Requirements Not Met</h1>
                        <p className="text-lg text-gray-600">Your server doesn't meet the minimum requirements for Cash Management</p>
                    </div>

                    {/* Failed Requirements Summary */}
                    <Card className="mb-6 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <XCircle className="h-5 w-5" />
                                Failed Requirements ({failedRequirements.length})
                            </CardTitle>
                            <CardDescription>The following requirements must be met before installation can proceed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {failedRequirements.map((req, index) => (
                                    <div key={index} className="rounded-lg border border-red-200 bg-white p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-red-800">
                                                    {req.type}: {req.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Required: {req.required} | Current: {req.current}
                                                </p>
                                                <p className="mt-1 text-sm text-blue-600">{req.solution}</p>
                                            </div>
                                            <Badge variant="destructive">Failed</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Requirements Check */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-blue-600" />
                                Detailed Requirements Check
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* PHP Version */}
                            <div>
                                <h4 className="mb-3 font-medium text-gray-700">PHP Version</h4>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(requirements.php.status)}
                                        <span className="font-medium">{requirements.php.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">
                                            Required: {requirements.php.required} | Current: {requirements.php.current}
                                        </span>
                                        {getStatusBadge(requirements.php.status)}
                                    </div>
                                </div>
                            </div>

                            {/* PHP Extensions */}
                            <div>
                                <h4 className="mb-3 font-medium text-gray-700">PHP Extensions</h4>
                                <div className="space-y-2">
                                    {Object.entries(requirements.extensions).map(([key, ext]) => (
                                        <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(ext.status)}
                                                <span className="font-medium">{ext.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600">
                                                    Required: {ext.required} | Current: {ext.current}
                                                </span>
                                                {getStatusBadge(ext.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Directory Permissions */}
                            <div>
                                <h4 className="mb-3 font-medium text-gray-700">Directory Permissions</h4>
                                <div className="space-y-2">
                                    {Object.entries(requirements.directories).map(([key, dir]) => (
                                        <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(dir.status)}
                                                <span className="font-medium">{dir.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600">
                                                    Required: {dir.required} | Current: {dir.current}
                                                </span>
                                                {getStatusBadge(dir.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Solutions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-green-600" />
                                How to Fix These Issues
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {specificSolutions.map((solution, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400"></span>
                                        {solution}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button onClick={handleRetry} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Check Again
                        </Button>

                        <Link href="/install/requirements">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Requirements Check
                            </Button>
                        </Link>

                        <Link href="/">
                            <Button variant="ghost" className="flex items-center gap-2">
                                Return Home
                            </Button>
                        </Link>
                    </div>

                    {/* Support Information */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Need help? Check our{' '}
                            <a href="#" className="text-blue-600 hover:underline">
                                server requirements guide
                            </a>{' '}
                            or contact{' '}
                            <a href="#" className="text-blue-600 hover:underline">
                                support
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
