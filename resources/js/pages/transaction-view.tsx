import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, DollarSign, RefreshCw, Calendar } from 'lucide-react';
// import SettlementModal from '@/components/Transactions/SettlementModal';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { getExchangeRateForTransaction } from '@/services/exchangeRateService';

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
    const [showSettlementModal, setShowSettlementModal] = useState(false);
    const { addToast } = useToast();

    const { auth, transaction, settlementSummary, settlementCategories, flash, errors } = usePage<
        SharedData & {
            flash?: { success?: string; error?: string };
            errors?: Record<string, string[]>;
            transaction: {
                id: number;
                date: string;
                description: string;
                type: 'income' | 'expense' | 'receivable' | 'payable' | 'settlement';
                amount: number;
                source: string;
                category: {
                    name: string;
                    color: string;
                };
                notes?: string;
                currency: string;
                status: string;
                settled_amount?: number;
                metadata?: {
                    secondary_currency?: string;
                    exchange_rate?: number;
                    secondary_amount?: number;
                    primary_currency?: string;
                    primary_symbol?: string;
                };
            };
            settlementSummary?: {
                total_amount: number;
                settled_amount: number;
                remaining_amount: number;
                status: string;
                secondary_currency?: string;
                secondary_total_amount?: number;
                secondary_settled_amount?: number;
                secondary_remaining_amount?: number;
                exchange_rate?: number;
                settlements: Array<{
                    id: number;
                    date: string;
                    amount: number;
                    description: string;
                    category: string;
                    category_color: string;
                    secondary_amount?: number;
                }>;
            };
            settlementCategories?: Array<{
                id: number;
                name: string;
                type: string;
                color: string;
            }>;
        }
    >().props;

    // Show toast when delete fails (e.g. transaction has settlements)
    useEffect(() => {
        const msg = errors?.['delete']?.[0] ?? flash?.error;
        if (msg) {
            addToast({
                type: 'error',
                title: 'Cannot delete transaction',
                message: msg,
            });
        }
    }, [errors, flash, addToast]);

    const [settlementFormData, setSettlementFormData] = useState({
        category: settlementCategories?.[0]?.type || 'settle_payable',
        description: '',
    });

    if (!transaction) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Transaction Not Found" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Transaction Not Found</h1>
                            <p className="mt-2 text-gray-600">The transaction you're looking for doesn't exist.</p>
                            <Button onClick={() => router.visit(route('transactions.index'))} className="mt-4">
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
    const primaryCurrency = auth.user.primary_currency || 'BDT';
    const primarySymbol = auth.user.primary_symbol || '৳';

    // Available currencies for selection
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

    // Helper function to get currency input properties
    const getCurrencyInputProps = (currencyCode: string) => {
        const currency = currencies.find((c) => c.code === currencyCode);
        if (currencyCode === 'KWD') {
            return { placeholder: '0.000', step: '0.001' };
        }
        return { placeholder: '0.00', step: '0.01' };
    };

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
        if (currency === 'KWD') {
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
        router.visit(route('transactions.edit', transaction.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            router.delete(route('transactions.destroy', transaction.id), {
                onSuccess: () => {
                    router.visit(route('transactions.index'));
                },
                onError: (errs) => {
                    const msg =
                        (typeof errs === 'object' && (errs as Record<string, string[]>)?.delete?.[0]) ||
                        (typeof errs === 'object' && (errs as Record<string, string>)?.message) ||
                        'This transaction could not be deleted. It may have settlement entries linked to it—delete those from this page first, then delete the transaction.';
                    addToast({
                        type: 'error',
                        title: 'Cannot delete transaction',
                        message: typeof msg === 'string' ? msg : 'This transaction may have settlement entries linked to it. Delete those first.',
                    });
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
                        <Button variant="outline" onClick={() => router.visit(route('transactions.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Transactions
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
                            <p className="text-muted-foreground">View transaction information</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Show Settle button only for payable and receivable transactions that are not fully settled */}
                        {settlementSummary && settlementSummary.remaining_amount > 0 && (
                            <Button 
                                onClick={() => setShowSettlementModal(true)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Settle {transaction.type === 'payable' ? 'Payable' : 'Receivable'}
                            </Button>
                        )}
                        
                        {/* Show "Fully Settled" badge when transaction is completely settled */}
                        {settlementSummary && settlementSummary.remaining_amount <= 0 && (
                            <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                <DollarSign className="mr-2 h-3 w-3" />
                                Fully Settled
                            </div>
                        )}
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
                                            {transaction.type === 'settlement' 
                                                ? transaction.category.name 
                                                : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
                                            }
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
                                            {formatCurrency(
                                                transaction.metadata?.secondary_amount || 0,
                                                transaction.metadata?.secondary_currency || 'USD',
                                            )}
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

                                        {/* Settlement Summary Card - Only show for payable and receivable transactions */}
                    {settlementSummary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4" />
                                    Settlement Summary
                                    {settlementSummary.remaining_amount <= 0 && (
                                        <span className="ml-auto inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                            ✓ Fully Settled
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Total Amount */}
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Total</div>
                                        <div className="text-lg font-semibold text-gray-700">
                                            {primarySymbol} {formatCurrency(settlementSummary.total_amount, primaryCurrency)}
                                        </div>
                                        {settlementSummary.secondary_currency && settlementSummary.secondary_total_amount && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {currencies.find((c) => c.code === settlementSummary.secondary_currency)?.symbol || settlementSummary.secondary_currency} {formatCurrency(settlementSummary.secondary_total_amount, settlementSummary.secondary_currency)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Settled Amount */}
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Settled</div>
                                        <div className="text-lg font-semibold text-green-600">
                                            {primarySymbol} {formatCurrency(settlementSummary.settled_amount, primaryCurrency)}
                                        </div>
                                        {settlementSummary.secondary_currency && settlementSummary.secondary_settled_amount && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {currencies.find((c) => c.code === settlementSummary.secondary_currency)?.symbol || settlementSummary.secondary_currency} {formatCurrency(settlementSummary.secondary_settled_amount, settlementSummary.secondary_currency)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Remaining Amount */}
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Remaining</div>
                                        {settlementSummary.remaining_amount > 0 ? (
                                            <>
                                                <div className="text-lg font-semibold text-orange-600">
                                                    {primarySymbol} {formatCurrency(settlementSummary.remaining_amount, primaryCurrency)}
                                                </div>
                                                {settlementSummary.secondary_currency && settlementSummary.secondary_remaining_amount && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {currencies.find((c) => c.code === settlementSummary.secondary_currency)?.symbol || settlementSummary.secondary_currency} {formatCurrency(settlementSummary.secondary_remaining_amount, settlementSummary.secondary_currency)}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-lg font-semibold text-green-600">
                                                    {primarySymbol} 0.00
                                                </div>
                                                {settlementSummary.secondary_currency && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {currencies.find((c) => c.code === settlementSummary.secondary_currency)?.symbol || settlementSummary.secondary_currency} 0.000
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Simple Settlement Count */}
                                <div className="mt-3 text-center text-xs text-muted-foreground">
                                    {settlementSummary.remaining_amount > 0 ? (
                                        <>
                                            {settlementSummary.settlements.length > 0 
                                                ? `${settlementSummary.settlements.length} settlement(s) recorded`
                                                : 'No settlements yet'
                                            }
                                        </>
                                    ) : (
                                        <span className="text-green-600 font-medium">✓ Fully Settled</span>
                                    )}
                                    {settlementSummary.secondary_currency && settlementSummary.exchange_rate && (
                                        <div className="mt-1">
                                            Rate: 1 {settlementSummary.secondary_currency} = {settlementSummary.exchange_rate} {primaryCurrency}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Settlement Modal */}
                {settlementSummary && showSettlementModal && (
                    <Dialog open={showSettlementModal} onOpenChange={() => setShowSettlementModal(false)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Settle Transaction</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const amount = parseFloat(formData.get('amount') as string);
                                const description = formData.get('description') as string;
                                const category = formData.get('category') as string;
                                const date = formData.get('date_iso') as string; // Use the hidden ISO date field
                                const secondary_amount = parseFloat(formData.get('secondary_amount') as string) || 0;
                                const exchange_rate = parseFloat(formData.get('exchange_rate') as string) || transaction.metadata?.exchange_rate || 0;
                                

                                
                                if (amount && amount > 0 && amount <= (settlementSummary.total_amount - settlementSummary.settled_amount)) {
                                    router.post(route('transactions.settle', transaction.id), {
                                        amount: amount,
                                        description: description,
                                        category: category,
                                        date: date,
                                        secondary_amount: secondary_amount,
                                        exchange_rate: exchange_rate,
                                    }, {
                                        onSuccess: () => {
                                            setShowSettlementModal(false);
                                        },
                                    });
                                }
                            }}>
                                <div className="space-y-6">
                                    {/* Total Remaining Amount (Disabled) */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">
                                            Total Remaining Amount
                                        </Label>
                                        <Input
                                            type="text"
                                            value={`৳${(settlementSummary.total_amount - settlementSummary.settled_amount).toFixed(2)}`}
                                            disabled
                                            className="h-10 bg-gray-100 text-base font-medium"
                                        />
                                    </div>
                                    
                                    {/* Amount and Date Row */}
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                                                Amount to Pay (৳) *
                                            </Label>
                                            <Input
                                                name="amount"
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                defaultValue={settlementSummary.total_amount - settlementSummary.settled_amount}
                                                max={settlementSummary.total_amount - settlementSummary.settled_amount}
                                                required
                                                className="h-10 text-base font-medium"
                                                onChange={(e) => {
                                                    if (transaction.metadata?.secondary_currency) {
                                                        const value = parseFloat(e.target.value) || 0;
                                                        const form = e.currentTarget.form;
                                                        if (form) {
                                                            const exchangeRateInput = form.querySelector('input[name="exchange_rate"]') as HTMLInputElement;
                                                            const exchangeRateValue = parseFloat(exchangeRateInput?.value) || transaction.metadata?.exchange_rate || 0;
                                                            
                                                            if (value > 0 && exchangeRateValue > 0) {
                                                                const secondaryAmount = value / exchangeRateValue;
                                                                const secondaryInput = form.querySelector('input[name="secondary_amount"]') as HTMLInputElement;
                                                                if (secondaryInput) {
                                                                    secondaryInput.value = secondaryAmount.toFixed(4);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                                                Settlement Date *
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    name="date"
                                                    id="date"
                                                    type="text"
                                                    defaultValue={(() => {
                                                        const today = new Date();
                                                        const day = String(today.getDate()).padStart(2, '0');
                                                        const month = String(today.getMonth() + 1).padStart(2, '0');
                                                        const year = today.getFullYear();
                                                        return `${day}/${month}/${year}`;
                                                    })()}
                                                    placeholder="DD/MM/YYYY"
                                                    required
                                                    className="h-10 pr-10"
                                                    title="Please enter date in DD/MM/YYYY format"
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Convert DD/MM/YYYY to YYYY-MM-DD for form submission
                                                        if (value.includes('/') && value.split('/').length === 3) {
                                                            const parts = value.split('/');
                                                            if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                                                                const [day, month, year] = parts;
                                                                const hiddenInput = e.currentTarget.form?.querySelector('input[name="date_iso"]') as HTMLInputElement;
                                                                if (hiddenInput) {
                                                                    hiddenInput.value = `${year}-${month}-${day}`;
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const dateInput = document.getElementById('date') as HTMLInputElement;
                                                        if (dateInput) {
                                                            // Create a temporary date input to use the browser's date picker
                                                            const tempInput = document.createElement('input');
                                                            tempInput.type = 'date';
                                                            tempInput.style.position = 'absolute';
                                                            tempInput.style.left = '-9999px';
                                                            document.body.appendChild(tempInput);
                                                            
                                                            tempInput.onchange = (e) => {
                                                                const target = e.target as HTMLInputElement;
                                                                if (target.value) {
                                                                    const date = new Date(target.value);
                                                                    const day = String(date.getDate()).padStart(2, '0');
                                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const year = date.getFullYear();
                                                                    const formattedDate = `${day}/${month}/${year}`;
                                                                    
                                                                    dateInput.value = formattedDate;
                                                                    
                                                                    // Update the hidden ISO date field
                                                                    const hiddenInput = dateInput.form?.querySelector('input[name="date_iso"]') as HTMLInputElement;
                                                                    if (hiddenInput) {
                                                                        hiddenInput.value = target.value;
                                                                    }
                                                                    
                                                                    // Trigger change event
                                                                    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
                                                                }
                                                                document.body.removeChild(tempInput);
                                                            };
                                                            
                                                            tempInput.click();
                                                        }
                                                    }}
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-blue-600 hover:scale-110 cursor-pointer transition-all duration-200 p-1 rounded-md hover:bg-blue-50"
                                                    title="Click to open date picker"
                                                >
                                                    <Calendar className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <input 
                                                type="hidden" 
                                                name="date_iso" 
                                                value={(() => {
                                                    const today = new Date();
                                                    const year = today.getFullYear();
                                                    const month = String(today.getMonth() + 1).padStart(2, '0');
                                                    const day = String(today.getDate()).padStart(2, '0');
                                                    return `${year}-${month}-${day}`;
                                                })()}
                                            />
                                        </div>
                                    </div>

                                    {/* Secondary Currency Section */}
                                    {transaction.metadata?.secondary_currency && (
                                        <>
                                            {/* Exchange Rate Row */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700">
                                                        Rate (1 {transaction.metadata.secondary_currency} = ? {primaryCurrency})
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            name="exchange_rate"
                                                            type="number"
                                                            step="0.0001"
                                                            defaultValue={transaction.metadata.exchange_rate?.toFixed(4) || '0.0000'}
                                                            placeholder="0.0000"
                                                            className="h-10 pr-10 text-base font-medium"
                                                            onChange={(e) => {
                                                                const newRate = parseFloat(e.target.value) || 0;
                                                                if (newRate > 0) {
                                                                    // Update the exchange rate in the form
                                                                    const form = e.currentTarget.form;
                                                                    if (form) {
                                                                        // Recalculate secondary amount based on new rate
                                                                        const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement;
                                                                        if (amountInput && amountInput.value) {
                                                                            const amount = parseFloat(amountInput.value);
                                                                            const secondaryAmount = amount / newRate;
                                                                            const secondaryInput = form.querySelector('input[name="secondary_amount"]') as HTMLInputElement;
                                                                            if (secondaryInput) {
                                                                                secondaryInput.value = secondaryAmount.toFixed(4);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                let refreshIcon: Element | null = null;
                                                                try {
                                                                    // Show loading state
                                                                    refreshIcon = document.querySelector('.refresh-rate-icon');
                                                                    if (refreshIcon) {
                                                                        refreshIcon.classList.add('animate-spin');
                                                                    }

                                                                    // Get the current secondary currency from the transaction
                                                                    const secondaryCurrency = transaction.metadata?.secondary_currency;
                                                                    const primaryCurrency = transaction.metadata?.primary_currency || 'BDT';

                                                                    if (secondaryCurrency && secondaryCurrency !== primaryCurrency) {
                                                                        // Fetch fresh exchange rate from API
                                                                        const newRate = await getExchangeRateForTransaction(secondaryCurrency, primaryCurrency);
                                                                        
                                                                        if (newRate && newRate > 0) {
                                                                            // Update the exchange rate input field
                                                                            const rateInput = document.querySelector('input[name="exchange_rate"]') as HTMLInputElement;
                                                                            if (rateInput) {
                                                                                rateInput.value = newRate.toFixed(4);
                                                                                
                                                                                // Trigger change event to recalculate amounts
                                                                                const event = new Event('change', { bubbles: true });
                                                                                rateInput.dispatchEvent(event);
                                                                            }
                                                                        }
                                                                    }
                                                                        } catch (error) {
            // Exchange rate fetch failed silently
        } finally {
                                                                    // Remove loading state after 1 second
                                                                    setTimeout(() => {
                                                                        if (refreshIcon) {
                                                                            refreshIcon.classList.remove('animate-spin');
                                                                        }
                                                                    }, 1000);
                                                                }
                                                            }}
                                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                                                        >
                                                            <RefreshCw className="h-4 w-4 refresh-rate-icon" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700">
                                                        Amount in {transaction.metadata.secondary_currency} ({currencies.find((c) => c.code === transaction.metadata?.secondary_currency)?.symbol || transaction.metadata.secondary_currency})
                                                    </Label>
                                                    <Input
                                                        name="secondary_amount"
                                                        id="secondary_amount"
                                                        type="text"
                                                        defaultValue={(() => {
                                                            const remainingAmount = settlementSummary.total_amount - settlementSummary.settled_amount;
                                                            const exchangeRate = transaction.metadata?.exchange_rate || 0;
                                                            if (remainingAmount > 0 && exchangeRate > 0) {
                                                                return (remainingAmount / exchangeRate).toFixed(3);
                                                            }
                                                            return '0.000';
                                                        })()}
                                                        placeholder={getCurrencyInputProps(transaction.metadata.secondary_currency).placeholder}
                                                        className="h-10 text-base font-medium"
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const numericValue = value === '' ? 0 : parseFloat(value) || 0;
                                                            const form = e.currentTarget.form;
                                                            if (form) {
                                                                const exchangeRateInput = form.querySelector('input[name="exchange_rate"]') as HTMLInputElement;
                                                                const exchangeRateValue = parseFloat(exchangeRateInput?.value) || transaction.metadata?.exchange_rate || 1;
                                                                
                                                                if (numericValue > 0 && exchangeRateValue > 0) {
                                                                    const primaryAmount = numericValue * exchangeRateValue;
                                                                    const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement;
                                                                    if (amountInput) {
                                                                        amountInput.value = primaryAmount.toFixed(2);
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Enter amount in {transaction.metadata.secondary_currency} - both amounts will be recorded
                                            </p>
                                        </>
                                    )}

                                    {/* Category Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                                            Category *
                                        </Label>
                                        <Select 
                                            value={settlementFormData.category} 
                                            onValueChange={(value) => {
                                                // Ensure only single selection by clearing any previous selection
                                                setSettlementFormData(prev => ({ ...prev, category: value }));
                                            }}
                                            defaultValue={settlementFormData.category}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(() => {
                                                    return settlementCategories?.map((category) => (
                                                        <SelectItem key={category.id} value={category.type}>
                                                            {category.name}
                                                        </SelectItem>
                                                    )) || (
                                                        <>
                                                            <SelectItem value="settle_payable">Settle Payable</SelectItem>
                                                            <SelectItem value="settle_receivable">Settle Receivable</SelectItem>
                                                        </>
                                                    );
                                                })()}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="category" value={settlementFormData.category} />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                                            Description *
                                        </Label>
                                        <Input
                                            name="description"
                                            id="description"
                                            placeholder="Enter settlement description"
                                            required
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button type="button" variant="secondary" onClick={() => setShowSettlementModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Record Settlement
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
