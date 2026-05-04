# Database Schema — Leafnote

> PostgreSQL 15+ với extension `pgvector`, `pg_trgm`, `uuid-ossp`, `pgcrypto`.
> Tất cả primary key dùng `uuid` v7 (sortable theo thời gian); timestamp dùng `timestamptz` UTC.
> Soft-delete chuẩn cho mọi entity người dùng tạo (cột `deleted_at`).

---

## Sơ đồ quan hệ tổng quan

```
users ─┬─ projects ─┬─ project_members
       │            └─ project_contexts (snapshot embedding)
       │
       ├─ notes ──── note_versions ──── note_blocks
       │     │
       │     └─ atoms ─┬─ atom_embeddings
       │              ├─ atom_links (self-ref, type=duplicate/conflict/related/refines)
       │              ├─ atom_reviews (FSRS state per atom-user)
       │              ├─ recall_questions
       │              └─ atom_project_relevance
       │
       ├─ events (mọi tương tác — append-only)
       ├─ user_cognitive_profiles (1-1, refit nightly)
       ├─ user_fsrs_params (1-1, fit từ atom_reviews)
       │
       └─ surfacing_feed (cache top-K cho mỗi user/context)
```

---

## 1. `users`

Tài khoản gốc. Auth uỷ quyền cho Supabase Auth nhưng vẫn lưu mirror để FK.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | `gen_random_uuid()` | PK |
| `email` | citext | no | — | unique |
| `display_name` | text | yes | — | |
| `avatar_url` | text | yes | — | |
| `locale` | text | no | `'vi'` | i18n cho LLM prompt |
| `timezone` | text | no | `'Asia/Ho_Chi_Minh'` | dùng để tính "ngày hôm nay" cho recall feed |
| `onboarded_at` | timestamptz | yes | — | đánh dấu hoàn tất onboarding |
| `created_at` | timestamptz | no | `now()` | |
| `updated_at` | timestamptz | no | `now()` | trigger |
| `deleted_at` | timestamptz | yes | — | |

Indexes: `unique(email) where deleted_at is null`.

---

## 2. `projects`

Workspace ngữ cảnh. **Quan trọng** vì relevance axis được tính theo project đang hoạt động.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `owner_id` | uuid | no | — | FK → users |
| `name` | text | no | — | |
| `description` | text | yes | — | |
| `color` | text | yes | — | hex để hiển thị |
| `is_archived` | boolean | no | `false` | archived = relevance đóng băng |
| `last_active_at` | timestamptz | yes | — | cập nhật khi user mở/edit |
| `context_embedding` | vector(1536) | yes | — | trung bình embedding các note gần nhất, refresh khi capture |
| `created_at` / `updated_at` / `deleted_at` | timestamptz | … | … | |

Indexes:

- `btree(owner_id, last_active_at desc)`
- `ivfflat(context_embedding) where deleted_at is null`

---

## 3. `project_members`

Cho phép share project (hậu MVP, nhưng cần schema sẵn để tránh migration đau).

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `project_id` | uuid | no | — | PK part 1 |
| `user_id` | uuid | no | — | PK part 2 |
| `role` | text | no | `'owner'` | enum: owner / editor / viewer |
| `joined_at` | timestamptz | no | `now()` | |

---

## 4. `notes`

Container gốc do người dùng tạo. **Note không phải đơn vị tri thức** — atom mới là.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `owner_id` | uuid | no | — | FK → users |
| `project_id` | uuid | yes | — | FK → projects (null = inbox cá nhân) |
| `title` | text | yes | — | có thể trống, AI sinh nếu thiếu |
| `source_type` | text | no | `'text'` | enum: text / voice / image / web_clip / import |
| `source_ref` | text | yes | — | URL audio/image trong storage, hoặc nguồn web |
| `language` | text | no | `'vi'` | detect khi capture |
| `current_version` | int | no | `1` | trỏ note_versions |
| `status` | text | no | `'processing'` | enum: processing / ready / failed |
| `processing_error` | text | yes | — | nếu pipeline AI fail |
| `created_at` / `updated_at` / `deleted_at` | timestamptz | … | … | |

Indexes:

- `btree(owner_id, project_id, updated_at desc)`
- `gin(to_tsvector('simple', coalesce(title,'')))` cho search nhanh.

---

## 5. `note_versions`

Mỗi lần edit lớn tạo version mới (để re-decompose idempotent và rollback).

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `note_id` | uuid | no | — | FK → notes |
| `version` | int | no | — | tăng dần |
| `content_md` | text | no | — | nội dung chuẩn hoá Markdown |
| `content_hash` | text | no | — | sha256 của `content_md`, dùng để dedup job |
| `created_by` | uuid | no | — | user gây thay đổi |
| `created_at` | timestamptz | no | `now()` | |

