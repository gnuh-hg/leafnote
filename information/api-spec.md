# API Spec — Leafnote

> Mô tả các API endpoint ở mức high-level — path, method, mục đích, auth requirement. Chi tiết request/response bổ sung khi bắt đầu implement từng milestone.

---

## System

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `HEAD` | `/health` | None | Kiểm tra server còn sống — chỉ trả status code, không có body |
| `GET` | `/health` | None | Như HEAD nhưng kèm body `{ "status": "ok" }` — dùng khi cần đọc response |

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

---

## Tags

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/tags/` | Required | Danh sách tags của user (sort: access_count DESC) |
| `POST` | `/api/v1/tags/` | Required | Tạo tag mới → 201; 409 nếu tên đã tồn tại |
| `PATCH` | `/api/v1/tags/{tag_id}` | Required | Đổi tên / màu tag; 404 nếu không phải của user |
| `DELETE` | `/api/v1/tags/{tag_id}` | Required | Xoá tag → 204; 404 nếu không phải của user |
| `POST` | `/api/v1/tags/{tag_id}/access` | Required | Tăng access_count (tag picker) → 204 |

### `POST /api/v1/tags/`

- Body: `{ name: string, color: string }` — name bị strip/lowercase/dash-separated, color phải thuộc VALID_COLORS
- Response: `TagOut` (201)
- 409 nếu user đã có tag cùng tên

### `PATCH /api/v1/tags/{tag_id}`

- Body: `{ name?: string, color?: string }` — cả hai optional
- Response: `TagOut`
- 409 nếu đổi tên trùng với tag khác của cùng user

### TagOut schema

```json
{ "id": "uuid", "name": "string", "color": "amber", "note_count": 0, "access_count": 0, "last_accessed": null, "created_at": "iso8601", "updated_at": "iso8601" }
```
