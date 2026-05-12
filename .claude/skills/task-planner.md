# Skill: Task Planner

> Đọc skill này TRƯỚC KHI delegate bất kỳ task nào. Giúp Claude phân tích scope, chia subtask, và soạn directive cho đúng worker.

---

## Bước 1 — Phân tích scope

Trả lời 3 câu hỏi:

1. **Task thuộc domain nào?**
   - `frontend` — component, page, hook, style, i18n
   - `backend` — endpoint, service, model, migration
   - `fullstack` — cả hai (cần delegate tuần tự: backend trước)
   - `refactor` — DRY/SOLID, không thêm tính năng
   - `docs` — markdown, architecture, api-spec
   - `test` — unit/integration/e2e

2. **Có thỏa 100-Token Rule không?**
   - Ước lượng số dòng code sẽ sinh ra > 100? → delegate
   - Cần đọc > 5 file cùng lúc? → delegate
   - Nếu không thỏa: Claude tự làm, không cần delegate

3. **Có dependency giữa subtask không?**
   - Backend schema/API phải xong trước frontend có thể call
   - Migration phải chạy trước service có thể query
   - Nếu có dependency: liệt kê thứ tự rõ ràng

---

## Bước 2 — Chọn worker và soạn directive

### Template directive chuẩn

```
Act as @<worker-name>.

## Context
[Dán full content của các file liên quan. Không tóm tắt.]

## Task
[Mô tả chi tiết những gì cần làm. Càng cụ thể càng tốt.]

## Constraints
- [Ràng buộc kỹ thuật từ project conventions]
- [File nào không được sửa]
- [Pattern nào bắt buộc dùng]

## Expected Output
- [Liệt kê từng file cần tạo/sửa]
- [Format output: theo .gemini/response-format.md]

TRƯỚC KHI thực hiện, viết vào thẻ <thinking>:
1. Tóm tắt yêu cầu và ràng buộc kỹ thuật.
2. Liệt kê file liên quan và blast radius.
3. Đề xuất giải pháp từng bước.

TUYỆT ĐỐI KHÔNG dùng // ... unchanged hay tóm tắt code. Viết lại toàn bộ nội dung file.
```

### Bảng worker × task

| Task | Worker chính | Worker phụ (nếu cần) |
|---|---|---|
| Tạo component/page React | `frontend-worker` | — |
| Viết API endpoint + service | `backend-worker` | — |
| Feature fullstack (backend + frontend) | `backend-worker` trước | `frontend-worker` sau |
| Refactor codebase | `refactor-worker` | — |
| Cập nhật tài liệu | `doc-worker` | — |
| Viết tests | `test-worker` | — |
| Feature phức tạp cần cả refactor + docs | Chạy lần lượt | backend → frontend → doc → test |

---

## Bước 3 — Context cần đính kèm

| Loại task | File bắt buộc gửi kèm |
|---|---|
| Frontend | `information/design-system.md`, file component liên quan |
| Backend | `information/api-spec.md`, `information/database-schema.md`, file service/model liên quan |
| Fullstack | Cả hai trên |
| Refactor | Các file cần refactor (full content) |
| Docs | File code đã thay đổi + file doc cần cập nhật |
| Test | File cần test (full content) + existing test nếu có |

Luôn gửi `GEMINI.md` nếu worker cần hiểu conventions của project.

---

## Bước 4 — Sau khi delegate xong

1. Đọc output từ Gemini theo chuẩn `.gemini/response-format.md`
2. QC theo checklist trong `gemini-delegation.md` mục 5
3. Apply code vào file thực tế (dùng Edit/Write tool)
4. Nếu worker thiếu sót: gọi lại với: *"Bạn đã bỏ sót [X], hãy hoàn thiện với độ chi tiết cao nhất."*
5. Chạy linter/type-check nếu có
