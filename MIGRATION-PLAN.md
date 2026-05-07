# Migration Plan: leafnote-demo → leafnote/frontend

> Kế hoạch chi tiết chuyển bản demo UI sang repo chính thức, chia thành 10 phần nhỏ chạy tuần tự.

---

## Bối cảnh

Bản demo (`leafnote-demo/`) có UI hoàn chỉnh 6 trang với mockData, nhưng:

- Dùng JavaScript thuần (`.jsx`), chưa TypeScript
- Thuật ngữ cũ: `atom` thay vì `leaf`
- Hardcode string tiếng Việt, chưa có i18n
- Một số chỗ dùng `bg-white` thay vì `paper-*` token (vi phạm design-system)
- Chưa có empty state (luôn có mockData)
- Chưa có logic thật — và **sẽ không thêm logic trong plan này**

Repo đích (`leafnote/frontend/`) hiện chỉ có scaffold trống: `App.tsx` hiển thị text "scaffold", `index.css` 3 dòng tailwind, `tailwind.config.js` chưa custom, `main.tsx` minimal.

**Mục tiêu**: Chuyển toàn bộ UI demo sang repo chính với các cải thiện: rename atom→leaf, thêm song ngữ VI/EN, sửa light mode, thêm empty state. Vẫn dùng mockData, chưa kết nối backend.

---

## Workflow

Mỗi phần dùng workflow tại `.claude/workflows/migrate-demo.md` — checklist 9 bước cho mỗi module.

---

## Files trong demo cần chuyển

### Config / Setup

| File demo | Mục đích |
|---|---|
| `tailwind.config.js` | Custom colors (paper/ink), fonts, animations |
| `src/index.css` | Base styles, component classes, scrollbar, `.atom-highlight` |
| `src/main.jsx` | Entry point, providers |

### Context / State

| File demo | File đích | Mục đích |
|---|---|---|
| `src/context/ThemeContext.jsx` | `src/context/ThemeContext.tsx` | Dark/light toggle |
| `src/context/AppState.jsx` | `src/context/AppState.tsx` | Tag management |
| `src/data/mockData.js` | `src/data/mockData.ts` | Toàn bộ mock data |

### Components

| File demo | File đích | Mục đích |
|---|---|---|
| `src/components/Sidebar.jsx` | `src/components/Sidebar.tsx` | Nav + tags + cognitive snapshot |
| `src/components/TopBar.jsx` | `src/components/TopBar.tsx` | Search, theme toggle, new note |
| `src/components/AtomCard.jsx` | `src/components/LeafCard.tsx` | Card + TYPE_STYLES + RetentionRow |
| `src/components/AtomDetailModal.jsx` | `src/components/LeafDetailModal.tsx` | Chi tiết leaf modal |
| `src/components/TagCreateModal.jsx` | `src/components/TagCreateModal.tsx` | Tạo tag modal |

### Pages

| File demo | File đích | Mục đích |
|---|---|---|
| `src/pages/Dashboard.jsx` | `src/pages/Dashboard.tsx` | Surfacing feed + side panels |
| `src/pages/NotesList.jsx` | `src/pages/NotesList.tsx` | Danh sách note + tag filter |
| `src/pages/NoteEditor.jsx` | `src/pages/NoteEditor.tsx` | Editor + decomposition view |
| `src/pages/KnowledgeGraph.jsx` | `src/pages/KnowledgeGraph.tsx` | SVG graph visualization |
| `src/pages/ReviewFeed.jsx` | `src/pages/ReviewFeed.tsx` | Active recall review |
| `src/pages/Insights.jsx` | `src/pages/Insights.tsx` | Cognitive profile |

---

## Thứ tự migration (10 phần)

### Phần 0: Foundation — Tailwind + CSS + Dependencies

**Trạng thái**: `chưa bắt đầu`
**Files sửa**: `tailwind.config.js`, `src/index.css`, `package.json`, `index.html`
**Việc cần làm**:

- Copy tailwind config từ demo → thêm `darkMode: 'class'`, custom colors `paper-*`/`ink-*`, fonts (Inter, Cormorant Garamond, JetBrains Mono), animations (fade-in, slide-up, pulse-soft, float)
- Copy `index.css`: base layer (body background gradient), component classes (`card-surface`, `glass-panel`, `pill`, `focus-ring`), scrollbar, rename `.atom-highlight` → `.leaf-highlight`
- **Sửa light mode scrollbar**: thumb `#c8d8c8` → `#a8c0a8` (paper-300 theo design-system), hover `#a0bba0` → `#86a886` (paper-400)
- Cài dependencies: `lucide-react`, `i18next`, `react-i18next`
- Thêm Google Fonts link vào `index.html`
**Dependencies**: không có — phần đầu tiên

