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
| `information/product-principles.md` | `ready` | 7 định hướng sản phẩm cross-cutting |
| `information/design-system.md` | `ready` | Màu sắc, typography, component pattern — nguồn chân lý UI |
| `information/runbooks/` | `chưa cần` | Sau khi deploy |
| `.claude/memory/context.md` | `ready` | Quyết định đã chốt + lý do |
| `.claude/memory/mistakes.md` | `chưa cần` | Sau khi gặp lỗi |
| `.claude/memory/patterns.md` | `chưa cần` | Sau khi rút pattern thực |
| `MIGRATION-PLAN.md` | `done` | Migration hoàn tất — 10/10 phần xong |
| `.claude/workflows/migrate-demo.md` | `done` | Workflow đã dùng xong |
| `.claude/workflows/pre-flight.md` | `ready` | Checklist bắt buộc trước/trong/sau mọi task |
| `.claude/workflows/build-feature.md` | `ready` | Workflow build feature |
| `backend/` | `phase1-auth` | FastAPI + auth middleware + User model |
| `backend/app/models/user.py` | `ready` | User model (SQLAlchemy) |
| `backend/app/schemas/auth.py` | `ready` | Pydantic schemas (UserOut, UserUpdate) |
| `backend/app/services/auth.py` | `ready` | Auth business logic |
| `backend/app/core/auth.py` | `ready` | JWT verify middleware (get_current_user) |
| `backend/app/core/database.py` | `ready` | AsyncSession + Base |
| `backend/app/api/v1/routes/auth.py` | `ready` | GET/PATCH /auth/me |
| `backend/app/api/v1/router.py` | `ready` | API router aggregator |
| `frontend/` | `phase1-auth` | UI đầy đủ + auth flow |
| `frontend/src/pages/Auth.tsx` | `ready` | Auth page (login/signup tabs) |
| `frontend/src/stores/authStore.ts` | `ready` | Zustand auth store |
| `frontend/src/services/auth.ts` | `ready` | Supabase auth wrapper |
| `frontend/src/lib/supabase.ts` | `ready` | Supabase client |
| `frontend/src/hooks/useOnlineStatus.ts` | `ready` | Online/offline detection hook |
| `frontend/src/components/auth/*` | `ready` | LoginForm, SignupForm, ProtectedRoute, BrandingPanel, PasswordStrengthMeter |
| `frontend/src/components/Sidebar.tsx` | `ready` | Sidebar nav (mock data cho tags/projects) |
| `frontend/src/components/TopBar.tsx` | `ready` | Top bar |
| `frontend/src/components/LeafCard.tsx` | `ready` | Card hiển thị leaf |
| `frontend/src/components/LeafDetailModal.tsx` | `ready` | Modal chi tiết leaf |
| `frontend/src/components/TagCreateModal.tsx` | `ready` | Modal tạo tag |
| `frontend/src/pages/Dashboard.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/NotesList.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/NoteEditor.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/KnowledgeGraph.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/ReviewFeed.tsx` | `scaffold` | Mock data |
| `frontend/src/pages/Insights.tsx` | `scaffold` | Mock data |
| `frontend/src/context/AppState.tsx` | `ready` | React context cho tags (mock state) |
| `frontend/src/context/ThemeContext.tsx` | `ready` | Dark/light theme context |
| `frontend/src/data/mockData.ts` | `ready` | Mock data cho tất cả pages — sẽ xóa khi kết nối API thật |
| `frontend/src/lib/i18n.ts` | `ready` | i18next setup |
| `frontend/src/assets/images/logo-leafnote.png` | `ready` | Logo chính của app |
| `information/logo-brief.md` | `ready` | Prompt thiết kế logo cho AI/designer |
| `AGENTS.md` | `ready` | GitNexus agent configuration cho codebase |
| `.claude/skills/gitnexus/` | `ready` | 6 skill files: exploring, debugging, impact, refactoring, cli, guide |
| `.claude/skills/gemini-delegation.md` | `ready` | Kỹ năng giao việc hiệu quả cho Gemini |
| `.claude/skills/coding/browser-qa.md` | `ready` | UI/browser testing workflow cho Leafnote frontend |
| `.claude/skills/coding/backend-patterns.md` | `ready` | FastAPI + SQLAlchemy async patterns |
| `.claude/agents/architect.md` | `ready` | Kiểm tra layer separation, architecture rules |
| `.claude/agents/coder.md` | `ready` | Feature implementer theo convention Leafnote |
| `.claude/agents/reviewer.md` | `ready` | General code reviewer (security + conventions) |
| `.claude/agents/optimizer.md` | `ready` | Performance analysis (React + FastAPI + bundle) |
| `.claude/agents/typescript-reviewer.md` | `ready` | TypeScript/React reviewer (i18n, hooks, types) |
| `.claude/agents/python-reviewer.md` | `ready` | FastAPI/Python reviewer (service layer, async) |
| `.claude/agents/security-reviewer.md` | `ready` | Security: Supabase JWT, OWASP, secrets |
| `.claude/agents/tdd-guide.md` | `ready` | TDD workflow: Vitest + pytest |
| `GEMINI.md` | `ready` | Project context cho Gemini CLI workers |
| `.gemini/` | `ready` | Gemini worker agents + response format |

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

## Manager Protocol (BẮT BUỘC)

Trước khi bắt đầu bất kỳ task nào thỏa **100-Token Rule** — sinh ra > 100 dòng code HOẶC cần đọc > 5 file — Claude **PHẢI**:

1. **Đọc `.claude/skills/task-planner.md`** — phân tích task, chia subtask, chọn worker
2. **Delegate cho Gemini worker qua Bash** — không tự viết code
3. **Review output từ Gemini** — QC theo checklist trong `gemini-delegation.md` rồi mới integrate

> **KHÔNG** tự viết code khi task thỏa 100-Token Rule. Đây là rule không có ngoại lệ.
>
> Để trigger thủ công: dùng slash command `/delegate <mô tả task>`.

---

## Hành vi Claude trong phase này

1. **Trước mọi task**: đọc `.claude/workflows/pre-flight.md` — checklist bắt buộc trước/trong/sau khi làm. **Không bỏ qua.**
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

This project is indexed by GitNexus as **leafnote** (604 symbols, 712 relationships, 1 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
