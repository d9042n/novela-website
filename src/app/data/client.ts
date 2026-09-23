/**
 * Tầng HTTP client cho Novela public API (read-only, no-auth).
 *
 * Base URL:
 *  - Dev: `/api/v1` (Vite proxy `/api` -> backend service, xem vite.config.ts).
 *  - Có thể override qua env `VITE_API_BASE` (build-time) khi deploy khác origin.
 *
 * Mọi response bọc trong envelope:
 *  - Phân trang: { data, page, size, total, total_pages }
 *  - Không phân trang: { data }
 * Lỗi: { error: { code, message } } — parse `code` để phân nhánh (404 -> not_found...).
 */

// Fallback phải bền với CHUỖI RỖNG, không chỉ undefined. Dockerfile khai
// `ENV VITE_API_BASE=$VITE_API_BASE`, nên build thiếu --build-arg cho ra biến
// rỗng (chứ không phải không tồn tại). `??` chỉ bắt null/undefined -> Vite
// inline "" -> base rỗng -> client gọi '/stories' thay vì '/api/v1/stories'.
// Dùng `||` + trim để rỗng/toàn-khoảng-trắng đều rơi về default.
const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.trim().replace(/\/$/, '') ||
  '/api/v1';

/**
 * Envelope phân trang từ backend.
 *
 * `next_cursor` là con trỏ KEYSET, THÊM vào chứ không thay `page`: truyền lại
 * qua `?after=<cursor>` để lấy trang kế. `null` nghĩa là hết trang.
 *
 * Vì sao có 2 đường phân trang cùng lúc: `page` đánh địa chỉ theo VỊ TRÍ trong
 * kết quả, mà crawler thì chèn truyện mới liên tục — một truyện được cào giữa
 * lúc user cuộn sẽ đẩy mọi row phía sau xuống 1 bậc, nên infinite-scroll dùng
 * `page` sẽ render lặp (hoặc bỏ sót) đúng chỗ ranh giới trang. Cursor đánh địa
 * chỉ theo GIÁ TRỊ nên không bị. Ngược lại, dàn số trang thì vẫn phải dùng
 * `page` + `total_pages` (cursor không nhảy tới trang N được).
 *
 * Optional (`?`) có chủ ý: server cũ chưa có field này, và client không được
 * crash vì thiếu nó.
 */
export interface PageEnvelope<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
  next_cursor?: string | null;
}

/** Kết quả phân trang đã map sang camelCase cho tầng UI. */
export interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  /** Con trỏ keyset cho trang kế; `null` khi đã hết trang. */
  nextCursor: string | null;
}

import { getAccessToken } from './tokenStore';

/** Lỗi API có mã (code) để component phân nhánh (vd not_found -> 404 page). */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** Giá trị query: string/number/boolean, hoặc mảng (join bằng dấu phẩy). */
export type QueryValue = string | number | boolean | undefined | null | (string | number)[];
export type QueryParams = Record<string, QueryValue>;

