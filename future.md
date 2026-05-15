# FUTURE — Leafnote

> Danh sách các tính năng/việc đã được scope nhưng dời sang phase sau. Khi bắt đầu làm, di chuyển mục tương ứng vào `ROADMAP.md` rồi xoá khỏi đây.

---

## Leaf engine (Phase 2+)

Spec taxonomy đã chốt trong [`information/features.md`](information/features.md) section 9 (5 `document_type` + freeform; 5 `leaf_type` + note fallback; relation = edge). Triển khai theo 3 bước:

### Bước 1 — Leaf engine v1 (Phase 2)

- **Backend**: dùng **LLM API rẻ** (Gemini Flash hoặc DeepSeek V3) — không tự train model. Lý do: cost ~$0.0002/note ở quy mô MVP, time-to-ship 1 tuần thay vì 3 tháng, taxonomy đóng nên prompt ổn định.
- **Prompt cứng** theo taxonomy 5+5. Mỗi `document_type` có một prompt template riêng với 3–5 example few-shot.
- **Cache content hash** — note không đổi thì không gọi lại LLM (giảm 50–80% cost với user edit nhiều).
- **Quota free tier** — ví dụ 30 note/tháng free, premium $3/tháng. Premium 1 user bù 100+ free user.
- **Batch** — gom nhiều leaf trong 1 request thay vì 1 leaf/request.
- **Async + queue** — chạy nền sau khi user lưu, không chặn UX. Banner "AI đang tách lá…" → "Đã tách N lá".
- **Privacy**: tôn trọng flag `local_only` của note (NTH trong features) — không gửi qua LLM nếu user đánh dấu.

### Bước 2 — Observability (Phase 2.5)

- Log mọi leaf được gán `note` (fallback) và mọi note `freeform`.
- Dashboard admin xem phân bố: tần suất từng `document_type`, tỷ lệ `note` fallback theo `document_type`, top 20 cụm pattern trong `freeform`.
- Track AI confidence trung bình theo type — type nào confidence thấp = prompt cần tinh chỉnh.

### Bước 3 — Type expansion review (Phase 3+)

Vòng lặp **observe → propose → expand**, admin-driven, tần suất 3–6 tháng/lần:

1. Admin xem dashboard observability.
2. Nếu thấy cụm lớn (≥ ngưỡng N% notes hoặc leaves) trong `freeform` / `note` cùng pattern → propose type mới.
3. Cập nhật enum + prompt + few-shot example + UI filter.
4. Migrate dữ liệu cũ: batch LLM gán lại các leaf cũ thuộc cụm đó (chạy nền, không block user).
5. Deploy.

**Không tự build custom NLP model trừ khi**: cost LLM > 30% revenue **và** có ≥ 50k leaf đã label làm seed data. Reconsider ở Phase 4+.

---

## Editor & Notes

- **Tách lá AI tự động** từ note: phân rã thành definition / proposition / relation / fact, gắn embedding, đề xuất link giữa các lá. (Panel "detected leaves / engine / insights" cũ trong UI mock — đã gỡ khỏi NoteEditor.)
- **Block media**: upload ảnh, ghi âm/transcribe, video embed, file attach. (Hiện đã disable trong BlockNote schema.)
- **OCR cho ảnh** chèn từ whiteboard / slide / sách.
- **Export note** sang PDF / Markdown file (BlockNote có sẵn API).
- **Version history / soft delete** — undo xoá note, xem revision cũ.
- **Realtime collab** qua Y.js — BlockNote hỗ trợ sẵn provider y-websocket.

## Search & Discovery

- **Full-text search** qua `plain_text` của note (Postgres `tsvector` + index GIN).
- **Search by tag combination** (AND/OR/NOT).
- **Surfacing engine**: gợi ý note/lá liên quan khi đang viết.

## Performance & UX

- **Pagination / infinite scroll** cho NotesList khi >50 note.
- **Skeleton loader** cho NoteEditor khi `useNote` còn pending.
- **Conflict resolution** khi 2 tab cùng sửa 1 note (last-write-wins hiện tại).

## Mobile

- **Pull-to-refresh** trên NotesList.
- **Quick note** từ BottomNav (`+` floating action button).
