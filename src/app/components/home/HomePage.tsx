import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getFeaturedNovels,
  getLatestNovels,
  getPopularNovels,
} from '../../data/api';
import { useGenres } from '../../data/genres';
import { useAsync } from '../../hooks/useAsync';
import { NovelGrid } from '../NovelGrid';
import { HeroCarousel } from './HeroCarousel';
import { ContinueReading } from './ContinueReading';
import { Badge } from '../ui/badge';
import { useTheme } from '../../theme/ThemeProvider';
import { HomePortalLayout } from './HomePortalLayout';
import { HomeReelsLayout } from './HomeReelsLayout';
import { HomeMagazineLayout } from './HomeMagazineLayout';
import { HomeRankings } from './HomeRankings';

function SectionHeader({ index, title, to }: { index: string; title: string; to?: string }) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
      <div className="flex items-baseline gap-3">
        <span
          className="text-muted-foreground"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem' }}
        >
          {index}
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.1 }}>
          {title}
        </h2>
      </div>
      {to && (
        <Link
          to={to}
          className="group flex shrink-0 items-center gap-0.5 text-muted-foreground transition-colors hover:text-primary"
          style={{ fontSize: '0.85rem' }}
        >
          {t('actions.viewAll')}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const { homePreset } = useTheme();
  // TODO(i18n-content): tên thể loại đơn ngữ VN (từ API /genres).
  const { genres } = useGenres();

  const { data: featured = [] } = useAsync(() => getFeaturedNovels(6), [], []);
  const { data: latest = [] } = useAsync(() => getLatestNovels(12), [], []);
  const { data: popular = [] } = useAsync(() => getPopularNovels(12), [], []);

  if (homePreset === 'portal') {
    return <HomePortalLayout featured={featured} latest={latest} popular={popular} />;
  }

  if (homePreset === 'reels') {
    return <HomeReelsLayout featured={featured} latest={latest} popular={popular} />;
  }

  if (homePreset === 'magazine') {
    return <HomeMagazineLayout featured={featured} latest={latest} popular={popular} />;
  }

  // Classic Preset
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      <HeroCarousel novels={featured} />

      <ContinueReading />

      <section className="mt-14">
        <SectionHeader index="01" title={t('home.latest')} to="/browse?sort=latest" />
        <NovelGrid novels={latest} />
      </section>

      <section className="mt-14">
        <SectionHeader index="02" title={t('home.popular')} to="/browse?sort=popular" />
        <NovelGrid novels={popular} />
      </section>

      <HomeRankings />

      <section className="mt-14">
        <SectionHeader index="04" title={t('home.byGenre')} />
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <Link key={g.slug} to={`/browse?genre=${g.slug}`}>
              <Badge
                variant="outline"
                className="cursor-pointer rounded-full px-4 py-2 transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
              >
                {g.name}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
