import React, { useState } from 'react';
import { cn } from '../ui/utils';

interface Palette {
  bgGradient: string;
  borderColor: string;
  accentText: string;
  badgeBg: string;
  ornament: string;
}

const PALETTES: Palette[] = [
  // 0. Crimson & Antique Gold
  {
    bgGradient: 'from-[#420d14] via-[#2c080d] to-[#170306]',
    borderColor: 'rgba(251, 191, 36, 0.35)',
    accentText: 'text-amber-200',
    badgeBg: 'bg-amber-400/15',
    ornament: '✦ ✦ ✦',
  },
  // 1. Midnight Sapphire & Silver
  {
    bgGradient: 'from-[#0c1a30] via-[#091322] to-[#040810]',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    accentText: 'text-sky-200',
    badgeBg: 'bg-sky-400/15',
    ornament: '✦ ❖ ✦',
  },
  // 2. Emerald Forest & Jade
  {
    bgGradient: 'from-[#063a2b] via-[#03241b] to-[#01130e]',
    borderColor: 'rgba(52, 211, 153, 0.35)',
    accentText: 'text-emerald-200',
    badgeBg: 'bg-emerald-400/15',
    ornament: '✦ ⚜ ✦',
  },
  // 3. Royal Amethyst & Lilac
  {
    bgGradient: 'from-[#2e0b4e] via-[#1d0633] to-[#0f021c]',
    borderColor: 'rgba(232, 121, 249, 0.35)',
    accentText: 'text-fuchsia-200',
    badgeBg: 'bg-fuchsia-400/15',
    ornament: '✦ ❖ ✦',
  },
  // 4. Roasted Amber & Espresso
  {
    bgGradient: 'from-[#4d280e] via-[#311706] to-[#170a02]',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    accentText: 'text-amber-200',
    badgeBg: 'bg-amber-400/15',
    ornament: '✦ ✦ ✦',
  },
  // 5. Deep Ocean Teal
  {
    bgGradient: 'from-[#0c3838] via-[#072424] to-[#021111]',
    borderColor: 'rgba(45, 212, 191, 0.35)',
    accentText: 'text-teal-200',
    badgeBg: 'bg-teal-400/15',
    ornament: '✦ ⚜ ✦',
  },
  // 6. Charcoal Titanium & Indigo
  {
    bgGradient: 'from-[#1e2330] via-[#141822] to-[#090b10]',
    borderColor: 'rgba(129, 140, 248, 0.35)',
    accentText: 'text-indigo-200',
    badgeBg: 'bg-indigo-400/15',
    ornament: '✦ ❖ ✦',
  },
  // 7. Damask Rose & Gold
  {
    bgGradient: 'from-[#4c0d28] via-[#2f0718] to-[#15020a]',
    borderColor: 'rgba(251, 113, 133, 0.35)',
    accentText: 'text-rose-200',
    badgeBg: 'bg-rose-400/15',
    ornament: '✦ ✦ ✦',
  },
];

function getPalette(text: string = ''): Palette {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PALETTES.length;
  return PALETTES[idx];
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;

  const hasSrc = typeof src === 'string' && src.trim() !== '';

  if (!hasSrc || didError) {
    const title = (alt || 'Novela').trim();
    const p = getPalette(title);

    return (
      <div
        className={cn(
          'relative flex h-full w-full select-none flex-col justify-between overflow-hidden rounded-[inherit] bg-gradient-to-b shadow-inner',
          p.bgGradient,
          className,
        )}
        style={style}
        role="img"
        aria-label={alt || 'Bìa truyện'}
      >
        {/* Giả lập gáy sách (Book Spine) phía bên trái */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-[6%] min-w-[6px] max-w-[12px] bg-gradient-to-r from-black/55 via-white/10 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-[6%] top-0 z-20 w-[1px] bg-black/40" />

        {/* Khung viền chỉ vàng/bạc hoàng gia nghệ thuật */}
        <div
          className="pointer-events-none absolute inset-2 sm:inset-2.5 z-10 flex flex-col items-center justify-between rounded border p-2 text-center"
          style={{ borderColor: p.borderColor }}
        >
          {/* Họa tiết hoa văn đỉnh sách */}
          <div className="flex flex-col items-center gap-0.5 pt-0.5 opacity-80">
            <span
              className={cn('text-[9px] sm:text-[10px] tracking-[0.25em] font-serif', p.accentText)}
            >
              {p.ornament}
            </span>
          </div>

          {/* Tiêu đề truyện kiểu chữ Typography Serif sang trọng */}
          <div className="my-auto flex flex-col items-center justify-center px-1">
            <h4
              className={cn(
                'line-clamp-3 font-serif font-bold text-center leading-[1.2] tracking-wide drop-shadow-md text-white/95 text-xs sm:text-sm md:text-base',
              )}
              style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {title}
            </h4>
          </div>

          {/* Chân bìa sách với logo thương hiệu tinh xảo */}
          <div className="flex flex-col items-center gap-0.5 pb-0.5 opacity-70">
            <div className="h-[1px] w-8 bg-white/20 mb-0.5" />
            <span
              className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-white/80"
              style={{ letterSpacing: '0.18em' }}
            >
              Novela
            </span>
          </div>
        </div>

        {/* Ánh sáng mờ phản chiếu bề mặt bìa */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent z-10" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}
