import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Activity, Calendar, Clock, Download, Eye, Filter, Search, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Activity Logs', href: '/admin/activity-logs' },
];

interface ActivityLog {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    action: string;
    description: string;
    target_type: string | null;
    target_id: number | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

interface Statistics {
    totalLogs: number;
    todayLogs: number;
    thisWeekLogs: number;
    thisMonthLogs: number;
}

interface TopAction {
    action: string;
    count: number;
}

interface TopUser {
    user: {
        id: number;
        name: string;
        email: string;
    };
    count: number;
}

interface Props {
    activityLogs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        user_id?: string;
        action?: string;
        start_date?: string;
        end_date?: string;
        search?: string;
    };
    statistics: Statistics;
    topActions: TopAction[];
    topUsers: TopUser[];
}

export default function ActivityLogs({ activityLogs, filters, statistics, topActions, topUsers }: Props) {
    const { data, setData, get, processing } = useForm({
        user_id: filters.user_id || '',
        action: filters.action || 'all',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        search: filters.search || '',
    });

    const handleFilter = () => {
        // Convert 'all' back to empty string for backend processing
        const filterData = {
            ...data,
            action: data.action === 'all' ? '' : data.action,
        };

        // Build query string for filtering
        const queryParams = new URLSearchParams();
        Object.entries(filterData).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        get(`/admin/activity-logs?${queryParams.toString()}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setData({
            user_id: '',
            action: 'all',
            start_date: '',
            end_date: '',
            search: '',
        });
    };

    const handleExport = () => {
        // Export functionality
        window.open('/admin/activity-logs/export', '_blank');
    };

    const handleClearLogs = () => {
        // Clear logs functionality
        if (confirm('Are you sure you want to clear old logs? This action cannot be undone.')) {
            // Implement clear logs logic
        }
    };

    const handleViewLog = (log: ActivityLog) => {
        // Navigate to the detailed view of the log
        router.visit(route('admin.activity-logs.show', log.id));
    };

    const getActionColor = (action: string) => {
        if (action.includes('login')) return 'bg-green-100 text-green-800';
        if (action.includes('create')) return 'bg-blue-100 text-blue-800';
        if (action.includes('update')) return 'bg-yellow-100 text-yellow-800';
        if (action.includes('delete')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Activity Logs" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                                <p className="text-gray-600">Monitor and analyze system activity</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleExport} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                                <Button onClick={handleClearLogs} variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear Old Logs
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.totalLogs.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.todayLogs.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.thisWeekLogs.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.thisMonthLogs.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder="Search logs..."
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="action">Action</Label>
                                    <Select value={data.action} onValueChange={(value) => setData('action', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Actions</SelectItem>
                                            <SelectItem value="user_login">User Login</SelectItem>
                                            <SelectItem value="user_logout">User Logout</SelectItem>
                                            <SelectItem value="user_created">User Created</SelectItem>
                                            <SelectItem value="user_updated">User Updated</SelectItem>
                                            <SelectItem value="user_deleted">User Deleted</SelectItem>
                                            <SelectItem value="transaction_created">Transaction Created</SelectItem>
                                            <SelectItem value="transaction_updated">Transaction Updated</SelectItem>
                                            <SelectItem value="transaction_deleted">Transaction Deleted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <CustomDateInput
                                        id="start_date"
                                        value={data.start_date}
                                        onChange={(value) => setData('start_date', value)}
                                        placeholder="dd/mm/yyyy"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <CustomDateInput
                                        id="end_date"
                                        value={data.end_date}
                                        onChange={(value) => setData('end_date', value)}
                                        placeholder="dd/mm/yyyy"
                                    />
                                </div>
                                <div className="flex items-end space-x-2">
                                    <Button onClick={handleFilter} disabled={processing}>
                                        <Search className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                    <Button onClick={handleClearFilters} variant="outline">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Logs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Logs</CardTitle>
                            <CardDescription>Recent system activities and user actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activityLogs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                {log.user ? (
                                                    <div>
                                                        <div className="font-medium">{log.user.name}</div>
                                                        <div className="text-sm text-gray-500">{log.user.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">System</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getActionColor(log.action)}>{log.action.replace('_', ' ').toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">{log.ip_address || 'N/A'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{new Date(log.created_at).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => handleViewLog(log)} className="h-8 w-8 p-0">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {activityLogs.last_page > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination
                                        currentPage={activityLogs.current_page}
                                        totalPages={activityLogs.last_page}
                                        onPageChange={(page) => {
                                            // Use the get method directly for pagination
                                            get(`/admin/activity-logs?page=${page}`, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Actions and Users */}
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Actions</CardTitle>
                                <CardDescription>Most performed actions this month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topActions.map((action, index) => (
                                        <div key={action.action} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                <span className="text-sm">{action.action.replace('_', ' ').toUpperCase()}</span>
                                            </div>
                                            <Badge variant="secondary">{action.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Users</CardTitle>
                                <CardDescription>Most active users this month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topUsers.map((user, index) => (
                                        <div key={user.user.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                <div>
                                                    <div className="text-sm font-medium">{user.user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.user.email}</div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">{user.count}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
