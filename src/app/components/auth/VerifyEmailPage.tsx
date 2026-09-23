import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { verifyEmail } from '../../data/authApi';
import { ApiError } from '../../data/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [state, setState] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!token) {
      setState('error');
      setErrorMessage(t('auth.verifyEmail.missingToken', 'Không tìm thấy mã xác thực trong đường dẫn.'));
      return;
    }

    setState('verifying');
    setErrorMessage(null);

    verifyEmail(token)
      .then(() => {
        if (!active) return;
        setState('success');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setState('error');
        if (err instanceof ApiError) {
          setErrorMessage(err.message || t('auth.verifyEmail.invalidToken', 'Mã xác thực không hợp lệ hoặc đã hết hạn.'));
        } else {
          setErrorMessage(t('auth.verifyEmail.failed', 'Xác thực email không thành công. Vui lòng thử lại.'));
        }
      });

    return () => {
      active = false;
    };
  }, [token, t]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <Card className="border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
            {t('auth.verifyEmail.title', 'Xác thực Email')}
          </CardTitle>
          <CardDescription>
            {t('auth.verifyEmail.subtitle', 'Xác nhận quyền sở hữu hộp thư của tài khoản Novela')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {state === 'verifying' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t('auth.verifyEmail.verifying', 'Đang xác thực địa chỉ email của bạn...')}
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground" style={{ fontSize: '1.05rem' }}>
                  {t('auth.verifyEmail.successTitle', 'Xác thực email thành công!')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('auth.verifyEmail.successDesc', 'Email của bạn đã được xác thực an toàn. Bạn có thể sử dụng đầy đủ các tính năng của Novela.')}
                </p>
              </div>

              <div className="mt-4 flex w-full flex-col gap-2">
                <Button asChild className="w-full gap-2">
                  <Link to="/account">
                    {t('auth.verifyEmail.goToAccount', 'Đi tới Hồ sơ tài khoản')}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    {t('auth.verifyEmail.goToHome', 'Về Trang chủ')}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground" style={{ fontSize: '1.05rem' }}>
                  {t('auth.verifyEmail.errorTitle', 'Xác thực không thành công')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
              </div>

              <div className="mt-4 flex w-full flex-col gap-2">
                <Button asChild className="w-full">
                  <Link to="/account">
                    {t('auth.verifyEmail.backToAccount', 'Quay lại Trang tài khoản')}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    {t('auth.verifyEmail.goToHome', 'Về Trang chủ')}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
