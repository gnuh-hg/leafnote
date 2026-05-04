# API Spec — Leafnote

> Base URL: `https://api.leafnote.app/v1`
> Auth: `Authorization: Bearer <supabase_jwt>` cho mọi endpoint trừ `/auth/*` và `/health`.
> Content-Type: `application/json` (trừ upload `multipart/form-data`).
> Mọi timestamp ISO-8601 UTC. Mọi id là UUID v7.
> Pagination chuẩn: `?cursor=<opaque>&limit=<int, default=20, max=100>`; response chứa `next_cursor`.
> Tất cả write endpoint hỗ trợ `Idempotency-Key` header (UUID); duplicate trả lại response cũ.

---

## Quy ước lỗi

```json
{
  "error": {
    "code": "atom_not_found",
    "message": "Atom <id> not found or not accessible",
    "details": { "atom_id": "..." },
    "request_id": "req_..."
  }
}
```

| HTTP | Khi nào |
|---|---|
| 400 | validation lỗi (Pydantic) |
| 401 | thiếu/hỏng token |
| 403 | RLS từ chối (không phải owner / member) |
| 404 | không tìm thấy resource |
| 409 | conflict idempotency / state |
| 422 | semantic không hợp lệ (ví dụ rate ngoài 1..4) |
| 429 | rate limit (per-user 60 req/phút mặc định, AI endpoint 10 req/phút) |
| 500 | lỗi server |
| 503 | provider AI tạm hỏng |

---

# 1. Auth

### `POST /auth/exchange`

Đổi token Supabase Auth → token nội bộ + ensure user mirror tồn tại.

**Request**

```json
{ "supabase_access_token": "..." }
```

**Response 200**

```json
{
  "user": { "id":"...", "email":"...", "display_name":"...", "locale":"vi", "timezone":"Asia/Ho_Chi_Minh", "onboarded_at": null },
  "access_token": "...",
  "expires_in": 3600
}
```

### `POST /auth/logout`

Vô hiệu refresh token phía Leafnote (Supabase tự xử lý phần còn lại).

### `GET /me`

Trả user hiện tại + summary nhanh: `unread_surfacing`, `due_today`, `pending_links`.

### `PATCH /me`

Cập nhật `display_name`, `locale`, `timezone`, `granularity_pref`.

---

# 2. Projects

### `GET /projects`

Query: `archived=false|true|all`, `sort=last_active|name`, `limit`, `cursor`.

**Response 200**

```json
{
  "items": [
    { "id":"...", "name":"Đồ án tốt nghiệp", "color":"#7AC74F",
      "is_archived": false, "last_active_at":"...", "atom_count": 312, "due_today": 14 }
  ],
  "next_cursor": null
}
```

### `POST /projects`

Body: `{ "name": "...", "description": "...", "color": "#..." }` → `201` trả project.

### `GET /projects/{id}`

### `PATCH /projects/{id}`

Đổi name/description/color/is_archived.

### `POST /projects/{id}:activate`

Đánh dấu project là **active context** cho session hiện tại. Server tính `context_embedding` mới và trả `session_id`. Mọi surfacing tiếp theo trong session ưu tiên project này.

**Response**

```json
{ "session_id":"...", "context_embedding_version": 4, "active_project_id":"..." }
```

### `DELETE /projects/{id}`

Soft-delete; atoms gắn project chỉ mất relevance, không bị xoá.

---

# 3. Notes & Capture

### `POST /notes`

Tạo note text. Chạy pipeline AI bất đồng bộ.

**Request**

```json
{
  "project_id": "...|null",
  "title": "optional",
  "content_md": "string",
  "language": "vi"
}
```

**Response 202**

```json
{
  "note_id":"...",
  "version": 1,
  "status":"processing",
  "jobs": [
    { "kind":"decompose", "id":"job_..." }
  ]
}
```

### `POST /notes/voice`  (`multipart/form-data`)

