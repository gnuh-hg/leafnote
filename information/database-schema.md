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
