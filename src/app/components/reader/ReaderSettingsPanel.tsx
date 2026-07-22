import { useTranslation } from 'react-i18next';
import {
  AlignJustify,
  BookOpen,
  Minus,
  Plus,
  RotateCcw,
  ScrollText,
  Maximize,
} from 'lucide-react';
import { useReaderSettings } from './ReaderSettingsContext';
import {
  READER_FONTS,
  READER_LAYOUTS,
  READER_THEMES,
  READER_WIDTHS,
  fontCssVar,
  type ReaderFont,
  type ReaderLayout,
  type ReaderTheme,
  type ReaderWidth,
} from '../../theme/config';
import { cn } from '../ui/utils';

const LAYOUT_ICONS: Record<ReaderLayout, typeof ScrollText> = {
  scroll: ScrollText,
  paged: BookOpen,
  wide: Maximize,
};

function Divider() {
  return <div className="h-px bg-border/60" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
      {children}
    </p>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-sm text-foreground/80">{label}</span>
      {children}
    </div>
  );
}

export function ReaderSettingsPanel() {
  const { t } = useTranslation();
  const { settings, update, reset } = useReaderSettings();

  const activeTheme = READER_THEMES.find((th) => th.id === settings.theme);

  return (
    <div className="flex flex-col divide-y divide-border/60">

      {/* ── Live preview ── */}
      <div className="px-5 pb-5 pt-4">
        <div
          className="h-28 overflow-hidden rounded-2xl px-5 py-4 shadow-sm ring-1 ring-black/8 transition-colors duration-300"
          style={{
            backgroundColor: activeTheme?.swatch,
            color: activeTheme?.fg,
            fontFamily: fontCssVar(settings.font),
          }}
        >
          <div
            className="mb-1 font-bold leading-tight tracking-tight"
            style={{ fontSize: `${settings.fontSize + 6}px` }}
          >
            Aa
          </div>
          <p
            className="opacity-80"
            style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
          >
            {t('reader.previewSample')}
          </p>
        </div>
      </div>

      {/* ── Nền đọc ── */}
      <div className="px-5 py-4">
        <SectionLabel>{t('reader.readerTheme')}</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {READER_THEMES.map((th) => {
            const active = settings.theme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => update('theme', th.id as ReaderTheme)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all duration-150',
                  active
                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                    : 'ring-1 ring-border/50 hover:ring-border',
                )}
              >
                <span
                  className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold tracking-wide shadow-sm"
                  style={{
                    backgroundColor: th.swatch,
                    color: th.fg,
                    border: th.id === 'light' ? '1px solid rgba(0,0,0,0.06)' : undefined,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Aa
                </span>
                <span
                  className={cn(
                    'text-[0.65rem] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {t(th.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bố cục ── */}
      <div className="px-5 py-4">
        <SectionLabel>{t('reader.layout')}</SectionLabel>
        <div className="flex gap-2 rounded-xl bg-muted/60 p-1">
          {READER_LAYOUTS.map((l) => {
            const Icon = LAYOUT_ICONS[l.id as ReaderLayout];
            const active = settings.layout === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => update('layout', l.id as ReaderLayout)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-lg py-2.5 text-[0.7rem] font-medium transition-all duration-150',
                  active
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/40'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {t(l.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Độ rộng ── */}
      <div className="px-5 py-4">
        <SectionLabel>{t('reader.width')}</SectionLabel>
        <div className="flex gap-2 rounded-xl bg-muted/60 p-1">
          {READER_WIDTHS.map((w) => {
            const active = settings.width === w.id;
            const barWidths: Record<string, string[]> = {
              narrow: ['w-2.5', 'w-3.5', 'w-2'],
              normal: ['w-4', 'w-5', 'w-3'],
              wide: ['w-5', 'w-7', 'w-4'],
            };
            const bars = barWidths[w.id] ?? ['w-4', 'w-5', 'w-3'];
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => update('width', w.id as ReaderWidth)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1.5 rounded-lg py-2.5 text-[0.7rem] font-medium transition-all duration-150',
                  active
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/40'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="flex flex-col items-center gap-[3px]">
                  {bars.map((bw, i) => (
                    <span key={i} className={cn('h-[2px] rounded-full bg-current', bw)} />
                  ))}
                </span>
                {t(w.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Phông chữ ── */}
      <div className="px-5 py-4">
        <SectionLabel>{t('reader.font')}</SectionLabel>
        <div className="flex flex-col gap-1">
          {READER_FONTS.map((f) => {
            const active = settings.font === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => update('font', f.id as ReaderFont)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-150',
                  active
                    ? 'bg-primary/8 text-foreground ring-1 ring-primary/20'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                )}
              >
                <span
                  className="text-[0.95rem] font-medium"
                  style={{ fontFamily: fontCssVar(f.id as ReaderFont) }}
                >
                  {t(f.labelKey)}
                </span>
                <span
                  className={cn('text-[1.05rem] transition-colors', active ? 'text-primary' : 'text-muted-foreground/60')}
                  style={{ fontFamily: fontCssVar(f.id as ReaderFont) }}
                >
                  Aa
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Cỡ chữ & giãn dòng ── */}
      <div className="px-5 py-4">
        <SectionLabel>{t('reader.typography')}</SectionLabel>
        <div className="flex flex-col gap-3">
          <Row label={t('reader.fontSize')}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => update('fontSize', Math.max(15, settings.fontSize - 1))}
                disabled={settings.fontSize <= 15}
                className="flex size-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-12 text-center text-sm tabular-nums font-medium">
                {settings.fontSize}px
              </span>
              <button
                type="button"
                onClick={() => update('fontSize', Math.min(26, settings.fontSize + 1))}
                disabled={settings.fontSize >= 26}
                className="flex size-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </Row>

          <Row label={t('reader.lineHeight')}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => update('lineHeight', Number(Math.max(1.3, settings.lineHeight - 0.1).toFixed(1)))}
                disabled={settings.lineHeight <= 1.3}
                className="flex size-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-12 text-center text-sm tabular-nums font-medium">
                {settings.lineHeight.toFixed(1)}
              </span>
              <button
                type="button"
                onClick={() => update('lineHeight', Number(Math.min(2.2, settings.lineHeight + 0.1).toFixed(1)))}
                disabled={settings.lineHeight >= 2.2}
                className="flex size-7 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </Row>
        </div>
      </div>

      {/* ── Reset ── */}
      <div className="px-5 py-3">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/70 transition hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          {t('actions.reset')}
        </button>
      </div>
    </div>
  );
}
