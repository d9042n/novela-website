/**
 * Nơi giữ JWT pair của reader — module function, KHÔNG hook.
 *
 * Tách khỏi React vì `client.ts` (tầng HTTP thuần) phải đọc access token để gắn
 * header Bearer, mà nó không được import React. Cùng khuôn với
 * `hooks/useReadingProgress.ts`: read/write ở module level, ai cần reactive thì
 * bọc ở tầng trên (AuthContext).
 *
 * Dùng localStorage (không sessionStorage) để mở tab mới / F5 vẫn còn phiên —
 * đúng kỳ vọng của site đọc truyện. Đánh đổi: XSS đọc được token. Hàng rào bù
 * lại nằm ở core: access chỉ sống 15 phút, refresh có rotation + blacklist, và
 * đổi mật khẩu bump `token_version` giết mọi token cũ trên mọi thiết bị.
 *
 * KHÔNG dùng `useLocalStorage`: hook đó `JSON.stringify` mọi giá trị và chỉ chạy
 * trong React, còn `client.ts` cần đọc đồng bộ ngoài vòng đời component.
 *
 * Vì sao không dùng cookie httpOnly (an toàn hơn trước XSS): core khai tường minh
 * `CORS_ALLOW_CREDENTIALS = False` kèm lý do — bật credentials sẽ cho JS
 * cross-origin gửi kèm session cookie của `/admin/`, mở đường CSRF vào admin.
 * Đổi sang cookie là phá một quyết định bảo mật đã có chủ đích ở 3 tầng.
 */

const KEY = 'novela.auth';

/** Cặp token do core `/auth/login` | `/auth/refresh` trả về. */
export interface TokenPair {
  access: string;
  refresh: string;
}

function read(): TokenPair | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TokenPair>;
    // Chỉ nhận cặp ĐỦ 2 token: thiếu refresh thì access chết sau 15 phút là hết
    // đường cứu, thà coi như chưa đăng nhập ngay từ đầu còn hơn để user dùng
    // được vài phút rồi văng ra giữa chừng.
    if (typeof parsed.access !== 'string' || typeof parsed.refresh !== 'string') return null;
    if (!parsed.access || !parsed.refresh) return null;
    return { access: parsed.access, refresh: parsed.refresh };
  } catch {
    return null;
  }
}

/** Cặp token đang giữ; null khi chưa đăng nhập. */
export function getTokens(): TokenPair | null {
  return read();
}

/** Access token để gắn `Authorization: Bearer`. */
export function getAccessToken(): string | null {
  return read()?.access ?? null;
}

/**
 * Lưu cặp token mới.
 *
 * LUÔN ghi cả 2, không ghi lẻ `access`: `/auth/refresh` bật rotation nên mỗi lần
 * gọi là refresh cũ bị blacklist và server trả về refresh MỚI. Giữ lại refresh cũ
 * = lần refresh sau chắc chắn 401.
 */
export function setTokens(pair: TokenPair) {
  try {
    localStorage.setItem(KEY, JSON.stringify(pair));
  } catch {
    /* ignore quota errors */
  }
}

/** Xoá phiên phía client (logout, hoặc refresh trả 401). */
export function clearTokens() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Nghe token đổi ở TAB KHÁC (`storage` event chỉ bắn cross-tab, không bắn cho
 * chính tab vừa ghi). Không có cái này thì đăng xuất ở tab A mà tab B vẫn tưởng
 * còn đăng nhập.
 *
 * Trả hàm cleanup để dùng trong `useEffect`, giống `useLocalStorage`.
 */
export function onTokensChanged(cb: (pair: TokenPair | null) => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cb(read());
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
