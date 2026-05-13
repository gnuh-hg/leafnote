# HISTORY — Leafnote

> Lịch sử các plan đã thực hiện: ngày bắt đầu, mục tiêu, việc đã làm, và các file đã can thiệp.

Mỗi entry tương ứng một phase hoặc một task lớn đã hoàn thành.

---

## 2026-05-13 — Mobile UI: Bottom Navigation

**Mục tiêu**: Thay thế sidebar drawer (trượt từ trái) bằng bottom navigation bar trên mobile. Sidebar giữ nguyên trên desktop (`md:`+). Bottom nav có 5 nav item chính + nút `...` mở bottom sheet chứa Tags và Logout.

**Đã làm**:
- Tạo `BottomNav.tsx`: fixed bottom bar, mobile-only (`md:hidden`), 6 slots (5 NavLink + `...`), active state emerald, safe area support
- Tạo `MobileMoreSheet.tsx`: bottom sheet qua `createPortal`, chứa danh sách tags, tạo tag mới (mở TagCreateModal), logout
- `App.tsx`: xóa drawer logic (sidebarOpen state, overlay), thêm `<BottomNav />`, thêm `pb-16 md:pb-0` vào `<main>`
- `Sidebar.tsx`: đơn giản hóa về `hidden md:flex`, xóa open/onClose props và close button mobile
- `TopBar.tsx`: xóa hamburger button, hiện avatar trên mobile (`w-7 h-7`)
- `ToastContainer.tsx`: nâng `z-[60]`, dịch lên `bottom-20` trên mobile (tránh bị BottomNav che)
- `ReviewFeed.tsx`, `KnowledgeGraph.tsx`: fix responsive padding
- `locales/vi.json`, `locales/en.json`: thêm key `bottomNav.more`

**Files đã can thiệp**:
- `frontend/src/components/BottomNav.tsx` — tạo mới
- `frontend/src/components/MobileMoreSheet.tsx` — tạo mới
- `frontend/src/App.tsx` — sửa AppShell
- `frontend/src/components/Sidebar.tsx` — desktop-only
- `frontend/src/components/TopBar.tsx` — xóa hamburger
- `frontend/src/components/ui/ToastContainer.tsx` — z-index + position mobile
- `frontend/src/pages/ReviewFeed.tsx` — responsive padding
- `frontend/src/pages/KnowledgeGraph.tsx` — responsive padding
- `frontend/src/locales/vi.json`, `frontend/src/locales/en.json` — i18n key

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

## 2026-05-08 — Tích hợp GitNexus code intelligence

**Mục tiêu**: Đưa GitNexus vào workflow để có impact analysis, code navigation, và blast-radius check trước khi sửa code.

**Đã làm**:

- Index repo leafnote với GitNexus: 606 symbols, 715 relationships, 1 execution flow
- Tạo 6 skill files trong `.claude/skills/gitnexus/`: exploring, debugging, impact-analysis, refactoring, cli, guide
- Cập nhật `.claude/settings.local.json`: thêm permissions cho MCP GitNexus tools
- Tạo `AGENTS.md` và `.gitnexusignore`
- Cập nhật `CLAUDE.md`: thêm section GitNexus với quy tắc bắt buộc (impact trước khi edit, detect_changes trước khi commit)

**Files đã can thiệp**:

- `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` — tạo mới
- `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` — tạo mới
- `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` — tạo mới
- `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` — tạo mới
- `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` — tạo mới
- `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` — tạo mới
- `.claude/settings.local.json` — sửa (thêm MCP permissions)
- `AGENTS.md` — tạo mới
- `.gitnexusignore` — tạo mới
- `CLAUDE.md` — sửa (thêm GitNexus section + status table)

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

---

## 2026-05-11 — Tích hợp everything-claude-code vào .claude/

**Mục tiêu**: Tích hợp project everything-claude-code vào cấu trúc .claude/ hiện có mà không gây xung đột, đảm bảo các tài nguyên AI bổ sung sẵn sàng cho Claude, với cấu trúc tổ chức rõ ràng hơn.

**Đã làm**:

