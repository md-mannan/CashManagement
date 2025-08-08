import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Banknote, CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
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

export default function AddTransaction() {
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
    });

    const transactionType = transactionTypes[type];
    const IconComponent = transactionType.icon;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement transaction submission logic
        console.log('Transaction data:', formData);
        // Here you would typically send the data to your backend
        // For now, we'll just redirect back to transactions page
        router.visit('/transactions');
    };

    const handleInputChange = (field: keyof TransactionFormData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${transactionType.title} - Personal Account`} />

            <div className="container mx-auto max-w-lg px-4 py-1 sm:px-6">
                <div className="mt-4 mb-1 flex items-center justify-between">
                    <div></div>
                </div>

                <Card className={`mt-2 border-l-4 pt-0 shadow-lg ${transactionType.borderColor} relative overflow-hidden`}>
                    {/* Back to Transactions button positioned in top-right corner of card */}
                    <div className="absolute top-2 right-2 z-10">
                        <Button variant="outline" size="sm" onClick={() => router.visit('/transactions')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back to Transactions</span>
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
                                        Amount *
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.001"
                                        placeholder="0.000"
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
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                        className="h-8 sm:h-9"
                                    />
                                </div>
                            </div>

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
                                    onClick={() => router.visit('/transactions')}
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
