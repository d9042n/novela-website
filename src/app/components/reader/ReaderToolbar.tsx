import { RouterLink } from '../ui/router-link';
import { ChevronLeft, List, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { displayTitle } from '../../data/format';
import type { Chapter, Novel } from '../../data/types';
import { ReaderSettingsPanel } from './ReaderSettingsPanel';
import { ReaderContents } from './ReaderContents';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { cn } from '../ui/utils';

interface ReaderToolbarProps {
  novel: Novel;
  chapter: Chapter;
  visible: boolean;
}

// TODO(i18n-content): tiêu đề truyện + chương đơn ngữ VN (backend chỉ có VN).
export function ReaderToolbar({ novel, chapter, visible }: ReaderToolbarProps) {
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-transform duration-300',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--reader-bg) 88%, transparent)',
        borderColor: 'color-mix(in srgb, var(--reader-fg) 12%, transparent)',
        color: 'var(--reader-fg)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-4">
        <Button asChild variant="ghost" size="icon" style={{ color: 'var(--reader-fg)' }}>
          <RouterLink to={`/novel/${novel.slug}`} aria-label={t('actions.back')}>
            <ChevronLeft className="size-5" />
          </RouterLink>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.02rem', fontWeight: 600 }}>
            {displayTitle(novel.title, t('common.untitled'))}
          </p>
          <p className="line-clamp-1 opacity-70" style={{ fontSize: '0.78rem' }}>
            {chapter.title}
          </p>
        </div>

        {/* Mục lục */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" style={{ color: 'var(--reader-fg)' }} aria-label={t('reader.contents')}>
              <List className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-96 flex flex-col p-0 overflow-hidden">
            <SheetHeader className="p-4 pb-2 border-b border-border/40">
              <SheetTitle className="text-base font-bold">{t('reader.contents')}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden pt-2">
              <ReaderContents
                slug={novel.slug}
                total={novel.chapterCount ?? 0}
                currentNo={chapter.chapterNo}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Tùy chỉnh */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" style={{ color: 'var(--reader-fg)' }} aria-label={t('reader.settings')}>
              <Settings2 className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] overflow-y-auto sm:w-96 gap-1">
            <SheetHeader className="p-4 pb-1">
              <SheetTitle>{t('reader.settings')}</SheetTitle>
            </SheetHeader>
            <div className="mt-0 px-1">
              <ReaderSettingsPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
