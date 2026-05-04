# CLAUDE.md — Hướng dẫn cho Claude

File này là bản đồ chính để Claude hiểu project. Đọc file này **trước** khi làm bất cứ việc gì.

---

## Project là gì?

**Leafnote** — Hệ thống ghi chú thích ứng dựa trên phân rã tri thức nguyên tử (knowledge atom).
Web app. Mỗi note được AI tự động chia thành các hạt độc lập, mỗi hạt có vòng đời riêng (retention + relevance), được surfacing lại đúng lúc người dùng cần.

Chi tiết: [`information/project-overview.md`](information/project-overview.md).

---

## Phase hiện tại

**`scaffolding` — tạo skeleton repo.** Tài liệu nền đã xong. Đang tạo cấu trúc repo, CI, và auth Supabase. **Chưa có** feature code.

Xem chi tiết: [`ROADMAP.md`](ROADMAP.md).

> Hệ quả cho Claude:
>
> - Được tạo `backend/`, `frontend/` theo cấu trúc trong `information/project-structure.md`.
> - Không tạo feature code (notes, atoms, recall) — chỉ scaffold + `/health` + auth.
> - Quy ước code (trong mục dưới) áp dụng ngay từ bây giờ.

---

## Trạng thái file (ground truth)

| File | Trạng thái | Ghi chú |
|---|---|---|
| `CLAUDE.md` | `ready` | File này |
| `ROADMAP.md` | `ready` | Phase hiện tại + lộ trình |
| `README.md` | `chưa tạo` | Viết khi có cách chạy thật |
| `CHANGELOG.md` | `chưa tạo` | Sau release đầu |
| `CONTRIBUTING.md` | `chưa tạo` | Khi có người contribute |
| `information/project-overview.md` | `ready` | Concept & MVP scope |
| `information/project-structure.md` | `ready` | Cấu trúc đích |
| `information/architecture.md` | `ready` | Kiến trúc + tech stack |
| `information/features.md` | `ready` | Catalog tính năng F-01…F-20 |
| `information/user-stories.md` | `ready` | Pre-project đã chốt |
| `information/database-schema.md` | `draft` | High-level |
| `information/api-spec.md` | `draft` | High-level |
| `information/runbooks/` | `chưa cần` | Sau khi deploy |
| `.claude/memory/context.md` | `ready` | Quyết định đã chốt + lý do |
| `.claude/memory/mistakes.md` | `chưa cần` | Sau khi gặp lỗi |
| `.claude/memory/patterns.md` | `chưa cần` | Sau khi rút pattern thực |
| `backend/`, `frontend/` | `scaffold` | Tạo trong phase scaffolding (hiện tại) |

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
- Mỗi domain (user, note, atom, project, …) có file riêng trong `routes/`, `models/`, `schemas/`, `services/`.

### Frontend (React web)

- API call **luôn** đi qua `services/`, không fetch trực tiếp trong component.
- `components/` = UI thuần, không có logic nghiệp vụ.
- Custom hook bắt đầu bằng `use`.

### Chung

- Xem `CONTRIBUTING.md` trước khi commit (khi đã có file).
- Prototype mới → `experiments/prototypes/` (khi đã có folder).
- Lỗi đã gặp → ghi vào `.claude/memory/mistakes.md`.

---

## Hành vi Claude trong phase này

1. **Đọc đầu phiên**: `CLAUDE.md` → `ROADMAP.md` → `information/project-overview.md` → user-stories nếu cần ngữ cảnh tính năng.
2. **Khi user yêu cầu code**: phase `scaffolding` — được tạo `backend/` và `frontend/` theo cấu trúc đã chốt. Hỏi xác nhận trước khi cài thư viện lớn (>10MB), mở port public, hay chạy migration thật.
3. **Khi tạo / chỉnh tài liệu**: cập nhật bảng "Trạng thái file" ở trên.
4. **Khi chốt một quyết định lớn** (tech stack, schema, API contract): chuyển nhãn từ `draft` → `ready` và ghi short note vào `.claude/memory/context.md`.

---

## Tài liệu tham khảo nhanh

| Cần biết gì | Đọc file nào |
|---|---|
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
