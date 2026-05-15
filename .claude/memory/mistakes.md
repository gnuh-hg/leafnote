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

---

**[2026-05-14] — pgbouncer transaction mode: prepared statement does not exist (sequel)**

- **Triệu chứng**: Backend chạy bình thường vài request, rồi random `InvalidSQLStatementNameError: prepared statement "__asyncpg_xxx__" does not exist`. Khác lỗi `DuplicatePreparedStatementError` trước đó.
- **Root cause**: Fix cũ (`prepared_statement_name_func` cho tên unique) chỉ giải quyết name collision. Pgbouncer transaction mode **rotate server backend mỗi transaction** — SQLAlchemy reuse cùng asyncpg connection trong pool nhưng pgbouncer thì cho transaction này connect server A, transaction kế server B. PREPARE đăng ký trên A nhưng EXECUTE lại chạy trên B → "does not exist".
- **Fix**: Thêm `poolclass=NullPool` trong `create_async_engine` — mỗi session lấy asyncpg connection mới, đóng sau khi xong → prepare + execute luôn cùng một backend cho vòng đời connection đó. Đồng thời thêm `prepared_statement_cache_size=0`.
- **Phòng tránh**: Với Supabase Transaction Pooler (6543) + asyncpg, **luôn phải dùng `NullPool`** — không pool ở SQLAlchemy. Pool ở pgbouncer là đủ và lành mạnh hơn. Nếu cần long-lived connection (LISTEN/NOTIFY, advisory lock cross-request), phải dùng session pooler (5432) thay vì transaction pooler.

---

**[2026-05-14] — CORS block vì trailing slash trong `CORS_ORIGINS`**

- **Triệu chứng**: Frontend Vercel gọi backend Render → browser block với `No 'Access-Control-Allow-Origin' header`. Backend không crash, response có status 200/4xx nhưng thiếu CORS header.
- **Root cause**: `CORS_ORIGINS` trên Render đặt là `["https://leafnote-vn.vercel.app/", ...]` (có dấu `/` cuối). Browser gửi `Origin: https://leafnote-vn.vercel.app` (KHÔNG có `/`). Starlette CORSMiddleware so khớp exact string → không match → không thêm CORS header.
- **Fix**: Bỏ trailing slash trong env var: `["https://leafnote-vn.vercel.app","http://localhost:5173"]`.
- **Phòng tránh**: Origin trong CORS_ORIGINS phải là **scheme + host + port (nếu có)** — không có path, không có trailing slash. Khi paste URL từ trình duyệt cẩn thận browser thường thêm `/`.
