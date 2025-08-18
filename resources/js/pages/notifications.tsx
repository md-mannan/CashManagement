import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useNotifications } from '@/hooks/use-notifications';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    Bell,
    CheckCircle,
    DollarSign,
    Info,
    RefreshCw,
    Shield,
    Tag,
    TrendingDown,
    TrendingUp,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationData {
    id: number;
    type:
        | 'success'
        | 'info'
        | 'warning'
        | 'error'
        | 'role_change'
        | 'account_created'
        | 'account_status'
        | 'password_reset'
        | 'transaction_created'
        | 'transaction_updated'
        | 'transaction_deleted'
        | 'category_created'
        | 'category_updated'
        | 'category_deleted'
        | 'user_activity_login'
        | 'user_activity_logout';
    title: string;
    message: string;
    icon?: string;
    color: string;
    data?: any;
    is_read: boolean;
    is_important: boolean;
    time_ago: string;
    created_at: string;
}

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refresh } = useNotifications();
    const { showToast } = useToast();
    const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [typeFilter, setTypeFilter] = useState<
        | 'all'
        | 'success'
        | 'info'
        | 'warning'
        | 'error'
        | 'role_change'
        | 'account_created'
        | 'account_status'
        | 'password_reset'
        | 'transaction_created'
        | 'transaction_updated'
        | 'transaction_deleted'
        | 'category_created'
        | 'category_updated'
        | 'category_deleted'
        | 'user_activity_login'
        | 'user_activity_logout'
    >('all');

    // Filter notifications based on search and filters
    useEffect(() => {
        let filtered = [...notifications];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (notification) =>
                    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        // Apply status filter
        if (statusFilter === 'unread') {
            filtered = filtered.filter((notification) => !notification.is_read);
        } else if (statusFilter === 'read') {
            filtered = filtered.filter((notification) => notification.is_read);
        }

        // Apply type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter((notification) => notification.type === typeFilter);
        }

        setFilteredNotifications(filtered);
    }, [notifications, searchTerm, statusFilter, typeFilter]);

    // Get icon component based on icon name
    const getNotificationIcon = (iconName?: string) => {
        switch (iconName) {
            case 'Activity':
                return Activity;
            case 'CheckCircle':
                return CheckCircle;
            case 'AlertCircle':
                return AlertCircle;
            case 'AlertTriangle':
                return AlertTriangle;
            case 'RefreshCw':
                return RefreshCw;
            case 'Info':
                return Info;
            case 'TrendingUp':
                return TrendingUp;
            case 'TrendingDown':
                return TrendingDown;
            case 'ArrowUpRight':
                return ArrowUpRight;
            case 'ArrowDownLeft':
                return ArrowDownLeft;
            case 'Shield':
                return Shield;
            case 'DollarSign':
                return DollarSign;
            case 'Tag':
                return Tag;
            default:
                return Bell;
        }
    };

    // Get color classes based on color name
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-500';
            case 'red':
                return 'bg-red-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'blue':
                return 'bg-blue-500';
            case 'purple':
                return 'bg-purple-500';
            case 'orange':
                return 'bg-orange-500';
            case 'indigo':
                return 'bg-indigo-500';
            case 'pink':
                return 'bg-pink-500';
            case 'teal':
                return 'bg-teal-500';
            default:
                return 'bg-blue-500';
        }
    };

    // Get type badge variant
    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'success':
                return 'default';
            case 'error':
                return 'destructive';
            case 'warning':
                return 'secondary';
            case 'info':
                return 'outline';
            case 'role_change':
                return 'default';
            case 'account_created':
                return 'default';
            case 'account_status':
                return 'secondary';
            case 'password_reset':
                return 'secondary';
            case 'transaction_created':
            case 'transaction_updated':
            case 'transaction_deleted':
                return 'default';
            case 'category_created':
            case 'category_updated':
            case 'category_deleted':
                return 'secondary';
            case 'user_activity_login':
            case 'user_activity_logout':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await markAsRead(notificationId);
            showToast({
                title: 'Success',
                message: 'Notification marked as read',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                message: 'Failed to mark notification as read',
                type: 'error',
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            showToast({
                title: 'Success',
                message: 'All notifications marked as read',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                message: 'Failed to mark all notifications as read',
                type: 'error',
            });
        }
    };

    const handleDeleteNotification = async (notificationId: number) => {
        try {
            await deleteNotification(notificationId);
            showToast({
                title: 'Success',
                message: 'Notification deleted',
                type: 'success',
            });
        } catch (error) {
            showToast({
                title: 'Error',
                message: 'Failed to delete notification',
                type: 'error',
            });
        }
    };

    const handleRefresh = () => {
        refresh();
        showToast({
            title: 'Refreshing',
            message: 'Notifications refreshed',
            type: 'info',
        });
    };

    return (
        <>
            <Head title="Notifications" />
            <AppLayout>
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Notifications</h1>
                        <p className="text-muted-foreground">View and manage your notifications</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                            Mark all as read
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{notifications.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unread</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Important</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{notifications.filter((n) => n.is_important).length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter notifications by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium">Search</label>
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="unread">Unread</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                        <SelectItem value="role_change">Role Changes</SelectItem>
                                        <SelectItem value="account_created">Account Created</SelectItem>
                                        <SelectItem value="account_status">Account Status</SelectItem>
                                        <SelectItem value="password_reset">Password Reset</SelectItem>
                                        <SelectItem value="transaction_created">Transaction Created</SelectItem>
                                        <SelectItem value="transaction_updated">Transaction Updated</SelectItem>
                                        <SelectItem value="transaction_deleted">Transaction Deleted</SelectItem>
                                        <SelectItem value="category_created">Category Created</SelectItem>
                                        <SelectItem value="category_updated">Category Updated</SelectItem>
                                        <SelectItem value="category_deleted">Category Deleted</SelectItem>
                                        <SelectItem value="user_activity_login">User Login</SelectItem>
                                        <SelectItem value="user_activity_logout">User Logout</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Showing {filteredNotifications.length} of {notifications.length} notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
                                </div>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {notifications.length === 0 ? 'No notifications yet' : 'No notifications match your filters'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredNotifications.map((notification) => {
                                    const IconComponent = getNotificationIcon(notification.icon);

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group relative rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
                                                !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-2 h-2 w-2 rounded-full ${getColorClasses(notification.color)}`}></div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <p
                                                                    className={`text-sm font-medium ${
                                                                        !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {notification.title}
                                                                </p>
                                                                <Badge variant={getTypeBadgeVariant(notification.type)}>
                                                                    {notification.type}
                                                                </Badge>
                                                                {notification.is_important && <Badge variant="destructive">Important</Badge>}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">{notification.time_ago}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                            {!notification.is_read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    title="Mark as read"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                                                onClick={() => handleDeleteNotification(notification.id)}
                                                                title="Delete notification"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            </AppLayout>
        </>
    );
}
