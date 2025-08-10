import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, BarChart3, DollarSign, Plus, Receipt, Settings, Shield, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
];

interface AdminDashboardProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        totalAdmins: number;
        totalSuperAdmins: number;
        socialUsers: number;
        newUsersThisMonth: number;
        newUsersLastMonth: number;
        userGrowthRate: number;
        lastLoginToday: number;
        lastLoginThisWeek: number;
    };
    recentUsers: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
        last_login_at: string | null;
        is_active: boolean;
    }>;
    systemHealth: {
        databaseStatus: string;
        cacheStatus: string;
        queueStatus: string;
        lastBackup: string | null;
        diskUsage: number;
        memoryUsage: number;
    };
    recentActivity: Array<{
        id: number;
        user: string;
        action: string;
        target: string;
        created_at: string;
        ip_address: string;
    }>;
}

export default function AdminDashboard({ stats, systemHealth, recentUsers, recentActivity }: AdminDashboardProps) {
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'admin':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
    };

    const getSystemStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admin Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Monitor system health, user activity, and manage the platform</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/admin/users">
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Users
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/transaction">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    All Transactions
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/ledger">
                                    <Receipt className="mr-2 h-4 w-4" />
                                    All Ledger
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/admin/analytics">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Analytics
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.userGrowthRate > 0 ? (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <TrendingUp className="h-3 w-3" />+{stats.userGrowthRate}% from last month
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600">
                                            <TrendingDown className="h-3 w-3" />
                                            {Math.abs(stats.userGrowthRate)}% from last month
                                        </span>
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                                <Shield className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalAdmins + stats.totalSuperAdmins}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.totalSuperAdmins} super admins, {stats.totalAdmins} admins
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Social Users</CardTitle>
                                <Activity className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.socialUsers}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.socialUsers / stats.totalUsers) * 100).toFixed(1)}% use social login
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="users">Recent Users</TabsTrigger>
                            <TabsTrigger value="activity">Activity Log</TabsTrigger>
                            <TabsTrigger value="system">System Health</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            {/* Quick Access Grid */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            User Management
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Total Users</span>
                                                <Badge variant="secondary">{stats.totalUsers}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Active Users</span>
                                                <Badge variant="default">{stats.activeUsers}</Badge>
                                            </div>
                                            <Button asChild size="sm" className="w-full">
                                                <Link href="/admin/users">Manage Users</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            Financial Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">All Transactions</span>
                                                <Badge variant="outline">View All</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Ledger Access</span>
                                                <Badge variant="outline">Full Access</Badge>
                                            </div>
                                            <Button asChild size="sm" className="w-full">
                                                <Link href="/transaction">View Transactions</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Shield className="h-5 w-5 text-purple-600" />
                                            System Control
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Admin Users</span>
                                                <Badge variant="secondary">{stats.totalAdmins + stats.totalSuperAdmins}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">System Health</span>
                                                <Badge variant="default">Monitor</Badge>
                                            </div>
                                            <Button asChild size="sm" className="w-full">
                                                <Link href="/admin/analytics">System Analytics</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* User Growth Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            User Growth
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">This Month</span>
                                                <Badge variant="secondary">{stats.newUsersThisMonth} new users</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Last Month</span>
                                                <Badge variant="outline">{stats.newUsersLastMonth} new users</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Growth Rate</span>
                                                <Badge variant={stats.userGrowthRate >= 0 ? 'default' : 'destructive'}>
                                                    {stats.userGrowthRate >= 0 ? '+' : ''}
                                                    {stats.userGrowthRate}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Login Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Login Activity
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Today</span>
                                                <Badge variant="secondary">{stats.lastLoginToday} logins</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">This Week</span>
                                                <Badge variant="outline">{stats.lastLoginThisWeek} logins</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Active Rate</span>
                                                <Badge variant="default">{((stats.lastLoginThisWeek / stats.activeUsers) * 100).toFixed(1)}%</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="users" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Recent Users
                                        </span>
                                        <Button asChild size="sm">
                                            <Link href="/admin/users">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add User
                                            </Link>
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentUsers.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                                        <span className="text-sm font-medium text-gray-600">{user.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getRoleColor(user.role)}>{user.role.replace('_', ' ').toUpperCase()}</Badge>
                                                    <Badge className={getStatusColor(user.is_active)}>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</Badge>
                                                    <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                        <Activity className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            <span className="text-blue-600">{activity.user}</span> {activity.action}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Target: {activity.target} • IP: {activity.ip_address}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="system" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* System Status */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            System Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Database</span>
                                                <Badge className={getSystemStatusColor(systemHealth.databaseStatus)}>
                                                    {systemHealth.databaseStatus.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Cache</span>
                                                <Badge className={getSystemStatusColor(systemHealth.cacheStatus)}>
                                                    {systemHealth.cacheStatus.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Queue</span>
                                                <Badge className={getSystemStatusColor(systemHealth.queueStatus)}>
                                                    {systemHealth.queueStatus.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* System Resources */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            System Resources
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Disk Usage</span>
                                                <Badge variant={systemHealth.diskUsage > 80 ? 'destructive' : 'secondary'}>
                                                    {systemHealth.diskUsage}%
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Memory Usage</span>
                                                <Badge variant={systemHealth.memoryUsage > 80 ? 'destructive' : 'secondary'}>
                                                    {systemHealth.memoryUsage}%
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Last Backup</span>
                                                <Badge variant="outline">
                                                    {systemHealth.lastBackup ? formatDate(systemHealth.lastBackup) : 'Never'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
