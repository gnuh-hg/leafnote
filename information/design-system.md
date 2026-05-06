# Design System — Leafnote

> Nguồn chân lý duy nhất về màu sắc, typography, spacing, và component pattern. Mọi feature UI phải tham chiếu file này — không tự định nghĩa lại màu hay style.

---

## Nguyên tắc cốt lõi

- **Xanh lá (emerald/teal) là màu chủ đạo** — accent, CTA, highlight, trạng thái active.
- **Paper/Ink là nền** — light dùng `paper`, dark dùng `ink`. Không dùng `gray`, `slate`, `neutral` cho nền.
- **Zinc cho text** — `zinc-900` (light) / `zinc-100` (dark). Không dùng `black` hay `white` thuần.
- **Dark mode qua class** — toggle class `dark` trên `<html>`. Không dùng `prefers-color-scheme`.
- **Không hardcode hex** — luôn dùng token Tailwind từ bảng dưới.

---

## Color Tokens

### Paper palette — nền sáng (light mode)

| Token | Hex | Dùng cho |
|---|---|---|
| `paper-50` | `#f8faf8` | `body` background |
| `paper-100` | `#f0f4f0` | surface chính (sidebar, card) |
| `paper-200` | `#e2eae2` | hover background, kbd |
| `paper-300` | `#c8d8c8` | border, separator, scrollbar |
| `paper-400` | `#a0bba0` | scrollbar hover |

### Ink palette — nền tối (dark mode)

| Token | Hex | Dùng cho |
|---|---|---|
| `ink-950` | `#08080d` | `body` background |
| `ink-900` | `#0e0e16` | sidebar, topbar |
| `ink-875` | `#13131c` | — |
| `ink-850` | `#16161f` | card, input |
| `ink-800` | `#1c1c28` | — |
| `ink-750` | `#252532` | — |
| `ink-700` | `#2e2e3d` | border, separator, scrollbar |
| `ink-600` | `#3d3d4f` | scrollbar hover |

### Accent — màu chức năng

| Màu | Dùng cho |
|---|---|
| `emerald-500` | Primary CTA, active state, focus ring, badge mới |
| `emerald-400` | Hover của CTA |
| `teal-500` | Gradient logo, leaf type "relation" |
| `amber-400/500` | Leaf type "proposition", relevance bar |
| `sky-400/500` | Leaf type "fact" |
| `rose-500/600` | Retention thấp (<50%), cảnh báo |
| `zinc-*` | Text ở mọi cấp độ |

---

## Leaf Type Colors

Mỗi loại leaf có màu riêng — áp dụng nhất quán trên badge, highlight trong editor, và dot trong tag list.

| Type | Label | Badge class | Dot | Editor highlight |
|---|---|---|---|---|
| `definition` | Định nghĩa | `text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20` | `bg-emerald-400` | `rgba(16,185,129, 0.25)` |
| `proposition` | Mệnh đề | `text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20` | `bg-amber-400` | `rgba(251,191,36, 0.25)` |
| `relation` | Quan hệ | `text-teal-700 dark:text-teal-300 bg-teal-500/10 border-teal-500/20` | `bg-teal-400` | `rgba(52,211,153, 0.25)` |
| `fact` | Dữ kiện | `text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20` | `bg-sky-400` | `rgba(56,189,248, 0.25)` |

### Surfacing reason colors

| Type | Label | Class |
|---|---|---|
| `forgetting` | Sắp quên | `text-rose-600 dark:text-rose-300` |
| `related` | Liên quan ngay | `text-amber-600 dark:text-amber-300` |
| `conflict` | Mâu thuẫn | `text-red-600 dark:text-red-300` |
| `new` | Mới sinh | `text-emerald-600 dark:text-emerald-300` |

---

## Typography

### Font families

| Role | Font | Tailwind class | Dùng cho |
|---|---|---|---|
| Sans | Inter | `font-sans` | UI label, button, metadata |
| Serif | Cormorant Garamond | `font-serif` | Nội dung leaf, note body |
| Mono | JetBrains Mono | `font-mono` | ID, code, metadata kỹ thuật |

> Load qua Google Fonts trong `index.html`. Không bundle local.

### Text scale thường dùng

| Cỡ | Class | Dùng cho |
|---|---|---|
| 10px | `text-[10px]` | Section label uppercase (tracking-wider) |
| 11px | `text-[11px]` | Metadata phụ, pill content |
| 12px | `text-xs` | Badge số, timestamp |
| 13px | `text-[13px]` | Tag item, nav sub-item |
| 14px | `text-sm` | Nav item, input, button |
| 15px | `text-[15px]` | Card body text (font-serif) |
| 24px | `text-2xl` | Modal heading (font-serif) |

### Section label pattern

```jsx
<div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
  Tiêu đề section
</div>
```

---

## Component Patterns

### `card-surface`

Card cơ bản có border + rounded. Không có backdrop-blur.

```jsx
// CSS class
.card-surface {
  @apply bg-paper-100 border border-paper-300/60 rounded-2xl;
}
.dark .card-surface {
  @apply bg-ink-850 border-ink-700/60;
}

// Dùng
<div className="card-surface p-5">...</div>

// Hover cho clickable card
<button className="card-surface p-5 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all animate-fade-in">
```

### `glass-panel`

Panel có backdrop-blur — dùng cho sidebar, topbar, modal header sticky.

```jsx
.glass-panel {
  @apply bg-paper-100/80 backdrop-blur-xl border border-paper-300/60;
}
.dark .glass-panel {
  @apply bg-ink-900/60 border-ink-700/60;
}
```

