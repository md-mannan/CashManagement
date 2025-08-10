import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Chrome, Edit, Facebook, Github, Key, Plus, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'User Management',
        href: '/admin/users',
    },
];

export default function UserManagement() {
    const { users, roles, permissions } = usePage<
        SharedData & {
            users: {
                data: Array<{
                    id: number;
                    name: string;
                    email: string;
                    role: string;
                    is_active: boolean;
                    created_at: string;
                    last_login_at: string | null;
                    social_accounts: Array<{
                        provider: string;
                    }>;
                    permissions?: string[];
                }>;
                current_page: number;
                last_page: number;
                total: number;
            };
            roles: string[];
            permissions: Record<string, string>;
        }
    >().props;

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{
        id: number;
        name: string;
        email: string;
        role: string;
        is_active: boolean;
        permissions?: string[];
    } | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        permissions: [] as string[],
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        email: '',
        role: '',
        permissions: [] as string[],
        is_active: true,
    });

    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleCreateUser = () => {
        createForm.post('/admin/users', {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditUser = () => {
        if (selectedUser) {
            editForm.put(`/admin/users/${selectedUser.id}`, {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                    editForm.reset();
                },
            });
        }
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            editForm.delete(`/admin/users/${selectedUser.id}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedUser(null);
                },
            });
        }
    };

    const handleToggleStatus = (user: { id: number; is_active: boolean }) => {
        editForm.post(`/admin/users/${user.id}/toggle-status`);
    };

    const handleResetPassword = () => {
        if (selectedUser) {
            passwordForm.post(`/admin/users/${selectedUser.id}/reset-password`, {
                onSuccess: () => {
                    setIsPasswordDialogOpen(false);
                    setSelectedUser(null);
                    passwordForm.reset();
                },
            });
        }
    };

    const openEditDialog = (user: { id: number; name: string; email: string; role: string; is_active: boolean; permissions?: string[] }) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions || [],
            is_active: user.is_active,
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (user: { id: number; name: string; email: string; role: string; is_active: boolean; permissions?: string[] }) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const openPasswordDialog = (user: { id: number; name: string; email: string; role: string; is_active: boolean; permissions?: string[] }) => {
        setSelectedUser(user);
        setIsPasswordDialogOpen(true);
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

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Management" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                            <p className="text-muted-foreground">Manage users, roles, and permissions across the system</p>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Create New User</DialogTitle>
                                    <DialogDescription>Add a new user to the system with appropriate role and permissions.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) => createForm.setData('email', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="password" className="text-right">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="password_confirmation" className="text-right">
                                            Confirm
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={createForm.data.password_confirmation}
                                            onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="role" className="text-right">
                                            Role
                                        </Label>
                                        <Select value={createForm.data.role} onValueChange={(value) => createForm.setData('role', value)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role.replace('_', ' ').toUpperCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Active</Label>
                                        <Toggle
                                            pressed={createForm.data.is_active}
                                            onPressedChange={(pressed) => createForm.setData('is_active', pressed)}
                                            className="col-span-3"
                                        >
                                            {createForm.data.is_active ? 'Active' : 'Inactive'}
                                        </Toggle>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Permissions</Label>
                                        <div className="col-span-3 space-y-2">
                                            {Object.entries(permissions).map(([key, label]) => (
                                                <div key={key} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`perm-${key}`}
                                                        checked={createForm.data.permissions.includes(key)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                createForm.setData('permissions', [...createForm.data.permissions, key]);
                                                            } else {
                                                                createForm.setData(
                                                                    'permissions',
                                                                    createForm.data.permissions.filter((p) => p !== key),
                                                                );
                                                            }
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <label htmlFor={`perm-${key}`} className="text-sm text-gray-700">
                                                        {label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateUser} disabled={createForm.processing}>
                                        Create User
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* User Management Tabs */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">All Users ({users.total})</TabsTrigger>
                            <TabsTrigger value="active">Active ({users.data.filter((u) => u.is_active).length})</TabsTrigger>
                            <TabsTrigger value="admins">
                                Admins ({users.data.filter((u) => ['admin', 'super_admin'].includes(u.role)).length})
                            </TabsTrigger>
                            <TabsTrigger value="social">Social ({users.data.filter((u) => u.social_accounts.length > 0).length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
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
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Social</TableHead>
                                                <TableHead>Last Login</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.data.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}
                                                        >
                                                            {user.role.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(user.is_active)}`}
                                                        >
                                                            {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {user.social_accounts.map((account, index) => (
                                                                <div key={index} className="flex items-center gap-1">
                                                                    {getProviderIcon(account.provider)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => openPasswordDialog(user)}>
                                                                <Key className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => handleToggleStatus(user)}>
                                                                {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openDeleteDialog(user)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
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

                        {/* Other tabs would show filtered data */}
                        <TabsContent value="active" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Showing {users.data.filter((u) => u.is_active).length} active users</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="admins" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Administrators</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Showing {users.data.filter((u) => ['admin', 'super_admin'].includes(u.role)).length} admin users
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="social" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Social Users</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Showing {users.data.filter((u) => u.social_accounts.length > 0).length} users with social accounts
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Edit User Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>Update user information and permissions.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-email" className="text-right">
                                        Email
                                    </Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-role" className="text-right">
                                        Role
                                    </Label>
                                    <Select value={editForm.data.role} onValueChange={(value) => editForm.setData('role', value)}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.replace('_', ' ').toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Active</Label>
                                    <Toggle
                                        pressed={editForm.data.is_active}
                                        onPressedChange={(pressed) => editForm.setData('is_active', pressed)}
                                        className="col-span-3"
                                    >
                                        {editForm.data.is_active ? 'Active' : 'Inactive'}
                                    </Toggle>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Permissions</Label>
                                    <div className="col-span-3 space-y-2">
                                        {Object.entries(permissions).map(([key, label]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`edit-perm-${key}`}
                                                    checked={editForm.data.permissions.includes(key)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            editForm.setData('permissions', [...editForm.data.permissions, key]);
                                                        } else {
                                                            editForm.setData(
                                                                'permissions',
                                                                editForm.data.permissions.filter((p) => p !== key),
                                                            );
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`edit-perm-${key}`} className="text-sm text-gray-700">
                                                    {label}
                                                </label>
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
                                    Update User
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete User Dialog */}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete User</DialogTitle>
                                <DialogDescription>Are you sure you want to delete this user? This action cannot be undone.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteUser} disabled={editForm.processing}>
                                    Delete User
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Reset Password Dialog */}
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Reset User Password</DialogTitle>
                                <DialogDescription>
                                    Set a new password for this user. They will be required to change it on next login.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="new-password" className="text-right">
                                        New Password
                                    </Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="confirm-password" className="text-right">
                                        Confirm
                                    </Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleResetPassword} disabled={passwordForm.processing}>
                                    Reset Password
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
