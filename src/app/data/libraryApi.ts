/**
 * Tầng API tủ sách — core Django, prefix `/library`. MỌI endpoint cần Bearer.
 *
 * Hợp đồng đã verify bằng curl thật:
 *  - List trả envelope `{data,page,size,total,total_pages}` GIỐNG HỆT backend Go
 *    -> tái dùng được shape `PageEnvelope`. Nhưng single-item trả **object trần**,
 *    không envelope.
 *  - `page` >= 1, `size` 1..100. Vượt -> **422**, KHÔNG clamp âm thầm như Go.
 *  - `PUT` idempotent: **201** lần đầu, **200** lần sau (cùng id, cùng created_at).
 *  - `DELETE` -> **204**; gọi lại -> **404** (KHÔNG idempotent).
 *  - `GET` single -> **404** khi chưa có. Với bookmark thì 404 là câu trả lời
 *    BÌNH THƯỜNG ("chưa đánh dấu"), không phải lỗi — dùng như boolean toggle.
 *  - `PUT /reading-progress/{slug}` body `{chapter_no}` -> **404** nếu chương
 *    không thuộc truyện đó, và cũng 404 với `chapter_no` <= 0 (schema không có
 *    ràng buộc `ge`, số âm lọt xuống query rồi không khớp row nào).
 */

import type { PageEnvelope, Paginated } from './client';
import { authorizedRequest } from './authApi';
import type { Bookmark, ChapterBrief, ServerReadingProgress, StoryBrief } from './types';
import type { NovelStatus } from './types';

/* ------------------------------------------------------------------ */
/* Raw shapes trả về từ core (snake_case).                            */
/* ------------------------------------------------------------------ */

interface RawStoryBrief {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
  is_adult: boolean;
  status: string;
}

interface RawChapterBrief {
  id: number;
  chapter_no: number;
  title: string;
}

interface RawBookmark {
  id: number;
  story: RawStoryBrief;
  created_at: string;
}

interface RawReadingProgress {
  story: RawStoryBrief;
  chapter: RawChapterBrief;
  updated_at: string;
  scroll_percent?: number | null;
}

/* ------------------------------------------------------------------ */
/* Mappers raw -> domain.                                             */
/* ------------------------------------------------------------------ */

/** Core trả `"ongoing"` | `"full"`; UI dùng `completed` cho `full`. */
function mapStatus(raw: string): NovelStatus {
  return raw === 'full' ? 'completed' : 'ongoing';
}

function mapStoryBrief(raw: RawStoryBrief): StoryBrief {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    // Core KHÔNG fallback sang cover_url_origin như backend Go -> gần như luôn
    // null ở prod. Đưa về '' để component dùng ImageWithFallback như chỗ khác.
    cover: raw.cover_url ?? '',
    isAdult: raw.is_adult,
    status: mapStatus(raw.status),
  };
}

function mapBookmark(raw: RawBookmark): Bookmark {
  return {
    id: raw.id,
    story: mapStoryBrief(raw.story),
    createdAt: raw.created_at,
  };
}

function mapChapterBrief(raw: RawChapterBrief): ChapterBrief {
  return { id: raw.id, chapterNo: raw.chapter_no, title: raw.title };
}

function mapReadingProgress(raw: RawReadingProgress): ServerReadingProgress {
  return {
    story: mapStoryBrief(raw.story),
    chapter: mapChapterBrief(raw.chapter),
    updatedAt: raw.updated_at,
    scrollPercent: raw.scroll_percent ?? null,
  };
}

/**
 * Envelope core giống Go nhưng đường đi khác (`authorizedRequest` để có Bearer +
 * auto-refresh), nên không dùng lại `apiGetPaginated` được.
 */
function mapPage<T, U>(env: PageEnvelope<T>, mapItem: (raw: T) => U): Paginated<U> {
  return {
    items: (env.data ?? []).map(mapItem),
    page: env.page,
    size: env.size,
    total: env.total,
    totalPages: env.total_pages,
    // Core không có keyset cursor, chỉ page/size.
    nextCursor: null,
  };
}

export interface LibraryPageParams {
  page?: number;
  /** 1..100. Vượt -> 422 từ server. */
  size?: number;
}

