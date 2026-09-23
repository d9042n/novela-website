import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { ApiError } from '../../data/client';
import { resetPassword } from '../../data/authApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Độ dài tối thiểu — khớp `MinimumLengthValidator` mặc định của Django (8).
 *
 * Cố ý KHÔNG bịa thêm luật (phải có chữ hoa, ký tự đặc biệt...): client nghiêm
 * hơn server thì chặn oan mật khẩu mà server chấp nhận, còn lỏng hơn thì user gõ
 * xong mới ăn 422. Chỉ mirror đúng luật đã biết, phần còn lại (mật khẩu quá phổ
 * biến, giống thông tin cá nhân) để server phán và hiện message của nó.
 */
const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Link trong email có dạng /reset-password?token=<uidb64>.<token>.
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** Key i18n (lỗi client) hoặc message thô của server (ca 422). */
  const [error, setError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  /** true khi server báo 400 -> link chết, form vô dụng, cần CTA gửi lại. */
  const [linkDead, setLinkDead] = useState(false);

  const tooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || !token) return;

    if (!password || !confirm) {
      setError('auth.errors.required');
      setServerMessage(null);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('auth.reset.tooShort');
      setServerMessage(null);
      return;
    }
    if (password !== confirm) {
      setError('auth.reset.mismatch');
      setServerMessage(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setServerMessage(null);
    try {
      await resetPassword(token, password);
      // KHÔNG tự đăng nhập: server không trả cặp token, và biến một link nằm
      // trong hộp thư thành đường vào phiên trực tiếp là mô hình sai — ai đọc
      // được email (hoặc log proxy chứa URL) là vào được tài khoản.
      toast.success(t('auth.reset.success'));
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          // Core gộp MỌI ca token sai/hết hạn/đã dùng vào 400 với một message
          // chung, nên client cũng chỉ có đúng một câu để nói.
          setError('auth.reset.invalidToken');
          setLinkDead(true);
        } else if (err.status === 422) {
          // 422 = validator mật khẩu của Django. Message của server nói cụ thể
          // vướng luật nào (quá phổ biến, toàn số...) — hiện nguyên văn hữu ích
          // hơn một câu chung chung do client tự nghĩ.
          setServerMessage(err.message);
        } else if (err.status === 429) {
          setError('auth.errors.rateLimited');
        } else {
          setError('common.loadError');
        }
      } else {
        setError('common.loadError');
      }
      setSubmitting(false);
    }
  };

  const heading = (
    <div className="flex flex-col gap-2 text-center">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.3rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}
      >
        {t('auth.reset.title')}
      </h1>
      <p className="text-muted-foreground" style={{ fontSize: '0.9rem' }}>
        {t('auth.reset.prompt')}
      </p>
    </div>
  );

  // Không có token trong URL thì không có gì để submit — render form chỉ dụ user
  // gõ mật khẩu rồi ăn lỗi. Dừng ở đây và chỉ đường về /forgot-password.
  if (!token) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:py-24">
        {heading}
        <Alert variant="destructive">
          <AlertDescription>{t('auth.reset.missingToken')}</AlertDescription>
        </Alert>
        <p className="text-center text-muted-foreground" style={{ fontSize: '0.85rem' }}>
          <Link to="/forgot-password" className="text-primary hover:underline">
            {t('auth.reset.requestNewLink')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:py-24">
      {heading}

      {(error || serverMessage) && (
        <Alert variant="destructive">
          <AlertDescription>{serverMessage ?? (error ? t(error) : null)}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="reset-password">{t('auth.reset.newPassword')}</Label>
          <div className="relative">
            <Input
              id="reset-password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              className="pr-10"
              aria-invalid={tooShort || error === 'auth.reset.tooShort' || serverMessage !== null}
              aria-describedby="reset-password-hint"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={t(show ? 'auth.reset.hidePassword' : 'auth.reset.showPassword')}
              aria-pressed={show}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p
            id="reset-password-hint"
            className={tooShort ? 'text-destructive' : 'text-muted-foreground'}
            style={{ fontSize: '0.8rem' }}
          >
            {t('auth.reset.minLengthHint', { min: MIN_PASSWORD_LENGTH })}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reset-confirm">{t('auth.reset.confirmPassword')}</Label>
          <Input
            id="reset-confirm"
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-invalid={mismatch}
            aria-describedby={mismatch ? 'reset-confirm-error' : undefined}
          />
          {mismatch && (
            <p id="reset-confirm-error" className="text-destructive" style={{ fontSize: '0.8rem' }}>
              {t('auth.reset.mismatch')}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting || linkDead || tooShort || mismatch}
          className="mt-2 gap-2"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <KeyRound className="size-4" />
          )}
          {t('auth.reset.submit')}
        </Button>
      </form>

      {linkDead && (
        <p className="text-center text-muted-foreground" style={{ fontSize: '0.85rem' }}>
          <Link to="/forgot-password" className="text-primary hover:underline">
            {t('auth.reset.requestNewLink')}
          </Link>
        </p>
      )}

      <p className="text-center text-muted-foreground" style={{ fontSize: '0.85rem' }}>
        <Link to="/login" className="text-primary hover:underline">
          {t('auth.forgot.backToLogin')}
        </Link>
      </p>
    </div>
  );
}
