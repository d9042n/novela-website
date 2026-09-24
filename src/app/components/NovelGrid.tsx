import type { Novel } from '../data/types';
import { NovelCard } from './NovelCard';
import { NovelCardSkeleton } from './NovelCardSkeleton';
import { useTheme } from '../theme/ThemeProvider';
import { gridClassFor } from '../theme/config';
import { cn } from './ui/utils';

interface NovelGridProps {
  novels?: Novel[];
  loading?: boolean;
  count?: number;
  className?: string;
}

/** Lưới card truyện dùng chung (Home, Browse, By-genre). Bố cục theo layout toàn site. */
export function NovelGrid({ novels = [], loading = false, count = 12, className }: NovelGridProps) {
  const { layout } = useTheme();
  const variant = layout === 'list' ? 'list' : 'card';

  if (loading) {
    return (
      <div className={cn(gridClassFor(layout), className)}>
        {Array.from({ length: count }).map((_, i) => (
          <NovelCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(gridClassFor(layout), className)}>
      {novels.map((n) => (
        <NovelCard key={n.slug} novel={n} variant={variant} />
      ))}
    </div>
  );
}