Field `audio` (mp3/m4a/wav, ≤ 25MB), `project_id?`, `language?`.
Server: tạo attachment → chạy STT → lưu transcript thành note → enqueue decompose. Trả ngay `note_id` với `status="processing"`.

### `POST /notes/image`  (`multipart/form-data`)

Field `image` (jpg/png/heic, ≤ 15MB), `project_id?`, `crop_hint?`.
OCR + post-process bằng LLM (sửa lỗi nhận dạng) → note.

### `POST /notes/web-clip`

Body: `{ "url":"...", "selection_html?":"..." }`. Server fetch + readability + sạch → note.

### `GET /notes`

Filter: `project_id`, `status`, `q` (full-text), `since`. Trả note kèm counts.

### `GET /notes/{id}`

Trả note kèm `current_version` content, danh sách atoms, jobs đang chạy.

### `PATCH /notes/{id}`

Body: `{ "title?": "...", "project_id?": "...", "content_md?": "..." }`. Nếu `content_md` thay đổi: tạo `note_version` mới + enqueue re-decompose **chỉ trên block thay đổi** (diff theo `text_hash`).

### `DELETE /notes/{id}`

Soft-delete. Atoms còn nguyên (vì có thể đã được trích/merge ở nơi khác); chỉ link gốc về note bị mất.

### `GET /notes/{id}/jobs`

Trạng thái pipeline cho note này.

### `GET /notes/{id}/stream` (SSE)

Server-Sent Events khi pipeline tiến triển:

```
event: atom.created   data: {"atom_id":"...","kind":"definition"}
event: link.proposed  data: {"from":"...","to":"...","link_type":"duplicate"}
event: note.ready     data: {"version":1}
```

---

# 4. Atoms

### `GET /atoms`

Filter: `project_id`, `kind`, `status`, `due_before`, `q`, `since`. Pagination cursor.

**Response item**

```json
{
  "id":"...", "kind":"definition", "text":"...", "language":"vi",
  "origin": { "note_id":"...", "block_id":"..." },
  "review": { "state":"review", "due_at":"2026-05-09T...", "stability":12.4, "difficulty":3.1 },
  "links_count": { "duplicate":0, "contradicts":1, "related":4 },
  "updated_at":"..."
}
```

### `GET /atoms/{id}`

Chi tiết đầy đủ: text, embedding model, recall_questions, link list, project relevances, lịch sử review (rút gọn).

### `PATCH /atoms/{id}`

Cho phép user sửa `text`, `kind`, `status` (active ↔ dormant), `meta.tags`. Khi `text` đổi → re-embed + invalidate questions.

### `POST /atoms/{id}:dismiss`

Body: `{ "reason":"not_useful|too_obvious|wrong" }`. Đặt status=dormant, ghi event để personalization học.

### `POST /atoms/{id}:revive`

Đảo ngược dismiss.

### `DELETE /atoms/{id}`

Soft-delete + cascade các link đề xuất.

### `POST /atoms:merge`

Hợp 2+ atoms thành 1.
**Request**

```json
{ "winner_id":"...", "loser_ids":["...","..."], "merged_text?":"..." }
```

Server: set `losers.status='merged_into'`, `merged_into_id=winner`, chuyển link & review history sang winner (union, max).

### `POST /atoms:split`

Chia 1 atom → nhiều atom (khi LLM gộp quá thô).
**Request**: `{ "atom_id":"...", "parts":[{"text":"...","kind":"..."}, ...] }`.

### `POST /atoms/search`

Vector search + filter.
**Request**

```json
{
  "query": "string|null",
  "embedding": [0.0]      // optional, client tự embed nếu muốn
  ,"filters": { "project_id":"...", "kind":["definition"], "status":["active"] }
  ,"k": 20
}
```

**Response**: list atoms + `score` (cosine).

---

# 5. Atom Links

### `GET /atoms/{id}/links`

Query: `state=proposed|accepted|rejected|all`, `link_type?`.

### `POST /atoms/{id}/links`

User tự tạo link.

