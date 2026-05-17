# queue_plan — Việc còn lại của pipeline Leaf Engine

> Hàng đợi các việc chưa làm sau khi đã xong A1–A3 (filter / convert / split scripts). Nguồn gốc: `C:\Users\admin\.claude\plans\recursive-snacking-toucan.md`.

---

## A4 — Mở rộng `backend/tests/fixtures/golden_leaves.jsonl`

**Mục đích**: Có 20 example được verify tay làm gold standard cho `eval_engine.py` chạy baseline + regression mỗi lần đổi model/prompt (contract mục 6).

**Hiện trạng**: Chỉ có `seed_all_doctypes.jsonl` (10 example) — tốt nhưng chưa đủ cho regression eval.

**Cách làm**:
1. Copy `backend/tests/fixtures/seed_all_doctypes.jsonl` → `backend/tests/fixtures/golden_leaves.jsonl`.
2. Bổ sung thêm 10 example (2 example cho mỗi doc_type chạy engine: theory/narrative/procedure/reference/meeting — bỏ freeform).
3. Verify tay từng `expected_leaves`:
   - `metadata.term/meaning` phải là paraphrase, không copy nguyên câu.
   - `fact` trong procedure: `ordinal` đúng thứ tự.
   - Không 2 leaf paraphrase nhau.
   - `definition` có `metadata.term` + `metadata.meaning`.
   - `example` có `metadata.polarity`.
4. Chạy filter để smoke check schema:
   ```powershell
   cd backend
   python -m scripts.filter_dataset --input tests/fixtures/golden_leaves.jsonl --output /tmp/golden_check.jsonl --threshold 0.6
   ```

**Phụ thuộc**: Không. Có thể làm ngay.

**Output**: `backend/tests/fixtures/golden_leaves.jsonl` (20 dòng JSONL).

**Khi nào nên làm**: Trước B12 (chạy baseline eval). Nên làm sớm, không phải đợi train xong.

---

## A5 — `backend/scripts/runpod/train.py` (optional)

**Mục đích**: Save training script vào repo để rsync lên RunPod, tránh copy/paste từ `information/leaf-engine-training.md` (tam sao thất bản).

**Cách làm**:
1. Tạo `backend/scripts/runpod/train.py` — copy nguyên template từ `information/leaf-engine-training.md` mục 3.2.
2. Tạo `backend/scripts/runpod/README.md` — hướng dẫn:
   - `pip install unsloth transformers datasets trl peft`
   - Upload `data/train.jsonl` + `data/test.jsonl`
   - `python train.py`
   - Save merged model → upload HuggingFace
3. Có thể skip nếu OK copy thủ công.

**Phụ thuộc**: Không.

**Khi nào nên làm**: Trước B5 (train trên RunPod).

---

## B — Action user phải làm tay (không phải code)

Lưu ý: Plan đầy đủ ở `gnuh_task.md`. Bảng dưới chỉ là index để track tiến độ.

### Setup accounts (1 lần, ~2-3 giờ tổng)

- [ ] **B1** — Đăng ký RunPod + top-up ~$15. Verify đặt được A100 40GB.
- [ ] **B2** — Đăng ký Together AI + tạo API key. Cất key riêng.
- [ ] **B3** — Đăng ký HuggingFace + tạo write token.

### Data pipeline (chạy local sau khi đủ raw_leaves.jsonl)

- [ ] **B4** — Chạy:
  ```powershell
  cd backend
  python -m scripts.filter_dataset --report data/filter_report.json
  python -m scripts.convert_to_sft
  python -m scripts.split_dataset
  ```
  Expect: `data/train.jsonl` + `data/test.jsonl` xuất hiện. Verify pass rate ≥80% ở filter_report.

  **Phụ thuộc**: User xong ≥10 session `/datagen-leaves` (500 example).

### Train + deploy (~1 ngày)

- [ ] **B5** — Start RunPod A100 → upload `train.jsonl` + `test.jsonl` → `pip install unsloth transformers datasets trl peft` → `python train.py` (~3-4h) → save merged FP16.
  - **Phụ thuộc**: B1, B4, A5 (hoặc copy script từ doc).
  - **Cost**: ~$8.
  - **NHỚ TẮT POD** sau khi xong.

- [ ] **B6** — `huggingface-cli upload <USERNAME>/leafnote-leaf-engine ./output/merged`. Verify hiển thị trên HF Hub.
  - **Phụ thuộc**: B3, B5.

