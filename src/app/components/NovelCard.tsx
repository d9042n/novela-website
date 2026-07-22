import { Link } from 'react-router';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../data/types';
import { getGenre } from '../data/genres';
import { useLocalized } from '../hooks/useLocalized';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

interface NovelCardProps {
  novel: Novel;
  variant?: 'card' | 'list';
  className?: string;
}

export function NovelCard({ novel, variant = 'card', className }: NovelCardProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  const firstGenre = getGenre(novel.genreIds[0]);

  if (variant === 'list') {
    return (
      <Link
        to={`/novel/${novel.id}`}
        className={cn('group flex items-center gap-4 py-4', className)}
        aria-label={tl(novel.title)}
      >
        <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-sm">
          <ImageWithFallback
            src={novel.cover}
            alt={tl(novel.title)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3
            className="line-clamp-1 transition-colors group-hover:text-primary"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.25 }}
          >
            {tl(novel.title)}
          </h3>
          <p className="line-clamp-1 text-muted-foreground" style={{ fontSize: '0.88rem' }}>
            {tl(novel.author)}
          </p>
          <p className="line-clamp-1 text-muted-foreground" style={{ fontSize: '0.82rem' }}>
            {tl(novel.description)}
          </p>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span style={{ fontSize: '0.82rem' }}>{novel.rating.toFixed(1)}</span>
          </span>
          <Badge variant="secondary">{t(`status.${novel.status}`)}</Badge>
          {firstGenre && (
            <span
              className="uppercase text-muted-foreground"
              style={{ fontSize: '0.66rem', letterSpacing: '0.1em' }}
            >
              {tl(firstGenre.name)}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/novel/${novel.id}`}
      className={cn('group flex flex-col gap-2', className)}
      aria-label={tl(novel.title)}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
        <div className="aspect-[2/3] w-full">
          <ImageWithFallback
            src={novel.cover}
            alt={tl(novel.title)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-white backdrop-blur-sm">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          <span style={{ fontSize: '0.75rem' }}>{novel.rating.toFixed(1)}</span>
        </div>
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
          {tl(novel.title)}
        </h3>
        <p className="line-clamp-1 text-muted-foreground" style={{ fontSize: '0.85rem' }}>
          {tl(novel.author)}
        </p>
        {firstGenre && (
          <span
            className="mt-0.5 uppercase text-muted-foreground"
            style={{ fontSize: '0.68rem', letterSpacing: '0.1em' }}
          >
            {tl(firstGenre.name)}
          </span>
        )}
      </div>
    </Link>
  );
}
