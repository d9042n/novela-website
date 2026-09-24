/**
 * Tiện ích công thái học đọc sách: Đếm từ & ước tính thời gian đọc (Reading Time)
 */

export function countWords(text: string): number {
  if (!text) return 0;
  // Chuẩn hóa khoảng trắng, ngắt dòng và đếm các khối từ
  const words = text.trim().split(/\s+/);
  return words.filter((w) => w.length > 0).length;
}

export function calculateReadTime(textOrWords: string | number, wpm = 220): { minutes: number; words: number } {
  const wordCount = typeof textOrWords === 'number' ? textOrWords : countWords(textOrWords);
  const minutes = Math.max(1, Math.ceil(wordCount / wpm));
  return {
    minutes,
    words: wordCount,
  };
}
