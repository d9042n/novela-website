/**
 * Ghi lượt xem truyện — core Django, `POST /tracking/stories/{slug}/view`.
 *
 * KHÔNG cần đăng nhập (phần lớn traffic là khách vãng lai vẫn phải được tính).
 *
 * Vì sao endpoint này nằm ở core chứ không phải backend Go: backend Go giữ
 * invariant SELECT-only (có test grep chặn INSERT/UPDATE trong `db/query/*.sql`)
 * nên không thể ghi. Core sở hữu mọi đường ghi.
 *
 * Server làm sẵn 3 việc client không phải lo:
 *  - Dedup theo khách/ngày bằng hash có salt xoay theo ngày (không lưu IP/UA).
 *    Gọi lại cùng truyện trong ngày vẫn nhận 202 nhưng không cộng thêm.
 *  - Đếm theo TRUYỆN không theo chương — mở 40 chương vẫn là 1 view, nên bảng
 *    xếp hạng đo mức được thích chứ không đo độ dài truyện.
 *  - Ghi đồng thời `view_count` (tổng) và bucket theo ngày trong 1 transaction,
 *    nên bảng xếp hạng ngày/tuần/tháng dựng được từ đây.
 *
 * Rate-limit 60/phút theo IP. Response luôn 202 và KHÔNG chứa số view (đây là
 * đường ghi, không phải cách đọc lượt xem).
 */

import { apiRequest } from './client';

/**
 * Ghi một lượt xem. Fire-and-forget: nuốt MỌI lỗi.
 *
 * Tracking hỏng tuyệt đối không được làm hỏng việc đọc truyện — user vào đọc mà
 * thấy toast lỗi "không ghi được lượt xem" thì vô nghĩa với họ. Lỗi 404 (slug
 * sai), 429 (quá rate-limit), mất mạng đều im lặng.
 */
export async function recordStoryView(slug: string): Promise<void> {
  try {
    await apiRequest<{ detail: string }>(
      `/tracking/stories/${encodeURIComponent(slug)}/view`,
      { method: 'POST' },
    );
  } catch {
    /* im lặng có chủ ý — xem doc ở trên */
  }
}
