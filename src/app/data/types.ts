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
 * Whitelist có kiểm soát; core KHÔNG bao giờ trả password hash / is_superuser /
 * permissions.
 */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  /** Tên hiển thị; rỗng thì UI fallback về username (dùng displayNameOf). */
  displayName: string;
  avatarUrl: string;
  bio: string;
  gender: '' | 'male' | 'female' | 'other';
  /** ISO date "YYYY-MM-DD", null khi chưa đặt. */
  birthday: string | null;
  emailVerified: boolean;
  /** ISO 8601. */
  joinedAt: string;
  isStaff: boolean;
}

/** Số liệu tổng hợp của tài khoản (`/auth/me/stats`). */
export interface AccountStats {
  bookmarkCount: number;
  readingCount: number;
  joinedAt: string;
  /** null khi user chưa có hoạt động nào được ghi nhận. */
  lastActivityAt: string | null;
}

/**
 * Tên hiển thị an toàn cho UI.
 *
 * `displayName` là field tuỳ chọn của user (và rỗng với mọi tài khoản cũ), nên
 * MỌI chỗ render tên đều phải đi qua đây thay vì đọc thẳng `user.displayName` —
 * nếu không sẽ có chỗ hiện tên trống.
 */
export function displayNameOf(u: Pick<AuthUser, 'displayName' | 'username'>): string {
  return u.displayName || u.username;
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
 * Hỗ trợ `scrollPercent` (0..100) được lưu trực tiếp trên database của Core.
 */
export interface ServerReadingProgress {
  story: StoryBrief;
  chapter: ChapterBrief;
  updatedAt: string;
  scrollPercent?: number | null;
}

/* ------------------------------------------------------------------ */
/* Public Rankings, Sources, and Authors                              */
/* ------------------------------------------------------------------ */

export type RankingWindow = 'day' | 'week' | 'month';

export interface RankingNovel extends Novel {
  rank: number;
  viewsInWindow: number;
}

export interface Source {
  code: string;
  name: string;
  storyCount: number;
  isActive: boolean;
}

export interface AuthorRef {
  name: string;
  slug: string;
  storyCount: number;
}

