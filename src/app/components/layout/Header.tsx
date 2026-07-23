import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { Home, Compass, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { NovelaMark } from '../brand/NovelaMark';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeControls } from './ThemeControls';
import { useTheme } from '../../theme/ThemeProvider';

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { siteTheme } = useTheme();
  const [query, setQuery] = useState('');

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-md transition-colors hover:text-foreground text-sm font-medium',
      isActive ? 'text-foreground font-semibold' : 'text-muted-foreground',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border',
        siteTheme === 'glass' ? 'glass-surface' : 'bg-background/85 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <NovelaMark className="size-7 text-primary" />
          <span
            className="tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {t('app.name')}
          </span>
        </Link>

        <nav className="hidden items-center md:flex gap-1">
          <NavLink to="/" end className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/browse" className={navLinkClass}>
            {t('nav.browse')}
          </NavLink>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="pl-9 h-9 text-xs"
              aria-label={t('nav.searchShort')}
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <NavLink
            to="/"
            end
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            title={t('nav.home')}
          >
            <Home className="size-5" />
          </NavLink>

          <NavLink
            to="/browse"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            title={t('nav.browse')}
          >
            <Compass className="size-5" />
          </NavLink>

          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="text-muted-foreground hover:text-foreground sm:hidden p-2 transition-colors rounded-lg hover:bg-accent"
            aria-label={t('nav.searchShort')}
          >
            <Search className="size-5" />
          </button>

          <LanguageSwitcher />
          <ThemeControls />
        </div>
      </div>
    </header>
  );
}
