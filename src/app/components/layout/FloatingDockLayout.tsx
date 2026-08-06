import { useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { Home, Compass, Search, BookMarked } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../ui/utils';
import { NovelaMark } from '../brand/NovelaMark';
import { Input } from '../ui/input';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeControls } from './ThemeControls';
import { UserMenu } from './UserMenu';
import { Footer } from './Footer';

export function FloatingDockLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground pb-20">
      {/* Top minimal header */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-md sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <NovelaMark className="size-6 text-primary" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>
            {t('app.name')}
          </span>
        </Link>

        <form onSubmit={onSearch} className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('nav.search')}
            className="pl-9 h-8 text-xs bg-muted/40"
          />
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Floating Glass Capsule Dock at bottom center */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">{t('nav.home')}</span>
          </NavLink>

          <NavLink
            to="/browse"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Compass className="size-4" />
            <span className="hidden sm:inline">{t('nav.browse')}</span>
          </NavLink>

          <NavLink
            to="/library"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <BookMarked className="size-4" />
            <span className="hidden sm:inline">{t('library.title')}</span>
          </NavLink>

          <div className="h-4 w-px bg-border/80 mx-1" />

          <LanguageSwitcher />
          <ThemeControls />
          <UserMenu compact />
        </div>
      </div>
    </div>
  );
}
