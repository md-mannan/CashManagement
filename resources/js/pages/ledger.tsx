import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Banknote, Coins, CreditCard, Download, FileSpreadsheet, FileText, Plus, Printer, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const toDateOnly = (d: string) => (d || '').toString().split('T')[0]?.slice(0, 10) || '';

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
                total_expenses_with_payable_settlements: number;
                total_receivables: number;
                total_payables: number;
                remaining_receivables: number;
                remaining_payables: number;
                total_settlements: number;
                receivable_settlements: number;
                payable_settlements: number;
                net_balance: number;
                secondary_currency_totals?: {
                    income: number;
                    expenses: number;
                    receivables: number;
                    payables: number;
                    settlements: number;
                    net_balance?: number;
                };
                secondary_net_balance?: number;
                secondary_remaining_receivables?: number;
                secondary_remaining_payables?: number;
                secondary_receivable_settlements?: number;
                secondary_payable_settlements?: number;
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

    // Use a single effective exchange rate for running-balance conversion.
    // - Prefer user's configured exchange rate when it's meaningful (> 1)
    // - Otherwise derive from transaction metadata (first available rate for the user's secondary currency)
    const derivedRateFromTransactions = useMemo(() => {
        for (const t of transactions) {
            const meta = t.metadata;
            const rate = Number(meta?.exchange_rate) || 0;
            if ((meta?.secondary_currency || null) === secondaryCurrency && rate > 0) {
                return rate;
            }
        }
        return 0;
    }, [transactions, secondaryCurrency]);

    const effectiveExchangeRate =
        secondaryCurrency !== primaryCurrency && exchangeRate > 1.0001
            ? exchangeRate
            : derivedRateFromTransactions;

    const getSecondaryAmount = (transaction: (typeof transactions)[number]) => {
        // Secondary amounts must be computed consistently:
        // - Prefer stored metadata.secondary_amount when present
        // - If missing but this transaction is recorded in the user's secondary currency, derive from exchange_rate
        // - Otherwise return 0 (no secondary value to track)
        const amountPrimary = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) || 0 : transaction.amount || 0;
        const meta = transaction.metadata;
        const epsilon = 1e-9;
        if (Math.abs(amountPrimary) < epsilon) return 0;

        const secondaryTxnCurrency = meta?.secondary_currency;
        const storedSecondary = Number(meta?.secondary_amount) || 0;
        if (storedSecondary > 0 && secondaryTxnCurrency === secondaryCurrency) {
            return storedSecondary;
        }

        const rate = Number(meta?.exchange_rate) || effectiveExchangeRate || 0;
        if (secondaryTxnCurrency === secondaryCurrency && rate > 0) {
            // IMPORTANT: do NOT round here.
            // Rounding each row and then summing causes drift in the final running balance
            // (e.g. ending at 19.989 instead of ~20.000). We only round in `formatCurrency`.
            return amountPrimary / rate;
        }

        return 0;
    };

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

    // Client-side date filter (single date or range)
    const filteredByDateTransactions = useMemo(() => {
        let list = [...transactions];
        if (startDate) {
            const start = startDate.slice(0, 10);
            list = list.filter((t) => toDateOnly(t.date) >= start);
        }
        if (endDate) {
            const end = endDate.slice(0, 10);
            list = list.filter((t) => toDateOnly(t.date) <= end);
        }
        return list;
    }, [transactions, startDate, endDate]);

    // Calculate running balance and prepare ledger entries (with secondary amounts; 0 rule applied)
    const prepareLedgerEntries = (txList: typeof transactions) => {
        const sortedTransactions = [...txList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningBalance = 0;
        let runningBalanceSecondary = 0;
        const ledgerEntries: Array<{
            id: number;
            date: string;
            description: string;
            source: string;
            debit: number | null;
            credit: number | null;
            balance: number;
            secondaryDebit: number | null;
            secondaryCredit: number | null;
            secondaryBalance: number;
            isOpeningBalance?: boolean;
            metadata?: typeof transactions[0]['metadata'];
        }> = [];

        if (sortedTransactions.length > 0) {
            ledgerEntries.push({
                id: 0,
                date: sortedTransactions[0].date,
                description: 'Opening Balance',
                source: 'Initial',
                debit: null,
                credit: null,
                balance: runningBalance,
                secondaryDebit: null,
                secondaryCredit: null,
                secondaryBalance: 0,
                isOpeningBalance: true,
                metadata: undefined,
            });
        }

        sortedTransactions.forEach((transaction) => {
            let debit = null;
            let credit = null;

            // Determine debit/credit based on transaction type and category
            const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) || 0 : transaction.amount || 0;
            const epsilon = 1e-9;
            const amountSecondary = Math.abs(amount) < epsilon ? 0 : getSecondaryAmount(transaction);
            const categoryName = transaction.category.name.toLowerCase();
            


            if (transaction.type === 'expense') {
                debit = amount;
                runningBalance -= amount;
            } else if (transaction.type === 'income') {
                credit = amount;
                runningBalance += amount;
            } else if (transaction.type === 'payable') {
                credit = amount;
                runningBalance += amount;
            } else if (transaction.type === 'receivable') {
                debit = amount;
                runningBalance -= amount;
            } else if (transaction.type === 'settle_receivable') {
                credit = amount;
                runningBalance += amount;
            } else if (transaction.type === 'settle_payable') {
                debit = amount;
                runningBalance -= amount;
            } else {
                if (categoryName.includes('return') || transaction.description.toLowerCase().includes('return')) {
                    credit = amount;
                    runningBalance += amount;
                } else if (categoryName.includes('pay')) {
                    debit = amount;
                    runningBalance -= amount;
                }
            }

            if (debit === null && credit === null && amount > 0) {
                if (transaction.description.toLowerCase().includes('return')) {
                    credit = amount;
                    runningBalance += amount;
                }
            }

            // Running secondary balance should be derived from the running primary balance,
            // otherwise inconsistent/missing stored secondary amounts can drift the final balance.
            if (effectiveExchangeRate > 0 && secondaryCurrency !== primaryCurrency) {
                runningBalanceSecondary = runningBalance / effectiveExchangeRate;
            }

            const secondaryDebit = debit != null ? amountSecondary : null;
            const secondaryCredit = credit != null ? amountSecondary : null;

            ledgerEntries.push({
                id: transaction.id,
                date: transaction.date,
                description: transaction.description,
                source: transaction.source,
                category: transaction.category.name,
                user: transaction.user,
                debit,
                credit,
                balance: runningBalance,
                secondaryDebit,
                secondaryCredit,
                secondaryBalance: runningBalanceSecondary,
                type: transaction.type,
                metadata: transaction.metadata,
            });
        });

        return ledgerEntries;
    };

    const ledgerEntries = useMemo(
        () => prepareLedgerEntries(filteredByDateTransactions),
        [filteredByDateTransactions],
    );

    // Use backend summary data for consistency with transaction page
    const getSecondaryCurrencyDisplay = (type: 'income' | 'expenses' | 'receivables' | 'payables' | 'settlements') => {
        if (summary.secondary_currency_totals && summary.secondary_currency_totals[type] !== undefined) {
            return summary.secondary_currency_totals[type];
        }
        return null;
    };

    // Format currency amounts with proper decimal places
    const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
        // Handle null/undefined amounts
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '0.00';
        }

        // Convert to number and handle floating point precision issues
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        // Use proper rounding to avoid floating point precision issues
        let roundedAmount;
        if (currency === 'KWD') {
            // For KWD, round to 3 decimal places
            roundedAmount = Math.round(numAmount * 1000) / 1000;
        } else {
            // For other currencies (including BDT), round to 2 decimal places
            roundedAmount = Math.round(numAmount * 100) / 100;
        }

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
                        border: 1px solid #000; 
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
                    .footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                        padding: 10px;
                    }
                    @media print {
                        body { margin: 0; }
                        @page { 
                            margin: 1cm;
                            @bottom-center {
                                content: "Page " counter(page) " of " counter(pages);
                                font-size: 10px;
                                color: #666;
                            }
                        }
                        .header-info {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>General Ledger</h1>
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
                <div class="footer">
                    Page <span class="page-number"></span>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
            // Add page numbering script
            const script = printWindow.document.createElement('script');
            script.textContent = `
                window.onbeforeprint = function() {
                    // This will be handled by CSS @page rule
                };
            `;
            printWindow.document.head.appendChild(script);
            
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
                            {/* Net Balance Card - 0 rule: if either primary or secondary net is 0, show both 0 */}
                            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-800">Net Balance</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
                                        <Coins className="h-4 w-4 text-purple-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const epsilon = 1e-9;
                                        // Use the latest running balance from the ledger (last row)
                                        // so Summary always matches the table's final "Balance".
                                        const last = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1] : null;
                                        const primaryNetRaw = Number(last?.balance ?? 0);
                                        const secondaryNetRaw = Number(last?.secondaryBalance ?? 0);
                                        const shouldForceZero =
                                            Math.abs(primaryNetRaw) < epsilon ||
                                            Math.abs(secondaryNetRaw) < epsilon;
                                        const primaryDisplay = shouldForceZero ? 0 : primaryNetRaw;
                                        const secondaryDisplay = shouldForceZero ? 0 : secondaryNetRaw;
                                        return (
                                            <>
                                                <div className="text-2xl font-bold text-purple-800">
                                                    {primarySymbol} {formatCurrency(primaryDisplay, primaryCurrency)}
                                                </div>
                                                <div className="space-y-1 text-sm text-purple-600">
                                                    <div>
                                                        {secondarySymbol} {formatCurrency(secondaryDisplay, secondaryCurrency)}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                    <p className="mt-1 text-xs text-purple-600">Current balance</p>
                                </CardContent>
                            </Card>

                            {/* Income Card */}
                            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-green-800">Total Income</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                                        <TrendingUp className="h-4 w-4 text-green-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-800">
                                        {primarySymbol} {formatCurrency(summary.total_income, primaryCurrency)}
                                    </div>
                                    <div className="space-y-1 text-sm text-green-600">
                                        {getSecondaryCurrencyDisplay('income') !== null && (
                                            <div>
                                                {secondarySymbol} {formatCurrency(getSecondaryCurrencyDisplay('income') || 0, secondaryCurrency)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-green-600">
                                        {transactions.filter((t) => t.type === 'income').length} transactions
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Expenses Card */}
                            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200">
                                        <TrendingDown className="h-4 w-4 text-red-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-800">
                                        {primarySymbol} {formatCurrency(summary.total_expenses, primaryCurrency)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        <div>Regular: {primarySymbol}{formatCurrency(summary.total_expenses, primaryCurrency)}</div>
                                    </div>
                                    <div className="space-y-1 text-sm text-red-600 mt-1">
                                        {getSecondaryCurrencyDisplay('expenses') !== null && (
                                            <div>
                                                {secondarySymbol} {formatCurrency(getSecondaryCurrencyDisplay('expenses') || 0, secondaryCurrency)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-red-600">
                                        {transactions.filter((t) => t.type === 'expense').length} expenses
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Payable Card */}
                            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-orange-800">Payables</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200">
                                        <CreditCard className="h-4 w-4 text-orange-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-800">
                                        {primarySymbol} {formatCurrency(summary.total_payables, primaryCurrency)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        <div>Remaining: {primarySymbol}{formatCurrency(summary.remaining_payables, primaryCurrency)}</div>
                                        <div>Settled: {primarySymbol}{formatCurrency(summary.payable_settlements || 0, primaryCurrency)}</div>
                                    </div>
                                    <div className="space-y-1 text-sm text-orange-600 mt-1">
                                        {getSecondaryCurrencyDisplay('payables') !== null && (
                                            <div>
                                                {secondarySymbol} {formatCurrency(getSecondaryCurrencyDisplay('payables') || 0, secondaryCurrency)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-orange-600">
                                        {transactions.filter((t) => t.type === 'payable').length} transactions
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Receivable Card */}
                            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-800">Receivables</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                                        <Banknote className="h-4 w-4 text-blue-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-800">
                                        {primarySymbol} {formatCurrency(summary.total_receivables, primaryCurrency)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        <div>Remaining: {primarySymbol}{formatCurrency(summary.remaining_receivables, primaryCurrency)}</div>
                                        <div>Settled: {primarySymbol}{formatCurrency(summary.receivable_settlements || 0, primaryCurrency)}</div>
                                    </div>
                                    <div className="space-y-1 text-sm text-blue-600 mt-1">
                                        {getSecondaryCurrencyDisplay('receivables') !== null && (
                                            <div>
                                                {secondarySymbol} {formatCurrency(getSecondaryCurrencyDisplay('receivables') || 0, secondaryCurrency)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-blue-600">
                                        {transactions.filter((t) => t.type === 'receivable').length} transactions
                                    </p>
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
                                                        {entry.debit != null ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-red-600">
                                                                    {primarySymbol} {formatCurrency(entry.debit, primaryCurrency)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {secondarySymbol} {formatCurrency(entry.secondaryDebit ?? 0, secondaryCurrency)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm print:text-base">
                                                        {entry.credit != null ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-green-600">
                                                                    {primarySymbol} {formatCurrency(entry.credit, primaryCurrency)}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {secondarySymbol} {formatCurrency(entry.secondaryCredit ?? 0, secondaryCurrency)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span>
                                                                {primarySymbol} {formatCurrency(entry.balance, primaryCurrency)}
                                                            </span>
                                                            <span className="text-xs font-normal text-muted-foreground">
                                                                {secondarySymbol}{' '}
                                                                {formatCurrency(
                                                                    Math.abs(entry.balance) < 1e-9 ? 0 : entry.secondaryBalance,
                                                                    secondaryCurrency,
                                                                )}
                                                            </span>
                                                        </div>
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
