import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { browseNovels, type SortKey } from '../../data/api';
import { GENRES } from '../../data/genres';
import { useAsync } from '../../hooks/useAsync';
import { useLocalized } from '../../hooks/useLocalized';
import { NovelGrid } from '../NovelGrid';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

const PAGE_SIZE = 18;
const SORT_KEYS: SortKey[] = ['popular', 'latest', 'rating', 'title'];

export function BrowsePage() {
  const { t } = useTranslation();
  const { locale, t: tl } = useLocalized();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const query = params.get('q') ?? '';
  const genreId = params.get('genre') ?? '';
  const sort = (params.get('sort') as SortKey) ?? 'popular';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  };

  const { data: results } = useAsync(
    () => browseNovels({ query, genreId: genreId || undefined, sort, locale }),
    [query, genreId, sort, locale],
    [],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
        {t('browse.title')}
      </h1>

      {/* Toolbar: search + sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder={t('nav.search')}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setParam('sort', v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('browse.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            {SORT_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {t(`browse.sort.${k}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genre chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge
          variant={genreId === '' ? 'default' : 'outline'}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => setParam('genre', '')}
        >
          {t('browse.allGenres')}
        </Badge>
        {GENRES.map((g) => (
          <Badge
            key={g.id}
            variant={genreId === g.id ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => setParam('genre', g.id)}
          >
            {tl(g.name)}
          </Badge>
        ))}
      </div>

      <p className="mb-4 text-muted-foreground" style={{ fontSize: '0.9rem' }}>
        {t('browse.resultsCount', { count: results.length })}
      </p>

      {results.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t('browse.noResults')}</p>
      ) : (
        <>
          <NovelGrid novels={paged} />
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
