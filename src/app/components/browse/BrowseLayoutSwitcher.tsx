import { LayoutGrid, Sidebar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';
import { BROWSE_PRESETS, type BrowsePreset } from '../../theme/config';

// Keyed by BrowsePreset, so this map has exactly the presets BROWSE_PRESETS
// renders. A `list` entry used to live here, but there is no 'list' preset:
// BrowsePage only branches on 'sidebar' vs the grid default, and neither locale
// has a settings.browsePresets.list label — so the icon was unreachable and the
// key did not typecheck. BrowseListLayout.tsx is likewise unreferenced; if that
// preset is ever finished, add 'list' to BrowsePreset + both locales + a
// BrowsePage branch, then re-add the icon here.
const BROWSE_ICONS: Record<BrowsePreset, typeof LayoutGrid> = {
  grid: LayoutGrid,
  sidebar: Sidebar,
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
