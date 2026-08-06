import { useEffect, useState } from 'react';

/**
 * Hook nhỏ để load dữ liệu từ lớp API (Promise). Re-run khi deps đổi.
 *
 * `error` là load-bearing, không phải tiện ích thêm cho đẹp: bản cũ chỉ có
 * `.then()` mà không `.catch()`, nên promise reject thì `setLoading(false)`
 * không bao giờ chạy và `data` mắc ở giá trị `initial` vĩnh viễn. Ở HomePage —
 * nơi duy nhất dùng hook này — cả 3 rail đều destructure `{ data = [] }` và bỏ
 * qua `loading`, nên API chết cho ra ba dải trống IM LẶNG, không báo lỗi, không
 * có nút thử lại. Đúng triệu chứng bug prod đã ghi nhận.
 *
 * Trả thêm `error` để call-site phân biệt được "rỗng thật" với "tải hỏng" —
 * cùng nguyên tắc bốn trạng thái tách biệt (lỗi -> đang tải -> rỗng -> có dữ
 * liệu) mà BrowsePage và LibraryPage đang theo.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fn()
      .then((res) => {
        if (!active) return;
        setData(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        // Giữ `initial` làm dữ liệu hiển thị (thường là mảng rỗng) để component
        // render được ngay cả khi chưa xử lý `error`; ai cần phân biệt thì đọc
        // `error`.
        setError(err ?? new Error('unknown error'));
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
