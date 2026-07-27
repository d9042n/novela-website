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

/** Envelope phân trang từ backend. */
export interface PageEnvelope<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

/** Kết quả phân trang đã map sang camelCase cho tầng UI. */
export interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

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