- Tạo thư mục `ecc_collection/` trong `.claude/` để chứa tất cả tài nguyên từ everything-claude-code, cùng các thư mục con phân loại theo chức năng (`agents/`, `skills/`, `configs/`, v.v.).
- Chuyển các file từ `temp/everything-claude-code/.claude/` và các thư mục cấp cao của everything-claude-code vào các thư mục `ecc_collection/` tương ứng.
- Chuyển tất cả các file `.md` và `agent.yaml` từ thư mục gốc của `temp/everything-claude-code/` vào `information/ecc-project-docs/`.
- Xóa thư mục tạm `temp/everything-claude-code/` và các thư mục `ecc/` và `ecc_top_level/` tạm thời đã tạo trước đó.
- Cập nhật `CLAUDE.md` và `HISTORY.md` để phản ánh cấu trúc mới.

**Files đã can thiệp**:

- `CLAUDE.md` — sửa (cập nhật đường dẫn file mới)
- `HISTORY.md` — sửa (cập nhật entry này)
- `.claude/ecc_collection/` — tạo mới (và chứa tất cả các file từ everything-claude-code)
- `information/ecc-project-docs/` — tạo mới (và chứa các file `.md` và `agent.yaml` từ everything-claude-code)
- Các thư mục cũ: `.claude/commands/ecc/`, `.claude/enterprise/ecc/`, `.claude/homunculus/ecc/`, `.claude/research/ecc/`, `.claude/rules/ecc/`, `.claude/skills/ecc/`, `.claude/team/ecc/`, `.claude/ecc_configs/`, `.claude/agents/ecc_top_level/`, `.claude/hooks/ecc_top_level/`, `.claude/skills/ecc_top_level/`, `.claude/workflows/ecc_top_level/` — đã xóa.

---

## 2026-05-11 — Thay thế ECC bằng bộ agent và skill thiết kế riêng cho Leafnote

**Mục tiêu**: Xóa bỏ tích hợp everything-claude-code chưa hoàn chỉnh (chỉ có file rỗng/placeholder), thay bằng bộ agents và skills được viết đặc biệt theo convention và workflow của Leafnote.

**Đã làm**:

- Xóa toàn bộ `ecc_collection/`, `information/ecc-project-docs/` và các thư mục ECC cũ
- Tạo 8 agent files trong `.claude/agents/`: `architect`, `coder`, `optimizer`, `python-reviewer`, `reviewer`, `security-reviewer`, `tdd-guide`, `typescript-reviewer` — mỗi agent có description, context Leafnote, và tool set cụ thể
- Tạo `skills/coding/backend-patterns.md` (FastAPI + SQLAlchemy async patterns)
- Tạo `skills/coding/browser-qa/` (UI testing workflow)
- Tạo `skills/content/`, `skills/product/`, `skills/coding/debug.md`, `skills/coding/generate-code.md`, `skills/coding/optimize.md`
- Tạo `skills/gemini-delegation.md` và `skills/task-planner.md` (Manager Protocol)
- Tạo `commands/delegate.md` (/delegate slash command), `hooks/` (pre-gen, post-gen, validation)
- Tạo `GEMINI.md` và `.gemini/` folder cho Gemini worker workflow
- Cập nhật `CLAUDE.md`: thêm Manager Protocol, bảng agent, bảng skills
- Cập nhật `AGENTS.md`: cấu hình GitNexus với danh sách agent mới

**Files đã can thiệp**:

- `.claude/agents/architect.md` — tạo mới
- `.claude/agents/coder.md` — tạo mới
- `.claude/agents/optimizer.md` — tạo mới
- `.claude/agents/python-reviewer.md` — tạo mới
- `.claude/agents/reviewer.md` — tạo mới
- `.claude/agents/security-reviewer.md` — tạo mới
- `.claude/agents/tdd-guide.md` — tạo mới
- `.claude/agents/typescript-reviewer.md` — tạo mới
- `.claude/commands/delegate.md` — tạo mới
- `.claude/hooks/post-gen.md`, `pre-gen.md`, `validation.md` — tạo mới
- `.claude/skills/coding/backend-patterns.md` — tạo mới
- `.claude/skills/coding/browser-qa/` — tạo mới
- `.claude/skills/gemini-delegation.md` — tạo mới
- `.claude/skills/task-planner.md` — tạo mới
- `GEMINI.md` — tạo mới
- `.gemini/` — tạo mới
- `CLAUDE.md` — sửa (Manager Protocol, bảng trạng thái file)
- `AGENTS.md` — sửa (cập nhật danh sách agents)
- `information/project-structure.md` — sửa (cập nhật .claude/ section)

---

## 2026-05-11 — Thêm logo chính thức và cập nhật UI branding

**Mục tiêu**: Đưa logo chính thức (bản không nền) vào frontend và thay thế icon placeholder trong các component BrandingPanel và Sidebar.

**Đã làm**:

