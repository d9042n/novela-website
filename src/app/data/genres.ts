/**
 * Nguồn thể loại — fetch ĐỘNG từ backend (/genres, 46 slug VN thật).
 * KHÔNG hardcode (mock cũ có 10 id EN đã bỏ).
 *
 * Cung cấp:
 *  - `useGenres()`: hook trả danh sách genre + loading (có cache module-level,
 *    chỉ fetch 1 lần cho cả app).
 *
 * Lưu ý: để resolve TÊN thể loại của 1 truyện, dùng thẳng `novel.genres`
 * (đã nhúng name+slug từ API list/detail) — KHÔNG cần lookup qua đây.
 */

import { useEffect, useState } from 'react';
import { getGenres } from './api';
import type { Genre } from './types';

let cache: Genre[] | null = null;
let inflight: Promise<Genre[]> | null = null;

/** Fetch genres 1 lần, chia sẻ promise cho mọi caller đồng thời. */
function loadGenres(): Promise<Genre[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = getGenres()
      .then((list) => {
        cache = list;
        return list;
      })
      .catch((err) => {
        inflight = null; // cho phép retry lần sau
        throw err;
      });
  }
  return inflight;
}

/** Hook trả danh sách thể loại (cache toàn app). */
export function useGenres(): { genres: Genre[]; loading: boolean } {
  const [genres, setGenres] = useState<Genre[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) {
      setGenres(cache);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    loadGenres()
      .then((list) => {
        if (active) {
          setGenres(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { genres, loading };
}
