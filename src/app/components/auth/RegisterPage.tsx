import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Loader2, UserPlus } from 'lucide-react';
import { ApiError } from '../../data/client';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Map lỗi đăng ký -> key i18n. Core phân biệt rõ hơn login:
 *  - 409 trùng username hoặc email (gộp 1 thông báo, không nói rõ cái nào trùng
 *    để không thành công cụ dò tài khoản)
 *  - 422 mật khẩu không qua validators của Django, HOẶC email sai định dạng
 *  - 429 quá 3 lần/phút theo IP
 */
function errorKey(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return 'auth.errors.usernameTaken';
    if (err.status === 422) return 'auth.errors.weakPassword';
    if (err.status === 429) return 'auth.errors.rateLimited';
  }
  return 'common.loadError';
}

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = params.get('next') ?? '/';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const name = username.trim();
    const mail = email.trim();
    if (!name || !mail || !password) {
      setError('auth.errors.required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // AuthProvider tự login sau khi đăng ký (core tách 2 bước, register không
      // trả token) nên vào thẳng được, user không phải gõ lại.
      await register(name, mail, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorKey(err));
      setSubmitting(false);
    }
  };

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
          {t('auth.register')}
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
          <Label htmlFor="register-username">{t('auth.username')}</Label>
          <Input
            id="register-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            aria-invalid={error === 'auth.errors.usernameTaken'}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-email">{t('auth.email')}</Label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={error === 'auth.errors.usernameTaken'}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-password">{t('auth.password')}</Label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={error === 'auth.errors.weakPassword'}
          />
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="mt-2 gap-2">
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {t('auth.submitRegister')}
        </Button>
      </form>

      <p className="text-center text-muted-foreground" style={{ fontSize: '0.85rem' }}>
        {t('auth.haveAccount')}{' '}
        <Link
          to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-primary hover:underline"
        >
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
