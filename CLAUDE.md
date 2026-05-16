# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

File này là bản đồ chính để Claude hiểu project. Đọc file này **trước** khi làm bất cứ việc gì.

---

## Project là gì?

**Leafnote** — Ứng dụng ghi chú thông minh. Tri thức của người dùng là một cái cây: mỗi note là một cành, AI tự tách ra thành những chiếc lá (leaf) nhỏ — mỗi lá có vòng đời riêng (retention + relevance), được surfacing lại đúng lúc người dùng cần.

Chi tiết: [`information/project-overview.md`](information/project-overview.md).

---

## Phase hiện tại

**`Phase 1 — Shell` (đang làm).** Auth Supabase đã xong. UI shell đầy đủ (Sidebar, TopBar, tất cả pages) đã scaffold với mock data. Gate còn lại: kết nối Notes CRUD thật với backend.

Xem chi tiết: [`ROADMAP.md`](ROADMAP.md).

> Hệ quả cho Claude:
>
> - Auth (login/signup/session/guard) đã xong — không cần làm lại.
> - Pages (`Dashboard`, `NotesList`, `NoteEditor`, `KnowledgeGraph`, `ReviewFeed`, `Insights`) đã scaffold bằng mock data trong `src/data/mockData.ts`.
> - Việc tiếp theo: thay mock data bằng API call thật qua `services/`, dùng TanStack Query.
> - Phase 2+ (Tags, Leaf engine, Review) — chưa làm, đừng thêm feature code chưa được yêu cầu.

---

## Commands

### Frontend

```powershell
cd frontend
npm install          # lần đầu
npm run dev          # dev server → http://localhost:5173
npm run build        # tsc + vite build
npm run lint         # ESLint (0 warnings policy)
npm run format       # Prettier
```

### Backend

```powershell
cd backend
# Kích hoạt venv (Windows)
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt  # lần đầu

# Chạy dev server
uvicorn app.main:app --reload     # → http://localhost:8000

# Migration
alembic upgrade head
alembic revision --autogenerate -m "description"

# Tests (khi có)
pytest
```

### Biến môi trường

Backend đọc từ `backend/.env`. Các key bắt buộc: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `SECRET_KEY`. Xem `backend/app/core/config.py` để biết toàn bộ danh sách.

---

## Trạng thái file (ground truth)