---

### Phần 1: i18n Setup

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/locales/vi.json`, `src/locales/en.json`, `src/lib/i18n.ts`
**Files sửa**: `src/main.tsx`
**Việc cần làm**:

- Cấu hình `react-i18next` với `i18next`: default language = `vi`, fallback = `en`
- Tạo 2 file dịch skeleton (sẽ điền key dần ở mỗi phần sau)
- Import i18n config trong `main.tsx` trước `createRoot`
**Dependencies**: Phần 0 (cần `i18next`, `react-i18next` đã cài)

---

### Phần 2: Context + Data

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/context/ThemeContext.tsx`, `src/context/AppState.tsx`, `src/data/mockData.ts`
**Việc cần làm**:

- Copy `ThemeContext` giữ nguyên logic (localStorage + class toggle)
- Copy `AppState` giữ nguyên logic (tag CRUD)
- Copy `mockData` với rename toàn bộ:

| Cũ | Mới |
|---|---|
| `atomCount` | `leafCount` |
| `atoms` | `leaves` |
| `linkedAtoms` | `linkedLeaves` |
| `atomId` | `leafId` |
| `detectedAtoms` | `detectedLeaves` |
| `newAtoms` | `newLeaves` |
| `totalAtoms` | `totalLeaves` |
| `activeAtom` | `activeLeaf` |
| `allAtoms` | `allLeaves` |

- Thêm TypeScript interfaces/types cho data structures
**Dependencies**: Phần 0

---

### Phần 3: App Shell — Layout + Router

**Trạng thái**: `chưa bắt đầu`
**Files sửa**: `src/App.tsx`, `src/main.tsx`
**Việc cần làm**:

- `main.tsx`: wrap với `BrowserRouter`, `ThemeProvider`, `AppStateProvider`
- `App.tsx`: layout flex (Sidebar + main), routes:
  - `/` → Dashboard
  - `/notes` → NotesList
  - `/note/:id` → NoteEditor
  - `/graph` → KnowledgeGraph
  - `/review` → ReviewFeed
  - `/insights` → Insights
- Tạo placeholder components cho mỗi route (text "Coming soon — [tên page]") để app chạy được ngay
**Dependencies**: Phần 1 + 2

---

### Phần 4: Sidebar

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/components/Sidebar.tsx`
**Files sửa**: `src/locales/vi.json`, `src/locales/en.json`
**Việc cần làm**:

- Copy từ demo, giữ nguyên UI
- i18n ~20 keys: nav labels ("Đang nổi lên", "Ghi chú", "Bản đồ tri thức", "Ôn tập", "Hồ sơ nhận thức"), tagline ("ghi chú có vòng đời"), section title ("Tag", "Hồ sơ nhận thức"), button text ("Mới", "Tạo tag mới"), stat labels
- Empty state: khi `tags.length === 0` → hiện message "Chưa có tag nào" thay vì list trống
- Light mode: đã đúng design-system (dùng paper-* tokens)
**Dependencies**: Phần 3 (cần App shell + TagCreateModal chưa có → import sau hoặc comment tạm)
**Lưu ý**: `TagCreateModal` import sẽ tạo ở Phần 6. Có thể comment dòng import tạm hoặc tạo stub.

---

### Phần 5: TopBar

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/components/TopBar.tsx`
**Files sửa**: `src/locales/vi.json`, `src/locales/en.json`
**Việc cần làm**:

- Copy từ demo
- i18n ~10 keys: search placeholder, button text ("Ghi chú mới"), tooltip, engine status ("Engine đang chạy")
- Sửa placeholder: demo viết "Tìm trong hạt, ghi chú, hoặc khái niệm..." → i18n, EN dùng "leaf" thay "hạt"
- Date format: dùng `toLocaleDateString` với locale từ i18n thay vì hardcode `'vi-VN'`
- Light mode: đã đúng
**Dependencies**: Phần 3

---

