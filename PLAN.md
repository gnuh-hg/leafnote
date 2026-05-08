# PLAN — Tag CRUD + Toast + UX fixes

> Plan chi tiết cho tính năng quản lý tag (tạo, sửa, xóa), hệ thống toast thông báo lỗi, và sửa các vấn đề UX hiện tại. Đủ context để thực hiện trong session mới.

---

## Bối cảnh

- **Phase hiện tại**: Phase 1 — Shell. Auth xong, Note CRUD chưa làm.
- **Tag thuộc Phase 2** theo ROADMAP, nhưng Tag entity là independent (không phụ thuộc Note model).
- **Frontend hiện có**: `TagCreateModal` (chỉ tạo, mock state), `Sidebar` hiện tag list, `AppState` context dùng `useState` + mock data.
- **Backend hiện có**: Chỉ Auth (User model + routes). Chưa có bảng `tags`.

### Quyết định đã chốt

1. **Tag trước Note** — Tag entity independent. `note_count` tạm = 0, `note_tags` tạo khi làm Note CRUD.
2. **TanStack Query thay AppState** — AppState context (`useState` + mock) không có cache/refetch. Chuyển sang TanStack Query, tái dụng cho Note/Leaf sau.
3. **Tag edit = modal riêng** — Tái dụng layout `TagCreateModal`. Inline edit khó chỉnh color picker trong sidebar hẹp.
4. **Tag sorting = access_count DESC** — Tag hay dùng nổi lên đầu sidebar.
5. **Toast chỉ khi bất thường** — Không toast khi action thành công hiển nhiên (tạo tag xong, modal đóng là đủ). Chỉ toast khi lỗi, cảnh báo, hoặc trạng thái bất thường.

---

## A. Hệ thống Toast

### Triết lý

Toast **không** dùng cho:

- Tạo/sửa/xóa thành công (UI đã phản ánh kết quả: modal đóng, item biến mất, tên đổi)

Toast **chỉ** dùng cho:

- API lỗi (server 500, network fail)
- Validate fail phía server (trùng tên tag — edge case không bắt được ở client)
- Cảnh báo (mất kết nối mạng)
- Trạng thái bất thường cần user biết

### Thiết kế — adapt từ manask cho Leafnote design system

| Thuộc tính | Giá trị |
|---|---|
| Vị trí | Fixed bottom-right, `z-50` |
| Nền | `bg-paper-100 dark:bg-ink-850` + `backdrop-blur-sm` |
| Border | `border border-paper-300/60 dark:border-ink-700/60` + `border-l-4` theo type |
| Shadow | `shadow-lg` (nhẹ hơn manask — Leafnote tone nhẹ nhàng) |
| Animation | Slide-in từ phải (`translateX(110%) → 0`), slide-out ngược lại |
| Auto-dismiss | 4s (warning/info), không tự dismiss (error) |
| Max stack | 3 toast |
| Close button | Có, icon `X` |

### 3 type (không cần success)

| Type | Border-left | Icon | Khi nào |
|---|---|---|---|
| `error` | `border-l-rose-500` | `XCircle` | API lỗi, server reject |
| `warning` | `border-l-amber-500` | `AlertTriangle` | Mất mạng, action timeout |
| `info` | `border-l-sky-500` | `Info` | Tip, trạng thái đồng bộ |

### Files cần tạo

| File | Mô tả |
|---|---|
| `frontend/src/stores/toastStore.ts` | Zustand store: `toasts[]`, `addToast(type, message)`, `removeToast(id)`. Mỗi toast có `id` (nanoid), `type`, `message`, `createdAt`. Auto-remove sau timeout trừ error. |
| `frontend/src/components/ui/ToastContainer.tsx` | `createPortal` vào `document.body`. Fixed bottom-right. Map `toasts` → `<Toast>`. |
| `frontend/src/components/ui/Toast.tsx` | Single toast: border-left + icon + message + close button. CSS animation enter/leave. |

