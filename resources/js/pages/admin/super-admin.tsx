import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, Crown, Eye, Facebook, Github, Key, Lock, Shield, Users } from 'lucide-react';
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
        social_accounts: Array<{ provider: string }>;
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
    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const promoteForm = useForm({
        permissions: [] as string[],
    });

    const demoteForm = useForm({
        new_role: 'admin',
        permissions: [] as string[],
    });

    const permissionForm = useForm({
        permissions: [] as string[],
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

    const handleUpdatePermissions = () => {
        if (selectedUser) {
            permissionForm.put(`/admin/super-admin/users/${selectedUser.id}/permissions`, {
                onSuccess: () => {
                    setIsPermissionDialogOpen(false);
                    setSelectedUser(null);
                    permissionForm.reset();
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

    const openPermissionDialog = (user: any) => {
        setSelectedUser(user);
        permissionForm.setData('permissions', user.permissions || []);
        setIsPermissionDialogOpen(true);
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'facebook':
                return <Facebook className="h-4 w-4 text-blue-600" />;
            case 'google':
                return <div className="h-4 w-4 rounded-full bg-gradient-to-r from-red-400 to-blue-500" />;
            case 'github':
                return <Github className="h-4 w-4 text-gray-800" />;
            default:
                return <Key className="h-4 w-4 text-gray-600" />;
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

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Super Admin Management" />

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mt-6 text-3xl font-bold tracking-tight">Super Admin Management</h1>
                            <p className="text-muted-foreground">Manage super admin accounts and system-wide permissions</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/admin/super-admin/audit">
                                    <Eye className="mr-2 h-4 w-4" />
                                    System Audit
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* System Statistics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.total_users.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">{systemStats.users_this_month} new this month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.active_users.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((systemStats.active_users / systemStats.total_users) * 100).toFixed(1)}% of total
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{systemStats.total_admins.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">{systemStats.total_super_admins} super admins</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {calculateGrowth(systemStats.users_this_month, systemStats.users_last_month).toFixed(1)}%
                                </div>
                                <p className="text-xs text-muted-foreground">vs last month</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Super Admins Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-600" />
                                Super Admin Accounts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role & Status</TableHead>
                                        <TableHead>Social Accounts</TableHead>
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
                                                <div className="flex flex-col gap-2">
                                                    <Badge variant="secondary" className="w-fit">
                                                        <Crown className="mr-1 h-3 w-3 text-yellow-600" />
                                                        Super Admin
                                                    </Badge>
                                                    <Badge className={getStatusColor(admin.is_active)}>
                                                        {admin.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {admin.social_accounts.length > 0 ? (
                                                        admin.social_accounts.map((account, index) => (
                                                            <div key={index} title={account.provider}>
                                                                {getProviderIcon(account.provider)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">None</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(admin.created_at)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {admin.last_login_at ? formatDate(admin.last_login_at) : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {!admin.is_current_user && (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => openPermissionDialog(admin)}>
                                                                <Key className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => openDemoteDialog(admin)}>
                                                                <Lock className="h-4 w-4" />
                                                            </Button>
                                                        </>
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
                            <div className="space-y-2">
                                <Label htmlFor="new_role">New Role</Label>
                                <Select value={demoteForm.data.new_role} onValueChange={(value) => demoteForm.setData('new_role', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDemoteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleDemote} disabled={demoteForm.processing}>
                                {demoteForm.processing ? 'Demoting...' : 'Demote User'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Update Permissions Dialog */}
                <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Super Admin Permissions</DialogTitle>
                            <DialogDescription>
                                Update permissions for {selectedUser?.name}. Super admins typically have all permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-50 p-4">
                                <div className="flex">
                                    <Shield className="h-5 w-5 text-blue-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Note</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>
                                                Super admins have access to all system features by default. You can customize specific permissions if
                                                needed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdatePermissions} disabled={permissionForm.processing}>
                                {permissionForm.processing ? 'Updating...' : 'Update Permissions'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </AdminRouteGuard>
    );
}