- [ ] **B7** — Together AI → Models → Add custom model → paste HF Hub path. Wait ~30 phút. Test playground với system prompt từ `leaf-engine-contract.md`.
  - **Phụ thuộc**: B2, B6.

### Cắm vào Leafnote (~15 phút)

- [ ] **B8** — Set 3 env vars:
  - Render dashboard (production): `LEAF_ENGINE_URL`, `LEAF_ENGINE_API_KEY`, `LEAF_ENGINE_MODEL`.
  - Local `backend/.env`: cùng 3 key.
  - Verify: `python -m scripts.check_env`.
  - **Phụ thuộc**: B7.

- [ ] **B9** — Migration:
  - Local: `cd backend && alembic upgrade head` (m005 + m006).
  - Production: deploy tiếp theo Render auto chạy.
  - Verify Supabase: bảng `leaves` + `leaf_feedback` tồn tại, `notes.document_type` mặc định `theory`.

- [ ] **B10** — Smoke test:
  - Backend: `uvicorn app.main:app --reload`.
  - Frontend (mở browser): tạo note >50 từ → bấm "Tách lá" → verify leaves panel hiển thị có type badge + content.
  - **Phụ thuộc**: B8, B9.

### Eval baseline

- [ ] **B11** — Review tay `golden_leaves.jsonl` (từ A4) — verify từng `expected_leaves` chuẩn xác. **Sai 1 example sẽ kéo cả eval**.
  - **Phụ thuộc**: A4.

- [ ] **B12** — Chạy baseline:
  ```powershell
  cd backend
  python -m scripts.eval_engine --baseline --fixture tests/fixtures/golden_leaves.jsonl
  ```
  Expect: `avg_total ≥ 0.75`, pass rate ≥ 80%. Score thấp → check log Together AI, prompt mismatch, hoặc dataset quá nhỏ.
  - **Phụ thuộc**: B8, B11.

---

## Thứ tự khuyến nghị

```
A4 ──────────────► B11 ─► B12
 (golden set)        │
                     │
B1, B2, B3 (account, song song)
     │
     ▼
[user sinh raw_leaves] ─► B4 ─► (A5 hoặc skip) ─► B5 ─► B6 ─► B7 ─► B8 ─► B9 ─► B10 ─► B12
```

A4 + B11 có thể làm song song với chuỗi train ở dưới.

---

## Out of scope (không trong queue này)

- Sinh `raw_leaves.jsonl` (user đang chạy `/datagen-leaves`).
- Tinh chỉnh `_BASE_PROMPT` / `_DOC_TYPE_HINT` — chỉ làm nếu eval B12 fail và xác định prompt là root cause.
- Phase 6 continuous improvement (re-train với data thật, promote `freeform`, swap provider).

---

# Research & Implementation Record: LaTeX Support (Added 2026-05-17)

## 1. Research Summary
- **Current State**: 
    - Frontend uses **Tiptap** (`PlainEditor.tsx`) for note editing but lacks math extensions.
    - Leaves are rendered as plain text in `LeafCard.tsx`, `LeafDetailModal.tsx`, etc.
- **Restricted Files Context**:
    - `PLAN.md` & `CHECKPOINT.md`: Need updates to track this new feature.
    - `skill/datagen-leaves`: May need instructions to ensure AI knows it *can* use LaTeX delimiters in the `content` field.
    - `raw_leaves.jsonl`: Should eventually include examples with LaTeX for testing the "separation" logic.

## 2. Proposed Implementation Steps
1.  **Install Dependencies**: `katex`, `react-markdown`, `remark-math`, `rehype-katex`.
2.  **Global Styles**: Import KaTeX CSS in `frontend/src/main.tsx`.
3.  **New Component**: Create `MarkdownRenderer.tsx` using `react-markdown` + `rehype-katex`.
4.  **Editor Update**: Add `tiptap-extension-katex` to `PlainEditor.tsx`.
5.  **View Update**: Replace direct text rendering with `MarkdownRenderer` in `LeafCard.tsx`, `LeafDetailModal.tsx`, `LeafItem.tsx`, and `KnowledgeGraph.tsx`.
6.  **Locales**: Add translation keys for the LaTeX toolbar button.

## 3. Instructions for updating restricted files (For User)
- **PLAN.md**: Add "LaTeX math support" to the active/upcoming features list.
- **CHECKPOINT.md**: Log the completion of LaTeX integration.
- **skill/datagen-leaves**: Update the prompt template to suggest LaTeX for mathematical expressions.
- **raw_leaves.jsonl**: Add 2-3 samples of leaves containing math formulas.
