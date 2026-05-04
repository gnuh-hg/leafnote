# Milestones — Leafnote

> File này chốt **mốc cụ thể** với deliverable đo được, gate kiểm tra, và estimate. Khác với [`../../ROADMAP.md`](../../ROADMAP.md) (mô tả năng lực mở khoá theo phase ở mức ý tưởng), milestones.md là cam kết hành động.
>
> Estimate: 1 người làm sau giờ học, ~10–15h/tuần. Sẽ điều chỉnh khi có dữ liệu vận tốc thực tế.

---

## Tổng quan

| Mốc | Tên | Estimate | Phase ROADMAP | Gate (điều kiện đậu) |
|---|---|---|---|---|
| **M0** | Pre-project | 1–2 tuần | M0 | Tài liệu nền + MVP scope chốt + wireframe + 5 quyết định trong `mvp-scope.md` đều ✅ |
| **M1** | Scaffolding | 2 tuần | M1 | 3 nhánh chạy "Hello world" + CI xanh + auth Supabase đăng nhập được |
| **M2** | Capture & Notes | 3 tuần | M2 | 1 user capture được note text/voice/image, lưu, sync giữa web ↔ mobile (eventual) |
| **M3** | Atomic Engine | 3 tuần | M3 | Note → atoms streaming SSE, embed pgvector, đề xuất duplicate/contradicts hoạt động |
| **M4** | Review Loop | 2 tuần | M4 | Recall feed mobile chạy, FSRS update đúng, stats hiển thị |
| **M5** | Surfacing | 2–3 tuần | M5 (chỉ surfacing, **bỏ graph khỏi MVP**) | `POST /surfacing/contextual` phản hồi < 800ms (P95), reason hiển thị đúng |
| **M6** | Personalization Loop | 2 tuần | M6 | Demo A/B 2 user khác profile trên cùng input note |
| **M7** | Alpha thử nghiệm | 2 tuần | (alpha) | ≥ 3 user thật đạt ≥ 50 review, không crash > 1%/session |
| **M8** | Polish + Thi | 2 tuần | (beta + public) | Slide + video demo + landing page + bài giải thích cơ chế |

**Tổng**: ~19–20 tuần (~5 tháng làm thực tế).

---

## M0 — Pre-project

**Mục tiêu**: Có nền tài liệu đủ tin cậy để vào code không phải ngẫu hứng.

### Deliverables

- [x] `CLAUDE.md`, `PHASE.md`, `ROADMAP.md`, `information/project-overview.md`, `information/user-stories.md`.
- [x] `information/architecture.md`, `information/tech-stack.md` (draft).
- [x] `information/database-schema.md`, `information/api-spec.md` (high-level + bản drafts/ chi tiết).
- [x] `information/plan/mvp-scope.md`, `information/plan/milestones.md`.
- [ ] Wireframe 5 màn web + 4 màn mobile (giấy hoặc Figma low-fi).
- [ ] Quyết định LLM provider chính.
- [ ] Quyết định monorepo vs đa repo.
- [ ] Test thử pgvector HNSW trên Supabase free (1 script Python ngắn).

### Gate đậu

Tất cả checklist trên ✅ + chuyển nhãn `tech-stack.md` từ `draft` → `ready` trong `CLAUDE.md`.

---

## M1 — Scaffolding

**Mục tiêu**: 3 nhánh chạy được tối thiểu, có CI, có auth.

### Deliverables

- [ ] Repo Git init, commit hooks (lint-staged), `.gitignore` đúng.
- [ ] Backend FastAPI: `main.py`, `core/config.py` đọc env, `/health` route, Alembic init.
- [ ] Migration M001: users, projects, notes, note_versions, note_blocks, attachments, sessions.
- [ ] Web React + Vite: routing, trang trống, đăng nhập Supabase Auth, gọi `/me` thành công.
- [ ] Mobile RN Expo: app trống mở được trên Expo Go, đăng nhập Supabase Auth, gọi `/me`.
- [ ] Codegen TypeScript types từ Pydantic / OpenAPI.
- [ ] CI GitHub Actions: lint (ruff + ESLint), test stub xanh, build web preview Vercel.
- [ ] Sentry + PostHog keys nạp môi trường (chưa cần dùng nhiều).

### Gate đậu

