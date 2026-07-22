import { useTranslation } from 'react-i18next';
import type { Locale, LocalizedText } from '../data/types';

/** Trả về hàm lấy chuỗi theo ngôn ngữ hiện tại từ LocalizedText. */
export function useLocalized() {
  const { i18n } = useTranslation();
  const locale = (i18n.language?.startsWith('en') ? 'en' : 'vi') as Locale;
  const t = (text: LocalizedText) => text[locale];
  return { locale, t };
}
