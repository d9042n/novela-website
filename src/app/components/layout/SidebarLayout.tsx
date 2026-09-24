import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { Home, Compass, Search, ChevronLeft, ChevronRight, BookOpen, Sparkles, BookMarked } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../ui/utils';
import { NovelaMark } from '../brand/NovelaMark';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeControls } from './ThemeControls';
import { UserMenu } from './UserMenu';
import { Footer } from './Footer';
import { useTheme } from '../../theme/ThemeProvider';
import { useGenres } from '../../data/genres';

export function SidebarLayout() {
  const { t } = useTranslation();
  const { genres } = useGenres();
  const { siteTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Left Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border sticky top-0 h-screen transition-all duration-300 z-30',
          siteTheme === 'glass' ? 'glass-surface' : 'bg-card/75 backdrop-blur-md',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Sidebar Header / Brand */}
        <div className="flex h-16 items-center justify-between px-3 border-b border-border">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <NovelaMark className="size-8 text-primary shrink-0" />
            {!collapsed && (
              <span
                className="tracking-tight whitespace-nowrap"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}
              >
                {t('app.name')}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Quick Search */}
        {!collapsed ? (
          <div className="p-3 border-b border-border/50">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-input-background/60 px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:bg-input-background transition-all"
            >
              <div className="flex items-center gap-2">
                <Search className="size-3.5 text-muted-foreground" />
                <span>{t('nav.searchShort')}...</span>
              </div>
              <kbd className="inline-flex h-4 items-center rounded border border-border bg-background px-1 font-mono text-[9px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>
        ) : (
          <div className="p-2 border-b border-border/50 flex justify-center">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              title="Command Palette (⌘K)"
            >
              <Search className="size-4" />
            </button>
          </div>
        )}

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          <nav className="space-y-1">
            <NavLink to="/" end className={navLinkClass} title={collapsed ? t('nav.home') : undefined}>
              <Home className="size-5 shrink-0" />
              {!collapsed && <span>{t('nav.home')}</span>}
            </NavLink>

            <NavLink to="/browse" className={navLinkClass} title={collapsed ? t('nav.browse') : undefined}>
              <Compass className="size-5 shrink-0" />
              {!collapsed && <span>{t('nav.browse')}</span>}
            </NavLink>

            <NavLink to="/library" className={navLinkClass} title={collapsed ? t('library.title') : undefined}>
              <BookMarked className="size-5 shrink-0" />
              {!collapsed && <span>{t('library.title')}</span>}
            </NavLink>
          </nav>

          {/* Genres section (if expanded) */}
          {!collapsed && (
            <div className="pt-2 border-t border-border/50">
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {t('home.byGenre')}
                </span>
                <Sparkles className="size-3 text-muted-foreground" />
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {genres.slice(0, 8).map((g) => (
                  <Link
                    key={g.slug}
                    to={`/browse?genre=${g.slug}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                  >
                    <BookOpen className="size-3.5 text-primary/70" />
                    <span className="truncate">{g.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-border flex flex-col gap-2">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-1">
              <LanguageSwitcher />
              <ThemeControls />
              <UserMenu compact />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <ThemeControls />
              <UserMenu compact />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header + Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2">
            <NovelaMark className="size-6 text-primary" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>
              {t('app.name')}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label={t('nav.searchShort')}
            >
              <Search className="size-5" />
            </button>
            <ThemeControls />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