- `curl https://api.../v1/health` → 200.
- Web preview Vercel mở được, đăng nhập Google → quay về app có session.
- Mobile build qua Expo Go, đăng nhập Google → quay về app có session.
- CI đang xanh trên `main`.

### Rủi ro

- Supabase JWT verify trong FastAPI có thể tốn 0.5–1 ngày debug.
- Expo Go không hỗ trợ một số native module nếu sau này cần (cân nhắc dev client từ M5).

---

## M2 — Capture & Notes (chưa có AI)

**Mục tiêu**: Người dùng tạo note đa kênh, đa nền tảng. Chưa có atom.

### Deliverables

- [ ] CRUD project (web + mobile).
- [ ] Editor Tiptap web + auto-save (S-2.1 phần web).
- [ ] Mobile editor đơn giản + auto-save offline → sync (S-2.1).
- [ ] Voice capture mobile + Whisper API → transcript → note (S-2.2).
- [ ] Ảnh capture mobile + OCR + LLM-fix → note (S-2.3).
- [ ] Active project context (S-2.6).
- [ ] Sync web ↔ mobile cấp eventual (refresh thủ công OK trong M2).
- [ ] Xoá tài khoản (soft + hard sau 7 ngày) (S-X.1).
- [ ] Tracking sự kiện cơ bản qua PostHog (capture_created, project_activated).

### Gate đậu

- Tác giả tự dùng Leafnote ghi note thay app cũ trong 3 ngày liên tiếp, không sập.
- Voice + ảnh có pipeline thực sự chạy (kể cả chậm).

---

## M3 — Atomic Engine

**Mục tiêu**: Linh hồn của sản phẩm. Note → atoms.

### Deliverables

- [ ] Celery + Redis chạy trên hosted (Railway/Fly).
- [ ] Service `decompose_note`: prompt LLM, parse JSON tool-call, validate, ghi atoms.
- [ ] Service `embed_atoms`: gọi embedding, ghi pgvector (HNSW index).
- [ ] Service `link_atoms`: k-NN, đánh dấu duplicate / contradicts / related.
- [ ] SSE `/notes/{id}/stream` truyền `atom.created`, `link.proposed`.
- [ ] UI atom panel web: highlight ngược về block, edit text, gộp/tách (S-3.1).
- [ ] UI quyết định link đề xuất (accept/reject/merge) (S-3.2).
- [ ] `ai_jobs` table + retry với exponential backoff.
- [ ] Idempotency theo `dedup_key`.

### Gate đậu

- Một note 200 từ → ≥ 5 atoms hợp lý trong vòng 10s (P50).
- Khi viết note mới có nội dung gần atom cũ, hệ thống đề xuất duplicate đúng ≥ 70%.
- Re-save note không thay đổi → không tạo job mới (idempotent).

### Rủi ro

- Chi phí LLM mỗi capture có thể tốn $0.005–0.02 — cần đo và cache.
- Phân rã quá thô / quá mịn — cần feedback loop user "Gộp lại" / "Tách thêm" sớm.

---

## M4 — Review Loop (FSRS)

**Mục tiêu**: Người dùng ôn được, có lịch.

### Deliverables

- [ ] Service `generate_recall` sinh ≥ 2 câu hỏi/atom (cloze / reverse_def / application) (S-3.4).
- [ ] FSRS scheduler per-atom (chưa fit per-user) — `atom_reviews`.
- [ ] Mobile recall feed UI swipe (S-3.3).
- [ ] Push notification 1 lần/ngày qua expo-notifications.
- [ ] Endpoint `/recall/today`, `/recall/{atom_id}/answer`, `/recall/stats`.
- [ ] `recall_answers` ghi append + cập nhật review state.
- [ ] Stats trang đơn giản (web): retention thật, accuracy, streak.

### Gate đậu

- Một user trả lời ≥ 50 câu trong 1 tuần, không lỗi.
- Push notification đến đúng giờ theo timezone user.

---

## M5 — Surfacing (cắt graph khỏi MVP)

**Mục tiêu**: Hạt nổi lên đúng ngữ cảnh khi viết.

### Deliverables

- [ ] Cron / job tính `atom_project_relevance` theo session activity.
- [ ] Endpoint `POST /surfacing/contextual`: embed `draft_text`, mix với `session.context_embedding`, query pgvector, ranking.
- [ ] UI panel surfacing trong editor web (3–5 atom + reason badge).
- [ ] `POST /surfacing/{feed_id}/served|interact`.
- [ ] Daily morning briefing mobile (S-3.6 cơ bản).
- [ ] Dormant ↔ active toggle (S-3.6).