| File | Trạng thái | Ghi chú |
|---|---|---|
| `CLAUDE.md` | `ready` | File này |
| `ROADMAP.md` | `ready` | Phase hiện tại + lộ trình |
| `README.md` | `chưa tạo` | Viết khi có cách chạy thật |
| `CHANGELOG.md` | `chưa tạo` | Sau release đầu |
| `HISTORY.md` | `ready` | Lịch sử plan đã thực hiện |
| `information/project-overview.md` | `ready` | Concept & MVP scope |
| `information/project-structure.md` | `ready` | Cấu trúc đích |
| `information/architecture.md` | `ready` | Kiến trúc + tech stack |
| `information/features.md` | `ready` | Catalog tính năng F-01…F-20 |
| `information/user-stories.md` | `ready` | Pre-project đã chốt |
| `information/database-schema.md` | `draft` | High-level |
| `information/api-spec.md` | `draft` | High-level |
| `information/leaf-engine-training.md` | `ready` | Fine-tune Qwen2.5-7B cho Leaf Engine — synthetic data pipeline |
| `information/product-principles.md` | `ready` | 7 định hướng sản phẩm cross-cutting |
| `information/design-system.md` | `ready` | Màu sắc, typography, component pattern — nguồn chân lý UI |
| `information/runbooks/` | `chưa cần` | Sau khi deploy |
| `.claude/memory/context.md` | `ready` | Quyết định đã chốt + lý do |
| `.claude/memory/mistakes.md` | `ready` | Lỗi đã gặp cần tránh lại |
| `.claude/memory/patterns.md` | `ready` | Pattern đã rút ra để tái dùng |
| `MIGRATION-PLAN.md` | `done` | Migration hoàn tất — 10/10 phần xong |
| `.claude/workflows/migrate-demo.md` | `done` | Workflow đã dùng xong |
| `.claude/workflows/master.md` | `ready` | Điểm vào duy nhất cho mọi task — routing + post-task checklist |
| `.claude/workflows/pre-flight.md` | `ready` | Code rules chi tiết (Bước 2) — reference khi cần nhắc lại |
| `.claude/workflows/fix-bug.md` | `ready` | Workflow debug có hệ thống |
| `.claude/workflows/ship-product.md` | `ready` | Checklist trước khi deploy lên production |
| `.claude/workflows/build-feature.md` | `ready` | Workflow build feature fullstack |
| `backend/` | `phase2-leaves` | FastAPI + auth + Tag/Note CRUD + Leaf engine + quality gate |
| `backend/app/models/note.py` | `ready` | Note model + bảng nối `note_tags` |
| `backend/app/schemas/note.py` | `ready` | NoteCreate/Update/ListItem/Out |
| `backend/app/services/notes.py` | `ready` | Note CRUD + filter tag + flatten plain_text |
| `backend/app/api/v1/routes/notes.py` | `ready` | 5 endpoint: list/get/create/update/delete |
| `backend/alembic/versions/m004_create_notes_table.py` | `ready` | Migration tạo `notes` + `note_tags` |
| `future.md` | `ready` | Tính năng đã scope nhưng dời sau (leaf AI, media, search...) |
| `backend/app/models/user.py` | `ready` | User model (SQLAlchemy) |
| `backend/app/models/tag.py` | `ready` | Tag model (UniqueConstraint user_id+name) |
| `backend/app/schemas/auth.py` | `ready` | Pydantic schemas (UserOut, UserUpdate) |
| `backend/app/schemas/tag.py` | `ready` | TagCreate/Update/Out, VALID_COLORS |
| `backend/app/services/auth.py` | `ready` | Auth business logic |
| `backend/app/services/tags.py` | `ready` | Tag CRUD + track_access (sort by access_count) |
| `backend/app/core/auth.py` | `ready` | JWT verify (ES256+JWKS / HS256 legacy), JWKS cache TTL 10', verify `iss` |
| `backend/app/core/database.py` | `ready` | AsyncSession + Base, `prepared_statement_name_func` cho transaction pooler |
| `backend/app/core/config.py` | `ready` | `DATABASE_URL` (pooler 6543) + `DATABASE_DIRECT_URL` (pooler 5432) |
| `backend/app/main.py` | `ready` | FastAPI app — migration **không** chạy trong lifespan |
| `backend/alembic/env.py` | `ready` | Migration dùng `DATABASE_DIRECT_URL` (session pooler 5432) |
| `backend/scripts/check_env.py` | `ready` | Verify env vars + live probe DB/JWKS, không in secret |
| `backend/app/api/v1/routes/auth.py` | `ready` | GET/PATCH /auth/me |
| `backend/app/api/v1/routes/tags.py` | `ready` | 5 endpoints: list/create/update/delete/access |
| `backend/app/api/v1/router.py` | `ready` | API router aggregator (notes + tags + leaves) |
| `backend/app/models/leaf.py` | `ready` | Leaf model: type/content/metadata/confidence/user_edited |
| `backend/app/models/leaf_feedback.py` | `ready` | LeafFeedback model (rating up/down) |
| `backend/app/schemas/leaf.py` | `ready` | LeafEngineItem/Out/Update + QualityReport + RegenerateResponse |
| `backend/app/services/leaf_engine.py` | `ready` | Gateway gọi LLM endpoint OpenAI-compatible, 6 prompt theo doc_type |
| `backend/app/services/leaf_quality.py` | `ready` | Jaccard scorer (coverage/atomicity/duplicate/type/granularity) + retry hint |
| `backend/app/services/leaves.py` | `ready` | CRUD leaves + regenerate orchestrator (replace-all + bảo toàn user_edited) |
| `backend/app/api/v1/routes/leaves.py` | `ready` | 5 endpoints: list/regenerate/update/delete/feedback |
| `backend/alembic/versions/m005_add_note_document_type.py` | `ready` | Add cột Note.document_type với CHECK constraint |
| `backend/alembic/versions/m006_create_leaves_table.py` | `ready` | Tạo bảng `leaves` + `leaf_feedback` |
| `backend/scripts/eval_engine.py` | `ready` | Regression test engine trên fixture set, so vs baseline |
| `backend/tests/fixtures/seed_all_doctypes.jsonl` | `ready` | 10 example seed (Vi/En/mix, 6 doc types) |
| `information/leaf-engine-contract.md` | `ready` | Contract giữa backend và LLM endpoint (OpenAI-compatible) |
| `frontend/eslint.config.js` | `ready` | ESLint v9 flat config — TS parser + react-hooks |
| `gnuh_task.md` | `ready` | Checklist user phải làm tay: account/key, sinh data n8n, train Qwen, deploy Together, eval |
| `frontend/` | `phase2-leaves` | UI đầy đủ + auth + Tag/Note/Leaf CRUD + engine integration |
| `frontend/src/pages/Auth.tsx` | `ready` | Auth page (login/signup tabs) |
| `frontend/src/stores/authStore.ts` | `ready` | Zustand auth store |
| `frontend/src/stores/toastStore.ts` | `ready` | Toast store (auto-dismiss, max 3) |
| `frontend/src/services/auth.ts` | `ready` | Supabase auth wrapper |
| `frontend/src/services/api.ts` | `ready` | Axios instance + Supabase JWT interceptor |
| `frontend/src/services/tags.ts` | `ready` | Tag API calls + COLOR_DOT map |
| `frontend/src/lib/supabase.ts` | `ready` | Supabase client |
| `frontend/src/hooks/useOnlineStatus.ts` | `ready` | Online/offline detection hook |
| `frontend/src/hooks/useTags.ts` | `ready` | TanStack Query hooks cho Tag CRUD |
| `frontend/src/components/auth/*` | `ready` | LoginForm, SignupForm, ProtectedRoute, BrandingPanel, PasswordStrengthMeter |
| `frontend/src/components/ui/Toast.tsx` | `ready` | Toast component (slide-in, error/warning/info) |
| `frontend/src/components/ui/ToastContainer.tsx` | `ready` | createPortal toast container |
| `frontend/src/components/Sidebar.tsx` | `ready` | Sidebar với useTags(), hover menu, skeleton |
| `frontend/src/components/TopBar.tsx` | `ready` | Top bar |
| `frontend/src/components/LeafCard.tsx` | `ready` | Card hiển thị leaf |
| `frontend/src/components/LeafDetailModal.tsx` | `ready` | Modal chi tiết leaf |
| `frontend/src/components/TagCreateModal.tsx` | `ready` | Modal tạo tag (real API) |
| `frontend/src/components/TagEditModal.tsx` | `ready` | Modal sửa tag |
| `frontend/src/components/TagDeleteConfirm.tsx` | `ready` | Confirm xóa tag |
| `frontend/src/components/BottomNav.tsx` | `ready` | Bottom navigation bar (mobile-only, md:hidden) — 5 NavLink + nút `...` |
| `frontend/src/components/MobileMoreSheet.tsx` | `ready` | Bottom sheet từ nút `...`: Tags list, tạo tag, logout |
| `frontend/src/components/MobileInsightSheet.tsx` | `ready` | Bottom sheet mobile cho NoteEditor — tab Engine/Leaves/Insights, dùng live components |
| `frontend/src/services/leaves.ts` | `ready` | 5 API calls leaves + types |
| `frontend/src/hooks/useLeaves.ts` | `ready` | TanStack Query: useLeaves/Regenerate/Update/Delete/Feedback |
| `frontend/src/components/DocumentTypePicker.tsx` | `ready` | Dropdown chọn document_type cho note |
| `frontend/src/components/LeafItem.tsx` | `ready` | Card 1 leaf với type badge + uncertain warning + edit/delete |
| `frontend/src/components/LeafEditModal.tsx` | `ready` | Modal sửa type + content của leaf (createPortal) |
| `frontend/src/components/LeavesPanelLive.tsx` | `ready` | LiveEnginePanel + LiveLeavesPanel — kết nối API thật |
| `frontend/src/pages/Dashboard.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/NotesList.tsx` | `ready` | Real notes qua useNotes, filter tag qua URL |
| `frontend/src/pages/NoteEditor.tsx` | `ready` | BlockNote editor + autosave 600ms + tag picker thật |
| `frontend/src/components/editor/BlockEditor.tsx` | `ready` | Wrapper BlockNote: schema không media, dark/light theme |
| `frontend/src/services/notes.ts` | `ready` | Axios wrapper 5 endpoint Notes |
| `frontend/src/hooks/useNotes.ts` | `ready` | TanStack Query hooks cho Note CRUD |
| `frontend/src/pages/KnowledgeGraph.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/ReviewFeed.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/Insights.tsx` | `scaffold` | Mock data |
| `frontend/src/context/AppState.tsx` | `deprecated` | Gutted — giữ export rỗng, thay bằng useTags() |
| `frontend/src/context/ThemeContext.tsx` | `ready` | Dark/light theme context |
| `frontend/src/data/mockData.ts` | `ready` | Mock data cho tất cả pages — sẽ xóa khi kết nối API thật |
| `frontend/src/lib/i18n.ts` | `ready` | i18next setup |
| `frontend/src/assets/images/logo-leafnote.png` | `ready` | Logo chính của app |
| `information/logo-brief.md` | `ready` | Prompt thiết kế logo cho AI/designer |
| `AGENTS.md` | `ready` | GitNexus agent configuration cho codebase |
| `.claude/skills/browser-qa/` | `ready` | UI/browser testing workflow cho Leafnote frontend |
| `.claude/skills/backend-patterns/` | `ready` | FastAPI + SQLAlchemy async patterns |
| `.claude/skills/debug/` | `ready` | Debug React + FastAPI (console, network, backend logs) |
| `.claude/skills/generate-code/` | `ready` | Code generation conventions (naming, layer, i18n) |
| `.claude/skills/optimize/` | `ready` | Performance checklist (React, TanStack Query, SQLAlchemy) |
| `.claude/skills/react-hooks/` | `ready` | Custom hook patterns cho Leafnote |
| `.claude/skills/doc-writing/` | `ready` | Conventions viết .md trong project |
| `.claude/skills/feature-ideation/` | `ready` | Scoping feature vs product principles + phase constraints |
| `.claude/skills/validation/` | `ready` | Pydantic v2 + form validation patterns |
| `.claude/agents/architect.md` | `ready` | Kiểm tra layer separation, architecture rules |
| `.claude/agents/coder.md` | `ready` | Feature implementer theo convention Leafnote |
| `.claude/agents/reviewer.md` | `ready` | General code reviewer (security + conventions) |
| `.claude/agents/optimizer.md` | `ready` | Performance analysis (React + FastAPI + bundle) |
| `.claude/agents/typescript-reviewer.md` | `ready` | TypeScript/React reviewer (i18n, hooks, types) |
| `.claude/agents/python-reviewer.md` | `ready` | FastAPI/Python reviewer (service layer, async) |
| `.claude/agents/security-reviewer.md` | `ready` | Security: Supabase JWT, OWASP, secrets |
| `.claude/agents/tdd-guide.md` | `ready` | TDD workflow: Vitest + pytest |
| `.claude/agents/tester.md` | `ready` | Browser QA tester — Chrome UI testing, 5-phase smoke/auth/feature/responsive/theme |

