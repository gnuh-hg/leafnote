# Architecture — Leafnote

## Tổng quan

Leafnote là kiến trúc client-server đa nền tảng (web + mobile) với một backend FastAPI duy nhất, một pipeline AI bất đồng bộ, và một Postgres + pgvector làm nguồn sự thật chung.

```
┌──────────────┐     ┌──────────────┐
│  Web (React) │     │ Mobile (RN)  │
└──────┬───────┘     └──────┬───────┘
       │  HTTPS / REST + SSE │
       └──────────┬──────────┘
                  ▼
         ┌─────────────────┐
         │  FastAPI (API)  │
         └────┬─────────┬──┘
              │         │
       ┌──────▼──┐  ┌───▼──────────┐
       │ Postgres│  │ Celery Queue │
       │ pgvector│  │   (Redis)    │
       └─────────┘  └──┬───────────┘
                       │
              ┌────────▼─────────┐
              │ AI Workers       │
              │  - Decompose     │
              │  - Embed         │
              │  - Generate Q    │
              │  - FSRS fit      │
              └────────┬─────────┘
                       │
                ┌──────▼──────┐
                │ LLM / STT / │
                │ OCR providers│
                └─────────────┘
```

## Các tầng chính

### 1. Presentation

- **Web**: React + Tiptap editor, knowledge graph view, project workspace.
- **Mobile**: React Native, capture nhanh + recall feed + thông báo.
- Cả hai cùng dùng `services/` gọi REST API; share TypeScript types từ OpenAPI schema.

### 2. API Layer (`backend/app/api/v1/routes/`)

Endpoint mỏng, **không** chứa business logic. Mỗi route validate input (Pydantic), gọi service tương ứng, trả response.

### 3. Service Layer (`backend/app/services/`) — nơi tập trung logic

- `services/notes/` — CRUD note, lưu ảnh/voice raw.
- `services/atoms/` — quản lý vòng đời hạt (create, merge, conflict-resolve).
- `services/ai/` — abstraction cho LLM, embedding, STT, OCR; có thể swap provider.
- `services/scheduler/` — FSRS fit per-user, tính lịch ôn hạt.
- `services/surfacing/` — chấm điểm relevance, chọn hạt để đẩy ra UI.
- `services/graph/` — query knowledge graph, snapshot tiến hoá.

### 4. Pipeline AI (Celery workers)

Khi note được tạo/cập nhật:

1. **Task `decompose_note`**: gọi LLM → trả ra danh sách atom proposals (mệnh đề + loại).
2. **Task `embed_atoms`**: gọi embedding API → ghi vào pgvector.
3. **Task `link_atoms`**: tìm k-NN trong graph người dùng, đánh dấu trùng/mâu thuẫn.
4. **Task `generate_recall`**: sinh câu hỏi cloze/định nghĩa ngược cho mỗi atom.
5. **Task `update_relevance`** (cron): cập nhật relevance score dựa trên project đang hoạt động.

### 5. Personalization Loop

Mỗi tương tác (review answer, mở atom, copy atom, dismiss surfacing) ghi vào bảng `events`. Nightly job:

- Fit lại tham số FSRS per-user.
- Cập nhật profile nhận thức (recall accuracy theo loại câu hỏi, theo chủ đề, theo độ dài atom).
- Cập nhật weight surfacing (retention vs relevance vs novelty).

### 6. Storage

- **Postgres** — quan hệ chính.
- **pgvector** — embedding atoms (HNSW index).
- **Supabase Storage** — voice/image blobs.
- **Redis** — Celery queue + cache surfacing feed.

## Luồng nghiệp vụ trọng yếu

### Capture → Atom

1. Mobile gửi `POST /v1/notes` (text/voice/image).
2. Voice → STT, image → OCR (sync hoặc deferred).
3. Note lưu raw, trả `note_id` ngay.
4. Job `decompose_note` enqueue → atoms tạo dần, client subscribe SSE để nhận update.

### Surfacing trong editor

1. User mở project hoặc gõ trong editor.
2. Web gửi context embedding (debounced) tới `POST /v1/surfacing/contextual`.
3. Service truy vấn pgvector + bảng review-state → chọn top-K atoms phù hợp (retention sắp quên + relevance cao + chưa surface gần đây).
4. Trả về list atom đính kèm lý do surface ("sắp quên", "mâu thuẫn", "liên quan").

### Active Recall

1. Mobile gọi `GET /v1/recall/today` → list câu hỏi do scheduler chọn.
2. User trả lời → `POST /v1/recall/{atom_id}/answer` với điểm tự đánh giá (Again/Hard/Good/Easy).
3. Service cập nhật state FSRS của atom + ghi event để fit lại profile.

## Nguyên tắc kiến trúc

- **Atom là first-class citizen**, note chỉ là container gốc.
- **Idempotency** cho mọi job AI (dùng `note_version` + `atom_hash`).
- **Provider-agnostic** ở tầng AI: code chỉ thấy interface `LLMClient`, `Embedder`, `STT`, `OCR`.
- **Personalization tách khỏi pipeline chính**: sự cố ở job fit profile không được làm hỏng capture / review.
