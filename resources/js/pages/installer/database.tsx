import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Database, Settings, Shield, User, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function InstallerDatabase() {
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
        tables?: string[];
    } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        // Database Configuration
        host: 'localhost',
        port: '3306',
        database: '',
        username: '',
        password: '',

        // Application Configuration
        app_name: 'Cash Management',
        app_url: window.location.origin,

        // Admin User Configuration
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_password_confirmation: '',
    });

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await fetch('/install/test-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    host: data.host,
                    port: data.port,
                    database: data.database,
                    username: data.username,
                    password: data.password,
                }),
            });

            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Connection test failed. Please check your settings.',
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleInstall = async () => {
        if (!testResult?.success) {
            alert('Please test your database connection first.');
            return;
        }

        setIsInstalling(true);

        try {
            const response = await fetch('/install/install', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                alert('Installation completed successfully! Redirecting to login...');
                window.location.href = result.redirect_url;
            } else {
                alert('Installation failed: ' + result.message);
            }
        } catch (error) {
            alert('Installation failed. Please try again.');
        } finally {
            setIsInstalling(false);
        }
    };

    return (
        <>
            <Head title="Database Configuration - Cash Management Installer" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Database Configuration</h1>
                        <p className="text-lg text-gray-600">Configure your database connection and application settings</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8 flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">1</div>
                            <div className="h-1 w-16 bg-green-600"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">2</div>
                            <div className="h-1 w-16 bg-green-600"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</div>
                            <div className="h-1 w-16 bg-gray-300"></div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-500">4</div>
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* Database Configuration */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-blue-600" />
                                    Database Configuration
                                </CardTitle>
                                <CardDescription>Enter your MySQL database connection details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="host">Database Host</Label>
                                        <Input
                                            id="host"
                                            type="text"
                                            value={data.host}
                                            onChange={(e) => setData('host', e.target.value)}
                                            placeholder="localhost"
                                            required
                                        />
                                        {errors.host && <p className="mt-1 text-sm text-red-500">{errors.host}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="port">Database Port</Label>
                                        <Input
                                            id="port"
                                            type="number"
                                            value={data.port}
                                            onChange={(e) => setData('port', e.target.value)}
                                            placeholder="3306"
                                            required
                                        />
                                        {errors.port && <p className="mt-1 text-sm text-red-500">{errors.port}</p>}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="database">Database Name</Label>
                                    <Input
                                        id="database"
                                        type="text"
                                        value={data.database}
                                        onChange={(e) => setData('database', e.target.value)}
                                        placeholder="cash_management"
                                        required
                                    />
                                    {errors.database && <p className="mt-1 text-sm text-red-500">{errors.database}</p>}
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="username">Database Username</Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            placeholder="root"
                                            required
                                        />
                                        {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="password">Database Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter password"
                                        />
                                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        type="button"
                                        onClick={handleTestConnection}
                                        disabled={isTesting || !data.host || !data.database || !data.username}
                                        className="w-full md:w-auto"
                                    >
                                        {isTesting ? 'Testing...' : 'Test Connection'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Connection Test Result */}
                        {testResult && (
                            <Card className="mb-6">
                                <CardContent className="pt-6">
                                    <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                        {testResult.success ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                                            {testResult.message}
                                        </AlertDescription>
                                    </Alert>
                                    {testResult.success && testResult.tables && (
                                        <div className="mt-3 rounded-lg bg-green-50 p-3">
                                            <p className="mb-2 text-sm font-medium text-green-700">
                                                Existing tables found: {testResult.tables.length}
                                            </p>
                                            <p className="text-xs text-green-600">Note: If you proceed, existing data may be overwritten.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Application Configuration */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-green-600" />
                                    Application Configuration
                                </CardTitle>
                                <CardDescription>Set up your application name and URL</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="app_name">Application Name</Label>
                                    <Input
                                        id="app_name"
                                        type="text"
                                        value={data.app_name}
                                        onChange={(e) => setData('app_name', e.target.value)}
                                        placeholder="Cash Management"
                                        required
                                    />
                                    {errors.app_name && <p className="mt-1 text-sm text-red-500">{errors.app_name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="app_url">Application URL</Label>
                                    <Input
                                        id="app_url"
                                        type="url"
                                        value={data.app_url}
                                        onChange={(e) => setData('app_url', e.target.value)}
                                        placeholder="https://example.com"
                                        required
                                    />
                                    {errors.app_url && <p className="mt-1 text-sm text-red-500">{errors.app_url}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin User Configuration */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-purple-600" />
                                    Administrator Account
                                </CardTitle>
                                <CardDescription>Create your super admin account. This user will have full access to the system.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="admin_name">Full Name</Label>
                                        <Input
                                            id="admin_name"
                                            type="text"
                                            value={data.admin_name}
                                            onChange={(e) => setData('admin_name', e.target.value)}
                                            placeholder="John Doe"
                                            required
                                        />
                                        {errors.admin_name && <p className="mt-1 text-sm text-red-500">{errors.admin_name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="admin_email">Email Address</Label>
                                        <Input
                                            id="admin_email"
                                            type="email"
                                            value={data.admin_email}
                                            onChange={(e) => setData('admin_email', e.target.value)}
                                            placeholder="admin@example.com"
                                            required
                                        />
                                        {errors.admin_email && <p className="mt-1 text-sm text-red-500">{errors.admin_email}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="admin_password">Password</Label>
                                        <Input
                                            id="admin_password"
                                            type="password"
                                            value={data.admin_password}
                                            onChange={(e) => setData('admin_password', e.target.value)}
                                            placeholder="Minimum 8 characters"
                                            required
                                        />
                                        {errors.admin_password && <p className="mt-1 text-sm text-red-500">{errors.admin_password}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="admin_password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="admin_password_confirmation"
                                            type="password"
                                            value={data.admin_password_confirmation}
                                            onChange={(e) => setData('admin_password_confirmation', e.target.value)}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        {errors.admin_password_confirmation && (
                                            <p className="mt-1 text-sm text-red-500">{errors.admin_password_confirmation}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <a href="/install/requirements">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </a>

                            <Button onClick={handleInstall} disabled={!testResult?.success || isInstalling} className="flex items-center gap-2">
                                {isInstalling ? (
                                    'Installing...'
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4" />
                                        Install Application
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Important Notes */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="text-yellow-600">Important Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Make sure your database server is running and accessible</li>
                                <li>• The database user must have CREATE, ALTER, and DROP privileges</li>
                                <li>• Existing data in the database will be overwritten during installation</li>
                                <li>• Keep your admin credentials safe - you'll need them to log in</li>
                                <li>• The installation process may take a few minutes to complete</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
