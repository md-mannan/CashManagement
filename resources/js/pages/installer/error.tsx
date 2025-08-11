import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';

interface InstallerErrorProps {
    error: {
        type: 'requirements' | 'database' | 'configuration' | 'installation' | 'permission' | 'system';
        title: string;
        message: string;
        details?: string[];
        code?: string;
        suggestions?: string[];
        canRetry?: boolean;
        canGoBack?: boolean;
    };
}

export default function InstallerError({ error }: InstallerErrorProps) {
    const getErrorIcon = (type: string) => {
        switch (type) {
            case 'requirements':
                return <XCircle className="h-16 w-16 text-red-600" />;
            case 'database':
                return <XCircle className="h-16 w-16 text-red-600" />;
            case 'configuration':
                return <AlertTriangle className="h-16 w-16 text-yellow-600" />;
            case 'installation':
                return <XCircle className="h-16 w-16 text-red-600" />;
            case 'permission':
                return <AlertTriangle className="h-16 w-16 text-orange-600" />;
            case 'system':
                return <XCircle className="h-16 w-16 text-red-600" />;
            default:
                return <XCircle className="h-16 w-16 text-red-600" />;
        }
    };

    const getErrorColor = (type: string) => {
        switch (type) {
            case 'requirements':
            case 'database':
            case 'installation':
            case 'system':
                return 'text-red-600';
            case 'configuration':
                return 'text-yellow-600';
            case 'permission':
                return 'text-orange-600';
            default:
                return 'text-red-600';
        }
    };

    const getErrorBackground = (type: string) => {
        switch (type) {
            case 'requirements':
            case 'database':
            case 'installation':
            case 'system':
                return 'bg-red-50';
            case 'configuration':
                return 'bg-yellow-50';
            case 'permission':
                return 'bg-orange-50';
            default:
                return 'bg-red-50';
        }
    };

    const handleRetry = () => {
        window.location.reload();
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <>
            <Head title={`Installation Error - ${error.title}`} />

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
                                <AlertTriangle className="h-5 w-5" />
                                Error Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error.code && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Error Code:</p>
                                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">{error.code}</code>
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

                            {error.suggestions && error.suggestions.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">How to fix this:</p>
                                    <ul className="mt-2 space-y-1">
                                        {error.suggestions.map((suggestion, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></span>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Common Solutions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-blue-600" />
                                Common Solutions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                    <h4 className="font-medium text-blue-800">Check Server Requirements</h4>
                                    <p className="text-sm text-blue-700">Ensure your server meets all PHP, MySQL, and extension requirements.</p>
                                </div>
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <h4 className="font-medium text-green-800">Verify Permissions</h4>
                                    <p className="text-sm text-green-700">
                                        Make sure the application has write permissions to storage and bootstrap/cache directories.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                                    <h4 className="font-medium text-purple-800">Database Connection</h4>
                                    <p className="text-sm text-purple-700">
                                        Verify your database credentials and ensure the database server is running.
                                    </p>
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

                        <Link href="/install/requirements">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Start Over
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
                            Still having issues? Check our{' '}
                            <a href="#" className="text-blue-600 hover:underline">
                                documentation
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
