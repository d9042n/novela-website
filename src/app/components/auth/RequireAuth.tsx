import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '../../auth/AuthContext';

/**
 * Guard cho route cần đăng nhập.
 *
 * PHẢI chờ `loading === false` rồi mới redirect: lúc mở app, phiên được khôi
 * phục bất đồng bộ (`getMe()` + có thể kèm một lượt refresh). Redirect ngay khi
 * `user` còn `undefined` sẽ đá user đã đăng nhập sang `/login` một nhịp mỗi lần
 * F5 trang này, rồi mới nhảy ngược lại — nhìn như bug đăng xuất ngẫu nhiên.
 *
 * `?next=` giữ đường về đúng trang đang xem. `replace` để nút Back không kẹt
 * vòng giữa trang bị chặn và trang login.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading || user === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
