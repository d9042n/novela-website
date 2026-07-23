/** Config theme giao diện & reader — khai báo dạng data, không hardcode trong component. */

export type SiteTheme = 'modern' | 'minimal' | 'glass' | 'sapphire' | 'emerald' | 'velvet' | 'amethyst';
export type ColorMode = 'light' | 'dark';

export const SITE_THEMES: { id: SiteTheme; labelKey: string; swatch: string }[] = [
  { id: 'modern', labelKey: 'settings.siteThemes.modern', swatch: '#4f46e5' },
  { id: 'minimal', labelKey: 'settings.siteThemes.minimal', swatch: '#171717' },
  { id: 'glass', labelKey: 'settings.siteThemes.glass', swatch: '#00f8f1' },
  { id: 'sapphire', labelKey: 'settings.siteThemes.sapphire', swatch: '#3b82f6' },
  { id: 'emerald', labelKey: 'settings.siteThemes.emerald', swatch: '#10b981' },
  { id: 'velvet', labelKey: 'settings.siteThemes.velvet', swatch: '#fb7185' },
  { id: 'amethyst', labelKey: 'settings.siteThemes.amethyst', swatch: '#7c3aed' },
];

// Tình trạng khóa dark mode (rỗng = mọi theme đều hỗ trợ cả sáng & tối 100%)
export const ALWAYS_DARK_THEMES: SiteTheme[] = [];

export type SiteFont =
  | 'vietnam'
  | 'inter'
  | 'playfair'
  | 'literata'
  | 'lora'
  | 'garamond'
  | 'crimson'
  | 'spectral'
  | 'cormorant'
  | 'merriweather'
  | 'noto-serif'
  | 'bitter'
  | 'nunito';

