import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Loader2, MailCheck, Send } from 'lucide-react';
import { ApiError } from '../../data/client';
import { forgotPassword } from '../../data/authApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

/**
 * Cooldown (giây) giữa hai lần bấm gửi.
 *
 * Core chặn 3 lần/phút theo IP. Nếu để user bấm tự do, một người sốt ruột bấm 4
 * cái là tự khoá chính mình bằng 429 — lỗi nhìn như "hệ thống hỏng" trong khi
 * thật ra email đầu tiên đã gửi đi rồi. 60s đủ rộng để không bao giờ chạm ngưỡng.
 */
const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Đếm ngược cooldown.
  //
  // Điều kiện chạy là `cooldown > 0` nhưng deps chỉ có `cooldownStartedAt`, CÓ
  // CHỦ Ý: nếu phụ thuộc vào `cooldown` thì mỗi tick sẽ clear rồi tạo lại
  // interval, khiến 1000ms đếm lại từ đầu sau mỗi lần setState -> đếm ngược trôi
  // chậm dần. Một interval duy nhất cho mỗi lần bấm gửi, tự dừng khi về 0.
  const [cooldownStartedAt, setCooldownStartedAt] = useState(0);
  useEffect(() => {
    if (cooldownStartedAt === 0) return;
    const id = window.setInterval(() => {
      setCooldown((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    // Cleanup chạy cả khi unmount giữa lúc đang đếm -> không rò interval và
    // không setState trên component đã tháo.
    return () => window.clearInterval(id);
  }, [cooldownStartedAt]);

  useEffect(() => {
    if (cooldown === 0) setCooldownStartedAt(0);
  }, [cooldown]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || cooldown > 0) return;

    const mail = email.trim();
    if (!mail) {
      setError('auth.errors.required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword(mail);
      // Server CỐ Ý trả 202 cho cả email không tồn tại, để không ai dùng form
      // này dò xem địa chỉ nào có tài khoản. Vì vậy UI tuyệt đối không được suy
      // diễn thêm: mọi kết quả thành công đều dẫn tới đúng một thông báo trung
      // tính. Chỉ cần một nhánh hiện "email không tồn tại" là biện pháp chống dò
      // của server thành vô nghĩa — kẻ dò chỉ việc đọc màn hình thay vì đọc HTTP
      // status.
      setSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setCooldownStartedAt(Date.now());
    } catch (err) {
      // 429 là ngoại lệ DUY NHẤT được hiện lỗi khác: nó nói về nhịp bấm của
      // chính user, không tiết lộ gì về việc email có tồn tại hay không.
      if (err instanceof ApiError && err.status === 429) {
        setError('auth.errors.rateLimited');
      } else {
        setError('common.loadError');
      }
    } finally {
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
          {t('auth.forgot.title')}
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: '0.9rem' }}>
          {t('auth.forgot.prompt')}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      )}

      {sent && (
        <Alert>
          <MailCheck className="size-4" />
          <AlertDescription>{t('auth.forgot.sentNotice')}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="forgot-email">{t('auth.email')}</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            aria-invalid={error === 'auth.errors.required'}
            aria-describedby="forgot-email-hint"
          />
          <p
            id="forgot-email-hint"
            className="text-muted-foreground"
            style={{ fontSize: '0.8rem' }}
          >
            {t('auth.forgot.emailHint')}
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting || cooldown > 0}
          className="mt-2 gap-2"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {cooldown > 0
            ? t('auth.forgot.resendIn', { seconds: cooldown })
            : sent
              ? t('auth.forgot.resend')
              : t('auth.forgot.submit')}
        </Button>
      </form>

      <p className="text-center text-muted-foreground" style={{ fontSize: '0.85rem' }}>
        <Link to="/login" className="text-primary hover:underline">
          {t('auth.forgot.backToLogin')}
        </Link>
      </p>
    </div>
  );
}
