import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowDownUp, Check, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary } from '../../data/types';
import { useLocalized } from '../../hooks/useLocalized';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';

interface ChapterListProps {
  novelId: string;
  chapters: ChapterSummary[];
  lastReadIndex?: number;
}

export function ChapterList({ novelId, chapters, lastReadIndex }: ChapterListProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  const [filter, setFilter] = useState('');
  const [desc, setDesc] = useState(false);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let list = chapters;
    if (q) {
      list = list.filter(
        (c) => tl(c.title).toLowerCase().includes(q) || String(c.index).includes(q),
      );
    }
    return desc ? [...list].reverse() : list;
  }, [chapters, filter, desc, tl]);

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
      </div>

      <ScrollArea className="h-[520px] rounded-lg border border-border">
        <ul className="divide-y divide-border">
          {filtered.map((c) => {
            const isRead = lastReadIndex != null && c.index <= lastReadIndex;
            const isCurrent = c.index === lastReadIndex;
            return (
              <li key={c.id}>
                <Link
                  to={`/novel/${novelId}/chapter/${c.index}`}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent',
                    isCurrent && 'bg-accent',
                  )}
                >
                  <span
                    className="w-10 shrink-0 text-muted-foreground tabular-nums"
                    style={{ fontSize: '0.85rem' }}
                  >
                    {c.index}
                  </span>
                  <span
                    className={cn(
                      'line-clamp-1 flex-1',
                      isRead ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {tl(c.title)}
                  </span>
                  <span
                    className="hidden shrink-0 text-muted-foreground sm:block"
                    style={{ fontSize: '0.78rem' }}
                  >
                    {c.publishedAt}
                  </span>
                  {isRead && <Check className="size-4 shrink-0 text-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