- Thêm `logo-leafnote-nobackground.png` vào `frontend/src/assets/images/`
- Cập nhật `BrandingPanel.tsx`: thay icon SVG placeholder bằng `<img>` dùng logo PNG
- Cập nhật `Sidebar.tsx`: thay icon placeholder bằng logo PNG trong header sidebar

**Files đã can thiệp**:

- `frontend/src/assets/images/logo-leafnote-nobackground.png` — thêm mới
- `frontend/src/components/auth/BrandingPanel.tsx` — sửa
- `frontend/src/components/Sidebar.tsx` — sửa

---

## 2026-05-12 — Tag CRUD Fullstack + Toast System + UX Fixes

**Mục tiêu**: Kết nối Tag từ mock data sang API thật (backend + frontend). Thêm toast notification system. Sửa vite proxy bug + auth bug.

**Đã làm**:

- Backend: `Tag` model (UniqueConstraint user_id+name), schemas (TagCreate/Update/Out, VALID_COLORS, strip/lowercase name), service layer (list sort by access_count, 409 on duplicate, track_access), routes (5 endpoints), Alembic migration `2dd55bfa6698_m002_create_tags_table`
- Frontend: Zustand `toastStore` (auto-dismiss 4s, max 3, error persistent), `Toast.tsx` + `ToastContainer.tsx` (createPortal), Axios instance với Supabase JWT interceptor, `services/tags.ts`, `hooks/useTags.ts` (TanStack Query v5), `TagEditModal.tsx`, `TagDeleteConfirm.tsx`
- Sidebar rewrite: dùng `useTags()` thay mock, TagListSkeleton, hover MoreHorizontal menu (edit/delete), error state với retry
- NotesList + NoteEditor: thay `useAppState` bằng `useTags`, fix `tg.noteCount` → `tg.note_count`, COLOR_DOT mapping
- TagCreateModal: dùng `useCreateTag` mutation, client-side duplicate check, isPending state
- Sửa Vite proxy rewrite bug (rewrite strip `/api` prefix → backend nhận sai path)
- Sửa auth bug: `.env.local` rỗng override `.env` thật → xóa `.env.local`
- Setup local venv với Python 3.13 (3.14 không có pydantic-core wheel)
- Thêm ~20 i18n keys (vi.json + en.json): tagEdit, tagDelete, tag.error/action, toast, tagPicker, sidebar.tags.menu

**Files đã can thiệp**:

- `backend/app/models/tag.py` — tạo mới
- `backend/app/schemas/tag.py` — tạo mới
- `backend/app/services/tags.py` — tạo mới
- `backend/app/api/v1/routes/tags.py` — tạo mới
- `backend/app/api/v1/router.py` — sửa (include tags router)
- `backend/alembic/env.py` — sửa (import Tag model)
- `backend/alembic/versions/2dd55bfa6698_m002_create_tags_table.py` — tạo mới
- `frontend/src/stores/toastStore.ts` — tạo mới
- `frontend/src/components/ui/Toast.tsx` — tạo mới
- `frontend/src/components/ui/ToastContainer.tsx` — tạo mới
- `frontend/src/services/api.ts` — tạo mới
- `frontend/src/services/tags.ts` — tạo mới
- `frontend/src/hooks/useTags.ts` — tạo mới
- `frontend/src/components/TagEditModal.tsx` — tạo mới
- `frontend/src/components/TagDeleteConfirm.tsx` — tạo mới
- `frontend/src/main.tsx` — sửa (QueryClientProvider, xóa AppStateProvider)
- `frontend/src/components/Sidebar.tsx` — viết lại (useTags, hover menu, skeleton)
- `frontend/src/components/TagCreateModal.tsx` — sửa (useCreateTag, isPending)
- `frontend/src/pages/NoteEditor.tsx` — sửa (useTags, COLOR_DOT, click-outside)
- `frontend/src/pages/NotesList.tsx` — sửa (useTags, COLOR_DOT, note_count)
- `frontend/src/context/AppState.tsx` — gut (giữ export rỗng)
- `frontend/src/locales/vi.json` — sửa (~20 keys mới)
- `frontend/src/locales/en.json` — sửa (~20 keys mới)
- `frontend/vite.config.ts` — sửa (xóa rewrite sai)
- `.claude/memory/mistakes.md` — sửa (Gemini CLI agent mode + .env.local)
- `CLAUDE.md` — sửa (bảng trạng thái file)
- `information/api-spec.md` — sửa (thêm Tags endpoints)
- `information/database-schema.md` — sửa (thêm bảng tags)
- `.claude/memory/context.md` — sửa (patterns mới)
- `ROADMAP.md` — sửa (tick gate Tag system)

