import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Monitor, User, UserCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Super Admin', href: '/admin/super-admin' },
    { title: 'System Audit', href: '/admin/super-admin/audit' },
    { title: 'View Log', href: '#' },
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
    updated_at: string;
}

interface Props {
    activityLog: ActivityLog;
}

export default function ActivityLogView({ activityLog }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
            full: date.toLocaleString(),
        };
    };

    const dateInfo = formatDate(activityLog.created_at);

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Activity Log #${activityLog.id}`} />
                <div className="container mx-auto p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mt-6 text-3xl font-bold tracking-tight">Activity Log #{activityLog.id}</h1>
                            <p className="text-muted-foreground">Detailed view of system activity</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/admin/super-admin/audit">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to System Audit
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Information */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="mr-2 h-4 w-4" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Action</Label>
                                            <p className="mt-1 text-sm">{activityLog.action.replace('_', ' ').toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Description</Label>
                                            <p className="mt-1 text-sm">{activityLog.description}</p>
                                        </div>
                                        {activityLog.target_type && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Target Type</Label>
                                                <p className="mt-1 text-sm">{activityLog.target_type}</p>
                                            </div>
                                        )}
                                        {activityLog.target_id && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-500">Target ID</Label>
                                                <p className="mt-1 text-sm">{activityLog.target_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        User Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {activityLog.user ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{activityLog.user.name}</p>
                                                    <p className="text-sm text-gray-500">{activityLog.user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/users/${activityLog.user.id}`}>View User Profile</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center">
                                            <User className="mx-auto h-8 w-8 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">System Action</p>
                                            <p className="text-xs text-gray-400">No user associated with this action</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Technical Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Monitor className="mr-2 h-4 w-4" />
                                        Technical Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {activityLog.ip_address && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">IP Address</Label>
                                            <p className="mt-1 font-mono text-sm">{activityLog.ip_address}</p>
                                        </div>
                                    )}
                                    {activityLog.user_agent && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">User Agent</Label>
                                            <p className="mt-1 text-sm break-all">{activityLog.user_agent}</p>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Log ID</Label>
                                        <p className="mt-1 font-mono text-sm">{activityLog.id}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Timestamp */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4" />
                                        Timestamp
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{dateInfo.date}</div>
                                        <div className="text-sm text-gray-500">{dateInfo.time}</div>
                                        <div className="mt-1 text-xs text-gray-400">{dateInfo.full}</div>
                                    </div>
                                    <Separator />
                                    <div className="text-center">
                                        <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">Created</p>
                                        <p className="text-xs text-gray-400">
                                            {activityLog.updated_at !== activityLog.created_at ? 'Modified' : 'Never modified'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href="/admin/activity-logs">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Logs
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/admin/activity-logs?search=${activityLog.action}`}>
                                            <Monitor className="mr-2 h-4 w-4" />
                                            View Similar Actions
                                        </Link>
                                    </Button>
                                    {activityLog.user && (
                                        <Button variant="outline" size="sm" className="w-full" asChild>
                                            <Link href={`/admin/activity-logs?user_id=${activityLog.user.id}`}>
                                                <User className="mr-2 h-4 w-4" />
                                                View User Logs
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
