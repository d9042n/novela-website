import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NovelaMark } from '../brand/NovelaMark';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <NovelaMark className="size-6 text-primary" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {t('app.name')}
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-muted-foreground" style={{ fontSize: '0.88rem' }}>
          <Link to="/" className="transition-colors hover:text-foreground">
            {t('nav.home')}
          </Link>
          <Link to="/browse" className="transition-colors hover:text-foreground">
            {t('nav.browse')}
          </Link>
        </nav>

        <p className="text-muted-foreground" style={{ fontSize: '0.82rem' }}>
          © {year} {t('app.name')} · {t('app.tagline')}
        </p>
      </div>
    </footer>
  );
}
