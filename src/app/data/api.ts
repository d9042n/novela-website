import type { Chapter, ChapterSummary, Locale, Novel } from './types';
import { NOVELS } from './novels';
import { GENRES } from './genres';
import { getChapter as buildChapter, getChapterList as buildChapterList } from './chapters';

/**
 * Lớp API mock — trả Promise để dễ thay bằng backend/Supabase thật sau này.
 * Component chỉ gọi qua đây, không đọc trực tiếp mảng data.
 */

const delay = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export type SortKey = 'popular' | 'latest' | 'rating' | 'title';

export interface BrowseParams {
  query?: string;
  genreId?: string;
  genreIds?: string[];
  statusList?: ('ongoing' | 'completed')[];
  sort?: SortKey;
  locale?: Locale;
}

export function getGenres() {
  return delay(GENRES);
}

export function getNovels() {
  return delay(NOVELS);
}

export function getFeaturedNovels() {
  return delay(NOVELS.filter((n) => n.featured));
}

export function getLatestNovels(limit = 12) {
  const sorted = [...NOVELS].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return delay(sorted.slice(0, limit));
}

export function getPopularNovels(limit = 12) {
  const sorted = [...NOVELS].sort((a, b) => b.views - a.views);
  return delay(sorted.slice(0, limit));
}

export function getNovelById(id: string): Promise<Novel | undefined> {
  return delay(NOVELS.find((n) => n.id === id));
}

export function getNovelBySlug(slug: string): Promise<Novel | undefined> {
  return delay(NOVELS.find((n) => n.slug === slug));
}

export function getNovelsByGenre(genreId: string, limit = 12) {
  return delay(NOVELS.filter((n) => n.genreIds.includes(genreId)).slice(0, limit));
}

export function browseNovels({
  query = '',
  genreId,
  genreIds,
  statusList,
  sort = 'popular',
  locale = 'vi',
}: BrowseParams): Promise<Novel[]> {
  let result = [...NOVELS];

  // 1. Kết hợp lọc theo từ khóa tìm kiếm (Tên truyện, Tác giả, Mô tả)
  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (n) =>
        n.title[locale].toLowerCase().includes(q) ||
        n.title.vi.toLowerCase().includes(q) ||
        n.title.en.toLowerCase().includes(q) ||
        n.author[locale].toLowerCase().includes(q) ||
        n.author.vi.toLowerCase().includes(q) ||
        n.author.en.toLowerCase().includes(q) ||
        n.description[locale].toLowerCase().includes(q) ||
        n.description.vi.toLowerCase().includes(q),
    );
  }

  // 2. Kết hợp lọc Multiple Thể loại (Genre Multi-Select)
  const activeGenres =
    genreIds && genreIds.length > 0 ? genreIds : genreId ? [genreId] : [];
  if (activeGenres.length > 0) {
    result = result.filter((n) =>
      activeGenres.some((gid) => n.genreIds.includes(gid)),
    );
  }

  // 3. Kết hợp lọc Multiple Trạng thái (Ongoing, Completed)
  if (statusList && statusList.length > 0) {
    result = result.filter((n) => statusList.includes(n.status));
  }

  // 4. Sắp xếp kết quả kết hợp (Sorting)
  switch (sort) {
    case 'latest':
      result.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'title':
      result.sort((a, b) => a.title[locale].localeCompare(b.title[locale]));
      break;
    case 'popular':
    default:
      result.sort((a, b) => b.views - a.views);
      break;
  }

  return delay(result);
}

export function getChapterList(novelId: string): Promise<ChapterSummary[]> {
  return delay(buildChapterList(novelId));
}

export function getChapter(
  novelId: string,
  chapterIndex: number,
): Promise<Chapter | undefined> {
  return delay(buildChapter(novelId, chapterIndex));
}
