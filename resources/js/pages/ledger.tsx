import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Banknote, Coins, CreditCard, Download, FileSpreadsheet, FileText, Plus, Printer, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ledger',
        href: '/ledger',
    },
];

export default function Ledger() {
    const { auth, transactions, summary, filters } = usePage<
        SharedData & {
            transactions: Array<{
                id: number;
                date: string;
                description: string;
                type: 'income' | 'expense' | 'receivable' | 'payable';
                amount: number | string;
                source: string;
                category: {
                    name: string;
                    color: string;
                };
                user?: {
                    name: string;
                    email: string;
                    primary_symbol: string;
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
            }>;
            summary: {
                total_income: number;
                total_expenses: number;
                total_receivables: number;
                total_payables: number;
                net_balance: number;
            };
            filters: {
                type?: string;
                start_date?: string;
                end_date?: string;
                search?: string;
                category_id?: string;
            };
        }
    >().props;

    // User's primary currency from settings
    const primaryCurrency = auth.user.primary_currency || 'BDT';
    const primarySymbol = auth.user.primary_symbol || '৳';
    const secondaryCurrency = auth.user.secondary_currency || 'KWD';
    const secondarySymbol = auth.user.secondary_symbol || 'د.ك';
    const exchangeRate = parseFloat(auth.user.exchange_rate || '1.0');

    // Helper function to calculate converted amount (used for secondary currency conversion)
    const convertAmount = (amount: number, targetCurrency: string) => {
        if (targetCurrency === primaryCurrency) return amount;
        if (targetCurrency === secondaryCurrency) {
            // Convert from primary to secondary currency using user's exchange rate
            const convertedAmount = amount / exchangeRate;
            // Use appropriate decimal precision
            if (secondaryCurrency === 'KWD') {
                return Math.round(convertedAmount * 1000) / 1000; // 3 decimals for KWD
            }
            return Math.round(convertedAmount * 100) / 100; // 2 decimals for others
        }
        return amount;
    };

    // Date state for date-to-date export and filtering
    const [startDate, setStartDate] = useState<string>(filters?.start_date || '');
    const [endDate, setEndDate] = useState<string>(filters?.end_date || '');

    // Calculate running balance and prepare ledger entries
    const prepareLedgerEntries = () => {
        // Sort transactions by date (oldest first for running balance calculation)
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate opening balance (start with 0 for simplicity, but could be enhanced)
        let runningBalance = 0;
        const ledgerEntries = [];

        // Only add opening balance entry if there are transactions
        if (sortedTransactions.length > 0) {
            ledgerEntries.push({
                id: 0,
                date: sortedTransactions[0].date,
                description: 'Opening Balance',
                source: 'Initial',
                debit: null,
                credit: null,
                balance: runningBalance,
                isOpeningBalance: true,
                metadata: null,
            });
        }

        // Process each transaction
        sortedTransactions.forEach((transaction) => {
            let debit = null;
            let credit = null;

            // Determine debit/credit based on transaction type
            // In accounting: Debit = money going out, Credit = money coming in
            // Convert amount to number to ensure proper arithmetic (not string concatenation)
            const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) || 0 : transaction.amount || 0;

            if (transaction.type === 'expense') {
                debit = amount;
                runningBalance -= amount;
            } else if (transaction.type === 'income') {
                credit = amount;
                runningBalance += amount;
            } else if (transaction.type === 'payable') {
                // Payable = money you owe (liability) - reduces your net position
                debit = amount;
                runningBalance -= amount;
            } else if (transaction.type === 'receivable') {
                // Receivable = money owed to you (asset) - increases your net position
                credit = amount;
                runningBalance += amount;
            }

            ledgerEntries.push({
                id: transaction.id,
                date: transaction.date,
                description: transaction.description,
                source: transaction.source,
                category: transaction.category.name,
                user: transaction.user, // Add user info for admin view
                debit,
                credit,
                balance: runningBalance,
                type: transaction.type,
                metadata: transaction.metadata,
            });
        });

        return ledgerEntries;
    };

    const ledgerEntries = prepareLedgerEntries();

    // Calculate summary from original entered amounts for accurate secondary currency display
    const calculateOriginalSummary = () => {
        let originalIncome = 0;
        let originalExpenses = 0;
        let originalReceivables = 0;
        let originalPayables = 0;

        transactions.forEach((transaction) => {
            // Use original entered amount if available, otherwise use converted amount
            const originalAmount =
                transaction.metadata?.secondary_currency && transaction.metadata?.secondary_amount
                    ? transaction.metadata.secondary_amount
                    : typeof transaction.amount === 'string'
                      ? parseFloat(transaction.amount)
                      : transaction.amount;

            switch (transaction.type) {
                case 'income':
                    originalIncome += originalAmount;
                    break;
                case 'expense':
                    originalExpenses += originalAmount;
                    break;
                case 'receivable':
                    originalReceivables += originalAmount;
                    break;
                case 'payable':
                    originalPayables += originalAmount;
                    break;
            }
        });

        return {
            total_income: originalIncome,
            total_expenses: originalExpenses,
            total_receivables: originalReceivables,
            total_payables: originalPayables,
            net_balance: (originalIncome - originalExpenses) + (originalReceivables - originalPayables),
        };
    };

    const originalSummary = calculateOriginalSummary();

    // Format currency amounts with proper decimal places
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

    // Export functions
    const exportToCSV = () => {
        const headers = ['Date', 'Description', 'Source', 'Debit', 'Credit', 'Balance'];
        const data = ledgerEntries.map((entry) => [
            new Date(entry.date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }),
            entry.description,
            entry.source,
            entry.debit ? `${primarySymbol} ${formatCurrency(entry.debit, primaryCurrency)}` : '',
            entry.credit ? `${primarySymbol} ${formatCurrency(entry.credit, primaryCurrency)}` : '',
            `${primarySymbol} ${formatCurrency(entry.balance, primaryCurrency)}`,
        ]);

        // Create professional header
        const dateRangeText = startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : 'Complete Transaction History';

        const headerInfo = [
            ['TRANSACTION LEDGER REPORT'],
            [''],
            [dateRangeText],
            [
                `Generated on: ${new Date().toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })}`,
            ],
            ['Currency: ' + primaryCurrency],
            [''],
            headers,
        ];

        const csvContent = [...headerInfo.map((row) => row.join(',')), ...data.map((row) => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ledger_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        const headers = ['Date', 'Description', 'Source', 'Debit', 'Credit', 'Balance'];

        const data = ledgerEntries.map((entry) => [
            new Date(entry.date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }),
            entry.description,
            entry.source,
            entry.debit || null,
            entry.credit || null,
            entry.balance,
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction Ledger');

        // Generate and download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ledger_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
    };

    const exportToPDF = () => {
        // Create a new window with the ledger data
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>General Ledger - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        font-size: 12px;
                    }
                    h1 { 
                        text-align: center; 
                        color: #333; 
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
                    .header-info {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #666;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left;
                    }
                    th { 
                        background-color: #f5f5f5; 
                        font-weight: bold;
                        text-align: center;
                    }
                    .text-right { text-align: right; }
                    .text-red { color: #dc2626; }
                    .text-green { color: #16a34a; }
                    .font-bold { font-weight: bold; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <h1>General Ledger</h1>
                <div class="header-info">
                    <p>Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}</p>
                    <p>Total Transactions: ${ledgerEntries.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Source</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ledgerEntries.map((entry) => `
                            <tr>
                                <td>${new Date(entry.date).toLocaleDateString('en-GB')}</td>
                                <td>${entry.description}</td>
                                <td>${entry.source}</td>
                                <td class="text-right">
                                    ${entry.debit ? `<span class="text-red">${primarySymbol} ${formatCurrency(entry.debit, primaryCurrency)}</span>` : '-'}
                                </td>
                                <td class="text-right">
                                    ${entry.credit ? `<span class="text-green">${primarySymbol} ${formatCurrency(entry.credit, primaryCurrency)}</span>` : '-'}
                                </td>
                                <td class="text-right font-bold">${primarySymbol} ${formatCurrency(entry.balance, primaryCurrency)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    const printLedger = () => {
        // Use the same PDF export functionality for printing
        exportToPDF();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ledger" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-2 sm:p-4 w-full max-w-full">
                <div className="space-y-6">
                    {/* Financial Summary Section */}
                    <div className="financial-summary space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">Financial Summary</h2>
                                <p className="text-sm text-muted-foreground">Overview of your current financial position</p>
                            </div>

                            {/* Add Transaction Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Transaction
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 text-green-600"
                                        onClick={() => router.visit(route('transactions.add-income'))}
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                        Add Income
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 text-red-600"
                                        onClick={() => router.visit(route('transactions.add-expense'))}
                                    >
                                        <TrendingDown className="h-4 w-4" />
                                        Add Expense
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 text-blue-600"
                                        onClick={() => router.visit(route('transactions.add-receivable'))}
                                    >
                                        <Banknote className="h-4 w-4" />
                                        Add Receivable
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 text-orange-600"
                                        onClick={() => router.visit(route('transactions.add-payable'))}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Add Payable
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            {/* Cash Balance Card */}
                            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-800">Net Balance</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
                                        <Coins className="h-4 w-4 text-purple-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-800">
                                        {primarySymbol} {formatCurrency(summary.net_balance, primaryCurrency)}
                                    </div>
                                    <div className="space-y-1 text-sm text-purple-600">
                                        <div>
                                            {secondarySymbol} {formatCurrency(originalSummary.net_balance, secondaryCurrency)}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-purple-600">Current balance</p>
                                </CardContent>
                            </Card>

                            {/* Income Card */}
                            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-green-800">Income</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                                        <TrendingUp className="h-4 w-4 text-green-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-800">
                                        {primarySymbol} {formatCurrency(summary.total_income, primaryCurrency)}
                                    </div>
                                    <div className="space-y-1 text-sm text-green-600">
                                        <div>
                                            {secondarySymbol} {formatCurrency(originalSummary.total_income, secondaryCurrency)}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-green-600">Total income</p>
                                </CardContent>
                            </Card>

                            {/* Expenses Card */}
                            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-red-800">Expenses</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200">
                                        <TrendingDown className="h-4 w-4 text-red-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-800">
                                        {primarySymbol} {formatCurrency(summary.total_expenses, primaryCurrency)}
                                    </div>
                                    <div className="space-y-1 text-sm text-red-600">
                                        <div>
                                            {secondarySymbol} {formatCurrency(originalSummary.total_expenses, secondaryCurrency)}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-red-600">Total expenses</p>
                                </CardContent>
                            </Card>

                            {/* Payable Card */}
                            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-orange-800">Payable</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200">
                                        <CreditCard className="h-4 w-4 text-orange-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-800">
                                        {primarySymbol} {formatCurrency(summary.total_payables, primaryCurrency)}
                                    </div>
                                    <div className="space-y-1 text-sm text-orange-600">
                                        <div>
                                            {secondarySymbol} {formatCurrency(originalSummary.total_payables, secondaryCurrency)}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-orange-600">Total payables</p>
                                </CardContent>
                            </Card>

                            {/* Receivable Card */}
                            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-800">Receivable</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                                        <Banknote className="h-4 w-4 text-blue-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-800">
                                        {primarySymbol} {formatCurrency(summary.total_receivables, primaryCurrency)}
                                    </div>
                                    <div className="space-y-1 text-sm text-blue-600">
                                        <div>
                                            {secondarySymbol} {formatCurrency(originalSummary.total_receivables, secondaryCurrency)}
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-blue-600">Total receivables</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Ledger Table Section */}
                    <div className="ledger-section space-y-4">
                        <div className="print:hidden">
                            <h2 className="text-xl font-semibold tracking-tight">Transaction Ledger</h2>
                            <p className="text-sm text-muted-foreground print:hidden">Complete transaction history with running balance</p>
                        </div>

                        <Card className="print:border-0 print:shadow-none print-content">
                            <CardHeader className="print:pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="print:text-2xl">General Ledger</CardTitle>
                                        <CardDescription className="print:hidden">All transactions with running balance</CardDescription>
                                    </div>
                                    <div className="no-print flex items-center space-x-2">
                                        {/* Date-to-Date Inputs */}
                                        <div className="flex items-center space-x-2">
                                            <CustomDateInput
                                                value={startDate}
                                                onChange={(value) => setStartDate(value)}
                                                className="rounded-md border px-3 py-2 text-sm"
                                                placeholder="dd/mm/yyyy"
                                            />
                                            <span className="text-sm text-muted-foreground">to</span>
                                            <CustomDateInput
                                                value={endDate}
                                                onChange={(value) => setEndDate(value)}
                                                className="rounded-md border px-3 py-2 text-sm"
                                                placeholder="dd/mm/yyyy"
                                            />
                                        </div>

                                        {/* Export Dropdown */}
                                        <div className="group relative">
                                            <Button variant="outline" size="sm">
                                                <Download className="mr-2 h-4 w-4" />
                                                Export
                                            </Button>
                                            <div className="invisible absolute top-full right-0 z-50 mt-1 w-48 rounded-md border bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                                <div className="py-1">
                                                    <button
                                                        onClick={exportToCSV}
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                    >
                                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                        Export as CSV
                                                    </button>
                                                    <button
                                                        onClick={exportToExcel}
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                    >
                                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                        Export as Excel
                                                    </button>
                                                    <button
                                                        onClick={exportToPDF}
                                                        className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Export as PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Print Button */}
                                        <Button variant="outline" size="sm" onClick={printLedger}>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="print:p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full print:w-full">
                                        <thead>
                                            <tr className="border-b print:border-b-2">
                                                <th className="px-4 py-3 text-left text-sm font-semibold print:text-base">Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold print:text-base">Description</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold print:text-base">Source</th>

                                                <th className="px-4 py-3 text-right text-sm font-semibold print:text-base">Debit</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold print:text-base">Credit</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold print:text-base">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y print:divide-y-2">
                                            {ledgerEntries.map((entry, index) => (
                                                <tr key={entry.id || index} className="hover:bg-gray-50 print:hover:bg-transparent">
                                                    <td className="px-4 py-3 text-sm print:text-base">
                                                        {new Date(entry.date).toLocaleDateString('en-GB', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm print:text-base">{entry.description}</td>
                                                    <td className="px-4 py-3 text-sm print:text-base">{entry.source}</td>

                                                    <td className="px-4 py-3 text-right text-sm print:text-base">
                                                        {entry.debit ? (
                                                            <span className="text-red-600">
                                                                {primarySymbol} {formatCurrency(entry.debit, primaryCurrency)}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm print:text-base">
                                                        {entry.credit ? (
                                                            <span className="text-green-600">
                                                                {primarySymbol} {formatCurrency(entry.credit, primaryCurrency)}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                        {primarySymbol} {formatCurrency(entry.balance, primaryCurrency)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
