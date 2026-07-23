import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary } from '../../data/types';
import { useLocalized } from '../../hooks/useLocalized';
import { useReaderSettings } from './ReaderSettingsContext';
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

const DARK_READER_THEMES = ['dark', 'ocean', 'oled'];

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
  const { settings } = useReaderSettings();

  const isDarkReader = DARK_READER_THEMES.includes(settings.theme);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--reader-bg) 95%, transparent)',
        borderColor: 'color-mix(in srgb, var(--reader-fg) 15%, transparent)',
        color: 'var(--reader-fg)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex <= 1}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-all duration-150 shrink-0 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--reader-fg) 20%, transparent)',
            color: 'var(--reader-fg)',
          }}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">{t('reader.prevChapter')}</span>
        </button>

        <div className="flex-1">
          <Select value={String(currentIndex)} onValueChange={(v) => onJump(Number(v))}>
            <SelectTrigger
              className="mx-auto w-full max-w-xs text-xs font-semibold rounded-xl border transition-all"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--reader-fg) 20%, transparent)',
                color: 'var(--reader-fg)',
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={cn(
                'max-h-72 border shadow-2xl z-[100] opacity-100',
                isDarkReader ? 'reader-dark-dropdown !bg-[#18181b] !border-white/20' : 'reader-light-dropdown !bg-white !border-black/15',
              )}
              style={{
                backgroundColor: isDarkReader ? '#18181b' : '#ffffff',
                borderColor: isDarkReader ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                color: isDarkReader ? '#ffffff' : '#0f172a',
                opacity: 1,
              }}
            >
              {chapters.map((c) => (
                <SelectItem
                  key={c.id}
                  value={String(c.index)}
                  className={cn(
                    'text-xs cursor-pointer font-medium transition-all py-2 px-3 rounded-lg my-0.5',
                    isDarkReader
                      ? '!text-white focus:!bg-white/20 focus:!text-white data-[state=checked]:!bg-white/25 data-[state=checked]:!text-white'
                      : '!text-slate-900 focus:!bg-black/10 focus:!text-slate-900 data-[state=checked]:!bg-black/10 data-[state=checked]:!text-slate-900',
                  )}
                  style={{
                    color: isDarkReader ? '#ffffff' : '#0f172a',
                  }}
                >
                  <span
                    className="font-medium"
                    style={{
                      color: isDarkReader ? '#ffffff' : '#0f172a',
                    }}
                  >
                    {tl(c.title)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= total}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-all duration-150 shrink-0 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--reader-fg) 20%, transparent)',
            color: 'var(--reader-fg)',
          }}
        >
          <span className="hidden sm:inline">{t('reader.nextChapter')}</span>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
