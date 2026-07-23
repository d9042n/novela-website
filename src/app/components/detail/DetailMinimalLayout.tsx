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

interface DetailMinimalLayoutProps {
  novel: Novel;
  chapters: ChapterSummary[];
  readTarget: number;
  lastRead: { chapterIndex: number; chapterTitle: string; updatedAt: number } | null;
}

export function DetailMinimalLayout({
  novel,
  chapters,
  readTarget,
  lastRead,
}: DetailMinimalLayoutProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Centered Showcase Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-2xl border border-border shadow-2xl transition-transform hover:scale-105">
          <ImageWithFallback
            src={novel.cover}
            alt={tl(novel.title)}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {novel.genreIds.map((gid) => {
              const g = getGenre(gid);
              return g ? (
                <Link key={gid} to={`/browse?genre=${gid}`}>
                  <Badge variant="outline" className="text-xs">
                    {tl(g.name)}
                  </Badge>
                </Link>
              ) : null;
            })}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800 }}>
            {tl(novel.title)}
          </h1>
          <p className="text-sm font-serif italic text-muted-foreground">{tl(novel.author)}</p>

          <div className="flex items-center justify-center gap-4 text-xs font-medium pt-2">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="size-3.5 fill-amber-400" />
              {novel.rating.toFixed(1)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5 text-primary" />
              {novel.chapterCount} {t('novel.chapters')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {(novel.views / 1000).toFixed(0)}K
            </span>
          </div>

          <div className="pt-3">
            <Button asChild size="lg" className="rounded-full gap-2 font-bold px-8">
              <RouterLink to={`/novel/${novel.id}/chapter/${readTarget}`}>
                <Play className="size-4" />
                {lastRead ? t('actions.continueReading', { index: readTarget }) : t('actions.readFromStart')}
              </RouterLink>
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-2">
        <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
          {t('novel.description')}
        </h2>
        <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
          {tl(novel.description)}
        </p>
      </div>

      {/* Chapter List */}
      <div className="space-y-3">
        <h2 className="font-bold text-lg border-b border-border pb-2">
          {t('novel.chapterList')} ({novel.chapterCount})
        </h2>
        <ChapterList novelId={novel.id} chapters={chapters} lastReadIndex={lastRead?.chapterIndex} />
      </div>
    </div>
  );
}
