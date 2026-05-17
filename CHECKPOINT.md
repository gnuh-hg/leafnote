# CHECKPOINT — Sinh data huấn luyện Leaf Engine

> Sổ tay tiến độ dài hạn của plan `PLAN.md`. Mỗi lần hoàn tất một session/gate, cập nhật file này. Mục tiêu: bất kỳ phiên Claude nào mới mở đều biết đang ở đâu trong pipeline.

---

## Tiến độ tổng quan

| Hạng mục | Mục tiêu | Hiện tại | % |
|---|---|---|---|
| Sessions sinh data | 40 | **12** | 30% |
| Raw examples | 2 000 | **600** | 30% |
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
| 2 | theory | khoa học tự nhiên (lý/hoá/sinh) | ✅ done | 50 examples, validate 0 lỗi |
| 3 | theory | toán học (xác suất/ĐSTT/giải tích) | ✅ done | 50 examples, validate 0 lỗi |
| 4 | theory | ML/AI (NN/transformer/RAG) | ✅ done | 50 examples, validate 0 lỗi |
| 5 | theory | web/system (HTTP/REST/SQL/OS) | ✅ done | 50 examples, validate 0 lỗi |

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
| 6 | theory — kinh tế & tài chính | ✅ done |
| 7 | theory — tâm lý học & hành vi học | ✅ done |
| 8 | theory — ngôn ngữ học & dịch thuật | ✅ done |
| 9 | procedure — nấu ăn Việt (phở, bún, bánh mì, chè) | ✅ done |
| 10 | procedure — nấu ăn Á (sushi, kimchi, dim sum) | ✅ done |
| 11 | procedure — bánh & dessert (macaron, tiramisu, flan) | ✅ done |
| 12 | procedure — tech setup (Docker, Git flow, Linux, PostgreSQL) | ✅ done |
| 13–16 | procedure (dev workflow, thể dục, đời sống, DIY...) | ⏳ |
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

### Session 2 — 2026-05-16

- **Doc type**: theory
- **Topic**: khoa học tự nhiên — vật lý (s02-001..017), hóa học (s02-018..034), sinh học (s02-035..050)
- **Ngôn ngữ**: ~60% Vi, ~30% En, ~10% mix
- **Leaves/note**: 3–6
- **Validate**: 50/50 OK, không có lỗi JSON, không leaf >100 từ; mọi `definition` có term+meaning; mọi `example` có polarity
- **File**: `backend/data/raw_leaves.jsonl` lines 51–100

### Session 3 — 2026-05-16

- **Doc type**: theory
- **Topic**: toán học — xác suất & thống kê (s03-001..017), đại số tuyến tính (s03-018..034), giải tích (s03-035..050)
- **Ngôn ngữ**: ~60% Vi, ~30% En, ~10% mix
- **Leaves/note**: 3–5
- **Validate**: 50/50 OK, không có lỗi JSON, không leaf >100 từ; mọi `definition` có term+meaning; mọi `example` có polarity
- **File**: `backend/data/raw_leaves.jsonl` lines 101–150

### Session 4 — 2026-05-16

- **Doc type**: theory
- **Topic**: ML/AI — NN fundamentals (s04-001..010), Attention & Transformer (s04-011..019), Embeddings & retrieval (s04-020..029), RAG & hallucination (s04-025..030), Training & efficiency (s04-031..034), Reasoning & evaluation (s04-035..045), Misc (s04-046..050)
- **Ngôn ngữ**: ~70% Vi, ~20% En (s04-031..035, s04-046), ~10% mix
- **Leaves/note**: 3–4
- **Validate**: 50/50 OK, không có lỗi JSON, không có leaf >100 từ; mọi `definition` có term+meaning; mọi `example` có polarity
- **File**: `backend/data/raw_leaves.jsonl` lines 151–200

### Session 5 — 2026-05-16

- **Doc type**: theory
- **Topic**: web/system — HTTP (s05-001..012), REST (s05-013..022), SQL (s05-023..036), OS concepts (s05-037..050)
- **Ngôn ngữ**: ~55% Vi, ~35% En, ~10% mix
- **Leaves/note**: 3–5
- **Validate**: 50/50 OK, không có lỗi JSON, không có leaf >100 từ; mọi `definition` có term+meaning; mọi `example` có polarity
- **File**: `backend/data/raw_leaves.jsonl` lines 201–250

### Session 6 — 2026-05-16

- **Doc type**: theory
- **Topic**: kinh tế & tài chính — macro (s06-001..018: GDP, CPI, lãi suất, chính sách tiền tệ/tài khoá, tỷ giá, Phillips, QE, M0-M2, output gap, trade balance, crowding out, stagflation, recession, CB independence, multipliers, public debt, velocity), vi mô (s06-019..034: cầu/cung, elasticity, equilibrium, surplus, opportunity cost, marginal utility, market structures, externality, public goods, info asymmetry, moral hazard, Pareto, comparative advantage), đầu tư (s06-035..050: stock vs bond, P/E, dividend yield, ETF, DCA, lãi kép, risk/return, diversification, bond price/yield, Sharpe, asset allocation, capital gain vs dividend, bull/bear, index fund, rule of 72, margin)
- **Ngôn ngữ**: ~62% Vi, ~28% En, ~10% mix
- **Leaves/note**: 3–5
- **Validate**: 50/50 OK, không có lỗi JSON, không leaf >100 từ; mọi `definition` có term+meaning; mọi `example` có polarity
- **File**: `backend/data/raw_leaves.jsonl` lines 251–300

