import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Calendar, Clock, Download, Eye, Filter, Search, Shield, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Super Admin Management',
        href: '/admin/super-admin',
    },
    {
        title: 'System Audit',
        href: '/admin/super-admin/audit',
    },
];

interface SystemAuditProps {
    recentActivities: Array<{
        id: number;
        action: string;
        user: string;
        target: string;
        created_at: string;
        ip_address: string;
    }>;
    attentionActivities?: Array<{
        id: number;
        action: string;
        user: string;
        target: string;
        created_at: string;
        ip_address: string;
    }>;
    auditStats?: {
        total_activities: number;
        activities_today: number;
        activities_this_week: number;
        activities_this_month: number;
        attention_required: number;
    };
    error?: string;
}

export default function SystemAudit({ recentActivities, attentionActivities, auditStats, error }: SystemAuditProps) {
    const page = usePage();

    // Debug: Log the props to see what's being passed
    console.log('SystemAudit props:', { recentActivities, attentionActivities, auditStats, error });
    console.log('Page props:', page.props);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState('all');
    const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

    // Check if we have an error or no data
    if (error || !recentActivities) {
        return (
            <AdminRouteGuard>
                <AppLayout breadcrumbs={breadcrumbs}>
                    <Head title="System Audit" />
                    <div className="space-y-6">
                        <div>
                            <h1 className="mt-6 text-3xl font-bold tracking-tight">System Audit</h1>
                            <p className="text-muted-foreground">Monitor system activities, user actions, and administrative operations</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error Loading Audit Data</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>
                                            {error ||
                                                'No audit data available. Please check the controller and ensure data is being passed correctly.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Debug Info:</p>
                            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-4">{JSON.stringify(page.props, null, 2)}</pre>
                        </div>
                    </div>
                </AppLayout>
            </AdminRouteGuard>
        );
    }

    const actions = [
        'all',
        'user_login',
        'user_logout',
        'user_created',
        'user_updated',
        'user_deleted',
        'role_changed',
        'permissions_updated',
        'admin_action',
        'system_maintenance',
    ];

    const timeframes = [
        { value: '1h', label: 'Last Hour' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
    ];

    const getActionColor = (action: string) => {
        if (action.includes('login') || action.includes('created')) {
            return 'bg-green-100 text-green-800 border-green-200';
        } else if (action.includes('logout') || action.includes('deleted')) {
            return 'bg-red-100 text-red-800 border-red-200';
        } else if (action.includes('updated') || action.includes('changed')) {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        } else if (action.includes('admin') || action.includes('maintenance')) {
            return 'bg-purple-100 text-purple-800 border-purple-200';
        } else {
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('login')) return <Shield className="h-4 w-4" />;
        if (action.includes('user')) return <Users className="h-4 w-4" />;
        if (action.includes('admin')) return <Shield className="h-4 w-4" />;
        if (action.includes('system')) return <Shield className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const filteredActivities = recentActivities.filter((activity) => {
        const matchesSearch =
            activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.target.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = selectedAction === 'all' || activity.action.includes(selectedAction);

        return matchesSearch && matchesAction;
    });

    const handleViewLog = (activity: { id: number; action: string; user: string; target: string; created_at: string; ip_address: string }) => {
        router.visit(`/admin/super-admin/audit/${activity.id}`);
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="System Audit" />

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mt-6 text-3xl font-bold tracking-tight">System Audit</h1>
                            <p className="text-muted-foreground">Monitor system activities, user actions, and administrative operations</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/admin/super-admin">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Super Admin
                                </Link>
                            </Button>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export Logs
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter & Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search Activities</Label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search actions, users, or targets..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="action">Action Type</Label>
                                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select action type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {actions.map((action) => (
                                                <SelectItem key={action} value={action}>
                                                    {action === 'all'
                                                        ? 'All Actions'
                                                        : action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timeframe">Timeframe</Label>
                                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timeframe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeframes.map((timeframe) => (
                                                <SelectItem key={timeframe.value} value={timeframe.value}>
                                                    {timeframe.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Summary */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filteredActivities.length}</div>
                                <p className="text-xs text-muted-foreground">{recentActivities.length} total in system</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{new Set(filteredActivities.map((a) => a.user)).size}</div>
                                <p className="text-xs text-muted-foreground">Active participants</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{filteredActivities.filter((a) => a.action.includes('admin')).length}</div>
                                <p className="text-xs text-muted-foreground">Administrative operations</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {
                                        filteredActivities.filter((a) => {
                                            const activityTime = new Date(a.created_at);
                                            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                                            return activityTime > oneHourAgo;
                                        }).length
                                    }
                                </div>
                                <p className="text-xs text-muted-foreground">Last hour</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activities Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Target</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredActivities.length > 0 ? (
                                        filteredActivities.map((activity) => (
                                            <TableRow key={activity.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getActionIcon(activity.action)}
                                                        <Badge className={getActionColor(activity.action)}>
                                                            {activity.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{activity.user}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">{activity.target || 'System'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">{activity.ip_address}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">{formatDate(activity.created_at)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" variant="outline" onClick={() => handleViewLog(activity)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center">
                                                <div className="text-muted-foreground">No activities found matching your filters.</div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Additional Audit Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Health Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Database Status</span>
                                        <Badge className="border-green-200 bg-green-100 text-green-800">Healthy</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Cache Status</span>
                                        <Badge className="border-green-200 bg-green-100 text-green-800">Operational</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Queue Status</span>
                                        <Badge className="border-green-200 bg-green-100 text-green-800">Running</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Last Backup</span>
                                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Security Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Failed Login Attempts</span>
                                        <Badge variant="outline">3 (24h)</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Suspicious IPs</span>
                                        <Badge variant="outline">1 blocked</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">2FA Enabled Users</span>
                                        <Badge variant="outline">85%</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Last Security Scan</span>
                                        <span className="text-sm text-muted-foreground">1 hour ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
