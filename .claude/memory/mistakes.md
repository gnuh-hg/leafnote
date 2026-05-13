# Mistakes — Leafnote

> Lỗi đã gặp và cần tránh. Đọc file này TRƯỚC khi bắt đầu task mới.

---

## Format mỗi entry

**[YYYY-MM-DD] — [Tên lỗi ngắn gọn]**
- **Triệu chứng**: Điều gì xảy ra / user thấy gì
- **Root cause**: Tại sao xảy ra
- **Fix**: Đã sửa thế nào
- **Phòng tránh**: Lần sau làm thế nào để không lặp lại

---

## Entries

**2026-05-12 — Gemini CLI agent mode gọi tool thay vì output text**
- **Triệu chứng**: `gemini -p "..."` sinh ra lỗi `write_file not found`, `run_shell_command not found` thay vì output code block. Key bị corrupt conversation state, retry lỗi `INVALID_ARGUMENT: function response turn`.
- **Root cause**: Gemini CLI mặc định chạy "agent executor" — model thấy nó có tool nên cố gọi `write_file`/`run_shell_command` để viết file. Khi tool không tồn tại, conversation state corrupt, retry 400.
- **Fix**: Thêm flag `--no-sandbox` vào lời gọi `gemini -p` — flag này disable agent executor, ép model output text thuần.
- **Phòng tránh**: Mọi lời gọi `gemini -p` trong delegate workflow đều phải dùng `gemini --no-sandbox -p "..."`. Cũng thêm instruction rõ trong directive: "OUTPUT ONLY AS TEXT. Do NOT use any tools."

**2026-05-12 — Hiểu sai mục đích `/delegate`**
- **Triệu chứng**: Áp dụng 100-Token Rule như gate cứng nhắc ("sinh > 100 dòng → bắt buộc delegate"), hoặc ngược lại bỏ qua delegate vì "docs không tính"
- **Root cause**: Mô tả ban đầu dùng ngôn ngữ "BẮT BUỘC / không có ngoại lệ" che khuất mục đích thực: `/delegate` là công cụ **giảm tải cho Claude**, tương tự gọi subagent
- **Fix**: Sửa lại mô tả trong CLAUDE.md, master.md, task-planner SKILL.md — framing lại thành judgment tool
- **Phòng tránh**: Delegate khi task thực sự nặng (scope rộng, nhiều context cùng lúc, công việc lặp lại). Tự làm khi đã có plan chi tiết sẵn, task là docs thuần, hoặc < 50 dòng. Không cần hỏi "có > 100 dòng không?" — hỏi "task này có đủ nặng để Claude cần trợ giúp không?"
