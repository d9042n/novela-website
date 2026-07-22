import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ALWAYS_DARK_THEMES, type ColorMode, type SiteLayout, type SiteTheme } from './config';

interface ThemeContextValue {
  siteTheme: SiteTheme;
  setSiteTheme: (t: SiteTheme) => void;
  mode: ColorMode;
  toggleMode: () => void;
  isDark: boolean;
  layout: SiteLayout;
  setLayout: (l: SiteLayout) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [siteTheme, setSiteTheme] = useLocalStorage<SiteTheme>('novela.siteTheme', 'modern');
  const [mode, setMode] = useLocalStorage<ColorMode>('novela.colorMode', 'light');
  const [layout, setLayout] = useLocalStorage<SiteLayout>('novela.layout', 'comfortable');

  const forcedDark = ALWAYS_DARK_THEMES.includes(siteTheme);
  const isDark = forcedDark || mode === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-site-theme', siteTheme);
    root.setAttribute('data-layout', layout);
    root.classList.toggle('dark', isDark);
  }, [siteTheme, isDark, layout]);

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider
      value={{ siteTheme, setSiteTheme, mode, toggleMode, isDark, layout, setLayout }}
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
