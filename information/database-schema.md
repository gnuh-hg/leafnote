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
