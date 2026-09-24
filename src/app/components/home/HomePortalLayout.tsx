import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Flame, Trophy, Clock, Star, BookOpen, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { useGenres } from '../../data/genres';
import { HeroCarousel } from './HeroCarousel';
import { ContinueReading } from './ContinueReading';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatDate } from '../../data/format';
import { displayTitle } from '../../data/format';
import { Skeleton } from '../ui/skeleton';

interface HomePortalLayoutProps {
  featured: Novel[];
  latest: Novel[];
  popular: Novel[];
  loading?: boolean;
}

const scoreText = (score: number | null) => (score != null ? score.toFixed(1) : '—');

// TODO(i18n-content): title/author/genre/description đơn ngữ VN (backend chỉ có VN).
export function HomePortalLayout({
  featured = [],
  latest = [],
  popular = [],
  loading = false,
}: HomePortalLayoutProps) {
  const { t } = useTranslation();
  const { genres } = useGenres();
  const [rankingTab, setRankingTab] = useState<'popular' | 'latest'>('popular');

  const topRankings = rankingTab === 'popular' ? (popular || []).slice(0, 6) : (latest || []).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Top Banner Hero */}
      <HeroCarousel novels={featured} />

      {/* Main 2-Column Portal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (70% - 8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <ContinueReading />

          {/* Detailed Feed Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-primary" />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
                  {t('home.latest')}
                </h2>
              </div>
              <Link
                to="/browse?sort=latest"
                className="group/link flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {t('actions.viewAll')}
                <ChevronRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {loading || !latest || latest.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-border/80">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                      <div className="relative aspect-[3/4] w-24 sm:w-28 overflow-hidden rounded-md bg-muted shrink-0">
                        <Skeleton className="size-full rounded-none" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0 py-1">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Skeleton className="h-4 w-16 rounded-full" />
                            <Skeleton className="h-4 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-5 w-4/5 rounded" />
                          <Skeleton className="h-3.5 w-1/3 rounded" />
                          <Skeleton className="h-3 w-full rounded" />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                          <Skeleton className="h-3 w-28 rounded" />
                          <Skeleton className="h-3 w-20 rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                latest.map((novel) => (
                  <Card
                    key={novel.slug}
                    className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                      <Link to={`/novel/${novel.slug}`} className="shrink-0">
                        <div className="relative aspect-[3/4] w-24 sm:w-28 overflow-hidden rounded-md bg-muted">
                          <ImageWithFallback
                            src={novel.cover}
                            alt={displayTitle(novel.title, t('common.untitled'))}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-0.5">
                            <Star className="size-2.5 fill-amber-400 text-amber-400" />
                            {scoreText(novel.score)}
                          </div>
                        </div>
                      </Link>

                      <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {(novel.genres || []).slice(0, 3).map((genre) => (
                              <Badge key={genre.slug} variant="secondary" className="text-[10px] px-2 py-0">
                                {genre.name}
                              </Badge>
                            ))}
                          </div>
                          <Link to={`/novel/${novel.slug}`}>
                            <h3 className="font-semibold text-base sm:text-lg transition-colors group-hover:text-primary line-clamp-1">
                              {displayTitle(novel.title, t('common.untitled'))}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t('novel.author')}: <span className="text-foreground">{novel.authors[0]?.name ?? ''}</span>
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                            {novel.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                          <span className="flex items-center gap-1">
                            <BookOpen className="size-3.5 text-primary" />
                            {t('novel.chapterCountLabel', { count: novel.chapterCount ?? 0 })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {formatDate(novel.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sticky Sidebar (30% - 4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Top Rankings Widget */}
          <Card className="overflow-hidden border-border/80">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                <h3 className="font-bold text-sm tracking-tight">{t('home.popular')}</h3>
              </div>
              <div className="flex items-center rounded-lg bg-background p-0.5 border border-border text-[11px]">
                <button
                  type="button"
                  onClick={() => setRankingTab('popular')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    rankingTab === 'popular'
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Hot
                </button>
                <button
                  type="button"
                  onClick={() => setRankingTab('latest')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    rankingTab === 'latest'
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  New
                </button>
              </div>
            </div>

            <CardContent className="p-0 divide-y divide-border/50">
              {loading || !topRankings || topRankings.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="size-6 rounded-md shrink-0" />
                    <div className="relative aspect-[3/4] w-10 overflow-hidden rounded bg-muted shrink-0">
                      <Skeleton className="size-full rounded-none" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                topRankings.map((novel, idx) => (
                  <Link
                    key={novel.slug}
                    to={`/novel/${novel.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors group/rank"
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                            ? 'bg-slate-400 text-white'
                            : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="relative aspect-[3/4] w-10 overflow-hidden rounded bg-muted shrink-0">
                      <ImageWithFallback src={novel.cover} alt={displayTitle(novel.title, t('common.untitled'))} className="h-full w-full object-cover transition-transform group-hover/rank:scale-105" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold group-hover/rank:text-primary transition-colors truncate">
                        {displayTitle(novel.title, t('common.untitled'))}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">{novel.authors[0]?.name ?? ''}</p>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground shrink-0">
                      ⭐ {scoreText(novel.score)}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Genres Cloud */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <Tag className="size-4 text-primary" />
              <h3 className="font-bold text-sm">{t('home.byGenre')}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <Link key={g.slug} to={`/browse?genre=${g.slug}`}>
                  <Badge
                    variant="outline"
                    className="text-xs px-2.5 py-1 rounded-full cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors"
                  >
                    {g.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
