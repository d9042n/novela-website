/**
 * Kiểu dữ liệu domain cho Novela.
 * Text đa ngôn ngữ dùng LocalizedText { vi, en } để component render theo i18n.
 */
export type Locale = 'vi' | 'en';

export interface LocalizedText {
  vi: string;
  en: string;
}

export type NovelStatus = 'ongoing' | 'completed' | 'hiatus';

export interface Genre {
  id: string;
  name: LocalizedText;
}

export interface Novel {
  id: string;
  slug: string;
  title: LocalizedText;
  author: LocalizedText;
  cover: string; // imported asset URL
  description: LocalizedText;
  genreIds: string[];
  status: NovelStatus;
  rating: number; // 0..5
  views: number;
  chapterCount: number;
  updatedAt: string; // ISO date
  featured?: boolean;
}

/** Tóm tắt chương (cho danh sách) — không kèm nội dung nặng. */
export interface ChapterSummary {
  id: string;
  novelId: string;
  index: number; // số thứ tự chương (1-based)
  title: LocalizedText;
  publishedAt: string; // ISO date
  wordCount: number;
}

/** Chương đầy đủ, có nội dung là mảng đoạn văn. */
export interface Chapter extends ChapterSummary {
  paragraphs: LocalizedText[];
}
