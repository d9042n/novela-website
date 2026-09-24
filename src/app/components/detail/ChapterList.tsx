import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowDownUp, Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary } from '../../data/types';
import { getChapterList } from '../../data/api';
import { formatChapterTitle } from '../../data/format';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../ui/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface ChapterListProps {
  slug: string;
  /** Tổng số chương (từ novel.chapterCount) — hiển thị + tính số trang. */
  total: number | null;
  /** chapter_no đang đọc dở (đánh dấu đã đọc / hiện tại). */
  lastReadNo?: number;
}

const PAGE_SIZE = 50;

/**
 * Danh sách chương — SERVER pagination (D4). Truyện có thể >11.000 chương nên
 * KHÔNG load hết: mỗi lần chỉ tải 1 trang (size 50) theo `order`.
 * Ô filter lọc CỤC BỘ trong trang đang tải (API không hỗ trợ search tên chương).
 */
export function ChapterList({ slug, total, lastReadNo }: ChapterListProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [desc, setDesc] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChapterSummary[]>([]);
  const [serverTotal, setServerTotal] = useState<number>(total ?? 0);
  const [loading, setLoading] = useState(true);

  const order = desc ? 'desc' : 'asc';

  // Đổi thứ tự -> quay về trang 1.
  useEffect(() => {
    setPage(1);
  }, [order]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getChapterList(slug, { page, size: PAGE_SIZE, order })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setServerTotal(res.total);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, page, order]);

  const totalPages = Math.max(1, Math.ceil((serverTotal || 0) / PAGE_SIZE));

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) => c.title.toLowerCase().includes(q) || String(c.chapterNo).includes(q),
    );
  }, [items, filter]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t('novel.filterChapter')}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => setDesc((d) => !d)} className="gap-2">
          <ArrowDownUp className="size-4" />
          <span className="hidden sm:inline">
            {desc ? t('novel.newestFirst') : t('novel.oldestFirst')}
          </span>
        </Button>

        {totalPages > 1 && (
          <select
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            className="h-9 max-w-[150px] sm:max-w-none rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            aria-label={t('quickJump.title')}
          >
            {Array.from({ length: totalPages }, (_, idx) => {
              const p = idx + 1;
              const start = desc
                ? Math.max(1, (serverTotal || 0) - p * PAGE_SIZE + 1)
                : (p - 1) * PAGE_SIZE + 1;
              const end = desc
                ? (serverTotal || 0) - (p - 1) * PAGE_SIZE
                : Math.min(serverTotal || 0, p * PAGE_SIZE);
              return (
                <option key={p} value={p}>
                  {t('quickJump.range', { start, end })}
                </option>
              );
            })}
          </select>
        )}
      </div>

      <ScrollArea className="h-[520px] rounded-lg border border-border">
        <ul className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="h-4 w-8 rounded" />
                <Skeleton className="h-4 w-3/5 rounded" />
              </li>
            ))
          ) : (
            <>
              {filtered.map((c) => {
                const isCurrent = c.chapterNo === lastReadNo;
                const isRead = lastReadNo != null && c.chapterNo <= lastReadNo;
                return (
                  <li key={c.chapterNo}>
                    <Link
                      to={`/novel/${slug}/chapter/${c.chapterNo}`}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent',
                        isCurrent && 'bg-accent',
                      )}
                    >
                      <span
                        className="w-10 shrink-0 text-muted-foreground tabular-nums"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {c.chapterNo}
                      </span>
                      <span
                        className={cn(
                          'line-clamp-1 flex-1',
                          isRead ? 'text-muted-foreground' : 'text-foreground',
                        )}
                      >
                        {formatChapterTitle(c.chapterNo, c.title)}
                      </span>
                      {isCurrent && <Check className="size-4 shrink-0 text-primary" />}
                    </Link>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: '0.85rem' }}>
                  {t('common.loading') === filter ? '' : t('browse.noResults')}
                </li>
              )}
            </>
          )}
        </ul>
      </ScrollArea>

      {totalPages > 1 && (
        <Pagination>
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
            <PaginationItem>
              <span className="px-3 text-xs text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
            </PaginationItem>
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
    </div>
  );
}