> Khi Claude tạo file mới, **cập nhật bảng này**.

---

## Cấu trúc đích (khi đã code)

Chi tiết đầy đủ: [`information/project-structure.md`](information/project-structure.md).

```
leafnote/
├── CLAUDE.md, ROADMAP.md, README.md
├── information/        # Tài liệu chính thức
├── .claude/            # Cấu hình & bộ nhớ Claude
├── backend/            # FastAPI — services/ là nơi đặt logic
├── frontend/           # React + Vite
├── tests/              # unit / integration / ai-evals
└── ... (experiments/ tạo khi cần)
```

---

## Kiến trúc Frontend thực tế

### Routing (`src/App.tsx`)

`AppShell` (Sidebar + TopBar + main) bọc tất cả route protected. `/auth` là route public duy nhất. Mọi route khác đi qua `ProtectedRoute` → kiểm tra `useAuthStore`.

### State management

| Loại state | Nơi lưu |
|---|---|
| Auth session / user | `src/stores/authStore.ts` (Zustand) — khởi tạo qua `supabase.auth.getSession()` |
| Tags (hiện tại mock) | `src/context/AppState.tsx` (React context) |
| Server state | TanStack Query — **chưa dùng**, sẽ dùng khi kết nối API thật |
| Theme | `src/context/ThemeContext.tsx` |

