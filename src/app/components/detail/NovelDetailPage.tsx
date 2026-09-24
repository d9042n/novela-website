import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BookmarkButton } from './BookmarkButton';
import { RouterLink } from '../ui/router-link';
import { BookOpen, Play, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { getChapterList, getNovelBySlug } from '../../data/api';
import { ApiError } from '../../data/client';
import { getProgress } from '../../hooks/useReadingProgress';
import { recordStoryView } from '../../data/trackingApi';
import { displayTitle, formatDate } from '../../data/format';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { NotFoundPage } from '../NotFoundPage';
import { ChapterList } from './ChapterList';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { NovelDetailSkeleton } from './NovelDetailSkeleton';
import { useTheme } from '../../theme/ThemeProvider';
import { DetailCinematicLayout } from './DetailCinematicLayout';
import { DetailMinimalLayout } from './DetailMinimalLayout';
import { AmbientCoverGlow } from '../visual/AmbientCoverGlow';

// TODO(i18n-content): title/author/genre/description đơn ngữ VN (backend chỉ có VN).
export function NovelDetailPage() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const { detailPreset } = useTheme();
  const [novel, setNovel] = useState<Novel | undefined | null>(undefined);
  /** true khi lỗi KHÁC 404 (network/500/timeout) — hiện retry, KHÔNG phải NotFound. */
  const [loadError, setLoadError] = useState(false);
  /** chapter_no nhỏ nhất (điểm "đọc từ đầu" — chapter_no có thể không bắt đầu ở 1). */
  const [firstChapterNo, setFirstChapterNo] = useState<number>(1);
  const lastRead = getProgress(slug);

  // Ghi một lượt xem. Server dedup theo khách/ngày nên mở lại truyện trong ngày
  // không cộng thêm; đây là đường ghi duy nhất cho `view_count` (backend Go
  // SELECT-only nên không tự tăng được).
  useEffect(() => {
    void recordStoryView(slug);
  }, [slug]);

  useEffect(() => {
    let active = true;
    setNovel(undefined);
    setLoadError(false);
    getNovelBySlug(slug)
      .then((n) => active && setNovel(n))
      .catch((err) => {
        if (!active) return;
        // CHỈ 404 mới là "không tồn tại" (→ NotFound). Lỗi khác (network/500/
        // timeout) giữ novel=undefined + bật loadError để hiện nút thử lại,
        // không che thành NotFound làm truyện đang sống trông như đã mất.
        if (err instanceof ApiError && err.status === 404) {
          setNovel(null);
        } else {
          setLoadError(true);
        }
      });
    // Lấy chapter_no đầu tiên (asc) để "đọc từ đầu" đúng, không giả định = 1.
    getChapterList(slug, { size: 1, order: 'asc' })
      .then((res) => active && res.items[0] && setFirstChapterNo(res.items[0].chapterNo))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  if (novel === null) return <NotFoundPage />;
  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="mb-4 text-muted-foreground">{t('common.loadError')}</p>
        <Button onClick={() => window.location.reload()}>{t('common.retry')}</Button>
      </div>
    );
  }
  if (!novel) {
    return <NovelDetailSkeleton preset={detailPreset} />;
  }

  const readTarget = lastRead ? lastRead.chapterNo : firstChapterNo;
  // getProgress returns undefined for a story never opened, but the preset
  // layouts type their prop as `... | null` (one explicit "nothing here" value
  // instead of two). Normalise once, here, rather than widening their props.
  const lastReadOrNull = lastRead ?? null;
  const scoreText = novel.score != null ? novel.score.toFixed(1) : '—';
  const chapterCount = novel.chapterCount ?? 0;
  // 5323/6288 truyện trong DB có title = '' (source metruyenhot chưa lấy được
  // tiêu đề). Không có nhãn thay thế thì <h1> rỗng và trang trông như lỗi.
  const title = displayTitle(novel.title, t('common.untitled'));

  if (detailPreset === 'cinematic') {
    return (
      <DetailCinematicLayout
        novel={novel}
        readTarget={readTarget}
        firstChapterNo={firstChapterNo}
        lastRead={lastReadOrNull}
      />
    );
  }

  if (detailPreset === 'minimal') {
    return (
      <DetailMinimalLayout
        novel={novel}
        readTarget={readTarget}
        firstChapterNo={firstChapterNo}
        lastRead={lastReadOrNull}
      />
    );
  }

  // Classic Split Column Layout
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header truyện */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="mx-auto w-44 shrink-0 sm:mx-0">
          <AmbientCoverGlow src={novel.cover} intensity="vibrant">
            <div className="overflow-hidden rounded-xl border border-border shadow-lg ring-1 ring-black/5 dark:ring-white/10">
              <div className="aspect-[2/3]">
                <ImageWithFallback
                  src={novel.cover}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </AmbientCoverGlow>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-2 flex flex-wrap gap-2">
            {novel.genres.map((g) => (
              <Link key={g.slug} to={`/browse?genre=${g.slug}`}>
                <Badge variant="secondary" className="cursor-pointer">
                  {g.name}
                </Badge>
              </Link>
            ))}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {title}
          </h1>
          <p className="mt-2 text-muted-foreground" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.05rem' }}>
            {novel.authors[0]?.name ?? ''}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Badge>{t(`status.${novel.status}`)}</Badge>
            <span className="text-muted-foreground" style={{ fontSize: '0.85rem' }}>
              {t('novel.updated')}: {formatDate(novel.updatedAt)}
            </span>
          </div>

          <div className="mt-5 flex gap-6">
            {[
              { icon: Star, value: scoreText, label: t('novel.rating') },
              { icon: BookOpen, value: chapterCount, label: t('novel.chapters') },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Icon className="size-4 text-primary" />
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
                <span className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <RouterLink to={`/novel/${novel.slug}/chapter/${readTarget}`}>
                <Play className="size-4" />
                {lastRead
                  ? (lastRead.scroll && lastRead.scroll > 0.05
                      ? t('actions.continueReadingPercent', { index: readTarget, percent: Math.round(lastRead.scroll * 100) })
                      : t('actions.continueReading', { index: readTarget }))
                  : t('actions.readFromStart')}
              </RouterLink>
            </Button>
            {lastRead && (
              <Button asChild size="lg" variant="outline">
                <RouterLink to={`/novel/${novel.slug}/chapter/${firstChapterNo}`}>{t('actions.readFromStart')}</RouterLink>
              </Button>
            )}
            <BookmarkButton slug={novel.slug} />
          </div>
        </div>
      </div>

      {/* Tabs: Info / Chapters */}
      <Tabs defaultValue="chapters" className="mt-8">
        {/* w-full + min-w-0 + truncate: TabsTrigger dùng chung có whitespace-nowrap,
            nên ở 320px hai nhãn ("Danh sách chương (4)" + "Thông tin chi tiết")
            cộng lại rộng hơn container và đẩy tràn ngang 8px (đo được: scrollWidth
            328 trên viewport 320). w-fit mặc định để list phình theo chữ; w-full
            buộc nó theo container, min-w-0 cho trigger co, truncate cắt chữ thay
            vì đẩy tràn. Sửa ở đây chứ không sửa ui/tabs.tsx — đó là component
            dùng chung, đổi nó là đổi mọi tab trên site. */}
        <TabsList className="w-full">
          <TabsTrigger value="chapters" className="min-w-0">
            <span className="truncate">
              {t('novel.chapterList')} ({chapterCount})
            </span>
          </TabsTrigger>
          <TabsTrigger value="info" className="min-w-0">
            <span className="truncate">{t('novel.info')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="mt-4">
          <ChapterList slug={novel.slug} total={novel.chapterCount} lastReadNo={lastRead?.chapterNo} />
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <h2 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600 }}>
            {t('novel.description')}
          </h2>
          <p className="max-w-2xl whitespace-pre-line leading-relaxed text-foreground/90">
            {novel.description}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
