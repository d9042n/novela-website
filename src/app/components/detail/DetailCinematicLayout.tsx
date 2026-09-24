import { Link } from 'react-router';
import { BookmarkButton } from './BookmarkButton';
import { RouterLink } from '../ui/router-link';
import { BookOpen, Play, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { displayTitle } from '../../data/format';
import type { Novel } from '../../data/types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChapterList } from './ChapterList';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AmbientCoverGlow } from '../visual/AmbientCoverGlow';

interface DetailCinematicLayoutProps {
  novel: Novel;
  readTarget: number;
  firstChapterNo: number;
  lastRead: { chapterNo: number; updatedAt: number; scroll?: number } | null;
}

// TODO(i18n-content): title/author/genre/description đơn ngữ VN (backend chỉ có VN).
export function DetailCinematicLayout({
  novel,
  readTarget,
  firstChapterNo,
  lastRead,
}: DetailCinematicLayoutProps) {
  const { t } = useTranslation();
  const scoreText = novel.score != null ? novel.score.toFixed(1) : '—';
  const chapterCount = novel.chapterCount ?? 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Full-width Blurred Backdrop Header */}
      <div className="relative overflow-hidden bg-black text-white min-h-[360px] flex items-end">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={novel.cover}
            alt={displayTitle(novel.title, t('common.untitled'))}
            className="h-full w-full object-cover opacity-50 blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <AmbientCoverGlow src={novel.cover} intensity="deep">
            <div className="relative aspect-[2/3] w-40 sm:w-48 shrink-0 overflow-hidden rounded-xl shadow-2xl border-2 border-white/20">
              <ImageWithFallback
                src={novel.cover}
                alt={displayTitle(novel.title, t('common.untitled'))}
                className="h-full w-full object-cover"
              />
            </div>
          </AmbientCoverGlow>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {novel.genres.map((g) => (
                <Link key={g.slug} to={`/browse?genre=${g.slug}`}>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md">
                    {g.name}
                  </Badge>
                </Link>
              ))}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1 }}>
              {displayTitle(novel.title, t('common.untitled'))}
            </h1>
            <p className="text-white/80 font-serif italic text-base">{novel.authors[0]?.name ?? ''}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-white/90 pt-2">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="size-4 fill-amber-400" />
                {scoreText}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="size-4 text-primary" />
                {chapterCount} {t('novel.chapters')}
              </span>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Button asChild size="lg" className="rounded-full gap-2 font-bold shadow-lg">
                <RouterLink to={`/novel/${novel.slug}/chapter/${readTarget}`}>
                  <Play className="size-4" />
                  {lastRead
                    ? (lastRead.scroll && lastRead.scroll > 0.05
                        ? t('actions.continueReadingPercent', { index: readTarget, percent: Math.round(lastRead.scroll * 100) })
                        : t('actions.continueReading', { index: readTarget }))
                    : t('actions.readFromStart')}
                </RouterLink>
              </Button>
              {lastRead && (
                <Button asChild size="lg" variant="outline" className="rounded-full bg-black/40 border-white/20 text-white hover:bg-black/60">
                  <RouterLink to={`/novel/${novel.slug}/chapter/${firstChapterNo}`}>
                    {t('actions.readFromStart')}
                  </RouterLink>
                </Button>
              )}
              <BookmarkButton slug={novel.slug} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Side-by-side Overview & Chapters */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h2 className="font-bold text-base border-b border-border pb-2">{t('novel.description')}</h2>
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
              {novel.description}
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-bold text-base border-b border-border pb-2">
              {t('novel.chapterList')} ({chapterCount})
            </h2>
            <ChapterList slug={novel.slug} total={novel.chapterCount} lastReadNo={lastRead?.chapterNo} />
          </div>
        </div>
      </div>
    </div>
  );
}
