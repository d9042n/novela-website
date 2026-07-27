import { Link } from 'react-router';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../data/types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { displayTitle } from '../data/format';

interface NovelCardProps {
  novel: Novel;
  variant?: 'card' | 'list';
  className?: string;
}

// TODO(i18n-content): title/author/genre hiện đơn ngữ VN (backend chỉ có VN).
export function NovelCard({ novel, variant = 'card', className }: NovelCardProps) {
  const { t } = useTranslation();
  const firstGenre = novel.genres[0];
  const authorName = novel.authors[0]?.name ?? '';
  const scoreText = novel.score != null ? novel.score.toFixed(1) : '—';
  // 5323/6288 truyện trong DB có title = '' (source metruyenhot chưa lấy được
  // tiêu đề). Không có nhãn thay thế thì card là một khung trống, không đọc ra
  // được là truyện hay là lỗi giao diện.
  const title = displayTitle(novel.title, t('common.untitled'));

  if (variant === 'list') {
    return (
      <Link
        to={`/novel/${novel.slug}`}
        className={cn('group flex items-center gap-4 py-4', className)}
        aria-label={title}
      >
        <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-sm">
          <ImageWithFallback
            src={novel.cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3
            className="line-clamp-1 transition-colors group-hover:text-primary"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.25 }}
          >
            {title}
          </h3>
          <p className="line-clamp-1 text-muted-foreground" style={{ fontSize: '0.88rem' }}>
            {authorName}
          </p>
          <p className="line-clamp-1 text-muted-foreground" style={{ fontSize: '0.82rem' }}>
            {novel.description}
          </p>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
          {novel.score != null && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span style={{ fontSize: '0.82rem' }}>{scoreText}</span>
            </span>
          )}
          <Badge variant="secondary">{t(`status.${novel.status}`)}</Badge>
          {firstGenre && (
            <span
              className="uppercase text-muted-foreground"
              style={{ fontSize: '0.66rem', letterSpacing: '0.1em' }}
            >
              {firstGenre.name}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/novel/${novel.slug}`}
      className={cn('group flex flex-col gap-2', className)}
      aria-label={title}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
        <div className="aspect-[2/3] w-full">
          <ImageWithFallback
            src={novel.cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {novel.score != null && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-white backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span style={{ fontSize: '0.75rem' }}>{scoreText}</span>
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 bg-black/60 text-white backdrop-blur-sm"
        >
          {t(`status.${novel.status}`)}
        </Badge>
      </div>

      <div className="flex flex-col gap-0.5">
        <h3
          className="line-clamp-1 transition-colors group-hover:text-primary"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.25 }}
        >
          {title}
        </h3>
        {/* Giữ chỗ khi thiếu author/genre để đáy card thẳng hàng trong lưới. */}
        <p className="line-clamp-1 text-muted-foreground" style={{ fontSize: '0.85rem' }}>
          {authorName || ' '}
        </p>
        <span
          className="mt-0.5 uppercase text-muted-foreground"
          style={{ fontSize: '0.68rem', letterSpacing: '0.1em' }}
        >
          {firstGenre?.name ?? ' '}
        </span>
      </div>
    </Link>
  );
}
