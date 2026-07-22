/** Config theme giao diện & reader — khai báo dạng data, không hardcode trong component. */

export type SiteTheme = 'modern' | 'minimal' | 'glass';
export type ColorMode = 'light' | 'dark';

export const SITE_THEMES: { id: SiteTheme; labelKey: string; swatch: string }[] = [
  { id: 'modern', labelKey: 'settings.siteThemes.modern', swatch: '#4f46e5' },
  { id: 'minimal', labelKey: 'settings.siteThemes.minimal', swatch: '#171717' },
  { id: 'glass', labelKey: 'settings.siteThemes.glass', swatch: '#00f8f1' },
];

// Glass theme luôn tối → mode bị khoá về dark khi ở glass.
export const ALWAYS_DARK_THEMES: SiteTheme[] = ['glass'];

/* --- Bố cục hiển thị toàn site (áp cho lưới truyện ở Home/Browse) --- */
export type SiteLayout = 'comfortable' | 'compact' | 'list';

export const SITE_LAYOUTS: {
  id: SiteLayout;
  labelKey: string;
  /** class lưới áp cho NovelGrid */
  gridClass: string;
}[] = [
  {
    id: 'comfortable',
    labelKey: 'settings.layouts.comfortable',
    gridClass: 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  },
  {
    id: 'compact',
    labelKey: 'settings.layouts.compact',
    gridClass:
      'grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8',
  },
  {
    id: 'list',
    labelKey: 'settings.layouts.list',
    gridClass: 'flex flex-col divide-y divide-border',
  },
];

export function gridClassFor(id: SiteLayout): string {
  return SITE_LAYOUTS.find((l) => l.id === id)?.gridClass ?? SITE_LAYOUTS[0].gridClass;
}

export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';
export type ReaderLayout = 'scroll' | 'paged' | 'wide';
export type ReaderFont = 'literata' | 'lora' | 'merriweather' | 'noto-serif' | 'sans';
export type ReaderWidth = 'narrow' | 'normal' | 'wide';

export const READER_THEMES: { id: ReaderTheme; labelKey: string; swatch: string; fg: string }[] = [
  { id: 'light', labelKey: 'reader.themes.light', swatch: '#fbfbfb', fg: '#1a1a1a' },
  { id: 'sepia', labelKey: 'reader.themes.sepia', swatch: '#f8f1e3', fg: '#5f4b32' },
  { id: 'dark', labelKey: 'reader.themes.dark', swatch: '#121212', fg: '#b0b0b0' },
  { id: 'oled', labelKey: 'reader.themes.oled', swatch: '#000000', fg: '#c9c9c9' },
];

export const READER_LAYOUTS: { id: ReaderLayout; labelKey: string }[] = [
  { id: 'scroll', labelKey: 'reader.layouts.scroll' },
  { id: 'paged', labelKey: 'reader.layouts.paged' },
  { id: 'wide', labelKey: 'reader.layouts.wide' },
];

export const READER_FONTS: { id: ReaderFont; labelKey: string; cssVar: string }[] = [
  { id: 'literata', labelKey: 'reader.fonts.literata', cssVar: 'var(--reading-literata)' },
  { id: 'lora', labelKey: 'reader.fonts.lora', cssVar: 'var(--reading-lora)' },
  { id: 'merriweather', labelKey: 'reader.fonts.merriweather', cssVar: 'var(--reading-merriweather)' },
  { id: 'noto-serif', labelKey: 'reader.fonts.noto-serif', cssVar: 'var(--reading-noto-serif)' },
  { id: 'sans', labelKey: 'reader.fonts.sans', cssVar: 'var(--reading-sans)' },
];

export const READER_WIDTHS: { id: ReaderWidth; labelKey: string; maxWidth: number }[] = [
  { id: 'narrow', labelKey: 'reader.widths.narrow', maxWidth: 560 },
  { id: 'normal', labelKey: 'reader.widths.normal', maxWidth: 680 },
  { id: 'wide', labelKey: 'reader.widths.wide', maxWidth: 820 },
];

export function fontCssVar(id: ReaderFont): string {
  return READER_FONTS.find((f) => f.id === id)?.cssVar ?? 'var(--reading-literata)';
}

export function widthPx(id: ReaderWidth): number {
  return READER_WIDTHS.find((w) => w.id === id)?.maxWidth ?? 680;
}
