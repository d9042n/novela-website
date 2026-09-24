import { Skeleton } from '../ui/skeleton';

export function HeroCarouselSkeleton() {
  return (
    <div className="relative min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-10 flex flex-col justify-between backdrop-blur-md shadow-xs animate-pulse">
      {/* Top badges */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Middle: Cover + Text */}
      <div className="my-auto flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-10">
        <div className="w-36 sm:w-48 lg:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-border/60 bg-muted/80 shadow-xl">
          <Skeleton className="size-full rounded-none" />
        </div>

        <div className="flex-1 space-y-4 w-full">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 sm:h-12 w-4/5 rounded-lg" />
          <Skeleton className="h-4 w-1/3 rounded" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-4/5 rounded" />
            <Skeleton className="h-3.5 w-2/3 rounded" />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Bottom dots */}
      <div className="flex items-center justify-center gap-2 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-1.5 w-8 rounded-full" />
        ))}
      </div>
    </div>
  );
}
