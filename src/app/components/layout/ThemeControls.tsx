import { useState } from 'react';
import { useLocation } from 'react-router';
import {
  Moon,
  Settings,
  Sun,
  LayoutTemplate,
  Check,
  PanelTop,
  Sidebar,
  Dock,
  Layout,
  Rows3,
  Tv,
  Newspaper,
  LayoutGrid,
  LayoutList,
  Compass,
  BookOpen,
  Book,
  Grid2x2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useTheme } from '../../theme/ThemeProvider';
import {
  ALWAYS_DARK_THEMES,
  BROWSE_PRESETS,
  DETAIL_PRESETS,
  HOME_PRESETS,
  READER_PAGE_PRESETS,
  SHELL_LAYOUTS,
  SITE_LAYOUTS,
  type BrowsePreset,
  type DetailPreset,
  type HomePreset,
  type ReaderPagePreset,
  type ShellLayout,
  type SiteLayout,
} from '../../theme/config';
import { SiteSettingsModal } from './SiteSettingsModal';

const LAYOUT_ICONS: Record<SiteLayout, typeof LayoutGrid> = {
  comfortable: Grid2x2,
  compact: LayoutGrid,
  list: LayoutList,
};

const SHELL_ICONS: Record<ShellLayout, typeof PanelTop> = {
  topnav: PanelTop,
  sidebar: Sidebar,
  dock: Dock,
};

const HOME_ICONS: Record<HomePreset, typeof Layout> = {
  classic: Layout,
  bento: Grid2x2,
  portal: Rows3,
  reels: Tv,
  magazine: Newspaper,
};

const BROWSE_ICONS: Record<BrowsePreset, typeof Compass> = {
  grid: LayoutGrid,
  sidebar: Sidebar,
};

const DETAIL_ICONS: Record<DetailPreset, typeof BookOpen> = {
  classic: BookOpen,
  cinematic: Tv,
  minimal: Book,
};

const READER_PAGE_ICONS: Record<ReaderPagePreset, typeof Book> = {
  scroll: Rows3,
  drawer: Sidebar,
  paged: Book,
};

