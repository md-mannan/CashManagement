import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Edit, Plus, Tag, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    type: 'income' | 'expense' | 'receivable' | 'payable' | 'settle_payable' | 'settle_receivable';
    color: string;
    icon?: string;
    is_active: boolean;
    transactions_count: number;
    created_at: string;
}

interface CategoriesPageProps {
    categories: Category[];
    isAdmin: boolean;
}

export default function CategoriesPage({ categories, isAdmin }: CategoriesPageProps) {
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'receivable' | 'payable' | 'settle_payable' | 'settle_receivable'>('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'income' as 'income' | 'expense' | 'receivable' | 'payable' | 'settle_payable' | 'settle_receivable',
        color: '#6B7280',
        icon: '',
    });

    // Filter categories based on search and type
    const filteredCategories = categories.filter((category) => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || category.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'income':
                return TrendingUp;
            case 'expense':
                return TrendingDown;
            case 'receivable':
                return ArrowUpRight;
            case 'payable':
                return ArrowDownLeft;
            case 'settle_payable':
                return ArrowDownLeft;
            case 'settle_receivable':
                return ArrowUpRight;
            default:
                return Tag;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income':
                return 'text-green-600 bg-green-100';
            case 'expense':
                return 'text-red-600 bg-red-100';
            case 'receivable':
                return 'text-blue-600 bg-blue-100';
            case 'payable':
                return 'text-orange-600 bg-orange-100';
            case 'settle_payable':
                return 'text-orange-600 bg-orange-50';
            case 'settle_receivable':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const handleCreate = () => {
        if (!formData.name.trim()) {
            addToast({
                title: 'Error',
                message: 'Category name is required',
                type: 'error',
            });
            return;
        }

        router.post('/categories', formData, {
            onSuccess: () => {
                addToast({
                    title: 'Success',
                    message: 'Category created successfully',
                    type: 'success',
                });
                setShowCreateForm(false);
                setFormData({ name: '', type: 'income' as 'income' | 'expense' | 'receivable' | 'payable' | 'settle_payable' | 'settle_receivable', color: '#6B7280', icon: '' });
            },
            onError: (errors) => {
                addToast({
                    title: 'Error',
                    message: Object.values(errors).join(', '),
                    type: 'error',
                });
            },
        });
    };

    const handleUpdate = () => {
        if (!editingCategory || !formData.name.trim()) {
            addToast({
                title: 'Error',
                message: 'Category name is required',
                type: 'error',
            });
            return;
        }

        router.put(`/categories/${editingCategory.id}`, formData, {
            onSuccess: () => {
                addToast({
                    title: 'Success',
                    message: 'Category updated successfully',
                    type: 'success',
                });
                setEditingCategory(null);
                setFormData({ name: '', type: 'income' as 'income' | 'expense' | 'receivable' | 'payable' | 'settle_payable' | 'settle_receivable', color: '#6B7280', icon: '' });
            },
            onError: (errors) => {
                addToast({
                    title: 'Error',
                    message: Object.values(errors).join(', '),
                    type: 'error',
                });
            },
        });
    };

    const handleDelete = (category: Category) => {
        if (category.transactions_count > 0) {
            addToast({
                title: 'Cannot Delete',
                message: 'This category has transactions and cannot be deleted',
                type: 'error',
            });
            return;
        }

        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;

        router.delete(`/categories/${categoryToDelete.id}`, {
            onSuccess: () => {
                addToast({
                    title: 'Success',
                    message: 'Category deleted successfully',
                    type: 'success',
                });
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
            onError: (errors) => {
                addToast({
                    title: 'Error',
                    message: Object.values(errors).join(', '),
                    type: 'error',
                });
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
        });
    };

    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            type: category.type as 'income' | 'expense' | 'receivable' | 'payable' | 'settle_payable' | 'settle_receivable',
            color: category.color,
            icon: category.icon || '',
        });
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setFormData({ name: '', type: 'income' as 'income' | 'expense' | 'receivable' | 'payable' | 'settle_payable' | 'settle_receivable', color: '#6B7280', icon: '' });
    };

    return (
        <AppLayout>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage your transaction categories</p>
                </div>

                {/* Stats */}
                <div className="mb-6 grid gap-4 md:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Income Categories</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{categories.filter((c) => c.type === 'income').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expense Categories</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{categories.filter((c) => c.type === 'expense').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receivable Categories</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{categories.filter((c) => c.type === 'receivable').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payable Categories</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{categories.filter((c) => c.type === 'payable').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{categories.filter((c) => c.is_active).length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Actions */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters & Actions</CardTitle>
                        <CardDescription>Search and filter categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-end gap-4 md:flex-row">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Search</label>
                                <Input
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                                    <SelectTrigger className="mt-1 w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                                                            <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="receivable">Receivable</SelectItem>
                                            <SelectItem value="payable">Payable</SelectItem>
                                            <SelectItem value="settle_payable">Settle Payable</SelectItem>
                                            <SelectItem value="settle_receivable">Settle Receivable</SelectItem>
                                        </SelectContent>
                                </Select>
                            </div>
                            {isAdmin && (
                                <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Category
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Create/Edit Form */}
                {(showCreateForm || editingCategory) && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</CardTitle>
                            <CardDescription>{editingCategory ? 'Update the category details' : 'Add a new transaction category'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        placeholder="Category name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="receivable">Receivable</SelectItem>
                                            <SelectItem value="payable">Payable</SelectItem>
                                            <SelectItem value="settle_payable">Settle Payable</SelectItem>
                                            <SelectItem value="settle_receivable">Settle Receivable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Color</label>
                                    <Input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="mt-1 h-10"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Icon (optional)</label>
                                    <Input
                                        placeholder="Icon name"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button onClick={editingCategory ? handleUpdate : handleCreate}>{editingCategory ? 'Update' : 'Create'}</Button>
                                <Button variant="outline" onClick={editingCategory ? cancelEdit : () => setShowCreateForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Categories Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                        <CardDescription>
                            Showing {filteredCategories.length} of {categories.length} categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Transactions</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    {isAdmin && <TableHead>Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => {
                                    const TypeIcon = getTypeIcon(category.type);
                                    return (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon className="h-4 w-4" />
                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(category.type)}`}>
                                                        {category.type === 'settle_payable' ? 'Settle Payable' : 
                                                         category.type === 'settle_receivable' ? 'Settle Receivable' : 
                                                         category.type}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 rounded border" style={{ backgroundColor: category.color }} />
                                                    <span className="text-sm text-muted-foreground">{category.color}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{category.transactions_count}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        category.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}
                                                >
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(category.created_at).toLocaleDateString()}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => startEdit(category)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(category)}
                                                            disabled={category.transactions_count > 0}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {filteredCategories.length === 0 && (
                            <div className="py-8 text-center">
                                <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">No categories found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Category Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Delete Category
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setCategoryToDelete(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete Category
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
