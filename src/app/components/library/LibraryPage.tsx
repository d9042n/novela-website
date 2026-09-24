import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BookMarked, RotateCcw, X } from 'lucide-react';
import { listBookmarks, listReadingProgress, removeBookmark, removeReadingProgress } from '../../data/libraryApi';
import type { Bookmark, ServerReadingProgress, StoryBrief } from '../../data/types';
import { displayTitle } from '../../data/format';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ReadingStreakWidget } from './ReadingStreakWidget';

const PAGE_SIZE = 24;

/**
 * Card cho `StoryBrief`.
 *
 * KHÔNG dùng lại `NovelCard` được: `NovelCard` nhận `Novel` với score /
 * ratingCount / authors / genres / chapterCount, còn core chỉ trả 6 field
 * (id, slug, title, cover_url, is_adult, status). Nhồi `Novel` giả với score
 * null + authors rỗng sẽ hiện "—" và hàng trống ở mọi card, xấu hơn là làm card
 * gọn đúng dữ liệu đang có.
 */
function BriefCard({
  story,
  caption,
  onRemove,
  removeLabel,
}: {
  story: StoryBrief;
  caption?: string;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  const { t } = useTranslation();
  const title = displayTitle(story.title, t('common.untitled'));

  return (
    <div className="group relative flex flex-col gap-2">
      <Link to={`/novel/${story.slug}`} className="flex flex-col gap-2" aria-label={title}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
          <ImageWithFallback
            src={story.cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3
          className="line-clamp-2 transition-colors group-hover:text-primary"
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 }}
        >
          {title}
        </h3>
        {caption && (
          <p className="line-clamp-1 text-muted-foreground" style={{ fontSize: '0.8rem' }}>
            {caption}
          </p>
        )}
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={removeLabel || t('actions.remove', 'Xoá')}
          aria-label={removeLabel || t('actions.remove', 'Xoá')}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-muted shadow-xs">
            <Skeleton className="size-full rounded-none" />
          </div>
          <div className="space-y-1 pt-0.5">
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-3.5 w-3/5 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tủ sách: truyện đã đánh dấu + truyện đang đọc (tiến độ lưu trên server).
 *
 * Route này đã bọc `RequireAuth` nên tới được đây là chắc chắn đã đăng nhập —
 * không cần kiểm tra `user` lần nữa.
 *
 * Hai tab tải ĐỘC LẬP, mỗi tab có loading/error riêng: một tab lỗi không được
 * làm trắng tab kia (cùng lý do `HomeViewModel` của mobile tách error per-rail).
 */
export function LibraryPage() {
  const { t } = useTranslation();

  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null);
  const [bookmarksError, setBookmarksError] = useState(false);

  const [progress, setProgress] = useState<ServerReadingProgress[] | null>(null);
  const [progressError, setProgressError] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let active = true;

    setBookmarks(null);
    setBookmarksError(false);
    listBookmarks({ size: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        setBookmarks(res.items);
      })
      .catch(() => {
        if (!active) return;
        setBookmarks([]);
        setBookmarksError(true);
      });

    setProgress(null);
    setProgressError(false);
    listReadingProgress({ size: PAGE_SIZE })
      .then((res) => {
        if (!active) return;
        setProgress(res.items);
      })
      .catch(() => {
        if (!active) return;
        setProgress([]);
        setProgressError(true);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRemoveBookmark = async (slug: string) => {
    setBookmarks((prev) => (prev ? prev.filter((b) => b.story.slug !== slug) : prev));
    try {
      await removeBookmark(slug);
      toast.success(t('library.removed', 'Đã bỏ đánh dấu truyện.'));
    } catch {
      toast.error(t('common.loadError', 'Có lỗi xảy ra, vui lòng thử lại.'));
      reload();
    }
  };

  const handleRemoveProgress = async (slug: string) => {
    setProgress((prev) => (prev ? prev.filter((p) => p.story.slug !== slug) : prev));
    try {
      await removeReadingProgress(slug);
      toast.success(t('library.progressRemoved', 'Đã xoá khỏi danh sách đang đọc.'));
    } catch {
      toast.error(t('common.loadError', 'Có lỗi xảy ra, vui lòng thử lại.'));
      reload();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-center gap-3">
        <BookMarked className="size-6 text-primary" />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          {t('library.title')}
        </h1>
      </div>

      {/* Chuỗi ngày đọc sách & Thói quen đọc */}
      <div className="mb-8">
        <ReadingStreakWidget />
      </div>

      <Tabs defaultValue="bookmarks">
        <TabsList className="mb-6">
          <TabsTrigger value="bookmarks">{t('library.bookmarks')}</TabsTrigger>
          <TabsTrigger value="reading">{t('library.reading')}</TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks">
          <Section
            error={bookmarksError}
            items={bookmarks}
            emptyText={t('library.empty')}
            errorText={t('common.loadError')}
            retryText={t('common.retry')}
            onRetry={reload}
          >
            {(list) => (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {list.map((b) => (
                  <BriefCard
                    key={b.story.slug}
                    story={b.story}
                    onRemove={() => handleRemoveBookmark(b.story.slug)}
                    removeLabel={t('library.remove', 'Bỏ đánh dấu')}
                  />
                ))}
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="reading">
          <Section
            error={progressError}
            items={progress}
            emptyText={t('library.emptyReading')}
            errorText={t('common.loadError')}
            retryText={t('common.retry')}
            onRetry={reload}
          >
            {(list) => (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {list.map((p) => (
                  <BriefCard
                    key={p.story.slug}
                    story={p.story}
                    caption={t('actions.continueReading', { index: p.chapter.chapterNo })}
                    onRemove={() => handleRemoveProgress(p.story.slug)}
                    removeLabel={t('library.removeProgress', 'Xoá tiến độ đọc')}
                  />
                ))}
              </div>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Bốn trạng thái TÁCH BIỆT theo thứ tự ưu tiên: lỗi -> đang tải -> rỗng -> có
 * dữ liệu. Gộp lỗi vào rỗng thì API chết hiện y hệt "tủ sách trống" và user đi
 * tìm truyện để thêm trong khi thứ họ cần là nút thử lại.
 */
function Section<T>({
  error,
  items,
  emptyText,
  errorText,
  retryText,
  onRetry,
  children,
}: {
  error: boolean;
  items: T[] | null;
  emptyText: string;
  errorText: string;
  retryText: string;
  onRetry: () => void;
  children: (items: T[]) => React.ReactNode;
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">{errorText}</p>
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw className="size-4" />
          {retryText}
        </Button>
      </div>
    );
  }
  if (items === null) return <GridSkeleton />;
  if (items.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">{emptyText}</p>;
  }
  return <>{children(items)}</>;
}
