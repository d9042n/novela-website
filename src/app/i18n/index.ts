import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi.json';
import en from './locales/en.json';
import type { Locale } from '../data/types';

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const STORAGE_KEY = 'novela.lang';

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'vi';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'vi' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  // Mặc định luôn Tiếng Việt (không phụ thuộc ngôn ngữ trình duyệt).
  return 'vi';
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: detectInitialLocale(),
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on('languageChanged', (lng) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.setAttribute('lang', lng);
  } catch {
    /* ignore */
  }
});

document.documentElement.setAttribute('lang', i18n.language);

export default i18n;
