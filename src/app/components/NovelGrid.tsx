import type { Novel } from '../data/types';
import { NovelCard } from './NovelCard';
import { useTheme } from '../theme/ThemeProvider';
import { gridClassFor } from '../theme/config';
import { cn } from './ui/utils';

interface NovelGridProps {
  novels: Novel[];
  className?: string;
}

/** Lưới card truyện dùng chung (Home, Browse, By-genre). Bố cục theo layout toàn site. */
export function NovelGrid({ novels, className }: NovelGridProps) {
  const { layout } = useTheme();
  const variant = layout === 'list' ? 'list' : 'card';

  return (
    <div className={cn(gridClassFor(layout), className)}>
      {novels.map((n) => (
        <NovelCard key={n.slug} novel={n} variant={variant} />
      ))}
    </div>
  );
}
