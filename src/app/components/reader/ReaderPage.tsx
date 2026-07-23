import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Chapter, ChapterSummary, Novel } from '../../data/types';
import { getChapter, getChapterList, getNovelById } from '../../data/api';
import { getProgress, saveProgress } from '../../hooks/useReadingProgress';
import { useLocalized } from '../../hooks/useLocalized';
import { useReaderSettings } from './ReaderSettingsContext';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderControls } from './ReaderControls';
import { fontCssVar, widthPx } from '../../theme/config';
import { NotFoundPage } from '../NotFoundPage';
import { Button } from '../ui/button';
import { useTheme } from '../../theme/ThemeProvider';
import { ReaderDrawerLayout } from './ReaderDrawerLayout';

export function ReaderPage() {
  const { novelId = '', chapterIndex = '1' } = useParams();
  const index = Number(chapterIndex) || 1;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  const { settings } = useReaderSettings();
  const { readerPagePreset } = useTheme();

  const [novel, setNovel] = useState<Novel | undefined | null>(undefined);
  const [chapter, setChapter] = useState<Chapter | undefined | null>(undefined);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [progress, setProgress] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  const paged = settings.layout === 'paged' || readerPagePreset === 'paged';

  // Load data
  useEffect(() => {
    let active = true;
    getNovelById(novelId).then((n) => active && setNovel(n ?? null));
    getChapterList(novelId).then((c) => active && setChapters(c));
    return () => {
      active = false;
    };
  }, [novelId]);

  useEffect(() => {
    let active = true;
    setChapter(undefined);
    getChapter(novelId, index).then((c) => active && setChapter(c ?? null));
    return () => {
      active = false;
    };
  }, [novelId, index]);

  const total = novel?.chapterCount ?? 0;

  const goToChapter = useCallback(
    (target: number) => {
      if (target >= 1 && target <= total) {
        navigate(`/novel/${novelId}/chapter/${target}`);
      }
    },
    [navigate, novelId, total],
  );

  // Scroll → progress + save + chrome auto-hide
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = paged
      ? el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)
      : el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    const clamped = Math.min(1, Math.max(0, ratio || 0));
    setProgress(clamped);

    if (!paged) {
      const st = el.scrollTop;
      if (st > lastScrollTop.current + 8 && st > 80) setChromeVisible(false);
      else if (st < lastScrollTop.current - 8) setChromeVisible(true);
      lastScrollTop.current = st;
    }
  }, [paged]);

  // Save progress (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      if (chapter) saveProgress({ novelId, chapterIndex: index, scroll: progress, updatedAt: Date.now() });
    }, 400);
    return () => clearTimeout(id);
  }, [novelId, index, progress, chapter]);

  // Restore scroll position khi mở đúng chương đang đọc dở
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !chapter) return;
    const saved = getProgress(novelId);
    el.scrollTo({ top: 0, left: 0 });
    if (saved && saved.chapterIndex === index && saved.scroll > 0.02) {
      requestAnimationFrame(() => {
        if (paged) el.scrollLeft = saved.scroll * (el.scrollWidth - el.clientWidth);
        else el.scrollTop = saved.scroll * (el.scrollHeight - el.clientHeight);
      });
    }
    setChromeVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, index, novelId, settings.layout, settings.width, settings.fontSize]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToChapter(index - 1);
      else if (e.key === 'ArrowRight') goToChapter(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToChapter, index]);

  if (novel === null || chapter === null) return <NotFoundPage />;

  if (readerPagePreset === 'drawer' && novel && chapter) {
    return (
      <ReaderDrawerLayout
        novel={novel}
        chapter={chapter}
        chapters={chapters}
        currentIndex={index}
        total={total}
        goToChapter={goToChapter}
        progress={progress}
        scrollRef={scrollRef}
        onScroll={handleScroll}
      />
    );
  }

  const maxWidth = settings.layout === 'wide' ? 960 : widthPx(settings.width);
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
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: 'var(--reader-bg)', color: 'var(--reader-fg)' }}
    >
      {/* Thanh tiến độ trên cùng */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1">
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${progress * 100}%`, backgroundColor: 'var(--primary, #4f46e5)' }}
        />
      </div>

      {novel && chapter && (
        <ReaderToolbar novel={novel} chapter={chapter} chapters={chapters} visible={chromeVisible} />
      )}

      {/* Vùng đọc */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onClick={() => setChromeVisible((v) => !v)}
        className={paged ? 'flex-1 overflow-x-auto overflow-y-hidden' : 'flex-1 overflow-y-auto'}
        style={{ scrollBehavior: 'smooth' }}
      >
        {!chapter ? (
          <div className="grid h-full place-items-center opacity-60">{t('common.loading')}</div>
        ) : paged ? (
          <div className="h-full px-5 py-16 sm:px-8">
            <div
              style={{
                ...contentStyle,
                height: '100%',
                columnWidth: `${maxWidth}px`,
                columnGap: '3rem',
              }}
            >
              <ChapterBody chapter={chapter} title={tl(chapter.title)} align={settings.align ?? 'justify'} />
            </div>
          </div>
        ) : (
          <div className="mx-auto px-5 py-20 sm:px-6" style={{ maxWidth: `${maxWidth}px` }}>
            <div style={contentStyle}>
              <ChapterBody chapter={chapter} title={tl(chapter.title)} align={settings.align ?? 'justify'} />
            </div>

            {/* Điều hướng cuối chương */}
            <div className="mt-12 flex items-center justify-between gap-3 pt-6 border-t" style={{ borderColor: 'color-mix(in srgb, var(--reader-fg) 15%, transparent)' }}>
              <Button
                variant="outline"
                className="font-semibold shadow-none border hover:opacity-85 disabled:opacity-30"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
                  color: 'var(--reader-fg)',
                  borderColor: 'color-mix(in srgb, var(--reader-fg) 18%, transparent)',
                }}
                disabled={index <= 1}
                onClick={() => goToChapter(index - 1)}
              >
                {t('reader.prevChapter')}
              </Button>
              <span className="opacity-70 font-medium" style={{ fontSize: '0.85rem' }}>
                {t('reader.chapterOf', { index, total })}
              </span>
              <Button
                variant="outline"
                className="font-semibold shadow-none border hover:opacity-85 disabled:opacity-30"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
                  color: 'var(--reader-fg)',
                  borderColor: 'color-mix(in srgb, var(--reader-fg) 18%, transparent)',
                }}
                disabled={index >= total}
                onClick={() => goToChapter(index + 1)}
              >
                {t('reader.nextChapter')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {novel && chapter && (
        <ReaderControls
          chapters={chapters}
          currentIndex={index}
          total={total}
          onPrev={() => goToChapter(index - 1)}
          onNext={() => goToChapter(index + 1)}
          onJump={goToChapter}
          visible={chromeVisible}
        />
      )}
    </div>
  );
}

function ChapterBody({ chapter, title, align }: { chapter: Chapter; title: string; align: 'justify' | 'left' }) {
  const { t: tl } = useLocalized();
  return (
    <article>
      <h1 style={{ fontSize: '1.6em', fontWeight: 600, lineHeight: 1.3, marginBottom: '1.5rem' }}>
        {title}
      </h1>
      {chapter.paragraphs.map((p, i) => (
        <p key={i} style={{ marginBottom: '1.1em', textAlign: align }}>
          {tl(p)}
        </p>
      ))}
    </article>
  );
}
