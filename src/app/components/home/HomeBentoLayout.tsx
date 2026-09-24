import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  Sparkles,
  Flame,
  Star,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Compass,
} from 'lucide-react';
import type { Novel } from '../../data/types';
import { displayTitle } from '../../data/format';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AmbientCoverGlow } from '../visual/AmbientCoverGlow';
import { useGenres } from '../../data/genres';
import { NovelGrid } from '../NovelGrid';
import { Skeleton } from '../ui/skeleton';

interface HomeBentoLayoutProps {
  featured: Novel[];
  latest: Novel[];
  popular: Novel[];
  loading?: boolean;
}

export function HomeBentoLayout({
  featured = [],
  latest = [],
  popular = [],
  loading = false,
}: HomeBentoLayoutProps) {
  const { t } = useTranslation();
  const { genres } = useGenres();

  const mainStory = featured[0] || popular[0];
  const trendingStories = popular.slice(0, 4);
  const quickPicks = latest.slice(0, 3);

  const mainTitle = mainStory ? displayTitle(mainStory.title, t('common.untitled')) : '';
  const scoreText = (score: number | null) => (score != null ? score.toFixed(1) : '—');

  if (loading || !mainStory) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[minmax(180px,auto)]">
          {/* Bento Cell 1 Skeleton */}
          <div className="md:col-span-2 lg:col-span-2 md:row-span-2 rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 my-auto">
              <Skeleton className="w-36 sm:w-44 aspect-[2/3] rounded-xl shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/3 rounded" />
                <div className="space-y-1.5 pt-1">
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                  <Skeleton className="h-3.5 w-2/3 rounded" />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>

          {/* Bento Cell 2 Skeleton */}
          <div className="md:col-span-1 lg:col-span-1 md:row-span-2 rounded-3xl border border-border/80 bg-card/60 p-5 flex flex-col justify-between shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2">
                  <Skeleton className="size-6 rounded-lg shrink-0" />
                  <Skeleton className="size-10 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-4/5 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          {/* Bento Cell 3 Skeleton */}
          <div className="md:col-span-1 lg:col-span-1 rounded-3xl border border-border/80 bg-card/60 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>

          {/* Bento Cell 4 Skeleton */}
          <div className="md:col-span-1 lg:col-span-1 rounded-3xl border border-border/80 bg-card/60 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </section>

        {/* Section Latest Skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-8 w-48 rounded" />
          <NovelGrid loading={true} count={12} />
        </section>

        {/* Section Popular Skeleton */}
        <section className="space-y-4">
          <Skeleton className="h-8 w-48 rounded" />
          <NovelGrid loading={true} count={12} />
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-12">
      {/* ── BENTO GRID HERO SHOWCASE ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Cell 1: Hero Story (Chiếm 2 cột, 2 hàng trên desktop) */}
        {mainStory && (
          <div className="md:col-span-2 lg:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-accent/30 p-6 sm:p-8 flex flex-col justify-between shadow-sm group">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-3.5" />
                <span>{t('bento.featured')}</span>
              </span>

              {mainStory.score != null && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <Star className="size-3.5 fill-amber-400" />
                  <span>{scoreText(mainStory.score)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 my-auto">
              <div className="w-36 sm:w-44 shrink-0">
                <AmbientCoverGlow src={mainStory.cover} intensity="deep">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border shadow-xl">
                    <ImageWithFallback
                      src={mainStory.cover}
                      alt={mainTitle}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </AmbientCoverGlow>
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {mainStory.genres.slice(0, 3).map((g) => (
                    <Badge key={g.slug} variant="secondary" className="text-[11px]">
                      {g.name}
                    </Badge>
                  ))}
                </div>

                <Link to={`/novel/${mainStory.slug}`}>
                  <h2
                    className="hover:text-primary transition-colors line-clamp-2"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {mainTitle}
                  </h2>
                </Link>

                <p className="text-xs text-muted-foreground font-medium">
                  {mainStory.authors[0]?.name || t('novel.unknownAuthor')} • {mainStory.chapterCount || 0} {t('novel.chapters')}
                </p>

                <p className="text-xs text-foreground/80 line-clamp-3 leading-relaxed">
                  {mainStory.description}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
              <Button asChild size="sm" className="gap-2 rounded-xl">
                <Link to={`/novel/${mainStory.slug}`}>
                  <span>{t('actions.readNow')}</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <span className="text-xs text-muted-foreground">
                {t(`status.${mainStory.status}`)}
              </span>
            </div>
          </div>
        )}

        {/* Cell 2: Top Trending Rankings (Chiếm 1 cột, 2 hàng trên desktop) */}
        <div className="md:col-span-1 lg:col-span-1 md:row-span-2 rounded-3xl border border-border/80 bg-card/60 p-5 flex flex-col justify-between backdrop-blur-md shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Flame className="size-4 text-orange-500 fill-orange-500" />
                <span>Top Thịnh Hành</span>
              </span>
              <Link to="/browse?sort=popular" className="text-xs text-primary hover:underline">
                {t('actions.viewAll')}
              </Link>
            </div>

            <div className="space-y-3">
              {trendingStories.map((novel, idx) => {
                const title = displayTitle(novel.title, t('common.untitled'));
                return (
                  <Link
                    key={novel.slug}
                    to={`/novel/${novel.slug}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/60 transition-colors group"
                  >
                    <span
                      className={`size-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400/20 text-amber-500 border border-amber-400/30'
                          : idx === 1
                          ? 'bg-slate-300/20 text-slate-400 border border-slate-300/30'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-700 border border-amber-700/30'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="size-10 rounded-md overflow-hidden shrink-0 border border-border/70">
                      <ImageWithFallback src={novel.cover} alt={title} className="size-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                        {title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {novel.authors[0]?.name || t('novel.unknownAuthor')}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3.5 text-emerald-500" />
              <span>Cập nhật liên tục</span>
            </span>
          </div>
        </div>

        {/* Cell 3: Quick Picks / Đọc Nhanh (1 cột x 1 hàng) */}
        <div className="md:col-span-1 lg:col-span-1 rounded-3xl border border-border/80 bg-card/60 p-5 flex flex-col justify-between backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-primary" />
              <span>Mới Ra Lò</span>
            </span>
            <Link to="/browse?sort=latest" className="text-[11px] text-primary hover:underline">
              {t('actions.viewAll')}
            </Link>
          </div>

          <div className="space-y-2">
            {quickPicks.map((novel) => {
              const title = displayTitle(novel.title, t('common.untitled'));
              return (
                <Link
                  key={novel.slug}
                  to={`/novel/${novel.slug}`}
                  className="block p-1.5 rounded-lg hover:bg-accent/60 transition-colors"
                >
                  <p className="text-xs font-medium truncate text-foreground hover:text-primary">
                    {title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {novel.genres[0]?.name || 'Truyện'} • {novel.chapterCount || 0} chương
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Cell 4: Thể Loại Khám Phá (1 cột x 1 hàng) */}
        <div className="md:col-span-1 lg:col-span-1 rounded-3xl border border-border/80 bg-card/60 p-5 flex flex-col justify-between backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Compass className="size-3.5 text-primary" />
              <span>{t('home.byGenre')}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {genres.slice(0, 6).map((g) => (
              <Link key={g.slug} to={`/browse?genre=${g.slug}`}>
                <Badge
                  variant="outline"
                  className="text-[11px] py-1 px-2.5 rounded-full hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  {g.name}
                </Badge>
              </Link>
            ))}
          </div>

          <Link
            to="/browse"
            className="text-xs text-primary font-medium flex items-center gap-1 pt-2 hover:underline mt-2"
          >
            <span>Tất cả thể loại</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </section>

      {/* ── SECTION LATEST NOVELS ── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div className="flex items-baseline gap-3">
            <span
              className="text-muted-foreground"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem' }}
            >
              01
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600 }}>
              {t('home.latest')}
            </h2>
          </div>
          <Link
            to="/browse?sort=latest"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {t('actions.viewAll')}
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <NovelGrid novels={latest} />
      </section>

      {/* ── SECTION POPULAR NOVELS ── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div className="flex items-baseline gap-3">
            <span
              className="text-muted-foreground"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem' }}
            >
              02
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600 }}>
              {t('home.popular')}
            </h2>
          </div>
          <Link
            to="/browse?sort=popular"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {t('actions.viewAll')}
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <NovelGrid novels={popular} />
      </section>
    </div>
  );
}
