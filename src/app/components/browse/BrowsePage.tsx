import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, ChevronDown, Check, RotateCcw, Tag, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { browseNovels, type SortKey } from '../../data/api';
import { GENRES } from '../../data/genres';
import { useAsync } from '../../hooks/useAsync';
import { useLocalized } from '../../hooks/useLocalized';
import { NovelGrid } from '../NovelGrid';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { useTheme } from '../../theme/ThemeProvider';
import { BrowseSidebarLayout } from './BrowseSidebarLayout';

const PAGE_SIZE = 18;
const SORT_KEYS: SortKey[] = ['popular', 'latest', 'rating', 'title'];

export function BrowsePage() {
  const { t } = useTranslation();
  const { locale, t: tl } = useLocalized();
  const { browsePreset } = useTheme();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const query = params.get('q') ?? '';
  const sort = (params.get('sort') as SortKey) ?? 'popular';

  const genreIds = useMemo(
    () => params.get('genres')?.split(',').filter(Boolean) ?? (params.get('genre') ? [params.get('genre')!] : []),
    [params],
  );

  const statusList = useMemo(
    () => (params.get('status')?.split(',').filter(Boolean) as ('ongoing' | 'completed')[]) ?? [],
    [params],
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  };

  const toggleGenre = (id: string) => {
    const nextGenres = genreIds.includes(id)
      ? genreIds.filter((g) => g !== id)
      : [...genreIds, id];
    const next = new URLSearchParams(params);
    if (nextGenres.length > 0) {
      next.set('genres', nextGenres.join(','));
      next.delete('genre');
    } else {
      next.delete('genres');
      next.delete('genre');
    }
    setParams(next, { replace: true });
    setPage(1);
  };

  const toggleStatus = (st: 'ongoing' | 'completed') => {
    const nextStatus = statusList.includes(st)
      ? statusList.filter((s) => s !== st)
      : [...statusList, st];
    const next = new URLSearchParams(params);
    if (nextStatus.length > 0) {
      next.set('status', nextStatus.join(','));
    } else {
      next.delete('status');
    }
    setParams(next, { replace: true });
    setPage(1);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (sort !== 'popular') next.set('sort', sort);
    setParams(next, { replace: true });
    setPage(1);
  };

  const { data: results = [] } = useAsync(
    () => browseNovels({ query, genreIds, statusList, sort, locale }),
    [query, genreIds, statusList, sort, locale],
    [],
  );

  const totalPages = Math.max(1, Math.ceil((results || []).length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => (results || []).slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage],
  );

  const hasActiveFilters = genreIds.length > 0 || statusList.length > 0 || query !== '';

  const paginationNode = totalPages > 1 && (
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
  );

  if (browsePreset === 'sidebar') {
    return (
      <BrowseSidebarLayout
        query={query}
        genreIds={genreIds}
        statusList={statusList}
        sort={sort}
        results={results}
        paged={paged}
        toggleGenre={toggleGenre}
        toggleStatus={toggleStatus}
        setParam={setParam}
        clearAllFilters={clearAllFilters}
        paginationNode={paginationNode}
      />
    );
  }

  // Mặc định: Sleek Multi-Select Toolbar View
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
        {t('browse.title')}
      </h1>

      {/* Single-Line Multi-Select Toolbar: Search + Multi-Genre + Multi-Status + Sort */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder={t('nav.search')}
            className="pl-9"
          />
        </div>

        {/* 1. Multi-Select Genre Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-between gap-2 border-border font-normal">
              <span className="flex items-center gap-2">
                <Tag className="size-3.5 text-primary" />
                <span>
                  {genreIds.length === 0
                    ? t('browse.allGenres')
                    : t('browse.genresCount', { count: genreIds.length })}
                </span>
              </span>
              {genreIds.length > 0 ? (
                <Badge variant="default" className="h-5 px-1.5 text-[10px] rounded-full">
                  {genreIds.length}
                </Badge>
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3 space-y-2 border-border/80 bg-background/95 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>{t('browse.selectGenres')}</span>
              {genreIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.delete('genres');
                    next.delete('genre');
                    setParams(next, { replace: true });
                  }}
                  className="text-[11px] text-primary hover:underline font-medium capitalize"
                >
                  {t('browse.clearSelection')}
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 text-xs">
              {GENRES.map((g) => {
                const checked = genreIds.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      checked
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-foreground/90 hover:bg-accent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleGenre(g.id)}
                      />
                      <span>{tl(g.name)}</span>
                    </span>
                    {checked && <Check className="size-3.5 text-primary" />}
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. Multi-Select Status Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-between gap-2 border-border font-normal">
              <span className="flex items-center gap-2">
                <Bookmark className="size-3.5 text-primary" />
                <span>
                  {statusList.length === 0
                    ? t('browse.allStatuses')
                    : t('browse.statusesCount', { count: statusList.length })}
                </span>
              </span>
              {statusList.length > 0 ? (
                <Badge variant="default" className="h-5 px-1.5 text-[10px] rounded-full">
                  {statusList.length}
                </Badge>
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-3 space-y-2 border-border/80 bg-background/95 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>{t('browse.selectStatuses')}</span>
              {statusList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.delete('status');
                    setParams(next, { replace: true });
                  }}
                  className="text-[11px] text-primary hover:underline font-medium capitalize"
                >
                  {t('browse.clearSelection')}
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              {(['ongoing', 'completed'] as const).map((st) => {
                const checked = statusList.includes(st);
                return (
                  <label
                    key={st}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      checked
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-foreground/90 hover:bg-accent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleStatus(st)}
                      />
                      <span>{t(`status.${st}`)}</span>
                    </span>
                    {checked && <Check className="size-3.5 text-primary" />}
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. Inline Sort Select */}
        <Select value={sort} onValueChange={(v) => setParam('sort', v)}>
          <SelectTrigger className="w-full sm:w-44">
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

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearAllFilters}
            title={t('browse.clearAllFilters')}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
          >
            <RotateCcw className="size-4" />
          </Button>
        )}
      </div>

      <p className="mb-4 text-muted-foreground" style={{ fontSize: '0.9rem' }}>
        {t('browse.resultsCount', { count: (results || []).length })}
      </p>

      {(results || []).length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t('browse.noResults')}</p>
      ) : (
        <>
          <NovelGrid novels={paged} />
          {paginationNode}
        </>
      )}
    </div>
  );
}
