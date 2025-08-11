import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Database, FileText, RefreshCw, Settings, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InstallationErrorProps {
    error: {
        type: 'database_setup' | 'migration' | 'seeding' | 'file_permissions' | 'configuration' | 'system';
        title: string;
        message: string;
        details?: string[];
        errorCode?: string;
        suggestions?: string[];
        canRetry?: boolean;
        canGoBack?: boolean;
        logs?: string[];
    };
}

export default function InstallationError() {
    // Get error data from sessionStorage or use default
    const [error, setError] = useState<InstallationErrorProps['error']>({
        type: 'system',
        title: 'Installation Failed',
        message: 'The installation process encountered an error.',
        details: ['Unknown error occurred during installation'],
        suggestions: ['Check your database connection', 'Verify all required fields are filled', 'Ensure proper permissions on storage directories'],
        canRetry: true,
        canGoBack: true,
    });

    useEffect(() => {
        // Try to get error data from sessionStorage
        const storedError = sessionStorage.getItem('installer_error');
        if (storedError) {
            try {
                const parsedError = JSON.parse(storedError);
                setError(parsedError);
                // Clear the stored error after reading it
                sessionStorage.removeItem('installer_error');
            } catch (e) {
                console.error('Failed to parse stored error:', e);
            }
        }
    }, []);
    const getErrorIcon = (type: string) => {
        switch (type) {
            case 'database_setup':
                return <Database className="h-16 w-16 text-red-600" />;
            case 'migration':
                return <Database className="h-16 w-16 text-red-600" />;
            case 'seeding':
                return <Database className="h-16 w-16 text-orange-600" />;
            case 'file_permissions':
                return <FileText className="h-16 w-16 text-orange-600" />;
            case 'configuration':
                return <Settings className="h-16 w-16 text-yellow-600" />;
            case 'system':
                return <XCircle className="h-16 w-16 text-red-600" />;
            default:
                return <XCircle className="h-16 w-16 text-red-600" />;
        }
    };

    const getErrorColor = (type: string) => {
        switch (type) {
            case 'database_setup':
            case 'migration':
            case 'system':
                return 'text-red-600';
            case 'seeding':
                return 'text-orange-600';
            case 'file_permissions':
                return 'text-orange-600';
            case 'configuration':
                return 'text-yellow-600';
            default:
                return 'text-red-600';
        }
    };

    const getErrorBackground = (type: string) => {
        switch (type) {
            case 'database_setup':
            case 'migration':
            case 'system':
                return 'bg-red-50';
            case 'seeding':
                return 'bg-orange-50';
            case 'file_permissions':
                return 'bg-orange-50';
            case 'configuration':
                return 'bg-yellow-50';
            default:
                return 'bg-red-50';
        }
    };

    const getSpecificSuggestions = (type: string) => {
        switch (type) {
            case 'database_setup':
                return [
                    'Verify database connection details are correct',
                    'Ensure the database user has sufficient privileges',
                    'Check if the database exists and is accessible',
                    'Verify MySQL server is running and accepting connections',
                ];
            case 'migration':
                return [
                    'Check database connection and permissions',
                    'Ensure all required tables can be created',
                    'Verify the database user has CREATE, ALTER, DROP privileges',
                    'Check for any conflicting table names',
                ];
            case 'seeding':
                return [
                    'Check if the database tables were created successfully',
                    'Verify the database user has INSERT privileges',
                    'Ensure there are no data conflicts',
                    'Check database constraints and foreign keys',
                ];
            case 'file_permissions':
                return [
                    'Set proper permissions on storage and bootstrap/cache directories',
                    'Use chmod 755 for directories and chmod 644 for files',
                    'Check ownership: chown www-data:www-data directory_name',
                    'Ensure the web server user has write access',
                ];
            case 'configuration':
                return [
                    'Verify all required environment variables are set',
                    'Check if .env file exists and is readable',
                    'Ensure configuration values are valid',
                    'Verify file paths and URLs are correct',
                ];
            case 'system':
                return [
                    'Check server logs for detailed error information',
                    'Verify PHP memory limit and execution time',
                    'Ensure all required PHP extensions are enabled',
                    'Check server resource availability (disk space, memory)',
                ];
            default:
                return [
                    'Check the error logs for more detailed information',
                    'Verify all previous installation steps completed successfully',
                    'Ensure server meets all requirements',
                    'Contact support with the error details',
                ];
        }
    };

    const handleRetry = () => {
        // Go back to configuration page to retry installation
        window.location.href = '/install/configuration';
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <>
            <Head title={`Installation Failed - ${error.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex justify-center">{getErrorIcon(error.type)}</div>
                        <h1 className={`mb-2 text-4xl font-bold ${getErrorColor(error.type)}`}>{error.title}</h1>
                        <p className="text-lg text-gray-600">{error.message}</p>
                    </div>

                    {/* Error Details */}
                    <Card className={`mb-6 ${getErrorBackground(error.type)}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5" />
                                Installation Error Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error.errorCode && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Error Code:</p>
                                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">{error.errorCode}</code>
                                </div>
                            )}

                            {error.details && error.details.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">What went wrong:</p>
                                    <ul className="mt-2 space-y-1">
                                        {error.details.map((detail, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400"></span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {error.logs && error.logs.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Error Logs:</p>
                                    <div className="mt-2 max-h-40 overflow-y-auto rounded bg-gray-100 p-3">
                                        {error.logs.map((log, index) => (
                                            <div key={index} className="font-mono text-xs text-gray-800">
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Specific Solutions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-blue-600" />
                                How to Fix This
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {getSpecificSuggestions(error.type).map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Troubleshooting Steps */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-green-600" />
                                Troubleshooting Steps
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <h4 className="font-medium text-blue-800">1. Check Requirements</h4>
                                    <p className="text-sm text-blue-700">Verify that your server meets all PHP, MySQL, and extension requirements.</p>
                                </div>
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <h4 className="font-medium text-green-800">2. Verify Database</h4>
                                    <p className="text-sm text-green-700">Test database connection and ensure proper permissions are set.</p>
                                </div>
                                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                                    <h4 className="font-medium text-purple-800">3. Check Permissions</h4>
                                    <p className="text-sm text-purple-700">
                                        Ensure the application has write access to storage and cache directories.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                                    <h4 className="font-medium text-orange-800">4. Review Logs</h4>
                                    <p className="text-sm text-orange-700">Check Laravel logs and server error logs for detailed information.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        {error.canGoBack && (
                            <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Go Back
                            </Button>
                        )}

                        {error.canRetry && (
                            <Button onClick={handleRetry} className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                        )}

                        <Link href="/install/configuration">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Configuration
                            </Button>
                        </Link>

                        <Link href="/install/database">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Database Setup
                            </Button>
                        </Link>

                        <Link href="/install/requirements">
                            <Button variant="ghost" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Start Over
                            </Button>
                        </Link>
                    </div>

                    {/* Support Information */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Still having issues? Check our{' '}
                            <a href="#" className="text-blue-600 hover:underline">
                                installation troubleshooting guide
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
