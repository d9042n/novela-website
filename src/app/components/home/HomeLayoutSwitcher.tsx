import { Layout, Rows3, Tv, Newspaper, Grid2x2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';
import { HOME_PRESETS, type HomePreset } from '../../theme/config';

const HOME_ICONS: Record<HomePreset, typeof Layout> = {
  classic: Layout,
  bento: Grid2x2,
  portal: Rows3,
  reels: Tv,
  magazine: Newspaper,
};

export function HomeLayoutSwitcher() {
  const { t } = useTranslation();
  const { homePreset, setHomePreset } = useTheme();

  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-muted/40 border border-border/60 mb-6">
      <div className="flex items-center gap-2 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:flex">
        <span>Bố cục Trang Chủ:</span>
      </div>

      <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
        {HOME_PRESETS.map((hp) => {
          const Icon = HOME_ICONS[hp.id];
          const active = homePreset === hp.id;
          return (
            <button
              key={hp.id}
              type="button"
              onClick={() => setHomePreset(hp.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{t(hp.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