### `pill`

Badge nhỏ inline — luôn dùng kèm border và color class của leaf type.

```jsx
.pill {
  @apply inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium;
}

// Dùng
<span className={`pill border ${TYPE_STYLES[type].color}`}>
  <Icon className="w-3 h-3" />
  Label
</span>
```

### `focus-ring`

```jsx
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-paper-50;
}
.dark .focus-ring {
  @apply focus:ring-offset-ink-950;
}
```

---

## Navigation & Interactive States

### Nav item active/inactive

```jsx
// React Router NavLink pattern
className={({ isActive }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
    isActive
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/20'
      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850'
  }`
}
```

### Button variants

```jsx
// Primary CTA
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20">

// Ghost/icon
<button className="p-2 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-850 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">

// Dashed add
<button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] text-zinc-400 border border-dashed border-paper-300/60 dark:border-ink-700/60 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-paper-200 dark:hover:bg-ink-850 transition">
```

### Input

```jsx
<input className="w-full bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 rounded-lg px-3 py-1.5 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:bg-paper-50 dark:focus:bg-ink-900 transition text-zinc-900 dark:text-zinc-100" />
```

---

## Animations

Khai báo trong `tailwind.config.js`. Không dùng CSS animation tự viết trừ trường hợp thực sự cần.

| Class | Mô tả | Dùng cho |
|---|---|---|
| `animate-fade-in` | opacity + translateY(4px→0), 0.4s | Card mount, page enter |
| `animate-slide-up` | opacity + translateY(8px→0), 0.3s | Modal enter |
| `animate-pulse-soft` | opacity 0.5↔1, 3s loop | Loading indicator nhẹ |
| `animate-float` | translateY(0↔-3px), 6s loop | Logo hoặc icon decorative |

---

## Logo / Wordmark Pattern

```jsx
<div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
  <Leaf className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
  <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
</div>
<div className="font-serif text-2xl font-semibold leading-none tracking-tight text-zinc-900 dark:text-zinc-100">
  Leafnote
</div>
<div className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mt-1.5">
  ghi chú có vòng đời
</div>
```

---

## Sidebar Layout

```
w-64 shrink-0 | bg-paper-100/80 dark:bg-ink-900/70 backdrop-blur-xl
border-r border-paper-300/60 dark:border-ink-700/60
flex flex-col
```

## TopBar Layout

```
h-14 shrink-0 | border-b border-paper-300/60 dark:border-ink-700/60
bg-paper-50/80 dark:bg-ink-900/40 backdrop-blur-xl
px-6 flex items-center justify-between z-10
```

---

## Body Background

```css
/* Light */
body {
  @apply bg-paper-50 text-zinc-900 transition-colors duration-200;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.06), transparent),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(52,211,153,0.03), transparent);
  background-attachment: fixed;
}

/* Dark */
.dark body {
  @apply bg-ink-950 text-zinc-100;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.08), transparent),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(52,211,153,0.04), transparent);
}
```

---

## Separator / Divider

```jsx
// Horizontal
<div className="border-t border-paper-300/60 dark:border-ink-700/60" />

// Accent border-left (quote, reason)
<div className="border-l-2 border-paper-300 dark:border-ink-700 pl-2.5 italic text-[11px] text-zinc-500">
```

---

## Retention / Progress Bar Pattern

```jsx
// Container
<div className="flex-1 h-1 rounded-full bg-paper-300 dark:bg-ink-700 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
    style={{ width: `${pct}%` }}
  />
</div>

// Màu bar theo ngữ cảnh:
// retention cao  → from-emerald-500 to-teal-500
// retention thấp → from-rose-500 to-orange-500
// relevance      → from-amber-400 to-orange-500
```

---

## Scrollbar

```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 4px; } /* paper-300 */
::-webkit-scrollbar-thumb:hover { background: #a0bba0; } /* paper-400 */
.dark ::-webkit-scrollbar-thumb { background: #2e2e3d; } /* ink-700 */
.dark ::-webkit-scrollbar-thumb:hover { background: #3d3d4f; } /* ink-600 */
```

---

## Editor Highlight (`.atom-highlight`)

Highlight inline trong editor Tiptap — mỗi type leaf có màu riêng (xem bảng Leaf Type Colors).

```css
.atom-highlight {
  background: linear-gradient(180deg, transparent 60%, rgba(16,185,129,0.25) 60%);
  border-radius: 2px; padding: 0 2px;
  cursor: pointer; transition: background 0.2s;
}
.atom-highlight:hover, .atom-highlight.active {
  background: linear-gradient(180deg, transparent 50%, rgba(16,185,129,0.4) 50%);
}
/* proposition, relation, fact — xem index.css */
```

---

## Checklist khi tạo component mới

- [ ] Nền dùng `paper-*` / `ink-*`, không dùng `gray` hay `white` thuần
- [ ] Text dùng `zinc-*`
- [ ] Accent dùng `emerald-500` (không tự chọn màu khác cho primary)
- [ ] Leaf type màu theo bảng "Leaf Type Colors"
- [ ] Border dùng `border-paper-300/60` (light) / `border-ink-700/60` (dark)
- [ ] Hover state có `transition` class
- [ ] Clickable card có `hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5`
- [ ] Font: UI dùng `font-sans`, nội dung leaf dùng `font-serif`
- [ ] Animation mount: `animate-fade-in` cho card, `animate-slide-up` cho modal
