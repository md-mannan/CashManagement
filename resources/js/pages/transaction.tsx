import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownLeft,
    Banknote,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    Plus,
    Printer,
    Search,
    Trash2,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction',
        href: '/transaction',
    },
];

// Real transaction data comes from backend via Inertia props

const transactionTypes = [
    { value: 'all', label: 'All Types', color: 'text-gray-600' },
    { value: 'income', label: 'Income', color: 'text-green-600' },
    { value: 'expense', label: 'Expense', color: 'text-red-600' },
    { value: 'settlement', label: 'Settlements', color: 'text-purple-600' },
    { value: 'receivable', label: 'Receivable', color: 'text-blue-600' },
    { value: 'payable', label: 'Payable', color: 'text-orange-600' },
    { value: 'settle_receivable', label: 'Settle Receivable', color: 'text-green-600' },
    { value: 'settle_payable', label: 'Settle Payable', color: 'text-red-600' },
];

type TransactionItem = {
    id: number;
    date: string;
    description: string;
    type: 'income' | 'expense' | 'receivable' | 'payable' | 'settlement' | 'settle_receivable' | 'settle_payable';
    amount: number;
    source: string;
    category: {
        name: string;
    } | null;
    user?: {
        name: string;
        email: string;
        primary_symbol: string;
    };
    notes?: string;
    metadata?: {
        secondary_currency?: string;
        exchange_rate?: number;
        secondary_amount?: number;
        primary_currency?: string;
        primary_symbol?: string;
    };
    settled_amount?: number;
    settlements?: unknown[];
};

