import { useCallback, useEffect, useState } from 'react';

export interface ReadingRecord {
  novelId: string;
  chapterIndex: number;
  scroll: number; // 0..1
  updatedAt: number;
}

const KEY = 'novela.readingProgress';

function readAll(): Record<string, ReadingRecord> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ReadingRecord>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/** Lưu tiến độ đọc theo truyện (chương + vị trí cuộn). */
export function saveProgress(record: ReadingRecord) {
  const all = readAll();
  all[record.novelId] = record;
  writeAll(all);
}

export function getProgress(novelId: string): ReadingRecord | undefined {
  return readAll()[novelId];
}

/** Danh sách truyện đang đọc dở, mới nhất trước. */
export function getContinueList(): ReadingRecord[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Theo dõi % cuộn của một phần tử và lưu định kỳ.
 * Trả về progress 0..1 để hiển thị thanh tiến độ.
 */
export function useScrollProgress(
  novelId: string,
  chapterIndex: number,
  ref: React.RefObject<HTMLElement | null>,
) {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    const ratio = scrollable > 0 ? el.scrollTop / scrollable : 0;
    const clamped = Math.min(1, Math.max(0, ratio));
    setProgress(clamped);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, ref, chapterIndex]);

  // Lưu tiến độ khi progress đổi (debounce nhẹ).
  useEffect(() => {
    const id = setTimeout(() => {
      saveProgress({ novelId, chapterIndex, scroll: progress, updatedAt: Date.now() });
    }, 400);
    return () => clearTimeout(id);
  }, [novelId, chapterIndex, progress]);

  return progress;
}
