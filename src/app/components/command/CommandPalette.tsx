import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Compass,
  Home,
  Moon,
  Sun,
  Library,
  BookMarked,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command';
import { useTheme } from '../../theme/ThemeProvider';
import { SITE_THEMES, type SiteTheme } from '../../theme/config';
import { browseNovels } from '../../data/api';
import type { Novel } from '../../data/types';
import { displayTitle } from '../../data/format';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Skeleton } from '../ui/skeleton';

export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark, toggleMode, siteTheme, setSiteTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);

  // Lắng nghe phím tắt Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  // Debounced search khi gõ từ khóa
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      browseNovels({ query: query.trim(), size: 6 })
        .then((res) => {
          setSearchResults(res.items);
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  // Đọc truyện gần nhất từ localStorage
  const getRecentProgress = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('progress:'));
      if (keys.length === 0) return null;
      let latest: { slug: string; chapterNo: number; updatedAt?: number } | null = null;
      for (const k of keys) {
        const item = JSON.parse(localStorage.getItem(k) || '{}');
        if (!latest || (item.updatedAt || 0) > (latest.updatedAt || 0)) {
          latest = item;
        }
      }
      return latest;
    } catch {
      return null;
    }
  };

  const recent = getRecentProgress();

  return (
    <CommandDialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setQuery('');
      }}
      title={t('commandPalette.placeholder')}
      description="Command palette search and quick actions"
    >
      <div className="relative border-b border-border/60">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t('commandPalette.placeholder')}
          className="h-13 text-sm px-4"
        />
      </div>

      <CommandList className="max-h-[380px] p-2">
        {!loading && query && searchResults.length === 0 && (
          <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
            {t('commandPalette.noResults')}
          </CommandEmpty>
        )}

        {/* Skeleton khi đang tìm kiếm */}
        {loading && query && (
          <CommandGroup heading={t('commandPalette.novels')}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3">
                <Skeleton className="size-9 rounded shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </CommandGroup>
        )}

        {/* 1. Kết quả tìm kiếm truyện nếu có query */}
        {!loading && searchResults.length > 0 && (
          <CommandGroup heading={t('commandPalette.novels')}>
            {searchResults.map((novel) => {
              const title = displayTitle(novel.title, t('common.untitled'));
              return (
                <CommandItem
                  key={novel.slug}
                  onSelect={() => runCommand(() => navigate(`/novel/${novel.slug}`))}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer"
                >
                  <div className="size-9 rounded shrink-0 overflow-hidden border border-border/80 bg-muted">
                    <ImageWithFallback
                      src={novel.cover}
                      alt={title}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate text-foreground">{title}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {novel.authors[0]?.name || t('novel.unknownAuthor')} • {novel.chapterCount || 0} {t('novel.chapters')}
                    </div>
                  </div>
                  <BookOpen className="size-4 text-muted-foreground shrink-0" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {searchResults.length > 0 && <CommandSeparator className="my-2" />}

        {/* 2. Đọc tiếp gần nhất nếu có */}
        {recent && !query && (
          <>
            <CommandGroup heading={t('nav.library')}>
              <CommandItem
                onSelect={() =>
                  runCommand(() => navigate(`/novel/${recent.slug}/chapter/${recent.chapterNo}`))
                }
                className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer"
              >
                <BookMarked className="size-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">
                  {t('commandPalette.recentRead', { title: recent.slug })} (Chương {recent.chapterNo})
                </span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator className="my-2" />
          </>
        )}

        {/* 3. Lệnh nhanh điều hướng */}
        <CommandGroup heading={t('commandPalette.quickActions')}>
          <CommandItem
            onSelect={() => runCommand(() => navigate('/'))}
            className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer"
          >
            <Home className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium">{t('commandPalette.goHome')}</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate('/browse'))}
            className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer"
          >
            <Compass className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium">{t('commandPalette.goBrowse')}</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate('/library'))}
            className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer"
          >
            <Library className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium">{t('commandPalette.goLibrary')}</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(toggleMode)}
            className="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer"
          >
            {isDark ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4 text-indigo-500" />
            )}
            <span className="text-xs font-medium">{t('commandPalette.toggleMode')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* 4. Đổi Theme Nhanh */}
        <CommandGroup heading={t('commandPalette.themes')}>
          <div className="grid grid-cols-2 gap-1 px-1 py-1">
            {SITE_THEMES.map((th) => {
              const active = siteTheme === th.id;
              return (
                <CommandItem
                  key={th.id}
                  onSelect={() => runCommand(() => setSiteTheme(th.id as SiteTheme))}
                  className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer ${
                    active ? 'bg-primary/10 text-primary font-semibold' : ''
                  }`}
                >
                  <span
                    className="size-3 rounded-full shrink-0 ring-1 ring-border"
                    style={{ backgroundColor: th.swatch }}
                  />
                  <span className="text-xs truncate">{t(th.labelKey)}</span>
                </CommandItem>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
