import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ChevronLeft, ChevronRight, Smartphone, Monitor } from 'lucide-react';
import { debounce, throttle, isMobileDevice, getCurrentBreakpoint } from '@/utils/performance';

interface ResponsiveTableProps {
    data: any[];
    columns: {
        key: string;
        label: string;
        render?: (value: any, row: any) => React.ReactNode;
        mobilePriority?: number; // Higher number = higher priority for mobile
        hideOnMobile?: boolean;
    }[];
    itemsPerPage?: number;
    showPagination?: boolean;
    showMobileToggle?: boolean;
    className?: string;
    onRowClick?: (row: any) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export function ResponsiveTable({
    data,
    columns,
    itemsPerPage = 10,
    showPagination = true,
    showMobileToggle = true,
    className = '',
    onRowClick,
    loading = false,
    emptyMessage = 'No data available'
}: ResponsiveTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileView, setIsMobileView] = useState(false);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    // Detect mobile device and screen size
    useEffect(() => {
        const checkMobile = () => {
            const isMobile = isMobileDevice() || window.innerWidth < 768;
            setIsMobileView(isMobile);
        };

        checkMobile();
        const debouncedCheck = debounce(checkMobile, 250);
        window.addEventListener('resize', debouncedCheck);

        return () => window.removeEventListener('resize', debouncedCheck);
    }, []);

    // Optimize columns for mobile
    const mobileColumns = useMemo(() => {
        if (!isMobileView) return columns;

        return columns
            .filter(col => !col.hideOnMobile)
            .sort((a, b) => (b.mobilePriority || 0) - (a.mobilePriority || 0))
            .slice(0, 3); // Show only top 3 columns on mobile
    }, [columns, isMobileView]);

    // Filter and sort data
    const processedData = useMemo(() => {
        let filtered = data;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Apply sorting
        if (sortColumn) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];

                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage);

    // Handle sorting
    const handleSort = useCallback((columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    }, [sortColumn, sortDirection]);

    // Handle search with debouncing
    const debouncedSearch = useMemo(
        () => debounce((value: string) => setSearchTerm(value), 300),
        []
    );

    // Handle row click
    const handleRowClick = useCallback((row: any) => {
        if (onRowClick) {
            onRowClick(row);
        }
    }, [onRowClick]);

    // Desktop table view
    const DesktopTable = () => (
        <div className="overflow-x-auto">
            <Table className={className}>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                                    sortColumn === column.key ? 'bg-muted' : ''
                                }`}
                                onClick={() => handleSort(column.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {column.label}
                                    {sortColumn === column.key && (
                                        <span className="text-xs">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center py-8">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    <span className="ml-2">Loading...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : paginatedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedData.map((row, index) => (
                            <TableRow
                                key={index}
                                className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                                onClick={() => handleRowClick(row)}
                            >
                                {columns.map((column) => (
                                    <TableCell key={column.key}>
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : String(row[column.key] || '')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    // Mobile card view
    const MobileCards = () => (
        <div className="space-y-3">
            {loading ? (
                <div className="text-center py-8">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading...</span>
                    </div>
                </div>
            ) : paginatedData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
                </div>
            ) : (
                paginatedData.map((row, index) => (
                    <Card
                        key={index}
                        className={`transition-all duration-200 ${
                            onRowClick ? 'cursor-pointer hover:shadow-md' : ''
                        }`}
                        onClick={() => handleRowClick(row)}
                    >
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                {mobileColumns.map((column) => (
                                    <div key={column.key} className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {column.label}:
                                        </span>
                                        <span className="text-sm">
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : String(row[column.key] || '')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    // Pagination component
    const Pagination = () => {
        if (!showPagination || totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, processedData.length)} of{' '}
                    {processedData.length} results
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header with search and mobile toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                        onChange={(e) => debouncedSearch(e.target.value)}
                    />
                </div>
                
                {showMobileToggle && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant={!isMobileView ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIsMobileView(false)}
                            className="hidden sm:flex"
                        >
                            <Monitor className="h-4 w-4 mr-1" />
                            Desktop
                        </Button>
                        <Button
                            variant={isMobileView ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIsMobileView(true)}
                        >
                            <Smartphone className="h-4 w-4 mr-1" />
                            Mobile
                        </Button>
                    </div>
                )}
            </div>

            {/* Table/Cards */}
            {isMobileView ? <MobileCards /> : <DesktopTable />}

            {/* Pagination */}
            <Pagination />
        </div>
    );
}
