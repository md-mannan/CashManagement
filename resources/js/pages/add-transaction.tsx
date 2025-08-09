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
    amount: number;
    description: string;
    source: string;
    date: string;
    category: string;
    notes?: string;
    secondaryCurrency?: string;
    exchangeRate?: number;
    secondaryAmount?: number;
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

const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Dividend', 'Rental Income', 'Business Income', 'Other Income'],
    expense: ['Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other Expenses'],
    receivable: ['Client Payment', 'Loan Repayment', 'Rental Payment', 'Investment Return', 'Other Receivable'],
    payable: ['Bills', 'Loan Payment', 'Credit Card', 'Rent', 'Taxes', 'Other Payable'],
};

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

export default function AddTransaction() {
    const { auth } = usePage<SharedData>().props;

    // Get transaction type from URL params or default to income
    const urlParams = new URLSearchParams(window.location.search);
    const type = (urlParams.get('type') as 'income' | 'expense' | 'receivable' | 'payable') || 'income';

    const [formData, setFormData] = useState<TransactionFormData>({
        type,
        amount: 0,
        description: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: '',
        secondaryCurrency: 'KWD',
        exchangeRate: 3.25, // 1 KWD = 3.25 USD (default rate)
        secondaryAmount: 0,
    });

    const [isLoadingRate, setIsLoadingRate] = useState(false);
    const [rateSource, setRateSource] = useState<string>('Default');

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'USD';
    const primarySymbol = auth.user.primary_symbol || '$';

    const { showToast } = useToast();

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
                console.log('Skipping rate fetch - no currency or same as primary');
                return;
            }

            console.log('Fetching rate FROM:', currency, 'TO:', primaryCurrency);
            setIsLoadingRate(true);
            try {
                // Get rate FROM secondary currency TO primary currency
                const rate = await getExchangeRateForTransaction(currency, primaryCurrency);
                console.log(`Fetched rate: 1 ${currency} = ${rate} ${primaryCurrency}`);
                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: rate,
                }));
                setRateSource('');
            } catch (error) {
                console.error('Failed to fetch real-time rate:', error);
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
            console.log('useEffect triggered - fetching rate for:', formData.secondaryCurrency);
            fetchRealTimeRate(formData.secondaryCurrency);
        }
    }, [formData.secondaryCurrency, primaryCurrency, fetchRealTimeRate]);

    // Force initial rate fetch on component mount
    useEffect(() => {
        console.log('Component mounted, forcing initial rate fetch');
        if (formData.secondaryCurrency && formData.secondaryCurrency !== primaryCurrency) {
            setTimeout(() => {
                console.log('Forcing rate fetch for:', formData.secondaryCurrency);
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
        const selectedCategory = categories[formData.type].find((cat) => cat === formData.category);

        // Prepare transaction data for backend
        const transactionData = {
            type: formData.type,
            amount: formData.amount,
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
                      exchange_rate: formData.exchangeRate,
                      secondary_amount: formData.secondaryAmount || convertToSecondaryCurrency(formData.amount, formData.exchangeRate || 1),
                      primary_currency: primaryCurrency,
                      primary_symbol: primarySymbol,
                  }
                : null,
        };

        console.log('Submitting transaction data:', transactionData);

        // Submit to backend using Inertia
        router.post('/transactions', transactionData, {
            onSuccess: () => {
                showToast({
                    type: 'success',
                    title: 'Transaction Saved!',
                    message: 'Your transaction has been successfully created.',
                    sound: true,
                });
                // Redirect immediately to transaction list
                router.visit('/transaction');
            },
            onError: (errors) => {
                showToast({
                    type: 'error',
                    title: 'Save Failed!',
                    message: 'There was an error saving your transaction. Please try again.',
                    sound: true,
                });
                console.error('Error saving transaction:', errors);
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
                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: rate,
                    secondaryAmount: 0,
                }));
            };

            // Set default rate and fetch real-time rate
            if (value && value !== primaryCurrency) {
                getDefaultRate(value as string, primaryCurrency);
                fetchRealTimeRate(value as string);
            }
        }

        // Update primary amount when exchange rate changes and secondary amount exists
        if (field === 'exchangeRate' && formData.secondaryAmount && formData.secondaryAmount > 0) {
            const primaryAmount = convertToPrimaryCurrency(formData.secondaryAmount, value as number);
            setFormData((prev) => ({
                ...prev,
                amount: primaryAmount,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${transactionType.title} - Personal Account`} />

            <div className="container mx-auto max-w-lg px-4 py-1 sm:px-6">
                <div className="mt-4 mb-1 flex items-center justify-between">
                    <div></div>
                </div>

                <Card className={`mt-2 border-l-4 pt-0 shadow-lg ${transactionType.borderColor} relative overflow-hidden`}>
                    {/* Back to Ledger button positioned in top-right corner of card */}
                    <div className="absolute top-2 right-2 z-10">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/ledger')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back to Ledger</span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                    </div>

                    <CardHeader className={`${transactionType.bgColor} border-b px-4 py-2 sm:px-6`}>
                        <CardTitle className={`flex items-center gap-2 text-base sm:text-lg ${transactionType.color}`}>
                            <div className={`rounded-lg bg-white/80 p-1.5 shadow-sm ${transactionType.color} sm:p-2`}>
                                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <span className="text-sm sm:text-base">{transactionType.title}</span>
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs sm:text-sm">{transactionType.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white p-3 sm:p-4">
                        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
                            {/* Amount and Date Row */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                <div className="space-y-1 sm:space-y-1.5">
                                    <Label htmlFor="amount" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                        Amount ({primarySymbol}) *
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step={getCurrencyInputProps(primaryCurrency).step}
                                        placeholder={getCurrencyInputProps(primaryCurrency).placeholder}
                                        value={formData.amount || ''}
                                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                        required
                                        className="h-8 text-sm font-medium sm:h-9 sm:text-base"
                                    />
                                </div>
                                <div className="space-y-1 sm:space-y-1.5">
                                    <Label htmlFor="date" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                        Date *
                                    </Label>
                                    <CustomDateInput
                                        id="date"
                                        value={formData.date}
                                        onChange={(value) => handleInputChange('date', value)}
                                        required
                                        className="h-8 sm:h-9"
                                        placeholder="dd/mm/yyyy"
                                    />
                                </div>
                            </div>

                            {/* Currency Selection Row */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                <div className="space-y-1 sm:space-y-1.5">
                                    <Label htmlFor="secondaryCurrency" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                        Secondary Currency
                                    </Label>
                                    <Select
                                        value={formData.secondaryCurrency || ''}
                                        onValueChange={(value) => handleInputChange('secondaryCurrency', value)}
                                    >
                                        <SelectTrigger className="h-8 sm:h-9">
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
                                <div className="space-y-1 sm:space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="exchangeRate" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                            Rate (1 {formData.secondaryCurrency || 'Secondary'} = ? {primaryCurrency})
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            {isLoadingRate && (
                                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                    <span>Fetching...</span>
                                                </div>
                                            )}
                                            {formData.secondaryCurrency && (
                                                <button
                                                    type="button"
                                                    onClick={() => fetchRealTimeRate(formData.secondaryCurrency!)}
                                                    disabled={isLoadingRate}
                                                    className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                                                    title="Refresh exchange rate"
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="exchangeRate"
                                            type="number"
                                            step="0.0001"
                                            placeholder="1.0000"
                                            value={formData.exchangeRate || ''}
                                            onChange={(e) => handleInputChange('exchangeRate', parseFloat(e.target.value) || 1)}
                                            disabled={!formData.secondaryCurrency || isLoadingRate}
                                            className="h-8 text-sm font-medium sm:h-9 sm:text-base"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Amount Row */}
                            {formData.secondaryCurrency && (
                                <div className="space-y-1 sm:space-y-1.5">
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
                                        className="h-8 text-sm font-medium sm:h-9 sm:text-base"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Enter amount in {formData.secondaryCurrency} - both amounts will be recorded
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-1 sm:space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                    Description *
                                </Label>
                                <Input
                                    id="description"
                                    placeholder="Enter transaction description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    required
                                    className="h-8 sm:h-9"
                                />
                            </div>

                            {/* Source */}
                            <div className="space-y-1 sm:space-y-1.5">
                                <Label htmlFor="source" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                    Source *
                                </Label>
                                <Input
                                    id="source"
                                    placeholder="Enter source (e.g., Company Inc., Local Store)"
                                    value={formData.source}
                                    onChange={(e) => handleInputChange('source', e.target.value)}
                                    required
                                    className="h-8 sm:h-9"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-1 sm:space-y-1.5">
                                <Label htmlFor="category" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                    Category *
                                </Label>
                                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                    <SelectTrigger className="h-8 sm:h-9">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories[type].map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1 sm:space-y-1.5">
                                <Label htmlFor="notes" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                    Notes (Optional)
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional notes..."
                                    value={formData.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={2}
                                    className="sm:rows-2 resize-none text-sm"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 border-t border-gray-200 pt-3 sm:flex-row sm:justify-end sm:gap-3 sm:pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.visit('/ledger')}
                                    className="w-full px-3 py-1.5 text-sm sm:w-auto sm:px-4"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className={`w-full px-3 py-1.5 text-sm font-semibold text-white sm:w-auto sm:px-4 ${transactionType.buttonColor}`}
                                >
                                    Add {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
