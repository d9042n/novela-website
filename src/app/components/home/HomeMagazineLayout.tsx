import { Link } from 'react-router';
import { ChevronRight, Quote, BookOpen, Star, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { useLocalized } from '../../hooks/useLocalized';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { GENRES } from '../../data/genres';

interface HomeMagazineLayoutProps {
  featured: Novel[];
  latest: Novel[];
  popular: Novel[];
}

export function HomeMagazineLayout({ featured = [], latest = [], popular = [] }: HomeMagazineLayoutProps) {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();

  const heroMain = (featured && featured[0]) || (popular && popular[0]);
  const heroSub = (featured && featured.length > 1)
    ? featured.slice(1, 4)
    : (popular && popular.slice(1, 4)) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
      {/* Bento Grid Magazine Hero */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Sparkles className="size-5 text-primary" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
            {t('home.featured')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Bento Hero Card (7 cols) */}
          {heroMain && (
            <Link
              to={`/novel/${heroMain.id}`}
              className="lg:col-span-7 group relative flex flex-col justify-end min-h-[380px] sm:min-h-[460px] rounded-2xl overflow-hidden bg-black p-6 sm:p-8 text-white shadow-xl transition-all duration-300 hover:shadow-2xl border border-border/40"
            >
              <img
                src={heroMain.cover}
                alt={tl(heroMain.title)}
                className="absolute inset-0 h-full w-full object-cover opacity-65 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                    {t('home.editorsChoice')}
                  </Badge>
                  <span className="text-xs text-white/80 flex items-center gap-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {heroMain.rating}
                  </span>
                </div>

                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1.15 }}>
                  {tl(heroMain.title)}
                </h1>

                <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
                  {tl(heroMain.description)}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-white/70 border-t border-white/20">
                  <span>{tl(heroMain.author)}</span>
                  <span className="flex items-center gap-1 text-primary-foreground font-semibold">
                    {t('actions.readNow')}
                    <ChevronRight className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Sub Bento Tiles (5 cols - 3 stacked cards) */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {(heroSub || []).map((novel) => (
              <Link
                key={novel.id}
                to={`/novel/${novel.id}`}
                className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={novel.cover}
                    alt={tl(novel.title)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                    {tl(novel.title)}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{tl(novel.author)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                    {tl(novel.description)}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="text-amber-500 font-semibold">⭐ {novel.rating}</span>
                    <span>•</span>
                    <span>{t('novel.chapterCountLabel', { count: novel.chapterCount })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Callout Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-accent/30 to-primary/10 p-8 border border-primary/20">
        <Quote className="absolute top-4 left-4 size-16 text-primary/10 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3">
          <p
            className="text-lg sm:text-xl font-serif italic text-foreground/90 leading-relaxed"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('home.magazineQuote')}
          </p>
          <p className="text-xs tracking-wider uppercase text-muted-foreground font-semibold">
            {t('home.magazineQuoteAuthor')}
          </p>
        </div>
      </section>

      {/* Magazine Horizontal Cards List Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
            {t('home.popular')}
          </h2>
          <Link
            to="/browse?sort=popular"
            className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {t('actions.viewAll')}
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(popular || []).slice(0, 6).map((novel) => (
            <Card key={novel.id} className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
              <CardContent className="p-4 flex gap-4">
                <Link to={`/novel/${novel.id}`} className="shrink-0 group">
                  <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-lg bg-muted shadow">
                    <img
                      src={novel.cover}
                      alt={tl(novel.title)}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>

                <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {(novel.genreIds || []).slice(0, 2).map((gId) => {
                        const genre = GENRES.find((g) => g.id === gId);
                        return genre ? (
                          <Badge key={gId} variant="outline" className="text-[10px] px-2 py-0">
                            {tl(genre.name)}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <Link to={`/novel/${novel.id}`}>
                      <h3 className="font-bold text-base hover:text-primary transition-colors line-clamp-1">
                        {tl(novel.title)}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">{tl(novel.author)}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                      {tl(novel.description)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <BookOpen className="size-3.5 text-primary" />
                      {t('novel.chapterCountLabel', { count: novel.chapterCount })}
                    </span>
                    <span className="text-amber-500 font-bold">⭐ {novel.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