```json
{ "to_atom_id":"...", "link_type":"refines", "note?":"..." }
```

### `POST /links/{link_id}:decide`

```json
{ "decision":"accept|reject", "merge?": true }
```

Nếu `link_type=duplicate` và `decision=accept`, có thể trigger merge tự động khi `merge=true`.

### `GET /links/proposed`

Inbox toàn cục những đề xuất AI đang chờ user xử lý. Sort theo `weight desc`.

---

# 6. Recall (Active Recall Feed)

### `GET /recall/today`

Trả batch câu hỏi cho hôm nay (theo timezone user). Thuật toán chọn:

1. Atoms `due_at <= now` (FSRS).
2. Bù thêm atoms `relevance > 0.7` cho project hoạt động (mục đích "ôn theo dự án").
3. Tối đa `target_count` (mặc định 20, có thể override `?limit=`).

**Response**

```json
{
  "session_id":"...",
  "items": [
    {
      "atom_id":"...",
      "question": { "id":"...", "qtype":"cloze", "prompt":"Trong FSRS, …{{c1::stability}}…", "expected":"stability" },
      "context_hint":"từ ghi chú 'Spaced repetition'"
    }
  ]
}
```

### `POST /recall/{atom_id}/answer`

```json
{
  "session_id":"...",
  "question_id":"...|null",
  "rating": 3,            // 1=Again 2=Hard 3=Good 4=Easy
  "time_taken_ms": 4200,
  "self_note?": "..."
}
```

Response: `next_due_at`, `new_state`, `accuracy_running` (per qtype).

### `POST /recall/{atom_id}/skip`

Skip không tính vào FSRS; ghi event để giảm priority surface trong ngày.

### `GET /recall/stats`

Query: `range=7d|30d|all`. Trả accuracy_by_qtype, retention_actual_vs_target, streak.

### `POST /recall/regenerate-questions/{atom_id}`

Bắt LLM sinh lại câu hỏi (khi user thấy chất lượng thấp). Rate-limited.

---

# 7. Surfacing (Context-Aware)

### `POST /surfacing/contextual`

Endpoint chính khi user đang viết / mở project / search.
**Request**

```json
{
  "context_kind": "note_editor|project|search|daily",
  "context_ref": "note_id|project_id|query_string|null",
  "draft_text?": "vài câu user vừa gõ",
  "project_id?": "...",
  "k": 8,
  "exclude_atom_ids?": ["..."]
}
```

Server: embed `draft_text` (nếu có), kết hợp với `session.context_embedding`, lookup pgvector, ranking với weight từ `user_cognitive_profiles.surfacing_weights`.

**Response**

```json
{
  "feed_id":"...",
  "items": [
    {
      "atom_id":"...",
      "text":"...",
      "reason":"due_soon|contradicts|related|dormant_revival",
      "score": 0.82,
      "links_to_draft": [{ "span":[12,48], "kind":"contradicts" }]
    }
  ]
}
```

### `POST /surfacing/{feed_id}/served`

Client báo các atom đã render trên màn (để personalization phân biệt "đã hiển thị nhưng bỏ qua" vs "chưa thấy").
Body: `{ "atom_ids":["..."] }`.

### `POST /surfacing/{feed_id}/interact`

```json
{ "atom_id":"...", "action":"open|copy|insert|dismiss", "dismiss_reason?":"not_relevant" }
```

### `GET /surfacing/daily`

Feed dạng "morning briefing" mobile: 3–5 atom đáng review nhất + 2 atom dormant đáng hồi sinh.

---

# 8. Knowledge Graph

### `GET /graph`

Query: `project_id?`, `kind?`, `min_links?`, `since?`, `limit=500`.
Trả node + edge gọn cho UI.

```json
{
  "nodes": [{"id":"...","kind":"definition","heat":"active|dormant|forgotten","text_short":"..."}],
  "edges": [{"from":"...","to":"...","type":"related","weight":0.71}]
}
```

### `GET /graph/clusters`

