import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Banknote, Coins, CreditCard, Download, FileSpreadsheet, FileText, Plus, Printer, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction Details',
        href: '/transactions',
    },
];

export default function Transactions() {
    // User's primary currency from settings (this should come from user settings/context)
    const primaryCurrency = 'KWD'; // This should be fetched from user settings
    const currencySymbols = {
        USD: '$',
        KWD: 'KWD',
        EUR: '€',
        BDT: 'BDT',
    };
    const currencySymbol = currencySymbols[primaryCurrency as keyof typeof currencySymbols] || primaryCurrency;

    // Date state for date-to-date export
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Format currency amounts with proper decimal places
    const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
        const formatNumber = (num: number, decimals: number) => {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        };

        if (currency === 'KWD') {
            return formatNumber(amount, 3); // 3 decimal places for KWD
        }
        return formatNumber(amount, 2); // 2 decimal places for other currencies
    };

    // Export functions
    const exportToCSV = () => {
        const headers = ['Date', 'Description', 'Source', 'Debit', 'Credit', 'Balance'];
        const data = [
            ['01/01/2024', 'Opening Balance', 'Initial', '', '', `${currencySymbol} ${formatCurrency(1500, 'KWD')}`],
            [
                '05/01/2024',
                'Salary Payment',
                'Company Inc.',
                '',
                `${currencySymbol} ${formatCurrency(3750, 'KWD')}`,
                `${currencySymbol} ${formatCurrency(5250, 'KWD')}`,
            ],
            [
                '08/01/2024',
                'Grocery Shopping',
                'Local Supermarket',
                `${currencySymbol} ${formatCurrency(450, 'KWD')}`,
                '',
                `${currencySymbol} ${formatCurrency(4800, 'KWD')}`,
            ],
            [
                '12/01/2024',
                'Freelance Project',
                'Client XYZ',
                '',
                `${currencySymbol} ${formatCurrency(1200, 'KWD')}`,
                `${currencySymbol} ${formatCurrency(6000, 'KWD')}`,
            ],
            [
                '15/01/2024',
                'Utility Bills',
                'Electricity Co.',
                `${currencySymbol} ${formatCurrency(180, 'KWD')}`,
                '',
                `${currencySymbol} ${formatCurrency(5820, 'KWD')}`,
            ],
            [
                '18/01/2024',
                'Investment Dividend',
                'Investment Bank',
                '',
                `${currencySymbol} ${formatCurrency(500, 'KWD')}`,
                `${currencySymbol} ${formatCurrency(6320, 'KWD')}`,
            ],
            [
                '22/01/2024',
                'Restaurant Dinner',
                'Fine Dining',
                `${currencySymbol} ${formatCurrency(120, 'KWD')}`,
                '',
                `${currencySymbol} ${formatCurrency(6200, 'KWD')}`,
            ],
            [
                '25/01/2024',
                'Online Course Payment',
                'EduPlatform',
                `${currencySymbol} ${formatCurrency(300, 'KWD')}`,
                '',
                `${currencySymbol} ${formatCurrency(5900, 'KWD')}`,
            ],
            [
                '28/01/2024',
                'Consulting Fee',
                'Business Corp',
                '',
                `${currencySymbol} ${formatCurrency(800, 'KWD')}`,
                `${currencySymbol} ${formatCurrency(6700, 'KWD')}`,
            ],
            [
                '30/01/2024',
                'Shopping Mall',
                'Mall Center',
                `${currencySymbol} ${formatCurrency(250, 'KWD')}`,
                '',
                `${currencySymbol} ${formatCurrency(6450, 'KWD')}`,
            ],
            [
                '31/01/2024',
                'Month End Balance',
                'Summary',
                `${currencySymbol} ${formatCurrency(1300, 'KWD')}`,
                `${currencySymbol} ${formatCurrency(6250, 'KWD')}`,
                `${currencySymbol} ${formatCurrency(6450, 'KWD')}`,
            ],
        ];

        // Create professional header
        const dateRangeText = startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : 'Complete Transaction History';

        const headerInfo = [
            ['TRANSACTION LEDGER REPORT'],
            [''],
            [dateRangeText],
            [`Generated on: ${new Date().toLocaleDateString()}`],
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
        // Create a properly formatted Excel file using XLSX library with theme colors
        const workbook = XLSX.utils.book_new();

        // Prepare the data with headers
        const headers = ['Date', 'Description', 'Source', 'Debit', 'Credit', 'Balance'];

        const data = [
            ['01/01/2024', 'Opening Balance', 'Initial', null, null, 1500],
            ['05/01/2024', 'Salary Payment', 'Company Inc.', null, 3750, 5250],
            ['08/01/2024', 'Grocery Shopping', 'Local Supermarket', 450, null, 4800],
            ['12/01/2024', 'Freelance Project', 'Client XYZ', null, 1200, 6000],
            ['15/01/2024', 'Utility Bills', 'Electricity Co.', 180, null, 5820],
            ['18/01/2024', 'Investment Dividend', 'Investment Bank', null, 500, 6320],
            ['22/01/2024', 'Restaurant Dinner', 'Fine Dining', 120, null, 6200],
            ['25/01/2024', 'Online Course Payment', 'EduPlatform', 300, null, 5900],
            ['28/01/2024', 'Consulting Fee', 'Business Corp', null, 800, 6700],
            ['30/01/2024', 'Shopping Mall', 'Mall Center', 250, null, 6450],
            ['31/01/2024', 'Month End Balance', 'Summary', 1300, 6250, 6450],
        ];

        // Create worksheet with data
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Set column widths
        const columnWidths = [
            { wch: 12 }, // Date
            { wch: 25 }, // Description
            { wch: 20 }, // Source
            { wch: 15 }, // Debit
            { wch: 15 }, // Credit
            { wch: 18 }, // Balance
        ];
        worksheet['!cols'] = columnWidths;

        // Theme colors for beautiful design
        const themeColors = {
            primary: '2E86AB', // Dark blue for headers
            secondary: '4A90E2', // Light blue for secondary headers
            success: '388E3C', // Green for credits/income
            danger: 'D32F2F', // Red for debits/expenses
            info: '1976D2', // Blue for balances
            warning: 'FF9800', // Orange for warnings
            light: 'F8F9FA', // Light gray for alternating rows
            white: 'FFFFFF', // White text
            dark: '212529', // Dark text
        };

        // Style the header row with theme colors
        for (let col = 0; col < headers.length; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;

            worksheet[cellAddress].s = {
                font: {
                    bold: true,
                    color: { rgb: themeColors.white },
                    size: 12,
                },
                fill: {
                    fgColor: { rgb: themeColors.primary },
                    patternType: 'solid',
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                },
                border: {
                    top: { style: 'thin', color: { rgb: themeColors.primary } },
                    bottom: { style: 'thin', color: { rgb: themeColors.primary } },
                    left: { style: 'thin', color: { rgb: themeColors.primary } },
                    right: { style: 'thin', color: { rgb: themeColors.primary } },
                },
            };
        }

        // Style data rows with theme colors and proper formatting
        for (let row = 1; row <= data.length; row++) {
            for (let col = 0; col < headers.length; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (!worksheet[cellAddress]) continue;

                const cellStyle: {
                    font?: { color?: { rgb: string }; bold?: boolean; size?: number };
                    fill?: { fgColor?: { rgb: string }; patternType?: string };
                    alignment?: { horizontal?: string; vertical?: string };
                    border?: {
                        top?: { style: string; color: { rgb: string } };
                        bottom?: { style: string; color: { rgb: string } };
                        left?: { style: string; color: { rgb: string } };
                        right?: { style: string; color: { rgb: string } };
                    };
                    numFmt?: string;
                } = {
                    alignment: { horizontal: 'left', vertical: 'center' },
                    border: {
                        top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                        left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                        right: { style: 'thin', color: { rgb: 'E0E0E0' } },
                    },
                };

                // Style debit amounts (red theme) - columns 3, 4, 5 are numeric
                if (col === 3 && data[row - 1][col] !== null) {
                    cellStyle.font = { color: { rgb: themeColors.danger }, bold: true, size: 11 };
                    cellStyle.fill = { fgColor: { rgb: 'FFEBEE' }, patternType: 'solid' };
                    cellStyle.alignment = { horizontal: 'right', vertical: 'center' };
                    cellStyle.numFmt = `"${currencySymbol}"#,##0.000`; // Currency format with 3 decimals for KWD
                }

                // Style credit amounts (green theme)
                if (col === 4 && data[row - 1][col] !== null) {
                    cellStyle.font = { color: { rgb: themeColors.success }, bold: true, size: 11 };
                    cellStyle.fill = { fgColor: { rgb: 'E8F5E8' }, patternType: 'solid' };
                    cellStyle.alignment = { horizontal: 'right', vertical: 'center' };
                    cellStyle.numFmt = `"${currencySymbol}"#,##0.000`; // Currency format with 3 decimals for KWD
                }

                // Style balance amounts (blue theme)
                if (col === 5) {
                    cellStyle.font = { color: { rgb: themeColors.info }, bold: true, size: 11 };
                    cellStyle.fill = { fgColor: { rgb: 'E3F2FD' }, patternType: 'solid' };
                    cellStyle.alignment = { horizontal: 'right', vertical: 'center' };
                    cellStyle.numFmt = `"${currencySymbol}"#,##0.000`; // Currency format with 3 decimals for KWD
                }

                // Alternate row colors for better readability
                if (row % 2 === 0 && col < 3) {
                    cellStyle.fill = { fgColor: { rgb: themeColors.light }, patternType: 'solid' };
                }

                // Bold font for important cells
                if (col === 0 || col === 1) {
                    cellStyle.font = { ...cellStyle.font, bold: true };
                }

                worksheet[cellAddress].s = cellStyle;
            }
        }

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction Ledger');

        // Create a summary worksheet with theme colors and proper number formatting
        const summaryData = [
            ['FINANCIAL SUMMARY'],
            [''],
            ['Total Income', 6250],
            ['Total Expenses', 1300],
            ['Net Balance', 4950],
            [''],
            ['Report Generated', new Date().toLocaleDateString()],
            ['Currency', primaryCurrency],
        ];

        const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

        // Style summary worksheet with theme colors
        summaryWorksheet['A1'].s = {
            font: { bold: true, size: 16, color: { rgb: themeColors.white } },
            fill: { fgColor: { rgb: themeColors.primary }, patternType: 'solid' },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
                top: { style: 'thin', color: { rgb: themeColors.primary } },
                bottom: { style: 'thin', color: { rgb: themeColors.primary } },
                left: { style: 'thin', color: { rgb: themeColors.primary } },
                right: { style: 'thin', color: { rgb: themeColors.primary } },
            },
        };

        summaryWorksheet['A3'].s = {
            font: { bold: true, color: { rgb: themeColors.success }, size: 12 },
            fill: { fgColor: { rgb: 'E8F5E8' }, patternType: 'solid' },
            border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
            },
        };

        summaryWorksheet['A4'].s = {
            font: { bold: true, color: { rgb: themeColors.danger }, size: 12 },
            fill: { fgColor: { rgb: 'FFEBEE' }, patternType: 'solid' },
            border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
            },
        };

        summaryWorksheet['A5'].s = {
            font: { bold: true, size: 14, color: { rgb: themeColors.info } },
            fill: { fgColor: { rgb: 'E3F2FD' }, patternType: 'solid' },
            border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
            },
        };

        // Style the summary values with proper number formatting
        summaryWorksheet['B3'].s = {
            font: { bold: true, color: { rgb: themeColors.success }, size: 12 },
            fill: { fgColor: { rgb: 'E8F5E8' }, patternType: 'solid' },
            alignment: { horizontal: 'right', vertical: 'center' },
            numFmt: `"${currencySymbol}"#,##0.000`, // Currency format
            border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
            },
        };

        summaryWorksheet['B4'].s = {
            font: { bold: true, color: { rgb: themeColors.danger }, size: 12 },
            fill: { fgColor: { rgb: 'FFEBEE' }, patternType: 'solid' },
            alignment: { horizontal: 'right', vertical: 'center' },
            numFmt: `"${currencySymbol}"#,##0.000`, // Currency format
            border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
            },
        };

        summaryWorksheet['B5'].s = {
            font: { bold: true, size: 14, color: { rgb: themeColors.info } },
            fill: { fgColor: { rgb: 'E3F2FD' }, patternType: 'solid' },
            alignment: { horizontal: 'right', vertical: 'center' },
            numFmt: `"${currencySymbol}"#,##0.000`, // Currency format
            border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
            },
        };

        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

        // Generate the Excel file with proper styling
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true,
        });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Download the file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ledger_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
    };

    const exportToPDF = () => {
        window.print(); // Simple print to PDF approach
    };

    const printLedger = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Details" />
            <div
                className="print-content flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
                data-date={new Date().toLocaleDateString()}
            >
                <div className="space-y-6">
                    {/* Header */}
                    {/* Removed as per user request */}

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
                                        onClick={() => router.visit('/add-transaction?type=income')}
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                        Add Income
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 text-red-600"
                                        onClick={() => router.visit('/add-transaction?type=expense')}
                                    >
                                        <TrendingDown className="h-4 w-4" />
                                        Add Expense
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 text-blue-600"
                                        onClick={() => router.visit('/add-transaction?type=receivable')}
                                    >
                                        <Banknote className="h-4 w-4" />
                                        Add Receivable
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 text-orange-600"
                                        onClick={() => router.visit('/add-transaction?type=payable')}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Add Payable
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            {/* Cash Balance Card */}
                            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-purple-800">Cash Balance</CardTitle>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
                                        <Coins className="h-4 w-4 text-purple-700" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-800">
                                        {currencySymbol} {formatCurrency(2050, 'KWD')}
                                    </div>
                                    <div className="space-y-1 text-xs text-purple-600">
                                        <div>USD {formatCurrency(6800, 'USD')}</div>
                                        <div>€{formatCurrency(6120, 'EUR')}</div>
                                        <div>BDT {formatCurrency(748000, 'BDT')}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-purple-600">Available now</p>
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
                                        {currencySymbol} {formatCurrency(3750, 'KWD')}
                                    </div>
                                    <div className="space-y-1 text-xs text-green-600">
                                        <div>USD {formatCurrency(12450, 'USD')}</div>
                                        <div>€{formatCurrency(11200, 'EUR')}</div>
                                        <div>BDT {formatCurrency(1365000, 'BDT')}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-green-600">+15% from last month</p>
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
                                        {currencySymbol} {formatCurrency(2470, 'KWD')}
                                    </div>
                                    <div className="space-y-1 text-xs text-red-600">
                                        <div>USD {formatCurrency(8210, 'USD')}</div>
                                        <div>€{formatCurrency(7390, 'EUR')}</div>
                                        <div>BDT {formatCurrency(900000, 'BDT')}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-red-600">+8% from last month</p>
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
                                        {currencySymbol} {formatCurrency(705, 'KWD')}
                                    </div>
                                    <div className="space-y-1 text-xs text-orange-600">
                                        <div>USD {formatCurrency(2340, 'USD')}</div>
                                        <div>€{formatCurrency(2110, 'EUR')}</div>
                                        <div>BDT {formatCurrency(257000, 'BDT')}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-orange-600">Due this month</p>
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
                                        {currencySymbol} {formatCurrency(1240, 'KWD')}
                                    </div>
                                    <div className="space-y-1 text-xs text-blue-600">
                                        <div>USD {formatCurrency(4120, 'USD')}</div>
                                        <div>€{formatCurrency(3710, 'EUR')}</div>
                                        <div>BDT {formatCurrency(453000, 'BDT')}</div>
                                    </div>
                                    <p className="mt-1 text-xs text-blue-600">Expected this month</p>
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

                        <Card className="print:border-0 print:shadow-none">
                            <CardHeader className="print:pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="print:text-2xl">General Ledger</CardTitle>
                                        <CardDescription className="print:hidden">All transactions with running balance</CardDescription>
                                    </div>
                                    <div className="no-print flex items-center space-x-2">
                                        {/* Date-to-Date Inputs */}
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="rounded-md border px-3 py-2 text-sm"
                                                placeholder="Start Date"
                                            />
                                            <span className="text-sm text-muted-foreground">to</span>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="rounded-md border px-3 py-2 text-sm"
                                                placeholder="End Date"
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

                                {/* Simple Header for Print */}
                                <div className="simple-header hidden print:block">
                                    <div className="date-range">
                                        {startDate && endDate
                                            ? `All Transactions ${startDate.split('-').reverse().join('/')} to ${endDate.split('-').reverse().join('/')}`
                                            : 'All Transactions'}
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
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">01/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Opening Balance</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Initial</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(1500, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">02/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Salary Payment</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Company Inc.</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(3750, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(5250, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">03/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Grocery Shopping</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Local Supermarket</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(450, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(4800, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">04/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Project</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Client XYZ</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(1200, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6000, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">05/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Utility Bills</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Electricity Co.</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(180, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(5820, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">06/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Dividend</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Bank</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(500, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6320, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">07/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Restaurant Dinner</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Fine Dining</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(120, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6200, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">08/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Online Course Payment</td>
                                                <td className="px-4 py-3 text-sm print:text-base">EduPlatform</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(300, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(5900, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">09/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Consulting Fee</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Business Corp</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(800, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6700, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">10/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Shopping Mall</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Mall Center</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(250, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6450, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">11/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Gas Station</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Fuel Express</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(85, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6365, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">12/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Internet Bill</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Telecom Co.</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(95, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6270, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">13/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Design</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Design Studio</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(650, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6920, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">14/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Coffee Shop</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Cafe Central</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(15, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6905, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">15/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Gym Membership</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Fitness Center</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(120, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6785, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">16/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Book Purchase</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Bookstore</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(45, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6740, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">17/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Consulting Project</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Tech Solutions</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(950, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(7690, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">18/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Movie Tickets</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Cinema Complex</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(35, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(7655, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">19/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Pharmacy</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Health Plus</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(75, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(7580, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">20/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Writing</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Content Agency</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(400, primaryCurrency)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(7980, primaryCurrency)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">21/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Car Maintenance</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Auto Service</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(280, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(7700, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">22/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Deposit</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Bank</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(1500, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(9200, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">23/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Restaurant Lunch</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Food Court</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(25, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(9175, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">24/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Mobile Bill</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Mobile Co.</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(65, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(9110, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">25/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Development</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Tech Startup</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(1800, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(10910, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">26/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Clothing Store</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Fashion Mall</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(320, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(10590, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">27/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Consulting Session</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Business Corp</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(750, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(11340, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">28/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Home Supplies</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Home Depot</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(180, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(11160, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">29/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Return</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Bank</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(420, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(11580, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">30/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Restaurant Dinner</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Fine Dining</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(95, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(11485, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">31/01/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Software License</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Tech Store</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(250, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(11235, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">01/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Writing</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Content Agency</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(600, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(11835, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">02/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Car Insurance</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Insurance Co.</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(450, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(11385, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">03/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Consulting Project</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Business Corp</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(1200, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(12585, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">04/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Grocery Shopping</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Local Market</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(180, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(12405, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">05/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Dividend</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Bank</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(350, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(12755, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">06/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Restaurant Lunch</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Food Court</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(45, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(12710, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">07/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Design</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Design Studio</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(800, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(13510, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">08/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Utility Bills</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Electricity Co.</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(200, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(13310, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">09/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Book Purchase</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Bookstore</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(65, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(13245, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">10/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Consulting Session</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Business Corp</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(950, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(14195, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">11/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Coffee Shop</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Cafe Central</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(12, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(14183, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">12/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Development</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Tech Startup</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(2200, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(16383, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">13/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Shopping Mall</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Mall Center</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(280, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(16103, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">14/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Return</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Investment Bank</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(550, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(16653, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">15/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Restaurant Dinner</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Fine Dining</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(110, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(16543, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">16/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Mobile Bill</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Mobile Co.</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(75, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(16468, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">17/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Freelance Writing</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Content Agency</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(450, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(16918, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">18/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Home Supplies</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Home Depot</td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(150, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(16768, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">19/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Consulting Project</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Business Corp</td>
                                                <td className="px-4 py-3 text-right text-sm print:text-base">-</td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600 print:text-base">
                                                    {currencySymbol} {formatCurrency(1400, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(18168, 'KWD')}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="px-4 py-3 text-sm print:text-base">20/02/2024</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Month End Balance</td>
                                                <td className="px-4 py-3 text-sm print:text-base">Summary</td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(1300, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(6250, 'KWD')}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold print:text-base print:font-bold">
                                                    {currencySymbol} {formatCurrency(18168, 'KWD')}
                                                </td>
                                            </tr>
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
