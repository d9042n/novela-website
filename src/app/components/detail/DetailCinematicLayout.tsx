import { Link } from 'react-router';
import { RouterLink } from '../ui/router-link';
import { BookOpen, Eye, Play, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary, Novel } from '../../data/types';
import { getGenre } from '../../data/genres';
import { useLocalized } from '../../hooks/useLocalized';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChapterList } from './ChapterList';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface DetailCinematicLayoutProps {
  novel: Novel;
  chapters: ChapterSummary[];
  readTarget: number;
  lastRead: { chapterIndex: number; chapterTitle: string; updatedAt: number } | null;
}

export function DetailCinematicLayout({
  novel,
  chapters,
  readTarget,
  lastRead,
}: DetailCinematicLayoutProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();

  return (
    <div className="space-y-8 pb-10">
      {/* Full-width Blurred Backdrop Header */}
      <div className="relative overflow-hidden bg-black text-white min-h-[360px] flex items-end">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={novel.cover}
            alt={tl(novel.title)}
            className="h-full w-full object-cover opacity-50 blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="relative aspect-[2/3] w-40 sm:w-48 shrink-0 overflow-hidden rounded-xl shadow-2xl border-2 border-white/20">
            <ImageWithFallback
              src={novel.cover}
              alt={tl(novel.title)}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {novel.genreIds.map((gid) => {
                const g = getGenre(gid);
                return g ? (
                  <Link key={gid} to={`/browse?genre=${gid}`}>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md">
                      {tl(g.name)}
                    </Badge>
                  </Link>
                ) : null;
              })}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1 }}>
              {tl(novel.title)}
            </h1>
            <p className="text-white/80 font-serif italic text-base">{tl(novel.author)}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-white/90 pt-2">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="size-4 fill-amber-400" />
                {novel.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="size-4 text-primary" />
                {novel.chapterCount} {t('novel.chapters')}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-4" />
                {(novel.views / 1000).toFixed(0)}K {t('common.views')}
              </span>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Button asChild size="lg" className="rounded-full gap-2 font-bold shadow-lg">
                <RouterLink to={`/novel/${novel.id}/chapter/${readTarget}`}>
                  <Play className="size-4" />
                  {lastRead ? t('actions.continueReading', { index: readTarget }) : t('actions.readFromStart')}
                </RouterLink>
              </Button>
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
              {tl(novel.description)}
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="font-bold text-base border-b border-border pb-2">
              {t('novel.chapterList')} ({novel.chapterCount})
            </h2>
            <ChapterList novelId={novel.id} chapters={chapters} lastReadIndex={lastRead?.chapterIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}