export default function Transaction() {
    const { auth, transactions, summary, flash, errors } = usePage<
        SharedData & {
            transactions: TransactionItem[];
            summary: {
                total_income: number;
                total_expenses: number;
                total_expenses_with_payable_settlements: number;
                total_receivables: number;
                total_payables: number;
                remaining_receivables: number;
                remaining_payables: number;
                total_settlements: number;
                receivable_settlements: number;
                payable_settlements: number;
                net_balance: number;
                secondary_amounts?: {
                    total_income: number;
                    total_expenses: number;
                    total_receivables: number;
                    total_payables: number;
                    receivable_settlements: number;
                    payable_settlements: number;
                };
            };
            flash?: { success?: string; error?: string };
            errors?: Record<string, string[]>;
        }
    >().props;

    // Client-side filtering states
    const [searchInput, setSearchInput] = useState(''); // What user types in search
    const [selectedType, setSelectedType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // All transactions from backend (no server-side filtering)
    const allTransactions = transactions;

    // Confirmation modal states
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; transactionId: number | null }>({
        isOpen: false,
        transactionId: null,
    });
    const [editConfirmation, setEditConfirmation] = useState<{ isOpen: boolean; transactionId: number | null }>({
        isOpen: false,
        transactionId: null,
    });

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'BDT';
    const primarySymbol = auth.user.primary_symbol || '৳';
    const secondaryCurrency = auth.user.secondary_currency || 'KWD';
    const secondarySymbol = auth.user.secondary_symbol || 'د.ك';

    const { addToast } = useToast();

    // Show toast when redirect returns with delete error (e.g. transaction has settlements)
    useEffect(() => {
        const msg = (errors as Record<string, string[] | undefined>)?.['delete']?.[0] ?? (flash as { error?: string })?.error;
        if (msg) {
            addToast({
                type: 'error',
                title: 'Cannot delete transaction',
                message: msg,
            });
        }
    }, [errors, flash, addToast]);

    // Client-side filtering logic
    const filteredTransactions = useMemo(() => {
        let filtered = [...allTransactions];

        const getCategoryName = (t: TransactionItem) => t.category?.name ?? 'Uncategorized';

        // Search filter (no reloading - instant)
        if (searchInput.trim()) {
            const searchTerm = searchInput.toLowerCase();
            filtered = filtered.filter(
                (transaction) =>
                    transaction.description.toLowerCase().includes(searchTerm) ||
                    transaction.source.toLowerCase().includes(searchTerm) ||
                    getCategoryName(transaction).toLowerCase().includes(searchTerm) ||
                    transaction.notes?.toLowerCase().includes(searchTerm) ||
                    transaction.amount.toString().includes(searchTerm) ||
                    transaction.type.toLowerCase().includes(searchTerm),
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            filtered = filtered.filter((transaction) => transaction.type === selectedType);
        }

        // Date range / single-date filter: compare only YYYY-MM-DD (backend may send datetime strings)
        const toDateOnly = (d: string) => (d || '').toString().split('T')[0]?.slice(0, 10) || '';
        if (startDate) {
            const start = startDate.slice(0, 10);
            filtered = filtered.filter((t) => toDateOnly(t.date) >= start);
        }
        if (endDate) {
            const end = endDate.slice(0, 10);
            filtered = filtered.filter((t) => toDateOnly(t.date) <= end);
        }

        return filtered;
    }, [allTransactions, searchInput, selectedType, startDate, endDate]);

    // Format currency
    const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
        // Validate input amount - return 0.00 if invalid
        if (!amount || isNaN(amount)) {
            return currency === 'KWD' ? '0.000' : '0.00';
        }

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
                return 'text-green-600 bg-green-50';
            case 'expense':
                return 'text-red-600 bg-red-50';
            case 'receivable':
                return 'text-blue-600 bg-blue-50';
            case 'payable':
                return 'text-orange-600 bg-orange-50';
            case 'settle_receivable':
                return 'text-green-600 bg-green-50';
            case 'settle_payable':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getAmountDisplay = (transaction: TransactionItem) => {
        const { type } = transaction;
        const categoryName = transaction.category?.name ?? '';

        // Handle settlement transactions based on category
        if (type === 'settlement') {
            if (categoryName.includes('Pay') || categoryName.includes('pay')) {
                // Payable settlement (paying back borrowed money) - negative
                return { sign: '-', color: 'text-red-600' };
            } else if (categoryName.includes('Return') || categoryName.includes('return')) {
                // Receivable settlement (getting money back) - positive
                return { sign: '+', color: 'text-green-600' };
            }
        }

        // Handle regular transaction types
        switch (type) {
            case 'income':
                return { sign: '+', color: 'text-green-600' };
            case 'expense':
                return { sign: '-', color: 'text-red-600' };
            case 'payable':
                return { sign: '+', color: 'text-orange-600' };
            case 'receivable':
                return { sign: '-', color: 'text-blue-600' };
            case 'settle_receivable':
                return { sign: '+', color: 'text-green-600' };
            case 'settle_payable':
                return { sign: '-', color: 'text-red-600' };
            default:
                return { sign: '+', color: 'text-gray-600' };
        }
    };

    // Primary + secondary amount for table; when primary is 0, show secondary as 0 (avoid mismatch).
    const getAmountWithSecondary = (transaction: TransactionItem) => {
        const primary = Number(transaction.amount) || 0;
        const epsilon = 1e-9;
        const secondary =
            Math.abs(primary) < epsilon ? 0 : Number(transaction.metadata?.secondary_amount) || 0;
        return { primary, secondary };
    };

    const getStatusDisplay = (transaction: TransactionItem) => {
        const { type, settled_amount, amount } = transaction;

        // Only show status for receivable and payable transactions
        if (type !== 'receivable' && type !== 'payable') {
            return null;
        }

        // Calculate settlement status
        const totalAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
        const settledAmount = typeof settled_amount === 'number' ? settled_amount : Number(settled_amount) || 0;

        let statusType = 'pending';
        let statusText = 'Pending';
        let statusColor = 'text-yellow-600 bg-yellow-50';
        let statusIcon = '⏳';

        if (settledAmount > 0) {
            if (settledAmount >= totalAmount) {
                statusType = 'completed';
                statusText = 'Settled';
                statusColor = 'text-green-600 bg-green-50';
                statusIcon = '✅';
            } else {
                statusType = 'partial';
                statusText = `Partial (${formatCurrency(settledAmount, primaryCurrency)}/${formatCurrency(totalAmount, primaryCurrency)})`;
                statusColor = 'text-blue-600 bg-blue-50';
                statusIcon = '🔄';
            }
        }

        return {
            type: statusType,
            text: statusText,
            color: statusColor,
            icon: statusIcon,
            settledAmount,
            totalAmount,
            remainingAmount: totalAmount - settledAmount,
        };
    };

    // Confirmation handlers
    const handleDeleteClick = (transactionId: number) => {
        setDeleteConfirmation({ isOpen: true, transactionId });
    };

    const handleEditClick = (transactionId: number) => {
        setEditConfirmation({ isOpen: true, transactionId });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmation.transactionId) {
            router.delete(route('transactions.destroy', deleteConfirmation.transactionId), {
                onSuccess: () => {
                    addToast({
                        type: 'success',
                        title: 'Transaction Deleted!',
                        message: 'The transaction has been successfully deleted.',
                    });
                },
                onError: (errs) => {
                    const record = errs as unknown as Record<string, unknown>;
                    const deleteErrors = record.delete;
                    const msg =
                        (Array.isArray(deleteErrors) && typeof deleteErrors[0] === 'string' && deleteErrors[0]) ||
                        (typeof record.message === 'string' && record.message) ||
                        'This transaction could not be deleted. It may have settlement entries linked to it—open the transaction and delete those entries first.';
                    addToast({
                        type: 'error',
                        title: 'Cannot delete transaction',
                        message: typeof msg === 'string' ? msg : 'This transaction may have settlement entries linked to it. Delete those first.',
                    });
                },
            });
        }
        setDeleteConfirmation({ isOpen: false, transactionId: null });
    };

    const handleEditConfirm = () => {
        if (editConfirmation.transactionId) {
            router.visit(route('transactions.edit', editConfirmation.transactionId));
        }
        setEditConfirmation({ isOpen: false, transactionId: null });
    };

    const handleCancel = () => {
        setDeleteConfirmation({ isOpen: false, transactionId: null });
        setEditConfirmation({ isOpen: false, transactionId: null });
    };

    // Handle view transaction
    const handleViewTransaction = (transactionId: number) => {
        try {
            const generatedRoute = route('transactions.show', transactionId);
            router.visit(generatedRoute, {
                preserveState: false,
                preserveScroll: false,
            });
        } catch {
            // Route generation failed silently
        }
    };

    // Export to Excel functionality
    const exportToExcel = () => {
        // Prepare data for export
        const exportData = filteredTransactions.map((transaction, index) => ({
            SL: index + 1,
            Date: formatDate(transaction.date),
            Description: transaction.description,
            Type:
                transaction.type === 'settlement'
                    ? transaction.category?.name ?? 'Settlement'
                    : transaction.type === 'settle_receivable'
                      ? 'Settle Receivable'
                      : transaction.type === 'settle_payable'
                        ? 'Settle Payable'
                        : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            Source: transaction.source,
            Category: transaction.category?.name ?? 'Uncategorized',
            Amount: `${getAmountDisplay(transaction).sign} ${primarySymbol} ${formatCurrency(transaction.amount, primaryCurrency)}`,
        }));

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const columnWidths = [
            { wch: 5 }, // SL
            { wch: 12 }, // Date
            { wch: 25 }, // Description
            { wch: 10 }, // Type
            { wch: 20 }, // Source
            { wch: 15 }, // Category
            { wch: 15 }, // Amount
        ];
        worksheet['!cols'] = columnWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        // Generate filename with current date
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `transactions_${currentDate}.xlsx`;

        // Save the file
        XLSX.writeFile(workbook, filename);
    };

    // Export to PDF functionality
    const exportToPDF = () => {
        // Create the HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Transactions Report</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #000;
                        line-height: 1.4;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0 0 10px 0;
                        color: #333;
                    }
                    .summary {
                        margin-bottom: 20px;
                        font-size: 14px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #333;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        text-align: center;
                    }
                    .amount {
                        text-align: right;
                        font-weight: bold;
                    }
                    .income { color: #008000; }
                    .expense { color: #cc0000; }
                    @media print {
                        body { margin: 10px; }
                        table { page-break-inside: avoid; }
                        .header { break-after: avoid; }
                        @page { 
                            margin: 1cm;
                            @bottom-center {
                                content: "Page " counter(page) " of " counter(pages);
                                font-size: 10px;
                                color: #666;
                            }
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Transactions Report</h1>
                </div>
                <div class="summary">
                    <p><strong>Total Transactions:</strong> ${filteredTransactions.length}</p>
                    <p><strong>Date Range:</strong> All transactions</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">SL</th>
                            <th style="width: 12%;">Date</th>
                            <th style="width: 25%;">Description</th>
                            <th style="width: 10%;">Type</th>
                            <th style="width: 15%;">Source</th>
                            <th style="width: 15%;">Category</th>
                            <th style="width: 18%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTransactions
                            .map(
                                (transaction, index) => `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td style="text-transform: capitalize;">${transaction.type === 'settle_receivable' || transaction.type === 'settle_payable' ? (transaction.category?.name ?? 'Settlement') : transaction.type}</td>
                                <td>${transaction.source}</td>
                                <td>${transaction.category?.name ?? 'Uncategorized'}</td>
                                <td class="amount ${transaction.type === 'income' || transaction.type === 'settle_receivable' ? 'income' : 'expense'}">${transaction.type === 'income' || transaction.type === 'settle_receivable' ? '+' : '-'} ${primarySymbol} ${formatCurrency(transaction.amount, primaryCurrency)}</td>
                            </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                </table>
                <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
                    <p>This report was generated automatically from the Cash Management System</p>
                </div>
                <div class="footer" style="position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #666; padding: 10px;">
                    Page <span class="page-number"></span>
                </div>
            </body>
            </html>
        `;

        // Open in a new window but trigger print immediately
        const printWindow = window.open('', 'printWindow', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Wait for content to load then print
            printWindow.onload = () => {
                printWindow.print();
                printWindow.close();
            };

            // Fallback in case onload doesn't fire
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 1000);
        }
    };

    // Print transactions functionality (without opening new window)
    const printTransactions = () => {
        // Use the same approach as PDF export
        exportToPDF();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction" />
            <div className="flex h-full w-full max-w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-2 sm:p-4">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Transactions</h1>
                        <p className="text-sm text-muted-foreground">Manage and view all your transactions</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Transaction
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-green-600"
                                onClick={() => router.visit(route('transactions.add-income'))}
                            >
                                <Plus className="h-4 w-4" />
                                Add Income
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() => router.visit(route('transactions.add-expense'))}
                            >
                                <Plus className="h-4 w-4" />
                                Add Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-blue-600"
                                onClick={() => router.visit(route('transactions.add-receivable'))}
                            >
                                <Plus className="h-4 w-4" />
                                Add Receivable
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-orange-600"
                                onClick={() => router.visit(route('transactions.add-payable'))}
                            >
                                <Plus className="h-4 w-4" />
                                Add Payable
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Transaction Summary */}
                <div className="grid w-full max-w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {/* Net Balance - First Card */}
                    <Card className="border-violet-200 bg-violet-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-violet-800">Net Balance</CardTitle>
                            <FileText className="h-4 w-4 text-violet-600" />
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const epsilon = 1e-9;
                                const primaryNetRaw = Number(summary.net_balance ?? 0);
                                const secondaryNetRaw = summary.secondary_amounts
                                    ? summary.secondary_amounts.total_income -
                                      summary.secondary_amounts.total_expenses -
                                      summary.secondary_amounts.total_receivables +
                                      summary.secondary_amounts.total_payables +
                                      summary.secondary_amounts.receivable_settlements -
                                      summary.secondary_amounts.payable_settlements
                                    : null;

                                // If either currency net is zero, force BOTH to show zero (sync display).
                                const shouldForceZero =
                                    Math.abs(primaryNetRaw) < epsilon ||
                                    (secondaryNetRaw !== null && Math.abs(secondaryNetRaw) < epsilon);

                                const primaryNetDisplay = shouldForceZero ? 0 : primaryNetRaw;
                                const secondaryNetDisplay = shouldForceZero ? 0 : secondaryNetRaw;

                                return (
                                    <>
                                        <div className={`text-2xl font-bold ${primaryNetDisplay >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {primarySymbol}
                                            {formatCurrency(primaryNetDisplay, primaryCurrency)}
                                        </div>

                                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                                            {secondaryNetDisplay === null ? null : (
                                                <div className={`${secondaryNetDisplay >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {secondarySymbol} {formatCurrency(secondaryNetDisplay, secondaryCurrency)}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                            <p className="text-xs text-muted-foreground">
                                Income - Expenses - Receivables + Payables + Receivable Settlements - Payable Settlements
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {primarySymbol}
                                {formatCurrency(summary.total_income, primaryCurrency)}
                            </div>
                            <div className="mt-1 space-y-1 text-sm text-gray-600">
                                {summary.secondary_amounts && summary.secondary_amounts.total_income > 0 && (
                                    <div>
                                        {secondarySymbol} {formatCurrency(summary.secondary_amounts.total_income, secondaryCurrency)}
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {filteredTransactions.filter((t) => t.type === 'income').length} transactions
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {primarySymbol}
                                {formatCurrency(summary.total_expenses, primaryCurrency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {filteredTransactions.filter((t) => t.type === 'expense').length} expenses
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                <div>
                                    Regular: {primarySymbol}
                                    {formatCurrency(summary.total_expenses, primaryCurrency)}{' '}
                                    {summary.secondary_amounts &&
                                        summary.secondary_amounts.total_expenses > 0 &&
                                        `/ ${secondarySymbol} ${formatCurrency(summary.secondary_amounts.total_expenses, secondaryCurrency)}`}
                                </div>
                            </div>
                            <div className="mt-1 space-y-1 text-sm text-gray-600">
                                {summary.secondary_amounts && summary.secondary_amounts.total_expenses > 0 && (
                                    <div>
                                        {secondarySymbol} {formatCurrency(summary.secondary_amounts.total_expenses, secondaryCurrency)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payables</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {primarySymbol}
                                {formatCurrency(summary.total_payables, primaryCurrency)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {filteredTransactions.filter((t) => t.type === 'payable').length} transactions
                            </p>
                            <div className="mt-1 text-xs text-muted-foreground">
                                <div>
                                    Remaining: {primarySymbol}
                                    {formatCurrency(summary.remaining_payables, primaryCurrency)}{' '}
                                    {summary.secondary_amounts &&
                                        summary.secondary_amounts.total_payables - summary.secondary_amounts.payable_settlements > 0 &&
                                        `/ ${secondarySymbol} ${formatCurrency(summary.secondary_amounts.total_payables - summary.secondary_amounts.payable_settlements, secondaryCurrency)}`}
                                </div>
                                <div>
                                    Settled: {primarySymbol}
                                    {formatCurrency(summary.payable_settlements || 0, primaryCurrency)}{' '}
                                    {summary.secondary_amounts &&
                                        summary.secondary_amounts.payable_settlements > 0 &&
                                        `/ ${secondarySymbol} ${formatCurrency(summary.secondary_amounts.payable_settlements, secondaryCurrency)}`}
                                </div>
                            </div>
                            <div className="mt-1 space-y-1 text-sm text-gray-600">
                                {summary.secondary_amounts && summary.secondary_amounts.total_payables > 0 && (
                                    <div>
                                        {secondarySymbol} {formatCurrency(summary.secondary_amounts.total_payables, secondaryCurrency)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receivables</CardTitle>
                            <Banknote className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {primarySymbol}
                                {formatCurrency(summary.total_receivables, primaryCurrency)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {filteredTransactions.filter((t) => t.type === 'receivable').length} transactions
                            </p>
                            <div className="mt-1 text-xs text-muted-foreground">
                                <div>
                                    Remaining: {primarySymbol}
                                    {formatCurrency(summary.remaining_receivables, primaryCurrency)}{' '}
                                    {summary.secondary_amounts &&
                                        summary.secondary_amounts.total_receivables - summary.secondary_amounts.receivable_settlements > 0 &&
                                        `/ ${secondarySymbol} ${formatCurrency(summary.secondary_amounts.total_receivables - summary.secondary_amounts.receivable_settlements, secondaryCurrency)}`}
                                </div>
                                <div>
                                    Settled: {primarySymbol}
                                    {formatCurrency(summary.receivable_settlements || 0, primaryCurrency)}{' '}
                                    {summary.secondary_amounts &&
                                        summary.secondary_amounts.receivable_settlements > 0 &&
                                        `/ ${secondarySymbol} ${formatCurrency(summary.secondary_amounts.receivable_settlements, secondaryCurrency)}`}
                                </div>
                            </div>
                            <div className="mt-1 space-y-1 text-sm text-gray-600">
                                {summary.secondary_amounts && summary.secondary_amounts.total_receivables > 0 && (
                                    <div>
                                        {secondarySymbol} {formatCurrency(summary.secondary_amounts.total_receivables, secondaryCurrency)}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Filters apply instantly as you type. Clear fields to reset.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search transactions..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={selectedType} onValueChange={setSelectedType}>
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

                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <CustomDateInput
                                    id="startDate"
                                    value={startDate}
                                    onChange={(value) => setStartDate(value)}
                                    placeholder="dd/mm/yyyy"
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <CustomDateInput id="endDate" value={endDate} onChange={(value) => setEndDate(value)} placeholder="dd/mm/yyyy" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-6">
                        <p className="text-sm text-muted-foreground">Showing {filteredTransactions.length} transactions</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={exportToExcel}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export to Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToPDF}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export to PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={printTransactions}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Transactions Table */}
                <Card>
                    <CardContent className="p-0">
                        {/* Desktop & Tablet Table */}
                        <div className="hidden sm:block">
                            <div className="mobile-table-wrapper">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">SL</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Source</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-32">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                                    No transactions found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTransactions.map((transaction, index) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>{formatDate(transaction.date)}</TableCell>
                                                    <TableCell className="font-medium">{transaction.description}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(transaction.type)}`}
                                                        >
                                                            {transaction.type === 'settlement'
                                                                ? transaction.category?.name ?? 'Settlement'
                                                                : transaction.type === 'settle_receivable'
                                                                  ? 'Settle Receivable'
                                                                  : transaction.type === 'settle_payable'
                                                                    ? 'Settle Payable'
                                                                    : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{transaction.source}</TableCell>
                                                    <TableCell>{transaction.category?.name ?? 'Uncategorized'}</TableCell>

                                                    <TableCell className={getAmountDisplay(transaction).color}>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span>
                                                                {getAmountDisplay(transaction).sign}{' '}
                                                                {transaction.user?.primary_symbol || primarySymbol}{' '}
                                                                {formatCurrency(transaction.amount, primaryCurrency)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {secondarySymbol} {formatCurrency(getAmountWithSecondary(transaction).secondary, secondaryCurrency)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const statusDisplay = getStatusDisplay(transaction);
                                                            if (!statusDisplay) {
                                                                return <span className="text-gray-400">-</span>;
                                                            }
                                                            return (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm">{statusDisplay.icon}</span>
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusDisplay.color}`}
                                                                    >
                                                                        {statusDisplay.text}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewTransaction(transaction.id)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditClick(transaction.id)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(transaction.id)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="block sm:hidden">
                            <div className="space-y-3 p-4">
                                {filteredTransactions.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">No transactions found matching your criteria.</div>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <div key={transaction.id} className="rounded-lg border bg-white p-3 dark:bg-gray-800">
                                            <div className="mb-2 flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">{transaction.description}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {formatDate(transaction.date)} • {transaction.category?.name ?? 'Uncategorized'}
                                                    </div>
                                                </div>
                                                <div className="ml-2 flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewTransaction(transaction.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(transaction.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(transaction.id)}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(transaction.type)}`}
                                                    >
                                                        {transaction.type === 'settlement'
                                                            ? transaction.category?.name ?? 'Settlement'
                                                            : transaction.type === 'settle_receivable'
                                                              ? 'Settle Receivable'
                                                              : transaction.type === 'settle_payable'
                                                                ? 'Settle Payable'
                                                                : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{transaction.source}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`text-sm font-medium ${getAmountDisplay(transaction).color}`}>
                                                        {getAmountDisplay(transaction).sign}{' '}
                                                        {transaction.user?.primary_symbol || primarySymbol}{' '}
                                                        {formatCurrency(transaction.amount, primaryCurrency)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {secondarySymbol}{' '}
                                                        {formatCurrency(getAmountWithSecondary(transaction).secondary, secondaryCurrency)}
                                                    </div>
                                                    {(() => {
                                                        const statusDisplay = getStatusDisplay(transaction);
                                                        if (!statusDisplay) {
                                                            return null;
                                                        }
                                                        return (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs">{statusDisplay.icon}</span>
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${statusDisplay.color}`}
                                                                >
                                                                    {statusDisplay.text}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in" onClick={handleCancel} />

                    {/* Modal */}
                    <div className="relative m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl duration-200 animate-in zoom-in-95">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>

                            {/* Title */}
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Delete Transaction</h3>

                            {/* Description */}
                            <p className="mb-6 text-sm text-gray-500">
                                Are you sure you want to delete this transaction? This action cannot be undone.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleCancel} className="flex-1 transition-colors duration-200 hover:bg-gray-50">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 bg-red-600 text-white transition-all duration-200 hover:scale-105 hover:bg-red-700"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Confirmation Modal */}
            {editConfirmation.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in" onClick={handleCancel} />

                    {/* Modal */}
                    <div className="relative m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl duration-200 animate-in zoom-in-95">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Edit className="h-6 w-6 text-blue-600" />
                            </div>

                            {/* Title */}
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Edit Transaction</h3>

                            {/* Description */}
                            <p className="mb-6 text-sm text-gray-500">Do you want to edit this transaction? You'll be redirected to the edit page.</p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleCancel} className="flex-1 transition-colors duration-200 hover:bg-gray-50">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleEditConfirm}
                                    className="flex-1 bg-blue-600 text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700"
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
