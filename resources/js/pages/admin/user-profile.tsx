import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, Database, Shield, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'User Management', href: '/admin/users' },
    { title: 'User Profile', href: '#' },
];

interface Transaction {
    id: number;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    category: {
        name: string;
    };
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    permissions?: string[];
    effective_permissions?: string[];
    created_at: string;
    updated_at: string;
    transactions: Transaction[];
}

interface Props {
    user: User;
    permissionLabels: Record<string, string>;
}

export default function UserProfile({ user, permissionLabels }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
            full: date.toLocaleString(),
        };
    };

    const createdDate = formatDate(user.created_at);
    const updatedDate = formatDate(user.updated_at);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-red-100 text-red-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`${user.name} - User Profile`} />
                <div className="container mx-auto p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mt-6 text-3xl font-bold tracking-tight">{user.name}</h1>
                            <p className="text-muted-foreground">User Profile & Information</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/admin/users">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Users
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
                                            <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                                            <p className="mt-1 text-sm font-medium">{user.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                                            <p className="mt-1 text-sm font-medium">{user.email}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Role</Label>
                                            <Badge className={`mt-1 ${getRoleColor(user.role)}`}>{user.role.replace('_', ' ').toUpperCase()}</Badge>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Status</Label>
                                            <Badge className={`mt-1 ${getStatusColor(user.is_active)}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Module access (from role) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Module access
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(user.effective_permissions ?? user.permissions ?? []).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {(user.effective_permissions ?? user.permissions ?? []).map((permission) => (
                                                <Badge key={permission} variant="outline" className="text-xs">
                                                    {permissionLabels[permission] ?? permission.replaceAll('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No modules for this role</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Transactions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Transactions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.transactions && user.transactions.length > 0 ? (
                                        <div className="space-y-3">
                                            {user.transactions.map((transaction) => (
                                                <div key={transaction.id} className="flex items-center justify-between rounded border p-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`h-2 w-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <div>
                                                            <p className="font-medium">{transaction.description}</p>
                                                            <p className="text-sm text-gray-500">{transaction.category.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{formatDate(transaction.created_at).date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No transactions found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Account Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Database className="mr-2 h-4 w-4" />
                                        Account Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-center">
                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                                            <User className="h-10 w-10 text-blue-600" />
                                        </div>
                                        <p className="mt-2 font-medium">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">User ID:</span>
                                            <span className="font-mono">{user.id}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Member since:</span>
                                            <span>{createdDate.date}</span>
                                        </div>
                                        {user.updated_at !== user.created_at && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Last updated:</span>
                                                <span>{updatedDate.date}</span>
                                            </div>
                                        )}
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
                                        <Link href={`/admin/users/${user.id}/edit`}>
                                            <User className="mr-2 h-4 w-4" />
                                            Edit User
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/admin/activity-logs?user_id=${user.id}`}>
                                            <Activity className="mr-2 h-4 w-4" />
                                            View User Logs
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
