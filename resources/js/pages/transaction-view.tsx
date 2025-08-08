import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction',
        href: '/transaction',
    },
    {
        title: 'View Transaction',
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

interface TransactionViewProps {
    id: string;
}

export default function TransactionView({ id }: TransactionViewProps) {
    // Find the transaction by ID
    const transaction = mockTransactions.find((t) => t.id === parseInt(id));

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

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'income':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'expense':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'receivable':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'payable':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const handleEdit = () => {
        router.visit(`/transaction/${id}/edit`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            router.delete(`/transaction/${id}`, {
                onSuccess: () => {
                    router.visit('/transaction');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction - ${transaction.description}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/transaction')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Transactions
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
                            <p className="text-muted-foreground">View transaction information</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Transaction
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Transaction
                        </Button>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Main Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                                    <p className="text-lg font-semibold">#{transaction.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                                    <p className="text-lg font-semibold">{formatDate(transaction.date)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="text-lg font-semibold">{transaction.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getTypeColor(transaction.type)}`}
                                        >
                                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                    <p
                                        className={`text-lg font-semibold ${transaction.type === 'income' || transaction.type === 'receivable' ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} KWD{' '}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Source</label>
                                <p className="text-lg font-semibold">{transaction.source}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                <p className="text-lg font-semibold">{transaction.category}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                <p className="mt-1 text-sm text-muted-foreground">{transaction.notes || 'No notes available'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
