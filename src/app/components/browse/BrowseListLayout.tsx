import { Link } from 'react-router';
import { Search, Star, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { GENRES, getGenre } from '../../data/genres';
import { useLocalized } from '../../hooks/useLocalized';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface BrowseListLayoutProps {
  query: string;
  genreId: string;
  sort: string;
  results: Novel[];
  paged: Novel[];
  setParam: (key: string, value: string) => void;
  paginationNode: React.ReactNode;
}

export function BrowseListLayout({
  query,
  genreId,
  sort,
  results,
  paged,
  setParam,
  paginationNode,
}: BrowseListLayoutProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>
            {t('browse.title')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('browse.resultsCount', { count: results.length })}
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
          variant={genreId === '' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1 text-xs"
          onClick={() => setParam('genre', '')}
        >
          {t('browse.allGenres')}
        </Badge>
        {GENRES.map((g) => (
          <Badge
            key={g.id}
            variant={genreId === g.id ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => setParam('genre', g.id)}
          >
            {tl(g.name)}
          </Badge>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t('browse.noResults')}</p>
      ) : (
        <div className="space-y-4">
          {paged.map((novel) => (
            <Card key={novel.id} className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-5">
                <Link to={`/novel/${novel.id}`} className="shrink-0 group mx-auto sm:mx-0">
                  <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-lg bg-muted shadow">
                    <img
                      src={novel.cover}
                      alt={tl(novel.title)}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 flex items-center gap-0.5">
                      <Star className="size-3 fill-amber-400" />
                      {novel.rating}
                    </div>
                  </div>
                </Link>

                <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {novel.genreIds.map((gid) => {
                        const g = getGenre(gid);
                        return g ? (
                          <Badge key={gid} variant="secondary" className="text-[10px] px-2 py-0">
                            {tl(g.name)}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <Link to={`/novel/${novel.id}`}>
                      <h2 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">
                        {tl(novel.title)}
                      </h2>
                    </Link>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {tl(novel.author)}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-2 leading-relaxed">
                      {tl(novel.description)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <BookOpen className="size-3.5 text-primary" />
                        {novel.chapterCount} {t('novel.chapters')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {novel.updatedAt}
                      </span>
                    </div>

                    <Link to={`/novel/${novel.id}`}>
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
