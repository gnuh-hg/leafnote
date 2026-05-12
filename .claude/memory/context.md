# Context — Leafnote

## 2026-05-04 — Chuyển phase: `pre-project` → `scaffolding`

Tất cả tài liệu nền đã hoàn thành. Quyết định lớn được chốt trước khi vào code:

- **Web only**: bỏ hoàn toàn React Native / Expo mobile. Các tính năng voice, OCR, recall feed sẽ làm trên web (MediaRecorder API, file upload).
- **Cấu trúc đơn giản**: `backend/` + `frontend/` — không cần pnpm workspaces vì chỉ có 1 frontend.

Các quyết định còn lại được hoãn có chủ ý:

- LLM provider (OpenAI vs Anthropic) → chốt khi bắt tay M3 (Leaf Engine).
- pgvector HNSW test → làm spike trong M1.

Next milestone: **M1 — Scaffolding**. Gate: `/health` 200, web Vercel mở được + đăng nhập Supabase Auth, CI xanh.

---

## 2026-05-06 — Hạ tầng deploy xong

**Vercel (frontend):**
- Project: `leafnote-vn` → `https://leafnote-vn.vercel.app`
- Quirk: Vercel UI không hiện `frontend/` trong directory picker (chỉ thấy `information/`). Fix: giữ Root Directory là `./`, override build commands thủ công:
  - Build: `cd frontend && npm run build`
  - Output: `frontend/dist`
  - Install: `cd frontend && npm install`

**Supabase:**
- Project ref: `thaeibqktfnobjthjzvm`
- URL: `https://thaeibqktfnobjthjzvm.supabase.co`
- Dùng **Publishable key** (`sb_publishable_...`) thay anon key cũ — Supabase đã đổi UI
- pgvector đã bật
- Redirect URL đã thêm: `https://leafnote-vn.vercel.app/**`

**Render (backend):**
- Service: `leafnote-api`
- Python pinned 3.12.7 (file `backend/.python-version`) — Python 3.14 không có prebuilt wheel cho pydantic-core
- `/health` endpoint đang chạy

**Trạng thái:** Scaffolding infra xong. Bước tiếp: code Phase 1 — Auth.

---

## 2026-05-07 — Migration hoàn tất: demo → production frontend

**Trạng thái:** ✅ Tất cả 10 phần hoàn thành. `leafnote/frontend/` là bản production đầy đủ.

Toàn bộ UI từ `leafnote-demo/` đã được chuyển sang `leafnote/frontend/src/`:
- 11 file `.tsx` (3 components + 6 pages + App.tsx + AppState)
- ~240 i18n keys vi+en đồng bộ
- Terminology: atom → leaf hoàn toàn
- Design-system compliant: không còn `bg-white` trong component mới

**Pattern đã chốt (dùng lại cho feature code sau này):**
- `TYPE_STYLES` trong `LeafCard.tsx`: `label` là i18n key, caller dùng `t(T.label)`
- Empty state: mọi view data-dependent cần 2 state (main empty + filter empty)
- URL-based filter state: dùng `useSearchParams` thay vì `useState` cho filter tag
- Signals/Adaptations trong Insights: hardcode qua i18n key (không cần mockData)

**Bước tiếp:** Phase 1 — Auth (Supabase login flow, protected routes)

---

## 2026-05-07 — Phase 1 Auth hoàn thành

**Pattern đã chốt:**
- Zustand store cho global state (auth, session) — không dùng React Context cho state phức tạp
- Auth middleware: `get_current_user` dependency dùng `python-jose` decode Supabase JWT
- `get_or_create_user` pattern: first login → sync user từ Supabase vào DB nội bộ
- `useOnlineStatus` hook: detect online/offline, reusable cho toàn app
- Auth page layout: split-screen desktop + centered card mobile
- Supabase client fallback: placeholder values khi env vars chưa set (không crash)

**Bước tiếp:** Phase 1 — Note (CRUD note cơ bản)

---

## 2026-05-08 — Tích hợp GitNexus

**Quyết định**: Dùng GitNexus làm code intelligence layer cho toàn bộ quá trình phát triển.

**Workflow bắt buộc**:
- `gitnexus_impact` trước khi sửa bất kỳ symbol nào
- `gitnexus_detect_changes` trước khi commit
- Cảnh báo user nếu risk HIGH hoặc CRITICAL

**Index hiện tại**: 606 symbols, 715 relationships, 1 execution flow (stale → chạy `npx gitnexus analyze`).

---

## 2026-05-11 — Tích hợp everything-claude-code

**Quyết định**: Tích hợp các tài nguyên AI bổ sung (agents, skills, configs) từ project `everything-claude-code` vào cấu trúc `.claude/` của Leafnote.
**Mục tiêu**: Nâng cao năng lực của Claude trong việc hiểu và tương tác với codebase, cung cấp các công cụ và hướng dẫn chuyên biệt cho các tác vụ phức tạp.
**Cách thức**: Các file được tổ chức lại một cách ngữ nghĩa trong thư mục `.claude/ecc_collection/`, với các thư mục con như `agents/`, `skills/`, `configs/`, v.v. để phân loại rõ ràng. Tài liệu đi kèm được chuyển vào `information/ecc-project-docs/`.
