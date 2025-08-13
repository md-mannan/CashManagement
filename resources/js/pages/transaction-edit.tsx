import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import FormSkeleton from '@/components/ui/form-skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getExchangeRateForTransaction } from '../services/exchangeRateService';

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

interface TransactionFormData {
    date: string;
    description: string;
    type: 'income' | 'expense' | 'receivable' | 'payable';
    amount: number | string;
    source: string;
    category: string;
    notes: string;
    secondaryCurrency?: string;
    exchangeRate?: number | string;
    secondaryAmount?: number | string;
}

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

export default function TransactionEdit() {
    const {
        auth,
        transaction,
        categories: backendCategories,
    } = usePage<
        SharedData & {
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
            categories: Array<{
                id: number;
                name: string;
                type: string;
                color: string;
            }>;
        }
    >().props;

    const [formData, setFormData] = useState<TransactionFormData>({
        date: '',
        description: '',
        type: 'income',
        amount: '',
        source: '',
        category: '',
        notes: '',
        secondaryCurrency: '',
        exchangeRate: '',
        secondaryAmount: '',
    });

    const [isFormInitialized, setIsFormInitialized] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRate, setIsLoadingRate] = useState(false);
    const [rateSource, setRateSource] = useState<'database' | 'api' | 'manual'>('database');

    const { showToast } = useToast();

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'USD';
    const primarySymbol = auth.user.primary_symbol || '$';
    const secondaryCurrency = auth.user.secondary_currency || 'EUR';
    const secondarySymbol = auth.user.secondary_symbol || '€';
    const exchangeRate = parseFloat(auth.user.exchange_rate || '1.0');

    // Helper function to calculate converted amount
    const convertAmount = (amount: number, targetCurrency: string) => {
        if (targetCurrency === primaryCurrency) return amount;
        if (targetCurrency === secondaryCurrency) return amount / exchangeRate;
        return amount;
    };

    // Helper function to format currency with proper decimal places
    const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
        const formatNumber = (num: number, decimals: number) => {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        };

        if (currency === 'KWD') {
            return formatNumber(amount, 3); // 3 decimal places for KWD
        } else {
            return formatNumber(amount, 2); // 2 decimal places for others
        }
    };

    // Currency conversion helper functions
    const convertToSecondaryCurrency = (amount: number, exchangeRate: number) => {
        return amount / exchangeRate;
    };

    const convertToPrimaryCurrency = (secondaryAmount: number, exchangeRate: number) => {
        return secondaryAmount * exchangeRate;
    };

    // Get currency input properties (step, placeholder, decimals)
    const getCurrencyInputProps = (currency: string) => {
        if (currency === 'KWD') {
            return { step: '0.001', placeholder: '0.000', decimals: 3 };
        } else {
            return { step: '0.01', placeholder: '0.00', decimals: 2 };
        }
    };

    // Format input value with proper decimals
    const formatInputValue = (value: number, currency: string) => {
        const props = getCurrencyInputProps(currency);
        return value.toFixed(props.decimals);
    };

    // Fetch real-time exchange rate (only when user explicitly requests)
    const fetchRealTimeRate = useCallback(
        async (secondaryCurrency: string) => {
            if (!secondaryCurrency || secondaryCurrency === primaryCurrency) return;

            setIsLoadingRate(true);

            try {
                const rate = await getExchangeRateForTransaction(secondaryCurrency, primaryCurrency);
                const roundedRate = Math.round(rate * 100) / 100; // Round to 2 decimal places

                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: roundedRate,
                }));

                setRateSource('api');

                showToast({
                    type: 'success',
                    title: 'Exchange Rate Updated',
                    message: `Updated rate: 1 ${secondaryCurrency} = ${roundedRate} ${primaryCurrency}`,
                });
            } catch (error) {
                showToast({
                    type: 'error',
                    title: 'Failed to Update Rate',
                    message: 'Could not fetch the latest exchange rate. Please try again.',
                });
            } finally {
                setIsLoadingRate(false);
            }
        },
        [primaryCurrency, showToast],
    );

    // Handle refresh rate button click
    const handleRefreshRate = () => {
        if (formData.secondaryCurrency && formData.secondaryCurrency !== primaryCurrency) {
            fetchRealTimeRate(formData.secondaryCurrency);
        }
    };

    // Initialize form data when transaction is found
    useEffect(() => {
        if (transaction && !isFormInitialized) {
            setIsInitializing(true);

            const newFormData = {
                date: transaction.date,
                description: transaction.description,
                type: transaction.type,
                amount: transaction.amount, // Use exact amount from database
                source: transaction.source,
                category: transaction.category.name,
                notes: transaction.notes || '',
                secondaryCurrency: transaction.metadata?.secondary_currency || '',
                exchangeRate: transaction.metadata?.exchange_rate || 1,
                secondaryAmount: transaction.metadata?.secondary_amount || 0,
            };

            setFormData(newFormData);
            setIsFormInitialized(true);
            setRateSource('database'); // Rate loaded from database

            // Small delay to ensure form data is set before allowing conversions
            setTimeout(() => {
                setIsInitializing(false);
            }, 100);
        }
    }, [transaction, isFormInitialized]);

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
                                Back to Ledger
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

        // Skip currency conversions during form initialization
        if (isInitializing) {
            return;
        }

        // Handle secondary currency change
        if (field === 'secondaryCurrency') {
            // Only reset amounts when currency changes, don't auto-fetch rates
            setFormData((prev) => ({
                ...prev,
                secondaryAmount: 0, // Reset secondary amount
                exchangeRate: 1, // Reset to default rate - user can refresh if needed
            }));

            // Rate reset to 1. User can click refresh to get current rate.
        }

        // Update secondary amount when exchange rate changes
        if (field === 'exchangeRate') {
            setRateSource('manual'); // User manually entered rate

            if (formData.secondaryAmount && formData.secondaryAmount > 0) {
                const primaryAmount = convertToPrimaryCurrency(formData.secondaryAmount, value as number);
                // Round to appropriate decimal places
                const props = getCurrencyInputProps(primaryCurrency);
                const roundedPrimaryAmount = Math.round(primaryAmount * Math.pow(10, props.decimals)) / Math.pow(10, props.decimals);
                setFormData((prev) => ({
                    ...prev,
                    amount: roundedPrimaryAmount,
                }));
            }
        }

        // Update secondary amount when primary amount changes
        if (field === 'amount' && formData.exchangeRate && formData.exchangeRate > 0) {
            const secondaryAmount = convertToSecondaryCurrency(value as number, formData.exchangeRate);
            // Round to appropriate decimal places
            const props = getCurrencyInputProps(formData.secondaryCurrency || 'USD');
            const roundedSecondaryAmount = Math.round(secondaryAmount * Math.pow(10, props.decimals)) / Math.pow(10, props.decimals);
            setFormData((prev) => ({
                ...prev,
                secondaryAmount: roundedSecondaryAmount,
            }));
        }

        // Update primary amount when secondary amount changes
        if (field === 'secondaryAmount' && formData.exchangeRate && formData.exchangeRate > 0) {
            const primaryAmount = convertToPrimaryCurrency(value as number, formData.exchangeRate);
            // Round to appropriate decimal places
            const props = getCurrencyInputProps(primaryCurrency);
            const roundedPrimaryAmount = Math.round(primaryAmount * Math.pow(10, props.decimals)) / Math.pow(10, props.decimals);
            setFormData((prev) => ({
                ...prev,
                amount: roundedPrimaryAmount,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Find category ID from category name
        let categoryId = null;

        // First try to find in backend categories
        if (backendCategories && backendCategories.length > 0) {
            const selectedCategory = backendCategories.find((cat) => cat.name === formData.category && cat.type === formData.type);
            categoryId = selectedCategory?.id;
        }

        // If not found, we need to create it (similar to store method)
        // Category will be created if not found

        // Convert string values to numbers for backend
        const amountNumeric = typeof formData.amount === 'string' ? parseFloat(formData.amount) || 0 : formData.amount;
        const exchangeRateNumeric = typeof formData.exchangeRate === 'string' ? parseFloat(formData.exchangeRate) || 1 : formData.exchangeRate || 1;
        const secondaryAmountNumeric =
            typeof formData.secondaryAmount === 'string' ? parseFloat(formData.secondaryAmount) || 0 : formData.secondaryAmount || 0;

        // Prepare transaction data for backend
        const transactionData = {
            type: formData.type,
            amount: amountNumeric,
            description: formData.description,
            source: formData.source,
            date: formData.date,
            category: formData.category, // Send category name for backend to handle
            category_id: categoryId, // Send category ID if found
            notes: formData.notes || '',
            currency: primaryCurrency,
            // Store secondary currency info in metadata
            metadata: formData.secondaryCurrency
                ? {
                      secondary_currency: formData.secondaryCurrency,
                      exchange_rate: exchangeRateNumeric,
                      secondary_amount: secondaryAmountNumeric,
                      primary_currency: primaryCurrency,
                      primary_symbol: primarySymbol,
                  }
                : null,
        };

        // Submit to backend using Inertia
        router.put(`/transactions/${transaction.id}`, transactionData, {
            onSuccess: () => {
                setIsLoading(false);
                showToast({
                    type: 'success',
                    title: 'Transaction Updated!',
                    message: 'Your transaction has been successfully updated.',
                    sound: true,
                });
                // Backend will handle redirect to transaction list
            },
            onError: (errors) => {
                setIsLoading(false);
                showToast({
                    type: 'error',
                    title: 'Update Failed!',
                    message: 'There was an error updating your transaction. Please try again.',
                    sound: true,
                });
            },
        });
    };

    const handleCancel = () => {
        router.get('/transaction');
    };

    if (!transaction) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Transaction Not Found" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Transaction Not Found</h1>
                            <p className="mt-2 text-gray-600">The transaction you're trying to edit doesn't exist.</p>
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Transaction - ${transaction.description}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit(route('transactions.show', transaction.id))}>
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
                        {!isFormInitialized ? (
                            <FormSkeleton />
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date *</Label>
                                        <CustomDateInput
                                            id="date"
                                            value={formData.date}
                                            onChange={(value) => handleInputChange('date', value)}
                                            required
                                            placeholder="dd/mm/yyyy"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type *</Label>
                                        <Select value={formData.type || undefined} onValueChange={(value) => handleInputChange('type', value as any)}>
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
                                        <Label htmlFor="amount">Amount ({primarySymbol}) *</Label>
                                        <Input
                                            id="amount"
                                            type="text"
                                            placeholder={getCurrencyInputProps(primaryCurrency).placeholder}
                                            value={formData.amount ? formData.amount.toString() : ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Simple - no validation, store as string to preserve decimal input
                                                handleInputChange('amount', value);
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Secondary Currency */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="secondaryCurrency" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                                Secondary Currency
                                            </Label>
                                            {formData.secondaryCurrency && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleInputChange('secondaryCurrency', '')}
                                                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                        <Select
                                            value={formData.secondaryCurrency || undefined}
                                            onValueChange={(value) => handleInputChange('secondaryCurrency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select secondary currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencies.map((currency) => (
                                                    <SelectItem key={currency.code} value={currency.code}>
                                                        {currency.symbol} {currency.name} ({currency.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Exchange Rate */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="exchangeRate" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                                Rate (1 {formData.secondaryCurrency || 'Secondary'} = ? {primaryCurrency})
                                            </Label>
                                            {formData.secondaryCurrency && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRefreshRate}
                                                    disabled={isLoadingRate}
                                                    className="h-6 w-6 p-0"
                                                    title="Refresh exchange rate from API"
                                                >
                                                    <RefreshCw className={`h-3 w-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
                                                </Button>
                                            )}
                                        </div>
                                        <Input
                                            id="exchangeRate"
                                            type="text"
                                            placeholder="1.00"
                                            value={formData.exchangeRate ? formData.exchangeRate.toString() : ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Simple - no validation, store as string to preserve decimal input
                                                handleInputChange('exchangeRate', value);
                                            }}
                                            disabled={!formData.secondaryCurrency || isLoadingRate}
                                            className="text-sm"
                                        />
                                        {formData.secondaryCurrency && (
                                            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    Rate source: {rateSource === 'database' ? 'Stored' : rateSource === 'api' ? 'Live API' : 'Manual'}
                                                </span>
                                                {rateSource === 'database' && <span className="text-amber-600">Click refresh for current rate</span>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Secondary Amount */}
                                    {formData.secondaryCurrency && (
                                        <div className="space-y-2">
                                            <Label htmlFor="secondaryAmount" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                                Amount in {formData.secondaryCurrency} (
                                                {currencies.find((c) => c.code === formData.secondaryCurrency)?.symbol})
                                            </Label>
                                            <Input
                                                id="secondaryAmount"
                                                type="text"
                                                placeholder={getCurrencyInputProps(formData.secondaryCurrency || 'USD').placeholder}
                                                value={formData.secondaryAmount !== undefined ? formData.secondaryAmount.toString() : ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Simple - no validation, store as string and calculate conversion
                                                    const numericValue = value === '' ? 0 : parseFloat(value) || 0;
                                                    const exchangeRateValue =
                                                        typeof formData.exchangeRate === 'string'
                                                            ? parseFloat(formData.exchangeRate) || 1
                                                            : formData.exchangeRate || 1;
                                                    const primaryAmount = convertToPrimaryCurrency(numericValue, exchangeRateValue);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        secondaryAmount: value,
                                                        amount: primaryAmount.toString(),
                                                    }));
                                                }}
                                                className="text-sm"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Enter amount in {formData.secondaryCurrency} - both amounts will be recorded
                                            </p>
                                        </div>
                                    )}

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={formData.category || undefined}
                                            onValueChange={(value) => handleInputChange('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Use backend categories filtered by type, with fallback to hardcoded ones */}
                                                {backendCategories?.filter((cat) => cat.type === formData.type).length > 0
                                                    ? backendCategories
                                                          .filter((cat) => cat.type === formData.type)
                                                          .map((category) => (
                                                              <SelectItem key={category.name} value={category.name}>
                                                                  {category.name}
                                                              </SelectItem>
                                                          ))
                                                    : categories[formData.type]?.map((category) => (
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

                                {/* 3-Currency Preview */}
                                <div className="space-y-3">
                                    <Label>Amount Preview in Different Currencies</Label>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                                            <div className="mb-1 text-lg font-semibold text-primary">
                                                {primarySymbol}{' '}
                                                {formData.amount
                                                    ? formatCurrency(formData.amount, primaryCurrency)
                                                    : formatCurrency(0, primaryCurrency)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Primary ({primaryCurrency})</div>
                                        </div>
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                                            <div className="mb-1 text-lg font-semibold text-blue-600">
                                                {formData.secondaryCurrency && formData.secondaryAmount
                                                    ? `${currencies.find((c) => c.code === formData.secondaryCurrency)?.symbol || ''} ${formatCurrency(formData.secondaryAmount, formData.secondaryCurrency)}`
                                                    : `${secondarySymbol} ${formData.amount ? formatCurrency(formData.amount * exchangeRate, secondaryCurrency) : formatCurrency(0, secondaryCurrency)}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Secondary ({formData.secondaryCurrency || secondaryCurrency})
                                            </div>
                                        </div>
                                    </div>
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
