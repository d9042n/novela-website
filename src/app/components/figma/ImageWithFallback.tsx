import React, { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { cn } from '../ui/utils'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const { src, alt, style, className, ...rest } = props

  // Truyện chưa crawl được ảnh bìa trả về cover_url rỗng, coi luôn là "không có ảnh"
  // thay vì đợi onError để tránh nháy icon ảnh lỗi.
  const hasSrc = typeof src === 'string' && src.trim() !== ''

  if (!hasSrc || didError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground/35',
          className,
        )}
        style={style}
        role="img"
        aria-label={alt}
        data-original-url={src || undefined}
      >
        <BookOpen
          className="aspect-square w-[26%] min-w-4 max-w-12"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
    )
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
  )
}
