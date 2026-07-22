import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type {
  ReaderFont,
  ReaderLayout,
  ReaderTheme,
  ReaderWidth,
} from '../../theme/config';

export interface ReaderSettings {
  font: ReaderFont;
  fontSize: number; // px
  lineHeight: number;
  width: ReaderWidth;
  theme: ReaderTheme;
  layout: ReaderLayout;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  font: 'literata',
  fontSize: 19,
  lineHeight: 1.7,
  width: 'normal',
  theme: 'light',
  layout: 'scroll',
};

interface ReaderSettingsContextValue {
  settings: ReaderSettings;
  update: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  reset: () => void;
}

const Ctx = createContext<ReaderSettingsContextValue | null>(null);

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<ReaderSettings>(
    'novela.readerSettings',
    DEFAULT_SETTINGS,
  );

  const update: ReaderSettingsContextValue['update'] = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const reset = () => setSettings(DEFAULT_SETTINGS);

  return <Ctx.Provider value={{ settings, update, reset }}>{children}</Ctx.Provider>;
}

export function useReaderSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useReaderSettings must be used within ReaderSettingsProvider');
  return ctx;
}

export { DEFAULT_SETTINGS };
