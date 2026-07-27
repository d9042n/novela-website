/**
 * Tầng API cho Novela — gọi backend public read-only qua client.ts.
 * Component KHÔNG fetch trực tiếp, chỉ gọi các hàm ở đây.
 *
 * Ghi chú map field (xem docs/api-spec-backend.md + notes/00-field-gap.md):
 *  - status API "ongoing"|"full" -> UI "ongoing"|"completed".
 *  - status FILTER vào API là số 0|1 (ongoing|full).
 *  - score thang /10 nullable; views = view_count (NOT NULL, default 0).
 *  - list: latest_chapter_no; detail: chapter_count -> gộp về `chapterCount`.
 *  - điều hướng chương dùng prev_no/next_no (chapter_no KHÔNG liên tục).
 *  - genre/author/source filter dùng SLUG/CODE thật từ /genres,/authors,/sources.
 */

import {
  apiGet,
  apiGetList,
  apiGetPaginated,
  type Paginated,
} from './client';
import type {
  Author,
  Chapter,
  ChapterSummary,
  Genre,
  Novel,
  NovelGenre,
  NovelStatus,
} from './types';

/* ------------------------------------------------------------------ */
/* Raw shapes trả về từ backend (snake_case).                          */
/* ------------------------------------------------------------------ */

interface RawAuthor {
  name: string;
  slug: string;
}

interface RawGenreRef {
  name: string;
  slug: string;
}

interface RawGenre {
  id: number;
  name: string;
  slug: string;
}

/** Story list item (/stories, /search). */
interface RawStoryListItem {
  slug: string;
  title: string;
  description: string;
  cover_url: string;
  status: string; // "ongoing" | "full"
  is_adult: boolean;
  score: number | null;
  latest_chapter_no: number | null;
  rating_count: number | null;
  view_count: number;
  updated_at: string | null;
  created_at: string | null;
  authors?: RawAuthor[];
  genres?: RawGenreRef[];
}

/** Story detail (/stories/{slug}). */
interface RawStoryDetail {
  slug: string;
  title: string;
  description: string;
  cover_url: string;
  status: string;
  is_adult: boolean;
  score: number | null;
  chapter_count: number | null;
  rating_count?: number | null;
  updated_at: string | null;
  authors: RawAuthor[];
  genres: RawGenreRef[];
}

interface RawChapterListItem {
  chapter_no: number;
  title: string;
  url: string;
}

interface RawChapterContent {
  chapter_no: number;
  title: string;
  content: string;
  word_count: number | null;
  url: string;
  prev_no: number | null;
  next_no: number | null;
}

/* ------------------------------------------------------------------ */
/* Mappers raw -> domain.                                              */
/* ------------------------------------------------------------------ */

/**
 * Chuẩn hóa `description` lấy từ nguồn crawl.
 *
 * Nguồn nhả mô tả dưới dạng nhiều block HTML dán liền nhau nên hay mất space ở
 * chỗ nối câu ("…xắn tay áo mà làm.Không ngờ…") và ngược lại có chỗ thừa cả
 * run space/newline ("…bi thảm.   Trong nguyên tác…"). Sửa ở mapper để mọi chỗ
 * render (card, hero, detail) nhận cùng một chuỗi sạch.
 *
 * Chỉ chèn space khi ký tự sau dấu câu là CHỮ HOA — nhờ vậy "3.5", "..." hay
 * "v.v." không bị tách.
 *
 * Nháy thẳng (") tách làm hai luật vì nó vừa là mở vừa là đóng:
 *  - sau .!?… thì gần như chắc chắn là nháy ĐÓNG (…tạo phản?"Tần Thịnh…) -> space
 *    đi sau nháy.
 *  - sau ,;: thì là nháy MỞ (…hỏi Tần Thịnh:"Vì sao…) -> để nguyên, chèn space
 *    vào đây là đẩy nó vào trong lời thoại.
 */
