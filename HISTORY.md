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
