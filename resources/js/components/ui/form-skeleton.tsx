import { Skeleton } from "@/components/ui/skeleton";

export const FormSkeleton = () => {
  return (
    <div className="space-y-6">
        {/* First row - Date and Type */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Select */}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Amount and Secondary Currency row */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Select */}
          </div>
        </div>

        {/* Exchange Rate and Secondary Amount row */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        </div>

        {/* Category and Source row */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-18" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Select */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" /> {/* Label */}
          <Skeleton className="h-20 w-full" /> {/* Textarea */}
        </div>

        {/* Currency Preview Cards */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-56" /> {/* Label */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-6 w-24 mx-auto" /> {/* Amount */}
              <Skeleton className="h-3 w-20 mx-auto" /> {/* Currency label */}
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-6 w-24 mx-auto" /> {/* Amount */}
              <Skeleton className="h-3 w-20 mx-auto" /> {/* Currency label */}
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-6 w-24 mx-auto" /> {/* Amount */}
              <Skeleton className="h-3 w-20 mx-auto" /> {/* Currency label */}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-4 border-t pt-6">
          <Skeleton className="h-10 w-20" /> {/* Cancel button */}
          <Skeleton className="h-10 w-32" /> {/* Save button */}
        </div>
    </div>
  );
};

export default FormSkeleton;
