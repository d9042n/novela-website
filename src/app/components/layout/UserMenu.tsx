import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookMarked, LogIn, LogOut, User, UserCog } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { displayNameOf } from '../../data/types';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

/**
 * Cửa vào tài khoản: nút Đăng nhập khi chưa có phiên, menu user khi đã có.
 *
 * Phải cắm vào CẢ BA shell layout (Header / Sidebar / FloatingDock) — chúng thay
 * thế nhau theo lựa chọn của user, thiếu một chỗ là đổi shell thì mất luôn cửa
 * đăng nhập.
 *
 * Trong lúc `loading` thì KHÔNG render gì: hiện nút "Đăng nhập" rồi một nhịp sau
 * đổi thành tên user là nhấp nháy khó chịu ở mọi lần tải trang.
 */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  // Ảnh đại diện do user tự gõ URL nên chết là chuyện thường -> nhớ lại lần lỗi
  // để lui về icon, không để trình duyệt hiện icon ảnh vỡ.
  const [avatarBroken, setAvatarBroken] = useState(false);

  const avatarUrl = user?.avatarUrl?.trim() ?? '';
  // PHẢI reset theo URL: sau khi user sửa ảnh đại diện trong /account, cờ hỏng
  // của ảnh CŨ vẫn còn nên menu tiếp tục hiện icon fallback dù ảnh mới tải được.
  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  if (loading) return null;

  if (!user) {
    return (
      <Button
        variant="ghost"
        size={compact ? 'icon' : 'sm'}
        onClick={() => navigate('/login')}
        aria-label={t('auth.login')}
        title={t('auth.login')}
        className="gap-2"
      >
        <LogIn className="size-4" />
        {!compact && t('auth.login')}
      </Button>
    );
  }

  const showAvatar = avatarUrl !== '' && !avatarBroken;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('auth.myAccount')}>
          {showAvatar ? (
            <img
              src={avatarUrl}
              alt=""
              aria-hidden="true"
              className="size-7 rounded-full object-cover"
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <User className="size-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="min-w-0">
          <span className="block truncate font-medium">{displayNameOf(user)}</span>
          <span
            className="block truncate text-muted-foreground font-normal"
            style={{ fontSize: '0.75rem' }}
          >
            @{user.username}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account" className="gap-2">
            <UserCog className="size-4" />
            {t('account.title')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/library" className="gap-2">
            <BookMarked className="size-4" />
            {t('library.title')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2"
          onClick={() => {
            // Điều hướng về trang chủ trước: nếu đang đứng ở /library thì guard
            // sẽ đá sang /login ngay khi phiên mất, nhìn như bị lỗi.
            navigate('/');
            void logout();
          }}
        >
          <LogOut className="size-4" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
