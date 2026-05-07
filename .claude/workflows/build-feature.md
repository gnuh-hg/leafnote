# Workflow: Build Feature

> Checklist khi triển khai 1 tính năng. Chạy từ đầu đến cuối — không bỏ bước, không đoán.

---

## Bước 0 — Đọc context

Đọc theo thứ tự:

1. `ROADMAP.md` — spec đầy đủ của tính năng + gate condition
2. `information/design-system.md` — **bắt buộc** nếu có UI
3. `information/product-principles.md` — 7 nguyên tắc cross-cutting
4. `.claude/memory/context.md` — pattern đang dùng, quyết định đã chốt
5. `.claude/memory/mistakes.md` — lỗi cần tránh (nếu có)

Không đọc = không bắt đầu code.

---

## Bước 1 — Xác định scope trước khi code

Trả lời 3 câu hỏi:

- Tính năng thuộc **Phase** nào trong ROADMAP? Gate condition là gì?
- Cần thêm **backend**, **frontend**, hay cả hai?
- Có **phụ thuộc** nào chưa tồn tại? (API endpoint, DB table, component)

Nếu chưa rõ → hỏi user.

---

## Bước 2 — Backend (nếu cần)

Mỗi domain có file riêng trong `routes/`, `models/`, `schemas/`, `services/`. Không trộn domain.

### 2a. Schema — `backend/app/schemas/<domain>.py`

```python
class NoteCreate(BaseModel):
    title: str
    body: str

class NoteOut(BaseModel):
    id: UUID
    title: str
    body: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

### 2b. Model — `backend/app/models/<domain>.py`

```python
class Note(Base):
    __tablename__ = "notes"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```

Nếu cần bảng mới → `alembic revision --autogenerate -m "M00N_<tên>"`.

### 2c. Service — `backend/app/services/<domain>.py`

**Toàn bộ business logic nằm ở đây.** Route không được chứa logic.

```python
async def create_note(db: AsyncSession, user_id: UUID, data: NoteCreate) -> Note:
    note = Note(user_id=user_id, **data.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note
```

### 2d. Route — `backend/app/api/v1/routes/<domain>.py`

Route chỉ làm 3 việc: parse input → gọi service → trả response.

```python
@router.post("/notes", response_model=NoteOut)
async def create_note(
    data: NoteCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user),
):
    return await note_service.create_note(db, user.id, data)
```

Đăng ký route vào `backend/app/api/v1/router.py`.

### 2e. Bảo mật

- Mọi endpoint (trừ `/health`) phải có `Depends(get_current_user)` — Supabase JWT.
- Validate input ở backend, không tin client.
- Biến môi trường chỉ đọc qua `core/config.py` — không `import os`.
- Không để thông tin nhạy cảm (user_id, token) trong URL.

---

## Bước 3 — Frontend (nếu cần)

### 3a. Types — `frontend/src/types/<domain>.ts`

Types được codegen từ OpenAPI schema. Nếu endpoint chưa có schema → viết tay tạm:

```typescript
export interface Note {
  id: string
  title: string
  body: string
  createdAt: string
}
```

### 3b. Service — `frontend/src/services/<domain>.ts`

**Mọi API call đi qua đây.** Component và hook không fetch trực tiếp.

```typescript
import { api } from './api' // Axios instance có auth header

export async function createNote(data: NoteCreate): Promise<Note> {
  const res = await api.post('/notes', data)
  return res.data
}
```

### 3c. Hook — `frontend/src/hooks/use<Name>.ts`

Dùng TanStack Query. Chỉ khi state đủ phức tạp để tách ra.

```typescript
export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: noteService.getNotes,
  })
}
```

### 3d. Component / Page

File đặt vào:
- UI tái sử dụng → `frontend/src/components/<domain>/`
- Route-level → `frontend/src/pages/`
- Global state (session, active project) → `frontend/src/stores/` (Zustand)

**Filter state → `useSearchParams`**, không phải `useState`. Ví dụ: `?tag=t1,t2`.

---

## Bước 4 — UI: Design System

Dùng đúng token — không tự chọn màu, không hardcode hex.

### Màu nền

| Dùng cho | Light | Dark |
|---|---|---|
| Body | `bg-paper-50` | `bg-ink-950` |
| Sidebar / Card | `bg-paper-100` | `bg-ink-850` |
| Hover | `bg-paper-200` | `bg-ink-850` |
| Border | `border-paper-300/60` | `border-ink-700/60` |

**Không dùng**: `bg-white`, `bg-gray-*`, `bg-slate-*`, `text-black`.

### Text

- UI label, button: `font-sans` + `text-zinc-900 dark:text-zinc-100`
- Metadata phụ: `text-zinc-400 dark:text-zinc-500`
- Nội dung leaf: **`font-serif`** (Cormorant Garamond)
- ID, code: `font-mono`
- Section heading: `text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-500 font-medium`

### Accent

- Primary CTA: `bg-emerald-500 hover:bg-emerald-400`
- Focus ring: `focus:ring-2 focus:ring-emerald-500/50`

### Leaf type màu

| Type | Badge class |
|---|---|
| `definition` | `text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20` |
| `proposition` | `text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20` |
| `relation` | `text-teal-700 dark:text-teal-300 bg-teal-500/10 border-teal-500/20` |
| `fact` | `text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/20` |

Pattern `TYPE_STYLES`: `label` là i18n key, caller dùng `t(T.label)`.

### Component patterns

```tsx
// Card surface
<div className="card-surface p-5">

