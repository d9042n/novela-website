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
    <div className="flex h-full flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('novel.filterChapter')}
          className="pl-9"
        />
      </div>
      <ScrollArea className="flex-1 rounded-md border border-border">
        <ul className="divide-y divide-border">
          {filtered.map((c) => (
            <li key={c.id}>
              <SheetClose asChild>
                <button
                  type="button"
                  onClick={() => navigate(`/novel/${novelId}/chapter/${c.index}`)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent',
                    c.index === currentIndex && 'bg-accent',
                  )}
                >
                  <span className="w-8 shrink-0 text-muted-foreground tabular-nums" style={{ fontSize: '0.8rem' }}>
                    {c.index}
                  </span>
                  <span className="line-clamp-1">{tl(c.title)}</span>
                </button>
              </SheetClose>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
