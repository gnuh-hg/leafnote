# ROADMAP — Leafnote

> Lộ trình tính năng dài hạn. Mỗi mốc là một phase trong [`PHASE.md`](PHASE.md), kèm các năng lực mới mà phase đó mở khoá. Timeline tham chiếu (estimate) tính cho 1 người làm sau giờ học (~10–15h/tuần) — sẽ chỉnh khi vào sprint thật.

---

## Tầm nhìn

Biến ghi chú từ "nghĩa địa tri thức" thành **hạt tri thức sống** — tự liên kết, tự ôn, tự nổi lên đúng lúc cần. Người dùng càng dùng lâu, hệ thống càng "hiểu" và phục vụ cá nhân tốt hơn — đo được, không phải khẩu hiệu.

---

## M0 — Pre-project (đang ở đây)

**Đầu ra**: Tài liệu nền + MVP scope chốt + wireframe.
**Estimate**: ~1–2 tuần.
**Định nghĩa hoàn thành**: tiêu chí thoát phase trong [`PHASE.md`](PHASE.md).

---

## M1 — Scaffolding

**Mục tiêu**: Repo chạy được "Hello world" 3 nhánh (backend, web, mobile), có CI và auth khung.
**Estimate**: ~2 tuần.

Năng lực mới:

- Repo monorepo (hoặc đa repo) với cấu trúc theo `information/project-structure.md`.
- Backend FastAPI khởi động được, có `/health`, có Alembic migration M001 (users + projects + notes + sessions).
- Web React + Vite mở được trang trống có routing và đăng nhập Supabase Auth.
- Mobile React Native (Expo) mở được trên Expo Go, đăng nhập Supabase Auth.
- CI GitHub Actions: lint + test stub + deploy preview (web).
- Sentry + PostHog tích hợp khung.

**Không có trong M1**: pipeline AI, atoms, recall, surfacing, graph.

---

## M2 — Capture & Note (chưa có AI)

**Mục tiêu**: Người dùng tạo & quản lý note đa kênh, đa nền tảng. Chưa có hạt.
**Estimate**: ~3 tuần.

Năng lực mới (các story P0 trong epic E1, E2):

- Tạo / sửa / xoá note text trên web & mobile (S-2.1, S-2.6).
- Capture voice trên mobile → STT → note (S-2.2).
- Capture ảnh → OCR → note (S-2.3).
- Project quản lý + activate context (S-1.3, S-2.6).
- Sync giữa web và mobile (S-X.3 mức cơ bản).
- Auth flow đầy đủ + xoá tài khoản (S-1.1, S-X.1).

**Bảng DB** thực sự lên prod: M001 + một phần M002 (chỉ `notes`, `note_versions`, `note_blocks`, `attachments`).

---

## M3 — Atomic Engine (core feature)

**Mục tiêu**: Note → atoms tự động. Đây là milestone định nghĩa Leafnote là Leafnote.
**Estimate**: ~3 tuần.

Năng lực mới:

- Pipeline decompose (Celery): note → block → atoms.
- Embedding pgvector + HNSW.
- Streaming kết quả về client (SSE) — story S-3.1.
- UI panel atoms cạnh editor: highlight ngược về đoạn gốc, edit, gộp/tách.
- Đề xuất duplicate / contradicts / related (S-3.2) — chỉ phát hiện, chưa hồi sinh dormant.
- Idempotency + ai_jobs.

**Bảng DB**: hoàn tất M002.

---

## M4 — Review Loop (FSRS + Active Recall)

**Mục tiêu**: Người dùng ôn được tri thức đã capture, có lịch ôn cá nhân.
**Estimate**: ~2 tuần.

Năng lực mới:

- Sinh câu hỏi tự động cho mỗi atom (cloze / reverse_def / application) — S-3.4.
- Recall feed mobile hằng ngày + notification (S-3.3).
- FSRS scheduler per-atom; chưa fit per-user.
- `recall_answers` + cập nhật stability/difficulty.
- Stats (`/recall/stats`) — accuracy, streak.

**Bảng DB**: M003.

---

## M5 — Surfacing & Knowledge Graph (chưa cá nhân)

**Mục tiêu**: Hạt nổi lên đúng ngữ cảnh, người dùng thấy được mạng tri thức.
**Estimate**: ~3 tuần.

Năng lực mới:

- `POST /surfacing/contextual` cho editor — S-3.5.
- Daily surfacing (morning briefing) — S-3.6 (dạng đơn giản).
- Dormant ↔ active toggle (S-3.6).
- Graph viewer web (Cytoscape/react-force-graph) — node + edge.
- Conflicts inbox (`/knowledge/conflicts`).

**Bảng DB**: M004.

---

## M6 — Personalization Loop (yếu tố thi)

**Mục tiêu**: Sau ≥ 50 review per-user, hệ thống thể hiện rõ sự cá nhân hoá.
**Estimate**: ~2 tuần.

Năng lực mới:

- Job nightly fit FSRS params per-user — S-4.1.
- Job nightly cập nhật cognitive profile (accuracy_by_qtype/kind, peak_hours, granularity_pref).
- Surfacing dùng weights cá nhân, có giải thích lý do — S-4.6.
- Trang `/me/cognitive-profile` minh bạch.
- Events partition + reliable ingest.

**Bảng DB**: M005.

**Demo thi được tại đây**: chứng minh cùng input note → 2 user khác nhau → kết quả khác nhau (success criteria #1).

---

## M7 — Long-term knowledge (sau MVP)

Năng lực mới (các story P1 trong epic E5):

- Bản đồ tri thức theo thời gian (timeline) — S-5.1.
- Phát hiện gap kiến thức — S-5.2.
- Hồi sinh atom dormant đúng ngữ cảnh — S-5.3.
- Granularity decompose tự điều chỉnh — S-4.3.
- Format câu hỏi thích nghi — S-4.2.
- Peak hours notification — S-4.5.

---

## M8 — Polish & Public

Năng lực mới:

- Web clip extension (S-2.4).
- Import Markdown / Notion (S-2.5).
- Export Markdown / JSON.
- Báo cáo retrospective hằng quý (S-5.5).
- Export atom curated cho cluster (S-5.4).
- Accessibility hoàn chỉnh (S-X.5).
- Landing page + demo video + slide thuyết trình thi.

---

## Đường găng (critical path) cho thi cử

Để có demo thuyết phục cho cuộc thi, **đường găng** là: **M1 → M2 → M3 → M4 → M6**.
M5 (graph) và M7 nâng cao đẹp hơn nhưng không làm demo thi sống được nếu thiếu personalization (M6).

> Nếu thiếu thời gian: cắt M5-graph trước, giữ M6 — vì chấm thi **đo được** sự khác biệt của AI mới là điểm thuyết phục.

---

## Quyết định cần đưa ra trước M1

1. Monorepo (pnpm workspaces) hay đa repo? (Đề xuất: monorepo, dễ share types).
2. Database hosted: Supabase free tier có đủ pgvector HNSW? (Cần test).
3. LLM provider chính: OpenAI vs Anthropic? (Cost vs Vietnamese quality).
4. Có cần i18n EN từ M1 hay chỉ VI cho thi? (Đề xuất: VI trước, kiến trúc sẵn cho i18n).

→ Các quyết định này thuộc gate "thoát pre-project".