Unique: `(note_id, version)`. Index: `unique(note_id, content_hash)` để bỏ qua re-decompose nếu nội dung không đổi.

---

## 6. `note_blocks`

Block-level structure của một version (heading, paragraph, list item, code, callout). Cần thiết để:

- Map atom ngược về vị trí trong note (highlight UI).
- Re-decompose chỉ block đã đổi (incremental).

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `note_version_id` | uuid | no | — | FK |
| `position` | int | no | — | thứ tự trong note |
| `block_type` | text | no | — | heading / paragraph / list_item / code / quote / callout |
| `text` | text | no | — | plain text của block |
| `text_hash` | text | no | — | sha256, dùng diff incremental |
| `meta` | jsonb | yes | — | level heading, lang code, … |

Indexes: `btree(note_version_id, position)`, `btree(text_hash)`.

---

## 7. `atoms`

**Bảng quan trọng nhất.** Mỗi hàng = một hạt tri thức nguyên tử.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `owner_id` | uuid | no | — | FK → users (denormalize để query nhanh) |
| `origin_note_id` | uuid | yes | — | FK → notes (null nếu atom được merge từ nhiều note) |
| `origin_block_id` | uuid | yes | — | FK → note_blocks |
| `kind` | text | no | — | enum: proposition / definition / relation / fact / question / procedure |
| `text` | text | no | — | nội dung hạt, đã chuẩn hoá |
| `text_canonical` | text | no | — | lowercase, bỏ dấu phụ — dùng dedupe nhanh |
| `text_hash` | text | no | — | sha256(text_canonical) |
| `language` | text | no | `'vi'` | |
| `confidence` | real | no | `1.0` | LLM trả về độ tin cậy decompose |
| `status` | text | no | `'active'` | active / dormant / merged_into / archived |
| `merged_into_id` | uuid | yes | — | nếu status=merged_into, trỏ về atom thắng |
| `meta` | jsonb | yes | — | tags, source span, model version |
| `created_at` / `updated_at` / `deleted_at` | timestamptz | … | … | |

Indexes:

- `btree(owner_id, status, updated_at desc)` — feed.
- `unique(owner_id, text_hash) where status='active'` — chống tạo trùng tuyệt đối.
- `gin(to_tsvector('simple', text))` — full-text fallback.
- `btree(origin_note_id)`.

---

## 8. `atom_embeddings`

Tách bảng để dễ tái sinh khi đổi model embedding (chỉ truncate bảng này).

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `atom_id` | uuid | no | — | PK + FK |
| `model` | text | no | — | ví dụ `text-embedding-3-small@v1` |
| `dim` | int | no | — | 1536 / 768 |
| `embedding` | vector(1536) | no | — | (cột riêng cho từng dim nếu nhiều model) |
| `created_at` | timestamptz | no | `now()` | |

Indexes: `hnsw(embedding vector_cosine_ops)` với `m=16, ef_construction=200`.

---

## 9. `atom_links`

Quan hệ giữa các atom. Tự sinh từ pipeline AI hoặc do người dùng xác nhận.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `from_atom_id` | uuid | no | — | FK |
| `to_atom_id` | uuid | no | — | FK |
| `link_type` | text | no | — | duplicate / refines / contradicts / related / supports |
| `weight` | real | no | `0.0` | cosine similarity hoặc score AI |
| `source` | text | no | — | enum: ai / user |
| `state` | text | no | `'proposed'` | proposed / accepted / rejected |
| `decided_by` | uuid | yes | — | user xử lý |
| `decided_at` | timestamptz | yes | — | |
| `created_at` | timestamptz | no | `now()` | |

Constraints:

- `check (from_atom_id <> to_atom_id)`.
- `unique(from_atom_id, to_atom_id, link_type)`.

Indexes: `btree(from_atom_id)`, `btree(to_atom_id)`, partial `where state='proposed'` để hiển thị "việc cần quyết định".

---

## 10. `atom_reviews`

**FSRS state per atom-user.** Một atom thuộc 1 user nên cặp `(atom_id, user_id)` thực ra trùng owner; vẫn giữ `user_id` để query nhanh.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `atom_id` | uuid | no | — | PK part |
| `user_id` | uuid | no | — | PK part |
| `stability` | real | no | `0` | tham số FSRS |
| `difficulty` | real | no | `0` | |
| `state` | text | no | `'new'` | new / learning / review / relearning |
| `last_review_at` | timestamptz | yes | — | |
| `due_at` | timestamptz | yes | — | thời điểm sắp quên |
| `lapses` | int | no | `0` | số lần quên |
| `reps` | int | no | `0` | tổng số lần ôn |
| `last_rating` | smallint | yes | — | 1=Again / 2=Hard / 3=Good / 4=Easy |
| `updated_at` | timestamptz | no | `now()` | |