### Sử dụng

```tsx
// Trong mutation onError:
const { addToast } = useToastStore()
addToast('error', t('toast.error.generic'))
```

### I18n keys

```
toast.error.generic         "Có lỗi xảy ra, vui lòng thử lại"
toast.error.network         "Mất kết nối mạng"
toast.error.tagDuplicate    "Tag này đã tồn tại"
toast.error.tagNotFound     "Không tìm thấy tag"
toast.error.unauthorized    "Phiên đăng nhập hết hạn"
toast.warning.offline       "Bạn đang ngoại tuyến"
```

---

## B. Vấn đề UI/UX cần fix

### B1. TagCreateModal không validate trùng tên

**File**: `frontend/src/components/TagCreateModal.tsx`
**Vấn đề**: Có thể tạo 2 tag cùng tên. Không check client-side, không hiện lỗi.
**Fix**: Trước khi submit, check `tags.some(t => t.name === slug)`. Hiện inline error dưới input: `t('tag.error.duplicate')`. Backend cũng validate (UNIQUE constraint → trả 409).

### B2. Tag picker không đóng khi click outside

**File**: `frontend/src/pages/NoteEditor.tsx:211`
**Vấn đề**: Popover tag picker chỉ đóng bằng nút X.
**Fix**: Thêm `useEffect` với `mousedown` listener trên `document`, check `ref.current.contains(e.target)`.

### B3. Sidebar badge số hardcode

**File**: `frontend/src/components/Sidebar.tsx:39`
**Vấn đề**: Badge "12" (surfacing) và "7" (review) là hardcode.
**Fix**: Xóa badge tạm. Phase 3 (Review) mới có data thực để hiện.

### B4. Sidebar tag không có sửa/xóa

**File**: `frontend/src/components/Sidebar.tsx:119-134`
**Vấn đề**: Mỗi tag item chỉ navigate, không có menu hành động.
**Fix**: Thêm icon `MoreHorizontal` (⋯) khi hover → dropdown 2 option: "Đổi tên & màu" mở `TagEditModal`, "Xóa" mở `TagDeleteConfirm`.

### B5. Không có loading state cho tags

**Vấn đề**: Khi chuyển sang API, có delay. Hiện tại tag list render mock data ngay lập tức.
**Fix**: Skeleton loading 3 dòng shimmer trong sidebar khi `isLoading`. Lỗi fetch → text "Không tải được" + nút "Thử lại".

---

## C. Backend — Tag CRUD

### C1. Model — `backend/app/models/tag.py`

```python
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import DateTime, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_tags_user_name"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str] = mapped_column(Text, nullable=False)
    access_count: Mapped[int] = mapped_column(Integer, default=0)
    last_accessed: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

- `access_count` + `last_accessed`: cập nhật khi user click tag (navigate `/notes?tag=...`), dùng cho sorting sidebar
- `UNIQUE(user_id, name)`: mỗi user không trùng tên tag

### C2. Schema — `backend/app/schemas/tag.py`

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator

VALID_COLORS = {"amber", "emerald", "sky", "teal", "rose", "violet", "orange", "indigo"}

class TagCreate(BaseModel):
    name: str
    color: str

    @field_validator("color")
    @classmethod
    def validate_color(cls, v):
        if v not in VALID_COLORS:
            raise ValueError(f"color must be one of {VALID_COLORS}")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if not v or len(v) > 50:
            raise ValueError("name must be 1-50 characters")
        return v.lower().replace(" ", "-")

class TagUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    # same validators

class TagOut(BaseModel):
    id: UUID
    name: str
    color: str
    note_count: int = 0  # computed, default 0 cho đến khi có note_tags
    access_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
```

### C3. Service — `backend/app/services/tags.py`

