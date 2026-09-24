import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary } from '../../data/types';
import { getChapterList } from '../../data/api';
import { formatChapterTitle } from '../../data/format';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { SheetClose } from '../ui/sheet';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface ReaderContentsProps {
  slug: string;
  currentNo: number;
  /** tổng số chương để tính số trang. */
  total: number;
  /**
   * Mục lục này được render TRONG một <Sheet> hay không.
   *
   * Quan trọng vì mỗi hàng chương bọc trong <SheetClose> để bấm là đóng sheet —
   * mà SheetClose của Radix BẮT BUỘC nằm trong context Dialog, không thì nó
   * throw "`DialogClose` must be used within `Dialog`" và cả trang trắng.
   * ReaderToolbar render trong <Sheet> (mặc định true), còn ReaderDrawerLayout
   * render trong <aside> sidebar tĩnh nên phải truyền false.
   */
  inSheet?: boolean;
}

const PAGE_SIZE = 50;

/**
 * Mục lục trong reader (Sheet) — SERVER pagination (D4, không load hết).
 * Mở tới trang chứa chương hiện tại. Filter lọc CỤC BỘ trong trang đang tải.
 */
export function ReaderContents({ slug, currentNo, total, inSheet = true }: ReaderContentsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  // Bắt đầu ở trang chứa chương hiện tại (ước lượng theo vị trí, asc order).
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChapterSummary[]>([]);
  const [serverTotal, setServerTotal] = useState(total || 0);

  useEffect(() => {
    let active = true;
    getChapterList(slug, { page, size: PAGE_SIZE, order: 'asc' })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setServerTotal(res.total);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, [slug, page]);

  const totalPages = Math.max(1, Math.ceil((serverTotal || 0) / PAGE_SIZE));

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) => c.title.toLowerCase().includes(q) || String(c.chapterNo).includes(q),
    );
  }, [items, filter]);

  return (
    <div className="flex h-full flex-col gap-2.5 px-3 pb-3">
      <div className="relative px-0.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/80" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('novel.filterChapter')}
          className="h-9 pl-9 text-xs rounded-xl border border-border/70 bg-muted/40 focus:bg-background transition-all duration-150"
        />
      </div>

      <ScrollArea className="flex-1 rounded-xl border border-border/50 bg-card/30 p-1">
        <div className="space-y-0.5 pr-1">
          {filtered.map((c) => {
            const active = c.chapterNo === currentNo;
            const row = (
              <button
                type="button"
                onClick={() => navigate(`/novel/${slug}/chapter/${c.chapterNo}`)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-150',
                  active
                    ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-xs'
                    : 'text-foreground/80 hover:bg-muted/80 hover:text-foreground',
                )}
              >
                <span className="w-6 shrink-0 text-xs font-mono font-medium tabular-nums" style={{ color: active ? 'var(--primary)' : undefined }}>
                  {c.chapterNo}
                </span>
                <span className="line-clamp-1 text-xs font-medium">{formatChapterTitle(c.chapterNo, c.title)}</span>
              </button>
            );
            // Chỉ bọc SheetClose khi THỰC SỰ ở trong Sheet: ngoài context Dialog
            // thì Radix throw và cả trang trắng. Trong sidebar tĩnh, điều hướng
            // đã đủ — không có gì để đóng.
            return inSheet ? (
              <SheetClose key={c.chapterNo} asChild>
                {row}
              </SheetClose>
            ) : (
              <div key={c.chapterNo}>{row}</div>
            );
          })}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('reader.prevChapter')}
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('reader.nextChapter')}
          </Button>
        </div>
      )}
    </div>
  );
}
