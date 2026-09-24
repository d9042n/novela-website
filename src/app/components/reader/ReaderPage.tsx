import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Chapter, Novel } from '../../data/types';
import { getChapter, getNovelBySlug } from '../../data/api';
import { ApiError } from '../../data/client';
import { getProgress, saveProgress } from '../../hooks/useReadingProgress';
import { putReadingProgress } from '../../data/libraryApi';
import { recordStoryView } from '../../data/trackingApi';
import { useAuth } from '../../auth/AuthContext';
import { useReaderSettings } from './ReaderSettingsContext';
import { ReaderToolbar } from './ReaderToolbar';
import { ReaderControls } from './ReaderControls';
import { ChapterSkeleton } from './ChapterSkeleton';
import { fontCssVar, widthPx } from '../../theme/config';
import { NotFoundPage } from '../NotFoundPage';
import { Button } from '../ui/button';
import { BookOpen, Minimize2, Sparkles } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { ReaderDrawerLayout } from './ReaderDrawerLayout';
import { displayTitle, formatChapterTitle } from '../../data/format';
import { QuoteCardModal } from './QuoteCardModal';
import { calculateReadTime } from './readingUtils';

// TODO(i18n-content): tiêu đề chương + nội dung đơn ngữ VN (backend chỉ có VN).
export function ReaderPage() {
  const { slug = '', chapterNo = '1' } = useParams();
  const no = Number(chapterNo) || 1;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, zenMode, setZenMode, toggleZenMode } = useReaderSettings();
  const { readerPagePreset } = useTheme();
  const { user } = useAuth();

  const [novel, setNovel] = useState<Novel | undefined | null>(undefined);
  const [chapter, setChapter] = useState<Chapter | undefined | null>(undefined);
  const [loadError, setLoadError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);

  // Quote Card state
  const [selectedText, setSelectedText] = useState('');
  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Phím tắt Zen Mode (Escape / Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape' && zenMode) {
        setZenMode(false);
      } else if (e.key.toLowerCase() === 'z' && !(e.metaKey || e.ctrlKey || e.altKey)) {
        toggleZenMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zenMode, setZenMode, toggleZenMode]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelectionPos(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length > 5) {
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setSelectionPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
      } catch {
        setSelectionPos(null);
      }
    } else {
      setSelectionPos(null);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  const paged = settings.layout === 'paged' || readerPagePreset === 'paged';

  // Load novel (title + tổng số chương cho nhãn tiến độ).
  useEffect(() => {
    let active = true;
    setLoadError(false);
    getNovelBySlug(slug)
      .then((n) => active && setNovel(n))
      .catch((err) => {
        if (!active) return;
        // Chỉ 404 -> truyện không tồn tại (NotFound). Lỗi khác (500/network) -> retry.
        if (err instanceof ApiError && err.status === 404) setNovel(null);
        else setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  // Load nội dung chương hiện tại (kèm prev_no/next_no cho điều hướng).
  useEffect(() => {
    let active = true;
    setChapter(undefined);
    setLoadError(false);
    getChapter(slug, no)
      .then((c) => active && setChapter(c))
      .catch((err) => {
        if (!active) return;
        // 400 (no không hợp lệ) / 404 (không tồn tại) -> trang không thấy.
        // Lỗi khác (500/network) -> retry, KHÔNG giả làm NotFound.
        if (err instanceof ApiError && (err.status === 404 || err.status === 400)) setChapter(null);
        else setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [slug, no]);

  const total = novel?.chapterCount ?? 0;
  const prevNo = chapter?.prevNo ?? null;
  const nextNo = chapter?.nextNo ?? null;

  // Điều hướng chương dùng prev_no/next_no THẬT (D5: chapter_no KHÔNG liên tục).
  const goToNo = useCallback(
    (target: number | null) => {
      if (target != null) navigate(`/novel/${slug}/chapter/${target}`);
    },
    [navigate, slug],
  );

  // Scroll -> progress + save + chrome auto-hide.
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

  // Save progress (debounced).
  useEffect(() => {
    const id = setTimeout(() => {
      if (chapter) saveProgress({ slug, chapterNo: no, scroll: progress, updatedAt: Date.now() });
    }, 400);
    return () => clearTimeout(id);
  }, [slug, no, progress, chapter]);

  // Đẩy tiến độ lên server (chapter_no + scroll_percent).
  //
  // Dùng trailing debounce 2s khi cuộn để không bắn bão request mạng, nhưng vẫn
  // kịp lưu vị trí đọc dở lên database của Core khi người dùng dừng đọc hoặc đổi máy.
  //
  // Fire-and-forget: sync hỏng (mất mạng, 404 vì chapter_no lệch ở truyện dạng
  // quyển) tuyệt đối không được làm gián đoạn việc đọc.
  useEffect(() => {
    if (!chapter || !user) return;
    const scrollPercent = progress > 0.01 ? progress * 100 : 0;
    const id = setTimeout(() => {
      void putReadingProgress(slug, no, scrollPercent).catch(() => {
        /* im lặng có chủ ý */
      });
    }, 2000);
    return () => clearTimeout(id);
  }, [slug, no, progress, chapter, user]);

  // Ghi một lượt xem cho truyện. Server tự dedup theo khách/ngày nên gọi lại khi
  // user nhảy chương cũng không cộng thêm; đếm theo TRUYỆN không theo chương.
  useEffect(() => {
    void recordStoryView(slug);
  }, [slug]);

  // Restore scroll khi mở đúng chương đang đọc dở.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !chapter) return;
    const saved = getProgress(slug);
    el.scrollTo({ top: 0, left: 0 });
    if (saved && saved.chapterNo === no && saved.scroll > 0.02) {
      requestAnimationFrame(() => {
        if (paged) el.scrollLeft = saved.scroll * (el.scrollWidth - el.clientWidth);
        else el.scrollTop = saved.scroll * (el.scrollHeight - el.clientHeight);
      });
    }
    setChromeVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, no, slug, settings.layout, settings.width, settings.fontSize]);

  // Keyboard nav (prev_no/next_no).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToNo(prevNo);
      else if (e.key === 'ArrowRight') goToNo(nextNo);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToNo, prevNo, nextNo]);

  if (loadError) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <p className="mb-4 opacity-70">{t('common.loadError')}</p>
          <Button onClick={() => navigate(0)}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }
  if (novel === null) return <NotFoundPage />;
  if (chapter === null) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-4">
        <div className="text-center max-w-md">
          <BookOpen className="size-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h2 className="text-xl font-bold mb-2">
            {t('reader.chapterNotReady', 'Chương chưa có nội dung')}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {t('reader.chapterNotReadyDesc', 'Nội dung chương này chưa được thu thập hoặc đang trong quá trình xử lý. Vui lòng chọn chương khác.')}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(`/novel/${slug}`)}>
              {t('novel.info', 'Chi tiết truyện')}
            </Button>
            {prevNo != null && (
              <Button onClick={() => goToNo(prevNo)}>
                {t('reader.prevChapter', 'Chương trước')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (readerPagePreset === 'drawer' && novel && chapter) {
    return (
      <ReaderDrawerLayout
        novel={novel}
        chapter={chapter}
        currentNo={no}
        total={total}
        prevNo={prevNo}
        nextNo={nextNo}
        goToNo={goToNo}
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

      {/* Nút thoát Zen Mode khi đang bật */}
      {zenMode && (
        <button
          type="button"
          onClick={() => setZenMode(false)}
          className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 border border-border/70 text-xs font-semibold shadow-lg backdrop-blur-md hover:bg-accent transition-all opacity-40 hover:opacity-100 cursor-pointer"
          title={t('zenMode.hint')}
        >
          <Minimize2 className="size-3.5 text-primary" />
          <span>{t('zenMode.exit')}</span>
          <kbd className="text-[10px] font-mono opacity-70 ml-1">Esc</kbd>
        </button>
      )}

      {novel && !zenMode && (
        <ReaderToolbar novel={novel} chapter={chapter} visible={chromeVisible} />
      )}

      {/* Vùng đọc */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseUp={handleMouseUp}
        onClick={() => {
          if (!zenMode) setChromeVisible((v) => !v);
        }}
        className={paged ? 'flex-1 overflow-x-auto overflow-y-hidden' : 'flex-1 overflow-y-auto'}
        style={{ scrollBehavior: 'smooth' }}
      >
        {!chapter ? (
          <ChapterSkeleton maxWidth={maxWidth} />
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
              <ChapterBody chapter={chapter} align={settings.align ?? 'justify'} />
            </div>
          </div>
        ) : (
          <div className="mx-auto px-5 py-20 sm:px-6" style={{ maxWidth: `${maxWidth}px` }}>
            <div style={contentStyle}>
              <ChapterBody chapter={chapter} align={settings.align ?? 'justify'} />
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
                disabled={prevNo == null}
                onClick={() => goToNo(prevNo)}
              >
                {t('reader.prevChapter')}
              </Button>
              <span className="opacity-70 font-medium" style={{ fontSize: '0.85rem' }}>
                {t('reader.chapterOf', { index: no, total })}
              </span>
              <Button
                variant="outline"
                className="font-semibold shadow-none border hover:opacity-85 disabled:opacity-30"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
                  color: 'var(--reader-fg)',
                  borderColor: 'color-mix(in srgb, var(--reader-fg) 18%, transparent)',
                }}
                disabled={nextNo == null}
                onClick={() => goToNo(nextNo)}
              >
                {t('reader.nextChapter')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {novel && !zenMode && (
        <ReaderControls
          slug={slug}
          currentNo={no}
          currentTitle={chapter ? formatChapterTitle(chapter.chapterNo, chapter.title) : `${t('reader.chapter', 'Chương')} ${no}`}
          total={total}
          prevNo={prevNo}
          nextNo={nextNo}
          onPrev={() => goToNo(prevNo)}
          onNext={() => goToNo(nextNo)}
          onJump={(target) => goToNo(target)}
          visible={chromeVisible}
        />
      )}

      {/* Floating Action Button khi bôi đen chữ */}
      {selectionPos && selectedText.length > 5 && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${selectionPos.x}px`, top: `${selectionPos.y}px` }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuoteModalOpen(true);
              setSelectionPos(null);
            }}
            className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/95 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xl backdrop-blur-md hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            <span>{t('quoteCard.action')}</span>
          </button>
        </div>
      )}

      {/* Quote Card Generator Modal */}
      {novel && (
        <QuoteCardModal
          open={quoteModalOpen}
          onOpenChange={setQuoteModalOpen}
          quoteText={selectedText}
          novelTitle={displayTitle(novel.title, t('common.untitled'))}
          authorName={novel.authors[0]?.name}
          chapterNo={chapter?.chapterNo}
        />
      )}
    </div>
  );
}

function ChapterBody({ chapter, align }: { chapter: Chapter; align: 'justify' | 'left' }) {
  const { t } = useTranslation();
  const displayTitle = formatChapterTitle(chapter.chapterNo, chapter.title);
  const readTime = calculateReadTime(chapter.content || '');

  // Khử rác scraper: loại bỏ dòng gạch ngang '____', '----', khoảng trắng thừa
  const cleanedParagraphs = useMemo(() => {
    return chapter.paragraphs
      .map((p) => {
        let cleaned = p
          .replace(/_{3,}/g, '')
          .replace(/-{3,}/g, '')
          .replace(/\*{3,}/g, '')
          .replace(/[ \t]{2,}/g, ' ')
          .trim();
        return cleaned;
      })
      .filter((p) => p.length > 0);
  }, [chapter.paragraphs]);

  return (
    <article>
      <h1 style={{ fontSize: '1.6em', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.6rem' }}>
        {displayTitle}
      </h1>
      <div className="flex items-center gap-2 mb-8 pb-3 border-b border-current/15 opacity-65 text-xs font-mono">
        <span>{t('readingTime.badge', { minutes: readTime.minutes, words: readTime.words.toLocaleString() })}</span>
      </div>
      {cleanedParagraphs.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground italic">
          Nội dung chương đang được cập nhật...
        </p>
      ) : (
        cleanedParagraphs.map((p, i) => (
          <p key={i} style={{ marginBottom: '1.1em', textAlign: align }}>
            {p}
          </p>
        ))
      )}
    </article>
  );
}
