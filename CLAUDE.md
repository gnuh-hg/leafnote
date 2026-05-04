# CLAUDE.md — Hướng dẫn cho Claude

File này là bản đồ chính để Claude hiểu project. Đọc file này **trước** khi làm bất cứ việc gì.

---

## Project là gì?

**Leafnote** — Hệ thống ghi chú thích ứng dựa trên phân rã tri thức nguyên tử (knowledge atom).
Web + mobile. Mỗi note được AI tự động chia thành các hạt độc lập, mỗi hạt có vòng đời riêng (retention + relevance), được surfacing lại đúng lúc người dùng cần.

Chi tiết: [`information/project-overview.md`](information/project-overview.md).

---

## Phase hiện tại

**`pre-project` — chưa có code.** Đang ở giai đoạn lên ý tưởng, viết tài liệu nền, chốt phạm vi MVP. **Chưa có** backend, frontend, test, hay infra.

Xem chi tiết: [`PHASE.md`](PHASE.md).

> Hệ quả cho Claude:
> - Không giả định file/folder code đã tồn tại.
> - Không tạo skeleton `backend/`, `frontend/` nếu chưa được yêu cầu.
> - Quy ước code (trong mục dưới) là **đích đến**, không phải hiện trạng.

---

## Trạng thái file (ground truth)

| File | Trạng thái | Ghi chú |
|---|---|---|
| `CLAUDE.md` | `ready` | File này |
| `PHASE.md` | `ready` | Phase hiện tại |
| `README.md` | `chưa tạo` | Viết khi có cách chạy thật |
| `ROADMAP.md` | `ready` | Lộ trình theo phase |
| `CHANGELOG.md` | `chưa tạo` | Sau release đầu |
| `CONTRIBUTING.md` | `chưa tạo` | Khi có người contribute |
| `information/project-overview.md` | `ready` | Concept & MVP scope |
| `information/project-structure.md` | `ready` | Cấu trúc đích (chưa hiện thực) |
| `information/tech-stack.md` | `draft` | Lựa chọn ban đầu, chốt khi code |
| `information/architecture.md` | `draft` | High-level, chốt khi code |
| `information/user-stories.md` | `ready` | Pre-project đã chốt |
| `information/database-schema.md` | `draft` | High-level; chi tiết ở `plan/drafts/` |
| `information/api-spec.md` | `draft` | High-level; chi tiết ở `plan/drafts/` |
| `information/plan/overview.md` | `chưa rõ` | Cần kiểm tra/viết lại |
| `information/plan/milestones.md` | `chưa rõ` | Cần kiểm tra/viết lại |
| `information/plan/mvp-scope.md` | `chưa tạo` | Sẽ viết |
| `information/plan/drafts/*.draft.md` | `ready` | Spec chi tiết tham chiếu khi code |
| `information/runbooks/` | `chưa cần` | Sau khi deploy |
| `.claude/memory/context.md` | `chưa rõ` | Cần kiểm tra |
| `.claude/memory/mistakes.md` | `chưa cần` | Sau khi gặp lỗi |
| `.claude/memory/patterns.md` | `chưa cần` | Sau khi rút pattern thực |
| `backend/`, `frontend/` | `chưa có code` | Chỉ tạo khi bắt đầu phase scaffolding |

> Khi Claude tạo file mới, **cập nhật bảng này**.

---

## Cấu trúc đích (khi đã code)

Chỉ là kế hoạch — chưa có hiện tại. Chi tiết đầy đủ: [`information/project-structure.md`](information/project-structure.md).

```
leafnote/
├── CLAUDE.md, PHASE.md, README.md, ROADMAP.md
├── information/        # Tài liệu chính thức (overview, structure, tech-stack, architecture,
│                       #   user-stories, api-spec, database-schema, plan/, runbooks/)
├── .claude/            # Cấu hình & bộ nhớ Claude (config, memory, skills, agents, ...)
├── backend/            # FastAPI — services/ là nơi đặt logic
├── frontend/           # React + Vite — services/ gọi API
├── tests/              # unit / integration / ai-evals
└── ... (prompts/, tools/scripts/, experiments/ tạo khi cần)
```

---

## Quy tắc code (đích đến — áp dụng KHI đã có code)

### Backend (FastAPI)
- Business logic **luôn** nằm trong `services/`, không viết trong `routes/`.
- Biến môi trường chỉ đọc qua `core/config.py`.
- Mỗi domain (user, note, atom, project, …) có file riêng trong `routes/`, `models/`, `schemas/`, `services/`.

### Frontend (React web + RN mobile)
- API call **luôn** đi qua `services/`, không fetch trực tiếp trong component.
- `components/` = UI thuần, không có logic nghiệp vụ.
- Custom hook bắt đầu bằng `use`.

### Chung
- Xem `CONTRIBUTING.md` trước khi commit (khi đã có file).
- Prototype mới → `experiments/prototypes/` (khi đã có folder).
- Lỗi đã gặp → ghi vào `.claude/memory/mistakes.md`.

---

## Hành vi Claude trong phase này

1. **Đọc đầu phiên**: `CLAUDE.md` → `PHASE.md` → `information/project-overview.md` → file user-stories nếu cần ngữ cảnh tính năng.
2. **Khi user yêu cầu code**: kiểm tra `PHASE.md`. Nếu vẫn ở `pre-project`, hỏi xác nhận trước khi tạo `backend/` hoặc `frontend/`.
3. **Khi tạo / chỉnh tài liệu**: cập nhật bảng "Trạng thái file" ở trên.
4. **Khi chốt một quyết định lớn** (tech stack, schema, API contract): chuyển nhãn từ `draft` → `ready` và ghi short note vào `.claude/memory/context.md`.

---

## Tài liệu tham khảo nhanh

| Cần biết gì | Đọc file nào |
|---|---|
| Concept & MVP scope | `information/project-overview.md` |
| User stories & ưu tiên P0/P1 | `information/user-stories.md` |
| Phase hiện tại & next milestone | `PHASE.md` |
| Lộ trình dài hạn | `ROADMAP.md` |
| Phạm vi MVP chốt | `information/plan/mvp-scope.md` |
| Cấu trúc thư mục đích | `information/project-structure.md` |
| Kiến trúc cao cấp | `information/architecture.md` |
| Lựa chọn công nghệ | `information/tech-stack.md` |
| Schema DB (high-level) | `information/database-schema.md` |
| API endpoints (high-level) | `information/api-spec.md` |
| Spec chi tiết tham chiếu | `information/plan/drafts/` |
| Đang làm đến đâu | `.claude/memory/context.md` |
| Lỗi cần tránh | `.claude/memory/mistakes.md` |
| Pattern hay dùng | `.claude/memory/patterns.md` |
| Kế hoạch sprint | `information/plan/sprints/` |