Indexes:

- `btree(user_id, due_at)` — query "due hôm nay".
- `btree(user_id, state)`.

---

## 11. `recall_questions`

Mỗi atom có thể có nhiều câu hỏi (cloze, định nghĩa ngược, ứng dụng). AI sinh, cache để không gọi lại LLM mỗi review.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `atom_id` | uuid | no | — | FK |
| `qtype` | text | no | — | cloze / reverse_def / application / true_false |
| `prompt` | text | no | — | câu hỏi hiển thị |
| `expected` | text | no | — | đáp án mẫu để so khớp / hiển thị sau |
| `meta` | jsonb | yes | — | vị trí cloze, hint, … |
| `model_version` | text | no | — | track để regen khi nâng prompt |
| `created_at` | timestamptz | no | `now()` | |

Index: `btree(atom_id, qtype)`.

---

## 12. `recall_answers`

Append-only — mỗi lần user trả lời 1 câu hỏi.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `user_id` | uuid | no | — | FK |
| `atom_id` | uuid | no | — | FK |
| `question_id` | uuid | yes | — | FK (null nếu user tự đánh giá thẳng atom) |
| `rating` | smallint | no | — | 1..4 (Again/Hard/Good/Easy) |
| `time_taken_ms` | int | yes | — | |
| `client` | text | no | — | web / mobile |
| `created_at` | timestamptz | no | `now()` | |

Indexes: `btree(user_id, created_at desc)`, `btree(atom_id, created_at desc)`.

---

## 13. `atom_project_relevance`

Điểm relevance của atom với project — refresh bởi job hoặc real-time khi user mở project.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `atom_id` | uuid | no | — | PK part |
| `project_id` | uuid | no | — | PK part |
| `score` | real | no | `0.0` | 0..1 |
| `last_seen_at` | timestamptz | yes | — | lần gần nhất surfacing trong project này |
| `last_used_at` | timestamptz | yes | — | lần gần nhất user mở/copy/tham chiếu |
| `updated_at` | timestamptz | no | `now()` | |

Indexes: `btree(project_id, score desc)`.

---

## 14. `surfacing_feed`

Cache top-K hạt cần surface cho mỗi (user, context). Tránh tính lại mỗi keystroke.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `user_id` | uuid | no | — | FK |
| `context_kind` | text | no | — | project / note_editor / search / daily |
| `context_ref` | text | yes | — | project_id / note_id / query |
| `atom_id` | uuid | no | — | FK |
| `reason` | text | no | — | enum: due_soon / contradicts / related / dormant_revival |
| `score` | real | no | — | tổng hợp retention+relevance+novelty |
| `expires_at` | timestamptz | no | — | invalidate khi đến hạn hoặc khi atom đổi |
| `served_at` | timestamptz | yes | — | đã hiển thị cho user |
| `interacted` | boolean | no | `false` | user click / dismiss có chủ đích |
| `created_at` | timestamptz | no | `now()` | |

Indexes: `btree(user_id, context_kind, context_ref, score desc)`, `btree(expires_at)`.

---

## 15. `events`

Append-only, **nguồn dữ liệu duy nhất** cho personalization. Không update, không delete (chỉ partition theo tháng).

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | bigserial | no | — | PK |
| `user_id` | uuid | no | — | FK |
| `kind` | text | no | — | xem enum bên dưới |
| `subject_type` | text | yes | — | atom / note / project / question |
| `subject_id` | uuid | yes | — | |
| `payload` | jsonb | yes | — | chi tiết riêng cho từng kind |
| `client` | text | no | — | web / mobile / worker |
| `session_id` | uuid | yes | — | gom theo phiên dùng |
| `occurred_at` | timestamptz | no | `now()` | |

Enum `kind` (mở rộng dần):

- `note.created`, `note.edited`, `note.opened`
- `atom.created`, `atom.merged`, `atom.dismissed`, `atom.opened`, `atom.copied`
- `recall.served`, `recall.answered`, `recall.skipped`
- `surfacing.served`, `surfacing.clicked`, `surfacing.dismissed`
- `project.opened`, `project.archived`
- `link.proposed`, `link.accepted`, `link.rejected`

Partition: `partition by range(occurred_at)` theo tháng. Indexes mỗi partition: `btree(user_id, occurred_at desc)`, `btree(kind)`.

---

## 16. `user_fsrs_params`

