import { BookOpen, Tv, Book } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';
import { DETAIL_PRESETS, type DetailPreset } from '../../theme/config';

const DETAIL_ICONS: Record<DetailPreset, typeof BookOpen> = {
  classic: BookOpen,
  cinematic: Tv,
  minimal: Book,
};

export function DetailLayoutSwitcher() {
  const { t } = useTranslation();
  const { detailPreset, setDetailPreset } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border">
      {DETAIL_PRESETS.map((dp) => {
        const Icon = DETAIL_ICONS[dp.id];
        const active = detailPreset === dp.id;
        return (
          <button
            key={dp.id}
            type="button"
            onClick={() => setDetailPreset(dp.id)}
            title={t(dp.labelKey)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              active
                ? 'bg-background text-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="size-3.5 text-sky-500" />
            <span className="hidden sm:inline">{t(dp.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
