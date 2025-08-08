import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, Filter, Plus, Search, FileText, Printer, Eye, Edit, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction',
        href: '/transaction',
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
    },
    {
        id: 2,
        date: '2024-01-08',
        description: 'Grocery Shopping',
        type: 'expense',
        amount: 450.0,
        source: 'Local Supermarket',
        category: 'Food & Dining',
    },
    {
        id: 3,
        date: '2024-01-12',
        description: 'Freelance Project',
        type: 'income',
        amount: 1200.0,
        source: 'Client XYZ',
        category: 'Freelance',
    },
    {
        id: 4,
        date: '2024-01-15',
        description: 'Utility Bills',
        type: 'expense',
        amount: 180.0,
        source: 'Electricity Co.',
        category: 'Utilities',
    },
    {
        id: 5,
        date: '2024-01-18',
        description: 'Investment Dividend',
        type: 'income',
        amount: 500.0,
        source: 'Investment Bank',
        category: 'Investment',
    },
    {
        id: 6,
        date: '2024-01-22',
        description: 'Restaurant Dinner',
        type: 'expense',
        amount: 120.0,
        source: 'Fine Dining',
        category: 'Food & Dining',
    },
    {
        id: 7,
        date: '2024-01-25',
        description: 'Client Payment Due',
        type: 'receivable',
        amount: 2500.0,
        source: 'Client ABC',
        category: 'Client Payment',
    },
    {
        id: 8,
        date: '2024-01-28',
        description: 'Loan Repayment',
        type: 'receivable',
        amount: 800.0,
        source: 'Friend Loan',
        category: 'Loan Repayment',
    },
    {
        id: 9,
        date: '2024-01-30',
        description: 'Credit Card Bill',
        type: 'payable',
        amount: 350.0,
        source: 'Bank Credit Card',
        category: 'Credit Card',
    },
    {
        id: 10,
        date: '2024-02-01',
        description: 'Rent Payment',
        type: 'payable',
        amount: 1200.0,
        source: 'Landlord',
        category: 'Rent',
    },
    {
        id: 11,
        date: '2024-02-03',
        description: 'Rental Income',
        type: 'receivable',
        amount: 1500.0,
        source: 'Tenant',
        category: 'Rental Payment',
    },
    {
        id: 12,
        date: '2024-02-05',
        description: 'Tax Payment',
        type: 'payable',
        amount: 750.0,
        source: 'Tax Authority',
        category: 'Taxes',
    },
];

const transactionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'receivable', label: 'Receivable' },
    { value: 'payable', label: 'Payable' },
];

export default function Transaction() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter transactions based on search criteria
    const filteredTransactions = useMemo(() => {
        let filtered = mockTransactions;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(transaction =>
                transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(transaction => transaction.type === selectedType);
        }

        // Filter by date range
        if (startDate) {
            filtered = filtered.filter(transaction => transaction.date >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(transaction => transaction.date <= endDate);
        }

        return filtered;
    }, [searchTerm, selectedType, startDate, endDate]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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

    // Handle view transaction
    const handleViewTransaction = (transactionId: number) => {
        router.visit(`/transaction/${transactionId}`);
    };

    // Handle edit transaction
    const handleEditTransaction = (transactionId: number) => {
        router.visit(`/transaction/${transactionId}/edit`);
    };

    // Handle delete transaction
    const handleDeleteTransaction = (transactionId: number) => {
        if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            // For mock data, we'll just show a success message
            // In a real application, this would call the backend API
            alert('Transaction deleted successfully!');
            
            // Simulate the deletion by refreshing the page
            // In a real application, you would update the local state instead
            window.location.reload();
        }
    };

    // Export to Excel functionality
    const exportToExcel = () => {
        // Prepare data for export
        const exportData = filteredTransactions.map((transaction, index) => ({
            'SL': startIndex + index + 1,
            'Date': formatDate(transaction.date),
            'Description': transaction.description,
            'Type': transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
            'Source': transaction.source,
            'Category': transaction.category,
            'Amount': `${transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} KWD ${formatCurrency(transaction.amount)}`,
        }));

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        const columnWidths = [
            { wch: 5 },  // SL
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
        // Create a new window for PDF printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Create the HTML content for PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Transactions Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .summary { margin-bottom: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Transactions Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="summary">
                    <p>Total Transactions: ${filteredTransactions.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTransactions.map((transaction, index) => `
                            <tr>
                                <td>${startIndex + index + 1}</td>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                                <td>${transaction.source}</td>
                                <td>${transaction.category}</td>
                                <td>${transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} KWD ${formatCurrency(transaction.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
    };

    // Print transactions functionality
    const printTransactions = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Create the HTML content for printing
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Transactions Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .summary { margin-bottom: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Transactions Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="summary">
                    <p>Total Transactions: ${filteredTransactions.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SL</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredTransactions.map((transaction, index) => `
                            <tr>
                                <td>${startIndex + index + 1}</td>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                                <td>${transaction.source}</td>
                                <td>${transaction.category}</td>
                                <td>${transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} KWD ${formatCurrency(transaction.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
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
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                    </p>
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
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No transactions found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedTransactions.map((transaction, index) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                                            <TableCell>{formatDate(transaction.date)}</TableCell>
                                            <TableCell className="font-medium">{transaction.description}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{transaction.source}</TableCell>
                                            <TableCell>{transaction.category}</TableCell>
                                            <TableCell className={
                                                transaction.type === 'income' || transaction.type === 'receivable' 
                                                    ? 'text-green-600' 
                                                    : 'text-red-600'
                                            }>
                                                {transaction.type === 'income' || transaction.type === 'receivable' ? '+' : '-'} KWD {formatCurrency(transaction.amount)}
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
                                                        onClick={() => handleEditTransaction(transaction.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteTransaction(transaction.id)}
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
        </AppLayout>
    );
}