| Function | Logic |
|---|---|
| `list_tags(db, user_id)` | `SELECT ... WHERE user_id=? ORDER BY access_count DESC, created_at DESC` |
| `create_tag(db, user_id, data: TagCreate)` | Check trùng tên → 409 nếu trùng. Tạo tag. |
| `update_tag(db, user_id, tag_id, data: TagUpdate)` | Check ownership (user_id match) → 404 nếu không. Check tên mới trùng → 409. Update fields non-None. |
| `delete_tag(db, user_id, tag_id)` | Check ownership → 404. Xóa tag. (Sau này cascade `note_tags`.) |
| `track_access(db, user_id, tag_id)` | Check ownership. `access_count += 1`, `last_accessed = utcnow()`. |

### C4. Route — `backend/app/api/v1/routes/tags.py`

| Method | Path | Response | Lỗi |
|---|---|---|---|
| `GET` | `/api/v1/tags` | `list[TagOut]` | 401 |
| `POST` | `/api/v1/tags` | `TagOut` (201) | 401, 409 (trùng tên), 422 (invalid) |
| `PATCH` | `/api/v1/tags/{tag_id}` | `TagOut` | 401, 404, 409, 422 |
| `DELETE` | `/api/v1/tags/{tag_id}` | 204 No Content | 401, 404 |
| `POST` | `/api/v1/tags/{tag_id}/access` | 204 No Content | 401, 404 |

Tất cả có `Depends(get_current_user)`.

Đăng ký vào `backend/app/api/v1/router.py`:

```python
from app.api.v1.routes.tags import router as tags_router
api_router.include_router(tags_router)
```

### C5. Migration

```bash
cd backend
alembic revision --autogenerate -m "M002_create_tags_table"
alembic upgrade head
```

---

## D. Frontend — Tag CRUD

### D1. Cài thêm dependencies

```bash
cd frontend
npm install @tanstack/react-query axios
```

### D2. API instance — `frontend/src/services/api.ts`

Axios instance, base URL từ env `VITE_API_URL`, interceptor thêm `Authorization: Bearer <supabase_session.access_token>`.

```typescript
import axios from 'axios'
import { supabase } from '../lib/supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
```

### D3. Tag service — `frontend/src/services/tags.ts`

```typescript
import { api } from './api'

export interface TagOut {
  id: string
  name: string
  color: string
  note_count: number
  access_count: number
  created_at: string
}

export interface TagCreate { name: string; color: string }
export interface TagUpdate { name?: string; color?: string }

export const getTags = () => api.get<TagOut[]>('/api/v1/tags').then(r => r.data)
export const createTag = (data: TagCreate) => api.post<TagOut>('/api/v1/tags', data).then(r => r.data)
export const updateTag = (id: string, data: TagUpdate) => api.patch<TagOut>(`/api/v1/tags/${id}`, data).then(r => r.data)
export const deleteTag = (id: string) => api.delete(`/api/v1/tags/${id}`)
export const trackTagAccess = (id: string) => api.post(`/api/v1/tags/${id}/access`)
```

### D4. TanStack Query hook — `frontend/src/hooks/useTags.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as tagService from '../services/tags'
import { useToastStore } from '../stores/toastStore'

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: tagService.getTags })
}

