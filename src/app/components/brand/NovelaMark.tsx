interface NovelaMarkProps {
  className?: string;
  title?: string;
}

/**
 * "Three Waves" — ba đường sóng chảy, trọng lượng và độ mờ giảm dần.
 * Gợi nhịp điệu văn xuôi, cung bậc cảm xúc của một câu chuyện,
 * và cấu trúc khai-thừa-hợp của tự sự. Không có letterform — thuần nghệ thuật.
 */
export function NovelaMark({ className, title = 'Novela' }: NovelaMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>

      {/* Nét 1 — đầy đặn, mạnh mẽ: khởi đầu câu chuyện */}
      <path
        d="M5,17 C13,10 21,24 24,17 C27,10 35,24 43,17"
        strokeWidth="3.8"
      />

      {/* Nét 2 — nhẹ hơn, lệch pha: diễn biến, cao trào */}
      <path
        d="M5,28 C12,22 21,34 24,28 C27,22 36,34 43,28"
        strokeWidth="2.4"
        opacity="0.55"
      />

      {/* Nét 3 — mảnh, ngắn lại, mờ đi: kết thúc còn dư âm */}
      <path
        d="M10,39 C16,34 21,44 24,39 C27,34 32,44 38,39"
        strokeWidth="1.6"
        opacity="0.25"
      />
    </svg>
  );
}