export function ThemeControls() {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    siteTheme,
    isDark,
    toggleMode,
    layout,
    setLayout,
    shellLayout,
    setShellLayout,
    homePreset,
    setHomePreset,
    browsePreset,
    setBrowsePreset,
    detailPreset,
    setDetailPreset,
    readerPagePreset,
    setReaderPagePreset,
  } = useTheme();

  const [openSettings, setOpenSettings] = useState(false);
  const modeLocked = ALWAYS_DARK_THEMES.includes(siteTheme);

  const isHome = location.pathname === '/';
  const isBrowse = location.pathname.startsWith('/browse');
  const isDetail = location.pathname.startsWith('/novel/') && !location.pathname.includes('/chapter/');
  const isReader = location.pathname.includes('/chapter/');

  const itemClass = (active: boolean) =>
    `gap-2 text-xs transition-colors rounded-lg py-2 ${
      active
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-foreground/90 hover:bg-accent hover:text-foreground'
    }`;

  const headerClass = "text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 py-1.5 px-2";

  return (
    <div className="flex items-center gap-1.5">
      {/* 1. Quick Dark/Light Mode Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        disabled={modeLocked}
        aria-label={isDark ? t('settings.lightMode') : t('settings.darkMode')}
        title={modeLocked ? undefined : isDark ? t('settings.lightMode') : t('settings.darkMode')}
        className="rounded-full"
      >
        {isDark ? <Sun className="size-4.5 text-amber-400" /> : <Moon className="size-4.5" />}
      </Button>

      {/* 2. Dedicated Contextual Layout Button (📐) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('settings.layout')}
            title={t('settings.layout')}
            className="rounded-full text-primary hover:bg-primary/10"
          >
            <LayoutTemplate className="size-4.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 border-border/80 bg-background/95 backdrop-blur-xl shadow-xl p-1.5 space-y-1">
          {/* Active Page Contextual Layout Section */}
          {isHome && (
            <>
              <DropdownMenuLabel className={headerClass}>
                {t('settings.homePresetTitle')}
              </DropdownMenuLabel>
              {HOME_PRESETS.map((hp) => {
                const Icon = HOME_ICONS[hp.id];
                const active = homePreset === hp.id;
                return (
                  <DropdownMenuItem key={hp.id} onClick={() => setHomePreset(hp.id)} className={itemClass(active)}>
                    <Icon className={`size-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="flex-1 font-medium">{t(hp.labelKey)}</span>
                    {active && <Check className="size-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-border/60 my-1" />
            </>
          )}

          {isBrowse && (
            <>
              <DropdownMenuLabel className={headerClass}>
                {t('settings.browsePresetTitle')}
              </DropdownMenuLabel>
              {BROWSE_PRESETS.map((bp) => {
                const Icon = BROWSE_ICONS[bp.id];
                const active = browsePreset === bp.id;
                return (
                  <DropdownMenuItem key={bp.id} onClick={() => setBrowsePreset(bp.id)} className={itemClass(active)}>
                    <Icon className={`size-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="flex-1 font-medium">{t(bp.labelKey)}</span>
                    {active && <Check className="size-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-border/60 my-1" />
            </>
          )}

          {isDetail && (
            <>
              <DropdownMenuLabel className={headerClass}>
                {t('settings.detailPresetTitle')}
              </DropdownMenuLabel>
              {DETAIL_PRESETS.map((dp) => {
                const Icon = DETAIL_ICONS[dp.id];
                const active = detailPreset === dp.id;
                return (
                  <DropdownMenuItem key={dp.id} onClick={() => setDetailPreset(dp.id)} className={itemClass(active)}>
                    <Icon className={`size-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="flex-1 font-medium">{t(dp.labelKey)}</span>
                    {active && <Check className="size-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-border/60 my-1" />
            </>
          )}

          {isReader && (
            <>
              <DropdownMenuLabel className={headerClass}>
                {t('settings.readerPagePresetTitle')}
              </DropdownMenuLabel>
              {READER_PAGE_PRESETS.map((rp) => {
                const Icon = READER_PAGE_ICONS[rp.id];
                const active = readerPagePreset === rp.id;
                return (
                  <DropdownMenuItem key={rp.id} onClick={() => setReaderPagePreset(rp.id)} className={itemClass(active)}>
                    <Icon className={`size-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="flex-1 font-medium">{t(rp.labelKey)}</span>
                    {active && <Check className="size-4 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="bg-border/60 my-1" />
            </>
          )}

          {/* App Shell Section */}
          <DropdownMenuLabel className={headerClass}>
            {t('settings.shellLayoutTitle')}
          </DropdownMenuLabel>
          {SHELL_LAYOUTS.map((s) => {
            const Icon = SHELL_ICONS[s.id];
            const active = shellLayout === s.id;
            return (
              <DropdownMenuItem key={s.id} onClick={() => setShellLayout(s.id)} className={itemClass(active)}>
                <Icon className={`size-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="flex-1 font-medium">{t(s.labelKey)}</span>
                {active && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator className="bg-border/60 my-1" />

          {/* Card Grid Density Section */}
          <DropdownMenuLabel className={headerClass}>
            {t('settings.cardGridTitle')}
          </DropdownMenuLabel>
          {SITE_LAYOUTS.map((l) => {
            const Icon = LAYOUT_ICONS[l.id];
            const active = layout === l.id;
            return (
              <DropdownMenuItem key={l.id} onClick={() => setLayout(l.id)} className={itemClass(active)}>
                <Icon className={`size-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="flex-1 font-medium">{t(l.labelKey)}</span>
                {active && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 3. Dedicated General Settings Modal Button (⚙️) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpenSettings(true)}
        aria-label={t('settings.theme')}
        title={t('settings.theme')}
        className="rounded-full"
      >
        <Settings className="size-4.5" />
      </Button>

      {/* Centralized Settings Modal */}
      <SiteSettingsModal open={openSettings} onOpenChange={setOpenSettings} />
    </div>
  );
}
