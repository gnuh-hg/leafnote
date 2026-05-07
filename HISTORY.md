# HISTORY — Leafnote

> Lịch sử các plan đã thực hiện: ngày bắt đầu, mục tiêu, việc đã làm, và các file đã can thiệp.

Mỗi entry tương ứng một phase hoặc một task lớn đã hoàn thành.

---

## 2026-05-04 — M1: Scaffolding

**Mục tiêu**: Dựng skeleton repo — backend + frontend chạy được "Hello world", có CI và auth Supabase.

**Đã làm**:

- Toàn bộ tài liệu nền trong `information/` (project-overview, architecture, features, user-stories, project-structure)
- Cấu trúc repo: `backend/` + `frontend/`, không dùng pnpm workspaces
- Backend FastAPI: endpoint `/health`, skeleton `core/`, `api/v1/`, Alembic init
- Frontend: React + Vite + Supabase Auth + routing cơ bản + trang `/me`
- CI GitHub Actions: lint + test stub + build

**Files đã can thiệp**:

- `backend/` — toàn bộ skeleton FastAPI
- `frontend/` — toàn bộ skeleton React + Vite
- `information/project-overview.md`, `information/architecture.md`, `information/features.md`
- `information/user-stories.md`, `information/project-structure.md`
- `information/database-schema.md`, `information/api-spec.md` (draft)
- `CLAUDE.md`, `ROADMAP.md`
- `.github/workflows/` — CI pipeline

---

## 2026-05-06 — Cập nhật tài liệu: HISTORY, quy ước .md, định hướng sản phẩm

**Mục tiêu**: Tổ chức lại tài liệu — tạo HISTORY.md, ghi ràng buộc header .md vào CLAUDE.md, tạo file định hướng sản phẩm.

**Đã làm**:

- Tạo `HISTORY.md` thay thế `CONTRIBUTING.md` rỗng
- Tạo `information/product-principles.md` chứa 7 định hướng sản phẩm cross-cutting
- Cập nhật `CLAUDE.md`: thêm quy ước header .md, cập nhật bảng trạng thái file, bảng tham khảo
- Cập nhật `ROADMAP.md`: resolve pending decision về i18n (EN+VI từ đầu, default VI)
- Thêm header `>` cho các file .md còn thiếu: `README.md`, `CHANGELOG.md`, `information/api-spec.md`, `information/database-schema.md`
- Xoá `CONTRIBUTING.md` (rỗng, không còn dùng)

**Files đã can thiệp**:

- `HISTORY.md` — tạo mới
- `information/product-principles.md` — tạo mới
- `CLAUDE.md` — sửa
- `ROADMAP.md` — sửa
- `README.md` — sửa (thêm header, cập nhật link)
- `CHANGELOG.md` — sửa (thêm header)
- `information/api-spec.md` — sửa (thêm header)
- `information/database-schema.md` — sửa (thêm header)

---

## 2026-05-06 — Rebrand mô tả sản phẩm: bỏ jargon, thống nhất thuật ngữ "leaf"

**Mục tiêu**: Thay toàn bộ ngôn ngữ khoa học ("phân rã tri thức nguyên tử", "atom") bằng ẩn dụ từ tên sản phẩm — cây (knowledge base) → cành (note) → lá/leaf (đơn vị tri thức).

**Đã làm**:

- Đổi one-liner sản phẩm ở 2 chỗ user-facing (README, project-overview): nay mô tả hành động tách lá thay vì cơ chế kỹ thuật
- Cập nhật ẩn dụ trong project-overview: "note = lá" → "note = cành, leaf = lá" cho đúng với tên Leafnote
- Sweep toàn bộ thuật ngữ "atom/atoms/atomic/hạt" → "leaf/leaves/lá" trên 10 file tài liệu (~74 chỗ)
- Đổi tên component/file trong project-structure: `AtomCard` → `LeafCard`, `atoms.py` → `leaves.py`, v.v.
- Đổi tên milestone: "M3 — Atomic Engine" → "M3 — Leaf Engine"

