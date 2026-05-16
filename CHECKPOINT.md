# CHECKPOINT — Sinh data huấn luyện Leaf Engine

> Sổ tay tiến độ dài hạn của plan `PLAN.md`. Mỗi lần hoàn tất một session/gate, cập nhật file này. Mục tiêu: bất kỳ phiên Claude nào mới mở đều biết đang ở đâu trong pipeline.

---

## Tiến độ tổng quan

| Hạng mục | Mục tiêu | Hiện tại | % |
|---|---|---|---|
| Sessions sinh data | 40 | **1** | 2.5% |
| Raw examples | 2 000 | **50** | 2.5% |
| Sau filter (dự kiến 80%) | ~1 600 | chưa chạy | — |
| Train/test split | 1 440 / 160 | chưa | — |
| Golden eval set | 25 | 10 (seed) | 40% |
| Eval baseline score | ≥ 0.70 | chưa đo | — |

---

## Phase 1 — Pilot (session 1–5)

**Mục tiêu**: xác nhận pipeline + đo baseline trước khi sinh bulk.

| # | Doc type | Topic | Status | Notes |
|---|---|---|---|---|
| 1 | theory | lập trình (Py/JS/TS/algo) | ✅ done | 50 examples, validate 0 lỗi |
| 2 | theory | khoa học tự nhiên (lý/hoá/sinh) | ⏳ pending | |
| 3 | theory | toán học (xác suất/ĐSTT/giải tích) | ⏳ pending | |
| 4 | theory | ML/AI (NN/transformer/RAG) | ⏳ pending | |
| 5 | theory | web/system (HTTP/REST/SQL/OS) | ⏳ pending | |

**Phase 1 gate (sau session 5)**:
- [ ] Chạy `python -m scripts.filter_dataset data/raw_leaves.jsonl data/train_leaves.jsonl --threshold 0.75`
- [ ] Verify pass rate ≥ 75%
- [ ] Chạy `python -m scripts.eval_engine --baseline`
- [ ] Score baseline ≥ 0.70 mới được sang Phase 2

> ⚠️ Lưu ý: PLAN.md nói "Sinh đủ 5 doc type" trong Phase 1, nhưng bảng rotation skill cho session 1–8 đều là theory. Đang theo bảng rotation skill — nếu muốn đa dạng doc_type ở pilot, cần điều chỉnh.

---

## Phase 2 — Core (session 6–20)

**Mục tiêu**: nền data đủ cho fine-tune lần đầu.

| Sessions | Doc type | Status |
|---|---|---|
| 6–8 | theory (kinh tế, tâm lý, ngôn ngữ) | ⏳ |
| 9–16 | procedure (nấu ăn, tech setup, đời sống...) | ⏳ |
| 17–20 | narrative (nhật ký, kỷ niệm...) | ⏳ |

**Phase 2 gate (sau session 15)**:
- [ ] Filter + split
- [ ] Train Qwen2.5-7B thử lần 1
- [ ] Eval score ≥ baseline − 0.02

---

## Phase 3 — Expand (session 21–40)

**Mục tiêu**: đa dạng + edge cases.

| Sessions | Doc type | Status |
|---|---|---|
| 21–24 | narrative (hành trình, review, mục tiêu) | ⏳ |
| 25–32 | reference (cheatsheet, thuật ngữ, danh sách) | ⏳ |
| 33–40 | meeting (planning, retro, post-mortem, onboarding) | ⏳ |

**Lưu ý session 38–40 (hard cases)**: notes ngắn, mơ hồ, mix 2 doc type.

**Phase 3 gate (sau session 40)**:
- [ ] ≥ 1 400 examples sau filter
- [ ] Cân bằng doc_type (mỗi loại ~280–320)
- [ ] Split train/test
- [ ] Mở rộng `seed_all_doctypes.jsonl` (10) → `golden_leaves.jsonl` (25)
- [ ] Eval baseline final trên golden set

---

## Sau Phase 3 (xem `gnuh_task.md`)

- [ ] Train Qwen2.5-7B trên RunPod (LoRA)
- [ ] Deploy Together AI dedicated endpoint
- [ ] Cắm vào `backend/app/services/leaf_engine.py` qua biến môi trường
- [ ] Eval sau deploy — so với baseline

---

## Lịch sử session

### Session 1 — 2026-05-16
- **Doc type**: theory
- **Topic**: lập trình (Python 1–18, JavaScript 19–32, TypeScript 33–42, Algorithms 43–50)
- **Ngôn ngữ**: ~60% Vi, ~30% En, ~10% mix
- **Leaves/note**: 4–8
- **Validate**: 50/50 OK, không có lỗi JSON, không có leaf >100 từ
- **File**: `backend/data/raw_leaves.jsonl` lines 1–50

---

## Quy ước cập nhật CHECKPOINT

Sau mỗi session:
1. Tick `✅ done` ở bảng Phase tương ứng
2. Cập nhật bảng "Tiến độ tổng quan" — tăng số sessions + examples
3. Thêm entry vào "Lịch sử session" (ngày, topic, validate result)

Sau mỗi phase gate:
1. Tick checkbox `- [x]` các bước trong gate
2. Ghi score thực tế nếu chạy eval
3. Nếu gate fail: ghi lý do và action items trước khi tiếp tục

---

## File liên quan

| File | Vai trò |
|---|---|
| `PLAN.md` | Plan tổng thể, không đổi |
| `CHECKPOINT.md` | File này — tiến độ thực tế |
| `backend/data/raw_leaves.jsonl` | Raw output các session |
| `.claude/skills/datagen-leaves/SKILL.md` | Skill sinh data |
| `gnuh_task.md` | Việc user phải làm tay (account, train, deploy) |