### Mock data pattern

Tất cả pages đang dùng data từ `src/data/mockData.ts`. Khi kết nối API thật: tạo service trong `src/services/`, tạo hook TanStack Query trong `src/hooks/`, xóa import từ mockData.

### i18n

Dùng `i18next` + `react-i18next`. Config tại `src/lib/i18n.ts`. Locales: `src/locales/vi.json` và `src/locales/en.json`. Mọi string user-facing phải dùng `useTranslation()` hook — không hardcode tiếng Việt hay tiếng Anh trong JSX.

### Không có trong package.json

`shadcn/ui` **chưa được cài** — architecture.md liệt kê là planned. Hiện tại dùng Tailwind thuần + Lucide icons.

---

## Quy tắc code (đích đến — áp dụng KHI đã có code)

### Backend (FastAPI)

- Business logic **luôn** nằm trong `services/`, không viết trong `routes/`.
- Biến môi trường chỉ đọc qua `core/config.py`.
- Mỗi domain (user, note, leaf, project, …) có file riêng trong `routes/`, `models/`, `schemas/`, `services/`.

### Frontend (React web)

- API call **luôn** đi qua `services/`, không fetch trực tiếp trong component.
- `components/` = UI thuần, không có logic nghiệp vụ.
- Custom hook bắt đầu bằng `use`.

