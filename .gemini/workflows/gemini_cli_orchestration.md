# GEMINI CLI ORCHESTRATION WORKFLOW

> Đây là quy trình hoạt động của Gemini CLI khi đóng vai trò là người điều phối (Orchestrator) trong kiến trúc Manager-Worker. Quy trình này giúp Gemini CLI chủ động trong việc gọi các Gemini Worker, xử lý lỗi và tích hợp với chỉ thị của Claude (Manager).

## 1. Nhận Chỉ thị (Directive Reception)

- **Nguồn:** Người dùng hoặc Claude (qua `invoke_agent` hoặc prompt).
- **Hành động:** Gemini CLI phân tích prompt để xác định:
    - Loại tác vụ (code generation, refactor, documentation, etc.).
    - Ngữ cảnh cần thiết (các file `information/*`, bộ nhớ Claude, báo cáo GitNexus).
    - Worker Gemini mục tiêu (nếu được chỉ định).

## 2. Lựa chọn Worker Gemini (Worker Selection)

- **Dựa vào:**
    - **Loại tác vụ:** `frontend-worker` cho UI, `backend-worker` cho API, `refactor-worker` cho code cleanup, `doc-worker` cho tài liệu.
    - **Ngữ cảnh:** Ưu tiên worker có prompt phù hợp nhất với yêu cầu.
    - **`WORKER_PLAN.md`:** Các quy tắc "100-Token Rule" và "Sandwich Method".
- **Quyết định:** Chọn worker Gemini phù hợp. Nếu không rõ, Gemini CLI có thể yêu cầu làm rõ hoặc mặc định chọn worker có khả năng xử lý rộng (ví dụ: `generalist` nếu cần).

## 3. Chuẩn bị Ngữ cảnh & Gọi Worker (Context Packaging & Invocation)

- **Thu thập Ngữ cảnh:** Gemini CLI tập hợp tất cả dữ liệu cần thiết:
    - Các đoạn code/file liên quan (từ `information/`, `.claude/memory/*`).
    - Báo cáo GitNexus (nếu có).
    - Các quy tắc của dự án (`GEMINI.md`, `WORKER_PLAN.md`).
- **Đóng gói Prompt:** Xây dựng prompt chi tiết cho worker, tuân thủ cấu trúc định nghĩa trong `gemini_orchestrator.md`.
    ```
    Act as @<SelectedWorker>.
    Context:
    --- [Nội dung các file ngữ cảnh] ---
    Task: [Chi tiết tác vụ]
    ```
- **Thực thi:** Sử dụng `invoke_agent` (với `agent_name="generalist"`) hoặc `run_shell_command`.

## 4. Xử lý Lỗi & Quản lý API Key (Error Handling & API Key Rotation)

- **Theo dõi Lỗi:** Giám sát kết quả trả về của worker.
- **Phát hiện Rate Limit:** Nếu nhận lỗi `429 Too Many Requests`:
    1.  Chạy `node tools/scripts/rotate-workers.js --next`.
    2.  Thử gọi lại worker.
    3.  Nếu tiếp tục lỗi sau 3 lần thử, báo cáo cho Claude/User.
- **Các Lỗi khác:** Ghi log và báo cáo tương ứng.

## 5. Xử lý Kết quả (Output Processing)

- **Thu thập:** Nhận kết quả từ worker (code, log, báo cáo).
- **Định dạng:** Yêu cầu worker trả về theo chuẩn `.gemini/response-format.md`. Trình bày kết quả rõ ràng cho Claude (Manager) hoặc người dùng.
- **Lưu ý:** Luôn xác định kết quả này cần Claude xem xét và phê duyệt cuối cùng (theo "Sandwich Method").

## 6. Cập nhật Trạng thái Nội bộ

- **Ghi nhớ Worker:** Theo dõi trạng thái và hiệu suất của các worker Gemini.
-   **Lưu lại lịch sử:** Có thể ghi lại các task đã được ủy thác và kết quả vào bộ nhớ riêng của Gemini CLI (ví dụ: `gemini_orchestrator.md`).
