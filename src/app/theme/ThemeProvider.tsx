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
  siteFontUi: SiteFont;
  setSiteFontUi: (f: SiteFont) => void;
  siteFontDisplay: SiteFont;
  setSiteFontDisplay: (f: SiteFont) => void;
  siteLineHeight: number;
  setSiteLineHeight: (v: number) => void;
  siteLetterSpacing: number;
  setSiteLetterSpacing: (v: number) => void;
  mode: ColorMode;
  isDark: boolean;
  toggleMode: () => void;
  setMode: (m: ColorMode) => void;
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
  const [siteFont, setSiteFont] = useLocalStorage<SiteFont>('novela.siteFont', 'vietnam');
  const [siteFontUi, setSiteFontUi] = useLocalStorage<SiteFont>('novela.siteFontUi', 'vietnam');
  const [siteFontDisplay, setSiteFontDisplay] = useLocalStorage<SiteFont>('novela.siteFontDisplay', 'playfair');
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

    const fontUiObj = SITE_FONTS.find((f) => f.id === siteFontUi) ?? SITE_FONTS[0];
    const fontDisplayObj = SITE_FONTS.find((f) => f.id === siteFontDisplay) ?? SITE_FONTS[1];

    if (siteFontUi === 'vietnam') {
      root.style.removeProperty('--font-ui');
    } else {
      root.style.setProperty('--font-ui', fontUiObj.fontCss);
    }

    if (siteFontDisplay === 'playfair') {
      root.style.removeProperty('--font-display');
    } else {
      root.style.setProperty('--font-display', fontDisplayObj.fontCss);
    }

    root.style.setProperty('--site-line-height', String(siteLineHeight));
    root.style.setProperty('--site-letter-spacing', `${siteLetterSpacing}px`);
  }, [siteTheme, siteFontUi, siteFontDisplay, siteLineHeight, siteLetterSpacing, isDark, layout, shellLayout]);

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  const resetDefaults = () => {
    setSiteTheme('modern');
    setSiteFont('vietnam');
    setSiteFontUi('vietnam');
    setSiteFontDisplay('playfair');
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

  const handleSetSiteFont = (f: SiteFont) => {
    setSiteFont(f);
    setSiteFontUi(f);
  };

  return (
    <ThemeContext.Provider
      value={{
        siteTheme,
        setSiteTheme,
        siteFont,
        setSiteFont: handleSetSiteFont,
        siteFontUi,
        setSiteFontUi,
        siteFontDisplay,
        setSiteFontDisplay,
        siteLineHeight,
        setSiteLineHeight,
        siteLetterSpacing,
        setSiteLetterSpacing,
        mode,
        isDark,
        toggleMode,
        setMode,
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
