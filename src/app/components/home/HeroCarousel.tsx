import { Link } from 'react-router';
import { RouterLink } from '../ui/router-link';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { getGenre } from '../../data/genres';
import { useLocalized } from '../../hooks/useLocalized';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { Button } from '../ui/button';

export function HeroCarousel({ novels }: { novels: Novel[] }) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  if (novels.length === 0) return null;

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {novels.map((novel, i) => (
          <CarouselItem key={novel.id}>
            <div className="relative h-[440px] overflow-hidden rounded-2xl border border-border bg-neutral-900 sm:h-[480px]">
              {/* Nền full-bleed + xử lý tông tối màu editorial */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={novel.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {/* Lớp phủ nghiêng: đậm trái → trong suốt phải, cho chữ nổi */}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
              </div>

              <div className="relative flex h-full items-center">
                <div className="grid w-full grid-cols-1 items-center gap-8 px-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-12">
                  {/* Cột chữ */}
                  <div className="max-w-xl text-white">
                    {/* Số thứ tự + nhãn editorial */}
                    <div className="mb-5 flex items-center gap-3 text-white/70">
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          fontStyle: 'italic',
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px w-10 bg-white/40" />
                      <span
                        className="uppercase"
                        style={{ fontSize: '0.7rem', letterSpacing: '0.22em' }}
                      >
                        {t('home.featured')}
                      </span>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/75">
                      {novel.genreIds.slice(0, 3).map((gid, gi) => {
                        const g = getGenre(gid);
                        return g ? (
                          <span key={gid} className="flex items-center gap-3">
                            {gi > 0 && <span className="h-1 w-1 rounded-full bg-white/40" />}
                            <span
                              className="uppercase"
                              style={{ fontSize: '0.72rem', letterSpacing: '0.14em' }}
                            >
                              {tl(g.name)}
                            </span>
                          </span>
                        ) : null;
                      })}
                    </div>

                    <h1
                      className="mb-3"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                        fontWeight: 700,
                        lineHeight: 1.05,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {tl(novel.title)}
                    </h1>

                    <p
                      className="mb-4 text-white/70"
                      style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.05rem' }}
                    >
                      {tl(novel.author)}
                    </p>

                    <p className="mb-6 line-clamp-2 max-w-lg text-white/80 sm:line-clamp-3" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {tl(novel.description)}
                    </p>

                    <div className="mb-6 flex items-center gap-5 text-white/80" style={{ fontSize: '0.85rem' }}>
                      <span className="flex items-center gap-1.5">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {novel.rating.toFixed(1)}
                      </span>
                      <span className="h-3 w-px bg-white/25" />
                      <span>{t('novel.chapterCountLabel', { count: novel.chapterCount })}</span>
                      <span className="h-3 w-px bg-white/25" />
                      <span>{(novel.views / 1000).toFixed(0)}K {t('common.views')}</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild size="lg">
                        <RouterLink to={`/novel/${novel.id}/chapter/1`}>{t('actions.readNow')}</RouterLink>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                      >
                        <RouterLink to={`/novel/${novel.id}`}>{t('novel.info')}</RouterLink>
                      </Button>
                    </div>
                  </div>

                  {/* Bìa sách nổi, khung mảnh */}
                  <div className="hidden w-52 shrink-0 sm:block">
                    <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/20">
                      <div className="aspect-[2/3]">
                        <ImageWithFallback
                          src={novel.cover}
                          alt={tl(novel.title)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
      <CarouselNext className="right-4 border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
    </Carousel>
  );
}