### Chung

- Prototype mới → `experiments/prototypes/` (khi đã có folder).
- Lỗi đã gặp → ghi vào `.claude/memory/mistakes.md`.

---

## CLI tooling (Windows dev environment)

Modern CLI tools đã được cài và nên ưu tiên thay cho command legacy:

| Modern tool | Thay cho |
|---|---|
| `eza` | `dir` / `ls` |
| `bat` | `cat` |
| `rg` (ripgrep) | `findstr` / text search |
| `fd` | `find` |
| `zoxide` | smart directory jumping |
| `fzf` | fuzzy search/filter |

### Preferred usage

```powershell
eza -lah --icons --git
eza --tree --level=3 --icons
bat file.ts
rg "leaf"
fd config
```

### Notes

- Environment: PowerShell 7 + Windows Terminal + Oh My Posh
- Prefer PowerShell-compatible commands over bash-only syntax
- Prefer modern CLI tooling over Windows legacy commands when available

---

## Hành vi Claude trong phase này

1. **Trước mọi task**: đọc `.claude/workflows/master.md` — điểm vào duy nhất, route đến đúng workflow/agent/skill cho loại task hiện tại. **Không bỏ qua.**
2. **Đọc đầu phiên**: `CLAUDE.md` → `ROADMAP.md` → `information/project-overview.md` → user-stories nếu cần ngữ cảnh tính năng.
   **Khi tạo bất kỳ component UI nào**: đọc `information/design-system.md` trước — không tự định nghĩa màu, font, hay pattern.
3. **Khi user yêu cầu code**: phase `Phase 1 — Shell`. Auth đã xong. Pages đã scaffold với mock data. Việc tiếp theo là kết nối từng page với API thật qua `services/` + TanStack Query. Hỏi xác nhận trước khi cài thư viện lớn (>10MB) hay chạy migration thật.
4. **Khi tạo / chỉnh tài liệu**: cập nhật bảng "Trạng thái file" ở trên.
5. **Khi chốt một quyết định lớn** (tech stack, schema, API contract): chuyển nhãn từ `draft` → `ready` và ghi short note vào `.claude/memory/context.md`.
6. **Quy ước file `.md`**: Mọi file `.md` tạo mới phải có dòng `> [mô tả ngắn]` làm **dòng đầu tiên sau tiêu đề `#`** — giải thích tác dụng của file trong một câu. Ràng buộc này áp dụng vĩnh viễn, không cần nhắc lại mỗi phiên.

---

## Tài liệu tham khảo nhanh

| Cần biết gì | Đọc file nào |
|---|---|
| Điểm vào cho mọi task | `.claude/workflows/master.md` |
| Design system (màu, font, pattern) | `information/design-system.md` |
| Concept & MVP scope | `information/project-overview.md` |
| User stories & ưu tiên P0/P1 | `information/user-stories.md` |
| Phase hiện tại & lộ trình | `ROADMAP.md` |
| Cấu trúc thư mục đích | `information/project-structure.md` |
| Kiến trúc + tech stack | `information/architecture.md` |
| Catalog tính năng (F-01…F-20) | `information/features.md` |
| Schema DB (high-level) | `information/database-schema.md` |
| API endpoints (high-level) | `information/api-spec.md` |
| Đang làm đến đâu | `.claude/memory/context.md` |
| Lỗi cần tránh | `.claude/memory/mistakes.md` |
| Pattern hay dùng | `.claude/memory/patterns.md` |
| Định hướng UX/product/security | `information/product-principles.md` |
| Lịch sử plan đã thực hiện | `HISTORY.md` |
| Plan migration demo → production | `MIGRATION-PLAN.md` |
| Workflow chuyển từng phần demo | `.claude/workflows/migrate-demo.md` |

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **leafnote** (694 symbols, 830 relationships, 1 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/leafnote/context` | Codebase overview, check index freshness |
| `gitnexus://repo/leafnote/clusters` | All functional areas |
| `gitnexus://repo/leafnote/processes` | All execution flows |
| `gitnexus://repo/leafnote/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
