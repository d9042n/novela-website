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
import type { AccountStats, AuthUser } from './types';

/* ------------------------------------------------------------------ */
/* Raw shapes trả về từ core (snake_case).                            */
/* ------------------------------------------------------------------ */

/**
 * MeSchema — whitelist hồ sơ, core KHÔNG trả password hash / quyền.
 *
 * Các field ngoài `id/username/email` khai OPTIONAL có chủ ý: xem `mapMe`.
 */
interface RawMe {
  id: number;
  username: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  gender?: string | null;
  birthday?: string | null;
  email_verified?: boolean | null;
  date_joined?: string | null;
  is_staff?: boolean | null;
}

/** Raw của `/auth/me/stats`. */
interface RawAccountStats {
  bookmark_count?: number | null;
  reading_count?: number | null;
  date_joined?: string | null;
  last_activity_at?: string | null;
}

interface RawTokenPair {
  access: string;
  refresh: string;
}

/* ------------------------------------------------------------------ */
/* Mappers raw -> domain.                                             */
/* ------------------------------------------------------------------ */

/** Giá trị hợp lệ của `gender`; khác đi thì coi như chưa đặt. */
const GENDERS: ReadonlyArray<AuthUser['gender']> = ['', 'male', 'female', 'other'];

function mapGender(raw: unknown): AuthUser['gender'] {
  return GENDERS.includes(raw as AuthUser['gender']) ? (raw as AuthUser['gender']) : '';
}

/**
 * Map MeSchema -> AuthUser, mỗi field mới đều có default.
 *
 * Vì sao phải phòng thủ chứ không khai bắt buộc: deploy web và deploy core KHÔNG
 * nguyên tử. Trong vài phút giữa hai lần rollout, bản web mới hoàn toàn có thể
 * nói chuyện với core cũ chưa có `display_name`/`birthday`/... Nếu tầng map cứ
 * cho là field luôn có, một field optional thiếu sẽ kéo theo `undefined` chạy
 * xuyên xuống component và làm trắng cả app — cái giá quá đắt cho một trường hồ
 * sơ. Default ('' / null / false) cho ra UI khuyết chỗ đó nhưng vẫn dùng được.
 */
function mapMe(raw: RawMe): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    displayName: raw.display_name ?? '',
    avatarUrl: raw.avatar_url ?? '',
    bio: raw.bio ?? '',
    gender: mapGender(raw.gender),
    birthday: raw.birthday ?? null,
    emailVerified: raw.email_verified ?? false,
    joinedAt: raw.date_joined ?? '',
    isStaff: raw.is_staff ?? false,
  };
}

/** Cùng lý do phòng thủ như `mapMe`. */
function mapAccountStats(raw: RawAccountStats): AccountStats {
  return {
    bookmarkCount: raw.bookmark_count ?? 0,
    readingCount: raw.reading_count ?? 0,
    joinedAt: raw.date_joined ?? '',
    lastActivityAt: raw.last_activity_at ?? null,
  };
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

/* ------------------------------------------------------------------ */
/* Hồ sơ + tài khoản.                                                 */
/* ------------------------------------------------------------------ */

/** Các field hồ sơ được phép sửa qua `PATCH /auth/me`. */
export type ProfilePatch = Partial<{
  displayName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  gender: AuthUser['gender'];
  birthday: string | null;
}>;

/** camelCase -> snake_case cho từng field patch được. */
const PATCH_FIELD_MAP: Record<keyof ProfilePatch, string> = {
  displayName: 'display_name',
  email: 'email',
  avatarUrl: 'avatar_url',
  bio: 'bio',
  gender: 'gender',
  birthday: 'birthday',
};

/**
 * Cập nhật hồ sơ (PATCH `/auth/me`), trả user đã cập nhật.
 *
 * CHỈ gửi những key CÓ MẶT trong `patch`. Đây là PATCH ngữ nghĩa thật: field
 * không gửi = "đừng đụng", còn gửi kèm `undefined` thì `JSON.stringify` bỏ key
 * đi (may) hoặc — với `null` — lại là lệnh XOÁ giá trị. Dùng `in` chứ không
 * kiểm tra `!== undefined`, để `birthday: null` (chủ ý xoá ngày sinh) vẫn đi
 * được tới server.
 */
export async function updateProfile(patch: ProfilePatch): Promise<AuthUser> {
  const body: Record<string, unknown> = {};
  for (const [key, apiKey] of Object.entries(PATCH_FIELD_MAP) as [keyof ProfilePatch, string][]) {
    if (key in patch) body[apiKey] = patch[key];
  }

  const raw = await authorizedRequest<RawMe>('/auth/me', { method: 'PATCH', body });
  return mapMe(raw);
}

/** Số liệu tổng hợp của tài khoản (GET `/auth/me/stats`). */
export async function getAccountStats(): Promise<AccountStats> {
  const raw = await authorizedRequest<RawAccountStats>('/auth/me/stats');
  return mapAccountStats(raw);
}

/**
 * Xoá tài khoản vĩnh viễn (DELETE `/auth/me`), cần xác nhận lại mật khẩu.
 *
 * Chỉ xoá token khi server ĐÃ xác nhận thành công — khác `logout`. Xoá sớm mà
 * server từ chối (sai mật khẩu) thì user vừa mất phiên vừa còn nguyên tài khoản.
 */
export async function deleteAccount(password: string): Promise<void> {
  await authorizedRequest<void>('/auth/me', { method: 'DELETE', body: { password } });
  clearTokens();
}

/**
 * Gửi email đặt lại mật khẩu (POST `/auth/forgot-password`). KHÔNG cần đăng nhập.
 *
 * Core trả thành công kể cả khi email không tồn tại (chống dò tài khoản), nên UI
 * phải hiện đúng MỘT thông báo chung cho mọi kết quả.
 */
export async function forgotPassword(email: string): Promise<void> {
  await apiRequest<void>('/auth/forgot-password', { method: 'POST', body: { email } });
}

/**
 * Đặt lại mật khẩu bằng token trong email (POST `/auth/reset-password`). KHÔNG
 * cần đăng nhập — user đang ở trạng thái không vào được tài khoản.
 *
 * KHÔNG trả cặp token: reset xong vẫn phải đăng nhập lại bằng mật khẩu mới.
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest<void>('/auth/reset-password', {
    method: 'POST',
    body: { token, new_password: newPassword },
  });
}

/**
 * Gửi email xác thực tài khoản (POST `/auth/send-verification-email`). Cần đăng nhập.
 * Trả 202 khi gửi thành công, 409 nếu email đã được xác thực trước đó hoặc user chưa có email.
 */
export async function sendVerificationEmail(): Promise<void> {
  await authorizedRequest<void>('/auth/send-verification-email', { method: 'POST' });
}

/**
 * Xác thực email bằng token nhận trong mail (POST `/auth/verify-email`). Public.
 * Token tự nó là chứng chỉ. Trả 200 khi thành công, 400 nếu sai/hết hạn.
 */
export async function verifyEmail(token: string): Promise<void> {
  await apiRequest<void>('/auth/verify-email', {
    method: 'POST',
    body: { token },
  });
}

/**
 * Kiểm tra tính hợp lệ của Access Token hiện tại (GET `/auth/verify`). Cần đăng nhập.
 */
export async function verifyToken(): Promise<{ valid: boolean; userId: number }> {
  const res = await authorizedRequest<{ valid: boolean; user_id: number }>('/auth/verify');
  return { valid: res.valid, userId: res.user_id };
}

