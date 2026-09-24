import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { NovelaMark } from '../brand/NovelaMark';
import { cn } from '../ui/utils';

interface QuoteCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteText: string;
  novelTitle: string;
  authorName?: string;
  chapterNo?: number;
}

type CardStyle = 'ink' | 'oled' | 'sepia' | 'sunset';

export function QuoteCardModal({
  open,
  onOpenChange,
  quoteText,
  novelTitle,
  authorName,
  chapterNo,
}: QuoteCardModalProps) {
  const { t } = useTranslation();
  const [style, setStyle] = useState<CardStyle>('ink');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const styleConfigs: Record<
    CardStyle,
    { label: string; bg: string; text: string; subtext: string; border: string; quoteColor: string }
  > = {
    ink: {
      label: t('quoteCard.styleInk'),
      bg: 'bg-white',
      text: 'text-stone-900',
      subtext: 'text-stone-500',
      border: 'border-stone-200',
      quoteColor: 'text-stone-300',
    },
    oled: {
      label: t('quoteCard.styleOled'),
      bg: 'bg-black',
      text: 'text-zinc-100',
      subtext: 'text-zinc-500',
      border: 'border-zinc-800',
      quoteColor: 'text-zinc-800',
    },
    sepia: {
      label: t('quoteCard.styleSepia'),
      bg: 'bg-[#f8f1e3]',
      text: 'text-[#43302b]',
      subtext: 'text-[#7d6056]',
      border: 'border-[#e4d5be]',
      quoteColor: 'text-[#dfcfb5]',
    },
    sunset: {
      label: t('quoteCard.styleSunset'),
      bg: 'bg-gradient-to-br from-slate-950 via-purple-950 to-rose-950',
      text: 'text-rose-100',
      subtext: 'text-rose-300/70',
      border: 'border-rose-900/40',
      quoteColor: 'text-rose-500/20',
    },
  };

  const current = styleConfigs[style];

  // Vẽ thẻ lên canvas để tải ảnh hoặc copy
  const renderCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const el = cardRef.current;
    if (!el) return null;

    const width = 600;
    const height = 750;
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // Retina 2x
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(2, 2);

    // Nền
    if (style === 'ink') ctx.fillStyle = '#ffffff';
    else if (style === 'oled') ctx.fillStyle = '#000000';
    else if (style === 'sepia') ctx.fillStyle = '#f8f1e3';
    else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#2c0c30');
      grad.addColorStop(1, '#4a0e2e');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    // Viền tinh tế
    ctx.strokeStyle =
      style === 'ink'
        ? '#e5e7eb'
        : style === 'oled'
        ? '#27272a'
        : style === 'sepia'
        ? '#e4d5be'
        : '#831843';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Dấu nháy trích dẫn lớn
    ctx.fillStyle =
      style === 'ink'
        ? 'rgba(0,0,0,0.06)'
        : style === 'oled'
        ? 'rgba(255,255,255,0.08)'
        : style === 'sepia'
        ? 'rgba(67,48,43,0.08)'
        : 'rgba(244,63,94,0.15)';
    ctx.font = 'italic 120px Georgia, serif';
    ctx.fillText('“', 45, 130);

    // Nội dung trích dẫn
    ctx.fillStyle =
      style === 'ink'
        ? '#1c1917'
        : style === 'oled'
        ? '#f4f4f5'
        : style === 'sepia'
        ? '#43302b'
        : '#ffe4e6';
    ctx.font = 'italic 20px "Playfair Display", Georgia, serif';

    // Wrap text cho câu trích dẫn
    const maxTextWidth = width - 100;
    const words = quoteText.split(' ');
    let line = '';
    let y = 180;
    const lineHeight = 32;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(line, 50, y);
        line = words[n] + ' ';
        y += lineHeight;
        if (y > height - 160) {
          ctx.fillText(line + '...', 50, y);
          break;
        }
      } else {
        line = testLine;
      }
    }
    if (y <= height - 160) {
      ctx.fillText(line, 50, y);
    }

    // Tác phẩm & tác giả (Footer)
    const footerY = height - 70;
    ctx.fillStyle =
      style === 'ink'
        ? '#030213'
        : style === 'oled'
        ? '#ffffff'
        : style === 'sepia'
        ? '#064e3b'
        : '#fda4af';
    ctx.font = 'bold 16px "Be Vietnam Pro", sans-serif';
    ctx.fillText(novelTitle, 50, footerY);

    ctx.fillStyle =
      style === 'ink'
        ? '#78716c'
        : style === 'oled'
        ? '#71717a'
        : style === 'sepia'
        ? '#7d6056'
        : '#f43f5e';
    ctx.font = 'normal 13px "Be Vietnam Pro", sans-serif';
    const subText = `${authorName || ''}${chapterNo ? ` • Chương ${chapterNo}` : ''} | Novela`;
    ctx.fillText(subText, 50, footerY + 22);

    return canvas;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${novelTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
      toast.success(t('quoteCard.copied'));
    } catch {
      toast.error('Lỗi khi tải ảnh');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(`"${quoteText}" — ${novelTitle}`);
    setCopied(true);
    toast.success(t('quoteCard.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl p-0">
        <DialogHeader className="p-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Sparkles className="size-4.5 text-primary" />
            <span>{t('quoteCard.modalTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Card Preview Preview Canvas */}
          <div
            ref={cardRef}
            className={cn(
              'relative rounded-2xl p-6 sm:p-8 border shadow-xl flex flex-col justify-between min-h-[300px] transition-all duration-300',
              current.bg,
              current.text,
              current.border,
            )}
          >
            {/* Background Decorative Quote Mark */}
            <span
              className={cn(
                'pointer-events-none absolute -top-4 left-4 font-serif text-8xl leading-none select-none opacity-40',
                current.quoteColor,
              )}
            >
              “
            </span>

            {/* Quote Body */}
            <div className="relative z-10 pt-4">
              <p
                className="text-base sm:text-lg leading-relaxed line-clamp-6"
                style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
              >
                "{quoteText}"
              </p>
            </div>

            {/* Card Footer (Author & Book) */}
            <div className="relative z-10 pt-6 mt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold truncate max-w-[220px]">{novelTitle}</p>
                <p className={cn('text-xs truncate max-w-[220px]', current.subtext)}>
                  {authorName} {chapterNo ? `• Chương ${chapterNo}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1.5 opacity-80 shrink-0">
                <NovelaMark className="size-5 text-primary" />
                <span className="text-xs font-bold font-serif tracking-tight">Novela</span>
              </div>
            </div>
          </div>

          {/* Theme Switcher Chips */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {(['ink', 'oled', 'sepia', 'sunset'] as CardStyle[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStyle(st)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer',
                  style === st
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border/60 text-muted-foreground hover:bg-accent/60',
                )}
              >
                {styleConfigs[st].label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              className="flex-1 gap-1.5 text-xs"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép chữ'}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 gap-1.5 text-xs"
            >
              <Download className="size-3.5" />
              <span>{t('quoteCard.download')}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