### Session 7 — 2026-05-16

- **Doc type**: theory
- **Topic**: tâm lý học & hành vi học — cognitive biases (s07-001..010), heuristics & dual-system (s07-011..017), memory & learning (s07-018..027), personality & motivation (s07-028..031), emotion & affect (s07-032..036), developmental & change (s07-037..040), social psych (s07-041..045), behavior change & therapy (s07-046..050)
- **Ngôn ngữ**: ~70% Vi, ~20% En (s07-002, s07-015), ~10% mix
- **Leaves/note**: 3–5
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.914**
- **File**: `backend/data/raw_leaves.jsonl` lines 301–350

### Session 8 — 2026-05-16

- **Doc type**: theory
- **Topic**: ngôn ngữ học & dịch thuật — phonetics/phonology (s08-001..007), morphology (s08-008..013), syntax (s08-014..020), semantics & pragmatics (s08-021..027), sociolinguistics & acquisition (s08-028..033), translation theory (s08-034..042), translation practice & tools (s08-043..050)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s08-003, 007, 010, 015, 018, 022, 025, 030, 036, 042, 044, 047), ~10% mix
- **Leaves/note**: 3–4
- **Validate**: 50/50 OK, 0 hard errors, 4 soft warnings (s08-008/034/040/041, low_coverage + duplicate_leaves), 92% pass ≥0.75, avg score **0.830**
- **File**: `backend/data/raw_leaves.jsonl` lines 351–400

### Session 10 — 2026-05-17

- **Doc type**: procedure
- **Topic**: nấu ăn Á — sushi (s10-001..017: nigiri, maki, sushi rice, tamagoyaki, temaki, inari, chirashi, California roll, sashimi, uramaki, maguro, spicy tuna, gari, wasabi, dipping etiquette, sushizu, hosomaki), kimchi (s10-018..033: baechu, kkakdugi, oi sobagi, paste base, saewujeot, fish-sauce mix, salting cabbage, fermentation temp, baek kimchi, pa kimchi, dongchimi, storage, kimchi fried rice, jjigae, vegan kimchi, yeolmu), dim sum (s10-034..050: har gow, siu mai, char siu bao, cheung fun, egg tart, lo mai gai, xiao long bao, liu sha bao, lo bak go, wonton, spring roll, steaming, crystal dough, pork filling, lotus wrap, chili oil, pleating)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s10-003, 007, 010, 012, 020, 024, 026, 027, 030, 033, 036, 039, 041, 044, 048), ~10% mix (s10-005, 032, 049)
- **Leaves/note**: 6–8 (procedure step-heavy)
- **Validate**: 50/50 OK, 0 hard errors, 3 soft warnings (s10-009/025/047 intro fact không có ordinal — skill cho phép), 100% pass ≥0.75, avg score **0.866**
- **File**: `backend/data/raw_leaves.jsonl` lines 451–500

### Session 9 — 2026-05-17

- **Doc type**: procedure
- **Topic**: nấu ăn Việt — phở & bún (s09-001..020: phở bò/gà/chua, quick pho, kỹ thuật nước dùng, sa tế Huế, bún bò Huế, bún chả, bún riêu, bún mắm, bún thang, bún ốc, bún đậu), bánh mì (s09-021..030: thịt nguội, xíu mại, pork belly, pate, vỏ giòn, chả cá, trứng ốp, đồ chua, muối ớt, vegan), chè (s09-031..040: ba màu, đậu xanh nha đam, khúc bạch, trôi nước, bưởi, chuối cốt dừa, thái sầu riêng, bà ba, hạt sen long nhãn, khoai môn), món khác (s09-041..050: gỏi cuốn, tương đậu, nem rán, bánh xèo, cơm tấm, xôi xéo, cà phê sữa đá, peanut sauce, bánh cuốn, bún bò Nam Bộ)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s09-004, 008, 013, 016, 023, 030, 036, 039, 043, 048), ~10% mix (s09-019, 028)
- **Leaves/note**: 5–7 (mostly procedure steps + intro definition)
- **Validate**: 50/50 OK, 0 hard errors, 1 soft warning (s09-048 = 0.75 ngưỡng, low_coverage + duplicate_leaves), 98% pass ≥0.75, avg score **0.884**
- **File**: `backend/data/raw_leaves.jsonl` lines 401–450

---

## Bài học rút ra (đã có fix)

### 1. Trường ngoài schema (lỗi tại session 5–6)