### Phần 6: Shared Components — LeafCard + Modals

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/components/LeafCard.tsx`, `src/components/LeafDetailModal.tsx`, `src/components/TagCreateModal.tsx`
**Files sửa**: `src/locales/vi.json`, `src/locales/en.json`
**Việc cần làm**:

**LeafCard** (từ `AtomCard`):

- Rename: `atom` → `leaf` trong props, biến, JSX
- i18n ~15 keys: TYPE_STYLES labels ("Định nghĩa"→`leaf.type.definition`, "Mệnh đề", "Quan hệ", "Dữ kiện"), SURFACE_STYLES labels ("Sắp quên", "Liên quan ngay", "Mâu thuẫn", "Mới sinh"), "Ngủ đông", retention labels ("Ghi nhớ", "Liên quan")
- Export `TYPE_STYLES`, `SURFACE_STYLES`, `RetentionRow` để các file khác import

**LeafDetailModal** (từ `AtomDetailModal`):

- Rename: `atom` → `leaf`, `linkedAtoms` → `linkedLeaves`, `allAtoms` → `allLeaves`
- **Sửa light mode** — 4 chỗ vi phạm design-system:
  - Line 17: `bg-white dark:bg-ink-900` → `bg-paper-50 dark:bg-ink-900`
  - Line 21: `bg-white/95 dark:bg-ink-900/95` → `bg-paper-50/95 dark:bg-ink-900/95`
  - Line 154: `bg-white/95 dark:bg-ink-900/95` → `bg-paper-50/95 dark:bg-ink-900/95`
- i18n ~15 keys: section titles ("Vòng đời hạt"→"Vòng đời lá", "Forgetting curve cá nhân", "Câu hỏi truy hồi", "Hạt liên kết"→"Lá liên kết"), button labels ("Sửa", "Merge", "Hồi sinh", "Ngủ đông", "Ôn ngay"), metadata labels

**TagCreateModal**:

- **Sửa light mode**: `bg-white dark:bg-ink-900` → `bg-paper-50 dark:bg-ink-900` (line 37)
- i18n ~10 keys: title ("Tag mới"), labels ("Tên tag", "Màu nhận diện"), placeholder, help text, buttons ("Huỷ", "Tạo tag"), preview ("Xem trước")

**Dependencies**: Phần 2 (mockData cho LeafDetailModal), Phần 4 (Sidebar import TagCreateModal — có thể uncomment)

---

### Phần 7: Dashboard

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/pages/Dashboard.tsx`
**Files sửa**: `src/locales/vi.json`, `src/locales/en.json`
**Việc cần làm**:

- Copy từ demo, rename `atom` → `leaf` toàn bộ (biến `surfacing`, `visible`, component refs)
- Import `LeafCard`, `LeafDetailModal` thay vì `AtomCard`, `AtomDetailModal`
- i18n ~30 keys: heading ("Đang nổi lên cho bạn"), subheading, filter labels ("Tất cả", "Sắp quên", ...), side panel titles ("Hôm nay", "Sức khỏe ghi nhớ", "Cần xử lý", "Gợi ý mở rộng"), stat labels, conflict summaries, text chứa "hạt" → i18n
- Empty state: khi `surfacing.length === 0` (không có leaf nào cần surface) → icon + message + CTA "Tạo ghi chú đầu tiên"
- Sửa text "hạt" → dùng i18n key, EN dùng "leaf/leaves"
**Dependencies**: Phần 6 (LeafCard, LeafDetailModal)

---

