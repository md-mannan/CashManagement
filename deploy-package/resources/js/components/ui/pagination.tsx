import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5
}: PaginationProps) {
    const getVisiblePages = () => {
        const pages: (number | string)[] = [];
        const halfVisible = Math.floor(maxVisiblePages / 2);

        let start = Math.max(1, currentPage - halfVisible);
        let end = Math.min(totalPages, currentPage + halfVisible);

        // Adjust start and end to show maxVisiblePages
        if (end - start + 1 < maxVisiblePages) {
            if (start === 1) {
                end = Math.min(totalPages, start + maxVisiblePages - 1);
            } else {
                start = Math.max(1, end - maxVisiblePages + 1);
            }
        }

        // Add first page and ellipsis if needed
        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push('...');
            }
        }

        // Add visible pages
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add last page and ellipsis if needed
        if (end < totalPages) {
            if (end < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center justify-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            {visiblePages.map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span className="px-2 py-1 text-sm text-gray-500">...</span>
                    ) : (
                        <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className="min-w-[40px]"
                        >
                            {page}
                        </Button>
                    )}
                </React.Fragment>
            ))}

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
