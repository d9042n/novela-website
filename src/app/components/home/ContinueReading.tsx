import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { getNovelBySlug } from '../../data/api';
import { displayTitle } from '../../data/format';
import { getContinueList, type ReadingRecord } from '../../hooks/useReadingProgress';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Progress } from '../ui/progress';

interface Entry {
  record: ReadingRecord;
  novel: Novel;
}

// TODO(i18n-content): title đơn ngữ VN (backend chỉ có VN).
export function ContinueReading() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    // active flag: mỗi record là một request riêng, tối đa 8 cái. Người dùng
    // bấm sang trang khác trước khi cả 8 xong là chuyện thường, và khi đó
    // setEntries chạy trên component đã unmount -> React cảnh báo, và giữ
    // luôn tham chiếu tới state đã bỏ. Các effect khác trong repo dùng đúng
    // pattern này (xem NovelDetailPage, ReaderPage).
    let active = true;
    const records = getContinueList().slice(0, 8);
    Promise.all(
      records.map(async (record) => {
        try {
          const novel = await getNovelBySlug(record.slug);
          return { record, novel };
        } catch {
          // Truyện không còn tồn tại -> bỏ qua khỏi danh sách đọc tiếp.
          return null;
        }
      }),
    ).then((list) => {
      if (!active) return;
      setEntries(list.filter(Boolean) as Entry[]);
    });
    return () => {
      active = false;
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-baseline gap-3 border-b border-border pb-3">
        <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem' }}>
          ✦
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.1 }}>
          {t('home.continueReading')}
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {entries.map(({ record, novel }) => (
          <Link
            key={novel.slug}
            to={`/novel/${novel.slug}/chapter/${record.chapterNo}`}
            className="group flex w-64 shrink-0 gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/50"
          >
            <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <ImageWithFallback
                src={novel.cover}
                alt={displayTitle(novel.title, t('common.untitled'))}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <h3 className="line-clamp-1 group-hover:text-primary" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>{displayTitle(novel.title, t('common.untitled'))}</h3>
                <p className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>
                  {t('reader.chapterOf', {
                    index: record.chapterNo,
                    total: novel.chapterCount ?? '?',
                  })}
                </p>
              </div>
              <Progress value={Math.round(record.scroll * 100)} className="h-1.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
