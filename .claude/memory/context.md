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