Tham số FSRS đã fit per-user. Cập nhật bởi nightly job khi đủ ≥50 review.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `user_id` | uuid | no | — | PK |
| `weights` | real[] | no | — | 17 trọng số FSRS |
| `request_retention` | real | no | `0.9` | mục tiêu retention người dùng |
| `maximum_interval` | int | no | `36500` | ngày |
| `fitted_at` | timestamptz | yes | — | |
| `n_reviews_used` | int | no | `0` | size sample khi fit |
| `created_at` / `updated_at` | timestamptz | … | … | |

---

## 17. `user_cognitive_profiles`

Hồ sơ nhận thức tổng hợp — feature vector dùng cho ranking surfacing.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `user_id` | uuid | no | — | PK |
| `accuracy_by_qtype` | jsonb | no | `'{}'` | `{cloze:0.78, reverse_def:0.62,…}` |
| `accuracy_by_kind` | jsonb | no | `'{}'` | per atom kind |
| `optimal_session_length_min` | int | yes | — | suy ra từ time_taken_ms |
| `peak_hours` | int[] | yes | — | giờ trong ngày user trả lời tốt nhất |
| `granularity_pref` | text | no | `'medium'` | coarse / medium / fine — điều chỉnh decompose |
| `surfacing_weights` | jsonb | no | — | `{retention:0.5, relevance:0.3, novelty:0.2}` |
| `topic_distribution` | jsonb | no | `'{}'` | top topic embedding clusters và weight |
| `fitted_at` | timestamptz | yes | — | |
| `updated_at` | timestamptz | no | `now()` | |

---

## 18. `ai_jobs`

Theo dõi pipeline (decompose / embed / generate_q / link). Idempotent qua `dedup_key`.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `user_id` | uuid | no | — | FK |
| `kind` | text | no | — | decompose / embed / generate_q / link / fit_fsrs / fit_profile |
| `subject_type` | text | no | — | note_version / atom / user |
| `subject_id` | uuid | no | — | |
| `dedup_key` | text | no | — | ví dụ `decompose:{note_version_id}:{model_version}` |
| `state` | text | no | `'queued'` | queued / running / done / failed |
| `attempt` | int | no | `0` | |
| `last_error` | text | yes | — | |
| `started_at` / `finished_at` | timestamptz | yes | — | |
| `created_at` | timestamptz | no | `now()` | |

Unique: `unique(dedup_key)`. Index: `btree(user_id, kind, state)`.

---

## 19. `attachments`

Voice / image gốc. URL trỏ Supabase Storage.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `owner_id` | uuid | no | — | FK |
| `note_id` | uuid | yes | — | FK |
| `kind` | text | no | — | audio / image |
| `mime` | text | no | — | |
| `bytes` | bigint | no | — | |
| `storage_path` | text | no | — | |
| `transcript` | text | yes | — | STT/OCR result, lưu để không phải gọi lại |
| `created_at` | timestamptz | no | `now()` | |

---

## 20. `sessions`

Phiên làm việc client. Quan trọng để tính context embedding ngắn hạn.

| column | type | nullable | default | notes |
|---|---|---|---|---|
| `id` | uuid | no | gen | PK |
| `user_id` | uuid | no | — | FK |
| `client` | text | no | — | web / mobile |
| `started_at` | timestamptz | no | `now()` | |
| `last_seen_at` | timestamptz | no | `now()` | |
| `active_project_id` | uuid | yes | — | FK |
| `context_embedding` | vector(1536) | yes | — | trung bình embedding nội dung 7 ngày trở lại + project hiện tại |

Index: `btree(user_id, last_seen_at desc)`.

---

## Constraint & quy ước chung

- **FK** đều `on delete cascade` cho dữ liệu thuộc về user (notes, atoms, …) khi user bị xoá; **không** cascade cho `events` (giữ audit, set null).
- **Soft-delete** (`deleted_at`) cho notes / atoms / projects. View `*_active` được tạo lọc sẵn.
- **Row-Level Security** bật trên mọi bảng có `owner_id` / `user_id`; policy cơ bản: user chỉ thấy hàng có `owner_id = auth.uid()`. `project_members` mở rộng cho viewer.
- **Trigger** `set_updated_at` chuẩn cho mọi bảng có cột `updated_at`.
- **Timezone**: lưu UTC, convert ở tầng service theo `users.timezone`.

## Migration phases

1. **M001 init**: users, projects, notes, note_versions, note_blocks, attachments, sessions.
2. **M002 atoms**: atoms, atom_embeddings, atom_links, recall_questions.
3. **M003 review loop**: atom_reviews, recall_answers, user_fsrs_params.
4. **M004 surfacing**: surfacing_feed, atom_project_relevance.
5. **M005 personalization**: events (partitioned), user_cognitive_profiles, ai_jobs.
6. **M006 hardening**: indexes pgvector HNSW, partial indexes, RLS policies, materialized view "graph snapshot".