export function useCreateTag() {
  const qc = useQueryClient()
  const { addToast } = useToastStore()
  return useMutation({
    mutationFn: tagService.createTag,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
    onError: (err) => {
      if (err.response?.status === 409) addToast('error', t('toast.error.tagDuplicate'))
      else addToast('error', t('toast.error.generic'))
    },
  })
}
// useUpdateTag, useDeleteTag, useTrackTagAccess tương tự
```

### D5. Setup TanStack Query — `frontend/src/main.tsx`

Wrap `<QueryClientProvider>` quanh `<App />`.

### D6. Chuyển AppState → TanStack Query

| Cũ | Mới |
|---|---|
| `AppState` context cung cấp `tags`, `addTag` | Xóa bỏ. Thay bằng `useTags()` hook |
| `Sidebar` import `useAppState()` | Import `useTags()` |
| `TagCreateModal` gọi `addTag()` | Gọi `useCreateTag().mutate()` |
| `NoteEditor` import `useAppState()` | Import `useTags()` |
| `NotesList` import `useAppState()` | Import `useTags()` |

**Lưu ý**: `AppState.tsx` có thể giữ lại nếu sau này cần global UI state khác, nhưng bỏ hết logic tag ra.

### D7. UI Components

#### `TagCreateModal` (sửa — `frontend/src/components/TagCreateModal.tsx`)

- Đổi `addTag()` → `useCreateTag().mutate()`
- Thêm inline error khi trùng tên: check `tags.some(t => t.name === slug)` trước submit
- `onSuccess` của mutation → `onClose()` (modal đóng là feedback đủ)
- `onError` → toast error (đã handle trong hook)
- Thêm `disabled` state trên nút Tạo khi mutation đang chạy (`isPending`)

#### `TagEditModal` (mới — `frontend/src/components/TagEditModal.tsx`)

- Layout giống `TagCreateModal`: input name + color picker + preview
- Nhận prop `tag: TagOut` → pre-fill `name` và `color`
- Title: `t('tagEdit.title')`
- Nút: `t('tagEdit.actions.save')` (emerald CTA)
- Submit → `useUpdateTag().mutate()` → `onClose()`
- Validate trùng tên (trừ tên hiện tại)

#### `TagDeleteConfirm` (mới — `frontend/src/components/TagDeleteConfirm.tsx`)

- Portal modal nhỏ, `animate-slide-up`
- Icon `AlertTriangle` màu rose
- Title: `t('tagDelete.confirm.title')` → "Xóa tag #tên?"
- Description: `t('tagDelete.confirm.description')` → "Ghi chú gắn tag này sẽ không bị xóa."
- 2 nút: Hủy (ghost) + Xóa (`bg-rose-500 hover:bg-rose-400 text-white`)
- Xóa → `useDeleteTag().mutate()` → `onClose()`

#### `Sidebar` (sửa — `frontend/src/components/Sidebar.tsx`)

- Import `useTags()` thay `useAppState()`
- Tag list: `data?.map(...)`, loading → skeleton, error → retry text
- Mỗi tag item: thêm `MoreHorizontal` icon khi hover (opacity-0 → opacity-100)
  - Click → dropdown 2 item: "Đổi tên & màu" (mở `TagEditModal`), "Xóa" (mở `TagDeleteConfirm`)
  - Dropdown: `card-surface` + `shadow-xl`, absolute positioned
- Click tag → gọi `trackTagAccess(tag.id)` rồi `navigate(/notes?tag=...)`
- Tags đã sorted từ API (`access_count DESC`)
- Xóa badge hardcode "12" và "7"

#### `TagListSkeleton` (mới — inline trong Sidebar hoặc tách file nhỏ)

3 dòng shimmer:

```tsx
<div className="space-y-1.5 px-3">
  {[1,2,3].map(i => (
    <div key={i} className="flex items-center gap-2 py-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-paper-300 dark:bg-ink-700 animate-pulse-soft" />
      <div className="h-3 rounded bg-paper-300 dark:bg-ink-700 animate-pulse-soft" style={{ width: `${60 + i * 20}px` }} />
    </div>
  ))}
