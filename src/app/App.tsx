import { BrowserRouter, Route, Routes } from 'react-router';
import './i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './theme/ThemeProvider';
import { ReaderSettingsProvider } from './components/reader/ReaderSettingsContext';
import { AuthProvider } from './auth/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './components/home/HomePage';
import { BrowsePage } from './components/browse/BrowsePage';
import { NovelDetailPage } from './components/detail/NovelDetailPage';
import { ReaderPage } from './components/reader/ReaderPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { AccountPage } from './components/account/AccountPage';
import { SecurityPage } from './components/account/SecurityPage';
import { LibraryPage } from './components/library/LibraryPage';
import { NotFoundPage } from './components/NotFoundPage';
import { Toaster } from './components/ui/sonner';
import { CommandPalette } from './components/command/CommandPalette';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ReaderSettingsProvider>
        <BrowserRouter>
          {/* AuthProvider nằm TRONG BrowserRouter (guard cần useNavigate/useLocation)
              và bọc CẢ ReaderPage — reader phải đẩy tiến độ đọc lên server được. */}
          <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="browse" element={<BrowsePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route
                path="library"
                element={
                  <RequireAuth>
                    <LibraryPage />
                  </RequireAuth>
                }
              />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route
                path="account"
                element={
                  <RequireAuth>
                    <AccountPage />
                  </RequireAuth>
                }
              />
              <Route
                path="account/security"
                element={
                  <RequireAuth>
                    <SecurityPage />
                  </RequireAuth>
                }
              />
              <Route path="novel/:slug" element={<NovelDetailPage />} />
              {/* Catch-all PHẢI ở cuối: đặt trước là nó nuốt mọi route thêm sau. */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="novel/:slug/chapter/:chapterNo" element={<ReaderPage />} />
          </Routes>
          <CommandPalette />
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
        </ReaderSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
