import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type {
  ReaderFont,
  ReaderLayout,
  ReaderTheme,
  ReaderWidth,
} from '../../theme/config';

export type ReaderAlign = 'justify' | 'left';

export interface ReaderSettings {
  font: ReaderFont;
  fontSize: number; // px
  lineHeight: number;
  letterSpacing: number; // px (-1 to 4)
  wordSpacing: number; // px (0 to 8)
  width: ReaderWidth;
  theme: ReaderTheme;
  layout: ReaderLayout;
  align: ReaderAlign;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  font: 'literata',
  fontSize: 19,
  lineHeight: 1.7,
  letterSpacing: 0,
  wordSpacing: 0,
  width: 'normal',
  theme: 'light',
  layout: 'scroll',
  align: 'justify',
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

  const mergedSettings: ReaderSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  const update: ReaderSettingsContextValue['update'] = (key, value) =>
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, [key]: value }));

  const reset = () => setSettings(DEFAULT_SETTINGS);

  return (
    <Ctx.Provider value={{ settings: mergedSettings, update, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useReaderSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useReaderSettings must be used inside ReaderSettingsProvider');
  return v;
}
