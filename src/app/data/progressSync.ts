/**
 * Đồng bộ tiến độ đọc giữa localStorage và core API.
 *
 * Ranh giới rõ ràng giữa hai bên:
 *  - Server lưu tới mức CHƯƠNG (`chapter_no`). Đó là toàn bộ những gì
 *    `PUT /library/reading-progress/{slug}` nhận.
 *  - `scroll` (0..1, vị trí trong chương) KHÔNG có cột trên server -> ở lại
 *    localStorage vĩnh viễn. Đọc tiếp trên máy khác sẽ mở đúng chương nhưng về
 *    đầu chương, không nhảy giữa đoạn.
 *
 * Client cũng KHÔNG gửi được `updated_at` (server tự set lúc nhận request), nên
 * không làm last-write-wins theo thời gian đọc thật được. Bù bằng cách push
 * theo thứ tự `updatedAt` TĂNG DẦN: bản ghi đọc gần đây nhất được PUT sau cùng
 * nên có `updated_at` lớn nhất trên server, giữ đúng thứ tự tương đối của danh
 * sách "đọc tiếp".
 */

import { putReadingProgress } from './libraryApi';
import { getContinueList, saveProgress, type ReadingRecord } from '../hooks/useReadingProgress';
import type { ServerReadingProgress } from './types';

/** Cờ đánh dấu đã merge cho user nào, để không đẩy lại mỗi lần đăng nhập. */
const MERGED_KEY = 'novela.progressMerged';

function hasMerged(userId: number): boolean {
  try {
    const raw = localStorage.getItem(MERGED_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as number[]).includes(userId);
  } catch {
    return false;
  }
}

function markMerged(userId: number) {
  try {
    const raw = localStorage.getItem(MERGED_KEY);
    const list = raw ? (JSON.parse(raw) as number[]) : [];
    if (!list.includes(userId)) list.push(userId);
    localStorage.setItem(MERGED_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/**
 * Đẩy tiến độ đọc offline lên server, chạy MỘT LẦN sau lần đăng nhập đầu tiên.
 *
 * Bỏ qua lỗi từng bản ghi thay vì dừng cả lượt: `chapter_no` là ordinal của
 * nguồn và truyện dạng quyển có số chương lặp lại, nên vài bản ghi cũ sẽ trả
 * 404 ("chương không thuộc truyện này"). Một bản ghi hỏng không được chặn phần
 * còn lại.
 *
 * Tuần tự, không `Promise.all`: thứ tự PUT chính là thứ tự `updated_at` trên
 * server (xem doc đầu file), chạy song song là mất thứ tự.
 */
export async function pushLocalProgress(userId: number): Promise<void> {
  if (hasMerged(userId)) return;

  const records = getContinueList()
    .slice()
    .sort((a, b) => a.updatedAt - b.updatedAt); // cũ trước, mới sau

  for (const r of records) {
    if (!Number.isInteger(r.chapterNo) || r.chapterNo < 1) continue;
    try {
      await putReadingProgress(r.slug, r.chapterNo);
    } catch {
      /* bản ghi hỏng -> bỏ qua, xem doc ở trên */
    }
  }

  markMerged(userId);
}

/**
 * Kéo tiến độ từ server về localStorage.
 *
 * Chương lớn hơn thắng, KHÔNG phải bản mới hơn thắng: đọc trên điện thoại tới
 * chương 80 rồi mở máy tính (bản ghi cũ, chương 50) mà lấy theo thời gian thì
 * user bị lùi 30 chương. Lấy `max(chapterNo)` là quy tắc dễ đoán và không bao
 * giờ làm mất tiến độ.
 *
 * `scroll` giữ nguyên của local khi cùng chương; sang chương khác thì reset 0
 * (vị trí cuộn của chương cũ vô nghĩa ở chương mới).
 */
export function mergeServerProgress(serverItems: ServerReadingProgress[]): void {
  for (const item of serverItems) {
    const slug = item.story.slug;
    const serverNo = item.chapter.chapterNo;
    const local = getLocal(slug);

    if (local && local.chapterNo >= serverNo) continue;

    saveProgress({
      slug,
      chapterNo: serverNo,
      scroll: local && local.chapterNo === serverNo ? local.scroll : 0,
      updatedAt: Date.parse(item.updatedAt) || Date.now(),
    });
  }
}

function getLocal(slug: string): ReadingRecord | undefined {
  return getContinueList().find((r) => r.slug === slug);
}
