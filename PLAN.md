# PLAN — Sinh data huấn luyện Leaf Engine

> Plan sinh training data theo phase cho fine-tune Qwen2.5-7B. Mỗi lần gọi `/datagen-leaves` Claude sinh 50 examples trực tiếp — không cần copy/paste prompt thủ công.

---

## Bối cảnh & thay đổi so với tài liệu cũ

`gnuh_task.md` và `leaf-engine-training.md` viết khi note còn là plain text. Kể từ khi chuyển sang **WYSIWYG Tiptap**, note được lưu dưới dạng **Markdown thật** (headings `##`, bold `**`, italic `_`, danh sách `- / 1.`, blockquote `>`, inline code `` ` ``). Engine nhận Markdown — data sinh ra phải phản ánh điều này.

Ngoài ra: `document_type` không còn do user chọn, AI sẽ tự classify. Mặc định `freeform`. Training data cần tập trung 5 type có leaf thật: `theory`, `procedure`, `narrative`, `reference`, `meeting`.

---

## Số lượng data mục tiêu

| Giai đoạn | Số lượng | Ghi chú |
|---|---|---|
| Raw sinh ra | **2 000 examples** | 40 session × 50 examples |
| Sau filter (80% pass) | **~1 600 examples** | `leaf_quality.py` threshold 0.75 |
| Train set (90%) | **~1 440 examples** | Đủ cho LoRA Qwen2.5-7B chất lượng cao |
| Test set (10%) | **~160 examples** | Eval tự động |
| Golden eval set (tay) | **25 examples** | Mở rộng từ `seed_all_doctypes.jsonl` |

Phân bố 5 doc types (×400 raw mỗi loại → ~320 sau filter):

| Doc type | Sessions | Raw | Sau filter | Nội dung điển hình |
|---|---|---|---|---|
| `theory` | 1–8 | 400 | ~320 | Khái niệm, định luật, framework, công thức |
| `procedure` | 9–16 | 400 | ~320 | Công thức nấu ăn, hướng dẫn setup, quy trình |
| `narrative` | 17–24 | 400 | ~320 | Nhật ký, kỷ niệm, sự kiện theo timeline |
| `reference` | 25–32 | 400 | ~320 | Cheatsheet, bảng tra cứu, danh sách định nghĩa |
| `meeting` | 33–40 | 400 | ~320 | Biên bản họp, quyết định, action items |

---

## Chia phase sinh data

### Phase 1 — Pilot (session 1–5, ~250 examples)

**Mục tiêu**: xác nhận pipeline hoạt động end-to-end trước khi sinh bulk.

- Sinh đủ 5 doc type (1 session mỗi loại + 1 mix)
- Chạy filter → verify pass rate ≥75%
- Chạy `eval_engine.py --baseline` → ghi lại score baseline
- **Gate**: nếu baseline <0.70 thì dừng, review prompt/rules trước khi tiếp

### Phase 2 — Core (session 6–20, ~750 examples)

**Mục tiêu**: xây nền data vững, đủ để fine-tune lần đầu.

- Tập trung `theory` + `procedure` (nhiều structural rules nhất)
- Sau session 15: chạy filter + split → train lần đầu thử
- **Gate**: eval score ≥ baseline − 0.02

### Phase 3 — Expand (session 21–40, ~1 000 examples)

**Mục tiêu**: đa dạng hoá, bù doc type còn thiếu, thêm edge cases.

- Xen kẽ tất cả 5 doc type + mix Việt/Anh/mix
- Ưu tiên examples có `confidence` thấp hơn (0.65–0.79) — phản ánh ambiguity thật
- Session cuối (38–40): sinh hard cases — note ngắn, note mơ hồ, note mix 2 doc type

---

## Format note chuẩn (Markdown)

Mọi example phải dùng Markdown — giống hệt những gì Tiptap lưu vào DB.

```markdown
## Tiêu đề note

Đoạn mở đầu giải thích ngắn về chủ đề. Có thể có **in đậm** hoặc _in nghiêng_.

- Ý đầu tiên
- Ý thứ hai với `code inline`
- Ý thứ ba

> Trích dẫn quan trọng hoặc chú ý đặc biệt

### Phần con (nếu dài)

Thêm nội dung theo từng đoạn.
```

**Không dùng**: HTML tags, LaTeX, fenced code blocks (``` ```), vì Tiptap editor hiện tại không hỗ trợ.

---

## Pipeline 3 bước

### Bước 1 — Sinh data (gọi `/datagen-leaves` trong Claude Code)

**Công cụ**: Claude Code (không cần Claude.ai Pro riêng).

Mỗi lần gọi `/datagen-leaves`, Claude:
1. Đếm examples trong `backend/data/raw_leaves.jsonl` → xác định session hiện tại
2. Chọn doc_type + topic từ bảng rotation trong skill
3. Sinh 50 examples JSONL trực tiếp trong response
4. Tự kiểm tra chất lượng theo checklist
5. Hướng dẫn user append vào file

Output mỗi session: append vào `backend/data/raw_leaves.jsonl`

### Bước 2 — Filter chất lượng (local, không tốn tiền)

```bash
cd backend
python -m scripts.filter_dataset data/raw_leaves.jsonl data/train_leaves.jsonl --threshold 0.75
```

Script dựa trên `app/services/leaf_quality.py` (đã có). Kiểm tra:
- JSON hợp lệ
- Coverage: leaf ghép lại cover ≥70% nội dung note
- Atomicity: mỗi leaf ≤80 từ
- No duplicate: cosine sim giữa các leaf <0.85
- Type hợp lệ: `definition | fact | example | question | note`

### Bước 3 — Tách train/test + eval

```bash
python -m scripts.split_dataset data/train_leaves.jsonl --test-ratio 0.1
# → data/train_leaves_train.jsonl (~1440 examples)
# → data/train_leaves_test.jsonl  (~160 examples)
```

---

## Skill

Skill: **`/datagen-leaves`** — gõ trong Claude Code. Claude đọc skill → đếm session hiện tại → sinh 50 examples JSONL → user append vào file.

---

## Checklist thực hiện

### Chuẩn bị (1 lần)
- [ ] Tạo thư mục `backend/data/` nếu chưa có
- [ ] Đọc `seed_all_doctypes.jsonl` — hiểu format `expected_leaves`
- [ ] Đọc `information/leaf-engine-contract.md` mục 2-3 — schema leaf

### Mỗi session sinh data (gọi `/datagen-leaves`)
- [ ] Gõ `/datagen-leaves` trong Claude Code
- [ ] Xem Claude sinh 50 examples + self-validate
- [ ] Append output vào `backend/data/raw_leaves.jsonl`
- [ ] Kiểm tra không có dòng lỗi JSON

### Phase gate (sau mỗi phase)
- [ ] **Phase 1 gate**: chạy filter + eval baseline → score ≥0.70 mới tiếp
- [ ] **Phase 2 gate**: train thử + eval → so baseline, delta ≥-0.02
- [ ] **Phase 3 gate**: verify cân bằng doc_type, ≥1400 examples sau filter

### Sau 40 session
- [ ] Chạy filter → `data/train_leaves.jsonl`
- [ ] Verify: còn ≥1400 examples sau filter
- [ ] Chạy split → train/test
- [ ] Mở rộng `seed_all_doctypes.jsonl` thành 25 examples → `golden_leaves.jsonl`
- [ ] Verify tay `golden_leaves.jsonl` — đây là gold standard eval
- [ ] Chạy `eval_engine.py --fixture tests/fixtures/golden_leaves.jsonl --baseline`

### Tiếp theo (xem gnuh_task.md Phase 2+)
- [ ] Train Qwen2.5-7B trên RunPod
- [ ] Deploy Together AI
- [ ] Cắm vào backend

---

## File liên quan

| File | Vai trò |
|---|---|
| `backend/data/raw_leaves.jsonl` | Raw output mỗi session (append) |
| `backend/data/train_leaves.jsonl` | Sau filter, dùng train |
| `backend/tests/fixtures/seed_all_doctypes.jsonl` | 10 examples đã có — seed |
| `backend/tests/fixtures/golden_leaves.jsonl` | 25 examples tay — eval vĩnh viễn |
| `.claude/skills/datagen-leaves/SKILL.md` | Skill Claude dùng khi gọi `/datagen-leaves` |
| `information/leaf-engine-contract.md` | Schema leaf + system prompt engine |
| `information/leaf-engine-training.md` | Script train Qwen, deploy Together AI |
| `gnuh_task.md` | Checklist toàn bộ pipeline (account, train, deploy) |
