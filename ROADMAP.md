# ROADMAP — Leafnote

> Lộ trình và trạng thái dự án. Estimate tính cho 1 người làm sau giờ học (~10–15h/tuần).

---

## Trạng thái hiện tại: `scaffolding` 🏗️

**Bắt đầu**: 2026-05-04
**Mục tiêu**: Repo chạy được "Hello world" 2 nhánh (backend, web), có CI và auth Supabase.

### Đã làm

- [x] Toàn bộ tài liệu nền trong `information/`.
- [x] Cấu trúc repo: `backend/` + `frontend/`, không dùng pnpm workspaces.
- [x] Backend FastAPI: `/health`, `core/`, `api/v1/`, Alembic init.
- [x] Frontend: React + Vite + Supabase Auth + routing + `/me`.
- [x] CI GitHub Actions: lint + test + build.

### Gate để chuyển sang `mvp-dev`

- [ ] `curl .../v1/health` → 200 (deployed).
- [ ] Web Vercel mở được, đăng nhập Google → có session.
- [ ] CI xanh trên `main`.

### Quy tắc khi chuyển phase

1. Ghi entry vào `.claude/memory/context.md` — ngày, lý do, gì còn nợ.
2. Cập nhật bảng trạng thái file trong `CLAUDE.md`.
3. Cập nhật section "Trạng thái hiện tại" ở trên.

---

## Tầm nhìn

Biến ghi chú từ "nghĩa địa tri thức" thành **lá tri thức sống** — tự liên kết, tự ôn, tự nổi lên đúng lúc cần. Người dùng càng dùng lâu, hệ thống càng "hiểu" và phục vụ cá nhân tốt hơn — đo được, không phải khẩu hiệu.

---

## M1 — Scaffolding ← đang ở đây

**Mục tiêu**: Repo chạy được "Hello world" 2 nhánh (backend, web), có CI và auth khung.
**Estimate**: ~2 tuần.

Năng lực mới:

- Repo `backend/` + `frontend/` với cấu trúc theo `information/project-structure.md`.
- Backend FastAPI khởi động được, có `/health`, có Alembic migration M001.
- Web React + Vite mở được trang trống có routing và đăng nhập Supabase Auth.
- CI GitHub Actions: lint + test stub + deploy preview (web).
- Sentry + PostHog tích hợp khung.

---

## M2 — Capture & Note (chưa có AI)

**Mục tiêu**: Người dùng tạo & quản lý note đa kênh trên web. Chưa có hạt.
**Estimate**: ~3 tuần.

Năng lực mới:

- Tạo / sửa / xoá note text trên web (S-2.1, S-2.6).
- Capture voice (MediaRecorder) → Whisper STT → note (S-2.2).
- Upload ảnh → OCR → note (S-2.3).
- Project quản lý + activate context (S-1.3, S-2.6).
- Auth flow đầy đủ + xoá tài khoản (S-1.1, S-X.1).

---

## M3 — Leaf Engine (core feature)

**Mục tiêu**: Note → leaves tự động. Đây là milestone định nghĩa Leafnote là Leafnote.
**Estimate**: ~3 tuần.

Năng lực mới:

- Pipeline decompose (Celery): note → block → leaves.
- Embedding pgvector + HNSW.
- Streaming kết quả về client (SSE) — story S-3.1.
- UI panel leaves cạnh editor: highlight ngược về đoạn gốc, edit, gộp/tách.
- Đề xuất duplicate / contradicts / related (S-3.2).
- Idempotency + ai_jobs.

---

## M4 — Review Loop (FSRS + Active Recall)

**Mục tiêu**: Người dùng ôn được tri thức đã capture, có lịch ôn cá nhân.
**Estimate**: ~2 tuần.

Năng lực mới:

- Sinh câu hỏi tự động cho mỗi leaf (cloze / reverse_def / application) — S-3.4.
- Recall feed web hằng ngày (S-3.3).
- FSRS scheduler per-leaf; chưa fit per-user.
- `recall_answers` + cập nhật stability/difficulty.
- Stats (`/recall/stats`) — accuracy, streak.

---

## M5 — Surfacing

**Mục tiêu**: Hạt nổi lên đúng ngữ cảnh khi viết.
**Estimate**: ~2–3 tuần.

Năng lực mới:

- `POST /surfacing/contextual` cho editor — S-3.5.
- Daily surfacing web — S-3.6 (dạng đơn giản).
- Dormant ↔ active toggle (S-3.6).

> Graph view hoãn khỏi MVP.

---

## M6 — Personalization Loop (yếu tố thi)

**Mục tiêu**: Sau ≥ 50 review per-user, hệ thống thể hiện rõ sự cá nhân hoá.
**Estimate**: ~2 tuần.

Năng lực mới:

- Job nightly fit FSRS params per-user — S-4.1.
- Job nightly cập nhật cognitive profile (accuracy_by_qtype/kind, peak_hours, granularity_pref).
- Surfacing dùng weights cá nhân, có giải thích lý do — S-4.6.
- Trang `/me/cognitive-profile` minh bạch.

**Demo thi được tại đây**: cùng input note → 2 user khác nhau → kết quả khác nhau.

---

## M7 — Alpha & Polish

**Mục tiêu**: 3–5 user thật dùng, không sập. Slide + video demo.
**Estimate**: ~4 tuần.

Năng lực mới:

- Onboarding hoàn thiện.
- Crash-free ≥ 99% theo Sentry.
- Landing page + video demo 2–3 phút + slide thi.

---

## Đường găng cho thi cử

**M1 → M2 → M3 → M4 → M6** là bắt buộc.

> Nếu thiếu thời gian: cắt M5 (graph/surfacing), giữ M6 — personalization đo được mới là điểm thuyết phục ban giám khảo.

---

## Hành vi Claude theo phase

| Phase | Được phép | Hỏi user trước |
|---|---|---|
| `scaffolding` | Tạo skeleton, package.json, requirements.txt, config | Cài lib lớn (>10MB), chạy migration thật, mở port public |
| `mvp-dev` | Code feature theo story P0 đã chốt | Thay đổi schema, đổi tech stack, code feature P1+ |
| `alpha`+ | Bug fix, polish, observability | Refactor lớn, đổi UX core |

---

## Quyết định pending

- ⬜ LLM provider chính: OpenAI vs Anthropic? (Cost vs chất lượng tiếng Việt) — chốt khi bắt đầu M3.
- ⬜ pgvector HNSW trên Supabase free tier có đủ không? — test spike trong M1.
- ✅ i18n: kiến trúc sẵn EN+VI từ M1, giao diện mặc định VI. Chi tiết trong `information/product-principles.md`.
