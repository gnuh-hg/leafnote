# Workflow: Migrate Demo → Production

> Quy trình chuyển từng phần nhỏ từ `leafnote-demo/` sang `leafnote/frontend/`. Mỗi lần chạy workflow này xử lý **một phần** (1 component, 1 page, hoặc 1 module).

---

## Khi nào dùng

User sẽ chỉ định phần cần chuyển (ví dụ: "chuyển Sidebar", "chuyển Dashboard page"). Workflow này là checklist cho MỖI phần — không phải plan tổng thể.

---

## Bước 1 — Đọc context trước khi chạm code

Bắt buộc đọc trước khi sửa bất cứ gì:

1. `information/design-system.md` — nguồn chân lý UI (màu, font, component pattern)
2. `information/product-principles.md` — 7 nguyên tắc cross-cutting
3. File demo nguồn: đọc toàn bộ file cần chuyển trong `leafnote-demo/src/`
4. File đích hiện tại: kiểm tra `leafnote/frontend/src/` xem đã có gì chưa

---

## Bước 2 — Copy & Rename file

1. Copy file từ `leafnote-demo/src/` sang vị trí tương ứng trong `leafnote/frontend/src/`
2. Đổi extension: `.jsx` → `.tsx` (project chính dùng TypeScript)
3. Rename file nếu tên chứa "Atom":
   - `AtomCard.jsx` → `LeafCard.tsx`
   - `AtomDetailModal.jsx` → `LeafDetailModal.tsx`
   - Tương tự cho mọi file khác

---

## Bước 3 — Rename terminology (atom → leaf)

Tìm và thay thế TOÀN BỘ trong file vừa copy:

| Demo (cũ) | Production (mới) | Ghi chú |
|---|---|---|
| `atom` | `leaf` | biến, prop, state |
| `Atom` | `Leaf` | component name, type name |
| `atoms` | `leaves` | plural |
| `atomCount` | `leafCount` | field name trong data |
| `atomId` | `leafId` | field name |
| `linkedAtoms` | `linkedLeaves` | field name |
| `.atom-highlight` | `.leaf-highlight` | CSS class |
| `allAtoms` | `allLeaves` | import alias |

**Lưu ý**: Không đổi package name hay thư viện bên thứ ba — chỉ đổi code của project.

---

## Bước 4 — Thêm song ngữ (i18n)

Mọi string hiển thị cho user phải qua i18n layer:

1. **Tạo / cập nhật file dịch**:
   - `leafnote/frontend/src/locales/vi.json`
   - `leafnote/frontend/src/locales/en.json`

2. **Tìm tất cả hardcoded string** trong file vừa chuyển:
   - Label, placeholder, tooltip, button text, heading, thông báo
   - Không dịch: className, key, variable name, console.log

3. **Thay bằng translation key**:
   ```tsx
   // ❌ Trước
   <span>Định nghĩa</span>
   
   // ✅ Sau
   <span>{t('leaf.type.definition')}</span>
   ```

4. **Quy tắc đặt key**:
   - Dùng dot notation: `section.subsection.label`
   - Key bằng tiếng Anh: `sidebar.nav.dashboard`, `leaf.type.definition`
   - Gom theo component/page: `dashboard.*`, `sidebar.*`, `editor.*`

5. **Thêm cả 2 ngôn ngữ** vào file dịch ngay khi tạo key — không để trống.

---

## Bước 5 — Sửa chế độ sáng (Light mode)

Kiểm tra và sửa light mode theo `design-system.md`:

1. **Nền**: dùng `paper-*` tokens, KHÔNG dùng `gray`, `slate`, `white` thuần
2. **Text**: dùng `zinc-*`, KHÔNG dùng `black` thuần
3. **Border**: `border-paper-300/60` (light) / `border-ink-700/60` (dark)
4. **Surface**: `bg-paper-100` cho card, `bg-paper-50` cho body
5. **Hover**: `hover:bg-paper-200` (light) / `hover:bg-ink-850` (dark)
6. **Kiểm tra trực quan**: mở browser ở light mode, check từng element — đặc biệt:
   - Contrast đủ đọc được?
   - Hover state thấy rõ?
   - Active state phân biệt được với inactive?
   - Border có bị "biến mất" trên nền sáng không?

