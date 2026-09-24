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

interface DetailMinimalLayoutProps {
  novel: Novel;
  readTarget: number;
  firstChapterNo: number;
  lastRead: { chapterNo: number; updatedAt: number; scroll?: number } | null;
}

// TODO(i18n-content): title/author/genre/description đơn ngữ VN (backend chỉ có VN).
export function DetailMinimalLayout({
  novel,
  readTarget,
  firstChapterNo,
  lastRead,
}: DetailMinimalLayoutProps) {
  const { t } = useTranslation();
  const scoreText = novel.score != null ? novel.score.toFixed(1) : '—';
  const chapterCount = novel.chapterCount ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Centered Showcase Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-2xl border border-border shadow-2xl transition-transform hover:scale-105">
          <ImageWithFallback
            src={novel.cover}
            alt={displayTitle(novel.title, t('common.untitled'))}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {novel.genres.map((g) => (
              <Link key={g.slug} to={`/browse?genre=${g.slug}`}>
                <Badge variant="outline" className="text-xs">
                  {g.name}
                </Badge>
              </Link>
            ))}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800 }}>
            {displayTitle(novel.title, t('common.untitled'))}
          </h1>
          <p className="text-sm font-serif italic text-muted-foreground">{novel.authors[0]?.name ?? ''}</p>

          <div className="flex items-center justify-center gap-4 text-xs font-medium pt-2">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="size-3.5 fill-amber-400" />
              {scoreText}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5 text-primary" />
              {chapterCount} {t('novel.chapters')}
            </span>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full gap-2 font-bold px-8">
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
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <RouterLink to={`/novel/${novel.slug}/chapter/${firstChapterNo}`}>
                  {t('actions.readFromStart')}
                </RouterLink>
              </Button>
            )}
            <BookmarkButton slug={novel.slug} />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-2">
        <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
          {t('novel.description')}
        </h2>
        <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
          {novel.description}
        </p>
      </div>

      {/* Chapter List */}
      <div className="space-y-3">
        <h2 className="font-bold text-lg border-b border-border pb-2">
          {t('novel.chapterList')} ({chapterCount})
        </h2>
        <ChapterList slug={novel.slug} total={novel.chapterCount} lastReadNo={lastRead?.chapterNo} />
      </div>
    </div>
  );
}