**Files đã can thiệp**:

- `README.md` — sửa (one-liner)
- `CLAUDE.md` — sửa (mô tả project + domain list)
- `ROADMAP.md` — sửa (Tầm nhìn, M3, M4)
- `information/project-overview.md` — sửa (one-liner, ẩn dụ, giải pháp, MVP scope)
- `information/product-principles.md` — sửa (3 chỗ)
- `information/features.md` — viết lại
- `information/architecture.md` — viết lại
- `information/project-structure.md` — viết lại
- `information/user-stories.md` — viết lại
- `.claude/memory/context.md` — sửa
- `CONTRIBUTING.md` — xoá

---

## 2026-05-06 — Setup hạ tầng deploy: Vercel + Supabase + Render

**Mục tiêu**: Dựng toàn bộ hạ tầng deploy để frontend và backend có URL thật, sẵn sàng code Phase 1.

**Đã làm**:

- Đổi tên thư mục `.frontend` / `.backend` → `frontend` / `backend` trong docs (dot-prefix bị Vercel ignore)
- Scaffold skeleton `frontend/` (React + Vite + TypeScript + Tailwind) và `backend/` (FastAPI + `/health`)
- Deploy **Vercel**: project `leafnote-vn` tại `https://leafnote-vn.vercel.app`
  - Quirk: Vercel UI không hiện `frontend/` trong directory picker → override build commands thủ công thay vì đổi Root Directory
- Setup **Supabase**: project ref `thaeibqktfnobjthjzvm`, bật pgvector, cấu hình redirect URL cho Vercel
  - Lưu ý: Supabase đổi UI mới — dùng Publishable key (`sb_publishable_...`) thay anon key cũ
- Deploy **Render**: service `leafnote-api`, `/health` endpoint chạy ổn
  - Fix build: pin Python 3.12.7 (Python 3.14 không có prebuilt wheel cho pydantic-core)
- Thêm env vars vào Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

**Files đã can thiệp**:

- `frontend/` — tạo mới (scaffold đầy đủ)
- `backend/` — tạo mới (scaffold đầy đủ)
- `backend/.python-version` — tạo mới (pin 3.12.7)
- `backend/requirements.txt` — cập nhật versions
- `information/project-structure.md` — đổi `.frontend`/`.backend` → `frontend`/`backend`
- `.claude/memory/context.md` — cập nhật trạng thái

---

## 2026-05-06 — Tạo design system documentation

**Mục tiêu**: Đưa toàn bộ ngôn ngữ thiết kế từ `leafnote-demo` vào tài liệu chính thức để mọi feature UI sau này đều nhất quán — không tự định nghĩa lại màu hay pattern.

**Đã làm**:

- Phân tích `leafnote-demo`: đọc `tailwind.config.js`, `index.css`, và 4 component (AtomCard, Sidebar, TopBar, AtomDetailModal) để trích xuất toàn bộ design token và pattern thực tế
- Tạo `information/design-system.md` ghi đầy đủ: bảng màu `paper-*`/`ink-*`/accent, màu riêng từng leaf type, font families, text scale, class `card-surface`/`glass-panel`/`pill`/`focus-ring`, nav active state, 3 loại button, input, animations, body background gradient, scrollbar, progress bar, editor highlight, checklist component mới
- Cập nhật `CLAUDE.md`: thêm `design-system.md` vào bảng trạng thái file + bảng tham khảo nhanh + rule đọc file này trước khi tạo component UI
- Cập nhật `information/project-structure.md`: thêm `design-system.md` vào danh sách `information/`

**Files đã can thiệp**:

- `information/design-system.md` — tạo mới
- `CLAUDE.md` — sửa (bảng trạng thái, bảng tham khảo, hành vi Claude)
- `information/project-structure.md` — sửa (thêm file vào danh sách)

---