### Phần 8: NotesList + NoteEditor ⚠️ Phần phức tạp nhất

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/pages/NotesList.tsx`, `src/pages/NoteEditor.tsx`
**Files sửa**: `src/locales/vi.json`, `src/locales/en.json`

**NotesList**:

- Rename: import `Atom` icon → `Leaf` icon từ lucide
- i18n ~20 keys: heading, subheading ("Mỗi ghi chú đã được ... phân rã"→i18n), filter section, empty states, button text
- Empty state bổ sung: khi `notes.length === 0` (chưa có note nào — khác với "filter trống" đã có trong demo)
- Sửa text "hạt" → "lá" (i18n)

**NoteEditor** (phức tạp nhất — ~800 dòng):

- Rename toàn bộ:
  - `AtomRow` → `LeafRow`
  - `detectedAtoms` → `detectedLeaves`
  - `activeAtom` → `activeLeaf`
  - `atom.id` → `leaf.id` trong props
  - Import `Atom` icon → `Leaf` icon
  - `atomType` → `leafType` trong CSS class ref
  - `atomId` → `leafId`
- Sửa text "Atomic Knowledge Engine" → dùng i18n (VI: "Leaf Knowledge Engine", EN: "Leaf Knowledge Engine")
- **Sửa light mode**: tag picker dropdown `bg-white dark:bg-ink-900` → `bg-paper-50 dark:bg-ink-900` (line 209)
- i18n ~40 keys: rất nhiều — toolbar labels, banner text, engine status, leaf row actions ("Sửa", "Tách", "Gộp", "Bỏ"), voice panel text, image panel text, mode labels ("Đọc", "Sửa"), status badges ("Mới", "Khớp", "Liên kết"), tags AI/Manual
- CSS: `.atom-highlight` đã rename ở Phần 0, nhưng JSX class references `atom-highlight type-${seg.atomType}` cần đổi thành `leaf-highlight type-${seg.leafType}`

**Dependencies**: Phần 6 (LeafCard exports TYPE_STYLES)

---

### Phần 9: KnowledgeGraph + ReviewFeed + Insights

**Trạng thái**: `chưa bắt đầu`
**Files mới**: `src/pages/KnowledgeGraph.tsx`, `src/pages/ReviewFeed.tsx`, `src/pages/Insights.tsx`
**Files sửa**: `src/locales/vi.json`, `src/locales/en.json`

**KnowledgeGraph**:

- Rename: `atoms` → `leaves`, `selectedAtom` → `selectedLeaf`
- i18n ~15 keys: heading, labels, "atom mờ dần" → "leaf mờ dần", legend labels, hint text
- Empty state: khi chưa có node nào trên graph

**ReviewFeed**:

- Rename: data refs
- i18n ~20 keys: difficulty labels + detail ("Quên/< 1 ngày", ...), section labels ("Câu hỏi", "Đáp án", "Hạt gốc"→"Lá gốc"), "Done" screen text, meta labels
- Empty state: Done component đã có nhưng cần i18n

**Insights**:

- Rename: `totalAtoms` → `totalLeaves`
- i18n ~25 keys: heading, subheading, stat labels, chart labels, signal descriptions, adaptation text
- Sửa text "hạt" → i18n key
- Empty state: khi chưa có data analytics

**Dependencies**: Phần 6 (TYPE_STYLES)

---

## Light mode issues tổng hợp

| File (demo) | Dòng | Vấn đề | Sửa |
|---|---|---|---|
| `AtomDetailModal.jsx` | 17 | `bg-white` | → `bg-paper-50` |
| `AtomDetailModal.jsx` | 21 | `bg-white/95` | → `bg-paper-50/95` |
| `AtomDetailModal.jsx` | 154 | `bg-white/95` | → `bg-paper-50/95` |
| `TagCreateModal.jsx` | 37 | `bg-white` | → `bg-paper-50` |
| `NoteEditor.jsx` | 209 | `bg-white` | → `bg-paper-50` |
| `index.css` | 58-59 | scrollbar `#c8d8c8`/`#a0bba0` | → `#a8c0a8`/`#86a886` |

---

## i18n key tổng hợp

Ước tính ~210 keys, chia theo phần:

| Phần | Keys ước tính |
|---|---|
| 4 — Sidebar | ~20 |
| 5 — TopBar | ~10 |
| 6 — LeafCard + Modals | ~40 |
| 7 — Dashboard | ~30 |
| 8 — NotesList + NoteEditor | ~60 |
| 9 — Graph + Review + Insights | ~60 |

Quy tắc key: dot notation, tiếng Anh, gom theo component. Ví dụ:

- `sidebar.nav.surfacing` → VI: "Đang nổi lên", EN: "Surfacing"
- `leaf.type.definition` → VI: "Định nghĩa", EN: "Definition"
- `dashboard.heading` → VI: "Đang nổi lên cho bạn", EN: "Surfacing for you"

---

## Dependencies cài thêm

```bash
npm install lucide-react i18next react-i18next
```

Packages đã có trong repo đích: `react`, `react-dom`, `react-router-dom`, `tailwindcss`.

---

## Verification checklist (chạy sau MỖI phần)

1. `npm run dev` — app chạy không lỗi console
2. Toggle dark ↔ light — cả 2 theme render đúng, không có `bg-white` hay `text-black` thuần
3. Toggle VI ↔ EN — mọi string user-facing đã dịch, không còn hardcode
4. Empty state — thử với data trống, UI hiện message thay vì blank
5. Resize 375px — không bị vỡ layout, không bị overflow
6. Không có logic thật — vẫn dùng mockData hoặc placeholder

---

## Ghi chú quan trọng

- **KHÔNG thêm logic backend/API** — giữ mockData. Logic sẽ thêm ở Phase 1-2 theo ROADMAP.
- **Mỗi phần = 1 commit** — message format: `migrate: [tên phần] from demo to production`
- **Nếu thấy bug trong demo**: sửa luôn trong bản production, ghi lại trong commit message.
- **TypeScript**: chuyển `.jsx` → `.tsx` khi copy, thêm type dần — không bắt buộc 100% type ngay.
- **Khi xong toàn bộ plan này**: cập nhật `HISTORY.md`, `ROADMAP.md`, `.claude/memory/context.md`, `CLAUDE.md` (bảng trạng thái file).
