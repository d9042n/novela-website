/**
 * Tầng API xác thực — core Django (django-ninja), prefix `/auth`.
 *
 * Dùng CHUNG base URL với catalog: Kong route theo longest-prefix
 * (`/api/v1/auth`, `/api/v1/library`, `/api/v1/tracking` -> core Django;
 * `/api/v1/authors` pin riêng -> Go; catch-all `/api/v1` -> Go). Nên KHÔNG cần
 * base URL thứ hai.
 *
 * Hợp đồng đã verify bằng curl thật (không đọc code đoán):
 *  - `register` -> **201** `{id,username,email}`, KHÔNG trả token (phải login riêng).
 *    409 trùng username/email · 422 mật khẩu yếu · 429 quá 3 lần/phút.
 *  - `login` -> 200 `{access,refresh}` · 401 message CHUNG cho mọi nhánh sai
 *    (cố ý, chống dò tài khoản) · 429 quá 5 lần/phút.
 *  - `refresh` -> 200 `{access,refresh}`. **Rotation + blacklist**: gọi xong thì
 *    refresh vừa gửi CHẾT, gọi lại bằng nó -> 401.
 *  - `logout` -> **205** không body, cần Bearer + body `{refresh}`. Gọi lần 2 -> 401.
 *  - `change-password` -> 200 `{access,refresh}`, bump `token_version` nên MỌI
 *    token cũ chết trên MỌI thiết bị.
 */

import { ApiError, apiRequest, type RequestOptions } from './client';
import { clearTokens, getAccessToken, getTokens, setTokens, type TokenPair } from './tokenStore';
import type { AuthUser } from './types';

/* ------------------------------------------------------------------ */
/* Raw shapes trả về từ core (snake_case).                            */
/* ------------------------------------------------------------------ */

/** MeSchema — whitelist đúng 3 field, core KHÔNG trả password hash / quyền. */
interface RawMe {
  id: number;
  username: string;
  email: string;
}

interface RawTokenPair {
  access: string;
  refresh: string;
}

/* ------------------------------------------------------------------ */
/* Mappers raw -> domain.                                             */
/* ------------------------------------------------------------------ */

function mapMe(raw: RawMe): AuthUser {
  return { id: raw.id, username: raw.username, email: raw.email };
}

/* ------------------------------------------------------------------ */
/* Single-flight refresh.                                             */
/* ------------------------------------------------------------------ */

/**
 * Promise refresh đang bay, `null` khi rảnh.
 *
 * BẮT BUỘC phải có: rotation + blacklist đang bật ở core. Mở trang Tủ sách bắn
 * 2 request song song, cả hai cùng 401, mỗi cái tự gọi `/auth/refresh` -> cái
 * chạy trước blacklist refresh token, cái chạy sau gửi đúng token vừa bị
 * blacklist -> 401 -> xoá phiên. User bị đăng xuất oan dù mọi thứ vẫn hợp lệ.
 * Gom về MỘT promise chung thì cái thứ hai chờ và dùng lại kết quả.
 */
let refreshInFlight: Promise<TokenPair> | null = null;

/** Đăng ký callback để AuthContext biết phiên đã chết mà đổi state. */
let onSessionExpired: (() => void) | null = null;

/**
 * AuthContext gọi lúc mount. Tầng HTTP không import React nên không tự
 * `setState` được, phải đi qua callback.
 */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

/**
 * Xoay cặp token. Rotation ON nên PHẢI ghi đè cả 2.
 *
 * `knownAccess` là access token mà caller vừa bị 401 với nó. Nếu token trong
 * store ĐÃ KHÁC giá trị đó thì có nghĩa một request khác vừa refresh xong —
 * refresh tiếp là gửi refresh token vừa bị blacklist và chắc chắn nhận 401, kéo
 * theo xoá phiên oan.
 *
 * `refreshInFlight` một mình KHÔNG đủ: nó chỉ gom được các lượt 401 xảy ra ĐỒNG
 * THỜI. Hai request 401 TUẦN TỰ (request B gửi sau khi A đã refresh xong nhưng B
 * mang token cũ vì nó được dựng trước đó) sẽ thấy `refreshInFlight === null` và
 * refresh lần hai. So sánh giá trị token là thứ chặn được ca đó.
 *
 * Thất bại -> xoá sạch: refresh chết là hết đường cứu, giữ lại chỉ khiến mọi
 * request sau đó 401 rồi lại thử refresh, lặp vô hạn.
 */