## 2026-05-07 — Migration hoàn tất: leafnote-demo → leafnote/frontend

**Mục tiêu**: Chuyển toàn bộ UI từ bản demo (JSX, hardcode, atom terminology) sang repo chính thức (TSX, i18n vi+en, leaf terminology, design-system compliant).

**Đã làm** (10 phần theo MIGRATION-PLAN.md):

- **Phần 0**: Cấu hình Tailwind với paper-*/ink-* tokens, CSS globals (body gradient, scrollbar, animations, highlight)
- **Phần 1**: Setup react-i18next — vi.json + en.json, LanguageDetector, fallback EN, ~210 keys
- **Phần 2**: mockData.ts — đổi toàn bộ atom→leaf (detectedLeaves, linkedLeaves, newLeaves, totalLeaves, v.v.), thêm TypeScript interfaces đầy đủ
- **Phần 3**: App.tsx + routing, AppState context (tags + theme)
- **Phần 4**: Sidebar.tsx — nav active state, tag list, cognitive snapshot
- **Phần 5**: TopBar.tsx — search, theme toggle, engine status
- **Phần 6**: LeafCard.tsx (export TYPE_STYLES với label = i18n key), LeafDetailModal.tsx, TagCreateModal.tsx — fix 3 chỗ `bg-white` → `bg-paper-50`
- **Phần 7**: Dashboard.tsx — filter pills tái dùng `leaf.surface.*`, empty state, RetentionDist nhận `leafUnit` prop
- **Phần 8**: NotesList.tsx + NoteEditor.tsx (~530 dòng) — `atom-highlight` → `leaf-highlight`, `seg.atomType` → `seg.leafType`, tag picker bg fix
- **Phần 9**: KnowledgeGraph.tsx, ReviewFeed.tsx, Insights.tsx — TYPE_STYLES từ LeafCard, `linkedAtoms` → `linkedLeaves`, signals/adaptations i18n

**Thống kê**:

- 11 file `.tsx` tạo/thay thế (3 components + 6 pages + App.tsx + AppState context)
- ~240 i18n keys (vi.json + en.json đồng bộ)
- 0 chỗ `bg-white` còn sót trong component mới

**Files đã can thiệp**:

- `frontend/src/App.tsx` — wired tất cả routes thật
- `frontend/src/context/AppState.tsx` — tạo mới
- `frontend/src/components/Sidebar.tsx` — tạo mới
- `frontend/src/components/TopBar.tsx` — tạo mới
- `frontend/src/components/LeafCard.tsx` — tạo mới (export TYPE_STYLES)
- `frontend/src/components/LeafDetailModal.tsx` — tạo mới
- `frontend/src/components/TagCreateModal.tsx` — thay thế stub
- `frontend/src/pages/Dashboard.tsx` — tạo mới
- `frontend/src/pages/NotesList.tsx` — tạo mới
- `frontend/src/pages/NoteEditor.tsx` — tạo mới
- `frontend/src/pages/KnowledgeGraph.tsx` — tạo mới
- `frontend/src/pages/ReviewFeed.tsx` — tạo mới
- `frontend/src/pages/Insights.tsx` — tạo mới
- `frontend/src/data/mockData.ts` — atom→leaf rename toàn bộ
- `frontend/src/locales/vi.json` — ~240 keys
- `frontend/src/locales/en.json` — ~240 keys (mirror)
- `frontend/src/index.css` — paper-*/ink-* tokens, animations, highlight styles
- `frontend/tailwind.config.js` — custom colors + font families

---

## 2026-05-07 — Phase 1: Auth — Đăng nhập / Đăng ký

**Mục tiêu**: User đăng ký, đăng nhập, và vào app được. Route guard chặn truy cập khi chưa có session.

**Đã làm**:

