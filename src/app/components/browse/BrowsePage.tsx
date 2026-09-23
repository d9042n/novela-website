import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, ChevronDown, Check, RotateCcw, Tag, Bookmark, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { browseNovels, getSources, type SortKey } from '../../data/api';
import { useGenres } from '../../data/genres';
import type { Novel, NovelStatus, Source } from '../../data/types';
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
import { Skeleton } from '../ui/skeleton';
import { useTheme } from '../../theme/ThemeProvider';
import { gridClassFor } from '../../theme/config';
import { BrowseSidebarLayout } from './BrowseSidebarLayout';

const PAGE_SIZE = 18;
const SORT_KEYS: SortKey[] = ['popular', 'latest', 'rating', 'title'];
const STATUS_OPTIONS: NovelStatus[] = ['ongoing', 'completed'];

/** Sinh dãy số trang gọn quanh trang hiện tại (tránh render 1794 nút). */
function pageWindow(current: number, totalPages: number): number[] {
  const span = 2;
  const start = Math.max(1, current - span);
  const end = Math.min(totalPages, current + span);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export function BrowsePage() {
  const { t } = useTranslation();
  const { genres } = useGenres();
  const { browsePreset, layout } = useTheme();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<Novel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  // error TÁCH RIÊNG khỏi "0 kết quả": trước đây .catch() chỉ set results=[] +
  // total=0, nên API chết (mạng đứt, backend 500) hiển thị y hệt "không tìm
  // thấy truyện nào phù hợp" — người dùng đi sửa từ khóa trong khi thật ra
  // phải bấm thử lại.
  const [error, setError] = useState(false);
  // reloadKey: nút "thử lại" chỉ cần chạy lại effect fetch, không cần
  // window.location.reload() như hai chỗ khác trong repo — reload cả trang thì
  // mất hết filter đang chọn và người dùng phải chờ tải lại toàn bộ bundle.
  const [reloadKey, setReloadKey] = useState(0);

  const query = params.get('q') ?? '';
  const sort = (params.get('sort') as SortKey) ?? 'popular';

  const genreSlugs = useMemo(
    () =>
      params.get('genres')?.split(',').filter(Boolean) ??
      (params.get('genre') ? [params.get('genre')!] : []),
    [params],
  );

  const statusList = useMemo(
    () => (params.get('status')?.split(',').filter(Boolean) as NovelStatus[]) ?? [],
    [params],
  );

  // source code (?source=truyenmacothat hoặc ?source=a,b): backend đã hỗ trợ
  // filter này từ trước, nhưng trang bỏ qua param nên link kèm ?source= im lặng
  // trả về danh sách KHÔNG lọc — người dùng tưởng filter chạy mà thật ra không.
  const sourceCodes = useMemo(
    () => params.get('source')?.split(',').filter(Boolean) ?? [],
    [params],
  );

  const [sources, setSources] = useState<Source[]>([]);
  useEffect(() => {
    let active = true;
    getSources()
      .then((data) => {
        if (active) setSources(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Server pagination (D4): fetch đúng 1 trang mỗi lần, KHÔNG load hết.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    browseNovels({ query, genreSlugs, statusList, sourceCodes, sort, page, size: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        setResults(res.items);
        setTotal(res.total);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setResults([]);
        setTotal(0);
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, genreSlugs, statusList, sourceCodes, sort, page, reloadKey]);

  // Đổi filter/sort -> quay về trang 1.
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  };

  const toggleGenre = (slug: string) => {
    const nextGenres = genreSlugs.includes(slug)
      ? genreSlugs.filter((g) => g !== slug)
      : [...genreSlugs, slug];
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

  const toggleStatus = (st: NovelStatus) => {
    const nextStatus = statusList.includes(st)
      ? statusList.filter((s) => s !== st)
      : [...statusList, st];
    const next = new URLSearchParams(params);
    if (nextStatus.length > 0) next.set('status', nextStatus.join(','));
    else next.delete('status');
    setParams(next, { replace: true });
    setPage(1);
  };

  const toggleSource = (code: string) => {
    const nextSources = sourceCodes.includes(code)
      ? sourceCodes.filter((s) => s !== code)
      : [...sourceCodes, code];
    const next = new URLSearchParams(params);
    if (nextSources.length > 0) next.set('source', nextSources.join(','));
    else next.delete('source');
    setParams(next, { replace: true });
    setPage(1);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (sort !== 'popular') next.set('sort', sort);
    setParams(next, { replace: true });
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const hasActiveFilters =
    genreSlugs.length > 0 || statusList.length > 0 || sourceCodes.length > 0 || query !== '';

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
        {pageWindow(currentPage, totalPages).map((p) => (
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
        genreSlugs={genreSlugs}
        statusList={statusList}
        sourceCodes={sourceCodes}
        sort={sort}
        genres={genres}
        sources={sources}
        results={results}
        total={total}
        toggleGenre={toggleGenre}
        toggleStatus={toggleStatus}
        toggleSource={toggleSource}
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
                  {genreSlugs.length === 0
                    ? t('browse.allGenres')
                    : t('browse.genresCount', { count: genreSlugs.length })}
                </span>
              </span>
              {genreSlugs.length > 0 ? (
                <Badge variant="default" className="h-5 px-1.5 text-[10px] rounded-full">
                  {genreSlugs.length}
                </Badge>
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3 space-y-2 border-border/80 bg-background/95 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>{t('browse.selectGenres')}</span>
              {genreSlugs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.delete('genres');
                    next.delete('genre');
                    setParams(next, { replace: true });
                    setPage(1);
                  }}
                  className="text-[11px] text-primary hover:underline font-medium capitalize"
                >
                  {t('browse.clearSelection')}
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 text-xs">
              {genres.map((g) => {
                const checked = genreSlugs.includes(g.slug);
                return (
                  <label
                    key={g.slug}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      checked
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-foreground/90 hover:bg-accent'
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
                    setPage(1);
                  }}
                  className="text-[11px] text-primary hover:underline font-medium capitalize"
                >
                  {t('browse.clearSelection')}
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              {STATUS_OPTIONS.map((st) => {
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

        {/* 3. Multi-Select Source Popover */}
        {sources.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-between gap-2 border-border font-normal">
                <span className="flex items-center gap-2">
                  <Globe className="size-3.5 text-primary" />
                  <span>
                    {sourceCodes.length === 0
                      ? t('browse.allSources')
                      : t('browse.sourcesCount', { count: sourceCodes.length })}
                  </span>
                </span>
                {sourceCodes.length > 0 ? (
                  <Badge variant="default" className="h-5 px-1.5 text-[10px] rounded-full">
                    {sourceCodes.length}
                  </Badge>
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-3 space-y-2 border-border/80 bg-background/95 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>{t('browse.selectSources')}</span>
                {sourceCodes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(params);
                      next.delete('source');
                      setParams(next, { replace: true });
                      setPage(1);
                    }}
                    className="text-[11px] text-primary hover:underline font-medium capitalize"
                  >
                    {t('browse.clearSelection')}
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs max-h-60 overflow-y-auto">
                {sources.map((src) => {
                  const checked = sourceCodes.includes(src.code);
                  return (
                    <label
                      key={src.code}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        checked
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground/90 hover:bg-accent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSource(src.code)}
                        />
                        <span>{src.name || src.code}</span>
                      </span>
                      {checked && <Check className="size-3.5 text-primary" />}
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* 4. Inline Sort Select */}
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

      {/* Số kết quả chỉ có nghĩa khi fetch thành công: lúc lỗi thì total=0 và
          "Tìm thấy 0 tác phẩm" là một con số SAI, không phải con số chưa biết. */}
      {!error && (
        <p className="mb-4 text-muted-foreground" style={{ fontSize: '0.9rem' }}>
          {t('browse.resultsCount', { count: total })}
        </p>
      )}

      {/* Ba trạng thái TÁCH BIỆT, theo đúng thứ tự ưu tiên:
          lỗi -> đang tải -> rỗng -> có dữ liệu.
          Trước đây chỉ có "rỗng", nên API chết hiện y hệt "không tìm thấy
          truyện nào" và người dùng đi sửa từ khóa trong khi cần bấm thử lại. */}
      {error ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">{t('common.loadError')}</p>
          <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
            <RotateCcw className="size-4" />
            {t('common.retry')}
          </Button>
        </div>
      ) : loading ? (
        // Skeleton giữ đúng khung lưới nên không bị giật layout khi data về.
        <div className={gridClassFor(layout)}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          ))}
        </div>
      ) : total === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t('browse.noResults')}</p>
      ) : (
        <>
          <NovelGrid novels={results} />
          {paginationNode}
        </>
      )}
    </div>
  );
}