function buildQuery(params?: QueryParams): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      sp.set(key, value.join(','));
    } else {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

/**
 * GET một endpoint, trả JSON đã parse. Ném ApiError khi status không 2xx
 * hoặc body có envelope lỗi.
 */
export async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  const url = `${API_BASE}${path}${buildQuery(params)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    throw new ApiError(0, 'network_error', (err as Error)?.message ?? 'network error');
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Body không phải JSON hợp lệ.
      if (!res.ok) throw new ApiError(res.status, 'internal_error', text.slice(0, 200));
      throw new ApiError(res.status, 'invalid_response', 'invalid JSON response');
    }
  }

  if (!res.ok) {
    const errEnvelope = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(
      res.status,
      errEnvelope?.code ?? 'internal_error',
      errEnvelope?.message ?? res.statusText ?? 'request failed',
    );
  }

  return body as T;
}

/** GET endpoint phân trang -> map envelope sang Paginated<U> qua `mapItem`. */
export async function apiGetPaginated<T, U>(
  path: string,
  params: QueryParams | undefined,
  mapItem: (raw: T) => U,
): Promise<Paginated<U>> {
  const env = await apiGet<PageEnvelope<T>>(path, params);
  return {
    items: (env.data ?? []).map(mapItem),
    page: env.page,
    size: env.size,
    total: env.total,
    totalPages: env.total_pages,
    // `?? null` gộp cả undefined (server cũ không gửi field) và null (server
    // mới báo hết trang) về MỘT giá trị, nên tầng UI chỉ cần kiểm tra
    // `nextCursor !== null` là biết còn trang hay không.
    nextCursor: env.next_cursor ?? null,
  };
}

/** GET endpoint không phân trang ({ data: [...] }) -> map từng item. */
export async function apiGetList<T, U>(
  path: string,
  mapItem: (raw: T) => U,
  params?: QueryParams,
): Promise<U[]> {
  const env = await apiGet<{ data: T[] }>(path, params);
  return (env.data ?? []).map(mapItem);
}

/* ------------------------------------------------------------------ */
/* Auth-aware requests (core Django: /auth/*, /library/*, /tracking/*). */
/* ------------------------------------------------------------------ */

/**
 * Bóc message lỗi từ body. Hai backend trả HAI shape KHÁC NHAU trên cùng một
 * base URL (Kong route theo prefix):
 *  - backend Go:    `{ "error": { "code", "message" } }`
 *  - core Django:   `{ "detail": ... }`
 *
 * Và `detail` của core lại có hai kiểu:
 *  - string  — lỗi nghiệp vụ, message tiếng Việt sẵn ("Tên đăng nhập đã tồn tại.")
 *  - array   — 422 pydantic: `[{ type, loc, msg, ctx }]`
 * Khai `detail: string` rồi đụng 422 là nổ decode, nên phải nhận cả hai.
 *
 * 401 CỐ TÌNH không lấy message từ server: core trả về repr Python của object
 * DRF nhét trong string (rò tên class nội bộ, không đọc được). Tầng UI map cứng
 * 401 sang câu "phiên hết hạn" của riêng mình.
 */
function parseError(status: number, body: unknown, statusText: string): ApiError {
  const go = (body as { error?: { code?: string; message?: string } } | null)?.error;
  if (go) return new ApiError(status, go.code ?? 'internal_error', go.message ?? statusText);

  const detail = (body as { detail?: unknown } | null)?.detail;

  if (typeof detail === 'string' && detail) {
    return new ApiError(status, `http_${status}`, detail);
  }

  // 422 pydantic: gộp mọi `msg` thành một câu để UI hiện được thứ gì đó có nghĩa.
  if (Array.isArray(detail)) {
    const msg = detail
      .map((d) => (d as { msg?: string })?.msg)
      .filter(Boolean)
      .join('; ');
    return new ApiError(status, 'validation_error', msg || statusText || 'invalid input');
  }

  return new ApiError(status, 'internal_error', statusText || 'request failed');
}

// `PATCH` thêm vào cho `/auth/me` (cập nhật hồ sơ từng phần). DELETE + body đã
// chạy sẵn qua nhánh chung bên dưới nên KHÔNG cần đụng gì thêm.
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: QueryParams;
  /** Gắn `Authorization: Bearer <access>` nếu đang có token. */
  auth?: boolean;
}

/**
 * Request tổng quát cho core API (có body, có Bearer).
 *
 * `apiGet` cũ GIỮ NGUYÊN không đụng tới: 6 hàm trong `api.ts` đang chạy qua nó,
 * sửa nó là rước rủi ro hồi quy cho toàn bộ phần catalog vốn đang chạy tốt.
 *
 * Refresh khi 401 KHÔNG nằm ở đây mà ở `authApi.authorizedRequest` — để
 * `client.ts` không phụ thuộc ngược vào tầng auth.
 */
export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, auth = false } = opts;
  const url = `${API_BASE}${path}${buildQuery(params)}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(0, 'network_error', (err as Error)?.message ?? 'network error');
  }

  // 204 (DELETE) và 205 (logout) không có body -> đừng parse, `res.json()` trên
  // body rỗng sẽ throw. Core trả 205 kèm `Content-Type: application/json` nên
  // không thể dựa vào header để đoán.
  if (res.status === 204 || res.status === 205) return undefined as T;

  let parsed: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      if (!res.ok) throw new ApiError(res.status, 'internal_error', text.slice(0, 200));
      throw new ApiError(res.status, 'invalid_response', 'invalid JSON response');
    }
  }

  if (!res.ok) throw parseError(res.status, parsed, res.statusText);
  return parsed as T;
}