- Backend: User model, auth middleware (verify Supabase JWT), `GET /me` + `PATCH /me` endpoints, database.py (AsyncSession + Base)
- Frontend: Supabase client setup, Zustand auth store, auth service wrapper
- Auth page: split-screen layout (desktop) + centered card (mobile), 2 tab đăng nhập/đăng ký
- Validation: inline errors, password strength meter (weak/medium/strong), confirm password real-time
- Route guard: ProtectedRoute component, redirect logic
- Sidebar: nút đăng xuất
- Offline: useOnlineStatus hook, banner offline trên auth page
- i18n: ~30 auth keys vi+en

**Files đã can thiệp**:

- `backend/app/core/database.py` — tạo mới
- `backend/app/models/user.py` — tạo mới
- `backend/app/models/__init__.py` — tạo mới
- `backend/app/schemas/auth.py` — tạo mới
- `backend/app/services/auth.py` — tạo mới
- `backend/app/core/auth.py` — tạo mới
- `backend/app/api/v1/routes/auth.py` — tạo mới
- `backend/app/api/v1/router.py` — tạo mới
- `backend/app/core/config.py` — sửa (thêm SUPABASE_JWT_SECRET)
- `backend/app/main.py` — sửa (include api_router)
- `frontend/src/lib/supabase.ts` — tạo mới
- `frontend/src/stores/authStore.ts` — tạo mới
- `frontend/src/services/auth.ts` — tạo mới
- `frontend/src/hooks/useOnlineStatus.ts` — tạo mới
- `frontend/src/pages/Auth.tsx` — tạo mới
- `frontend/src/components/auth/LoginForm.tsx` — tạo mới
- `frontend/src/components/auth/SignupForm.tsx` — tạo mới
- `frontend/src/components/auth/PasswordStrengthMeter.tsx` — tạo mới
- `frontend/src/components/auth/BrandingPanel.tsx` — tạo mới
- `frontend/src/components/auth/ProtectedRoute.tsx` — tạo mới
- `frontend/src/vite-env.d.ts` — tạo mới
- `frontend/package.json` — sửa (thêm zustand)
- `frontend/src/App.tsx` — sửa (routing + auth init + ProtectedRoute)
- `frontend/src/locales/vi.json` — sửa (thêm auth keys)
- `frontend/src/locales/en.json` — sửa (thêm auth keys)
- `frontend/src/components/Sidebar.tsx` — sửa (nút đăng xuất)
- `CLAUDE.md` — sửa (bảng trạng thái file)
- `.claude/memory/context.md` — sửa (ghi nhận auth pattern)
- `information/api-spec.md` — sửa (thêm auth endpoints)
- `information/database-schema.md` — sửa (thêm bảng users)
- `information/project-structure.md` — sửa (thêm file mới)
- `ROADMAP.md` — sửa (tick auth gates)
- `HISTORY.md` — sửa (thêm entry)

---

## 2026-05-07 — Lên plan migration: leafnote-demo → leafnote/frontend

**Mục tiêu**: Lập kế hoạch chuyển toàn bộ UI từ bản demo sang repo chính thức, chia thành 10 phần nhỏ có thể thực hiện tuần tự.

**Đã làm**:

- Phân tích toàn bộ 16 file source trong `leafnote-demo/src/` (6 pages, 5 components, 2 context, 1 data, 1 CSS, 1 entry)
- Xác định 6 chỗ vi phạm design-system (dùng `bg-white` thay vì `paper-*`, scrollbar sai màu)
- Lập dependency graph giữa các file → xác định thứ tự migration 10 phần
- Ước tính ~210 i18n keys cần tạo
- Tạo workflow `.claude/workflows/migrate-demo.md` — checklist 9 bước cho mỗi phần
- Tạo `MIGRATION-PLAN.md` — plan chi tiết đầy đủ context để thực hiện xuyên session

**Files đã can thiệp**:

- `MIGRATION-PLAN.md` — tạo mới
- `.claude/workflows/migrate-demo.md` — tạo mới
- `HISTORY.md` — sửa (thêm entry này)
- `.claude/memory/context.md` — sửa (cập nhật trạng thái)
