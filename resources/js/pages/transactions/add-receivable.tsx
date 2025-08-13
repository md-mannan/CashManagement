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
import { ArrowLeft, Banknote, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { getExchangeRateForTransaction } from '../../services/exchangeRateService';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: route('transactions.index'),
    },
    {
        title: 'Add Receivable',
        href: route('transactions.add-receivable'),
    },
];

interface ReceivableFormData {
    amount: number | string;
    description: string;
    source: string;
    date: string;
    category: string;
    notes?: string;
    secondaryCurrency?: string;
    exchangeRate?: number | string;
    secondaryAmount?: number | string;
    dueDate?: string;
}

const receivableCategories = [
    'Client Payment',
    'Loan Repayment',
    'Rental Payment',
    'Investment Return',
    'Commission',
    'Refund',
    'Insurance Claim',
    'Legal Settlement',
    'Other Receivable',
];

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

export default function AddReceivable() {
    const { auth } = usePage<SharedData>().props;

    const [formData, setFormData] = useState<ReceivableFormData>({
        amount: '',
        description: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        notes: '',
        secondaryCurrency: 'KWD',
        exchangeRate: '3.25', // 1 KWD = 3.25 USD (default rate)
        secondaryAmount: '',
        dueDate: '',
    });

    const [isLoadingRate, setIsLoadingRate] = useState(false);
    const [rateSource, setRateSource] = useState<string>('Default');

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'USD';
    const primarySymbol = auth.user.primary_symbol || '$';

    const { showToast } = useToast();

    // Helper function to convert primary currency to secondary currency
    const convertToSecondaryCurrency = (amount: number, exchangeRate: number) => {
        if (formData.secondaryCurrency === primaryCurrency) {
            return amount;
        }
        return amount / exchangeRate;
    };

    // Helper function to convert secondary currency to primary currency
    const convertToPrimaryCurrency = (secondaryAmount: number, exchangeRate: number) => {
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

    // Function to fetch real-time exchange rate
    const fetchRealTimeRate = useCallback(
        async (currency: string) => {
            if (!currency || currency === primaryCurrency) {
                return;
            }
            setIsLoadingRate(true);
            try {
                const rate = await getExchangeRateForTransaction(currency, primaryCurrency);
                const roundedRate = Math.round(rate * 100) / 100;
                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: roundedRate,
                }));
                setRateSource('Real-time');
            } catch (error) {
                setRateSource('Default');
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert string values to numbers for backend
        const amountNumeric = typeof formData.amount === 'string' ? parseFloat(formData.amount) || 0 : formData.amount;
        const exchangeRateNumeric = typeof formData.exchangeRate === 'string' ? parseFloat(formData.exchangeRate) || 1 : formData.exchangeRate || 1;
        const secondaryAmountNumeric =
            typeof formData.secondaryAmount === 'string' ? parseFloat(formData.secondaryAmount) || 0 : formData.secondaryAmount || 0;

        // Prepare transaction data for backend
        const transactionData = {
            type: 'receivable',
            amount: amountNumeric,
            description: formData.description,
            source: formData.source,
            date: formData.date,
            category: formData.category,
            notes: formData.notes || '',
            currency: primaryCurrency,
            due_date: formData.dueDate || null,
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
                showToast({
                    type: 'success',
                    title: 'Receivable Added!',
                    message: 'Your receivable transaction has been successfully created.',
                    sound: true,
                });
            },
            onError: (errors) => {
                showToast({
                    type: 'error',
                    title: 'Save Failed!',
                    message: 'There was an error saving your receivable transaction. Please try again.',
                    sound: true,
                });
            },
        });
    };

    const handleInputChange = (field: keyof ReceivableFormData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Reset exchange rate when secondary currency changes and trigger rate fetch
        if (field === 'secondaryCurrency') {
            const getDefaultRate = async (fromCurrency: string, toCurrency: string) => {
                const rate = await getExchangeRateForTransaction(fromCurrency, toCurrency);
                const roundedRate = Math.round(rate * 100) / 100;
                setFormData((prev) => ({
                    ...prev,
                    exchangeRate: roundedRate.toString(),
                    secondaryAmount: '',
                }));
            };

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
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Receivable" />
            <div className="container mx-auto max-w-2xl py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Banknote className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add Receivable</h1>
                            <p className="text-sm text-gray-600">Record a new receivable transaction</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('transactions.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Transactions
                    </Button>
                </div>

                {/* Form Card */}
                <Card className="border-blue-200 bg-blue-50/30 shadow-lg">
                    <CardHeader className="border-b border-blue-200 bg-blue-100/50">
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Banknote className="h-5 w-5" />
                            Receivable Transaction Details
                        </CardTitle>
                        <CardDescription className="text-blue-700">Enter the details of your receivable transaction</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
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

                            {/* Due Date */}
                            <div className="space-y-1 sm:space-y-1.5">
                                <Label htmlFor="dueDate" className="text-xs font-semibold text-gray-700 sm:text-sm">
                                    Due Date (Optional)
                                </Label>
                                <CustomDateInput
                                    id="dueDate"
                                    value={formData.dueDate || ''}
                                    onChange={(value) => handleInputChange('dueDate', value)}
                                    className="h-8 sm:h-9"
                                    placeholder="dd/mm/yyyy"
                                />
                                <p className="text-xs text-gray-500">When you expect to receive this payment</p>
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
                                            onChange={(e) => handleInputChange('exchangeRate', e.target.value)}
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
                                        {receivableCategories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
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
                                    onClick={() => router.visit(route('transactions.index'))}
                                    className="w-full px-6 py-2 text-sm font-medium sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="default"
                                    className="w-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
                                >
                                    Add Receivable
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
