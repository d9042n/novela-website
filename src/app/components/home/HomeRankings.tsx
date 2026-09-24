import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Trophy, Star, Eye, Calendar } from 'lucide-react';
import { getRankings } from '../../data/api';
import type { RankingNovel, RankingWindow } from '../../data/types';
import { displayTitle, formatViews } from '../../data/format';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../ui/utils';

export function HomeRankings() {
  const { t } = useTranslation();
  const [window, setWindow] = useState<RankingWindow>('day');
  const [items, setItems] = useState<RankingNovel[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getRankings(window, { size: 10 })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [window]);

  return (
    <section id="rankings" className="mt-14 scroll-mt-20">
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span
            className="text-muted-foreground"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem' }}
          >
            03
          </span>
          <div className="flex items-center gap-2">
            <Trophy className="size-6 text-primary" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.1 }}>
              {t('home.rankings.title', 'Bảng Xếp Hạng')}
            </h2>
          </div>
        </div>

        <Tabs value={window} onValueChange={(v) => setWindow(v as RankingWindow)}>
          <TabsList>
            <TabsTrigger value="day" className="text-xs sm:text-sm">
              {t('home.rankings.day', 'Hôm nay')}
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs sm:text-sm">
              {t('home.rankings.week', 'Tuần này')}
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs sm:text-sm">
              {t('home.rankings.month', 'Tháng này')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-card p-3">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md border border-border/80 bg-muted">
                <Skeleton className="size-full rounded-none" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-4/5 rounded" />
                <div className="flex items-center gap-2 pt-0.5">
                  <Skeleton className="h-3 w-1/3 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {items.map((novel) => {
            const title = displayTitle(novel.title, t('common.untitled'));
            const isTop1 = novel.rank === 1;
            const isTop2 = novel.rank === 2;
            const isTop3 = novel.rank === 3;

            return (
              <Link
                key={novel.slug}
                to={`/novel/${novel.slug}`}
                className={cn(
                  'group flex items-center gap-3.5 rounded-xl border p-3 transition-all',
                  'hover:border-primary/50 hover:bg-muted/40 hover:shadow-sm',
                  isTop1 && 'border-amber-500/30 bg-amber-500/[0.03]',
                  isTop2 && 'border-slate-400/30 bg-slate-400/[0.03]',
                  isTop3 && 'border-amber-700/30 bg-amber-700/[0.03]',
                  !isTop1 && !isTop2 && !isTop3 && 'border-border/60 bg-card',
                )}
                aria-label={title}
              >
                {/* Thứ hạng Badge */}
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                    isTop1 && 'bg-amber-500 text-white shadow-sm shadow-amber-500/30',
                    isTop2 && 'bg-slate-400 text-white shadow-sm shadow-slate-400/30',
                    isTop3 && 'bg-amber-700 text-white shadow-sm shadow-amber-700/30',
                    !isTop1 && !isTop2 && !isTop3 && 'bg-muted text-muted-foreground font-semibold',
                  )}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {novel.rank}
                </div>

                {/* Bìa truyện */}
                <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-md border border-border/80 bg-muted shadow-xs">
                  <ImageWithFallback
                    src={novel.cover}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Thông tin truyện */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3
                    className="line-clamp-1 font-semibold transition-colors group-hover:text-primary"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', lineHeight: 1.25 }}
                  >
                    {title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {novel.authors[0] && (
                      <span className="truncate max-w-[120px]">{novel.authors[0].name}</span>
                    )}
                    {novel.genres[0] && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
                        {novel.genres[0].name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <Eye className="size-3.5" />
                      {formatViews(novel.viewsInWindow)}
                    </span>
                    {novel.score != null && (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {novel.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <Calendar className="mb-2 size-8 text-muted-foreground/60" />
          <p className="font-medium text-foreground">
            {t('home.rankings.empty', 'Chưa có bảng xếp hạng cho khoảng thời gian này')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('home.rankings.emptyDesc', 'Bảng xếp hạng sẽ tự động cập nhật khi có lượt đọc mới phát sinh.')}
          </p>
        </div>
      )}
    </section>
  );
}
