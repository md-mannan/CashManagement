import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
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

// Real transaction data comes from backend via Inertia props

// Available currencies for displaying symbols
const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م' },
];

export default function TransactionView() {
    const { auth, transaction } = usePage<SharedData & {
        transaction: {
            id: number;
            date: string;
            description: string;
            type: 'income' | 'expense' | 'receivable' | 'payable';
            amount: number;
            source: string;
            category: {
                name: string;
                color: string;
            };
            notes?: string;
            currency: string;
            status: string;
            metadata?: {
                secondary_currency?: string;
                exchange_rate?: number;
                secondary_amount?: number;
                primary_currency?: string;
                primary_symbol?: string;
            };
        };
    }>().props;

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

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'USD';
    const primarySymbol = auth.user.primary_symbol || '$';


    // Determine a display currency different from primary
    const getThirdCurrency = () => {
        switch (primaryCurrency) {
            case 'EUR':
                return { code: 'KWD', symbol: 'د.ك', rate: 3.25 };
            case 'KWD':
                return { code: 'EUR', symbol: '€', rate: 0.9 };
            case 'BDT':
                return { code: 'USD', symbol: '$', rate: 1.0 };
            default:
                return { code: 'EUR', symbol: '€', rate: 0.9 };
        }
    };

    const thirdCurrency = getThirdCurrency();



    // Format currency
    const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
        // Round the amount first to avoid floating point precision issues
        const roundedAmount = Math.round(amount * 1000) / 1000;

        const formatNumber = (num: number, decimals: number) => {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        };

        // Handle different currencies with appropriate decimal places
        if (currency === 'KWD' || currency === thirdCurrency.code && thirdCurrency.code === 'KWD') {
            return formatNumber(roundedAmount, 3); // 3 decimal places for KWD
        }
        return formatNumber(roundedAmount, 2); // 2 decimal places for other currencies
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
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
        router.visit(`/transaction/${transaction.id}/edit`);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            router.delete(`/transaction/${transaction.id}`, {
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
                                        {transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} {primarySymbol}{' '}
                                        {formatCurrency(transaction.amount, primaryCurrency)}
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
                                <p className="text-lg font-semibold">{transaction.category.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                <p className="mt-1 text-sm text-muted-foreground">{transaction.notes || 'No notes available'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dual Currency Information */}
                    {transaction.metadata?.secondary_currency && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recorded Currency Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Primary Currency (Recorded) */}
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                                        <div className="mb-2 text-sm font-medium text-muted-foreground">Primary Amount</div>
                                        <div className="mb-1 text-2xl font-bold text-primary">
                                            {primarySymbol} {formatCurrency(transaction.amount, primaryCurrency)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{primaryCurrency}</div>
                                    </div>

                                    {/* Secondary Currency (Recorded) */}
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                                        <div className="mb-2 text-sm font-medium text-muted-foreground">Secondary Amount</div>
                                        <div className="mb-1 text-2xl font-bold text-blue-600">
                                            {currencies.find((c) => c.code === transaction.metadata?.secondary_currency)?.symbol ||
                                                transaction.metadata?.secondary_currency}{' '}
                                            {formatCurrency(transaction.metadata?.secondary_amount || 0, transaction.metadata?.secondary_currency || 'USD')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{transaction.metadata?.secondary_currency}</div>
                                    </div>
                                </div>

                                {/* Exchange Rate Information */}
                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="text-center">
                                        <div className="mb-2 text-sm font-medium text-muted-foreground">Exchange Rate Used</div>
                                        <div className="text-lg font-semibold text-gray-700">
                                            1 {transaction.metadata?.secondary_currency} = {transaction.metadata?.exchange_rate} {primaryCurrency}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
