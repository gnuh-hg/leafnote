# PHASE.md — Trạng thái phase hiện tại

> File này là **nguồn sự thật duy nhất** cho việc "dự án đang ở đâu". Cập nhật mỗi khi chuyển phase. Mọi quyết định "có được tạo skeleton X chưa", "có được code Y chưa" đều dựa vào file này.

---

## Phase hiện tại: `pre-project` 🪴

**Bắt đầu**: 2026-05-04
**Mục tiêu phase**: Hoàn tất tài liệu nền và chốt phạm vi MVP **trước khi viết dòng code đầu tiên**.

### Đã làm

- [x] Đặt tên dự án: **Leafnote**.
- [x] Concept ý tưởng: hệ thống ghi chú dựa trên phân rã hạt tri thức + personalization loop.
- [x] `information/project-overview.md` — vision, MVP scope, success criteria.
- [x] `information/user-stories.md` — 4 persona × 5 epic, P0/P1/P2.
- [x] `information/architecture.md` — high-level (draft).
- [x] `information/tech-stack.md` — lựa chọn ban đầu (draft).
- [x] `information/database-schema.md` — high-level (draft) + bản chi tiết tham chiếu trong `plan/drafts/`.
- [x] `information/api-spec.md` — high-level (draft) + bản chi tiết tham chiếu trong `plan/drafts/`.
- [x] `CLAUDE.md` — bản đồ cho Claude với bảng trạng thái file.

### Đang làm

- [ ] `ROADMAP.md` — lộ trình theo phase.
- [ ] `information/plan/mvp-scope.md` — chốt phạm vi MVP cuối cùng.
- [ ] `information/plan/milestones.md` — milestones có timeline.

### Còn lại để rời phase này

- [ ] Chốt MVP scope cuối cùng (P0 stories nào vào, story nào ra).
- [ ] Quyết định chính thức về tech stack (chuyển `tech-stack.md` từ `draft` → `ready`).
- [ ] Vẽ wireframe (giấy hoặc Figma) cho 4 màn chính: capture, atom panel, recall feed, graph view.
- [ ] Lập sprint-01 trong `information/plan/sprints/sprint-01.md`.

### Tiêu chí thoát phase

Khi đủ cả 4 mục trên xong → chuyển sang phase `scaffolding`.

---

## Lộ trình phase

```
pre-project ──▶ scaffolding ──▶ mvp-dev ──▶ alpha ──▶ beta ──▶ public
   (đang)
```

| Phase | Đầu ra cốt lõi | Cờ hiệu kết thúc |
|---|---|---|
| `pre-project` | Tài liệu nền + scope chốt | MVP scope `ready`, tech-stack `ready`, wireframe có |
| `scaffolding` | Repo skeleton chạy được "Hello world" cả web/mobile/backend; CI cơ bản | Có endpoint `/health`, app web mở được, app mobile build được trên Expo Go |
| `mvp-dev` | Toàn bộ story P0 chạy được cho 1 user thật (chính tác giả) | Demo end-to-end: capture → atom → review → surfacing |
| `alpha` | 3–5 user thử (bạn bè / cùng lớp), thu thập feedback | Có log telemetry; ≥ 100 atom thật; ≥ 1 vòng fit FSRS per-user |
| `beta` | Personalization mature: profile fit + surfacing weights điều chỉnh tự động | Đo được khác biệt A/B giữa 2 profile (success criteria #1) |
| `public` | Sản phẩm thi cử / demo công khai | Slide thuyết trình + video demo + landing page |

---

## Quy tắc khi chuyển phase

1. Viết một entry trong `.claude/memory/context.md` — ngày chuyển phase, lý do, gì còn nợ.
2. Cập nhật bảng trạng thái file trong `CLAUDE.md`.
3. Cập nhật `PHASE.md` (file này).
4. Tag git commit: `phase/<tên-phase>` (khi đã có repo).

---

## Hành vi Claude theo phase

| Phase | Được phép | Hỏi user trước |
|---|---|---|
| `pre-project` | Sửa tài liệu trong `information/`, `.claude/memory/`, root MD files | Tạo `backend/`, `frontend/`, `tests/`, mọi file code |
| `scaffolding` | Tạo skeleton, package.json, requirements.txt, config | Cài lib lớn (>10MB), chạy migration thật, mở port public |
| `mvp-dev` | Code feature theo story P0 đã chốt | Thay đổi schema, đổi tech stack, code feature P1+ |
| `alpha`+ | Bug fix, polish, observability | Refactor lớn, đổi UX core |
