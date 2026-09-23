import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { ApiError } from '../../data/client';
import { changePassword } from '../../data/authApi';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

/**
 * Trang bảo mật (`/account/security`): đổi mật khẩu + xoá tài khoản.
 *
 * Tách khỏi `/account` có chủ ý: hành động phá huỷ không nên nằm cạnh ô "sửa
 * tên hiển thị" — người dùng lướt nhanh dễ bấm nhầm vào vùng nguy hiểm.
 */
export function SecurityPage() {
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t('account.errors.fixFields'));
      return;
    }
    // Chặn tại client: gửi lên rồi mới biết gõ nhầm ô xác nhận là lãng phí một
    // vòng mạng VÀ tốn một lượt rate-limit của endpoint đổi mật khẩu.
    if (newPassword !== confirmPassword) {
      setMismatch(true);
      setError(t('account.security.mismatch'));
      return;
    }

    setSubmitting(true);
    setError(null);
    setMismatch(false);
    try {
      // API trả CẶP TOKEN MỚI và authApi tự lưu, nên phiên hiện tại sống tiếp;
      // các thiết bị khác thì mất phiên vì core bump token_version.
      await changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('account.security.changed'));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          // Core gộp HAI ca vào 400: sai mật khẩu hiện tại, và mật khẩu mới
          // không qua validators. Chỉ status thì không phân biệt được, nên ưu
          // tiên message của server rồi mới rơi về câu gộp cả hai khả năng.
          setError(err.message || t('account.security.badPassword'));
        } else if (err.status === 429) {
          setError(t('account.errors.rateLimited'));
        } else {
          setError(t('account.security.changeFailed'));
        }
      } else {
        setError(t('account.security.changeFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-2">
        <Link to="/account">
          <ArrowLeft className="size-4" />
          {t('account.security.back')}
        </Link>
      </Button>

      <h1
        className="mb-6"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}
      >
        {t('account.security.title')}
      </h1>

      {/* Đổi mật khẩu */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('account.security.changePassword')}</CardTitle>
          <CardDescription>{t('account.security.logoutWarning')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="security-old-password">{t('account.security.currentPassword')}</Label>
              <Input
                id="security-old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setError(null);
                }}
                autoComplete="current-password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="security-new-password">{t('account.security.newPassword')}</Label>
              <Input
                id="security-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setMismatch(false);
                  setError(null);
                }}
                autoComplete="new-password"
                aria-invalid={mismatch}
                aria-describedby="security-new-password-hint"
              />
              <p
                id="security-new-password-hint"
                className="text-muted-foreground"
                style={{ fontSize: '0.8rem' }}
              >
                {t('account.security.passwordHint')}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="security-confirm-password">
                {t('account.security.confirmPassword')}
              </Label>
              <Input
                id="security-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMismatch(false);
                  setError(null);
                }}
                autoComplete="new-password"
                aria-invalid={mismatch}
                aria-describedby={mismatch ? 'security-mismatch' : undefined}
              />
              {mismatch && (
                <p id="security-mismatch" role="alert" className="text-destructive" style={{ fontSize: '0.8rem' }}>
                  {t('account.security.mismatch')}
                </p>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="mt-1 w-full gap-2 sm:w-auto">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {t('account.security.submitChange')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vùng nguy hiểm */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t('account.delete.zoneTitle')}</CardTitle>
          <CardDescription>{t('account.delete.zoneDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul
            className="list-inside list-disc text-muted-foreground"
            style={{ fontSize: '0.85rem' }}
          >
            <li>{t('account.delete.lossBookmarks')}</li>
            <li>{t('account.delete.lossProgress')}</li>
            <li>{t('account.delete.lossIrreversible')}</li>
          </ul>
          <div>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
