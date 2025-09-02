import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const TableSkeleton = () => {
  return (
    <>
      {/* Filters Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-16" /> {/* Filters title */}
          <Skeleton className="h-4 w-64" /> {/* Description */}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Type */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Start Date */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            {/* End Date */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" /> {/* Showing X to Y of Z */}
        <Skeleton className="h-9 w-20" /> {/* Export button */}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="border-b bg-muted/50 p-4">
              <div className="grid grid-cols-8 gap-4">
                <Skeleton className="h-4 w-6" /> {/* SL */}
                <Skeleton className="h-4 w-12" /> {/* Date */}
                <Skeleton className="h-4 w-20" /> {/* Description */}
                <Skeleton className="h-4 w-10" /> {/* Type */}
                <Skeleton className="h-4 w-14" /> {/* Source */}
                <Skeleton className="h-4 w-16" /> {/* Category */}
                <Skeleton className="h-4 w-14" /> {/* Amount */}
                <Skeleton className="h-4 w-16" /> {/* Actions */}
              </div>
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border-b p-4">
                <div className="grid grid-cols-8 gap-4 items-center">
                  <Skeleton className="h-4 w-4" /> {/* SL */}
                  <Skeleton className="h-4 w-16" /> {/* Date */}
                  <Skeleton className="h-4 w-24" /> {/* Description */}
                  <Skeleton className="h-6 w-16 rounded-full" /> {/* Type badge */}
                  <Skeleton className="h-4 w-20" /> {/* Source */}
                  <Skeleton className="h-4 w-18" /> {/* Category */}
                  <Skeleton className="h-4 w-20" /> {/* Amount */}
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-8 w-8 rounded" /> {/* View */}
                    <Skeleton className="h-8 w-8 rounded" /> {/* Edit */}
                    <Skeleton className="h-8 w-8 rounded" /> {/* Delete */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" /> {/* Page X of Y */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-20" /> {/* Previous */}
          <Skeleton className="h-9 w-16" /> {/* Next */}
        </div>
      </div>
    </>
  );
};

export default TableSkeleton;
