import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Edit, Key, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Role & Permission', href: '/admin/role-permission' },
];

interface RolePermissionProps {
    roles: Record<string, { name: string; permissions: string[] }>;
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
    }>;
}

export default function RolePermission({ roles, availablePermissions, users }: RolePermissionProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const editForm = useForm({
        role: '',
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
        });
        setIsEditDialogOpen(true);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                            <p className="text-muted-foreground">Manage user roles; each role has a fixed set of modules</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="users" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                            <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="users" className="space-y-4">
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
                                                <TableHead>Created</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id}>
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
                                                    <TableCell>{formatDate(user.created_at)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                                                                <Edit className="h-4 w-4" />
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
                                <DialogDescription>Update this user&apos;s role. Their module access updates automatically.</DialogDescription>
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

                    {/* Bulk Update Dialog */}
                    <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Bulk Update Users</DialogTitle>
                                <DialogDescription>Update role for multiple users at once.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bulk-role" className="text-right">
                                        Role
                                    </Label>
                                    <Select value={bulkForm.data.role} onValueChange={(value) => bulkForm.setData('role', value)}>
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
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleBulkUpdate} disabled={bulkForm.processing}>
                                    Update Users
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
