# Kế hoạch: Novela — Web đọc truyện chữ (Novel Reader)

## Context

Tên dự án: **Novela**. Xây web đọc truyện chữ (web novel) tiếng Việt, trải nghiệm đọc chỉn chu như máy đọc sách thật. Yêu cầu user:

- **Nav ở header**, KHÔNG sidebar. Tập trung tối đa vào content.
- **Detail**: danh sách chương dễ nhìn, dễ điều hướng (kể cả hàng trăm chương).
- **Reader**: nhiều tính năng tùy biến (font, cỡ chữ, màu chữ/nền, theme đọc, độ rộng cột, tiến độ...).
- Scope: **Full** — Home + Duyệt + Detail + Reader.
- **3 theme giao diện site có thể chuyển**: `Modern`, `Minimalistic`, `Glassmorphism (Neon)`.
- **Chọn layout**: thiết kế sẵn 3 layout, research chốt cái tối ưu, cho user chọn.
- Chưa backend → mock data, data layer tách riêng để nối API/Supabase sau.
- **Ràng buộc kiến trúc**: xây mọi thứ ở mức **general/tái sử dụng**. TUYỆT ĐỐI không hardcode data trong component — mọi dữ liệu (truyện, chương, thể loại, cấu hình theme/layout/font) chỉ nằm ở lớp `data/` (mock). Mọi chuỗi text hiển thị đi qua **i18n**, không chuỗi cứng trong JSX.
- **i18n song ngữ**: Tiếng Việt (mặc định) + Tiếng Anh, chuyển được ở header, lưu localStorage.

Stack: React 18.3.1 + Vite + Tailwind v4 + shadcn/ui (đầy đủ) + `react-router` v7.13.0 (đã cài, chưa cấu hình). `App.tsx` là shell rỗng.

---

## Kết quả Research (dùng làm chuẩn khi build)

### A. Typography & khổ đọc (reader)
- **Độ rộng cột (measure)**: 60–75 ký tự/dòng → `max-width` vùng đọc ~ **640–720px** (mặc định 680px). Cho phép chỉnh Narrow/Normal/Wide.
- **Cỡ chữ body**: 16–22px, mặc định **19px**. (Kindle/Apple Books vùng 18–21px.)
- **Line-height**: 1.5–2.0, mặc định **1.7**.
- **Khoảng cách đoạn**: 0.8–1.2em giữa các `<p>`.
- **Cover truyện**: tỉ lệ **2:3** (portrait), grid card.

### A2. Fonts (đều có subset Vietnamese trên Google Fonts, import ở `src/styles/fonts.css`)
- **UI / sans**: `Be Vietnam Pro` (thiết kế cho tiếng Việt) làm chính, fallback `Inter`.
- **Đọc truyện (chọn được trong reader)**:
  - Serif: `Literata` (mặc định, thiết kế cho đọc sách), `Lora`, `Merriweather`, `Noto Serif`.
  - Sans đọc: `Be Vietnam Pro`.
- Tất cả phải render dấu tiếng Việt chuẩn (ă â ê ô ơ ư đ + thanh điệu). Import ở đầu `fonts.css`.

### B. Reader themes — hex chuẩn (Kindle / Apple Books)
| Theme | Nền | Chữ |
|-------|-----|-----|
| Light | `#fbfbfb` | `#1a1a1a` |
| Sepia | `#f8f1e3` | `#5f4b32` |
| Dark | `#121212` | `#b0b0b0` |
| OLED Black | `#000000` | `#c9c9c9` |

Reader theme **độc lập** với theme giao diện site.

### C. 3 Theme giao diện site (chuyển được, lưu localStorage)
Định nghĩa bằng CSS custom properties, scope qua `data-site-theme` trên `<html>`.

**1. Modern** (Linear/Vercel/Stripe vibe) — sạch, hơi bold.
- Light: bg `#ffffff`, surface `#f7f8fa`, text `#0f1115`, muted `#6b7280`, primary `#4f46e5` (indigo), border `#e5e7eb`.
- Dark: bg `#0b0d12`, surface `#151922`, text `#f5f6f8`, muted `#9aa3b2`, primary `#818cf8`, border `#232834`.

