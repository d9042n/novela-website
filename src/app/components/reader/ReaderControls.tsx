import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary } from '../../data/types';
import { useLocalized } from '../../hooks/useLocalized';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';

interface ReaderControlsProps {
  chapters: ChapterSummary[];
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
  visible: boolean;
}

export function ReaderControls({
  chapters,
  currentIndex,
  total,
  onPrev,
  onNext,
  onJump,
  visible,
}: ReaderControlsProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--reader-bg) 88%, transparent)',
        borderColor: 'color-mix(in srgb, var(--reader-fg) 12%, transparent)',
        color: 'var(--reader-fg)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-4">
        <Button
          variant="outline"
          className="gap-1"
          onClick={onPrev}
          disabled={currentIndex <= 1}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">{t('reader.prevChapter')}</span>
        </Button>

        <div className="flex-1">
          <Select value={String(currentIndex)} onValueChange={(v) => onJump(Number(v))}>
            <SelectTrigger className="mx-auto w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {chapters.map((c) => (
                <SelectItem key={c.id} value={String(c.index)}>
                  {tl(c.title)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="gap-1"
          onClick={onNext}
          disabled={currentIndex >= total}
        >
          <span className="hidden sm:inline">{t('reader.nextChapter')}</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
