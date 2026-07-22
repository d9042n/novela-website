import { Moon, Palette, Sun, Check, LayoutGrid, LayoutList, Rows3, Grid2x2 } from 'lucide-react';
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
import { ALWAYS_DARK_THEMES, SITE_LAYOUTS, SITE_THEMES, type SiteLayout } from '../../theme/config';

const LAYOUT_ICONS: Record<SiteLayout, typeof LayoutGrid> = {
  comfortable: Grid2x2,
  compact: LayoutGrid,
  list: LayoutList,
};

export function ThemeControls() {
  const { t } = useTranslation();
  const { siteTheme, setSiteTheme, isDark, toggleMode, layout, setLayout } = useTheme();
  const modeLocked = ALWAYS_DARK_THEMES.includes(siteTheme);

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('settings.layout')}>
            <Rows3 className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{t('settings.layout')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SITE_LAYOUTS.map((l) => {
            const Icon = LAYOUT_ICONS[l.id];
            return (
              <DropdownMenuItem key={l.id} onClick={() => setLayout(l.id)} className="gap-2">
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{t(l.labelKey)}</span>
                {layout === l.id && <Check className="size-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('settings.theme')}>
            <Palette className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>{t('settings.theme')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SITE_THEMES.map((th) => (
            <DropdownMenuItem key={th.id} onClick={() => setSiteTheme(th.id)} className="gap-2">
              <span
                className="size-4 shrink-0 rounded-full border border-black/15"
                style={{ backgroundColor: th.swatch }}
              />
              <span className="flex-1">{t(th.labelKey)}</span>
              {siteTheme === th.id && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        disabled={modeLocked}
        aria-label={isDark ? t('settings.lightMode') : t('settings.darkMode')}
        title={modeLocked ? undefined : isDark ? t('settings.lightMode') : t('settings.darkMode')}
      >
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>
    </div>
  );
}
