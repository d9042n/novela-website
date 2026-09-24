import { Skeleton } from './ui/skeleton';
import { cn } from './ui/utils';

interface NovelCardSkeletonProps {
  variant?: 'card' | 'list';
  className?: string;
}

export function NovelCardSkeleton({ variant = 'card', className }: NovelCardSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className={cn('flex items-center gap-4 py-4', className)}>
        <Skeleton className="aspect-[2/3] w-16 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-3/5 rounded" />
          <Skeleton className="h-3.5 w-1/3 rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Khung bìa truyện đúng tỷ lệ 2/3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted border border-border/40">
        <Skeleton className="size-full rounded-none" />
      </div>

      {/* Thông tin chữ */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-4 w-3/5 rounded" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-3 w-1/4 rounded" />
        </div>
      </div>
    </div>
  );
}
