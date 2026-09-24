import { Skeleton } from '../ui/skeleton';

interface ChapterSkeletonProps {
  maxWidth?: number;
}

export function ChapterSkeleton({ maxWidth = 800 }: ChapterSkeletonProps) {
  return (
    <div
      className="mx-auto px-5 py-20 sm:px-6 w-full animate-pulse"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      {/* Chapter Title Skeleton */}
      <div className="text-center mb-10 space-y-3">
        <Skeleton className="h-8 sm:h-9 w-2/3 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-44 mx-auto rounded" />
      </div>

      {/* Chapter Flowing Paragraphs */}
      <div className="space-y-6 pt-2">
        {/* Paragraph 1 */}
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[98%] rounded" />
          <Skeleton className="h-4 w-[95%] rounded" />
          <Skeleton className="h-4 w-[65%] rounded" />
        </div>

        {/* Paragraph 2 */}
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-[97%] rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[85%] rounded" />
        </div>

        {/* Paragraph 3 */}
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[96%] rounded" />
          <Skeleton className="h-4 w-[99%] rounded" />
          <Skeleton className="h-4 w-[92%] rounded" />
          <Skeleton className="h-4 w-[45%] rounded" />
        </div>

        {/* Paragraph 4 */}
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-[98%] rounded" />
          <Skeleton className="h-4 w-[94%] rounded" />
          <Skeleton className="h-4 w-[75%] rounded" />
        </div>

        {/* Paragraph 5 */}
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[97%] rounded" />
          <Skeleton className="h-4 w-[90%] rounded" />
          <Skeleton className="h-4 w-[55%] rounded" />
        </div>
      </div>

      {/* Bottom chapter navigation skeleton */}
      <div className="mt-14 flex items-center justify-between gap-3 pt-6 border-t border-border/20">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}
