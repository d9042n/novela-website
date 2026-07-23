import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary } from '../../data/types';
import { useLocalized } from '../../hooks/useLocalized';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { SheetClose } from '../ui/sheet';
import { cn } from '../ui/utils';

interface ReaderContentsProps {
  novelId: string;
  chapters: ChapterSummary[];
  currentIndex: number;
}

/** Mục lục nhanh trong reader (dùng trong Sheet). */
export function ReaderContents({ novelId, chapters, currentIndex }: ReaderContentsProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? chapters.filter((c) => tl(c.title).toLowerCase().includes(q) || String(c.index).includes(q))
    : chapters;

  return (
    <div className="flex h-full flex-col gap-2.5 px-3 pb-3">
      {/* Search Input với lề side mềm mại, không full-width đụng lề */}
      <div className="relative px-0.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/80" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('novel.filterChapter')}
          className="h-9 pl-9 text-xs rounded-xl border border-border/70 bg-muted/40 focus:bg-background transition-all duration-150"
        />
      </div>

      {/* Danh sách chương bo góc mềm mại, có khoảng cách padding gọn gàng */}
      <ScrollArea className="flex-1 rounded-xl border border-border/50 bg-card/30 p-1">
        <div className="space-y-0.5 pr-1">
          {filtered.map((c) => {
            const active = c.index === currentIndex;
            return (
              <SheetClose key={c.id} asChild>
                <button
                  type="button"
                  onClick={() => navigate(`/novel/${novelId}/chapter/${c.index}`)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-150',
                    active
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-xs'
                      : 'text-foreground/80 hover:bg-muted/80 hover:text-foreground',
                  )}
                >
                  <span className={cn('w-6 shrink-0 text-xs font-mono font-medium tabular-nums', active ? 'text-primary font-bold' : 'text-muted-foreground/75')}>
                    {c.index}
                  </span>
                  <span className="line-clamp-1 text-xs font-medium">{tl(c.title)}</span>
                </button>
              </SheetClose>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
