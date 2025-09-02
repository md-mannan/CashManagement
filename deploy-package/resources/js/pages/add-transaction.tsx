import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Banknote, CreditCard, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { getExchangeRateForTransaction } from '../services/exchangeRateService';

// Get transaction type from URL parameters
const getTransactionTypeFromURL = (): 'income' | 'expense' | 'receivable' | 'payable' => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type && ['income', 'expense', 'receivable', 'payable'].includes(type)) {
        return type as 'income' | 'expense' | 'receivable' | 'payable';
    }
    return 'income'; // Default to income
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ledger',
        href: '/ledger',
    },
    {
        title: 'Add Transaction',
        href: '/add-transaction',
    },
];

interface TransactionFormData {
    type: 'income' | 'expense' | 'receivable' | 'payable';
    amount: number | string;
    description: string;
    source: string;
    date: string;
    category: string;
    notes?: string;
    secondaryCurrency?: string;
    exchangeRate?: number | string;
    secondaryAmount?: number | string;
}

const transactionTypes = {
    income: {
        title: 'Add Income',
        description: 'Add a new income transaction',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    expense: {
        title: 'Add Expense',
        description: 'Add a new expense transaction',
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    receivable: {
        title: 'Add Receivable',
        description: 'Add a new receivable transaction',
        icon: Banknote,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    payable: {
        title: 'Add Payable',
        description: 'Add a new payable transaction',
        icon: CreditCard,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
    },
};

// Categories are now loaded dynamically from backend

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

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense' | 'receivable' | 'payable';
    color: string;
    icon: string;
}

export default function AddTransaction() {
    const { auth, categories } = usePage<SharedData & { categories: Category[] }>().props;

    // Get transaction type from URL params or default to income
    const urlParams = new URLSearchParams(window.location.search);
    const type = (urlParams.get('type') as 'income' | 'expense' | 'receivable' | 'payable') || 'income';

    // State for transaction type
    const [transactionTypeState, setTransactionTypeState] = useState(type);

    const [formData, setFormData] = useState<TransactionFormData>({
        type,
        amount: '',
        description: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: '',
        secondaryCurrency: 'KWD',
        exchangeRate: '0.0090', // 1 BDT = 0.0090 KWD (default rate)
        secondaryAmount: '',
    });

    const [isLoadingRate, setIsLoadingRate] = useState(false);
    const [rateSource, setRateSource] = useState<string>('Default');

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'BDT';
    const primarySymbol = auth.user.primary_symbol || '৳';

    const { addToast } = useToast();

    // Helper function to convert primary currency to secondary currency
    const convertToSecondaryCurrency = (amount: number, exchangeRate: number) => {
        // If secondary currency is same as primary currency, no conversion needed
        if (formData.secondaryCurrency === primaryCurrency) {
            return amount;
        }
        return amount / exchangeRate;
    };

    // Helper function to convert secondary currency to primary currency
    const convertToPrimaryCurrency = (secondaryAmount: number, exchangeRate: number) => {
        // If secondary currency is same as primary currency, no conversion needed
        if (formData.secondaryCurrency === primaryCurrency) {
            return secondaryAmount;
        }
        return secondaryAmount * exchangeRate;
    };

    // Helper function to get step and placeholder based on currency
    const getCurrencyInputProps = (currency: string) => {
        if (currency === 'KWD') {
            return { step: '0.001', placeholder: '0.000', decimals: 3 };
        } else {
            return { step: '0.01', placeholder: '0.00', decimals: 2 };
        }
    };

    // Helper function to format input value based on currency
    const formatInputValue = (value: number, currency: string) => {
        const props = getCurrencyInputProps(currency);
        return value.toFixed(props.decimals);
    };

    // Function to fetch real-time exchange rate
    const fetchRealTimeRate = useCallback(
        async (currency: string) => {
            if (!currency || currency === primaryCurrency) {
                return;
            }
            setIsLoadingRate(true);
            try {
                // Get rate FROM secondary currency TO primary currency
                const rate = await getExchangeRateForTransaction(currency, primaryCurrency);
                const roundedRate = Math.round(rate * 100) / 100; // Round to 2 decimal places
                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: roundedRate,
                }));
                setRateSource('');
            } catch (error) {
                setRateSource('');
            } finally {
                setIsLoadingRate(false);
            }
        },
        [primaryCurrency],
    );

    // Fetch real-time rate when component mounts and when secondary currency changes
    useEffect(() => {
        if (formData.secondaryCurrency && formData.secondaryCurrency !== primaryCurrency) {
            fetchRealTimeRate(formData.secondaryCurrency);
        }
    }, [formData.secondaryCurrency, primaryCurrency, fetchRealTimeRate]);

    // Force initial rate fetch on component mount
    useEffect(() => {
        if (formData.secondaryCurrency && formData.secondaryCurrency !== primaryCurrency) {
            setTimeout(() => {
                if (formData.secondaryCurrency) {
                    fetchRealTimeRate(formData.secondaryCurrency);
                }
            }, 1000); // Wait 1 second after mount
        }
    }, [fetchRealTimeRate, formData.secondaryCurrency, primaryCurrency]); // Include dependencies

    const transactionType = transactionTypes[type];
    const IconComponent = transactionType.icon;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Find the category by name to get the category_id
        const selectedCategory = categories.find((cat) => cat.name === formData.category && cat.type === formData.type);

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
            category: formData.category, // We'll need to handle category mapping in backend
            notes: formData.notes || '',
            currency: primaryCurrency,
            // Store secondary currency info in metadata
            metadata: formData.secondaryCurrency
                ? {
                      secondary_currency: formData.secondaryCurrency,
                      exchange_rate: exchangeRateNumeric,
                      secondary_amount: secondaryAmountNumeric || convertToSecondaryCurrency(amountNumeric, exchangeRateNumeric),
                      primary_currency: primaryCurrency,
                      primary_symbol: primarySymbol,
                  }
                : null,
        };

        // Submit to backend using Inertia
        router.post('/transactions', transactionData, {
            onSuccess: () => {
                addToast({
                    type: 'success',
                    title: 'Transaction Saved!',
                    message: 'Your transaction has been successfully created.',
                    sound: true,
                });
                // Backend will handle redirect to transaction list
            },
            onError: (errors) => {
                addToast({
                    type: 'error',
                    title: 'Save Failed!',
                    message: 'There was an error saving your transaction. Please try again.',
                    sound: true,
                });
            },
        });
    };

    const handleInputChange = (field: keyof TransactionFormData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Reset exchange rate when secondary currency changes and trigger rate fetch
        if (field === 'secondaryCurrency') {
            // Get default rate FROM secondary currency TO primary currency
            const getDefaultRate = async (fromCurrency: string, toCurrency: string) => {
                const rate = await getExchangeRateForTransaction(fromCurrency, toCurrency);
                const roundedRate = Math.round(rate * 100) / 100; // Round to 2 decimal places
                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: roundedRate.toString(),
                    secondaryAmount: '',
                }));
            };

            // Set default rate and fetch real-time rate
            if (value && value !== primaryCurrency) {
                getDefaultRate(value as string, primaryCurrency);
                fetchRealTimeRate(value as string);
            }
        }

        // For numeric fields, handle conversions if needed
        const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

        // Update primary amount when exchange rate changes and secondary amount exists
        if (field === 'exchangeRate' && formData.secondaryAmount) {
            const secondaryNumeric =
                typeof formData.secondaryAmount === 'string' ? parseFloat(formData.secondaryAmount) || 0 : formData.secondaryAmount;
            if (secondaryNumeric > 0) {
                const primaryAmount = convertToPrimaryCurrency(secondaryNumeric, numericValue);
                setFormData((prev) => ({
                    ...prev,
                    amount: primaryAmount.toString(),
                }));
            }
        }

        // Update secondary amount when primary amount changes
        if (field === 'amount' && formData.exchangeRate) {
            const exchangeRateNumeric = typeof formData.exchangeRate === 'string' ? parseFloat(formData.exchangeRate) || 1 : formData.exchangeRate;
            if (exchangeRateNumeric > 0) {
                const secondaryAmount = convertToSecondaryCurrency(numericValue, exchangeRateNumeric);
                setFormData((prev) => ({
                    ...prev,
                    secondaryAmount: secondaryAmount.toString(),
                }));
            }
        }

        // Update primary amount when secondary amount changes
        if (field === 'secondaryAmount' && formData.exchangeRate) {
            const exchangeRateNumeric = typeof formData.exchangeRate === 'string' ? parseFloat(formData.exchangeRate) || 1 : formData.exchangeRate;
            if (exchangeRateNumeric > 0) {
                const primaryAmount = convertToPrimaryCurrency(numericValue, exchangeRateNumeric);
                setFormData((prev) => ({
                    ...prev,
                    amount: primaryAmount.toString(),
                }));
            }
        }
    };

    // Get the current transaction type configuration
    const currentTransactionType = transactionTypes[transactionTypeState];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${currentTransactionType.title} - Personal Account`} />
            <div className="container mx-auto max-w-2xl py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentTransactionType.bgColor}`}>
                            <currentTransactionType.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{currentTransactionType.title}</h1>
                            <p className="text-sm text-gray-600">{currentTransactionType.description}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('ledger'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Ledger
                    </Button>
                </div>

                {/* Form Card */}
                <Card className={`border ${currentTransactionType.borderColor} ${currentTransactionType.bgColor}/30 shadow-lg`}>
                    <CardHeader className={`border-b ${currentTransactionType.borderColor} ${currentTransactionType.bgColor}/50`}>
                        <CardTitle className={`flex items-center gap-2 ${currentTransactionType.color}`}>
                            <currentTransactionType.icon className="h-5 w-5" />
                            {currentTransactionType.title} Transaction Details
                        </CardTitle>
                        <CardDescription className={currentTransactionType.color}>
                            Enter the details of your {transactionTypeState} transaction
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Transaction Type Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-sm font-semibold text-gray-700">
                                    Transaction Type *
                                </Label>
                                <Select
                                    value={transactionTypeState}
                                    onValueChange={(value: 'income' | 'expense' | 'receivable' | 'payable') => {
                                        setTransactionTypeState(value);
                                        setFormData((prev) => ({ ...prev, type: value }));
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select transaction type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income" className="text-green-600">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Income
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="expense" className="text-red-600">
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="h-4 w-4" />
                                                Expense
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="receivable" className="text-blue-600">
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-4 w-4" />
                                                Receivable
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="payable" className="text-orange-600">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Payable
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Amount and Date Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                                        Amount ({primarySymbol}) *
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="text"
                                        placeholder={getCurrencyInputProps(primaryCurrency).placeholder}
                                        value={formData.amount ? formData.amount.toString() : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleInputChange('amount', value);
                                        }}
                                        required
                                        className="h-10 text-base font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                                        Date *
                                    </Label>
                                    <CustomDateInput
                                        id="date"
                                        value={formData.date}
                                        onChange={(value) => handleInputChange('date', value)}
                                        required
                                        className="h-10"
                                        placeholder="dd/mm/yyyy"
                                    />
                                </div>
                            </div>

                            {/* Currency Selection Row */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryCurrency" className="text-sm font-semibold text-gray-700">
                                        Secondary Currency
                                    </Label>
                                    <Select
                                        value={formData.secondaryCurrency || ''}
                                        onValueChange={(value) => handleInputChange('secondaryCurrency', value)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select currency (optional)" />
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
                                <div className="space-y-2">
                                    <Label htmlFor="exchangeRate" className="text-sm font-semibold text-gray-700">
                                        Rate (1 {formData.secondaryCurrency || 'Secondary'} = ? {primaryCurrency})
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="exchangeRate"
                                            type="text"
                                            placeholder="1.00"
                                            value={formData.exchangeRate ? formData.exchangeRate.toString() : ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                handleInputChange('exchangeRate', value);
                                            }}
                                            disabled={!formData.secondaryCurrency || isLoadingRate}
                                            className="h-10 pr-10 text-base font-medium"
                                        />
                                        {formData.secondaryCurrency && (
                                            <button
                                                type="button"
                                                onClick={() => fetchRealTimeRate(formData.secondaryCurrency!)}
                                                disabled={isLoadingRate}
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-300"
                                                title="Refresh exchange rate"
                                            >
                                                {isLoadingRate ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                    {isLoadingRate && <p className="text-xs text-blue-600">Fetching latest rate...</p>}
                                </div>
                            </div>

                            {/* Secondary Amount Row */}
                            {formData.secondaryCurrency && (
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryAmount" className="text-sm font-semibold text-gray-700">
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
                                        className="h-10 text-base font-medium"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Enter amount in {formData.secondaryCurrency} - both amounts will be recorded
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                                    Description *
                                </Label>
                                <Input
                                    id="description"
                                    placeholder="Enter transaction description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    required
                                    className="h-10"
                                />
                            </div>

                            {/* Source */}
                            <div className="space-y-2">
                                <Label htmlFor="source" className="text-sm font-semibold text-gray-700">
                                    Source *
                                </Label>
                                <Input
                                    id="source"
                                    placeholder="Enter source (e.g., Company Inc., Local Store)"
                                    value={formData.source}
                                    onChange={(e) => handleInputChange('source', e.target.value)}
                                    required
                                    className="h-10"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                                    Category *
                                </Label>
                                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories
                                            .filter((cat) => cat.type === transactionTypeState)
                                            .map((category) => (
                                                <SelectItem key={category.name} value={category.name}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                                    Notes (Optional)
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional notes..."
                                    value={formData.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={3}
                                    className="resize-none text-sm"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="default"
                                    onClick={() => router.visit(route('ledger'))}
                                    className="w-full px-6 py-2 text-sm font-medium sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="default"
                                    className={`w-full px-6 py-2 text-sm font-semibold text-white sm:w-auto ${currentTransactionType.buttonColor}`}
                                >
                                    Add {transactionTypeState.charAt(0).toUpperCase() + transactionTypeState.slice(1)}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