// Clickable card
<button className="card-surface p-5 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all animate-fade-in">

// Modal
<div className="animate-slide-up">

// Button primary
<button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20">

// Button ghost
<button className="p-2 rounded-lg hover:bg-paper-200 dark:hover:bg-ink-850 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">

// Input
<input className="w-full bg-paper-100 dark:bg-ink-850 border border-paper-300/60 dark:border-ink-700/60 rounded-lg px-3 py-1.5 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 transition text-zinc-900 dark:text-zinc-100" />

// Nav item (React Router NavLink)
className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
  isActive
    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/20'
    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-paper-200 dark:hover:bg-ink-850'
}`}
```

---

## Bước 5 — I18n

Mọi string user-facing phải qua `t()`. Thêm key vào **cả 2 file ngay lúc viết** — không để trống EN hoặc VI.

File: `frontend/src/locales/vi.json` và `en.json`.

**Key convention**: dot notation, tiếng Anh: `note.action.save`, `sidebar.nav.dashboard`, `empty.noNotes.title`.

```tsx
// ❌
<span>Lưu</span>

// ✅
<span>{t('note.action.save')}</span>
```

Không dịch: className, key prop, biến JS, console.log.

---

## Bước 6 — Empty State

Component nhận data từ API cần xử lý **2 trường hợp**:

```tsx
// 1. Chưa có data (main empty)
{notes.length === 0 && !activeFilter && (
  <EmptyState
    icon={FileText}
    title={t('note.empty.title')}
    description={t('note.empty.description')}
    action={{ label: t('note.action.new'), onClick: handleNew }}
  />
)}

// 2. Filter không có kết quả (filter empty)
{notes.length === 0 && activeFilter && (
  <EmptyState
    icon={SearchX}
    title={t('note.empty.filtered.title')}
    description={t('note.empty.filtered.description')}
  />
)}
```

Empty state phải có: icon + tiêu đề + mô tả. CTA nếu phù hợp.

---

## Bước 7 — Checklist trước khi verify

### Product Principles

- [ ] **Dark/Light**: từng element render đúng ở cả 2 theme — đặc biệt border, text, hover state
- [ ] **i18n**: tất cả string qua `t()`, VI + EN đầy đủ, không string nào trống
- [ ] **Bảo mật**: validate ở backend, không data nhạy cảm trong URL, endpoint có auth guard
- [ ] **Mobile**: không vỡ layout ở 375px, touch target ≥ 44×44px
- [ ] **Không leak jargon**: không có "leaf ID", "embedding", "FSRS", "pgvector" ra UI
- [ ] **Adaptive UX**: tooltip chỉ hiện khi hover, không auto-show, không "Are you sure?" với action không destructive

### Design System

- [ ] Không dùng `bg-white`, `bg-gray-*`, `text-black` — dùng token
- [ ] Leaf type màu đúng bảng
- [ ] Card clickable có `hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5`
- [ ] Card mount: `animate-fade-in`, modal: `animate-slide-up`
- [ ] Font đúng role: `font-sans` cho UI, `font-serif` cho nội dung leaf

---

## Bước 8 — Verify

**Backend:**
```bash
# Chạy server
cd backend && uvicorn app.main:app --reload

# Test endpoint mới tại /docs
# Test: thiếu field, sai type, không có auth → đều phải trả lỗi đúng
```

**Frontend:**
```bash
cd frontend && npm run dev
# Mở tính năng trong browser
# Chuyển light/dark → check từng element
# Chuyển VI/EN → check tất cả string
# Xoá mock data → check empty state hiện đúng
# Resize 375px → check layout không vỡ
```

**TypeScript:**
```bash
rtk tsc
# 0 error trước khi commit
```

---

## Bước 9 — Cập nhật tài liệu

| Thay đổi | Cập nhật |
|---|---|
| API endpoint mới | `information/api-spec.md` |
| Bảng / column DB mới | `information/database-schema.md` |
| File mới tạo | Bảng "Trạng thái file" trong `CLAUDE.md` |
| Quyết định lớn, pattern mới | `.claude/memory/context.md` |
| Lỗi phát hiện khi làm | `.claude/memory/mistakes.md` |

---

## Bước 10 — Commit

```
feat(<domain>): <mô tả ngắn>

# Ví dụ:
feat(auth): add login form with Supabase session
feat(note): add note list page with empty state
feat(leaf): add leaf panel in note editor
```

Một commit = một tính năng **hoàn chỉnh**. Không commit dang dở, không commit khi còn lỗi TypeScript.
