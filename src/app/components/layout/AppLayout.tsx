import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

/** Layout dùng chung: Header cố định + nội dung trang qua <Outlet /> + Footer. */
export function AppLayout() {
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