</div>
```

### D8. Empty States

| Tình huống | Component | Hiển thị |
|---|---|---|
| Sidebar: chưa có tag | `Sidebar` | (đã có — giữ nguyên) Icon tag + "Chưa có tag nào" + nút dashed "Tạo tag" |
| Sidebar: đang tải | `Sidebar` | `TagListSkeleton` — 3 dòng shimmer |
| Sidebar: lỗi fetch | `Sidebar` | `t('tag.error.loadFailed')` + nút `t('tag.action.retry')` |
| Tag picker: chưa có tag | `NoteEditor` | "Chưa có tag — Tạo tag mới?" + link mở `TagCreateModal` |
| NotesList filter: 0 kết quả | `NotesList` | (đã có — giữ nguyên) |

### D9. Fix tag picker click-outside

Trong `NoteEditor.tsx`, wrap tag picker trong `useRef`, thêm:

```tsx
useEffect(() => {
  if (!tagPickerOpen) return
  const handler = (e: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
      setTagPickerOpen(false)
    }
  }
  document.addEventListener('mousedown', handler)
  return () => document.removeEventListener('mousedown', handler)
}, [tagPickerOpen])
```

### D10. I18n keys cần thêm

Thêm vào **cả** `frontend/src/locales/vi.json` và `en.json`:

```
tagEdit.title                    "Chỉnh sửa tag" / "Edit tag"
tagEdit.actions.save             "Lưu thay đổi" / "Save changes"
tagDelete.confirm.title          "Xóa tag?" / "Delete tag?"
tagDelete.confirm.description    "Ghi chú gắn tag này sẽ không bị xóa." / "Notes with this tag won't be deleted."
tagDelete.actions.delete         "Xóa" / "Delete"
tagDelete.actions.cancel         "Hủy" / "Cancel"
tag.error.duplicate              "Tag này đã tồn tại" / "This tag already exists"
tag.error.loadFailed             "Không tải được tag" / "Failed to load tags"
tag.action.retry                 "Thử lại" / "Retry"
toast.error.generic              "Có lỗi xảy ra, vui lòng thử lại" / "Something went wrong, please try again"
toast.error.network              "Mất kết nối mạng" / "Network connection lost"
toast.error.tagDuplicate         "Tag này đã tồn tại" / "This tag already exists"
toast.error.tagNotFound          "Không tìm thấy tag" / "Tag not found"
toast.error.unauthorized         "Phiên đăng nhập hết hạn" / "Session expired"
toast.warning.offline            "Bạn đang ngoại tuyến" / "You are offline"
sidebar.tags.menu.edit           "Đổi tên & màu" / "Rename & recolor"
sidebar.tags.menu.delete         "Xóa tag" / "Delete tag"
tagPicker.empty                  "Chưa có tag" / "No tags yet"
tagPicker.emptyCreate            "Tạo tag mới?" / "Create a new tag?"
```

---

## E. Thứ tự triển khai

| Bước | Nội dung | Ghi chú |
|---|---|---|
| **1** | Toast system: `toastStore.ts` + `ToastContainer.tsx` + `Toast.tsx` | Dùng cho mọi feature sau |
| **2** | `services/api.ts` — Axios instance + auth interceptor | Nền cho mọi API call |
| **3** | Backend: `models/tag.py` → `schemas/tag.py` → `services/tags.py` → `routes/tags.py` → đăng ký router | |
| **4** | Migration: `alembic revision --autogenerate -m "M002_create_tags_table"` → `alembic upgrade head` | |
| **5** | Frontend: cài `@tanstack/react-query` + `axios`, setup `QueryClientProvider` trong `main.tsx` | |
| **6** | `services/tags.ts` + `hooks/useTags.ts` | |
| **7** | Chuyển `Sidebar` + `TagCreateModal` + `NoteEditor` + `NotesList` từ `useAppState()` → `useTags()` | Bỏ mock data |
| **8** | `TagEditModal` + `TagDeleteConfirm` + hover menu trên Sidebar tag items | |
| **9** | UX fixes: validate trùng tên (B1), click-outside picker (B2), xóa badge hardcode (B3), skeleton + error state (B5) | |
| **10** | I18n: thêm tất cả keys vào `vi.json` + `en.json` | |
| **11** | Verify: dark/light mode, mobile 375px, tất cả gate conditions | |
| **12** | Cập nhật tài liệu (mục F dưới) | |

---

## F. Gate conditions

- [ ] Tạo tag từ sidebar → modal đóng + tag hiện trong sidebar
- [ ] Sửa tên tag → tên cập nhật trong sidebar
- [ ] Sửa màu tag → dot color cập nhật
- [ ] Xóa tag → confirm dialog → tag biến khỏi sidebar
- [ ] Tạo tag trùng tên → inline error, không submit
- [ ] F5 → tag vẫn còn (DB persistent)
- [ ] 2 user khác nhau → tag độc lập
- [ ] Click tag 5 lần → tag đó nổi lên đầu sidebar (access_count sorting)
- [ ] Sidebar chưa có tag → empty state hiện đúng
- [ ] Sidebar đang load → skeleton shimmer
- [ ] API lỗi → toast error hiện góc phải dưới
- [ ] Dark/Light: modal, toast, dropdown render đúng cả 2 theme
- [ ] Mobile 375px: modal không tràn, toast không che content

---

## G. Cập nhật tài liệu sau khi xong

Sau khi hoàn thành tất cả bước trên, **bắt buộc** cập nhật các file sau:

| File | Cần cập nhật |
|---|---|
| `information/api-spec.md` | Thêm 5 endpoint tag (`GET/POST/PATCH/DELETE /tags`, `POST /tags/:id/access`) |
| `information/database-schema.md` | Thêm bảng `tags` (columns, constraints, index) |
| `information/project-structure.md` | Thêm các file mới tạo (`models/tag.py`, `schemas/tag.py`, `services/tags.ts`, `hooks/useTags.ts`, `stores/toastStore.ts`, `components/ui/Toast*.tsx`, `TagEditModal.tsx`, `TagDeleteConfirm.tsx`) |
| `CLAUDE.md` | Cập nhật bảng "Trạng thái file" — thêm tất cả file mới với status `ready` |
| `.claude/memory/context.md` | Ghi pattern mới: TanStack Query cho data fetching, toast store pattern, tag access tracking |
| `ROADMAP.md` | Tick gate conditions Phase 2 Tag (các checkbox liên quan) |
| `HISTORY.md` | Thêm entry mới theo format chuẩn: mục tiêu, đã làm, files đã can thiệp |
| `PLAN.md` | Đánh dấu `done` hoặc xóa file sau khi hoàn thành |

---

## H. Files sẽ tạo mới (tóm tắt)

### Backend

- `backend/app/models/tag.py`
- `backend/app/schemas/tag.py`
- `backend/app/services/tags.py`
- `backend/app/api/v1/routes/tags.py`
- `backend/alembic/versions/M002_create_tags_table_*.py` (auto-generated)

### Frontend

- `frontend/src/services/api.ts`
- `frontend/src/services/tags.ts`
- `frontend/src/hooks/useTags.ts`
- `frontend/src/stores/toastStore.ts`
- `frontend/src/components/ui/ToastContainer.tsx`
- `frontend/src/components/ui/Toast.tsx`
- `frontend/src/components/TagEditModal.tsx`
- `frontend/src/components/TagDeleteConfirm.tsx`

### Files sẽ sửa

- `frontend/src/main.tsx` (thêm QueryClientProvider)
- `frontend/src/components/Sidebar.tsx` (useTags, hover menu, skeleton, xóa badge)
- `frontend/src/components/TagCreateModal.tsx` (API call, validate trùng)
- `frontend/src/pages/NoteEditor.tsx` (useTags, click-outside fix)
- `frontend/src/pages/NotesList.tsx` (useTags)
- `frontend/src/context/AppState.tsx` (bỏ tag logic, hoặc xóa nếu không còn dùng)
- `frontend/src/locales/vi.json` (thêm ~18 keys)
- `frontend/src/locales/en.json` (thêm ~18 keys)
- `backend/app/api/v1/router.py` (include tags_router)
- `frontend/package.json` (thêm dependencies)
