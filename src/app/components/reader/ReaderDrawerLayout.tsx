import { Link } from 'react-router';
import { ChevronLeft, List, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Chapter, ChapterSummary, Novel } from '../../data/types';
import { useLocalized } from '../../hooks/useLocalized';
import { useReaderSettings } from './ReaderSettingsContext';
import { fontCssVar, widthPx } from '../../theme/config';
import { Button } from '../ui/button';
import { ReaderSettingsPanel } from './ReaderSettingsPanel';

interface ReaderDrawerLayoutProps {
  novel: Novel;
  chapter: Chapter;
  chapters: ChapterSummary[];
  currentIndex: number;
  total: number;
  goToChapter: (idx: number) => void;
  progress: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export function ReaderDrawerLayout({
  novel,
  chapter,
  chapters,
  currentIndex,
  total,
  goToChapter,
  progress,
  scrollRef,
  onScroll,
}: ReaderDrawerLayoutProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  const { settings } = useReaderSettings();

  const maxWidth = widthPx(settings.width);
  const contentStyle: React.CSSProperties = {
    fontFamily: fontCssVar(settings.font),
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    letterSpacing: `${settings.letterSpacing ?? 0}px`,
    wordSpacing: `${settings.wordSpacing ?? 0}px`,
    color: 'var(--reader-fg)',
  };

  return (
    <div
      data-reader-theme={settings.theme}
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--reader-bg)', color: 'var(--reader-fg)' }}
    >
      {/* Top progress bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1">
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${progress * 100}%`, backgroundColor: 'var(--primary, #4f46e5)' }}
        />
      </div>

      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border/40 px-4 bg-background/50 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link to={`/novel/${novel.id}`} className="flex items-center gap-1 text-xs font-semibold hover:opacity-80">
            <ChevronLeft className="size-4" />
            <span className="truncate max-w-[180px] sm:max-w-xs">{tl(novel.title)}</span>
          </Link>
        </div>

        <div className="text-xs font-medium opacity-75">
          {t('reader.chapterOf', { index: currentIndex, total })}
        </div>
      </header>

      {/* 3-Column Split Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left TOC Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border/40 bg-background/30 p-3 overflow-y-auto shrink-0 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold uppercase tracking-wider opacity-70 border-b border-border/30 pb-2">
            <List className="size-4 text-primary" />
            <span>{t('novel.chapterList')}</span>
          </div>

          <div className="space-y-0.5 text-xs">
            {chapters.map((c) => (
              <button
                key={c.index}
                type="button"
                onClick={() => goToChapter(c.index)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors truncate ${
                  c.index === currentIndex
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {c.index}. {tl(c.title)}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Main Reader Content */}
        <main ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-6 py-12">
          <div className="mx-auto" style={{ maxWidth: `${maxWidth}px` }}>
            <article style={contentStyle}>
              <h1 style={{ fontSize: '1.6em', fontWeight: 600, lineHeight: 1.3, marginBottom: '1.5rem' }}>
                {tl(chapter.title)}
              </h1>
              {chapter.paragraphs.map((p, i) => (
                <p key={i} style={{ marginBottom: '1.1em', textAlign: settings.align ?? 'justify' }}>
                  {tl(p)}
                </p>
              ))}
            </article>

            {/* Bottom Nav */}
            <div className="mt-12 flex items-center justify-between gap-3 pt-6 border-t" style={{ borderColor: 'color-mix(in srgb, var(--reader-fg) 15%, transparent)' }}>
              <button
                type="button"
                disabled={currentIndex <= 1}
                onClick={() => goToChapter(currentIndex - 1)}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold border transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--reader-fg) 18%, transparent)',
                  color: 'var(--reader-fg)',
                }}
              >
                {t('reader.prevChapter')}
              </button>
              <button
                type="button"
                disabled={currentIndex >= total}
                onClick={() => goToChapter(currentIndex + 1)}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold border transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--reader-fg) 18%, transparent)',
                  color: 'var(--reader-fg)',
                }}
              >
                {t('reader.nextChapter')}
              </button>
            </div>
          </div>
        </main>

        {/* Right Settings Sidebar (Desktop) */}
        <aside className="hidden xl:flex w-80 flex-col border-l border-border/40 bg-background/30 p-4 overflow-y-auto shrink-0 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70 border-b border-border/30 pb-2">
            <Settings2 className="size-4 text-primary" />
            <span>{t('reader.settings')}</span>
          </div>

          <ReaderSettingsPanel />
        </aside>
      </div>
    </div>
  );
}
