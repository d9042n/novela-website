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
  /**
   * Nạp lại hồ sơ từ server (`getMe`). Lỗi thì GIỮ NGUYÊN user hiện tại.
   *
   * Vì sao không set `null` khi lỗi: một cú `getMe` hỏng vì mạng/5xx không phải
   * bằng chứng phiên đã chết. `authorizedRequest` đã tự refresh token một lần
   * trước khi bỏ cuộc, nên khi phiên thật sự hết hạn thì `setSessionExpiredHandler`
   * mới là đường báo về — và đó là chỗ DUY NHẤT được quyền xoá phiên. Nếu
   * `refreshUser` cũng tự đăng xuất, một lần mất wifi lúc mở trang Tài khoản sẽ
   * đá user ra ngoài dù token còn nguyên giá trị.
   */
  refreshUser: () => Promise<void>;
  /**
   * Đặt thẳng user đã có sẵn từ response (ví dụ `updateProfile` trả về AuthUser).
   *
   * Tránh một round-trip `getMe` dư: server vừa trả đúng bản hồ sơ mới nhất rồi,
   * gọi lại chỉ thêm độ trễ và thêm một cửa để hiện dữ liệu cũ nếu có replica lag.
   */
  applyUser: (u: AuthUser) => void;
  /**
   * Xoá phiên phía UI, KHÔNG gọi API.
   *
   * Dùng sau khi xoá tài khoản: `deleteAccount` đã `clearTokens()` ở tầng data,
   * nên gọi `logout()` lúc này chỉ bắn một request chắc chắn 401 tới tài khoản
   * không còn tồn tại.
   */
  clearSession: () => void;
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

  const refreshUser: AuthContextValue['refreshUser'] = async () => {
    try {
      setUser(await getMe());
    } catch {
      /* giữ nguyên user hiện tại — xem doc của interface */
    }
  };

  const applyUser: AuthContextValue['applyUser'] = (u) => setUser(u);

  const clearSession: AuthContextValue['clearSession'] = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, applyUser, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
