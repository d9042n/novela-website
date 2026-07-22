import type { Genre } from './types';

/** Danh mục thể loại — nguồn dữ liệu duy nhất, không hardcode trong component. */
export const GENRES: Genre[] = [
  { id: 'fantasy', name: { vi: 'Kỳ ảo', en: 'Fantasy' } },
  { id: 'cultivation', name: { vi: 'Tu tiên', en: 'Cultivation' } },
  { id: 'scifi', name: { vi: 'Khoa học viễn tưởng', en: 'Sci-Fi' } },
  { id: 'romance', name: { vi: 'Ngôn tình', en: 'Romance' } },
  { id: 'mystery', name: { vi: 'Trinh thám', en: 'Mystery' } },
  { id: 'horror', name: { vi: 'Kinh dị', en: 'Horror' } },
  { id: 'action', name: { vi: 'Hành động', en: 'Action' } },
  { id: 'adventure', name: { vi: 'Phiêu lưu', en: 'Adventure' } },
  { id: 'historical', name: { vi: 'Lịch sử', en: 'Historical' } },
  { id: 'slice-of-life', name: { vi: 'Đời thường', en: 'Slice of Life' } },
];

export function getGenre(id: string): Genre | undefined {
  return GENRES.find((g) => g.id === id);
}
