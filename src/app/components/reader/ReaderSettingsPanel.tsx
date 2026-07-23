import { useTranslation } from 'react-i18next';
import {
  AlignJustify,
  AlignLeft,
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground/75">
      {children}
    </p>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-xs font-medium text-foreground/80">{label}</span>
      {children}
    </div>
  );
}

export function ReaderSettingsPanel() {
  const { t } = useTranslation();
  const { settings, update, reset } = useReaderSettings();

  const activeTheme = READER_THEMES.find((th) => th.id === settings.theme);

  const handleSelectLayout = (l: ReaderLayout) => {
    update('layout', l);
    if (l === 'wide') {
      update('width', 'wide');
    }
  };

  const handleSelectWidth = (w: ReaderWidth) => {
    update('width', w);
    if (settings.layout === 'wide' && w !== 'wide') {
      update('layout', 'scroll');
    }
  };

  return (
    <div className="flex flex-col divide-y divide-border/50">

      {/* ── Live preview ── */}
      <div className="px-4 pt-0 pb-3">
        <div
          className="h-24 overflow-hidden rounded-xl px-4 py-3 shadow-sm ring-1 ring-black/8 transition-colors duration-300 flex flex-col justify-center"
          style={{
            backgroundColor: activeTheme?.swatch,
            color: activeTheme?.fg,
            fontFamily: fontCssVar(settings.font),
            textAlign: settings.align ?? 'justify',
            letterSpacing: `${settings.letterSpacing ?? 0}px`,
            wordSpacing: `${settings.wordSpacing ?? 0}px`,
          }}
        >
          <div
            className="mb-0.5 font-bold leading-none tracking-tight"
            style={{ fontSize: `${settings.fontSize + 4}px` }}
          >
            Aa
          </div>
          <p
            className="opacity-80 line-clamp-2"
            style={{ fontSize: `${settings.fontSize - 3}px`, lineHeight: 1.3 }}
          >
            {t('reader.previewSample')}
          </p>
        </div>
      </div>

      {/* ── 1. Phông chữ ── */}
      <div className="px-4 py-3">
        <SectionLabel>{t('reader.font')}</SectionLabel>
        <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
          {READER_FONTS.map((f) => {
            const active = settings.font === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => update('font', f.id as ReaderFont)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-left transition-all duration-150',
                  active
                    ? 'bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                )}
              >
                <div className="flex flex-col text-left min-w-0">
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ fontFamily: fontCssVar(f.id as ReaderFont) }}
                  >
                    {f.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/75 font-normal truncate">
                    {t(f.labelKey)}
                  </span>
                </div>
                <span
                  className={cn('text-xs font-bold transition-colors shrink-0 ml-2', active ? 'text-primary' : 'text-muted-foreground/60')}
                  style={{ fontFamily: fontCssVar(f.id as ReaderFont) }}
                >
                  Aa
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Giãn dòng & 3. Cỡ chữ & Giãn chữ & Giãn từ & Căn lề ── */}
      <div className="px-4 py-3 space-y-2.5">
        <SectionLabel>{t('reader.lineHeight')}</SectionLabel>
        <Row label={t('reader.lineHeight')}>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => update('lineHeight', Number(Math.max(1.1, settings.lineHeight - 0.05).toFixed(2)))}
              disabled={settings.lineHeight <= 1.1}
              className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-12 text-center text-xs tabular-nums font-semibold">
              {settings.lineHeight.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => update('lineHeight', Number(Math.min(2.65, settings.lineHeight + 0.05).toFixed(2)))}
              disabled={settings.lineHeight >= 2.65}
              className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="size-3" />
            </button>
          </div>
        </Row>

        <div className="pt-2 border-t border-border/40">
          <SectionLabel>{t('reader.fontSize')}</SectionLabel>
          <Row label={t('reader.fontSize')}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => update('fontSize', Number(Math.max(10, settings.fontSize - 0.5).toFixed(1)))}
                disabled={settings.fontSize <= 10}
                className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-12 text-center text-xs tabular-nums font-semibold">
                {settings.fontSize}px
              </span>
              <button
                type="button"
                onClick={() => update('fontSize', Number(Math.min(33, settings.fontSize + 0.5).toFixed(1)))}
                disabled={settings.fontSize >= 33}
                className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </Row>
        </div>

        {/* Khoảng cách giữa các ký tự (Letter Spacing — Nới 50%: -2.0px → 6.0px) */}
        <div className="pt-2 border-t border-border/40">
          <SectionLabel>{t('reader.letterSpacing')}</SectionLabel>
          <Row label={t('reader.letterSpacing')}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => update('letterSpacing', Number(Math.max(-2.0, (settings.letterSpacing ?? 0) - 0.1).toFixed(1)))}
                disabled={(settings.letterSpacing ?? 0) <= -2.0}
                className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-12 text-center text-xs tabular-nums font-semibold">
                {(settings.letterSpacing ?? 0) > 0 ? `+${(settings.letterSpacing ?? 0).toFixed(1)}` : (settings.letterSpacing ?? 0).toFixed(1)}px
              </span>
              <button
                type="button"
                onClick={() => update('letterSpacing', Number(Math.min(6.0, (settings.letterSpacing ?? 0) + 0.1).toFixed(1)))}
                disabled={(settings.letterSpacing ?? 0) >= 6.0}
                className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </Row>
        </div>

        {/* Khoảng cách giữa các từ (Word Spacing — Nới 50%: 0.0px → 12.0px) */}
        <div className="pt-2 border-t border-border/40">
          <SectionLabel>{t('reader.wordSpacing')}</SectionLabel>
          <Row label={t('reader.wordSpacing')}>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => update('wordSpacing', Number(Math.max(0.0, (settings.wordSpacing ?? 0) - 0.2).toFixed(1)))}
                disabled={(settings.wordSpacing ?? 0) <= 0.0}
                className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-12 text-center text-xs tabular-nums font-semibold">
                {(settings.wordSpacing ?? 0) > 0 ? `+${(settings.wordSpacing ?? 0).toFixed(1)}` : (settings.wordSpacing ?? 0).toFixed(1)}px
              </span>
              <button
                type="button"
                onClick={() => update('wordSpacing', Number(Math.min(12.0, (settings.wordSpacing ?? 0) + 0.2).toFixed(1)))}
                disabled={(settings.wordSpacing ?? 0) >= 12.0}
                className="flex size-6.5 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </Row>
        </div>

        {/* 2026 UX Addition: Text Alignment Toggle */}
        <div className="pt-2 border-t border-border/40">
          <SectionLabel>{t('reader.textAlign')}</SectionLabel>
          <Row label={t('reader.textAlign')}>
            <div className="flex gap-1 bg-muted/60 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => update('align', 'justify')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                  settings.align === 'justify' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <AlignJustify className="size-3.5" />
                <span>{t('reader.alignJustify')}</span>
              </button>
              <button
                type="button"
                onClick={() => update('align', 'left')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                  settings.align === 'left' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <AlignLeft className="size-3.5" />
                <span>{t('reader.alignLeft')}</span>
              </button>
            </div>
          </Row>
        </div>
      </div>

      {/* ── 4. Nền đọc ── */}
      <div className="px-4 py-3">
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
                  'group flex flex-col items-center gap-1 rounded-lg p-1 transition-all duration-150',
                  active
                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                    : 'ring-1 ring-border/50 hover:ring-border',
                )}
              >
                <span
                  className="flex h-8 w-full items-center justify-center rounded-md text-xs font-bold tracking-wide shadow-sm"
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
                    'text-[0.62rem] font-medium transition-colors truncate w-full text-center',
                    active ? 'text-primary font-bold' : 'text-muted-foreground',
                  )}
                >
                  {t(th.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bố cục & Độ rộng ── */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <SectionLabel>{t('reader.layout')}</SectionLabel>
          <div className="flex gap-1.5 rounded-lg bg-muted/60 p-1">
            {READER_LAYOUTS.map((l) => {
              const Icon = LAYOUT_ICONS[l.id as ReaderLayout];
              const active = settings.layout === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => handleSelectLayout(l.id as ReaderLayout)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[0.68rem] font-medium transition-all duration-150',
                    active
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border/40 font-bold'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
                  {t(l.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel>{t('reader.width')}</SectionLabel>
          <div className="flex gap-1.5 rounded-lg bg-muted/60 p-1">
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
                  onClick={() => handleSelectWidth(w.id as ReaderWidth)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[0.68rem] font-medium transition-all duration-150',
                    active
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border/40 font-bold'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span className="flex flex-col items-center gap-[2.5px] py-0.5">
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
      </div>

      {/* ── Reset ── */}
      <div className="px-4 py-2.5">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/70 transition hover:text-foreground font-medium"
        >
          <RotateCcw className="size-3" />
          {t('actions.reset')}
        </button>
      </div>
    </div>
  );
}
