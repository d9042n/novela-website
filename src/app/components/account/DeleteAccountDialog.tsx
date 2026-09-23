import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { ApiError } from '../../data/client';
import { deleteAccount } from '../../data/authApi';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

/**
 * Hộp thoại xoá tài khoản — HAI tầng xác nhận: mật khẩu VÀ gõ lại đúng username.
 *
 * Vì sao không chỉ hỏi mật khẩu: trình duyệt tự điền mật khẩu, nên một nút xoá
 * cần đúng một cú bấm là tai nạn chờ xảy ra. Bắt gõ tay username buộc người dùng
 * đọc và hiểu mình đang xoá cái gì — thao tác này không hoàn tác được.
 */
export function DeleteAccountDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const nameMatches = confirmName === user.username;
  const canDelete = password.length > 0 && nameMatches && !submitting;

  const reset = () => {
    setPassword('');
    setConfirmName('');
    setError(null);
  };

  const onDelete = async () => {
    if (!canDelete) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteAccount(password);

      // Rời khỏi /account/security TRƯỚC khi state phiên đổi. `deleteAccount`
      // đã clearTokens(), AuthContext sẽ thấy phiên mất qua onTokensChanged và
      // guard sẽ đá sang /login — nhìn hệt như bị lỗi đăng nhập ngay sau khi
      // người dùng vừa xoá tài khoản thành công. (Cùng lý do với comment trong
      // UserMenu.tsx.) Điều hướng trước thì họ hạ cánh ở trang chủ.
      setOpen(false);
      navigate('/', { replace: true });
      // Không dựa vào onTokensChanged: nó là `storage` event, chỉ bắn CROSS-TAB
      // nên tab hiện tại có thể không bao giờ nhận. Chủ động dọn user ở đây.
      // `clearSession` chỉ xoá state UI, KHÔNG gọi API — `deleteAccount` đã
      // clearTokens() rồi, `logout()` lúc này chỉ bắn một request chắc chắn 401.
      clearSession();

      toast.success(t('account.delete.done'));
    } catch (err) {
      // Giữ dialog mở để user gõ lại mật khẩu, không bắt mở lại từ đầu.
      if (err instanceof ApiError && err.status === 400) {
        setError(t('account.delete.wrongPassword'));
      } else if (err instanceof ApiError && err.status === 429) {
        setError(t('account.errors.rateLimited'));
      } else {
        setError(t('account.delete.failed'));
      }
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Không cho đóng giữa lúc request đang bay: đóng dialog sẽ unmount và
        // người dùng mất luôn thông báo lỗi nếu request hỏng.
        if (submitting) return;
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="size-4" />
          {t('account.delete.trigger')}
        </Button>
      </DialogTrigger>

      {/* max-h + overflow: trên màn hình thấp (mobile ngang, hoặc khi bàn phím
          ảo bung lên) dialog cao hơn viewport sẽ cắt mất nút Xoá ở đáy mà không
          cuộn tới được. */}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">{t('account.delete.title')}</DialogTitle>
          <DialogDescription>{t('account.delete.description')}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" id="delete-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="delete-password">{t('account.delete.passwordLabel')}</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
              aria-invalid={!!error}
              aria-describedby={error ? 'delete-error' : undefined}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="delete-confirm-name">
              {t('account.delete.confirmLabel', { username: user.username })}
            </Label>
            <Input
              id="delete-confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={user.username}
              aria-describedby="delete-confirm-hint"
            />
            <p id="delete-confirm-hint" className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>
              {t('account.delete.confirmHint')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            {t('account.delete.cancel')}
          </Button>
          <Button type="button" variant="destructive" disabled={!canDelete} onClick={onDelete} className="gap-2">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {t('account.delete.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