---

## Bước 6 — Thêm Empty State

Bản demo dùng mockData nên luôn có dữ liệu. Bản chính thức cần xử lý khi chưa có data:

1. **Xác định data dependencies** trong component:
   - Component nhận data gì qua props/context?
   - Trường nào có thể rỗng/null/undefined/[]?

2. **Thêm empty state UI** cho mỗi trường hợp:
   ```tsx
   // Ví dụ
   {leaves.length === 0 ? (
     <EmptyState 
       icon={Leaf}
       title={t('empty.noLeaves.title')}
       description={t('empty.noLeaves.description')}
     />
   ) : (
     // render danh sách bình thường
   )}
   ```

3. **Empty state phải đẹp** — không phải "No data" trống trơn:
   - Icon minh họa
   - Tiêu đề ngắn gọn (qua i18n)
   - Mô tả hướng dẫn hành động tiếp theo
   - CTA button nếu phù hợp (ví dụ: "Tạo ghi chú đầu tiên")

4. **Các empty state cần xử lý** (tuỳ component):
   - Chưa có note nào
   - Chưa có leaf nào
   - Chưa có tag nào
   - Danh sách tìm kiếm trống (no results)
   - Graph chưa có data

---

## Bước 7 — Kiểm tra theo Product Principles

Checklist từ `product-principles.md` cho phần vừa chuyển:

- [ ] **Dark/Light**: Cả 2 theme đều render đúng?
- [ ] **i18n**: Mọi string user-facing qua i18n? Cả VI lẫn EN có đầy đủ?
- [ ] **Adaptive UX**: Không có tooltip/hướng dẫn thừa cho user có kinh nghiệm?
- [ ] **Mobile**: Không bị vỡ trên 375px? Touch target >= 44px?
- [ ] **Không leak jargon**: UI không viết "leaf ID", "embedding", "FSRS params"

---

## Bước 8 — Kiểm tra theo Design System

Checklist từ `design-system.md`:

- [ ] Nền dùng `paper-*` / `ink-*` (không `gray`, `white`)
- [ ] Text dùng `zinc-*`
- [ ] Accent dùng `emerald-500` cho primary
- [ ] Leaf type color theo bảng (definition=emerald, proposition=amber, relation=teal, fact=sky)
- [ ] Font: UI = `font-sans` (Inter), nội dung leaf = `font-serif` (Cormorant Garamond)
- [ ] Card dùng `card-surface` pattern
- [ ] Animation: `animate-fade-in` cho card, `animate-slide-up` cho modal
- [ ] Hover clickable card: `hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5`

---

## Bước 9 — Verify

1. **Chạy dev server** và mở phần vừa chuyển
2. **Test light mode** — chuyển sang sáng, check trực quan
3. **Test dark mode** — chuyển sang tối, check trực quan
4. **Test i18n** — chuyển ngôn ngữ sang EN, kiểm tra mọi string đã dịch
5. **Test empty state** — comment mockData, xem empty state có hiện đúng
6. **Test mobile** — resize 375px, kiểm tra layout

---

## Lưu ý quan trọng

- **KHÔNG thêm logic thật** — giữ mockData hoặc data trống. Logic backend sẽ thêm sau.
- **Mỗi lần chạy workflow = 1 phần nhỏ** — không chuyển hết cùng lúc.
- **Commit sau mỗi phần** — message rõ ràng: `migrate: [tên phần] from demo to production`
- **Nếu thấy bug trong demo**: sửa luôn trong bản production, không copy bug sang.
- **CSS class `.atom-highlight`**: đổi thành `.leaf-highlight` trong cả JSX lẫn `index.css`.
