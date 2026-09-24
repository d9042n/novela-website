/**
 * Helper format hiển thị cho tầng UI.
 * Content đơn ngữ VN; các helper này chỉ format số/ngày (không phải i18n content).
 */

/**
 * Format `updated_at` (RFC3339 nullable) -> `YYYY-MM-DD` để hiển thị.
 * null/không parse được -> chuỗi rỗng.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/**
 * Format lượt xem gọn: 1289000 -> "1.3M", 8420 -> "8.4K", 42 -> "42".
 */
export function formatViews(views: number | null | undefined): string {
  const v = views ?? 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

/**
 * Tiêu đề hiển thị, có nhãn thay thế khi title rỗng.
 *
 * KHÔNG phải phòng hờ lý thuyết: 5323/6288 truyện trong DB đang có title = ''
 * (toàn bộ thuộc source metruyenhot — crawler nạp được truyện nhưng chưa lấy
 * tiêu đề). Không có nhãn thay thế thì card render ra một khung trống hoàn
 * toàn: không ảnh, không tên, chỉ còn badge trạng thái — người dùng không biết
 * đó là truyện hay là lỗi giao diện.
 *
 * Truyền `fallback` từ i18n (`common.untitled`) để nhãn theo ngôn ngữ đang chọn.
 */
export function displayTitle(
  title: string | null | undefined,
  fallback: string,
): string {
  const trimmed = title?.trim();
  return trimmed ? trimmed : fallback;
}

/**
 * Chuẩn hoá tiêu đề chương hiển thị.
 *
 * Khắc phục tình trạng nguồn cào lưu title dạng "1", "Chương 1: 1", "Hồi 1: 1".
 * - Khi title chỉ lặp lại số chương ("Chương 1: 1", "1", "Chương 1") -> trả về "Chương 1".
 * - Khi có tên chương thực sự ("Khởi đầu mới" hoặc "Chương 1: Khởi đầu mới") -> chuẩn hoá thành "Chương 1: Khởi đầu mới".
 */
export function formatChapterTitle(
  chapterNo: number,
  rawTitle?: string | null,
): string {
  const trimmed = rawTitle?.trim() ?? '';
  if (!trimmed) {
    return `Chương ${chapterNo}`;
  }

  // 1. Dạng lặp số chương: "Chương 1: 1", "Chương 1:1", "Chương 1 - 1", "Hồi 1: 1"
  const redundantPattern = new RegExp(
    `^(chương|hồi|chap|chapter)\\s*${chapterNo}\\s*[:\\-–—.]\\s*${chapterNo}$`,
    'i',
  );
  if (redundantPattern.test(trimmed)) {
    return `Chương ${chapterNo}`;
  }

  // 2. Dạng chỉ là số hoặc chỉ có "Chương N", "Hồi N"
  const onlyNumberPattern = new RegExp(
    `^(chương|hồi|chap|chapter)?\\s*${chapterNo}$`,
    'i',
  );
  if (onlyNumberPattern.test(trimmed)) {
    return `Chương ${chapterNo}`;
  }

  // 3. Dạng đã có tiền tố: "Chương N: <tên>" hoặc "Chương N - <tên>"
  const hasPrefixPattern = new RegExp(
    `^(chương|hồi|chap|chapter)\\s*${chapterNo}\\s*[:\\-–—.]\\s*(.*)$`,
    'i',
  );
  const match = trimmed.match(hasPrefixPattern);
  if (match) {
    const subTitle = match[2]?.trim();
    if (!subTitle || subTitle === String(chapterNo)) {
      return `Chương ${chapterNo}`;
    }
    return `Chương ${chapterNo}: ${subTitle}`;
  }

  // 4. Dạng tiêu đề độc lập chưa có chữ "Chương N"
  return `Chương ${chapterNo}: ${trimmed}`;
}

