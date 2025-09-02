import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Activity, BarChart3, CheckCircle, Clock, Database, HardDrive, Info, Settings, Wrench, Zap } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Database Management', href: '/admin/database' },
];

interface DatabaseTable {
    name: string;
    rows: number;
    data_length: number;
    index_length: number;
    engine: string;
    collation: string;
    size: string;
}

interface DatabaseStatus {
    connection: string;
    version: string;
    uptime: string;
    threads: number;
    queries_per_second: number;
    slow_queries: number;
    connections: number;
    max_connections: number;
    total_size: string;
    table_count: number;
}

interface Props {
    databaseStatus: DatabaseStatus;
    tables: DatabaseTable[];
    performanceMetrics: {
        query_time: number;
        cache_hit_rate: number;
        slow_query_percentage: number;
    };
}

export default function DatabaseManagement({ databaseStatus, tables, performanceMetrics }: Props) {
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);

    const { post, processing } = useForm();
    const { flash } = usePage().props as any;

    const handleOptimize = () => {
        if (selectedTables.length === 0) {
            alert('Please select tables to optimize');
            return;
        }

        if (confirm(`Are you sure you want to optimize ${selectedTables.length} selected tables?`)) {
            setIsOptimizing(true);
            post('/admin/database/optimize', {
                tables: selectedTables,
                onSuccess: () => {
                    setIsOptimizing(false);
                    setSelectedTables([]);
                    // Refresh the page to show updated data
                    window.location.reload();
                },
                onError: () => {
                    setIsOptimizing(false);
                },
            });
        }
    };

    const handleRepair = () => {
        if (selectedTables.length === 0) {
            alert('Please select tables to repair');
            return;
        }

        if (confirm(`Are you sure you want to repair ${selectedTables.length} selected tables?`)) {
            setIsRepairing(true);
            post('/admin/database/repair', {
                tables: selectedTables,
                onSuccess: () => {
                    setIsRepairing(false);
                    setSelectedTables([]);
                    // Refresh the page to show updated data
                    window.location.reload();
                },
                onError: () => {
                    setIsRepairing(false);
                },
            });
        }
    };

    const handleSelectAll = () => {
        if (selectedTables.length === tables.length) {
            setSelectedTables([]);
        } else {
            setSelectedTables(tables.map((table) => table.name));
        }
    };

    const handleTableSelect = (tableName: string) => {
        setSelectedTables((prev) => (prev.includes(tableName) ? prev.filter((name) => name !== tableName) : [...prev, tableName]));
    };

    const getStatusColor = (status: string) => {
        if (status === 'InnoDB') return 'bg-blue-100 text-blue-800';
        if (status === 'MyISAM') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getPerformanceColor = (value: number, threshold: number) => {
        if (value >= threshold) return 'text-green-600';
        if (value >= threshold * 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Database Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
                                <p className="text-gray-600">Monitor and optimize database performance</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleOptimize} disabled={isOptimizing || selectedTables.length === 0} variant="outline">
                                    <Zap className="mr-2 h-4 w-4" />
                                    {isOptimizing ? 'Optimizing...' : 'Optimize Selected'}
                                </Button>
                                <Button onClick={handleRepair} disabled={isRepairing || selectedTables.length === 0} variant="outline">
                                    <Wrench className="mr-2 h-4 w-4" />
                                    {isRepairing ? 'Repairing...' : 'Repair Selected'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4">
                            <div className="flex">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{flash.success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Database Status Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">Online</div>
                                <p className="text-xs text-muted-foreground">{databaseStatus.connection}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{databaseStatus.total_size}</div>
                                <p className="text-xs text-muted-foreground">{databaseStatus.table_count} tables</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Queries/sec</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{databaseStatus.queries_per_second}</div>
                                <p className="text-xs text-muted-foreground">{databaseStatus.slow_queries} slow queries</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Connections</CardTitle>
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{databaseStatus.connections}</div>
                                <p className="text-xs text-muted-foreground">Max: {databaseStatus.max_connections}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Metrics */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Average Query Time</span>
                                        <span className={getPerformanceColor(performanceMetrics.query_time, 100)}>
                                            {performanceMetrics.query_time}ms
                                        </span>
                                    </div>
                                    <Progress value={Math.min(100, (performanceMetrics.query_time / 100) * 100)} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Cache Hit Rate</span>
                                        <span className={getPerformanceColor(performanceMetrics.cache_hit_rate, 80)}>
                                            {performanceMetrics.cache_hit_rate}%
                                        </span>
                                    </div>
                                    <Progress value={performanceMetrics.cache_hit_rate} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Slow Query Rate</span>
                                        <span className={getPerformanceColor(100 - performanceMetrics.slow_query_percentage, 5)}>
                                            {performanceMetrics.slow_query_percentage}%
                                        </span>
                                    </div>
                                    <Progress value={performanceMetrics.slow_query_percentage} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Database Tables */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Database Tables</span>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                        {selectedTables.length === tables.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                    <Badge variant="secondary">
                                        {selectedTables.length} of {tables.length} selected
                                    </Badge>
                                </div>
                            </CardTitle>
                            <CardDescription>Manage and optimize database tables. Select tables to perform operations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Select</TableHead>
                                        <TableHead>Table Name</TableHead>
                                        <TableHead>Rows</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Engine</TableHead>
                                        <TableHead>Collation</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tables.map((table) => (
                                        <TableRow key={table.name}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTables.includes(table.name)}
                                                    onChange={() => handleTableSelect(table.name)}
                                                    className="rounded border-gray-300"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{table.name}</TableCell>
                                            <TableCell>{table.rows.toLocaleString()}</TableCell>
                                            <TableCell>{table.size}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(table.engine)}>{table.engine}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">{table.collation}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm text-green-600">Healthy</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Database Information */}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Version:</span>
                                    <span className="text-sm font-medium">{databaseStatus.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Uptime:</span>
                                    <span className="text-sm font-medium">{databaseStatus.uptime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Active Threads:</span>
                                    <span className="text-sm font-medium">{databaseStatus.threads}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Connection String:</span>
                                    <span className="text-sm font-medium">{databaseStatus.connection}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Performance Metrics
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Check Query Logs
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Info className="mr-2 h-4 w-4" />
                                    Database Documentation
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
