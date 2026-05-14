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

**2026-05-13 — Thêm entry HISTORY.md sai vị trí (đầu file thay vì cuối)**

- **Triệu chứng**: Entry mới nhất xuất hiện ở đầu file, đảo ngược thứ tự thời gian
- **Root cause**: Dùng `Edit` với `old_string` là separator `---` đầu tiên gặp → entry bị chèn vào đầu thay vì cuối
- **Fix**: Di chuyển entry xuống cuối file
- **Phòng tránh**: `HISTORY.md` luôn append vào **cuối file** — entry mới nhất ở dưới cùng. Khi dùng `Edit`, target `old_string` là nội dung cuối cùng của file hiện tại, thêm entry sau đó.

**2026-05-13 — Edit/delete trên optimistic item có tmp ID**

- **Triệu chứng**: Gọi `PATCH /api/v1/tags/tmp-1234567` hoặc `DELETE /api/v1/tags/tmp-1234567` → 404 vì id này chưa tồn tại trên server
- **Root cause**: Khi create dùng optimistic update, item có id `tmp-xxx` được thêm vào cache ngay. Nếu user click edit/delete trước khi `onSettled` invalidate và server trả id thật → API nhận id ảo
- **Fix**: Lock mọi interaction trên item có `id.startsWith('tmp-')` — không render hover menu, không cho click navigate/edit/delete. `pointer-events-none` trên div wrapper.
- **Phòng tránh**: Mọi list item cần check `isTmp = id.startsWith('tmp-')`. Template pattern đã có trong `patterns.md`. Cách khác (merge mutation vào queue) phức tạp hơn và không cần thiết ở phase 1.

---

**[2026-05-14] — Migration crash backend vì pgbouncer + asyncpg prepared statement**

- **Triệu chứng**: Backend startup chết với `DuplicatePreparedStatementError: prepared statement "__asyncpg_stmt_1__" already exists` ngay tại `select pg_catalog.version()`. Cả local lẫn Render đều fail. Trước đó đã thử thêm `statement_cache_size=0` nhưng vẫn lỗi.
- **Root cause**: `DATABASE_URL` trỏ Supabase Transaction Pooler (port 6543, pgbouncer transaction mode). Pgbouncer reuse server connection giữa các client. asyncpg luôn `PREPARE` mỗi câu lệnh với tên mặc định `__asyncpg_stmt_N__` → tên đụng nhau trên server. `statement_cache_size=0` chỉ tắt cache client, không tắt việc PREPARE.
- **Fix**: Thêm `prepared_statement_name_func=lambda: f"__asyncpg_{uuid.uuid4().hex}__"` trong `connect_args` của engine app. Tách `DATABASE_DIRECT_URL` (port 5432, session pooler) cho Alembic. Bỏ migration khỏi app lifespan, chuyển sang Render Build Command.
- **Phòng tránh**: Mỗi khi dùng Supabase Transaction Pooler với asyncpg, BẮT BUỘC set `prepared_statement_name_func`. Không bao giờ dùng pooler 6543 cho migration. Không bao giờ chạy migration trong `lifespan` của FastAPI (race condition khi scale, crash app khi fail).

---

**[2026-05-14] — Copy nhầm Key ID của ECC key vào `SUPABASE_JWT_SECRET`**

- **Triệu chứng**: Verify HS256 token có thể fail (tokens HS256 còn tồn tại sau khi Supabase rotate sang ECC P-256).
- **Root cause**: Trang JWT Keys hiện cả Key ID (`72DA9E53-8198-...`) lẫn nút mở "Legacy JWT Secret" ở tab riêng. Dễ nhầm copy Key ID (UUID 36 chars) → giống định dạng secret nhưng KHÔNG phải secret.
- **Fix**: Lấy Legacy HS256 Shared Secret từ tab **"Legacy JWT Secret"** của trang JWT Keys (không phải Key ID hiện trong bảng). Giá trị thật là base64 random ~40+ chars, không có dấu gạch nối.
- **Phòng tránh**: Khi Supabase đã rotate sang asymmetric, có thể bỏ HS256 hoàn toàn sau khi tất cả refresh token cũ hết hạn (Revoke legacy key trên dashboard rồi xóa env var). `scripts/check_env.py` chỉ check format, không verify giá trị secret — phải verify thủ công từ dashboard.
