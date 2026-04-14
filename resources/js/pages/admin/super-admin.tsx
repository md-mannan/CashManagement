import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, Lock, Shield, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Super Admin', href: '/admin/super-admin' },
];

interface SuperAdminProps {
    superAdmins: Array<{
        id: number;
        name: string;
        email: string;
        permissions: string[];
        is_active: boolean;
        created_at: string;
        last_login_at: string | null;
        is_current_user: boolean;
    }>;
    systemStats: {
        total_users: number;
        total_admins: number;
        total_super_admins: number;
        active_users: number;
        inactive_users: number;
        users_this_month: number;
        users_last_month: number;
    };
}

export default function SuperAdmin({ superAdmins, systemStats }: SuperAdminProps) {
    const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
    const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const promoteForm = useForm({});

    const demoteForm = useForm({
        new_role: 'admin',
    });

    const handlePromote = () => {
        if (selectedUser) {
            promoteForm.post(`/admin/super-admin/users/${selectedUser.id}/promote`, {
                onSuccess: () => {
                    setIsPromoteDialogOpen(false);
                    setSelectedUser(null);
                    promoteForm.reset();
                },
            });
        }
    };

    const handleDemote = () => {
        if (selectedUser) {
            demoteForm.post(`/admin/super-admin/users/${selectedUser.id}/demote`, {
                onSuccess: () => {
                    setIsDemoteDialogOpen(false);
                    setSelectedUser(null);
                    demoteForm.reset();
                },
            });
        }
    };

    const openPromoteDialog = (user: any) => {
        setSelectedUser(user);
        setIsPromoteDialogOpen(true);
    };

    const openDemoteDialog = (user: any) => {
        setSelectedUser(user);
        demoteForm.setData('new_role', 'admin');
        setIsDemoteDialogOpen(true);
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Super Admin Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Super Admin Management</h1>
                            <p className="text-muted-foreground">Manage super administrators and system access</p>
                        </div>
                    </div>

                    {/* System Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.total_users}</div>
                                <p className="text-xs text-muted-foreground">All registered users</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.active_users}</div>
                                <p className="text-xs text-muted-foreground">Currently active</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.total_admins}</div>
                                <p className="text-xs text-muted-foreground">Administrative users</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.total_super_admins}</div>
                                <p className="text-xs text-muted-foreground">Full system access</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Super Admins Table */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Super Administrators
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Last Login</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {superAdmins.map((admin) => (
                                            <TableRow key={admin.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{admin.name}</div>
                                                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                                            Super Admin
                                                        </Badge>
                                                        <Badge className={getStatusColor(admin.is_active)}>
                                                            {admin.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(admin.created_at)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {admin.last_login_at ? formatDate(admin.last_login_at) : 'Never'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {!admin.is_current_user && (
                                                            <Button size="sm" variant="destructive" onClick={() => openDemoteDialog(admin)}>
                                                                <Lock className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {admin.is_current_user && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Current User
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                {/* Promote User Dialog */}
                <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Promote User to Super Admin</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to promote {selectedUser?.name} to super admin? This will give them full system access.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-yellow-50 p-4">
                                <div className="flex">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>Super admins have complete access to the system, including the ability to:</p>
                                            <ul className="mt-1 list-inside list-disc">
                                                <li>Manage all users and admins</li>
                                                <li>Access system settings</li>
                                                <li>View audit logs</li>
                                                <li>Perform system maintenance</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handlePromote} disabled={promoteForm.processing}>
                                {promoteForm.processing ? 'Promoting...' : 'Promote to Super Admin'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Demote User Dialog */}
                <Dialog open={isDemoteDialogOpen} onOpenChange={setIsDemoteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Demote Super Admin</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to demote {selectedUser?.name} from super admin? This will reduce their permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-yellow-50 p-4">
                                <div className="flex">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>This action will:</p>
                                            <ul className="mt-1 list-inside list-disc">
                                                <li>Remove super admin privileges</li>
                                                <li>Restrict system access</li>
                                                <li>Require re-authorization for sensitive operations</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDemoteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDemote} disabled={demoteForm.processing}>
                                {demoteForm.processing ? 'Demoting...' : 'Demote Super Admin'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
