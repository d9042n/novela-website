import { Link } from 'react-router';
import { Search, Star, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Genre, Novel } from '../../data/types';
import { formatDate } from '../../data/format';
import { displayTitle } from '../../data/format';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BrowseListLayoutProps {
  query: string;
  /** genre slug đang chọn đơn lẻ (dạng chip); '' = tất cả. */
  genreSlug: string;
  sort: string;
  genres: Genre[];
  results: Novel[];
  total: number;
  setParam: (key: string, value: string) => void;
  paginationNode: React.ReactNode;
}

const scoreText = (score: number | null) => (score != null ? score.toFixed(1) : '—');

// TODO(i18n-content): title/author/genre/description đơn ngữ VN (backend chỉ có VN).
export function BrowseListLayout({
  query,
  genreSlug,
  sort,
  genres,
  results,
  total,
  setParam,
  paginationNode,
}: BrowseListLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>
            {t('browse.title')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('browse.resultsCount', { count: total })}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder={t('nav.search')}
              className="pl-9"
            />
          </div>

          <Select value={sort} onValueChange={(v) => setParam('sort', v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t('browse.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              {['popular', 'latest', 'rating', 'title'].map((k) => (
                <SelectItem key={k} value={k}>
                  {t(`browse.sort.${k}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={genreSlug === '' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 text-xs"
          onClick={() => setParam('genre', '')}
        >
          {t('browse.allGenres')}
        </Badge>
        {genres.map((g) => (
          <Badge
            key={g.slug}
            variant={genreSlug === g.slug ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => setParam('genre', g.slug)}
          >
            {g.name}
          </Badge>
        ))}
      </div>

      {total === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t('browse.noResults')}</p>
      ) : (
        <div className="space-y-4">
          {results.map((novel) => (
            <Card key={novel.slug} className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-5">
                <Link to={`/novel/${novel.slug}`} className="shrink-0 group mx-auto sm:mx-0">
                  <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-lg bg-muted shadow">
                    <ImageWithFallback
                      src={novel.cover}
                      alt={displayTitle(novel.title, t('common.untitled'))}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 flex items-center gap-0.5">
                      <Star className="size-3 fill-amber-400" />
                      {scoreText(novel.score)}
                    </div>
                  </div>
                </Link>

                <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {novel.genres.map((g) => (
                        <Badge key={g.slug} variant="secondary" className="text-[10px] px-2 py-0">
                          {g.name}
                        </Badge>
                      ))}
                    </div>
                    <Link to={`/novel/${novel.slug}`}>
                      <h2 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">
                        {displayTitle(novel.title, t('common.untitled'))}
                      </h2>
                    </Link>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {novel.authors[0]?.name ?? ''}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-2 leading-relaxed">
                      {novel.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <BookOpen className="size-3.5 text-primary" />
                        {novel.chapterCount ?? 0} {t('novel.chapters')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {formatDate(novel.updatedAt)}
                      </span>
                    </div>

                    <Link to={`/novel/${novel.slug}`}>
                      <Button size="sm" className="gap-1 text-xs">
                        {t('actions.readNow')}
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {paginationNode}
        </div>
      )}
    </div>
  );
}
