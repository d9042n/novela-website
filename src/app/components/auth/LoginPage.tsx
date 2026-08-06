import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Loader2, LogIn } from 'lucide-react';
import { ApiError } from '../../data/client';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Map status code của core -> key i18n.
 *
 * KHÔNG hiển thị message thô của server: core trả 401 dưới dạng repr Python của
 * object DRF nhét trong string (rò tên class nội bộ, người dùng đọc không hiểu).
 * Còn message 4xx khác thì là tiếng Việt cứng, không đổi theo ngôn ngữ đang chọn.
 * Nên dịch ở client theo status.
 */
function errorKey(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'auth.errors.invalidCredentials';
    if (err.status === 429) return 'auth.errors.rateLimited';
  }
  return 'common.loadError';
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ?next= để quay lại đúng trang đang xem trước khi bị guard đá sang đây.
  const next = params.get('next') ?? '/';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    // KHÔNG toLowerCase username: core so khớp phân biệt hoa thường khi đăng
    // nhập, hạ chữ sẽ làm hỏng tài khoản có chữ hoa. Chỉ trim khoảng trắng thừa.
    const name = username.trim();
    if (!name || !password) {
      setError('auth.errors.required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(name, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorKey(err));
      setSubmitting(false);
    }
  };

  const invalid = error === 'auth.errors.invalidCredentials';

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:py-24">
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
          {t('auth.login')}
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: '0.9rem' }}>
          {t('auth.loginPrompt')}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="login-username">{t('auth.username')}</Label>
          <Input
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            aria-invalid={invalid}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-password">{t('auth.password')}</Label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={invalid}
          />
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="mt-2 gap-2">
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          {t('auth.submitLogin')}
        </Button>
      </form>

      <p className="text-center text-muted-foreground" style={{ fontSize: '0.85rem' }}>
        {t('auth.noAccount')}{' '}
        <Link
          to={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-primary hover:underline"
        >
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
}