function normalizeDescription(raw: string): string {
  return raw
    .replace(/([.!?…][”’")\]]?)(\p{Lu})/gu, '$1 $2')
    .replace(/([,;:][”’)\]]?)(\p{Lu})/gu, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapStatus(raw: string): NovelStatus {
  // API: "full" -> UI "completed"; mọi giá trị khác coi như "ongoing".
  return raw === 'full' ? 'completed' : 'ongoing';
}

function mapAuthors(raw?: RawAuthor[]): Author[] {
  return (raw ?? []).map((a) => ({ name: a.name, slug: a.slug }));
}

function mapGenreRefs(raw?: RawGenreRef[]): NovelGenre[] {
  return (raw ?? []).map((g) => ({ name: g.name, slug: g.slug }));
}

function mapListItem(raw: RawStoryListItem): Novel {
  return {
    slug: raw.slug,
    title: raw.title,
    description: normalizeDescription(raw.description ?? ''),
    cover: raw.cover_url ?? '',
    status: mapStatus(raw.status),
    isAdult: raw.is_adult,
    score: raw.score,
    ratingCount: raw.rating_count,
    views: raw.view_count ?? 0,
    chapterCount: raw.latest_chapter_no,
    updatedAt: raw.updated_at,
    authors: mapAuthors(raw.authors),
    genres: mapGenreRefs(raw.genres),
  };
}

function mapDetail(raw: RawStoryDetail): Novel {
  return {
    slug: raw.slug,
    title: raw.title,
    description: normalizeDescription(raw.description ?? ''),
    cover: raw.cover_url ?? '',
    status: mapStatus(raw.status),
    isAdult: raw.is_adult,
    score: raw.score,
    ratingCount: raw.rating_count ?? null,
    views: 0, // detail KHÔNG trả view_count; hiển thị views chủ yếu ở list/card.
    chapterCount: raw.chapter_count,
    updatedAt: raw.updated_at,
    authors: mapAuthors(raw.authors),
    genres: mapGenreRefs(raw.genres),
  };
}

function mapChapterSummary(raw: RawChapterListItem): ChapterSummary {
  return { chapterNo: raw.chapter_no, title: raw.title, url: raw.url };
}

/**
 * Tách `content` thành danh sách đoạn văn.
 *
 * Backend trả nội dung chương với MỘT `\n` giữa các đoạn (không phải dòng
 * trống), nên phải cắt theo `\n+` — cắt theo `\n{2,}` sẽ gộp cả chương thành
 * một đoạn duy nhất. `\n+` vẫn xử lý đúng nếu nguồn dùng dòng trống.
 */
function splitParagraphs(content: string): string[] {
  return content
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function mapChapter(raw: RawChapterContent): Chapter {
  return {
    chapterNo: raw.chapter_no,
    title: raw.title,
    content: raw.content,
    paragraphs: splitParagraphs(raw.content),
    wordCount: raw.word_count,
    url: raw.url,
    prevNo: raw.prev_no,
    nextNo: raw.next_no,
  };
}

/* ------------------------------------------------------------------ */
/* Sort: UI key -> API sort token.                                     */
/* ------------------------------------------------------------------ */

/**
 * Khóa sort dùng ở UI (giữ nguyên 4 lựa chọn hiện có của trang Browse).
 * `views` và `rating` là 2 option TÁCH BIỆT (note 02):
 *   popular -> view_count (hệ thống tự tracking)
 *   rating  -> source_score (điểm cào sẵn)
 */
export type SortKey = 'popular' | 'latest' | 'rating' | 'title';

const SORT_MAP: Record<SortKey, string> = {
  popular: '-views',
  latest: '-updated',
  rating: '-score,-rating_count',
  title: 'title',
};

function mapSort(sort?: SortKey): string | undefined {
  if (!sort) return undefined;
  return SORT_MAP[sort];
}

/** status UI -> mã số filter API (ongoing->0, completed->1). */
function statusToFilter(list?: NovelStatus[]): number[] | undefined {
  if (!list || list.length === 0) return undefined;
  return list.map((s) => (s === 'completed' ? 1 : 0));
}

/* ------------------------------------------------------------------ */
/* Public API.                                                         */
/* ------------------------------------------------------------------ */

/** Danh mục thể loại (46 slug VN thật). Fetch động, KHÔNG hardcode. */
export function getGenres(): Promise<Genre[]> {
  return apiGetList<RawGenre, Genre>('/genres', (g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
  }));
}

export interface BrowseParams {
  query?: string;
  /** genre slugs (VN thật). */
  genreSlugs?: string[];
  statusList?: NovelStatus[];
  /**
   * source code (vd 'truyenmacothat', 'metruyenhot') — lọc theo nguồn cào.
   * Backend đã hỗ trợ `?source=` từ trước; trước đây tầng này bỏ qua nên
   * `/browse?source=x` không có tác dụng gì.
   */
  sourceCodes?: string[];
  sort?: SortKey;
  page?: number;
  size?: number;
}

/**
 * Danh sách/tìm kiếm truyện — server pagination (D4: KHÔNG load hết).
 * Có `query` -> gọi /search (FTS bỏ dấu); không -> /stories.
 */
export function browseNovels(params: BrowseParams): Promise<Paginated<Novel>> {
  const { query, genreSlugs, statusList, sourceCodes, sort, page = 1, size = 18 } = params;
  const q = query?.trim();

  const common = {
    genre: genreSlugs && genreSlugs.length > 0 ? genreSlugs : undefined,
    // Mảng rỗng -> undefined, không phải '': buildQuery bỏ undefined khỏi URL,
    // còn `source=` rỗng sẽ bị backend hiểu là "lọc theo nguồn tên rỗng" và trả 0.
    source: sourceCodes && sourceCodes.length > 0 ? sourceCodes : undefined,
    status: statusToFilter(statusList),
    sort: mapSort(sort),
    page,
    size,
  };

  if (q) {
    return apiGetPaginated<RawStoryListItem, Novel>(
      '/search',
      { q, ...common },
      mapListItem,
    );
  }
  return apiGetPaginated<RawStoryListItem, Novel>('/stories', common, mapListItem);
}

/** Trang chủ — mới cập nhật (sort mặc định updated:desc). */
export async function getLatestNovels(limit = 12): Promise<Novel[]> {
  const res = await apiGetPaginated<RawStoryListItem, Novel>(
    '/stories',
    { sort: '-updated', size: limit, page: 1 },
    mapListItem,
  );
  return res.items;
}

/** Trang chủ — đọc nhiều nhất (view_count). */
export async function getPopularNovels(limit = 12): Promise<Novel[]> {
  const res = await apiGetPaginated<RawStoryListItem, Novel>(
    '/stories',
    { sort: '-views', size: limit, page: 1 },
    mapListItem,
  );
  return res.items;
}

/**
 * Hero carousel — API KHÔNG có cờ featured (D6): dùng top score + rating_count.
 */
export async function getFeaturedNovels(limit = 6): Promise<Novel[]> {
  const res = await apiGetPaginated<RawStoryListItem, Novel>(
    '/stories',
    { sort: '-score,-rating_count', size: limit, page: 1 },
    mapListItem,
  );
  return res.items;
}

/** Chi tiết truyện theo slug. Ném ApiError(404) khi slug không tồn tại. */
export function getNovelBySlug(slug: string): Promise<Novel> {
  return apiGet<RawStoryDetail>(`/stories/${encodeURIComponent(slug)}`).then(
    mapDetail,
  );
}

export interface ChapterListParams {
  page?: number;
  size?: number;
  order?: 'asc' | 'desc';
  /** keyset cursor: chương strictly sau chapter_no này. */
  after?: number;
}

/**
 * Danh sách chương — server pagination (truyện có thể >11.000 chương).
 * `total` LUÔN là tổng số chương thật, bất biến qua mọi window.
 */
export function getChapterList(
  slug: string,
  params: ChapterListParams = {},
): Promise<Paginated<ChapterSummary>> {
  const { page = 1, size = 50, order, after } = params;
  return apiGetPaginated<RawChapterListItem, ChapterSummary>(
    `/stories/${encodeURIComponent(slug)}/chapters`,
    { page, size, order, after },
    mapChapterSummary,
  );
}

/** Nội dung 1 chương theo chapter_no. Ném ApiError(404) khi không tồn tại. */
export function getChapter(slug: string, chapterNo: number): Promise<Chapter> {
  return apiGet<RawChapterContent>(
    `/stories/${encodeURIComponent(slug)}/chapters/${chapterNo}`,
  ).then(mapChapter);
}
