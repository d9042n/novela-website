import { LayoutGrid, Sidebar, LayoutList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';
import { BROWSE_PRESETS, type BrowsePreset } from '../../theme/config';

const BROWSE_ICONS: Record<BrowsePreset, typeof LayoutGrid> = {
  grid: LayoutGrid,
  sidebar: Sidebar,
  list: LayoutList,
};

export function BrowseLayoutSwitcher() {
  const { t } = useTranslation();
  const { browsePreset, setBrowsePreset } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border">
      {BROWSE_PRESETS.map((bp) => {
        const Icon = BROWSE_ICONS[bp.id];
        const active = browsePreset === bp.id;
        return (
          <button
            key={bp.id}
            type="button"
            onClick={() => setBrowsePreset(bp.id)}
            title={t(bp.labelKey)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              active
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="size-3.5 text-primary" />
            <span className="hidden sm:inline">{t(bp.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
