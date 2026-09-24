import { Search, Filter, Check, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Genre, Novel, NovelStatus, Source } from '../../data/types';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { NovelGrid } from '../NovelGrid';

interface BrowseSidebarLayoutProps {
  query: string;
  genreSlugs: string[];
  statusList: NovelStatus[];
  sourceCodes?: string[];
  sort: string;
  genres: Genre[];
  sources?: Source[];
  results: Novel[];
  total: number;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  toggleGenre: (slug: string) => void;
  toggleStatus: (st: NovelStatus) => void;
  toggleSource?: (code: string) => void;
  setParam: (key: string, value: string) => void;
  clearAllFilters: () => void;
  paginationNode: React.ReactNode;
}

const STATUS_OPTIONS: NovelStatus[] = ['ongoing', 'completed'];

export function BrowseSidebarLayout({
  query,
  genreSlugs = [],
  statusList = [],
  sourceCodes = [],
  sort,
  genres = [],
  sources = [],
  results = [],
  total,
  loading = false,
  error = false,
  onRetry,
  toggleGenre,
  toggleStatus,
  toggleSource,
  setParam,
  clearAllFilters,
  paginationNode,
}: BrowseSidebarLayoutProps) {
  const { t } = useTranslation();

  const hasActiveFilters = genreSlugs.length > 0 || statusList.length > 0 || sourceCodes.length > 0 || query !== '';

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

        <div className="relative max-w-sm w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder={t('nav.search')}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
          <Card className="p-4 space-y-5 border-border/80">
            {/* Header + Clear Button */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Filter className="size-4 text-primary" />
                <span>{t('browse.sortBy')}</span>
              </div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>{t('browse.clearFilters')}</span>
                </Button>
              )}
            </div>

            {/* Sort Options */}
            <div className="space-y-1 text-xs">
              {['popular', 'latest', 'rating', 'title'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setParam('sort', k)}
                  className={`w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
                    sort === k
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {t(`browse.sort.${k}`)}
                </button>
              ))}
            </div>

            {/* Multi-Select Status Filter */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('browse.selectStatuses')}
              </div>
              <div className="space-y-2 text-xs">
                {STATUS_OPTIONS.map((st) => {
                  const checked = statusList.includes(st);
                  return (
                    <label
                      key={st}
                      className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-card cursor-pointer hover:bg-accent transition-colors"
                    >
                      <span className="flex items-center gap-2.5 font-medium">
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
            </div>

            {/* Multi-Select Genres Filter */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>{t('browse.selectGenres')}</span>
                {genreSlugs.length > 0 && (
                  <span className="text-primary font-bold text-[11px] lowercase">
                    ({genreSlugs.length})
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 text-xs">
                {genres.map((g) => {
                  const checked = genreSlugs.includes(g.slug);
                  return (
                    <label
                      key={g.slug}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                        checked
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleGenre(g.slug)}
                        />
                        <span>{g.name}</span>
                      </span>
                      {checked && <Check className="size-3.5 text-primary" />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Multi-Select Sources Filter */}
            {sources.length > 0 && (
              <div className="pt-3 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>{t('browse.selectSources')}</span>
                  {sourceCodes.length > 0 && (
                    <span className="text-primary font-bold text-[11px] lowercase">
                      ({sourceCodes.length})
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                  {sources.map((s) => {
                    const checked = sourceCodes.includes(s.code);
                    return (
                      <label
                        key={s.code}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                          checked
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSource?.(s.code)}
                          />
                          <span>{s.name || s.code}</span>
                        </span>
                        {checked && <Check className="size-3.5 text-primary" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </aside>

        {/* Right Main Grid Area */}
        <main className="lg:col-span-9 space-y-6">
          {error ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-muted-foreground">{t('common.loadError')}</p>
              {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  <RotateCcw className="size-4" />
                  {t('common.retry')}
                </Button>
              )}
            </div>
          ) : loading ? (
            <NovelGrid loading count={18} />
          ) : total === 0 ? (
            <p className="py-16 text-center text-muted-foreground">{t('browse.noResults')}</p>
          ) : (
            <>
              <NovelGrid novels={results} />
              {paginationNode}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
