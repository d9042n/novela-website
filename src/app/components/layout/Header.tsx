import { Link, NavLink } from 'react-router';
import { BookMarked, Compass, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../ui/utils';
import { NovelaMark } from '../brand/NovelaMark';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeControls } from './ThemeControls';
import { UserMenu } from './UserMenu';
import { useTheme } from '../../theme/ThemeProvider';

export function Header() {
  const { t } = useTranslation();
  const { siteTheme } = useTheme();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-md transition-colors hover:text-foreground text-sm font-medium',
      isActive ? 'text-foreground font-semibold' : 'text-muted-foreground',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border',
        siteTheme === 'glass' ? 'glass-surface' : 'bg-background/85 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* min-w-0 chứ không shrink-0: ở 320px hàng icon bên phải cần chỗ, mà
            logo shrink-0 thì nó không nhường một pixel nào và cả header tràn
            ngang (đo được: scrollWidth 422 trên viewport 320).
            min-w-0 một mình KHÔNG đủ — nó chỉ cho phép co, còn phải truncate trên
            chữ mới thực sự co. Dấu hiệu (svg) giữ nguyên kích thước nhờ shrink-0
            đặt thẳng trên nó, nên thứ nhường chỗ là chữ, không phải logo. */}
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <NovelaMark className="size-7 shrink-0 text-primary" />
          <span
            className="truncate tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {t('app.name')}
          </span>
        </Link>

        <nav className="hidden items-center md:flex gap-1">
          <NavLink to="/" end className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/browse" className={navLinkClass}>
            {t('nav.browse')}
          </NavLink>
          <a
            href="/#rankings"
            className="px-3 py-2 rounded-md transition-colors hover:text-foreground text-sm font-medium text-muted-foreground"
          >
            {t('nav.rankings')}
          </a>
          <NavLink to="/library" className={navLinkClass}>
            {t('nav.library')}
          </NavLink>
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 sm:block">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="group relative flex h-9 w-full items-center justify-between rounded-lg border border-border/80 bg-input-background/70 px-3 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-input-background hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>{t('nav.search')}...</span>
            </div>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* gap-1 -> gap-0.5 dưới sm: ở 320px hàng này từng rộng 280px cố định và
            đẩy tràn ngang 102px (đo được). Nút Home cũ đã bỏ hẳn — nó trùng đúng
            chức năng với logo bên trái (logo cũng link "/"), nên nó chỉ chiếm chỗ. */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:ml-0 sm:gap-1">
          <NavLink
            to="/browse"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            title={t('nav.browse')}
          >
            <Compass className="size-5" />
          </NavLink>

          <NavLink
            to="/library"
            className="hidden sm:inline-flex md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            title={t('library.title')}
          >
            <BookMarked className="size-5" />
          </NavLink>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="text-muted-foreground hover:text-foreground sm:hidden p-2 transition-colors rounded-lg hover:bg-accent"
            aria-label={t('nav.searchShort')}
          >
            <Search className="size-5" />
          </button>

          <LanguageSwitcher />
          <ThemeControls />
          <UserMenu compact />
        </div>
      </div>
    </header>
  );
}
