import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { SidebarLayout } from './SidebarLayout';
import { FloatingDockLayout } from './FloatingDockLayout';
import { useTheme } from '../../theme/ThemeProvider';

/** Layout dùng chung: Tự động chuyển đổi giữa TopNav, Sidebar & Floating Dock dựa vào settings. */
export function AppLayout() {
  const { shellLayout } = useTheme();

  if (shellLayout === 'sidebar') {
    return <SidebarLayout />;
  }

  if (shellLayout === 'dock') {
    return <FloatingDockLayout />;
  }

  // Mặc định: TopNav header layout
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
