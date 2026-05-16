# Database Schema — Leafnote

> Schema database ở mức high-level — các bảng chính, quan hệ, và index quan trọng. Chi tiết column và constraint bổ sung khi viết migration thật.

---

## users

| Column | Type | Constraints | Ghi chú |
|---|---|---|---|
| `id` | UUID | PK | = Supabase auth.users.id |
| `email` | TEXT | UNIQUE, NOT NULL, INDEX | Login credential |
| `display_name` | TEXT | NULLABLE | Tên hiển thị |
| `created_at` | TIMESTAMP | DEFAULT now() | Thời điểm tạo |

---

## tags

| Column | Type | Constraints | Ghi chú |
|---|---|---|---|
| `id` | UUID | PK | uuid4 default |
| `user_id` | UUID | FK → users.id, INDEX | Chủ sở hữu tag |
| `name` | TEXT | NOT NULL | Tên tag (lowercase, stripped, dash-separated) |
| `color` | TEXT | NOT NULL | Tên màu: amber/emerald/sky/violet/rose/zinc |
| `note_count` | INT | DEFAULT 0 | Số note gắn tag này |
| `access_count` | INT | DEFAULT 0 | Số lần được chọn trong picker (sort key) |
| `last_accessed` | TIMESTAMP | NULLABLE | Lần cuối user dùng tag |
| `created_at` | TIMESTAMP | DEFAULT now() | Timezone-aware (UTC) |
| `updated_at` | TIMESTAMP | DEFAULT now() | Timezone-aware (UTC) |

**Constraints**: `UniqueConstraint('user_id', 'name')` — tên tag unique per user.

**Index**: `ix_tags_user_id` trên `user_id`.

---

## notes

| Column | Type | Constraints | Ghi chú |
|---|---|---|---|
| `id` | UUID | PK | uuid4 default |
| `user_id` | UUID | FK → users.id, INDEX | Chủ sở hữu note |
| `title` | TEXT | NOT NULL, default `''` | Tiêu đề note |
| `body` | TEXT | NOT NULL, default `''` | Nội dung ghi chú (plain text) — nguồn chân lý |
| `plain_text` | TEXT | NOT NULL, default `''` | Bản sao của body — dùng cho search, sau này full-text search |
| `document_type` | VARCHAR(32) | NOT NULL, default `'theory'`, CHECK | enum đóng: theory/narrative/procedure/reference/meeting/freeform — route prompt leaf engine |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Timezone-aware (UTC) |
| `updated_at` | TIMESTAMPTZ | DEFAULT now(), onupdate | Timezone-aware (UTC) |

**Index**: `ix_notes_user_id` trên `user_id`.
**Constraint**: `ck_notes_document_type` — CHECK enum.
**Migration thêm `document_type`**: `m005_add_note_document_type.py`.

---

## note_tags

| Column | Type | Constraints | Ghi chú |
|---|---|---|---|
| `note_id` | UUID | FK → notes.id ON DELETE CASCADE, PK | |
| `tag_id` | UUID | FK → tags.id ON DELETE CASCADE, PK | |

**PK**: composite `(note_id, tag_id)` — bảng nối many-to-many.

---

## leaves

| Column | Type | Constraints | Ghi chú |
|---|---|---|---|
| `id` | UUID | PK | uuid4 default |
| `note_id` | UUID | FK → notes.id ON DELETE CASCADE | Note gốc; xoá note → xoá leaves |
| `user_id` | UUID | FK → users.id | Denormalized cho query nhanh per-user |
| `type` | VARCHAR(32) | NOT NULL, CHECK | enum đóng: definition/fact/example/question/note |
| `content` | TEXT | NOT NULL | Nội dung leaf (15..80 từ thường) |
| `metadata` | JSONB | NOT NULL, default `'{}'` | Tùy type: term/meaning/ordinal/source/format/polarity/parent_leaf_id |
| `confidence` | FLOAT | NOT NULL, default 1.0 | 0..1, AI tự đánh giá. <0.6 → badge "uncertain" trên FE |
| `user_edited` | BOOL | NOT NULL, default false | Đã sửa tay → bảo toàn khi regenerate |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now(), onupdate | |

**Index**: `ix_leaves_note_id` (note_id), `ix_leaves_user_created` (user_id, created_at).
**Constraint**: `ck_leaves_type` — CHECK enum.
**Migration**: `m006_create_leaves_table.py`.

---

## leaf_feedback

| Column | Type | Constraints | Ghi chú |
|---|---|---|---|
| `id` | UUID | PK | |
| `leaf_id` | UUID | FK → leaves.id ON DELETE CASCADE | |
| `user_id` | UUID | FK → users.id | |
| `rating` | VARCHAR(8) | NOT NULL, CHECK IN ('up','down') | Thumbs up/down để feed lại training round sau |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Index**: `ix_leaf_feedback_leaf_id`.
**Migration**: chung với `m006_create_leaves_table.py`.