Phân cụm chủ đề (HDBSCAN trên embedding). Trả cluster id + top atoms + nhãn AI sinh.

### `GET /graph/timeline`

Snapshot graph theo tuần/tháng. Trả delta: nodes_added, nodes_cooled, top_growing_clusters.

### `GET /graph/atom/{id}/neighbors`

k-NN xung quanh 1 atom (dùng khi mở chi tiết).

---

# 9. Conflicts & Gaps

### `GET /knowledge/conflicts`

Trả danh sách atom_links có `link_type=contradicts, state=proposed` (việc cần quyết định).

### `GET /knowledge/gaps`

AI phát hiện khái niệm được nhắc nhưng chưa có atom. Mỗi item:

```json
{ "concept":"FSRS weights", "mentioned_in":[{"note_id":"...","span":[..]}], "suggestion":"Tạo atom mô tả ý nghĩa 17 trọng số" }
```

### `POST /knowledge/gaps/{id}:resolve`

`{ "action":"create_atom|dismiss", "atom_text?":"..." }`

---

# 10. Personalization (read-only debug & control)

### `GET /me/cognitive-profile`

Trả `accuracy_by_qtype`, `accuracy_by_kind`, `peak_hours`, `granularity_pref`, `surfacing_weights`, `topic_distribution` (top 10).

### `PATCH /me/cognitive-profile`

User override:

```json
{ "granularity_pref":"fine", "surfacing_weights":{"retention":0.6,"relevance":0.3,"novelty":0.1} }
```

### `GET /me/fsrs-params`

Tham số FSRS đang dùng (debug).

### `POST /me/refit`

Trigger refit FSRS + cognitive profile thủ công (rate limit 1 lần / 24h).

---

# 11. Search (toàn hệ thống)

### `GET /search`

Query: `q`, `scope=notes|atoms|all`, `project_id?`, `kind?`, `limit`.

- `q` ngắn → full-text + trigram.
- `q` dài → embed → vector search.
- Hỗn hợp: re-rank bằng RRF.

---

# 12. Events & Telemetry (client → server)

### `POST /events:batch`

Client log batch sự kiện UI để personalization học. Tối đa 100 event / request.

```json
{
  "events":[
    { "kind":"atom.opened", "subject_type":"atom", "subject_id":"...",
      "occurred_at":"...", "payload":{"source":"surfacing"}, "client":"web", "session_id":"..." }
  ]
}
```

Server validate `kind` thuộc whitelist; reject lặng nếu xấu.

---

# 13. Imports / Exports

### `POST /import/markdown`  (`multipart/form-data`)

Field `file` (.md hoặc .zip). Mỗi file → 1 note; foldered → project tự tạo.

### `POST /import/notion`

`{ "notion_export_zip_url":"..." }`. Worker tải, parse, chạy decompose.

### `GET /export`

Query `format=markdown|json`. Trả URL signed (file dump 24h).

---

# 14. Health & Ops

### `GET /health` → `{ "status":"ok","db":"ok","redis":"ok","ai":"degraded" }`

### `GET /version` → `{ "api":"1.4.2","model":"gpt-4o-mini@2025-09" }`

---

## Rate limits (mặc định / user)

| Nhóm | Limit |
|---|---|
| Read | 120 req/phút |
| Write thường | 60 req/phút |
| AI-bound (`POST /notes`, `POST /surfacing/contextual`, `regenerate-questions`) | 20 req/phút |
| Capture nặng (voice/image) | 10 req/phút |
| Refit | 1 / 24h |

429 trả `Retry-After` header.

## Webhooks (mở rộng tương lai, schema sẵn)

- `atom.created`, `atom.merged`, `link.proposed`, `surfacing.served`. Đăng ký bằng `POST /webhooks` với secret HMAC.

## Versioning

- URI versioning (`/v1/...`).
- Breaking change → `/v2`; non-breaking thêm field optional, không xoá field.
- Deprecation header: `Deprecation: true`, `Sunset: <date>`.
