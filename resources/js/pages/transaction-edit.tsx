import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
    secondaryCurrency?: string;
    exchangeRate?: number;
    secondaryAmount?: number;
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

export default function TransactionEdit({ id }: TransactionEditProps) {
    const { auth } = usePage<SharedData>().props;

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
        secondaryCurrency: 'KWD',
        exchangeRate: 3.25, // 1 KWD = 3.25 USD (default rate)
        secondaryAmount: 0,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRate, setIsLoadingRate] = useState(false);

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'USD';
    const primarySymbol = auth.user.primary_symbol || '$';
    const secondaryCurrency = auth.user.secondary_currency || 'EUR';
    const secondarySymbol = auth.user.secondary_symbol || '€';
    const exchangeRate = parseFloat(auth.user.exchange_rate || '1.0');

    // Determine the third currency (EUR or KWD if not already selected)
    const getThirdCurrency = () => {
        if (primaryCurrency !== 'EUR' && secondaryCurrency !== 'EUR') {
            return { code: 'EUR', symbol: '€', rate: 0.9 };
        } else if (primaryCurrency !== 'KWD' && secondaryCurrency !== 'KWD') {
            return { code: 'KWD', symbol: 'د.ك', rate: 3.25 };
        } else {
            return { code: 'USD', symbol: '$', rate: 1.0 };
        }
    };

    const thirdCurrency = getThirdCurrency();

    // Helper function to calculate converted amount
    const convertAmount = (amount: number, targetCurrency: string) => {
        if (targetCurrency === primaryCurrency) return amount;
        if (targetCurrency === secondaryCurrency) return amount * exchangeRate;
        if (targetCurrency === thirdCurrency.code) return amount * thirdCurrency.rate;
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

    // Fetch real-time exchange rate
    const fetchRealTimeRate = useCallback(
        async (secondaryCurrency: string) => {
            if (!secondaryCurrency || secondaryCurrency === primaryCurrency) return;

            console.log(`Fetching real-time rate for ${secondaryCurrency} -> ${primaryCurrency}`);
            setIsLoadingRate(true);

            try {
                const rate = await getExchangeRateForTransaction(secondaryCurrency, primaryCurrency);
                console.log(`Fetched rate: 1 ${secondaryCurrency} = ${rate} ${primaryCurrency}`);

                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: rate,
                }));
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
            } finally {
                setIsLoadingRate(false);
            }
        },
        [primaryCurrency],
    );

    // Fetch rate when secondary currency changes
    useEffect(() => {
        if (formData.secondaryCurrency && formData.secondaryCurrency !== primaryCurrency) {
            console.log('useEffect triggered - fetching rate for:', formData.secondaryCurrency);
            fetchRealTimeRate(formData.secondaryCurrency);
        }
    }, [formData.secondaryCurrency, primaryCurrency, fetchRealTimeRate]);

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

        // Handle secondary currency change
        if (field === 'secondaryCurrency') {
            // Get default rate for new currency
            const getDefaultRate = async (currency: string) => {
                try {
                    const rate = await getExchangeRateForTransaction(currency, primaryCurrency);
                    setFormData((prev) => ({
                        ...prev,
                        exchangeRate: rate,
                        secondaryAmount: 0,
                    }));
                } catch (error) {
                    console.error('Error getting default rate:', error);
                }
                // Also fetch real-time rate
                fetchRealTimeRate(value as string);
            };

            if (value !== primaryCurrency) {
                getDefaultRate(value as string);
            }
        }

        // Update secondary amount when exchange rate changes
        if (field === 'exchangeRate' && formData.secondaryAmount && formData.secondaryAmount > 0) {
            const primaryAmount = convertToPrimaryCurrency(formData.secondaryAmount, value as number);
            // Round to appropriate decimal places
            const props = getCurrencyInputProps(primaryCurrency);
            const roundedPrimaryAmount = Math.round(primaryAmount * Math.pow(10, props.decimals)) / Math.pow(10, props.decimals);
            setFormData((prev) => ({
                ...prev,
                amount: roundedPrimaryAmount,
            }));
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
                                    <Label htmlFor="amount">Amount ({primarySymbol}) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step={getCurrencyInputProps(primaryCurrency).step}
                                        placeholder={getCurrencyInputProps(primaryCurrency).placeholder}
                                        value={formData.amount || ''}
                                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </div>

                                {/* Secondary Currency */}
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryCurrency" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                        Secondary Currency
                                    </Label>
                                    <Select
                                        value={formData.secondaryCurrency || ''}
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
                                                onClick={() => fetchRealTimeRate(formData.secondaryCurrency!)}
                                                disabled={isLoadingRate}
                                                className="h-6 w-6 p-0"
                                            >
                                                <RefreshCw className={`h-3 w-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        id="exchangeRate"
                                        type="number"
                                        step="0.001"
                                        placeholder="1.000"
                                        value={formData.exchangeRate || ''}
                                        onChange={(e) => handleInputChange('exchangeRate', parseFloat(e.target.value) || 1)}
                                        disabled={!formData.secondaryCurrency || isLoadingRate}
                                        className="text-sm"
                                    />
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
                                            type="number"
                                            step={getCurrencyInputProps(formData.secondaryCurrency || 'USD').step}
                                            placeholder={getCurrencyInputProps(formData.secondaryCurrency || 'USD').placeholder}
                                            value={formData.secondaryAmount || ''}
                                            onChange={(e) => {
                                                const secondaryAmount = parseFloat(e.target.value) || 0;
                                                const primaryAmount = convertToPrimaryCurrency(secondaryAmount, formData.exchangeRate || 1);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    secondaryAmount,
                                                    amount: primaryAmount,
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

                            {/* 3-Currency Preview */}
                            <div className="space-y-3">
                                <Label>Amount Preview in Different Currencies</Label>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                                        <div className="mb-1 text-lg font-semibold text-primary">
                                            {primarySymbol}{' '}
                                            {formData.amount ? formatCurrency(formData.amount, primaryCurrency) : formatCurrency(0, primaryCurrency)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Primary ({primaryCurrency})</div>
                                    </div>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                                        <div className="mb-1 text-lg font-semibold text-blue-600">
                                            {secondarySymbol}{' '}
                                            {formData.amount
                                                ? formatCurrency(formData.amount * exchangeRate, secondaryCurrency)
                                                : formatCurrency(0, secondaryCurrency)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Secondary ({secondaryCurrency})</div>
                                    </div>
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                                        <div className="mb-1 text-lg font-semibold text-green-600">
                                            {thirdCurrency.symbol}{' '}
                                            {formData.amount
                                                ? formatCurrency(formData.amount * thirdCurrency.rate, thirdCurrency.code)
                                                : formatCurrency(0, thirdCurrency.code)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Additional ({thirdCurrency.code})</div>
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
