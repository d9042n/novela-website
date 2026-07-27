import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChapterSummary } from '../../data/types';
import { getChapterList } from '../../data/api';
import { useReaderSettings } from './ReaderSettingsContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../ui/utils';

interface ReaderControlsProps {
  slug: string;
  currentNo: number;
  /** Tiêu đề chương hiện tại — hiển thị ngay ở trigger, không cần chờ fetch. */
  currentTitle: string;
  total: number;
  prevNo: number | null;
  nextNo: number | null;
  onPrev: () => void;
  onNext: () => void;
  onJump: (no: number) => void;
  visible: boolean;
}

const DARK_READER_THEMES = ['dark', 'ocean', 'oled'];

/** Cửa sổ chương nạp cho dropdown — KHÔNG nạp toàn bộ (D4). */
const WINDOW_SIZE = 50;

/**
 * Thanh điều hướng dưới cùng của reader.
 *
 * Điều hướng prev/next dùng prev_no/next_no THẬT (D5: chapter_no không liên tục).
 * Ô giữa là picker nhảy chương: chỉ nạp CỬA SỔ {@link WINDOW_SIZE} chương quanh
 * chương hiện tại, nạp LAZY khi mở dropdown — truyện có thể >11.000 chương nên
 * liệt kê toàn bộ sẽ nổ RAM (D4). Mục lục đầy đủ (server pagination + tìm kiếm)
 * vẫn nằm ở toolbar.
 */
export function ReaderControls({
  slug,
  currentNo,
  currentTitle,
  total,
  prevNo,
  nextNo,
  onPrev,
  onNext,
  onJump,
  visible,
}: ReaderControlsProps) {
  const { t } = useTranslation();
  const { settings } = useReaderSettings();
  const isDark = DARK_READER_THEMES.includes(settings.theme);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ChapterSummary[]>([]);

  // Nạp cửa sổ chương lần đầu mở dropdown (và khi đổi truyện/đổi cửa sổ).
  const page = Math.max(1, Math.ceil(currentNo / WINDOW_SIZE));
  useEffect(() => {
    if (!open) return;
    let active = true;
    getChapterList(slug, { page, size: WINDOW_SIZE, order: 'asc' })
      .then((res) => active && setItems(res.items))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [open, slug, page]);

  // chapter_no KHÔNG liên tục -> cửa sổ suy ra theo vị trí có thể không chứa
  // chương hiện tại. Chỉ gắn value khi thực sự có item khớp, tránh Select hiện rỗng.
  const hasCurrent = items.some((c) => c.chapterNo === currentNo);

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--reader-bg) 95%, transparent)',
        borderColor: 'color-mix(in srgb, var(--reader-fg) 15%, transparent)',
        color: 'var(--reader-fg)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={prevNo == null}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-all duration-150 shrink-0 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--reader-fg) 20%, transparent)',
            color: 'var(--reader-fg)',
          }}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">{t('reader.prevChapter')}</span>
        </button>

        {/* min-w-0 là phần bắt buộc, không phải trang trí: flex-1 một mình vẫn
            không cho ô này co xuống dưới chiều rộng NỘI TẠI của nó, mà nội dung
            là tiêu đề chương với whitespace-nowrap (có thể rất dài). Ở 320px ô
            này phình tới 271px và đẩy nút "Chương sau" ra ngoài mép phải — đo
            được: element trải tới x=383 trên viewport 320. min-w-0 cho phép co;
            phần cắt chữ do ui/select.tsx lo sẵn (line-clamp-1 trên select-value),
            nên ở đây không cần thêm gì. */}
        <div className="min-w-0 flex-1">
          <Select
            open={open}
            onOpenChange={setOpen}
            value={hasCurrent ? String(currentNo) : undefined}
            onValueChange={(v) => onJump(Number(v))}
          >
            <SelectTrigger
              aria-label={t('reader.contents')}
              className="mx-auto w-full max-w-xs text-xs font-semibold rounded-xl border transition-all"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--reader-fg) 20%, transparent)',
                color: 'var(--reader-fg)',
              }}
            >
              <SelectValue placeholder={currentTitle} />
            </SelectTrigger>
            <SelectContent
              className={cn(
                'max-h-72 border shadow-2xl z-[100] opacity-100',
                isDark
                  ? 'reader-dark-dropdown !bg-[#18181b] !border-white/20'
                  : 'reader-light-dropdown !bg-white !border-black/15',
              )}
              style={{
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                color: isDark ? '#ffffff' : '#0f172a',
                opacity: 1,
              }}
            >
              {items.map((c) => (
                <SelectItem
                  key={c.chapterNo}
                  value={String(c.chapterNo)}
                  className={cn(
                    'text-xs cursor-pointer font-medium transition-all py-2 px-3 rounded-lg my-0.5',
                    isDark
                      ? '!text-white focus:!bg-white/20 focus:!text-white data-[state=checked]:!bg-white/25 data-[state=checked]:!text-white'
                      : '!text-slate-900 focus:!bg-black/10 focus:!text-slate-900 data-[state=checked]:!bg-black/10 data-[state=checked]:!text-slate-900',
                  )}
                  style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  <span
                    className="font-medium"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                  >
                    {c.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="sr-only">{t('reader.chapterOf', { index: currentNo, total })}</p>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={nextNo == null}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold border transition-all duration-150 shrink-0 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--reader-fg) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--reader-fg) 20%, transparent)',
            color: 'var(--reader-fg)',
          }}
        >
          <span className="hidden sm:inline">{t('reader.nextChapter')}</span>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
