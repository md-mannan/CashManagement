import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'System Health', href: '/admin/system-health' },
];

interface SystemHealthProps {
    systemHealth: {
        database: {
            status: string;
            version?: string;
            connection: string;
            last_check: string;
            error?: string;
        };
        cache: {
            status: string;
            driver: string;
            connection: string;
            last_check: string;
            error?: string;
        };
        storage: {
            status: string;
            total_space?: string;
            free_space?: string;
            used_space?: string;
            usage_percentage?: number;
            last_check: string;
            error?: string;
        };
        performance: {
            memory_usage: string;
            peak_memory: string;
            execution_time: string;
            php_version: string;
            laravel_version: string;
            last_check: string;
        };
        security: {
            app_debug: boolean;
            app_environment: string;
            session_secure: boolean;
            session_http_only: boolean;
            session_same_site: string;
            last_check: string;
        };
    };
}

export default function SystemHealth({ systemHealth }: SystemHealthProps) {
    if (!systemHealth) {
        return (
            <AdminRouteGuard>
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="System Health" />
                    <div className="space-y-6">
                        <div>
                            <h1 className="mt-6 text-3xl font-bold tracking-tight">System Health</h1>
                            <p className="text-muted-foreground">Monitor the health and performance of your system components</p>
                        </div>
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                System health data is not available. Please check the controller and ensure data is being passed correctly.
                            </AlertDescription>
                        </Alert>
                    </div>
                </AppLayout>
            </AdminRouteGuard>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'unhealthy':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Healthy
                    </Badge>
                );
            case 'warning':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Warning
                    </Badge>
                );
            case 'unhealthy':
                return <Badge variant="destructive">Unhealthy</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getStorageStatus = () => {
        if (systemHealth.storage.status === 'healthy' && systemHealth.storage.usage_percentage) {
            if (systemHealth.storage.usage_percentage > 90) {
                return 'warning';
            } else if (systemHealth.storage.usage_percentage > 80) {
                return 'warning';
            }
        }
        return systemHealth.storage.status;
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="System Health" />

                <div className="space-y-6">
                    <div>
                        <h1 className="mt-6 text-3xl font-bold tracking-tight">System Health</h1>
                        <p className="text-muted-foreground">Monitor the health and performance of your system components</p>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Database Health */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Database</CardTitle>
                                {getStatusIcon(systemHealth.database.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(systemHealth.database.status)}
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(systemHealth.database.last_check).toLocaleTimeString()}
                                    </span>
                                </div>
                                {systemHealth.database.status === 'healthy' ? (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-muted-foreground">Version: {systemHealth.database.version}</p>
                                        <p className="text-xs text-muted-foreground">Connection: {systemHealth.database.connection}</p>
                                    </div>
                                ) : (
                                    <Alert className="mt-2">
                                        <AlertDescription className="text-xs">{systemHealth.database.error}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cache Health */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cache</CardTitle>
                                {getStatusIcon(systemHealth.cache.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(systemHealth.cache.status)}
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(systemHealth.cache.last_check).toLocaleTimeString()}
                                    </span>
                                </div>
                                {systemHealth.cache.status === 'healthy' ? (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-muted-foreground">Driver: {systemHealth.cache.driver}</p>
                                        <p className="text-xs text-muted-foreground">Connection: {systemHealth.cache.connection}</p>
                                    </div>
                                ) : (
                                    <Alert className="mt-2">
                                        <AlertDescription className="text-xs">{systemHealth.cache.error}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Storage Health */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                                {getStatusIcon(getStorageStatus())}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(getStorageStatus())}
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(systemHealth.storage.last_check).toLocaleTimeString()}
                                    </span>
                                </div>
                                {systemHealth.storage.status === 'healthy' ? (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-muted-foreground">Total: {systemHealth.storage.total_space}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Used: {systemHealth.storage.used_space} ({systemHealth.storage.usage_percentage}%)
                                        </p>
                                        <p className="text-xs text-muted-foreground">Free: {systemHealth.storage.free_space}</p>
                                    </div>
                                ) : (
                                    <Alert className="mt-2">
                                        <AlertDescription className="text-xs">{systemHealth.storage.error}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Current system performance indicators</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="text-sm font-medium">Memory Usage</p>
                                    <p className="text-2xl font-bold">{systemHealth.performance.memory_usage}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Peak Memory</p>
                                    <p className="text-2xl font-bold">{systemHealth.performance.peak_memory}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Execution Time</p>
                                    <p className="text-2xl font-bold">{systemHealth.performance.execution_time}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">PHP Version</p>
                                    <p className="text-2xl font-bold">{systemHealth.performance.php_version}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium">Laravel Version</p>
                                <p className="text-lg font-semibold">{systemHealth.performance.laravel_version}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Status</CardTitle>
                            <CardDescription>Current security configuration and settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Debug Mode:</span>
                                    <Badge variant={systemHealth.security.app_debug ? 'destructive' : 'default'}>
                                        {systemHealth.security.app_debug ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Environment:</span>
                                    <Badge variant="outline">{systemHealth.security.app_environment}</Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Secure Sessions:</span>
                                    <Badge variant={systemHealth.security.session_secure ? 'default' : 'secondary'}>
                                        {systemHealth.security.session_secure ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">HTTP Only:</span>
                                    <Badge variant={systemHealth.security.session_http_only ? 'default' : 'secondary'}>
                                        {systemHealth.security.session_http_only ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Same Site:</span>
                                    <Badge variant="outline">{systemHealth.security.session_same_site}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center text-xs text-muted-foreground">
                        Last updated: {new Date(systemHealth.database.last_check).toLocaleString()}
                    </div>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
