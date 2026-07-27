import { useEffect, useRef, useState } from 'react';
import { RouterLink } from '../ui/router-link';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Novel } from '../../data/types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '../ui/carousel';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { displayTitle } from '../../data/format';

// TODO(i18n-content): title/author/description/genre đơn ngữ VN (backend chỉ có VN).
export function HeroCarousel({ novels }: { novels: Novel[] }) {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  // Autoplay dừng khi con trỏ HOẶC focus đang ở trong hero. Không còn nút
  // pause riêng (dải gạch đã thay chỗ nó), nên đây là cơ chế dừng duy nhất —
  // và nó đủ: muốn bấm gạch thì con trỏ/focus phải vào hero, tức autoplay đã
  // dừng trước khi người dùng kịp nhắm.
  const [hovering, setHovering] = useState(false);
  const paused = hovering;
  const wrapRef = useRef<HTMLDivElement>(null);

  // Slide đang hiện, để dải gạch dưới biết gạch nào là gạch đang active.
  // Lấy từ embla chứ không tự đếm: kéo-thả/wheel/autoplay/bấm gạch đều đi qua
  // nó, nên đây là nguồn duy nhất luôn đúng.
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!api) return;
    const sync = () => setSelected(api.selectedScrollSnap());
    sync(); // đồng bộ ngay: api sẵn sàng sau lần render đầu
    api.on('select', sync);
    api.on('reInit', sync);
    return () => {
      api.off('select', sync);
      api.off('reInit', sync);
    };
  }, [api]);

  // Lăn chuột NGANG (trackpad hai ngón, chuột có bánh ngang) để lật slide.
  // Embla chỉ bắt kéo-thả, không bắt wheel, nên phải tự bind.
  //
  // Chỉ nhận khi |deltaX| > |deltaY|: nếu bắt cả deltaY thì lăn dọc để đọc
  // trang sẽ bị hero "ăn" mất và trang đứng im — hero cao 440-540px, con trỏ
  // rất dễ đi qua nó khi cuộn.
  // Vì vậy KHÔNG preventDefault khi là cuộn dọc, và listener phải non-passive
  // để preventDefault có tác dụng ở nhánh ngang.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !api) return;

    // Một cử chỉ trackpad KHÔNG phải một event: nó là chuỗi vài chục event với
    // delta giảm dần (momentum), thường dài hơn 300ms. Nên "chặn trong N ms kể
    // từ event đầu" là sai — cửa sổ hết hạn giữa lúc cử chỉ còn đang bay, và
    // mỗi lần hết hạn là thêm một lần lật. Đo được: 3 slide/cử chỉ.
    //
    // Cách đúng là hẹn lại đồng hồ trên MỌI event, nên cờ chỉ nhả khi chuỗi đã
    // im ~200ms. Một cử chỉ = đúng một lần lật, dù chuỗi dài bao nhiêu.
    let gesturing = false;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (e: WheelEvent) => {
      // Ngưỡng độ lớn + hệ số 1.4, không chỉ so |deltaX| > |deltaY|: trackpad
      // macOS ở đầu/cuối một cú cuộn dọc hay phát ra delta hơi chéo (vd deltaX
      // 0.6 / deltaY 0.4) — so trần thì nhánh ngang thắng, preventDefault ăn mất
      // cuộn trang VÀ lật slide ngoài ý muốn. Phải rõ ràng là cử chỉ ngang.
      const ax = Math.abs(e.deltaX);
      if (ax < 12 || ax <= Math.abs(e.deltaY) * 1.4) return; // cuộn dọc -> để trang
      e.preventDefault();

      // Lật ở event ĐẦU của cử chỉ (leading edge) cho phản hồi tức thì.
      if (!gesturing) {
        gesturing = true;
        if (e.deltaX > 0) api.scrollNext();
        else api.scrollPrev();
      }

      // Mỗi event đẩy mốc "im lặng" ra xa: đuôi momentum không mở lại cửa sổ.
      clearTimeout(idle);
      idle = setTimeout(() => {
        gesturing = false;
      }, 200);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      clearTimeout(idle); // tránh cờ nhả sau khi component đã unmount
    };
  }, [api]);

  // AUTOPLAY — 6s/slide, tự chạy nhưng phải dừng được (WCAG 2.2.2 Pause, Stop,
  // Hide: nội dung tự chuyển động >5s bắt buộc có cách dừng).
  //
  // 6000ms chứ không phải 3-4s: hero có title + mô tả 2 dòng, người đọc chậm
  // cần đủ thời gian đọc hết một slide trước khi nó đổi.
  //
  // KHÔNG chạy khi prefers-reduced-motion: đây là tín hiệu hệ điều hành của
  // người dùng nói rằng chuyển động tự động gây khó chịu — tôn trọng nó thay vì
  // bắt họ đi tìm nút dừng.
  useEffect(() => {
    if (!api || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tick = () => {
      // Tab ẩn: đừng lật: người dùng quay lại sẽ thấy nó đã nhảy qua vài slide
      // mà họ chưa từng xem.
      if (document.hidden) return;
      api.scrollNext();
    };
    const id = setInterval(tick, 6000);
    return () => clearInterval(id);
  }, [api, paused]);

  if (novels.length === 0) return null;

  return (
    // wrapper riêng cho ref: Carousel là function component KHÔNG forwardRef,
    // truyền ref thẳng vào nó thì ref luôn null (và React 18 cảnh báo).
    // Hover/focus tạm dừng: WCAG 2.2.2 đòi người dùng phải chặn được nội dung
    // tự chạy >5s. Hover lo con chuột, focusin/out lo bàn phím — thiếu nhánh
    // focus thì người tab vào nút "Đọc ngay" sẽ bị slide trôi khỏi tay.
    //
    // Đây là ĐƯỜNG DUY NHẤT để dừng, sau khi nút pause tường minh bị thay bằng
    // dải gạch: hễ con trỏ hoặc focus vào trong hero là autoplay đứng, nên lúc
    // người dùng đang nhắm bấm một gạch thì slide không trôi khỏi tay.
    <div
      ref={wrapRef}
      className="group/hero relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={(e) => {
        // relatedTarget nằm ngoài hero -> focus thật sự đã rời đi.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovering(false);
      }}
    >
    <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
      <CarouselContent>
        {novels.map((novel) => {
          const authorName = novel.authors[0]?.name ?? '';
          // 5323/6288 truyện đang có title='' (source metruyenhot chưa cào tiêu đề).
          // Hero là khối lớn nhất trang chủ: title rỗng ở đây để lại một mảng
          // ảnh nền không chữ, trông như trang lỗi.
          const title = displayTitle(novel.title, t('common.untitled'));
          // Eyebrow gộp nhãn + tối đa 2 genre thành MỘT dòng uppercase-tracked duy nhất:
          // hai dòng cùng dạng thức cạnh nhau thì không dòng nào đọc ra là điểm vào.
          const eyebrow = [t('home.featured'), ...novel.genres.slice(0, 2).map((g) => g.name)];
          // Byline gộp tác giả + số chương + điểm: cùng một lớp thông tin (fact về truyện),
          // cùng một cỡ, để dấu · làm việc phân nhóm thay vì tách thành nhiều tầng.
          // Bỏ hẳn field rỗng: "0 lượt xem" là tín hiệu âm, "★ —" là ô trống.
          const bylineParts = [
            authorName,
            novel.chapterCount != null
              ? t('novel.chapterCountLabel', { count: novel.chapterCount })
              : null,
            novel.score != null ? `★ ${novel.score.toFixed(1)}` : null,
            novel.views > 0
              ? `${novel.views.toLocaleString('vi-VN')} ${t('common.views')}`
              : null,
          ].filter(Boolean) as string[];
          // flex trên item + h-full/w-full trên panel: CarouselItem vốn đã bị
          // flex cha kéo cao bằng slide CAO NHẤT, nhưng panel bên trong lại chỉ
          // cao theo nội dung của chính nó — nên mỗi slide một chiều cao và
          // carousel nhảy khi lật (đo được: lệch 59px ở 1920, 55px ở 1280).
          // Cho panel stretch theo item là mọi slide bằng nhau; min-h vẫn giữ
          // vai trò sàn cho trường hợp tất cả slide đều ngắn.
          return (
          <CarouselItem key={novel.slug} className="flex">
            {/* min-h thay vì h cố định: title dài 3 dòng + mô tả 2 dòng từng đẩy CTA
                vượt quá 480px và bị overflow-hidden cắt mất. */}
            <div className="relative h-full w-full min-h-[440px] overflow-hidden rounded-2xl border border-border bg-neutral-900 sm:min-h-[480px]">
              {/* Nền full-bleed + xử lý tông tối màu editorial */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={novel.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {/* Lớp phủ nghiêng: đậm trái → trong suốt phải, cho chữ nổi */}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
              </div>

              {/* py thay cho h-full: nội dung tự quyết chiều cao, min-h lo phần sàn */}
              <div className="relative flex items-center py-12 sm:py-14">
                {/* sm:px-16 (64px) chứ không phải px-12: mũi tên nằm ở left-4 và
                    rộng 40px nên chiếm tới 56px tính từ mép panel — với px-12 (48px)
                    nút ăn vào 7px đầu dòng mô tả ở khổ tablet (đo được). 64px chừa
                    đủ 8px hở. Mobile giữ px-6 vì ở đó nút chỉ tới 40px < 24px lề?
                    không — mobile nút hiện thường trực nhưng cột chữ bắt đầu ở 24px
                    và nút phủ mép ảnh, không phủ chữ (đã đo desc=False). */}
                <div className="grid w-full grid-cols-1 items-center gap-8 px-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-16">
                  {/* Cột chữ: 4 tầng (eyebrow / title / byline / CTA), title là phần tử
                      lớn duy nhất. Cột title rộng hơn cột mô tả để tạo nhịp hai bề rộng. */}
                  <div className="max-w-2xl text-white">
                    {/* Tầng 1 — eyebrow: nhãn + genre trên cùng một dòng */}
                    <div
                      className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 uppercase text-white/65"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    >
                      {eyebrow.map((label, li) => (
                        <span key={label} className="flex items-center gap-2.5">
                          {li > 0 && <span className="h-1 w-1 rounded-full bg-white/35" />}
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Tầng 2 — title. lineHeight 1.18 + paddingBottom cho dấu tiếng Việt:
                        dấu chồng (Ỉ, Ậ, Ề, Ộ) cần headroom mà font Latin không cần, ở 1.05
                        thì dòng trên dòng dưới chạm nhau.
                        clamp 3 dòng: title truyện VN thường 45-60 ký tự, ở 2 dòng (~24 ký
                        tự/dòng) bị cắt mất nghĩa giữa câu. Chiều cao do min-h + py lo. */}
                    <h1
                      className="mb-3 line-clamp-3"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.25rem, 4.6vw, 3.75rem)',
                        fontWeight: 700,
                        lineHeight: 1.18,
                        letterSpacing: '-0.015em',
                        paddingBottom: '0.08em',
                      }}
                    >
                      {title}
                    </h1>

                    {/* Tầng 3 — byline: tác giả · chương · điểm, một cỡ, một màu */}
                    {bylineParts.length > 0 && (
                      <div
                        className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-white/75"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {bylineParts.map((part, pi) => (
                          <span key={part} className="flex items-center gap-2.5">
                            {pi > 0 && <span className="h-1 w-1 rounded-full bg-white/30" />}
                            {part.startsWith('★') ? (
                              <span className="flex items-center gap-1">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                {part.slice(1).trim()}
                              </span>
                            ) : (
                              part
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Mô tả: cột hẹp hơn title (~55 ký tự/dòng), 2 dòng, là hook không phải tóm tắt */}
                    {novel.description && (
                      <p
                        className="mt-6 line-clamp-2 text-white/80"
                        style={{ fontSize: '1rem', lineHeight: 1.5, maxWidth: '30rem' }}
                      >
                        {novel.description}
                      </p>
                    )}

                    {/* Tầng 4 — CTA: một primary đầy, một text link phụ thuộc rõ rệt */}
                    <div className="mt-8 flex flex-wrap items-center gap-5">
                      <Button asChild size="lg">
                        <RouterLink to={`/novel/${novel.slug}`}>{t('actions.readNow')}</RouterLink>
                      </Button>
                      <RouterLink
                        to={`/novel/${novel.slug}`}
                        className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {t('novel.info')}
                      </RouterLink>
                    </div>
                  </div>

                  {/* Bìa sách nổi, khung mảnh */}
                  <div className="hidden w-52 shrink-0 sm:block">
                    <div className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/20">
                      <div className="aspect-[2/3]">
                        <ImageWithFallback
                          src={novel.cover}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
          );
        })}
      </CarouselContent>
      {/* Mũi tên ở GIỮA hai bên — dạng slider quen mắt, thay cho cặp dồn ở góc
          dưới-phải (trông như hai nút lạc chỗ).
          left-4/right-4 chứ không phải -left-12 mặc định: mặc định đặt nút NGOÀI
          khung, ở đây panel có overflow-hidden + bo góc nên nút sẽ bị cắt/lệch ra lề.
          Cột chữ bắt đầu từ px-6/px-12 nên nút bên trái nằm trong dải lề, không
          chạm title; đã đo lại ở cả 4 viewport.
          size-10 thay vì size-8 mặc định: vùng bấm 32px nhỏ hơn ngưỡng 44px cho
          mục tiêu cảm ứng.
          Mờ đi khi không tương tác (opacity-0 + group-hover/focus) để không che
          ảnh bìa; luôn hiện trên màn cảm ứng — nơi không có hover — nhờ
          max-sm:opacity-100. */}
      <CarouselPrevious className="left-4 size-10 border-white/30 bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/60 hover:text-white focus-visible:opacity-100 group-hover/hero:opacity-100 max-sm:opacity-100" />
      <CarouselNext className="right-4 size-10 border-white/30 bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/60 hover:text-white focus-visible:opacity-100 group-hover/hero:opacity-100 max-sm:opacity-100" />

      {/* DẢI GẠCH CHỈ VỊ TRÍ — thay cho nút pause trước đó.
          Nó làm hai việc cùng lúc: cho biết đang ở slide nào trên tổng bao nhiêu,
          và mỗi gạch là một nút bấm nhảy thẳng tới slide đó.

          Vẫn thoả WCAG 2.2.2: hover/focus tạm dừng autoplay, và khi con trỏ đã ở
          trong hero để bấm gạch thì autoplay đang dừng — nên người dùng không bị
          slide trôi khỏi tay giữa lúc nhắm. Người dùng bàn phím tab được vào từng
          gạch (focus cũng tạm dừng), nên vẫn có "cách dừng" bấm được.

          Là <button> thật chứ không phải <div>: bấm được bằng Enter/Space và tab
          tới được mà không cần tự bind keydown.

          KHÔNG dùng role="tablist"/role="tab" (bản đầu tôi làm vậy và nó sai hai
          đường): (1) role="tab" đòi một role="tabpanel" tương ứng qua
          aria-controls, mà slide ở đây là role="group" aria-roledescription="slide"
          bên trong role="region" — pattern carousel, không phải pattern tab; khai
          tab mà không có tabpanel là cây ARIA hỏng. (2) pattern tablist đòi mũi
          tên trái/phải di chuyển giữa các tab, nhưng ui/carousel.tsx đã bắt
          ArrowLeft/Right ở cấp region bằng onKeyDownCapture (capture nên chạy
          TRƯỚC handler con) để lật slide — hai pattern đá nhau.
          aria-current="true" là cách nói "đây là mục đang hiện" không cần dựng cả
          bộ tab, và screen reader đọc ra được ngay.

          Gạch ĐANG CHỌN dài hơn + sáng (w-8 bg-white) so với gạch thường
          (w-4 bg-white/40) — phân biệt bằng CẢ chiều dài và độ sáng, không chỉ
          màu, để người mù màu vẫn thấy.

          py-3 -my-3 + px-0.5 nới vùng bấm lên ~28px cao mà không đổi hình gạch:
          một vạch cao 4px thì gần như không bấm được trên cảm ứng. Số âm -my-3
          triệt phần padding nên dải gạch vẫn nằm đúng chỗ.

          pointer-events-none trên container, -auto trên từng gạch: container phủ
          hết chiều ngang (inset-x-0) nên nếu nó ăn pointer thì nó chắn luôn vùng
          kéo-thả của embla — đo được: drag chết hẳn. Chỉ bản thân gạch cần nhận
          chuột. */}
      <div
        role="group"
        aria-label={t('home.featured')}
        className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2"
      >
        {novels.map((novel, i) => {
          const active = i === selected;
          return (
            <button
              key={novel.slug}
              type="button"
              aria-current={active ? 'true' : undefined}
              aria-label={t('home.goToSlide', { index: i + 1, total: novels.length })}
              onClick={() => api?.scrollTo(i)}
              className="group/dot pointer-events-auto -my-3 px-0.5 py-3"
            >
              <span
                className={cn(
                  'block h-1 rounded-full transition-all duration-300',
                  active
                    ? 'w-8 bg-white'
                    : 'w-4 bg-white/40 group-hover/dot:bg-white/70',
                )}
              />
            </button>
          );
        })}
      </div>
      </Carousel>
    </div>
  );
}
