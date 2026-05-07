# API Spec — Leafnote

> Mô tả các API endpoint ở mức high-level — path, method, mục đích, auth requirement. Chi tiết request/response bổ sung khi bắt đầu implement từng milestone.

---

## Auth

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/auth/me` | Required | Trả thông tin user hiện tại |
| `PATCH` | `/api/v1/auth/me` | Required | Cập nhật display_name |

### `GET /api/v1/auth/me`
- Response: `{ id, email, display_name, created_at }`
- 401 nếu token invalid

### `PATCH /api/v1/auth/me`
- Body: `{ display_name?: string }`
- Response: `UserOut`
