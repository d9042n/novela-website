import { Skeleton } from '../ui/skeleton';
import { useTheme } from '../../theme/ThemeProvider';

interface NovelDetailSkeletonProps {
  preset?: 'classic' | 'cinematic' | 'minimal';
}

export function NovelDetailSkeleton({ preset }: NovelDetailSkeletonProps) {
  const { detailPreset } = useTheme();
  const activePreset = preset ?? detailPreset;

  if (activePreset === 'cinematic') {
    return (
      <div className="space-y-8 pb-10">
        {/* Full-width Blurred Backdrop Header Skeleton */}
        <div className="relative overflow-hidden bg-muted/40 min-h-[360px] flex items-end border-b border-border/40">
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="aspect-[2/3] w-40 sm:w-48 shrink-0 rounded-xl overflow-hidden border-2 border-border/50 bg-muted shadow-xl">
              <Skeleton className="size-full rounded-none" />
            </div>

            <div className="flex-1 space-y-3.5 w-full text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4 mx-auto sm:mx-0 rounded-lg" />
              <Skeleton className="h-4 w-1/3 mx-auto sm:mx-0 rounded" />
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-3">
                <Skeleton className="h-11 w-36 rounded-md" />
                <Skeleton className="h-11 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab List & Chapter rows */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden bg-card/50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <Skeleton className="h-4 w-8 rounded" />
                <Skeleton className="h-4 w-3/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activePreset === 'minimal') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Centered Showcase Header Skeleton */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="aspect-[2/3] w-44 overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
            <Skeleton className="size-full rounded-none" />
          </div>

          <div className="space-y-3 max-w-xl w-full flex flex-col items-center">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-11 w-36 rounded-md" />
              <Skeleton className="h-11 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Tab List & Chapter rows */}
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden bg-card/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-4 w-3/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Classic Split Column Layout Skeleton (Default)
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header truyện */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="mx-auto w-44 shrink-0 sm:mx-0">
          <div className="overflow-hidden rounded-xl border border-border shadow-lg">
            <div className="aspect-[2/3] bg-muted">
              <Skeleton className="size-full rounded-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <Skeleton className="h-10 sm:h-12 w-4/5 rounded-lg" />
          <Skeleton className="h-4 w-1/3 rounded" />

          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          <div className="flex gap-6 pt-3">
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-5 w-10 rounded" />
              <Skeleton className="h-3 w-14 rounded" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-5 w-10 rounded" />
              <Skeleton className="h-3 w-14 rounded" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Skeleton className="h-11 w-36 rounded-md" />
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tabs & Chapter list skeleton */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden bg-card/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-4 w-3/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
