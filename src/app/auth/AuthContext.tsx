import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  setSessionExpiredHandler,
} from '../data/authApi';
import { getTokens, onTokensChanged } from '../data/tokenStore';
import { mergeServerProgress, pushLocalProgress } from '../data/progressSync';
import { listReadingProgress } from '../data/libraryApi';
import type { AuthUser } from '../data/types';

/**
 * Hợp nhất tiến độ đọc hai chiều sau khi đăng nhập: đẩy bản ghi offline lên
 * server (một lần cho mỗi user), rồi kéo về những gì server đang có.
 *
 * Fire-and-forget: sync là tiện ích nền, hỏng thì user vẫn đọc bình thường bằng
 * dữ liệu localStorage. Không có lý do để chặn luồng đăng nhập vì nó.
 */
async function syncAfterLogin(userId: number): Promise<void> {
  try {
    await pushLocalProgress(userId);
    const page = await listReadingProgress({ size: 100 });
    mergeServerProgress(page.items);
  } catch {
    /* im lặng có chủ ý */
  }
}

interface AuthContextValue {
  /**
   * `undefined` = đang khôi phục phiên lúc mở app (CHƯA BIẾT).
   * `null` = biết chắc chưa đăng nhập. `AuthUser` = đã đăng nhập.
   *
   * Ba trạng thái chứ không phải hai, cùng quy ước với `NovelDetailPage`. Gộp
   * `undefined` vào `null` thì guard `/library` sẽ đá user đã đăng nhập sang
   * `/login` một nhịp mỗi lần F5, rồi mới nhảy ngược lại.
   */
  user: AuthUser | null | undefined;
  /** true trong lúc bootstrap. Guard phải chờ cái này false rồi mới redirect. */
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên khi mở app. Access chỉ sống 15 phút nên token trong
  // localStorage rất hay đã chết -> getMe() tự refresh một lần trước khi bỏ cuộc
  // (xem authorizedRequest), chỉ khi refresh cũng chết mới coi là chưa đăng nhập.
  useEffect(() => {
    let active = true;

    if (!getTokens()) {
      setUser(null);
      setLoading(false);
      return;
    }

    getMe()
      .then((u) => {
        if (!active) return;
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Tầng HTTP không import React nên không tự setState được khi refresh thất
  // bại giữa chừng. Đăng ký callback để nó báo ngược lên đây.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  // Đăng nhập/đăng xuất ở TAB KHÁC -> đồng bộ tab này. `storage` event chỉ bắn
  // cross-tab nên không lo vòng lặp với chính mình.
  useEffect(() => {
    return onTokensChanged((pair) => {
      if (!pair) {
        setUser(null);
        return;
      }
      getMe()
        .then(setUser)
        .catch(() => setUser(null));
    });
  }, []);

  // Ném tiếp ApiError để trang Login đọc `err.status` (401/409/422/429) mà hiện
  // đúng thông báo. Provider KHÔNG nuốt lỗi.
  const login: AuthContextValue['login'] = async (username, password) => {
    await loginApi({ username, password });
    const me = await getMe();
    setUser(me);
    void syncAfterLogin(me.id);
  };

  const register: AuthContextValue['register'] = async (username, email, password) => {
    await registerApi({ username, email, password });
    // Core tách 2 bước: register KHÔNG trả token. Login luôn để user khỏi phải
    // gõ lại thông tin vừa nhập.
    await loginApi({ username, password });
    const me = await getMe();
    setUser(me);
    void syncAfterLogin(me.id);
  };

  const logout: AuthContextValue['logout'] = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
