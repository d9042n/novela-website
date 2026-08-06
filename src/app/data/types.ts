/**
 * Kiểu dữ liệu domain cho Novela.
 *
 * Content (title/author/description/genre name/chapter title/paragraph) là ĐƠN NGỮ
 * tiếng Việt — khớp backend hiện chỉ có tiếng Việt.
 * TODO(i18n-content): khi backend có nội dung đa ngôn ngữ, mở lại shape đa ngữ
 * cho các field content bên dưới (KHÔNG dùng lại mock {vi,en} cứng).
 *
 * UI chrome (nút, label, menu) VẪN song ngữ qua i18n/locales/*.json — tách bạch,
 * không liên quan các type ở đây.
 */

/** Ngôn ngữ UI chrome (không phải content). Dùng cho i18n hệ thống. */
export type Locale = 'vi' | 'en';

/**
 * Trạng thái truyện dùng ở UI.
 * API trả `"ongoing"` | `"full"`; tầng map đổi `full` -> `completed`.
 */
export type NovelStatus = 'ongoing' | 'completed';

/** Thể loại (từ endpoint /genres, phân trang KHÔNG có — tập cố định 46 genre). */
export interface Genre {
  id: number;
  name: string;
  slug: string;
}

/** Tác giả nhúng trong story (list + detail). */
export interface Author {
  name: string;
  slug: string;
}

/** Thể loại nhúng trong story (chỉ name + slug, khác Genre có id). */
export interface NovelGenre {
  name: string;
  slug: string;
}

/**
 * Truyện — hợp nhất list item + detail.
 * `slug` là khóa định danh duy nhất (bỏ `id`, route bằng slug).
 */
export interface Novel {
  slug: string;
  title: string;
  description: string;
  /** cover_url; có thể là "" -> component dùng ImageWithFallback. */
  cover: string;
  status: NovelStatus;
  isAdult: boolean;
  /** Thang /10, nullable khi chưa có điểm. */
  score: number | null;
  /** Số lượt đánh giá cào sẵn từ nguồn, nullable. */
  ratingCount: number | null;
  /** Lượt xem hệ thống tự tracking (view_count), NOT NULL default 0. */
  views: number;
  /**
   * Số chương. List map từ `latest_chapter_no`, detail map từ `chapter_count`.
   * Nullable (list có thể chưa có latest_chapter_no).
   */
  chapterCount: number | null;
  /** RFC3339, nullable. */
  updatedAt: string | null;
  /** LUÔN là mảng (có thể rỗng). List + detail đều trả. */
  authors: Author[];
  /** LUÔN là mảng (có thể rỗng). */
  genres: NovelGenre[];
}

/** Tóm tắt chương cho danh sách (endpoint /stories/{slug}/chapters). */
export interface ChapterSummary {
  chapterNo: number;
  title: string;
  /** Đường dẫn suy ra `/{slug}/chuong-{no}/` (không lưu DB). */
  url: string;
}

/** Chương đầy đủ (endpoint /stories/{slug}/chapters/{no}). */
export interface Chapter {
  chapterNo: number;
  title: string;
  /** Text thuần, phân đoạn bằng `\n\n`. */
  content: string;
  /** content đã split thành đoạn văn (tiện cho reader render). */
  paragraphs: string[];
  wordCount: number | null;
  url: string;
  /** Chương liền kề; null ở biên. Điều hướng dùng 2 field này, KHÔNG tự +-1. */
  prevNo: number | null;
  nextNo: number | null;
}

/* ------------------------------------------------------------------ */
/* Core API (auth + library) — khác backend Go ở trên.                */
/* ------------------------------------------------------------------ */

/**
 * Reader đang đăng nhập — khớp `MeSchema` của core (`/auth/me`).
 * Whitelist đúng 3 field; core KHÔNG bao giờ trả password hash / is_superuser /
 * permissions.
 */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

/**
 * Truyện dạng rút gọn nhúng trong bookmark / reading-progress
 * (`StoryBriefSchema` của core).
 *
 * CHỈ 6 field — thiếu `description`, `score`, `chapterCount`, `authors`,
 * `genres` so với `Novel`. Nên KHÔNG dùng chung `NovelCard` được mà không map
 * bù hoặc làm card variant riêng.
 *
 * `cover` hiện LUÔN rỗng: core đọc thẳng cột `cover_url` (NULL 100% ở prod)
 * trong khi backend Go có fallback sang `cover_url_origin`. Cùng một truyện,
 * trang chi tiết có ảnh mà trong tủ sách thì không.
 */
export interface StoryBrief {
  id: number;
  slug: string;
  title: string;
  cover: string;
  isAdult: boolean;
  status: NovelStatus;
}

/** Một truyện đã đánh dấu (`BookmarkSchema`). */
export interface Bookmark {
  id: number;
  story: StoryBrief;
  /** ISO 8601 kèm micro giây, offset `+00:00`. */
  createdAt: string;
}

/** Chương rút gọn nhúng trong reading-progress (`ChapterBriefSchema`). */
export interface ChapterBrief {
  id: number;
  chapterNo: number;
  title: string;
}

/**
 * Tiến độ đọc lưu trên server (`ReadingProgressSchema`).
 *
 * KHÔNG có `id` (khác `Bookmark`), và KHÔNG có vị trí cuộn — server chỉ lưu tới
 * mức CHƯƠNG. `scroll` vẫn phải giữ on-device ở `useReadingProgress`.
 */
export interface ServerReadingProgress {
  story: StoryBrief;
  chapter: ChapterBrief;
  updatedAt: string;
}
