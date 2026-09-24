import React, { useEffect, useState } from 'react';
import { cn } from '../ui/utils';

interface AmbientCoverGlowProps {
  src?: string;
  className?: string;
  intensity?: 'subtle' | 'vibrant' | 'deep';
  children?: React.ReactNode;
}

export function AmbientCoverGlow({
  src,
  className,
  intensity = 'vibrant',
  children,
}: AmbientCoverGlowProps) {
  const [ambientColor, setAmbientColor] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setAmbientColor(null);
      return;
    }

    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      if (!active) return;
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);

        const data = ctx.getImageData(0, 0, 16, 16).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Bỏ qua các pixel quá tối hoặc quá sáng để lấy màu sắc phong phú
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 20 && brightness < 240) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setAmbientColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch {
        // CORS fallback: không trích xuất được thì dùng default CSS fallback
        setAmbientColor(null);
      }
    };

    img.onerror = () => {
      if (active) setAmbientColor(null);
    };

    return () => {
      active = false;
    };
  }, [src]);

  const opacityMap = {
    subtle: 'opacity-25 dark:opacity-20',
    vibrant: 'opacity-40 dark:opacity-35',
    deep: 'opacity-55 dark:opacity-45',
  };

  return (
    <div className={cn('relative', className)}>
      {/* Background Ambient Glow Layer */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-4 sm:-inset-8 -z-10 rounded-3xl blur-2xl sm:blur-3xl transition-all duration-700 ease-out',
          opacityMap[intensity],
        )}
        style={{
          background: ambientColor
            ? `radial-gradient(ellipse at center, ${ambientColor} 0%, transparent 70%)`
            : 'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {children}
    </div>
  );
}
