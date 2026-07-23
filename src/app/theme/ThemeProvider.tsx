import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  ALWAYS_DARK_THEMES,
  SITE_FONTS,
  type BrowsePreset,
  type ColorMode,
  type DetailPreset,
  type HomePreset,
  type ReaderPagePreset,
  type ShellLayout,
  type SiteFont,
  type SiteLayout,
  type SiteTheme,
} from './config';

interface ThemeContextValue {
  siteTheme: SiteTheme;
  setSiteTheme: (t: SiteTheme) => void;
  siteFont: SiteFont;
  setSiteFont: (f: SiteFont) => void;
  siteLineHeight: number;
  setSiteLineHeight: (lh: number) => void;
  siteLetterSpacing: number;
  setSiteLetterSpacing: (ls: number) => void;
  mode: ColorMode;
  toggleMode: () => void;
  isDark: boolean;
  layout: SiteLayout;
  setLayout: (l: SiteLayout) => void;
  shellLayout: ShellLayout;
  setShellLayout: (s: ShellLayout) => void;
  homePreset: HomePreset;
  setHomePreset: (hp: HomePreset) => void;
  browsePreset: BrowsePreset;
  setBrowsePreset: (bp: BrowsePreset) => void;
  detailPreset: DetailPreset;
  setDetailPreset: (dp: DetailPreset) => void;
  readerPagePreset: ReaderPagePreset;
  setReaderPagePreset: (rp: ReaderPagePreset) => void;
  resetDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [siteTheme, setSiteTheme] = useLocalStorage<SiteTheme>('novela.siteTheme', 'modern');
  const [siteFont, setSiteFont] = useLocalStorage<SiteFont>('novela.siteFont', 'inter');
  const [siteLineHeight, setSiteLineHeight] = useLocalStorage<number>('novela.siteLineHeight', 1.5);
  const [siteLetterSpacing, setSiteLetterSpacing] = useLocalStorage<number>('novela.siteLetterSpacing', 0);
  const [mode, setMode] = useLocalStorage<ColorMode>('novela.colorMode', 'light');
  const [layout, setLayout] = useLocalStorage<SiteLayout>('novela.layout', 'comfortable');
  const [shellLayout, setShellLayout] = useLocalStorage<ShellLayout>('novela.shellLayout', 'topnav');
  const [homePreset, setHomePreset] = useLocalStorage<HomePreset>('novela.homePreset', 'classic');
  const [browsePreset, setBrowsePreset] = useLocalStorage<BrowsePreset>('novela.browsePreset', 'grid');
  const [detailPreset, setDetailPreset] = useLocalStorage<DetailPreset>('novela.detailPreset', 'classic');
  const [readerPagePreset, setReaderPagePreset] = useLocalStorage<ReaderPagePreset>('novela.readerPagePreset', 'scroll');

  const forcedDark = ALWAYS_DARK_THEMES.includes(siteTheme);
  const isDark = forcedDark || mode === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-site-theme', siteTheme);
    root.setAttribute('data-layout', layout);
    root.setAttribute('data-shell-layout', shellLayout);
    root.classList.toggle('dark', isDark);

    const activeFont = SITE_FONTS.find((f) => f.id === siteFont) ?? SITE_FONTS[0];
    if (siteFont === 'inter') {
      root.style.removeProperty('--font-ui');
      root.style.removeProperty('--font-display');
    } else {
      root.style.setProperty('--font-ui', activeFont.fontCss);
      root.style.setProperty('--font-display', activeFont.fontCss);
    }

    root.style.setProperty('--site-line-height', String(siteLineHeight));
    root.style.setProperty('--site-letter-spacing', `${siteLetterSpacing}px`);
  }, [siteTheme, siteFont, siteLineHeight, siteLetterSpacing, isDark, layout, shellLayout]);

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  const resetDefaults = () => {
    setSiteTheme('modern');
    setSiteFont('inter');
    setSiteLineHeight(1.5);
    setSiteLetterSpacing(0);
    setMode('light');
    setLayout('comfortable');
    setShellLayout('topnav');
    setHomePreset('classic');
    setBrowsePreset('grid');
    setDetailPreset('classic');
    setReaderPagePreset('scroll');
  };

  return (
    <ThemeContext.Provider
      value={{
        siteTheme,
        setSiteTheme,
        siteFont,
        setSiteFont,
        siteLineHeight,
        setSiteLineHeight,
        siteLetterSpacing,
        setSiteLetterSpacing,
        mode,
        toggleMode,
        isDark,
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
        resetDefaults,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