export const SITE_FONTS: { id: SiteFont; name: string; labelKey: string; fontCss: string }[] = [
  { id: 'vietnam', name: 'Be Vietnam Pro (Mặc định UI)', labelKey: 'settings.siteFonts.vietnam', fontCss: "'Be Vietnam Pro', 'Inter', system-ui, sans-serif" },
  { id: 'playfair', name: 'Playfair Display (Mặc định Display)', labelKey: 'settings.siteFonts.playfair', fontCss: "'Playfair Display', 'Literata', Georgia, serif" },
  { id: 'inter', name: 'Inter', labelKey: 'settings.siteFonts.inter', fontCss: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" },
  { id: 'literata', name: 'Literata', labelKey: 'settings.siteFonts.literata', fontCss: "'Literata', Georgia, serif" },
  { id: 'lora', name: 'Lora', labelKey: 'settings.siteFonts.lora', fontCss: "'Lora', Georgia, serif" },
  { id: 'garamond', name: 'EB Garamond', labelKey: 'settings.siteFonts.garamond', fontCss: "'EB Garamond', Georgia, serif" },
  { id: 'crimson', name: 'Crimson Pro', labelKey: 'settings.siteFonts.crimson', fontCss: "'Crimson Pro', Georgia, serif" },
  { id: 'spectral', name: 'Spectral', labelKey: 'settings.siteFonts.spectral', fontCss: "'Spectral', Georgia, serif" },
  { id: 'cormorant', name: 'Cormorant Garamond', labelKey: 'settings.siteFonts.cormorant', fontCss: "'Cormorant Garamond', Georgia, serif" },
  { id: 'merriweather', name: 'Merriweather', labelKey: 'settings.siteFonts.merriweather', fontCss: "'Merriweather', Georgia, serif" },
  { id: 'noto-serif', name: 'Noto Serif', labelKey: 'settings.siteFonts.notoSerif', fontCss: "'Noto Serif', Georgia, serif" },
  { id: 'bitter', name: 'Bitter', labelKey: 'settings.siteFonts.bitter', fontCss: "'Bitter', Georgia, serif" },
  { id: 'nunito', name: 'Nunito', labelKey: 'settings.siteFonts.nunito', fontCss: "'Nunito', sans-serif" },
];

export type SiteLayout = 'comfortable' | 'compact' | 'list';

/* --- Bố cục Khung Ứng Dụng toàn trang (App Shell Layouts) --- */
export type ShellLayout = 'topnav' | 'sidebar' | 'dock';

export const SHELL_LAYOUTS: { id: ShellLayout; labelKey: string }[] = [
  { id: 'topnav', labelKey: 'settings.shellLayouts.topnav' },
  { id: 'sidebar', labelKey: 'settings.shellLayouts.sidebar' },
  { id: 'dock', labelKey: 'settings.shellLayouts.dock' },
];

/* --- Mẫu Bố cục Trang Chủ (Home Page Presets) --- */
export type HomePreset = 'classic' | 'portal' | 'reels' | 'magazine';

export const HOME_PRESETS: { id: HomePreset; labelKey: string }[] = [
  { id: 'classic', labelKey: 'settings.homePresets.classic' },
  { id: 'portal', labelKey: 'settings.homePresets.portal' },
  { id: 'reels', labelKey: 'settings.homePresets.reels' },
  { id: 'magazine', labelKey: 'settings.homePresets.magazine' },
];

/* --- Mẫu Bố cục Trang Duyệt Truyện (Browse Page Presets) --- */
export type BrowsePreset = 'grid' | 'sidebar';

export const BROWSE_PRESETS: { id: BrowsePreset; labelKey: string }[] = [
  { id: 'grid', labelKey: 'settings.browsePresets.grid' },
  { id: 'sidebar', labelKey: 'settings.browsePresets.sidebar' },
];

/* --- Mẫu Bố cục Trang Chi Tiết Truyện (Novel Detail Presets) --- */
export type DetailPreset = 'classic' | 'cinematic' | 'minimal';

export const DETAIL_PRESETS: { id: DetailPreset; labelKey: string }[] = [
  { id: 'classic', labelKey: 'settings.detailPresets.classic' },
  { id: 'cinematic', labelKey: 'settings.detailPresets.cinematic' },
  { id: 'minimal', labelKey: 'settings.detailPresets.minimal' },
];

/* --- Mẫu Bố cục Trang Đọc Truyện (Reader Page Presets) --- */
export type ReaderPagePreset = 'scroll' | 'drawer' | 'paged';

export const READER_PAGE_PRESETS: { id: ReaderPagePreset; labelKey: string }[] = [
  { id: 'scroll', labelKey: 'settings.readerPagePresets.scroll' },
  { id: 'drawer', labelKey: 'settings.readerPagePresets.drawer' },
  { id: 'paged', labelKey: 'settings.readerPagePresets.paged' },
];

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

export type ReaderTheme = 'light' | 'sepia' | 'emerald' | 'mocha' | 'nordic' | 'dark' | 'ocean' | 'oled';
export type ReaderLayout = 'scroll' | 'paged' | 'wide';
export type ReaderFont = 'literata' | 'lora' | 'merriweather' | 'noto-serif' | 'sans';
export type ReaderWidth = 'narrow' | 'normal' | 'wide';

export const READER_THEMES: { id: ReaderTheme; labelKey: string; swatch: string; fg: string }[] = [
  { id: 'light', labelKey: 'reader.themes.light', swatch: '#ffffff', fg: '#0f172a' },
  { id: 'sepia', labelKey: 'reader.themes.sepia', swatch: '#f8f1e3', fg: '#43302b' },
  { id: 'emerald', labelKey: 'reader.themes.emerald', swatch: '#e8f5e9', fg: '#064e3b' },
  { id: 'mocha', labelKey: 'reader.themes.mocha', swatch: '#f5ebe0', fg: '#3e2723' },
  { id: 'nordic', labelKey: 'reader.themes.nordic', swatch: '#e2e8f0', fg: '#0f172a' },
  { id: 'dark', labelKey: 'reader.themes.dark', swatch: '#1e1e24', fg: '#f3f4f6' },
  { id: 'ocean', labelKey: 'reader.themes.ocean', swatch: '#0f172a', fg: '#f8fafc' },
  { id: 'oled', labelKey: 'reader.themes.oled', swatch: '#000000', fg: '#f3f4f6' },
];

export const READER_LAYOUTS: { id: ReaderLayout; labelKey: string }[] = [
  { id: 'scroll', labelKey: 'reader.layouts.scroll' },
  { id: 'paged', labelKey: 'reader.layouts.paged' },
  { id: 'wide', labelKey: 'reader.layouts.wide' },
];

export type ReaderFont =
  | 'literata'
  | 'lora'
  | 'merriweather'
  | 'noto-serif'
  | 'vietnam'
  | 'inter'
  | 'garamond'
  | 'crimson'
  | 'spectral'
  | 'cormorant'
  | 'bitter'
  | 'nunito'
  | 'playfair'
  | 'sans';

export const READER_FONTS: { id: ReaderFont; name: string; labelKey: string; cssVar: string }[] = [
  { id: 'literata', name: 'Literata', labelKey: 'reader.fonts.literata', cssVar: "var(--reading-literata, 'Literata', Georgia, serif)" },
  { id: 'lora', name: 'Lora', labelKey: 'reader.fonts.lora', cssVar: "var(--reading-lora, 'Lora', Georgia, serif)" },
  { id: 'merriweather', name: 'Merriweather', labelKey: 'reader.fonts.merriweather', cssVar: "var(--reading-merriweather, 'Merriweather', Georgia, serif)" },
  { id: 'noto-serif', name: 'Noto Serif', labelKey: 'reader.fonts.noto-serif', cssVar: "var(--reading-noto-serif, 'Noto Serif', Georgia, serif)" },
  { id: 'vietnam', name: 'Be Vietnam Pro (Sans)', labelKey: 'settings.siteFonts.vietnam', cssVar: "var(--reading-sans, 'Be Vietnam Pro', 'Inter', system-ui, sans-serif)" },
  { id: 'inter', name: 'Inter', labelKey: 'settings.siteFonts.inter', cssVar: "'Inter', -apple-system, system-ui, sans-serif" },
  { id: 'garamond', name: 'EB Garamond', labelKey: 'settings.siteFonts.garamond', cssVar: "'EB Garamond', Georgia, serif" },
  { id: 'crimson', name: 'Crimson Pro', labelKey: 'settings.siteFonts.crimson', cssVar: "'Crimson Pro', Georgia, serif" },
  { id: 'spectral', name: 'Spectral', labelKey: 'settings.siteFonts.spectral', cssVar: "'Spectral', Georgia, serif" },
  { id: 'cormorant', name: 'Cormorant', labelKey: 'settings.siteFonts.cormorant', cssVar: "'Cormorant Garamond', Georgia, serif" },
  { id: 'bitter', name: 'Bitter', labelKey: 'settings.siteFonts.bitter', cssVar: "'Bitter', Georgia, serif" },
  { id: 'nunito', name: 'Nunito', labelKey: 'settings.siteFonts.nunito', cssVar: "'Nunito', sans-serif" },
  { id: 'playfair', name: 'Playfair Display', labelKey: 'settings.siteFonts.playfair', cssVar: "'Playfair Display', Georgia, serif" },
  { id: 'sans', name: 'System Sans', labelKey: 'reader.fonts.sans', cssVar: "var(--reading-sans, 'Be Vietnam Pro', 'Inter', system-ui, sans-serif)" },
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