**2. Minimalistic** — near-monochrome, nhiều whitespace, 1 accent nhẹ.
- Light: bg `#ffffff`, surface `#fafafa`, text `#171717`, muted `#737373`, accent `#111111`, border `# ececec`.
- Dark: bg `#0a0a0a`, surface `#141414`, text `#ededed`, muted `#8a8a8a`, accent `#fafafa`, border `#242424`.

**3. Glassmorphism (Neon)** — base tối, glass surface + neon accent.
- Base bg: gradient tối `#0a0a12 → #12071f`.
- Glass surface: `rgba(255,255,255,0.05)`, border `rgba(255,255,255,0.15)`, `backdrop-filter: blur(20px)`.
- Neon: cyan `#00f8f1`, magenta `#ff00ff`, purple `#b388ff`. Text `#f0f4ff` / muted `#9fb0d0`.
- Rule: neon < 20% diện tích, chỉ cho CTA/active. Luôn có **barrier layer** (fill mờ dưới glass) giữ contrast ≥ 4.5:1. Fallback bg đục nếu browser không hỗ trợ blur.

### D. Best practices màu áp dụng
- Contrast body text ≥ **4.5:1** (WCAG AA), heading lớn ≥ 3:1.
- Quy tắc **60-30-10** (nền / phụ / accent). Tối đa 1 accent chính + neutrals.
- Semantic: success `#16a34a`, warning `#d97706`, error `#dc2626` (giữ đồng bộ với token destructive sẵn có).

### E. 3 Layout (research → chốt)
Layout = cách bố trí nội dung ở **Reader** (chính) + Browse.

- **Layout 1 — Centered Scroll (KHUYẾN NGHỊ MẶC ĐỊNH)**: 1 cột căn giữa, cuộn dọc liên tục, chrome ẩn khi cuộn. Tối ưu nhất cho web novel (giống Royal Road/Wattpad/Medium), dễ theo dõi tiến độ, mobile-friendly.
- **Layout 2 — Paged (Book-like)**: chia trang trái/phải, lật trang (giống Kindle/Apple Books). Cảm giác sách thật, không cuộn.
- **Layout 3 — Wide/Focus**: cột rộng hơn + khoảng nghỉ hai bên tối giản, dùng cho màn lớn/đọc nhanh.

→ Cho user chọn qua reader settings; mặc định **Centered Scroll**.

---

## Tiến độ (checklist)

### 0. Nền tảng
- [x] Thêm token 3 site-theme vào `src/styles/theme.css` (scope `[data-site-theme=...]`, không sửa token gốc) + reader themes + glass utilities.
- [x] `src/app/hooks/useLocalStorage.ts`
- [x] `src/app/theme/ThemeProvider.tsx` (site theme + dark/light, gắn attr lên `<html>`, lưu localStorage) + `theme/config.ts`

### 0a. i18n (song ngữ VI/EN)
- [x] i18n shim nội bộ (`src/app/i18n/provider.tsx`) + alias `react-i18next` trong vite.config → không cần cài package (pnpm bị chặn quyền).
- [x] `src/app/i18n/index.ts` — export provider/hook, detect + lưu ngôn ngữ localStorage, mặc định `vi`.
- [x] `src/app/i18n/locales/vi.json` & `en.json` — toàn bộ chuỗi UI.
- [x] `LanguageSwitcher` trong Header (dropdown VI/EN).
- [x] Data mock dùng field `{ vi, en }` (LocalizedText) — component đọc theo ngôn ngữ, không hardcode.

### 0b. Fonts
- [x] Import fonts Vietnamese vào `src/styles/fonts.css` (Be Vietnam Pro, Inter, Literata, Lora, Merriweather, Noto Serif) + biến font-family.

### 1. Data layer (mock — SEED NHIỀU)
- [x] `src/app/data/types.ts` + `genres.ts`
- [x] `src/app/data/novels.ts` — **24 truyện** song ngữ (cover picsum seed 2:3, tác giả, thể loại, mô tả, trạng thái, views, rating, số chương). *Ghi chú: dùng picsum vì tool Unsplash bị chặn quyền — có thể đổi sang Unsplash sau.*
- [x] `src/app/data/chapters.ts` — sinh chương + nội dung song ngữ (kho đoạn văn) theo chỉ số, truyện tới hàng trăm chương.
- [x] `src/app/data/api.ts` — getNovels/getNovelById/browseNovels/getChapter/getChapterList... (trả Promise)