/* ------------------------------------------------------------------ */
/* Public API — bookmarks.                                            */
/* ------------------------------------------------------------------ */

/** Danh sách truyện đã đánh dấu, mới nhất trước (`created_at DESC`). */
export async function listBookmarks(
  params: LibraryPageParams = {},
): Promise<Paginated<Bookmark>> {
  const env = await authorizedRequest<PageEnvelope<RawBookmark>>('/library/bookmarks', {
    params: { page: params.page, size: params.size },
  });
  return mapPage(env, mapBookmark);
}

/**
 * Truyện này đã đánh dấu chưa.
 *
 * Trả `null` khi chưa (server 404) — nuốt 404 ở đây có chủ ý: với bookmark thì
 * "chưa có" là trạng thái hợp lệ, bắt mọi call-site tự `try/catch` chỉ để hỏi
 * một câu boolean là thừa.
 */
export async function getBookmark(slug: string): Promise<Bookmark | null> {
  try {
    const raw = await authorizedRequest<RawBookmark>(
      `/library/bookmarks/${encodeURIComponent(slug)}`,
    );
    return mapBookmark(raw);
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

/** Đánh dấu truyện. Idempotent: gọi lại vẫn thành công (200 thay vì 201). */
export async function addBookmark(slug: string): Promise<Bookmark> {
  const raw = await authorizedRequest<RawBookmark>(
    `/library/bookmarks/${encodeURIComponent(slug)}`,
    { method: 'PUT' },
  );
  return mapBookmark(raw);
}

/**
 * Bỏ đánh dấu. Nuốt 404 để hàm này idempotent phía client — bấm bỏ đánh dấu 2
 * lần (hoặc 2 tab cùng bỏ) không nên báo lỗi cho user.
 */
export async function removeBookmark(slug: string): Promise<void> {
  try {
    await authorizedRequest<void>(`/library/bookmarks/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    if (isNotFound(err)) return;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Public API — reading progress.                                     */
/* ------------------------------------------------------------------ */

/** Tiến độ đọc trên server, mới nhất trước (`updated_at DESC`). */
export async function listReadingProgress(
  params: LibraryPageParams = {},
): Promise<Paginated<ServerReadingProgress>> {
  const env = await authorizedRequest<PageEnvelope<RawReadingProgress>>(
    '/library/reading-progress',
    { params: { page: params.page, size: params.size } },
  );
  return mapPage(env, mapReadingProgress);
}

/** Tiến độ của một truyện; `null` khi chưa đọc truyện đó. */
export async function getReadingProgress(slug: string): Promise<ServerReadingProgress | null> {
  try {
    const raw = await authorizedRequest<RawReadingProgress>(
      `/library/reading-progress/${encodeURIComponent(slug)}`,
    );
    return mapReadingProgress(raw);
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

/**
 * Ghi tiến độ đọc (upsert).
 *
 * Ném lỗi 404 ra ngoài (KHÔNG nuốt như 2 hàm trên) vì ở đây 404 mang nghĩa
 * khác: chương không thuộc truyện, hoặc slug sai. Caller sync hàng loạt cần
 * biết record nào hỏng để bỏ qua, còn caller đơn lẻ thì nên im lặng bỏ qua —
 * đó là quyết định của call-site, không phải của tầng này.
 */
export async function putReadingProgress(
  slug: string,
  chapterNo: number,
  scrollPercent?: number | null,
): Promise<ServerReadingProgress> {
  const body: { chapter_no: number; scroll_percent?: number } = { chapter_no: chapterNo };
  if (scrollPercent != null && scrollPercent >= 0 && scrollPercent <= 100) {
    body.scroll_percent = Math.round(scrollPercent * 100) / 100;
  }
  const raw = await authorizedRequest<RawReadingProgress>(
    `/library/reading-progress/${encodeURIComponent(slug)}`,
    { method: 'PUT', body },
  );
  return mapReadingProgress(raw);
}

/** Xoá tiến độ đọc một truyện. Nuốt 404 (đã xoá rồi thì coi như xong). */
export async function removeReadingProgress(slug: string): Promise<void> {
  try {
    await authorizedRequest<void>(`/library/reading-progress/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    if (isNotFound(err)) return;
    throw err;
  }
}

/* ------------------------------------------------------------------ */

function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { status?: number }).status === 404;
}
