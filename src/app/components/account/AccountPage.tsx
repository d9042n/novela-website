import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BookMarked, Clock, Loader2, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { getAccountStats, sendVerificationEmail } from '../../data/authApi';
import { ApiError } from '../../data/client';
import type { AccountStats } from '../../data/types';
import { displayNameOf } from '../../data/types';
import { formatDate } from '../../data/format';
import { useAuth } from '../../auth/AuthContext';
import { ProfileForm } from './ProfileForm';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

/** Một ô số liệu. Dùng chung cho cả 3 tile để mọi ô cao bằng nhau. */
function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-muted-foreground" style={{ fontSize: '0.78rem' }}>
            {label}
          </p>
          <p
            className="truncate tabular-nums"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600 }}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-3 px-4">
            <Skeleton className="size-9 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

/**
 * Trang hồ sơ tài khoản (`/account`).
 *
 * Route đã bọc guard đăng nhập, nhưng `user` vẫn qua nhịp `undefined` lúc
 * bootstrap nên vẫn phải chờ trước khi render (cùng quy ước ba-trạng-thái với
 * `AuthContext`).
 */
export function AccountPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // `undefined` = chưa tải xong. `null` = tải xong nhưng LỖI (khối stat bị ẩn).
  const [stats, setStats] = useState<AccountStats | null | undefined>(undefined);
  // Ảnh đại diện do user tự gõ URL nên hỏng là chuyện thường -> nhớ lại lần lỗi
  // để rơi về chữ cái đầu.
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState(0);

  useEffect(() => {
    if (verifyCooldown <= 0) return;
    const timer = setInterval(() => setVerifyCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [verifyCooldown]);

  const handleSendVerify = async () => {
    if (sendingVerify || verifyCooldown > 0) return;
    setSendingVerify(true);
    try {
      await sendVerificationEmail();
      toast.success(t('account.verifyEmailSent', 'Đã gửi liên kết xác thực tới hộp thư của bạn!'));
      setVerifyCooldown(60);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        toast.info(err.message || t('account.alreadyVerified', 'Email đã được xác thực trước đó.'));
      } else if (err instanceof ApiError && err.status === 429) {
        toast.error(t('account.errors.rateLimited', 'Thao tác quá nhanh, vui lòng thử lại sau.'));
      } else {
        toast.error(t('account.verifyEmailFailed', 'Không thể gửi email xác thực. Vui lòng thử lại.'));
      }
    } finally {
      setSendingVerify(false);
    }
  };

  const avatarUrl = user?.avatarUrl.trim() ?? '';
  // PHẢI reset khi URL đổi: đổi sang ảnh mới mà vẫn giữ cờ hỏng của ảnh cũ thì
  // ảnh hợp lệ cũng không bao giờ được hiện.
  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  useEffect(() => {
    let active = true;
    setStats(undefined);
    getAccountStats()
      .then((s) => {
        if (active) setStats(s);
      })
      .catch(() => {
        // Nuốt lỗi CÓ CHỦ Ý: số liệu chỉ là thông tin phụ, còn hồ sơ và form sửa
        // là lý do người ta vào trang này. Một endpoint /stats chết không được
        // phép biến cả trang thành màn hình lỗi khiến user không sửa nổi email.
        if (active) setStats(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  const name = displayNameOf(user);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const showAvatar = avatarUrl !== '' && !avatarBroken;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header hồ sơ */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
          {showAvatar ? (
            <img
              src={avatarUrl}
              alt={t('account.profile.avatarOfAlt', { name })}
              className="size-full object-cover"
              // Ảnh hỏng -> lật cờ để render nhánh chữ cái đầu. KHÔNG dùng
              // style.display='none' như trước: nó chỉ giấu ảnh và để lại một
              // vòng tròn rỗng, chữ cái thay thế không bao giờ xuất hiện.
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <span
              aria-hidden="true"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700 }}
              className="text-muted-foreground"
            >
              {initial}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1
            className="break-words"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            {name}
          </h1>
          <p className="truncate text-muted-foreground" style={{ fontSize: '0.9rem' }}>
            @{user.username}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="break-all text-muted-foreground" style={{ fontSize: '0.85rem' }}>
              {user.email}
            </span>
            {!user.emailVerified ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-destructive/50 text-destructive">
                  {t('account.emailUnverified')}
                </Badge>
                {user.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendVerify}
                    disabled={sendingVerify || verifyCooldown > 0}
                    className="h-6 px-2 text-xs gap-1"
                  >
                    {sendingVerify ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Mail className="size-3" />
                    )}
                    {verifyCooldown > 0
                      ? t('account.resendAfter', { seconds: verifyCooldown })
                      : t('account.verifyEmailBtn', 'Xác thực ngay')}
                  </Button>
                )}
              </div>
            ) : (
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                {t('account.emailVerified', 'Đã xác thực')}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground" style={{ fontSize: '0.8rem' }}>
            {t('account.joinedAt', { date: formatDate(user.joinedAt) })}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/library">
              <BookMarked className="size-4" />
              {t('library.title')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/account/security">
              <ShieldCheck className="size-4" />
              {t('account.security.title')}
            </Link>
          </Button>
        </div>
      </div>

      {/* lg: hồ sơ trái | stats phải. Dưới lg thì stats nằm trên form. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="order-2 min-w-0 lg:order-1">
          <ProfileForm />
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          {/* stats === null nghĩa là tải lỗi -> ẩn NGUYÊN khối, không hiện số 0
              giả (user sẽ tưởng tủ sách của mình trống) cũng không hiện lỗi đỏ
              cho một thông tin phụ. */}
          {stats !== null && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {stats === undefined ? (
                <StatSkeleton />
              ) : (
                <>
                  <StatTile
                    icon={<BookMarked className="size-4" />}
                    label={t('account.stats.bookmarks')}
                    value={String(stats.bookmarkCount)}
                  />
                  <StatTile
                    icon={<UserRound className="size-4" />}
                    label={t('account.stats.reading')}
                    value={String(stats.readingCount)}
                  />
                  <StatTile
                    icon={<Clock className="size-4" />}
                    label={t('account.stats.lastActivity')}
                    value={
                      stats.lastActivityAt
                        ? formatDate(stats.lastActivityAt)
                        : t('account.stats.never')
                    }
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