### 2. Routing & Layout
- [x] `src/app/App.tsx` — BrowserRouter + Routes (`/`, `/browse`, `/novel/:id`, `/novel/:id/chapter/:cid`)
- [x] `src/app/components/layout/AppLayout.tsx` — Header + `<Outlet />`
- [x] `src/app/components/layout/Header.tsx` — logo, nav, search, LanguageSwitcher, ThemeControls (site theme + dark)

### 3. Shared
- [x] `src/app/components/NovelCard.tsx` + `NovelGrid.tsx` + `NotFoundPage.tsx`

### 4. Home
- [x] `src/app/components/home/HomePage.tsx` + `HeroCarousel.tsx` + `ContinueReading.tsx`

### 5. Browse
- [x] `src/app/components/browse/BrowsePage.tsx` — grid + filter thể loại + sort + search + pagination (đồng bộ URL params)

### 6. Detail
- [x] `src/app/components/detail/NovelDetailPage.tsx` — cover lớn, metadata, tabs Info/Chapters, nút Đọc từ đầu/Đọc tiếp
- [x] `src/app/components/detail/ChapterList.tsx` — scroll-area, lọc chương, đảo thứ tự, đánh dấu đã đọc

### 7. Reader (trọng tâm)
- [x] `src/app/components/reader/ReaderSettingsContext.tsx` — font, size, line-height, width, reader-theme, layout; lưu localStorage
- [x] `src/app/components/reader/ReaderPage.tsx` — render theo settings + layout (scroll/paged/wide), progress bar, restore vị trí, phím ←/→, auto-hide chrome
- [x] `src/app/components/reader/ReaderToolbar.tsx` + `ReaderContents.tsx` (mục lục sheet)
- [x] `src/app/components/reader/ReaderSettingsPanel.tsx` — slider + toggle-group + preview font
- [x] `src/app/components/reader/ReaderControls.tsx` — Prev/Next + nhảy chương (select)
- [x] `src/app/hooks/useReadingProgress.ts` (lưu tiến độ + danh sách đọc tiếp)

### 8. Hoàn thiện
- [x] Responsive mobile/desktop
- [x] localStorage: theme site, ngôn ngữ, reader settings, tiến độ đọc

---

## Nguyên tắc UI & Kiến trúc
- **General & không hardcode**: mọi data ở `data/` (mock), mọi text qua i18n; component nhận props/đọc từ store, không nhúng dữ liệu/chuỗi cứng. Theme/layout/font list cũng khai báo dưới dạng config data.
- Dùng shadcn/ui sẵn có, KHÔNG viết lại primitive.
- KHÔNG sửa token gốc trong `theme.css`; chỉ **thêm** scope theme mới + biến riêng cho reader.
- Không dùng Tailwind class font-size/weight/line-height ở UI chung; riêng vùng reader dùng inline style động theo settings.
- Ảnh cover: import ES module + `ImageWithFallback`.

## Verification
1. Preview surface (dev server đã chạy, không dùng localhost).
2. Luồng: Home → Detail → Reader → đổi font/reader-theme/cỡ chữ/layout realtime → Next/Prev → back.
3. Đổi 3 theme site từ header, thấy toàn site đổi mạch lạc; reader-theme độc lập.
4. Browse: filter + search + sort + pagination.
5. Reload: theme site, reader settings, layout, tiến độ đọc khôi phục từ localStorage.
6. Responsive mobile & desktop; glass theme có fallback + contrast đạt.

## Sources
- [Kindle Sepia color code](https://medium.com/greatnote/kindle-sepia-color-code-1fed14b1a5ef)
- [Apple Books iBooks theme colors](https://gist.github.com/adaptivegarage/aef95223fab9a39db45f)
- [Neon Glass theme (GitHub)](https://github.com/digitalisstudios/neon-glass)
- [Dark Glassmorphism 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
