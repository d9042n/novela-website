import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addBookmark, getBookmark, removeBookmark } from '../../data/libraryApi';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/button';

/**
 * Nút đánh dấu truyện.
 *
 * Phải cắm vào CẢ BA preset layout của trang chi tiết (classic / cinematic /
 * minimal) — mỗi preset có hàng nút riêng, thiếu một chỗ là user đổi preset thì
 * nút biến mất.
 *
 * Chưa đăng nhập: KHÔNG ẩn nút mà vẫn hiện, bấm thì điều hướng sang `/login`
 * kèm `?next=` để quay lại đúng truyện này. Ẩn nút sẽ khiến user không biết
 * chức năng tồn tại.
 */
export function BookmarkButton({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // null = chưa biết (đang hỏi server hoặc chưa đăng nhập).
  const [marked, setMarked] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setMarked(null);
      return;
    }
    // getBookmark nuốt 404 thành null — "chưa đánh dấu" là câu trả lời bình
    // thường của endpoint này, không phải lỗi.
    getBookmark(slug)
      .then((b) => {
        if (active) setMarked(b !== null);
      })
      .catch(() => {
        if (active) setMarked(null);
      });
    return () => {
      active = false;
    };
  }, [slug, user]);

  const onClick = async () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/novel/${slug}`)}`);
      return;
    }
    if (busy) return;

    const next = !marked;
    setBusy(true);
    // Optimistic: đổi icon ngay rồi mới gọi mạng. Thất bại thì trả về trạng thái
    // cũ — bấm bookmark là thao tác nhỏ, chờ round-trip mới đổi icon thấy ì.
    setMarked(next);
    try {
      if (next) {
        await addBookmark(slug);
        toast.success(t('library.added'));
      } else {
        await removeBookmark(slug);
        toast.success(t('library.removed'));
      }
    } catch {
      setMarked(!next);
      toast.error(t('common.loadError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={marked ? 'secondary' : 'outline'}
      size="lg"
      onClick={onClick}
      disabled={busy}
      className="gap-2"
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : marked ? (
        <BookmarkCheck className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {marked ? t('library.remove') : t('library.add')}
    </Button>
  );
}