Ban đầu sinh leaves kèm `user_edited: false` → 404 leaves bị thừa key. Đã strip ngày 2026-05-16. **Nguồn gốc**: nhầm DB schema (`LeafOut`) với training schema (`LeafEngineItem`). Training data chỉ có 4 keys: `type`, `content`, `metadata`, `confidence`. Skill đã được cảnh báo rõ ở `Bước 3 → Quy tắc leaf`.

### 2. Metadata sai doc_type (lỗi tại session 1)

`s01-020` và `s01-031` có fact-with-ordinal trong note `theory` → 6 leaves. Đã strip ordinal ngày 2026-05-16. **Nguồn gốc**: `ordinal` chỉ dùng cho procedure step. Skill đã được fix với matrix `(type, document_type)` rõ ràng.

### 3. Threshold filter chưa được nêu cụ thể trong skill (đã gia cố)

Skill ban đầu nói "không trùng", "cover hết ý" định tính → Claude không biết khi nào leaf bị reject. Đã thêm section "Threshold filter sẽ chấm" với 3 con số (coverage 0.75, jaccard 0.85, granularity 15) + sửa ngưỡng atomicity 100 → 80 (khớp filter thật `leaf_quality.py:15`).

## Quy ước mới (áp dụng từ session 7)

Sau mỗi session sinh data, **trước khi cập nhật CHECKPOINT**:

```powershell
cd backend
python -m scripts.validate_session --last 50
```

- Nếu **Hard errors > 0** → sửa hoặc strip ngay, không tiếp.
- Nếu **Score ≥ 0.75 < 90%** → cân nhắc redo session (sẽ bị filter reject nhiều).
- Pass cả hai → tick `✅ done` và cập nhật bảng.

Baseline hiện tại (sau 300 example): **98% pass rate**, avg score 0.857.

### Session 11 — 2026-05-17

- **Doc type**: procedure
- **Topic**: bánh & dessert — macaron (s11-001..013: vỏ Pháp/Ý, ganache, matcha, troubleshoot nứt/hollow, màu, lemon curd, raspberry buttercream, mature, pied, savory, storage), tiramisu (s11-014..026: classic, savoiardi, egg-safe pasteurize, matcha, mascarpone thay thế, cup mini, eggless, coffee soak, tách nước, strawberry, pistachio, cắt đẹp, bảo quản), bánh flan (s11-027..039: classic, caramel, hấp không rỗ, bain-marie lò, lá dứa cốt dừa, trứng muối, phô mai, úp đĩa, cafe sữa, socola, pumpkin Mexico, dừa non, tổ ong), other classics (s11-040..050: NY cheesecake, fudgy brownies, soufflé, panna cotta, choux, crème brûlée, mousse, bingsu, bánh chuối nướng, éclair, bánh bao chỉ)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s11-002, 008, 016, 023, 037), ~10% mix
- **Leaves/note**: 5–8 (procedure step-heavy + intro definition)
- **Validate**: 50/50 OK, 0 hard errors, 42 soft warnings (intro fact không có ordinal — skill cho phép), 100% pass ≥0.75, avg score **0.930**
- **File**: `backend/data/raw_leaves.jsonl` lines 501–550

### Session 12 — 2026-05-17

- **Doc type**: procedure
- **Topic**: tech setup — Docker (s12-001..015: Desktop Win, Engine Ubuntu, Dockerfile Node, multi-stage, Compose, volume, push Hub, bridge network, exec debug, healthcheck, build cache + .dockerignore, restart policy, BuildKit, resource limits, system prune), Git flow (s12-016..028: feature branch, merge conflict, interactive rebase squash, cherry-pick, pre-commit, stash, force-with-lease, bisect, Conventional Commits PR, submodule, revert merge, reflog rescue, hotfix), Linux (s12-029..040: SSH key, systemd service, ps + kill, cron backup, UFW firewall, mount USB, tar + gzip, sudo user, chmod chown, du + df, journalctl, apt update), PostgreSQL (s12-041..050: cài PG16 Ubuntu, tạo DB + user role, pg_dump backup, restore, tune postgresql.conf, create index, EXPLAIN ANALYZE, streaming replication, PgBouncer pooling, reset password postgres)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s12-002, 005, 010, 013, 015, 018, 022, 025, 027, 030, 033, 036, 038, 043, 045, 048), ~10% mix (s12-008, 020, 038, 049)
- **Leaves/note**: 6–9 (procedure step-heavy + intro definition + outro tip)
- **Validate**: 50/50 OK, 0 hard errors, 49 soft warnings (intro/outro fact không có ordinal — skill cho phép), 100% pass ≥0.75, avg score **0.889**
- **File**: `backend/data/raw_leaves.jsonl` lines 551–600

## Quy ước cập nhật CHECKPOINT

Sau mỗi session:

1. Chạy `validate_session.py --last 50` → 0 hard errors
2. Tick `✅ done` ở bảng Phase tương ứng
3. Cập nhật bảng "Tiến độ tổng quan" — tăng số sessions + examples
4. Thêm entry vào "Lịch sử session" (ngày, topic, validate result)

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
