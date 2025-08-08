import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction',
        href: '/transaction',
    },
    {
        title: 'Edit Transaction',
        href: '#',
    },
];

// Mock transaction data - replace with actual data from your backend
const mockTransactions = [
    {
        id: 1,
        date: '2024-01-15',
        description: 'Salary Payment',
        type: 'income',
        amount: 3750.0,
        source: 'Company Inc.',
        category: 'Salary',
        notes: 'Monthly salary payment for January 2024',
    },
    {
        id: 2,
        date: '2024-01-08',
        description: 'Grocery Shopping',
        type: 'expense',
        amount: 450.0,
        source: 'Local Supermarket',
        category: 'Food & Dining',
        notes: 'Weekly grocery shopping for household items',
    },
    {
        id: 3,
        date: '2024-01-12',
        description: 'Freelance Project',
        type: 'income',
        amount: 1200.0,
        source: 'Client XYZ',
        category: 'Freelance',
        notes: 'Web development project for client XYZ',
    },
    {
        id: 4,
        date: '2024-01-15',
        description: 'Utility Bills',
        type: 'expense',
        amount: 180.0,
        source: 'Electricity Co.',
        category: 'Utilities',
        notes: 'Monthly electricity bill payment',
    },
    {
        id: 5,
        date: '2024-01-18',
        description: 'Investment Dividend',
        type: 'income',
        amount: 500.0,
        source: 'Investment Bank',
        category: 'Investment',
        notes: 'Quarterly dividend from investment portfolio',
    },
    {
        id: 6,
        date: '2024-01-22',
        description: 'Restaurant Dinner',
        type: 'expense',
        amount: 120.0,
        source: 'Fine Dining',
        category: 'Food & Dining',
        notes: 'Dinner at fine dining restaurant',
    },
    {
        id: 7,
        date: '2024-01-25',
        description: 'Client Payment Due',
        type: 'receivable',
        amount: 2500.0,
        source: 'Client ABC',
        category: 'Client Payment',
        notes: 'Payment due from client for completed project',
    },
    {
        id: 8,
        date: '2024-01-28',
        description: 'Loan Repayment',
        type: 'receivable',
        amount: 800.0,
        source: 'Friend Loan',
        category: 'Loan Repayment',
        notes: 'Loan repayment from friend',
    },
    {
        id: 9,
        date: '2024-01-30',
        description: 'Credit Card Bill',
        type: 'payable',
        amount: 350.0,
        source: 'Bank Credit Card',
        category: 'Credit Card',
        notes: 'Monthly credit card bill payment',
    },
    {
        id: 10,
        date: '2024-02-01',
        description: 'Rent Payment',
        type: 'payable',
        amount: 1200.0,
        source: 'Landlord',
        category: 'Rent',
        notes: 'Monthly rent payment to landlord',
    },
    {
        id: 11,
        date: '2024-02-03',
        description: 'Rental Income',
        type: 'receivable',
        amount: 1500.0,
        source: 'Tenant',
        category: 'Rental Payment',
        notes: 'Rental income from property',
    },
    {
        id: 12,
        date: '2024-02-05',
        description: 'Tax Payment',
        type: 'payable',
        amount: 750.0,
        source: 'Tax Authority',
        category: 'Taxes',
        notes: 'Quarterly tax payment',
    },
];

const transactionTypes = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'receivable', label: 'Receivable' },
    { value: 'payable', label: 'Payable' },
];

const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Dividend', 'Rental Income', 'Business Income', 'Other Income'],
    expense: ['Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other Expenses'],
    receivable: ['Client Payment', 'Loan Repayment', 'Rental Payment', 'Investment Return', 'Other Receivable'],
    payable: ['Bills', 'Loan Payment', 'Credit Card', 'Rent', 'Taxes', 'Other Payable'],
};

interface TransactionEditProps {
    id: string;
}

interface TransactionFormData {
    date: string;
    description: string;
    type: 'income' | 'expense' | 'receivable' | 'payable';
    amount: number;
    source: string;
    category: string;
    notes: string;
}

export default function TransactionEdit({ id }: TransactionEditProps) {
    // Find the transaction by ID
    const transaction = mockTransactions.find((t) => t.id === parseInt(id));

    const [formData, setFormData] = useState<TransactionFormData>({
        date: '',
        description: '',
        type: 'income',
        amount: 0,
        source: '',
        category: '',
        notes: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    // Initialize form data when transaction is found
    useEffect(() => {
        if (transaction) {
            setFormData({
                date: transaction.date,
                description: transaction.description,
                type: transaction.type,
                amount: transaction.amount,
                source: transaction.source,
                category: transaction.category,
                notes: transaction.notes || '',
            });
        }
    }, [transaction]);

    if (!transaction) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Transaction Not Found" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Transaction Not Found</h1>
                            <p className="mt-2 text-gray-600">The transaction you're looking for doesn't exist.</p>
                            <Button onClick={() => router.visit('/transaction')} className="mt-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Transactions
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const handleInputChange = (field: keyof TransactionFormData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Updated transaction data:', formData);
            // Here you would typically send the data to your backend
            router.visit(`/transaction/${id}`);
        }, 1000);
    };

    const handleCancel = () => {
        router.visit(`/transaction/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Transaction - ${transaction.description}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit(`/transaction/${id}`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Transaction
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Transaction</h1>
                            <p className="text-muted-foreground">Update transaction information</p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transactionTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Input
                                    id="description"
                                    placeholder="Enter transaction description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.001"
                                        placeholder="0.000"
                                        value={formData.amount || ''}
                                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories[formData.type]?.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Source */}
                            <div className="space-y-2">
                                <Label htmlFor="source">Source *</Label>
                                <Input
                                    id="source"
                                    placeholder="Enter source (e.g., Company Inc., Local Store)"
                                    value={formData.source}
                                    onChange={(e) => handleInputChange('source', e.target.value)}
                                    required
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional notes..."
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-4 border-t pt-6">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
