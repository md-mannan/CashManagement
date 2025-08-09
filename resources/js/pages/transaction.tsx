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
import { Download, Edit, Eye, FileText, Filter, Plus, Printer, Search, Trash2 } from 'lucide-react';
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
    { value: 'all', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'receivable', label: 'Receivable' },
    { value: 'payable', label: 'Payable' },
];

export default function Transaction() {
    const { auth, transactions } = usePage<
        SharedData & {
            transactions: {
                data: Array<{
                    id: number;
                    date: string;
                    description: string;
                    type: 'income' | 'expense' | 'receivable' | 'payable';
                    amount: number;
                    source: string;
                    category: {
                        name: string;
                    };
                    notes?: string;
                    metadata?: {
                        secondary_currency?: string;
                        exchange_rate?: number;
                        secondary_amount?: number;
                        primary_currency?: string;
                        primary_symbol?: string;
                    };
                }>;
                current_page: number;
                last_page: number;
                per_page: number;
                total: number;
            };
        }
    >().props;

    // Client-side filtering states
    const [searchInput, setSearchInput] = useState(''); // What user types in search
    const [selectedType, setSelectedType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // All transactions from backend (no server-side filtering)
    const allTransactions = transactions.data;

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
    const primaryCurrency = auth.user.primary_currency || 'USD';
    const primarySymbol = auth.user.primary_symbol || '$';

    const { showToast } = useToast();

    // Client-side filtering logic
    const filteredTransactions = useMemo(() => {
        let filtered = [...allTransactions];

        // Search filter (no reloading - instant)
        if (searchInput.trim()) {
            const searchTerm = searchInput.toLowerCase();
            filtered = filtered.filter(
                (transaction) =>
                    transaction.description.toLowerCase().includes(searchTerm) ||
                    transaction.source.toLowerCase().includes(searchTerm) ||
                    transaction.category.name.toLowerCase().includes(searchTerm) ||
                    transaction.notes?.toLowerCase().includes(searchTerm) ||
                    transaction.amount.toString().includes(searchTerm) ||
                    transaction.type.toLowerCase().includes(searchTerm),
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            filtered = filtered.filter((transaction) => transaction.type === selectedType);
        }

        // Date range filter
        if (startDate) {
            filtered = filtered.filter((transaction) => transaction.date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter((transaction) => transaction.date <= endDate);
        }

        return filtered;
    }, [allTransactions, searchInput, selectedType, startDate, endDate]);

    // Client-side pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchInput, selectedType, startDate, endDate]);

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
            default:
                return 'text-gray-600 bg-gray-50';
        }
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
            router.delete(`/transaction/${deleteConfirmation.transactionId}`, {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        title: 'Transaction Deleted!',
                        message: 'The transaction has been successfully deleted.',
                        sound: true,
                    });
                },
                onError: (errors) => {
                    showToast({
                        type: 'error',
                        title: 'Delete Failed!',
                        message: 'There was an error deleting the transaction. Please try again.',
                        sound: true,
                    });
                    console.error('Error deleting transaction:', errors);
                },
            });
        }
        setDeleteConfirmation({ isOpen: false, transactionId: null });
    };

    const handleEditConfirm = () => {
        if (editConfirmation.transactionId) {
            console.log('Editing transaction:', editConfirmation.transactionId);
            router.visit(`/transaction/${editConfirmation.transactionId}/edit`);
        }
        setEditConfirmation({ isOpen: false, transactionId: null });
    };

    const handleCancel = () => {
        setDeleteConfirmation({ isOpen: false, transactionId: null });
        setEditConfirmation({ isOpen: false, transactionId: null });
    };

    // Handle view transaction
    const handleViewTransaction = (transactionId: number) => {
        router.visit(`/transaction/${transactionId}`);
    };

    // Export to Excel functionality
    const exportToExcel = () => {
        // Prepare data for export
        const exportData = filteredTransactions.map((transaction, index) => ({
            SL: startIndex + index + 1,
            Date: formatDate(transaction.date),
            Description: transaction.description,
            Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            Source: transaction.source,
            Category: transaction.category,
            Amount: `${transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} ${primarySymbol} ${formatCurrency(transaction.amount, primaryCurrency)}`,
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
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Transactions Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    })}</p>
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
                                <td style="text-align: center;">${startIndex + index + 1}</td>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td style="text-transform: capitalize;">${transaction.type}</td>
                                <td>${transaction.source}</td>
                                <td>${transaction.category.name}</td>
                                <td class="amount ${transaction.type === 'income' || transaction.type === 'receivable' ? 'income' : 'expense'}">${transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} ${primarySymbol} ${formatCurrency(transaction.amount, primaryCurrency)}</td>
                            </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                </table>
                <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
                    <p>This report was generated automatically from the Cash Management System</p>
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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                        <p className="text-muted-foreground">Manage and view all your transactions</p>
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
                                onClick={() => router.visit('/add-transaction?type=income')}
                            >
                                <Plus className="h-4 w-4" />
                                Add Income
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() => router.visit('/add-transaction?type=expense')}
                            >
                                <Plus className="h-4 w-4" />
                                Add Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-blue-600"
                                onClick={() => router.visit('/add-transaction?type=receivable')}
                            >
                                <Plus className="h-4 w-4" />
                                Add Receivable
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-orange-600"
                                onClick={() => router.visit('/add-transaction?type=payable')}
                            >
                                <Plus className="h-4 w-4" />
                                Add Payable
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{' '}
                            {filteredTransactions.length} transactions
                        </p>
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
                                    <TableHead className="w-32">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                            No transactions found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedTransactions.map((transaction, index) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{(currentPage - 1) * transactions.per_page + index + 1}</TableCell>
                                            <TableCell>{formatDate(transaction.date)}</TableCell>
                                            <TableCell className="font-medium">{transaction.description}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(transaction.type)}`}
                                                >
                                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{transaction.source}</TableCell>
                                            <TableCell>{transaction.category.name}</TableCell>
                                            <TableCell
                                                className={
                                                    transaction.type === 'income' || transaction.type === 'receivable'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }
                                            >
                                                {transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} {primarySymbol}{' '}
                                                {formatCurrency(transaction.amount, primaryCurrency)}
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
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
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
