# gnuh_task — Việc bạn (gnuh-hg) cần làm tay

> Checklist tất cả việc nằm ngoài code app: lấy key, sinh data n8n, train Qwen, deploy, set env. Code app đã sẵn — chỉ chờ bạn làm xong những bước này là chạy được.

---

## Phase 0 — Tài khoản & API key (1 ngày)

### 0.1. Claude Pro của bạn = teacher (KHÔNG cần mua API key)

- [x] Đã có sẵn — bạn đang dùng Claude Pro
- **Cách dùng**: mở chat mới trong Claude.ai, paste prompt sinh data từ Phase 1.2 → tôi (Opus 4.7) sinh batch → bạn copy vào JSONL
- **Lý do KHÔNG cần API key**: Pro subscription đã trả phí flat monthly, sinh data trong chat = free. API chỉ cần khi muốn n8n tự động loop 5000 lần — bạn chấp nhận làm tay thì không cần
- **Trade-off**: tay nhiều, chậm hơn, nhưng tiết kiệm $5-10

### 0.2. RunPod hoặc Vast.ai (cho train Qwen LoRA)

- [ ] Đăng ký RunPod (<https://runpod.io>) hoặc Vast.ai
- [ ] Top-up ~$15
- [ ] Verify đặt được instance A100 40GB (~$2/h, train 4h)
- [ ] **Lý do**: Qwen2.5-7B fine-tune cần GPU 40GB+

### 0.3. Together AI (cho deploy production)

- [ ] Đăng ký <https://api.together.xyz>
- [ ] Tạo API key → cất riêng cho production
- [ ] Verify upload được fine-tuned model
- [ ] **Lý do**: chạy inference Qwen sau khi train, ~$0.20/1M tokens
- [ ] **Alternative**: tự host vLLM nếu có GPU server riêng — bỏ qua bước này

### 0.4. HuggingFace Hub (chỗ lưu model trung gian)

- [ ] Đăng ký <https://huggingface.co>
- [ ] Tạo access token (write scope) → lưu lại
- [ ] **Lý do**: upload merged model từ RunPod để Together AI pull về

### 0.5. n8n — CHỈ cần nếu muốn tự động hoá phụ trợ (tuỳ chọn)

- [ ] Cài n8n local (Docker `docker run -p 5678:5678 n8nio/n8n`) hoặc đăng ký <https://n8n.cloud>
- **Lý do tuỳ chọn**: vì sinh data tay với Claude Pro, n8n không cần để loop sinh data nữa. Chỉ dùng cho việc khác:
  - Schedule chạy `eval_engine.py` mỗi tuần
  - Append feedback từ user vào dataset
  - Trigger re-train khi có >100 thumbs-down mới
- **Skip nếu** chưa cần automation

---

## Phase 1 — Sinh data tay với Claude Pro (2-3 ngày)

> Pipeline thật: bạn mở chat Claude.ai → paste prompt batch → tôi sinh 20-50 example/lần → bạn copy vào file. Lặp đến đủ.
>
> **Mục tiêu giảm scope**: 500 example chất lượng cao đủ để LoRA fine-tune hoạt động (không cần 5000). Nếu sau eval thấy chưa đủ, sinh thêm.

### 1.1. Chuẩn bị seed corpus

- [ ] Đọc `backend/tests/fixtures/seed_all_doctypes.jsonl` — 10 example mẫu tôi đã viết
- [ ] Verify hiểu format: `id`, `document_type`, `note`, `expected_leaves`
- [ ] Đọc `information/leaf-engine-contract.md` mục 2-3 — schema leaf + 6 prompt theo doc_type

### 1.2. Sinh data trong chat Claude Pro

**Workflow mỗi session** (~50 example/session, ~10 session là đủ 500):

1. Mở chat Claude.ai mới (model Opus 4.7)
2. Paste prompt sau (đổi `<X>` thành combo bạn muốn):

```
Bạn là teacher cho Leaf Engine của Leafnote. Sinh cho tôi 50 example training data.

Mỗi example: 1 note giả lập + danh sách leaf đã tách đúng.

Format JSONL (mỗi dòng 1 object):
{"id":"gen-001","document_type":"<theory|narrative|procedure|reference|meeting>","note":"...","expected_leaves":[{"type":"...","content":"...","metadata":{...},"confidence":0.95}, ...]}

Đa dạng:
- 5 doc_type theory/narrative/procedure/reference/meeting (10 example mỗi loại)
- Mix tiếng Việt/Anh
- Note dài 5-15 câu
- Topic đa dạng: code, học thuật, đời sống, công việc, kỹ năng

Quy tắc tách leaf (BẮT BUỘC):
- type ∈ {definition, fact, example, question, note}
- content 15-80 từ (definition có term ngắn được miễn sàn)
- definition: metadata bắt buộc {term, meaning}
- fact procedure: metadata.ordinal cho thứ tự
- fact meeting: metadata.source là tên cuộc họp
- example: metadata.polarity ('positive'|'negative')
- Không leaf trùng nội dung
- Cover hết ý chính trong note
- confidence 0.85-0.95 cho leaf rõ, <0.7 cho mơ hồ

Output: thuần JSONL, không markdown fence, không giải thích.
```

1. Tôi sẽ stream JSONL → bạn copy/paste vào file `data/train.jsonl` (append mode, mỗi session 1 lần append)
2. Lặp 10 session → 500 example
3. **Tip**: thay đổi cụm "Topic đa dạng: ..." mỗi session để tránh trùng (lần 1: "code/web", lần 2: "khoa học cơ bản", lần 3: "kỹ năng mềm"...)

### 1.3. Filter chất lượng (chạy local, không cần Claude)

```bash
cd backend
# Tạo script filter dựa trên app/services/leaf_quality.py
# (tôi viết sẵn nếu bạn cần — báo tôi)
python -m scripts.filter_dataset data/train.jsonl data/train_clean.jsonl --threshold 0.75
```

- [ ] Output: ~75-85% pass → còn ~400 example

### 1.4. Tách test set

- [ ] 90% → `data/train_clean.jsonl`, 10% → `data/test.jsonl`
- [ ] **Tip**: shuffle trước khi split, đảm bảo cân bằng doc_type giữa train/test

### 1.5. Khi nào cần "Anthropic API key"

- ✅ **Không cần**: nếu chấp nhận sinh tay với Pro chat
- ⚠️ **Cần** ($5-10) khi:
  - Muốn n8n tự động sinh 5000+ example mà không phải ngồi copy/paste
  - Muốn re-train định kỳ (tháng 1 lần) tự động
  - Đường dài: production scale lớn, dùng Claude API trực tiếp thay vì train Qwen (xem option D bên dưới)

---

## Phase 2 — Train Qwen2.5-7B (1 ngày, ~4h chạy + 4h chuẩn bị)

### 2.1. Setup RunPod

- [ ] Tạo Pod template: A100 40GB, image `runpod/pytorch:2.1.0-py3.10-cuda12.1.1-devel-ubuntu22.04`
- [ ] Volume 100GB
- [ ] Start pod (~$2/h, đếm từ giờ này)

### 2.2. Upload data + script

- [ ] Upload `data/train.jsonl` + `data/test.jsonl` vào pod (qua HuggingFace Hub hoặc rsync)
- [ ] Copy script `train.py` từ `information/leaf-engine-training.md` mục 3.2

### 2.3. Cài deps + train

- [ ] `pip install unsloth transformers datasets trl peft`
- [ ] `python train.py` → train 3 epochs, ~3-4h
- [ ] Verify loss giảm đều, eval loss ổn định cuối

### 2.4. Save & merge model

- [ ] Save LoRA: `model.save_pretrained("./output/lora-final")`
- [ ] Merge sang FP16: `model.save_pretrained_merged("./output/merged", tokenizer, save_method="merged_16bit")`
- [ ] Verify size ~14GB

### 2.5. Upload lên HuggingFace

- [ ] `huggingface-cli login` (paste token từ 0.4)
- [ ] `huggingface-cli upload <YOUR_USERNAME>/leafnote-leaf-engine ./output/merged`
- [ ] Verify model xuất hiện trên `https://huggingface.co/<YOUR_USERNAME>/leafnote-leaf-engine`

### 2.6. **TẮT POD NGAY** (tránh bị tính phí tiếp)

- [ ] RunPod console → Stop pod
- [ ] Verify billing dừng

---

## Phase 3 — Deploy Together AI (1 giờ)

### 3.1. Import model

- [ ] Login <https://api.together.xyz> → "Models" → "Add custom model"
- [ ] Source: HuggingFace Hub → paste `<YOUR_USERNAME>/leafnote-leaf-engine`
- [ ] Wait ~30 phút Together pull về

### 3.2. Test endpoint

- [ ] Together console → playground → gọi thử với system prompt từ `leaf-engine-contract.md`
- [ ] Verify trả về JSON array hợp lệ
- [ ] Note lại 3 thông số:
  - `LEAF_ENGINE_URL` = `https://api.together.xyz/v1/chat/completions`
  - `LEAF_ENGINE_API_KEY` = (từ 0.3)
  - `LEAF_ENGINE_MODEL` = `<YOUR_USERNAME>/leafnote-leaf-engine`

---

## Phase 4 — Cắm vào backend Leafnote (15 phút)

### 4.1. Set env trên Render (production)

- [ ] Render dashboard → Service `leafnote-api` → Environment
- [ ] Add 3 keys:

  ```
  LEAF_ENGINE_URL=https://api.together.xyz/v1/chat/completions
  LEAF_ENGINE_API_KEY=<từ Together>
  LEAF_ENGINE_MODEL=<YOUR_USERNAME>/leafnote-leaf-engine
  ```

- [ ] (Optional) `LEAF_QUALITY_MIN_SCORE=0.75` — chỉ set nếu muốn override default

### 4.2. Set env local (development)

- [ ] `cd backend && cp .env.example .env` (nếu chưa có)
- [ ] Edit `.env` — paste 3 key trên
- [ ] Verify: `python -m scripts.check_env` → tất cả check `[OK]`

### 4.3. Chạy migration

- [ ] **Local**: `cd backend && alembic upgrade head` → chạy m005 + m006
- [ ] **Production (Render)**: lần deploy tiếp theo Build Command sẽ tự chạy (theo pattern hiện tại trong context.md 2026-05-14)
- [ ] Verify Supabase: bảng `leaves` + `leaf_feedback` xuất hiện, `notes.document_type` có giá trị `theory` cho rows cũ

### 4.4. Smoke test

- [ ] `cd backend && uvicorn app.main:app --reload`
- [ ] Mở browser <http://localhost:5173>
- [ ] Tạo note mới với content >50 từ
- [ ] Bấm nút "Tách lá" trong panel Engine
- [ ] Verify: leaves xuất hiện trong panel bên phải, có type badge + content

---

## Phase 5 — Eval & monitor (chạy mỗi khi đổi model)

### 5.1. Tạo golden set chuẩn

- [ ] Mở `backend/tests/fixtures/seed_all_doctypes.jsonl` — 10 example sẵn
- [ ] Mở rộng thành 20 example (thêm 4 mỗi doc_type, trừ freeform)
- [ ] **Verify TAY** từng `expected_leaves` — đây là gold standard, sai 1 lỗi thì kéo cả eval
- [ ] Save thành `backend/tests/fixtures/golden_leaves.jsonl`

### 5.2. Chạy eval baseline (lần đầu)

```bash
cd backend
python -m scripts.eval_engine --fixture tests/fixtures/golden_leaves.jsonl --baseline
```

- [ ] Note lại score (ví dụ 0.82) — đây là baseline chuẩn

### 5.3. Eval mỗi lần đổi prompt / re-train Qwen

```bash
python -m scripts.eval_engine --fixture tests/fixtures/golden_leaves.jsonl
```

- [ ] So `delta` với baseline. Nếu `>= -0.02` → OK deploy. Nếu `< -0.02` → REGRESSION, không deploy
- [ ] Update baseline khi deploy version mới: thêm `--baseline`

### 5.4. (Sau 2 tuần production) Phân tích feedback

- [ ] Query Supabase: `SELECT leaf_id, rating, COUNT(*) FROM leaf_feedback GROUP BY leaf_id, rating`
- [ ] Lọc leaves có >=3 thumbs down → xem pattern (sai type? quá ngắn? trùng?)
- [ ] Dùng làm hard negative cho training round 2

---

## Phase 6 — Continuous improvement (sau MVP)

### 6.1. Khi user tạo >500 note thật → re-train với data thật

- [ ] Export note + leaves từ Supabase
- [ ] Filter: chỉ giữ leaves có `user_edited=True` (user đã verify)
- [ ] Mix với synthetic data 50/50 → train round 2

### 6.2. Promote `freeform` thành type mới

- [ ] Query: `SELECT plain_text FROM notes WHERE document_type='freeform'` → xem nhiều note cùng dạng nào
- [ ] Nếu thấy nhiều code snippet → promote thành `code` document_type
- [ ] Cần: thêm vào enum + migration + prompt + UI dropdown

### 6.3. Swap engine provider

- [ ] Nếu Together AI đắt → tự host vLLM trên Vast.ai (~$0.5/h, vs $0.20/1M token)
- [ ] Chỉ cần đổi `LEAF_ENGINE_URL` — không sửa code
- [ ] Verify bằng `eval_engine.py` trước khi cutover

---

## Tóm tắt timeline

```
Phase 0 (account, free)        ▰▱▱▱▱▱▱  2-3 giờ
Phase 1 (data tay với Pro)     ▰▰▰▱▱▱▱  2-3 ngày (mỗi session ~30 phút × 10)
Phase 2 (train RunPod)         ▰▱▱▱▱▱▱  1 ngày
Phase 3 (deploy Together)      ▱▰▱▱▱▱▱  1 giờ
Phase 4 (cắm vào app)          ▱▰▱▱▱▱▱  15 phút
Phase 5 (eval)                 ▱▰▱▱▱▱▱  2 giờ
─────────────────────────────────
TỔNG MVP: ~4-5 ngày, ~$13 chi phí
```

## Tóm tắt chi phí (đã cắt Anthropic key)

| Item | Cost |
|---|---|
| Claude Pro (đã có sẵn — sinh data) | $0 |
| RunPod A100 4h | $8 |
| Together AI first month | ~$5 |
| HuggingFace, n8n self-host | $0 |
| **TỔNG** | **~$13** |

Inference sau deploy Qwen: ~$0.0001/note → 10.000 note = $1.

### Đường khác (không train Qwen)

Nếu lười train, có thể skip Phase 2-3 hoàn toàn → trỏ engine thẳng vào Claude API:

- Cần: Anthropic API key + proxy nhỏ (vì Claude không phải OpenAI-compatible)
- Cost: ~$3 cho 1000 note (vs $0.10 với Qwen) — 30x đắt hơn
- **Khi nào hợp lý**: <500 user/tháng, hoặc chưa muốn đụng GPU

---

## Khi nào ping tôi (Claude)?

- Bug khi cắm engine vào (status 502/422 không rõ nguyên nhân) → tôi xem log
- Quality eval thấp <0.7 dù model chuẩn → có thể prompt cần tinh chỉnh
- Muốn thêm `document_type` mới (code/poem/legal...) → cần migration + UI + prompt
- Muốn thêm tính năng từ `future.md` (highlight mapping, surfacing, relation graph)
- Bất kỳ chỗ nào trong file này không rõ