---

## 2026-05-12 — Build Master Workflow System

**Mục tiêu**: Thống nhất toàn bộ skills/agents/workflows vào một điểm vào duy nhất, hoàn thiện các workflows còn trống, và tạo bảng trigger→update đầy đủ cho post-task documentation.

**Đã làm**:
- Tạo `master.md` — điểm vào duy nhất cho mọi task, gồm: phân loại 6 loại task, 100-Token Rule routing, bước 2A–2F chi tiết theo task type, bảng post-task checklist 17 trigger, xử lý công việc dang dở, và bản đồ toàn hệ thống (skills/agents/workers)
- Viết đầy đủ `fix-bug.md` (trước đó trống) — 7 bước debug: reproduce → isolate → root cause → fix → verify → document → post-task; bảng common root causes Leafnote
- Viết đầy đủ `ship-product.md` (trước đó trống) — 9 bước deploy: gate check → quality gate → security → QA → gitnexus → deploy (thứ tự migration→backend→frontend) → post-deploy verify → document → rollback protocol
- Thêm structure cho `mistakes.md` và `patterns.md` (trước đó trống); migrate 5 patterns đã chốt từ `context.md` vào `patterns.md`
- Cập nhật `CLAUDE.md`: section "Hành vi Claude" trỏ về `master.md`, bảng trạng thái file cập nhật, bảng tham khảo nhanh thêm dòng `master.md`
- Thêm deprecation note vào `pre-flight.md` — routing chuyển về `master.md`, Bước 2 (code rules) giữ nguyên là reference

**Files đã can thiệp**:
- `.claude/workflows/master.md` — tạo mới
- `.claude/workflows/fix-bug.md` — viết nội dung (từ file trống)
- `.claude/workflows/ship-product.md` — viết nội dung (từ file trống)
- `.claude/workflows/pre-flight.md` — sửa (thêm deprecation note đầu file)
- `.claude/memory/mistakes.md` — viết nội dung (từ file trống)
- `.claude/memory/patterns.md` — viết nội dung (từ file trống)
- `CLAUDE.md` — sửa (3 chỗ: Hành vi Claude, bảng trạng thái, bảng tham khảo nhanh)
- `HISTORY.md` — sửa (entry này)

---

## 2026-05-13 — Optimistic Update + Offline Strategy cho Tag mutations

**Mục tiêu**: Xây dựng pattern chuẩn cho mọi mutation trong Leafnote — UI phản hồi ngay (không chờ server), offline hoạt động rõ ràng và có thể tái dùng cho notes/leaves sau.

**Đã làm**:
- `useTags.ts`: thêm `onMutate` (snapshot + optimistic update), `onError` (rollback), `onSettled` (invalidate) cho toàn bộ mutations. Thêm `networkMode: 'offlineFirst'` + retry chỉ network error
- `TagCreateModal`, `TagEditModal`, `TagDeleteConfirm`: đóng modal ngay sau `mutate()` — không chờ `onSuccess`
- `Sidebar.tsx` (`TagItem`): lock item có id `tmp-*` bằng `pointer-events-none` + pulse animation — bảo vệ khỏi edit/delete khi server chưa confirm
- `information/product-principles.md`: thêm "Principle 7 — Optimistic UX" và cập nhật Offline Support với phân tầng phase 1 vs phase 2+
- `.claude/memory/patterns.md`: template mutation hook tái dùng
- `.claude/memory/mistakes.md`: lỗi tmp ID lock
- `.claude/memory/context.md`: chốt quyết định pattern

**Files đã can thiệp**:
- `frontend/src/hooks/useTags.ts` — sửa (optimistic + offline)
- `frontend/src/components/TagCreateModal.tsx` — sửa (close ngay, xóa onCreated prop)
- `frontend/src/components/TagEditModal.tsx` — sửa (close ngay)
- `frontend/src/components/TagDeleteConfirm.tsx` — sửa (close ngay)
- `frontend/src/components/Sidebar.tsx` — sửa (tmp ID lock)
- `information/product-principles.md` — sửa (thêm Principle 7, cập nhật Offline)
- `.claude/memory/context.md` — sửa
- `.claude/memory/patterns.md` — sửa
- `.claude/memory/mistakes.md` — sửa
- `HISTORY.md` — sửa (entry này)
