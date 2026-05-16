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

## 2026-05-12 — Tag CRUD fullstack + Toast system

**Pattern đã chốt:**

- `services/tags.py`: business logic trong service, route chỉ gọi service. ORDER BY `access_count DESC, created_at DESC` để tag hay dùng nổi lên trên.
- `UniqueConstraint('user_id', 'name')` — unique per user, không phải global. Trả 409 khi vi phạm.
- `track_access` endpoint riêng (POST `/{tag_id}/access`) — không tích hợp vào GET để giữ GET idempotent.
- Frontend: Zustand `toastStore` với auto-dismiss (4s warning/info, null cho error). Max 3 toasts.
- Toast container dùng `createPortal` render ra `document.body` — tránh bị clip bởi overflow parent.
- `useTags` hook = TanStack Query v5, `useCreateTag`/`useUpdateTag`/`useDeleteTag` mutations đều invalidate `['tags']` queryKey.
- COLOR_DOT map: key là color name string (`'amber'`), value là Tailwind class (`'bg-amber-400'`). Dùng fallback `?? 'bg-indigo-400'` khi color không hợp lệ.
- Axios instance (`services/api.ts`) với interceptor attach Supabase JWT — không fetch trực tiếp trong component.
- Vite proxy: KHÔNG dùng `rewrite` — rewrite strip `/api` prefix khiến backend nhận sai path.

**Lỗi cần nhớ:**
- `frontend/.env.local` có priority cao hơn `.env` → nếu tạo `.env.local` với key rỗng sẽ override key thật từ `.env`. Xóa `.env.local` sau khi debug xong.
- Python 3.14 không có prebuilt wheel cho pydantic-core → dùng Python 3.13 cho local venv (Render đã pin 3.12.7).

---

## 2026-05-13 — Optimistic Update + Offline Strategy (chuẩn mutation)

**Pattern đã chốt** cho mọi mutation trong Leafnote:

- `networkMode: 'offlineFirst'` — mutation vẫn chạy khi offline, TanStack Query tự pause và retry khi online lại
- `retry: (count, err) => err?.response?.status == null && count < 3` — chỉ retry network error, không retry 4xx
- `onMutate` → snapshot + optimistic update; `onError` → rollback; `onSettled` → invalidate (không dùng `onSuccess` cho invalidate nữa)
- Modal đóng ngay sau `mutate()` — không chờ server confirm; optimistic update đã cập nhật UI
- tmp ID lock: item `id.startsWith('tmp-')` → `pointer-events-none`, không render hover menu, không navigate

**Offline persistence**: Không dùng IndexedDB/localStorage queue ở phase 1 — TanStack Query built-in là đủ. Sẽ xem xét persist adapter khi có yêu cầu thực tế (phase 3+).

**Files áp dụng đầu tiên**: `frontend/src/hooks/useTags.ts`, 3 TagModal, `Sidebar.tsx` (TagItem).

---

## 2026-05-15 — Leaf Engine integration patterns

**Quyết định chính** (chi tiết: HISTORY.md cùng ngày):

- **Engine gateway agnostic provider**: backend đọc 3 env (`LEAF_ENGINE_URL/API_KEY/MODEL`), gọi OpenAI-compatible chat. Không bind Together/Claude/Qwen — user lo deploy + n8n + train. Khi swap model, không sửa code.
- **Replace-all + bảo toàn `user_edited`** khi regenerate leaves: xoá leaves `user_edited=False`, insert mới từ engine. Leaves user đã sửa được giữ nguyên. Đơn giản hơn diff/merge, không mất công sức user.
- **Quality gate runtime, retry 1 lần, threshold 0.75**: chấm Jaccard 5 metric (coverage/atomicity/no_duplicate/type_valid/granularity_floor). Fail → retry với `retry_hint(report)`. Lần 2 vẫn fail → 422 + `raw_leaves` cho FE quyết định, không commit. Tránh leaf rác vào DB.
- **Jaccard thay sentence-transformers**: tránh +200MB dep cho Render free tier. Có thể swap sang embedder sau nếu cần precision cao hơn.
- **`document_type = freeform` short-circuit**: backend không gọi engine, trả `[]`. UI ẩn nút "Tách lá", hiện hint.
- **Confidence < 0.6 → badge "AI uncertain"**: visible warning, không hide. User tự review.
- **Trigger manual button**, không auto sau save. Tránh tốn token + cho user chủ động chọn thời điểm note "chín".
- **OpenAI-compatible response tolerant**: parser nhận cả JSON array thuần và `{leaves: [...]}` / `{items}` / `{data}` / `{result}` — provider khác nhau wrap khác nhau.

**Pattern cho FE mutation engine call**:
- `networkMode: 'online'` (không offlineFirst — engine cần gọi thật, không queue offline).
- Toast riêng cho 502 (`engine.unavailable`) vs 422 (`engine.lowQuality`) vs other (`error.generic`).
- `regen.data?.quality.total` hiển thị % cho user thấy độ chắc — minh bạch không hộp đen.

---

## 2026-05-14 — Tách kết nối DB: Transaction Pooler (app) + Session Pooler (migration)

**Quyết định:** Backend dùng **hai connection string** thay vì một.

- `DATABASE_URL` → Supabase Transaction Pooler (port `6543`, pgbouncer transaction mode). Dùng cho FastAPI runtime — chịu được high concurrency.
- `DATABASE_DIRECT_URL` → Supabase Session Pooler (port `5432`). Dùng riêng cho Alembic migrations — hỗ trợ prepared statements và DDL.

**Lý do:** asyncpg luôn `PREPARE` mỗi câu lệnh; với transaction pooler, server connection bị reuse khiến tên prepared statement mặc định (`__asyncpg_stmt_N__`) đụng nhau → `DuplicatePreparedStatementError`. Chỉ set `statement_cache_size=0` không đủ.

**Pattern fix cho engine app:**
```python
connect_args={
    "ssl": "require",
    "statement_cache_size": 0,
    "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4().hex}__",
}
```
Tên unique mỗi câu lệnh → không bao giờ collision dù pgbouncer reuse connection.

**Quyết định kèm theo: bỏ migration khỏi app startup.**

- Xóa `_run_migrations()` trong `lifespan` của `main.py`.
- Migration chạy như deploy step riêng. Trên Render (free tier không có Pre-Deploy Command), đặt **Build Command**: `pip install -r backend/requirements.txt && cd backend && alembic upgrade head`.
- Migration fail = deploy fail = phiên bản cũ vẫn chạy → an toàn hơn crash app.

**Tooling:** `backend/scripts/check_env.py` verify env vars không in secret. Chạy `python -m scripts.check_env` từ `backend/`.

**Files chính:** `backend/app/core/{config,database,auth}.py`, `backend/app/main.py`, `backend/alembic/env.py`, `backend/.env.example`, `backend/scripts/check_env.py`.