### Gate đậu

- P95 latency `/surfacing/contextual` < 800ms.
- Trong demo nội bộ, ≥ 60% gợi ý có chất lượng "có ích" (đánh giá tay 50 mẫu).

### Hoãn khỏi MVP

- Graph view (Cytoscape).
- Conflicts inbox toàn cục riêng.
- Gaps detection.

---

## M6 — Personalization Loop (yếu tố thi)

**Mục tiêu**: Chứng minh hệ thống cá nhân hoá đo được.

### Deliverables

- [ ] Job nightly fit FSRS params per-user (`py-fsrs.optimize`) — yêu cầu ≥ 50 review.
- [ ] Job nightly cập nhật `user_cognitive_profiles`: accuracy_by_qtype, accuracy_by_kind, peak_hours, granularity_pref, surfacing_weights initial.
- [ ] Surfacing dùng `surfacing_weights` từ profile (thay weight cố định).
- [ ] UI `/me/cognitive-profile` minh bạch (S-4.6).
- [ ] Mỗi gợi ý surfacing có dòng "Vì: …".
- [ ] Synthetic data: script seed 2 user-mock có hành vi đối lập để demo A/B chắc chắn.

### Gate đậu (**quan trọng nhất, đây là tiêu chí thi**)

- Demo A/B: cùng 1 input note → 2 user khác profile → khác biệt rõ ở (a) lịch due_at, (b) thứ tự surfacing, (c) format câu hỏi sinh ra. Có screenshot trước/sau.
- `user_fsrs_params.fitted_at` không null cho ít nhất 1 user thật.

---

## M7 — Alpha (thử nghiệm)

**Mục tiêu**: Có người thật dùng, không sập.

### Deliverables

- [ ] Mời 3–5 bạn / cùng lớp thử trong 2 tuần.
- [ ] Onboarding 3 màn (S-1.2, S-1.3) hoàn thiện.
- [ ] Sentry alerts thật (Slack/email khi crash > X).
- [ ] Bug-fix queue ưu tiên theo Sentry frequency.
- [ ] Phỏng vấn ngắn 15 phút mỗi user.

### Gate đậu

- Crash-free ≥ 99%.
- ≥ 3/5 user trả lời "có ích" hoặc "rất có ích" về surfacing.
- ≥ 100 atom thật trong DB tổng.

---

## M8 — Polish + Thi

**Mục tiêu**: Sản phẩm trình bày được.

### Deliverables

- [ ] Landing page (1 trang, web): pitch, demo GIF/video, CTA dùng thử.
- [ ] Video demo 2–3 phút: capture → atom → review → surfacing → personalization.
- [ ] Slide thuyết trình thi (10–15 trang): vấn đề → giải pháp → cơ chế AI → demo → kết quả A/B.
- [ ] Bài giải thích cơ chế personalization (1–2 trang) cho ban giám khảo.
- [ ] README repo: cách chạy, kiến trúc, công nghệ, ảnh chụp màn.
- [ ] Accessibility cơ bản (S-X.5 mức Tab + alt text).

### Gate đậu

- Có thể trình diễn live không phụ thuộc Internet không ổn định (cache demo data sẵn).
- Slide đã thử trước với mentor ≥ 1 lần.

---

## Dependency giữa milestones

```
M0 ──▶ M1 ──▶ M2 ──┬──▶ M3 ──▶ M4 ──▶ M5 ──▶ M6 ──▶ M7 ──▶ M8
                   │
                   └─ (không có M chen ngang)
```

- M3 cần M2 vì cần note + block.
- M4 cần M3 vì cần atom.
- M5 và M4 song song được phần ranking, nhưng UI surfacing cần atom panel của M3.
- M6 cần dữ liệu từ M4 (≥ 50 review).
- M7 cần M6 vì giá trị bán cho user nằm ở personalization.

---

## Cập nhật milestones

- Mỗi cuối milestone, ghi 1 entry vào `.claude/memory/context.md`: vận tốc thực tế, gì lệch estimate, gì cắt khỏi gate.
- Nếu lệch > 30% so với estimate, cập nhật estimate các milestone còn lại.
