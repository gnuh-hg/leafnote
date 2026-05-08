# CLAUDE.md — Hướng dẫn cho Claude

File này là bản đồ chính để Claude hiểu project. Đọc file này **trước** khi làm bất cứ việc gì.

---

## Project là gì?

**Leafnote** — Ứng dụng ghi chú thông minh. Tri thức của người dùng là một cái cây: mỗi note là một cành, AI tự tách ra thành những chiếc lá (leaf) nhỏ — mỗi lá có vòng đời riêng (retention + relevance), được surfacing lại đúng lúc người dùng cần.

Chi tiết: [`information/project-overview.md`](information/project-overview.md).

---

## Phase hiện tại

**`scaffolding` — tạo skeleton repo.** Tài liệu nền đã xong. Đang tạo cấu trúc repo, CI, và auth Supabase. **Chưa có** feature code.

Xem chi tiết: [`ROADMAP.md`](ROADMAP.md).

> Hệ quả cho Claude:
>
> - Được tạo `backend/`, `frontend/` theo cấu trúc trong `information/project-structure.md`.
> - Không tạo feature code (notes, leaves, recall) — chỉ scaffold + `/health` + auth.
> - Quy ước code (trong mục dưới) áp dụng ngay từ bây giờ.

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

## Hành vi Claude trong phase này

1. **Trước mọi task**: đọc `.claude/workflows/pre-flight.md` — checklist bắt buộc trước/trong/sau khi làm. **Không bỏ qua.**
2. **Đọc đầu phiên**: `CLAUDE.md` → `ROADMAP.md` → `information/project-overview.md` → user-stories nếu cần ngữ cảnh tính năng.
   **Khi tạo bất kỳ component UI nào**: đọc `information/design-system.md` trước — không tự định nghĩa màu, font, hay pattern.
3. **Khi user yêu cầu code**: phase `scaffolding` — được tạo `backend/` và `frontend/` theo cấu trúc đã chốt. Hỏi xác nhận trước khi cài thư viện lớn (>10MB), mở port public, hay chạy migration thật.
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
