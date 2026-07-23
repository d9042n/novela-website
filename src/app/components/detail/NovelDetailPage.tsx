import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { RouterLink } from '../ui/router-link';
import { BookOpen, Eye, Play, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary, Novel } from '../../data/types';
import { getChapterList, getNovelById } from '../../data/api';
import { getGenre } from '../../data/genres';
import { getProgress } from '../../hooks/useReadingProgress';
import { useLocalized } from '../../hooks/useLocalized';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { NotFoundPage } from '../NotFoundPage';
import { ChapterList } from './ChapterList';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { useTheme } from '../../theme/ThemeProvider';
import { DetailCinematicLayout } from './DetailCinematicLayout';
import { DetailMinimalLayout } from './DetailMinimalLayout';

export function NovelDetailPage() {
  const { novelId = '' } = useParams();
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  const { detailPreset } = useTheme();
  const [novel, setNovel] = useState<Novel | undefined | null>(undefined);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const lastRead = getProgress(novelId);

  useEffect(() => {
    let active = true;
    getNovelById(novelId).then((n) => active && setNovel(n ?? null));
    getChapterList(novelId).then((c) => active && setChapters(c));
    return () => {
      active = false;
    };
  }, [novelId]);

  if (novel === null) return <NotFoundPage />;
  if (!novel) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  const readTarget = lastRead ? lastRead.chapterIndex : 1;

  if (detailPreset === 'cinematic') {
    return (
      <DetailCinematicLayout
        novel={novel}
        chapters={chapters}
        readTarget={readTarget}
        lastRead={lastRead}
      />
    );
  }

  if (detailPreset === 'minimal') {
    return (
      <DetailMinimalLayout
        novel={novel}
        chapters={chapters}
        readTarget={readTarget}
        lastRead={lastRead}
      />
    );
  }

  // Classic Split Column Layout
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header truyện */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="mx-auto w-44 shrink-0 sm:mx-0">
          <div className="overflow-hidden rounded-xl border border-border shadow-lg">
            <div className="aspect-[2/3]">
              <ImageWithFallback
                src={novel.cover}
                alt={tl(novel.title)}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex flex-wrap gap-2">
            {novel.genreIds.map((gid) => {
              const g = getGenre(gid);
              return g ? (
                <Link key={gid} to={`/browse?genre=${gid}`}>
                  <Badge variant="secondary" className="cursor-pointer">
                    {tl(g.name)}
                  </Badge>
                </Link>
              ) : null;
            })}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {tl(novel.title)}
          </h1>
          <p className="mt-2 text-muted-foreground" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.05rem' }}>
            {tl(novel.author)}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Badge>{t(`status.${novel.status}`)}</Badge>
            <span className="text-muted-foreground" style={{ fontSize: '0.85rem' }}>
              {t('novel.updated')}: {novel.updatedAt}
            </span>
          </div>

          <div className="mt-5 flex gap-6">
            {[
              { icon: Star, value: novel.rating.toFixed(1), label: t('novel.rating') },
              { icon: BookOpen, value: novel.chapterCount, label: t('novel.chapters') },
              { icon: Eye, value: `${(novel.views / 1000).toFixed(0)}K`, label: t('novel.views') },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Icon className="size-4 text-primary" />
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
                <span className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <RouterLink to={`/novel/${novel.id}/chapter/${readTarget}`}>
                <Play className="size-4" />
                {lastRead ? t('actions.continueReading', { index: readTarget }) : t('actions.readFromStart')}
              </RouterLink>
            </Button>
            {lastRead && (
              <Button asChild size="lg" variant="outline">
                <RouterLink to={`/novel/${novel.id}/chapter/1`}>{t('actions.readFromStart')}</RouterLink>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Info / Chapters */}
      <Tabs defaultValue="chapters" className="mt-8">
        <TabsList>
          <TabsTrigger value="chapters">
            {t('novel.chapterList')} ({novel.chapterCount})
          </TabsTrigger>
          <TabsTrigger value="info">{t('novel.info')}</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="mt-4">
          <ChapterList
            novelId={novel.id}
            chapters={chapters}
            lastReadIndex={lastRead?.chapterIndex}
          />
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <h2 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600 }}>
            {t('novel.description')}
          </h2>
          <p className="max-w-2xl whitespace-pre-line leading-relaxed text-foreground/90">
            {tl(novel.description)}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