export function refreshTokens(knownAccess?: string | null): Promise<TokenPair> {
  const current = getTokens();
  if (!current) {
    return Promise.reject(new ApiError(401, 'no_refresh_token', 'chưa đăng nhập'));
  }

  // Ai đó đã refresh xong trong lúc mình chờ -> dùng luôn kết quả của họ.
  if (knownAccess && current.access !== knownAccess) {
    return Promise.resolve(current);
  }

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = apiRequest<RawTokenPair>('/auth/refresh', {
    method: 'POST',
    body: { refresh: current.refresh },
  })
    .then((pair) => {
      setTokens(pair);
      return pair;
    })
    .catch((err) => {
      clearTokens();
      onSessionExpired?.();
      throw err;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

/**
 * Request cần đăng nhập: gặp 401 thì refresh MỘT lần rồi thử lại đúng một lượt.
 *
 * Không đệ quy: nếu lần thử lại vẫn 401 thì ném luôn, tránh vòng lặp khi chính
 * `/auth/refresh` cũng trả 401.
 */
export async function authorizedRequest<T>(
  path: string,
  opts: Omit<RequestOptions, 'auth'> = {},
): Promise<T> {
  // Chụp token TRƯỚC khi gửi để biết mình đã dùng bản nào — xem doc refreshTokens.
  const usedAccess = getAccessToken();
  try {
    return await apiRequest<T>(path, { ...opts, auth: true });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;

    await refreshTokens(usedAccess); // ném tiếp nếu refresh cũng chết
    return apiRequest<T>(path, { ...opts, auth: true });
  }
}

/* ------------------------------------------------------------------ */
/* Public API.                                                        */
/* ------------------------------------------------------------------ */

export interface LoginParams {
  username: string;
  password: string;
}

/**
 * Đăng nhập, lưu luôn cặp token.
 *
 * Lưu ý cho UI: core so khớp username **phân biệt hoa thường** khi login (dù
 * register lại chặn trùng không phân biệt hoa thường) — nên đừng tự `toLowerCase()`
 * input của user, sẽ làm hỏng đăng nhập của tài khoản có chữ hoa.
 */
export async function login(params: LoginParams): Promise<TokenPair> {
  const pair = await apiRequest<RawTokenPair>('/auth/login', {
    method: 'POST',
    body: { username: params.username, password: params.password },
  });
  setTokens(pair);
  return pair;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

/**
 * Đăng ký. KHÔNG trả token (core tách 2 bước) -> caller tự gọi `login` sau nếu
 * muốn vào thẳng.
 */
export async function register(params: RegisterParams): Promise<AuthUser> {
  const raw = await apiRequest<RawMe>('/auth/register', {
    method: 'POST',
    body: { username: params.username, email: params.email, password: params.password },
  });
  return mapMe(raw);
}

/** Thông tin user đang đăng nhập. Tự refresh khi access hết hạn. */
export async function getMe(): Promise<AuthUser> {
  const raw = await authorizedRequest<RawMe>('/auth/me');
  return mapMe(raw);
}

/**
 * Đăng xuất: blacklist refresh ở server rồi xoá local.
 *
 * Local LUÔN được xoá kể cả server lỗi — bấm "Đăng xuất" mà vẫn còn đăng nhập là
 * sai kỳ vọng rõ ràng. Cũng KHÔNG retry: gọi logout lần 2 với refresh đã
 * blacklist trả 401 (docstring của core nói vẫn chấp nhận, nhưng hành vi thật
 * đã verify là 401).
 */
export async function logout(): Promise<void> {
  const current = getTokens();
  try {
    if (current) {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
        auth: true,
        body: { refresh: current.refresh },
      });
    }
  } catch {
    /* server không nhận cũng vẫn xoá local */
  } finally {
    clearTokens();
  }
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

/**
 * Đổi mật khẩu. Trả cặp token MỚI vì core bump `token_version` -> token cũ chết
 * ngay trên mọi thiết bị. Phải lưu cặp mới, không thì chính tab này bị đá ra.
 */
export async function changePassword(params: ChangePasswordParams): Promise<TokenPair> {
  const pair = await authorizedRequest<RawTokenPair>('/auth/change-password', {
    method: 'POST',
    body: { old_password: params.oldPassword, new_password: params.newPassword },
  });
  setTokens(pair);
  return pair;
}
