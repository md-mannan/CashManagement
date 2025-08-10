import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Chrome, Download, Edit, Facebook, Github, Key, Settings, Shield, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Role & Permission Management',
        href: '/admin/role-permission',
    },
];

interface RolePermissionProps {
    roles: Record<
        string,
        {
            name: string;
            description: string;
            permissions: string[];
            user_count: number;
        }
    >;
    availablePermissions: Record<string, string>;
    users: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        permissions: string[];
        is_active: boolean;
        created_at: string;
        last_login_at: string | null;
        social_accounts: Array<{ provider: string }>;
    }>;
}

export default function RolePermission({ roles, availablePermissions, users }: RolePermissionProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const editForm = useForm({
        role: '',
        permissions: [] as string[],
    });

    const permissionForm = useForm({
        permissions: [] as string[],
    });

    const bulkForm = useForm({
        user_ids: [] as number[],
        role: '',
    });

    const handleEditUser = () => {
        if (selectedUser) {
            editForm.put(`/admin/role-permission/users/${selectedUser.id}/role`, {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                    editForm.reset();
                },
            });
        }
    };

    const handleUpdatePermissions = () => {
        if (selectedUser) {
            permissionForm.put(`/admin/role-permission/users/${selectedUser.id}/permissions`, {
                onSuccess: () => {
                    setIsPermissionDialogOpen(false);
                    setSelectedUser(null);
                    permissionForm.reset();
                },
            });
        }
    };

    const handleBulkUpdate = () => {
        bulkForm.post('/admin/role-permission/bulk-update', {
            onSuccess: () => {
                setIsBulkDialogOpen(false);
                setSelectedUsers([]);
                bulkForm.reset();
            },
        });
    };

    const openEditDialog = (user: (typeof users)[0]) => {
        setSelectedUser(user);
        editForm.setData({
            role: user.role,
            permissions: user.permissions || [],
        });
        setIsEditDialogOpen(true);
    };

    const openPermissionDialog = (user: (typeof users)[0]) => {
        setSelectedUser(user);
        permissionForm.setData({
            permissions: user.permissions || [],
        });
        setIsPermissionDialogOpen(true);
    };

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

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'facebook':
                return <Facebook className="h-4 w-4 text-blue-600" />;
            case 'google':
                return <Chrome className="h-4 w-4 text-red-600" />;
            case 'github':
                return <Github className="h-4 w-4 text-gray-800" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleUserSelection = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, userId]);
        } else {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(users.map((user) => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Role & Permission Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Role & Permission Management</h1>
                            <p className="text-muted-foreground">Manage user roles, permissions, and access levels</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/admin/users">
                                    <Users className="mr-2 h-4 w-4" />
                                    User Management
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <a href="/admin/role-permission/export" download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Users
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="roles" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="roles">Roles Overview</TabsTrigger>
                            <TabsTrigger value="users">User Management</TabsTrigger>
                            <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="roles" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {Object.entries(roles).map(([roleKey, role]) => (
                                    <Card key={roleKey}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5" />
                                                {role.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-4 text-sm text-muted-foreground">{role.description}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Users</span>
                                                    <Badge variant="secondary">{role.user_count}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Permissions</span>
                                                    <Badge variant="outline">
                                                        {role.permissions.includes('*') ? 'All' : role.permissions.length}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="mb-2 text-sm font-medium">Default Permissions:</h4>
                                                <div className="space-y-1">
                                                    {role.permissions.includes('*') ? (
                                                        <Badge variant="default" className="text-xs">
                                                            All Permissions
                                                        </Badge>
                                                    ) : (
                                                        role.permissions.map((permission) => (
                                                            <Badge key={permission} variant="outline" className="mr-1 mb-1 text-xs">
                                                                {availablePermissions[permission] || permission}
                                                            </Badge>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="users" className="space-y-4">
                            {/* Bulk Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Bulk Actions</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsBulkDialogOpen(true)}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Bulk Update ({selectedUsers.length} selected)
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectedUsers.length === users.length && users.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                            <Label htmlFor="select-all">Select All</Label>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {selectedUsers.length} of {users.length} users selected
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Users Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        All Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectedUsers.length === users.length && users.length > 0}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Social</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedUsers.includes(user.id)}
                                                            onCheckedChange={(checked) => handleUserSelection(user.id, !!checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getRoleColor(user.role)}>{user.role.replace('_', ' ').toUpperCase()}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(user.is_active)}>
                                                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {user.social_accounts.map((account, index) => (
                                                                <div key={index}>{getProviderIcon(account.provider)}</div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => openPermissionDialog(user)}>
                                                                <Key className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="permissions" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        Available Permissions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.entries(availablePermissions).map(([key, label]) => (
                                            <div key={key} className="flex items-center space-x-2 rounded-lg border p-3">
                                                <Key className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">{label}</p>
                                                    <p className="text-sm text-muted-foreground">{key}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Edit User Role Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit User Role</DialogTitle>
                                <DialogDescription>Update user role and permissions.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">
                                        Role
                                    </Label>
                                    <Select value={editForm.data.role} onValueChange={(value) => editForm.setData('role', value)}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(roles).map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {roles[role].name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Permissions</Label>
                                    <div className="col-span-3 space-y-2">
                                        {Object.entries(availablePermissions).map(([key, label]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`edit-perm-${key}`}
                                                    checked={editForm.data.permissions.includes(key)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            editForm.setData('permissions', [...editForm.data.permissions, key]);
                                                        } else {
                                                            editForm.setData(
                                                                'permissions',
                                                                editForm.data.permissions.filter((p) => p !== key),
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`edit-perm-${key}`} className="text-sm">
                                                    {label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleEditUser} disabled={editForm.processing}>
                                    Update Role
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Permissions Dialog */}
                    <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit User Permissions</DialogTitle>
                                <DialogDescription>Update specific user permissions.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Permissions</Label>
                                    <div className="col-span-3 space-y-2">
                                        {Object.entries(availablePermissions).map(([key, label]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`perm-${key}`}
                                                    checked={permissionForm.data.permissions.includes(key)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            permissionForm.setData('permissions', [...permissionForm.data.permissions, key]);
                                                        } else {
                                                            permissionForm.setData(
                                                                'permissions',
                                                                permissionForm.data.permissions.filter((p) => p !== key),
                                                            );
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`perm-${key}`} className="text-sm">
                                                    {label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdatePermissions} disabled={permissionForm.processing}>
                                    Update Permissions
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Bulk Update Dialog */}
                    <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Bulk Update Roles</DialogTitle>
                                <DialogDescription>Update roles for {selectedUsers.length} selected users.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bulk-role" className="text-right">
                                        New Role
                                    </Label>
                                    <Select value={bulkForm.data.role} onValueChange={(value) => bulkForm.setData('role', value)}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(roles).map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {roles[role].name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleBulkUpdate} disabled={bulkForm.processing || !bulkForm.data.role}>
                                    Update {selectedUsers.length} Users
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
