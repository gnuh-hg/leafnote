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

---

## Notes

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/notes` | Required | Danh sách note của user, sort `updated_at DESC`. Query `?tag_id=...` lặp lại nhiều lần để filter (note phải gắn ít nhất 1 trong các tag) |
| `GET` | `/api/v1/notes/{note_id}` | Required | Lấy note đầy đủ kèm nội dung text; 404 nếu không phải của user |
| `POST` | `/api/v1/notes` | Required | Tạo note → 201; body trống mặc định `""` |
| `PATCH` | `/api/v1/notes/{note_id}` | Required | Cập nhật `title` / `body` / `tag_ids` (đều optional, ghi đè) |
| `DELETE` | `/api/v1/notes/{note_id}` | Required | Xoá note → 204 |

### Body shape

`body` là `string` — nội dung text thuần của ghi chú. Backend dùng body này để sinh excerpt.

### NoteListItem schema

```json
{ "id": "uuid", "title": "string", "excerpt": "string (max 200 chars)", "tag_ids": ["uuid"], "document_type": "theory", "updated_at": "iso8601" }
```

### NoteOut schema (chi tiết)

```json
{ "id": "uuid", "title": "string", "body": "string", "tag_ids": ["uuid"], "excerpt": "string", "document_type": "theory", "created_at": "iso8601", "updated_at": "iso8601" }
```

`document_type` enum đóng: `theory | narrative | procedure | reference | meeting | freeform`. Default `theory`. Route prompt cho leaf engine.

---

## Leaves

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/notes/{note_id}/leaves` | Required | List leaves của note (ordered by created_at) |
| `POST` | `/api/v1/notes/{note_id}/leaves/regenerate` | Required | Trigger leaf engine: tách note thành leaves. Replace-all + bảo toàn `user_edited`. `freeform` → trả `[]` không gọi engine |
| `PATCH` | `/api/v1/leaves/{leaf_id}` | Required | Sửa `type` / `content` / `metadata`. Set `user_edited=true` |
| `DELETE` | `/api/v1/leaves/{leaf_id}` | Required | Xoá leaf → 204 |
| `POST` | `/api/v1/leaves/{leaf_id}/feedback` | Required | Thumbs up/down, body `{rating: "up"\|"down"}` → 204 |

### LeafOut schema

```json
{
  "id": "uuid", "note_id": "uuid",
  "type": "definition|fact|example|question|note",
  "content": "string",
  "metadata": { "term": "...", "ordinal": 1, "source": "...", "format": "code|math|text", "polarity": "positive|negative" },
  "confidence": 0.85, "user_edited": false,
  "created_at": "iso8601", "updated_at": "iso8601"
}
```

### RegenerateResponse schema

```json
{
  "leaves": [LeafOut, ...],
  "quality": { "coverage": 0.8, "atomicity": 1.0, "no_duplicate": 0.95, "type_valid": 1.0, "granularity_floor": 1.0, "total": 0.85, "issues": [] },
  "retried": false
}
```

### Error codes (Leaves)

- `502 Bad Gateway` — engine timeout/HTTP error/parse fail; body `{detail: "Leaf engine unavailable: ..."}`
- `422 Unprocessable Entity` — quality < `LEAF_QUALITY_MIN_SCORE` sau retry; body `{detail: {message, quality, raw_leaves}}` để FE quyết định
- `404 Not Found` — note hoặc leaf không thuộc user
