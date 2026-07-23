import { Link } from 'react-router';
import { ChevronRight, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { useLocalized } from '../../hooks/useLocalized';
import { Badge } from '../ui/badge';
import { GENRES } from '../../data/genres';
import { HeroCarousel } from './HeroCarousel';
import { NovelCard } from '../NovelCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

interface HomeReelsLayoutProps {
  featured: Novel[];
  latest: Novel[];
  popular: Novel[];
}

function ReelRow({
  title,
  icon: Icon,
  novels = [],
  to,
}: {
  title: string;
  icon: typeof Flame;
  novels: Novel[];
  to?: string;
}) {
  const { t } = useTranslation();

  if (!novels || novels.length === 0) return null;

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
            {title}
          </h2>
        </div>
        {to && (
          <Link
            to={to}
            className="group/link flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {t('actions.viewAll')}
            <ChevronRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Slider Carousel với từng NovelCard độc lập */}
      <Carousel opts={{ align: 'start', loop: true }} className="w-full relative px-1">
        <CarouselContent className="-ml-3">
          {(novels || []).map((novel) => (
            <CarouselItem key={novel.id} className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <NovelCard novel={novel} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3 size-8 bg-background/80 backdrop-blur-md shadow-md border border-border" />
        <CarouselNext className="-right-3 size-8 bg-background/80 backdrop-blur-md shadow-md border border-border" />
      </Carousel>
    </div>
  );
}

export function HomeReelsLayout({ featured = [], latest = [], popular = [] }: HomeReelsLayoutProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8 pb-8">
      {/* Bounded Hero Slider Carousel */}
      {featured && featured.length > 0 && (
        <section className="relative overflow-hidden">
          <HeroCarousel novels={featured} />
        </section>
      )}

      <div className="space-y-8">
        {/* Row 1: Popular Reels Slider */}
        <ReelRow
          title={t('home.popular')}
          icon={TrendingUp}
          novels={popular}
          to="/browse?sort=popular"
        />

        {/* Row 2: Latest Releases Reels Slider */}
        <ReelRow
          title={t('home.latest')}
          icon={Flame}
          novels={latest}
          to="/browse?sort=latest"
        />

        {/* Row 3: Featured Reels Slider */}
        <ReelRow
          title={t('home.featured')}
          icon={Sparkles}
          novels={featured}
          to="/browse?sort=rating"
        />

        {/* Category Pills */}
        <section className="pt-4 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {t('home.byGenre')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <Link key={g.id} to={`/browse?genre=${g.id}`}>
                <Badge
                  variant="outline"
                  className="px-3.5 py-1.5 text-xs rounded-full cursor-pointer transition-all hover:border-primary hover:bg-accent hover:text-accent-foreground"
                >
                  {tl(g.name)}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
