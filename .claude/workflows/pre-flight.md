# Pre-flight Checklist

> Đọc file này TRƯỚC mọi task. Không bỏ bước, không đoán.

---

## 1 — TRƯỚC khi làm: đọc đúng file

Xác định loại task, rồi đọc **tất cả** file trong cột "Bắt buộc đọc":

| Loại task | Bắt buộc đọc |
|---|---|
| **Mọi task** | `CLAUDE.md` (đã tự load), `ROADMAP.md` (biết đang ở phase nào) |
| Thêm tính năng | `.claude/workflows/build-feature.md` — đọc từ đầu đến cuối, làm theo từng bước |
| Sửa bug | `.claude/workflows/fix-bug.md` |
| Có UI | `information/design-system.md` — không tự chọn màu/font/pattern |
| Có UI | `information/product-principles.md` — 7 nguyên tắc cross-cutting |
| Thay đổi API | `information/api-spec.md` — biết endpoint nào đã có |
| Thay đổi DB | `information/database-schema.md` — biết bảng nào đã có |
| Cần ngữ cảnh tính năng | `information/features.md`, `information/user-stories.md` |
| Mọi task | `.claude/memory/context.md` — pattern đang dùng, quyết định đã chốt |
| Mọi task | `.claude/memory/mistakes.md` — lỗi cần tránh (nếu file tồn tại) |

**Không đọc = không bắt đầu code.**

---

## 2 — TRONG khi làm: rule cần nhớ

### Code

- Business logic **luôn** trong `services/`, không viết trong `routes/` hay component
- API call **luôn** qua `services/`, không fetch trực tiếp trong component/hook
- Biến môi trường chỉ đọc qua `core/config.py` — không `import os`
- Mỗi domain có file riêng trong `routes/`, `models/`, `schemas/`, `services/`

### UI

- Dùng token từ design-system — không hardcode hex, không `bg-white`, `bg-gray-*`, `text-black`
- Mọi string user-facing qua `t()` — thêm key vào **cả vi.json và en.json ngay lúc viết**
- Empty state: mọi view data-dependent cần 2 state (main empty + filter empty)
- Filter state dùng `useSearchParams`, không `useState`

### File mới

- Mọi file `.md` tạo mới phải có dòng `> [mô tả ngắn]` làm dòng đầu tiên sau tiêu đề `#`

---

## 3 — SAU khi làm: cập nhật tài liệu

Đây là phần **hay bị bỏ sót nhất**. Dùng bảng dưới — check từng dòng, nếu thay đổi khớp cột trái thì cập nhật file cột phải:

| Nếu đã... | Thì cập nhật |
|---|---|
| Tạo file mới (bất kỳ) | `CLAUDE.md` → bảng "Trạng thái file" |
| Tạo file mới trong `backend/` hoặc `frontend/` | `information/project-structure.md` → cây thư mục tương ứng |
| Thêm/sửa API endpoint | `information/api-spec.md` |
| Thêm/sửa bảng hoặc column DB | `information/database-schema.md` |
| Thêm migration Alembic | `information/database-schema.md` (ghi tên migration) |
| Chốt quyết định lớn (tech, pattern, schema) | `.claude/memory/context.md` |
| Phát hiện lỗi cần tránh lần sau | `.claude/memory/mistakes.md` (tạo nếu chưa có) |
| Rút ra pattern tái sử dụng | `.claude/memory/patterns.md` (tạo nếu chưa có) |
| Hoàn thành 1 task lớn / 1 phase | `HISTORY.md` → thêm entry mới (ngày, mục tiêu, đã làm, files đã can thiệp) |
| Tick xong gate condition | `ROADMAP.md` → tick checkbox `[x]` |
| Thêm i18n key | Kiểm tra **cả** `vi.json` và `en.json` đều có key đó |
| Thay đổi design token/pattern | `information/design-system.md` |
| Tạo/sửa workflow | Bảng "Trạng thái file" trong `CLAUDE.md` |

### Checklist tóm tắt (copy-paste mental check)

```
□ CLAUDE.md             — bảng trạng thái file đã cập nhật?
□ project-structure.md  — cây thư mục đã phản ánh file mới?
□ api-spec.md           — endpoint mới đã ghi?
□ db-schema.md          — bảng/column mới đã ghi?
□ context.md            — quyết định lớn đã ghi?
□ HISTORY.md            — task lớn đã có entry?
□ ROADMAP.md            — gate đã tick?
□ vi.json+en.json       — i18n đồng bộ?
```

**Không cập nhật tài liệu = task chưa xong.**
