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
