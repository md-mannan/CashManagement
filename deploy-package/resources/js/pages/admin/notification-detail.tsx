import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Info, Trash2, User, XCircle } from 'lucide-react';

interface NotificationData {
    id: number;
    type: string;
    title: string;
    message: string;
    icon?: string;
    color: string;
    data?: any;
    is_read: boolean;
    is_important: boolean;
    time_ago: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface Props {
    notification: NotificationData;
}

export default function NotificationDetailPage({ notification }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this notification?')) {
            destroy(route('admin.notifications.destroy', notification.id));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'red':
                return 'bg-red-500';
            case 'green':
                return 'bg-green-500';
            case 'blue':
                return 'bg-blue-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'purple':
                return 'bg-purple-500';
            case 'orange':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <>
            <Head title={`Notification - ${notification.title}`} />

            <div className="container mx-auto space-y-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.notifications.index')}
                            className="flex items-center space-x-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Notifications</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={processing}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Notification Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Notification Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getIcon(notification.type)}
                                        <div>
                                            <CardTitle className="text-lg">{notification.title}</CardTitle>
                                            <CardDescription className="mt-1 flex items-center space-x-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{notification.time_ago}</span>
                                                {notification.is_important && (
                                                    <Badge variant="destructive" className="ml-2">
                                                        Important
                                                    </Badge>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className={`h-3 w-3 rounded-full ${getColorClasses(notification.color)}`}></div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-muted-foreground">{notification.message}</p>

                                {notification.data && Object.keys(notification.data).length > 0 && (
                                    <div className="space-y-3">
                                        <Separator />
                                        <h4 className="text-sm font-medium">Additional Data</h4>
                                        <div className="rounded-md bg-muted p-3">
                                            <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                                                {JSON.stringify(notification.data, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-lg">
                                    <User className="h-5 w-5" />
                                    <span>User Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                                        <p className="text-sm">{notification.user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="text-sm">{notification.user.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                                        <Badge variant="outline" className="mt-1">
                                            {notification.user.role.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <Badge variant={notification.is_read ? 'secondary' : 'default'} className="mt-1">
                                            {notification.is_read ? 'Read' : 'Unread'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Notification Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Notification Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                                    <Badge variant="outline" className="mt-1">
                                        {notification.type}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Color</label>
                                    <div className="mt-1 flex items-center space-x-2">
                                        <div className={`h-4 w-4 rounded-full ${getColorClasses(notification.color)}`}></div>
                                        <span className="text-sm capitalize">{notification.color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                    <p className="text-sm">{new Date(notification.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                                    <p className="font-mono text-sm text-muted-foreground">#{notification.id}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={route('admin.users.show', notification.user.id)}>
                                        <User className="mr-2 h-4 w-4" />
                                        View User Profile
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={route('admin.notifications.index')}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to List
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
