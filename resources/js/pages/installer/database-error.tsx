import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Database, RefreshCw, XCircle } from 'lucide-react';

interface DatabaseErrorProps {
    error: {
        type: 'connection' | 'permission' | 'database_not_found' | 'invalid_credentials' | 'server_unreachable';
        title: string;
        message: string;
        details?: string[];
        errorCode?: string;
        suggestions?: string[];
        canRetry?: boolean;
        databaseConfig?: {
            host: string;
            port: string;
            database: string;
            username: string;
        };
    };
}

export default function DatabaseError({ error }: DatabaseErrorProps) {
    const getErrorIcon = (type: string) => {
        switch (type) {
            case 'connection':
                return <XCircle className="h-16 w-16 text-red-600" />;
            case 'permission':
                return <AlertTriangle className="h-16 w-16 text-orange-600" />;
            case 'database_not_found':
                return <Database className="h-16 w-16 text-red-600" />;
            case 'invalid_credentials':
                return <XCircle className="h-16 w-16 text-red-600" />;
            case 'server_unreachable':
                return <XCircle className="h-16 w-16 text-red-600" />;
            default:
                return <XCircle className="h-16 w-16 text-red-600" />;
        }
    };

    const getErrorColor = (type: string) => {
        switch (type) {
            case 'connection':
            case 'database_not_found':
            case 'invalid_credentials':
            case 'server_unreachable':
                return 'text-red-600';
            case 'permission':
                return 'text-orange-600';
            default:
                return 'text-red-600';
        }
    };

    const getErrorBackground = (type: string) => {
        switch (type) {
            case 'connection':
            case 'database_not_found':
            case 'invalid_credentials':
            case 'server_unreachable':
                return 'bg-red-50';
            case 'permission':
                return 'bg-orange-50';
            default:
                return 'bg-red-50';
        }
    };

    const getSpecificSuggestions = (type: string) => {
        switch (type) {
            case 'connection':
                return [
                    'Verify that your MySQL server is running',
                    'Check if the host and port are correct',
                    'Ensure the MySQL service is started',
                    'Try connecting with a MySQL client to test the connection',
                ];
            case 'permission':
                return [
                    'Check if the database user has sufficient privileges',
                    'Verify the user has CREATE, SELECT, INSERT, UPDATE, DELETE permissions',
                    'Ensure the user can access the specified database',
                    "Try creating the database manually if it doesn't exist",
                ];
            case 'database_not_found':
                return [
                    'Create the database manually using: CREATE DATABASE database_name',
                    'Check if the database name is spelled correctly',
                    'Ensure the database exists on the MySQL server',
                    'Verify the user has access to create databases if needed',
                ];
            case 'invalid_credentials':
                return [
                    'Double-check the username and password',
                    'Verify the user exists on the MySQL server',
                    'Check if the password contains special characters',
                    'Try resetting the MySQL user password',
                ];
            case 'server_unreachable':
                return [
                    'Check if the MySQL server is running on the specified host',
                    'Verify the host IP address or domain name',
                    'Check firewall settings and network connectivity',
                    'Ensure the MySQL server is configured to accept remote connections',
                ];
            default:
                return [
                    'Verify your database configuration',
                    'Check server logs for more detailed error information',
                    'Ensure all required MySQL extensions are enabled in PHP',
                ];
        }
    };

    const handleRetry = () => {
        window.location.href = '/install/database';
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <>
            <Head title={`Database Error - ${error.title}`} />

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
                                <Database className="h-5 w-5" />
                                Database Error Details
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

                            {error.databaseConfig && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Current Configuration:</p>
                                    <div className="mt-2 rounded bg-gray-50 p-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="font-medium">Host:</span> {error.databaseConfig.host}
                                            </div>
                                            <div>
                                                <span className="font-medium">Port:</span> {error.databaseConfig.port}
                                            </div>
                                            <div>
                                                <span className="font-medium">Database:</span> {error.databaseConfig.database}
                                            </div>
                                            <div>
                                                <span className="font-medium">Username:</span> {error.databaseConfig.username}
                                            </div>
                                        </div>
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

                    {/* MySQL Commands Help */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-green-600" />
                                Useful MySQL Commands
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="mb-1 text-sm font-medium text-gray-700">Test Connection:</p>
                                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                                        mysql -h {error.databaseConfig?.host || 'localhost'} -P {error.databaseConfig?.port || '3306'} -u{' '}
                                        {error.databaseConfig?.username || 'username'} -p
                                    </code>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm font-medium text-gray-700">Create Database:</p>
                                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                                        CREATE DATABASE {error.databaseConfig?.database || 'database_name'};
                                    </code>
                                </div>
                                <div>
                                    <p className="mb-1 text-sm font-medium text-gray-700">Grant Permissions:</p>
                                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                                        GRANT ALL PRIVILEGES ON {error.databaseConfig?.database || 'database_name'}.* TO '
                                        {error.databaseConfig?.username || 'username'}'@'%';
                                    </code>
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
                            Need help? Check our{' '}
                            <a href="#" className="text-blue-600 hover:underline">
                                database setup guide
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
