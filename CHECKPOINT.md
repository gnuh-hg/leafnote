# CHECKPOINT — Sinh data huấn luyện Leaf Engine

> Sổ tay tiến độ dài hạn của plan `PLAN.md`. Mỗi lần hoàn tất một session/gate, cập nhật file này. Mục tiêu: bất kỳ phiên Claude nào mới mở đều biết đang ở đâu trong pipeline.

---

## Tiến độ tổng quan

| Hạng mục | Mục tiêu | Hiện tại | % |
|---|---|---|---|
| Sessions sinh data | 40 | **31** | 78% |
| Raw examples | 2 000 | **1 550** | 78% |
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
| 3 | theory | toán học (xác suất/ĐSTT/giải tích) | ✅ done | Redo với LaTeX 2026-05-17, 96% example có LaTeX (48/50), avg score 0.857 |
| 4 | theory | ML/AI (NN/transformer/RAG) | ✅ done | Redo với LaTeX 2026-05-17, 66% example có LaTeX (33/50), avg score 0.868 |
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
| 13 | procedure — dev workflow (CI/CD, code review, deploy) | ✅ done |
| 14 | procedure — thể dục & sức khoẻ (gym, yoga, chạy bộ) | ✅ done |
| 15 | procedure — đời sống (du lịch packing, chăm sóc cây, dọn dẹp) | ✅ done |
| 16 | procedure — DIY & craft (origami, vẽ tranh, sửa đồ gia dụng) | ✅ done |
| 17 | narrative — nhật ký học tập: lần đầu học coding, thi cử | ✅ done |
| 18 | narrative — nhật ký làm việc: deadline, meeting, bug khó | ✅ done |
| 19 | narrative — kỷ niệm du lịch (HN/ĐN/quốc tế) | ✅ done |
| 20 | narrative — sự kiện gia đình & bạn bè | ✅ done |

**Phase 2 gate (sau session 15)**:

- [ ] Filter + split
- [ ] Train Qwen2.5-7B thử lần 1
- [ ] Eval score ≥ baseline − 0.02

---

## Phase 3 — Expand (session 21–40)

**Mục tiêu**: đa dạng + edge cases.

| Sessions | Doc type | Status |
|---|---|---|
| 21 | narrative — hành trình cá nhân: học ngôn ngữ, thay đổi thói quen | ✅ done |
| 22 | narrative — review sách, phim, podcast | ✅ done |
| 23 | narrative — thất bại & bài học rút ra | ✅ done |
| 24 | narrative — mục tiêu năm & nhìn lại | ✅ done |
| 25 | reference — cheatsheet: Git commands, SQL queries | ✅ done |
| 26 | reference — cheatsheet: Regex, HTTP status codes, CLI tools | ✅ done |
| 27 | reference — cheatsheet: Python stdlib, JS built-ins | ✅ done |
| 28 | reference — thuật ngữ y học & sức khoẻ | ✅ done |
| 29 | reference — thuật ngữ kinh tế & pháp lý | ✅ done |
| 30 | reference — thuật ngữ tâm lý & giáo dục | ✅ done |
| 31 | reference — danh sách: sách hay, tool hữu ích, resource học | ✅ done |
| 32 | reference — so sánh công nghệ | ⏳ |
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

### Session 3 — 2026-05-16 (DEPRECATED, đã strip — xem Session 3 redo bên dưới)

- **Doc type**: theory
- **Topic**: toán học — xác suất & thống kê, đại số tuyến tính, giải tích
- **Lý do strip**: sinh khi skill còn cấm LaTeX, không có công thức — đã thay bằng version mới (xem entry s03-redo)

### Session 4 — 2026-05-16 (DEPRECATED, đã strip — xem Session 4 redo bên dưới)

- **Doc type**: theory
- **Topic**: ML/AI — NN, Transformer, Embeddings, RAG
- **Lý do strip**: sinh khi skill còn cấm LaTeX, không có công thức — đã thay bằng version mới (xem entry s04-redo)

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

### 4. LaTeX bị cấm khi sinh data sớm (2026-05-17)

Session 1–12 sinh khi skill còn cấm LaTeX → session 3 (toán) và session 4 (ML/AI) không có công thức nào dù topic rất phù hợp. Đã mở khoá LaTeX trong skill + PLAN.md + contract sau khi tích hợp `@tiptap/extension-mathematics` ở frontend và `leaf_quality._tokens()` strip math block. **Action**: strip lines 101–200 trong `raw_leaves.jsonl` và sinh lại 2 session đó với LaTeX. Các session khác (1, 2, 5–12) không bắt buộc redo vì topic không có công thức rõ ràng. **✅ DONE 2026-05-17**: s3 redo 96% LaTeX (avg 0.857), s4 redo 66% LaTeX (avg 0.868), validate 0 hard errors cả hai.

### 5. Field `metadata.format: "math"` dư thừa (2026-05-17)

Khi mở khoá LaTeX, rule yêu cầu mọi leaf chứa `$...$` phải gắn `metadata.format: "math"`. Sau khi sinh xong nhận ra field này dư thừa: downstream (filter `leaf_quality._tokens()`, frontend KaTeX, scorer) detect delimiter `$` trực tiếp từ content, không đọc metadata.format; rule chỉ thêm gánh nặng cho model fine-tune mà không mang signal mới. **Action**: bỏ rule khỏi SKILL + PLAN + contract, chạy script strip 93 field đã sinh ở s03/s04 (lines 501–600). Validate sau strip: 100% pass, avg score 0.862. Giữ `format: "code"` vì code không có delimiter chuẩn trong content.

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

### Session 3 redo — 2026-05-17 (LaTeX)

- **Doc type**: theory
- **Topic**: toán học — xác suất & thống kê (s03-001..017), đại số tuyến tính (s03-018..034), giải tích (s03-035..050)
- **Ngôn ngữ**: ~70% Vi, ~22% En, ~8% mix
- **Leaves/note**: 3
- **LaTeX**: **48/50 example (96%)** chứa công thức `$...$`/`$$...$$`; mọi leaf chứa LaTeX có `metadata.format: "math"`
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.857**
- **File**: `backend/data/raw_leaves.jsonl` lines 501–550 (vị trí mới sau strip+append)

### Session 13 — 2026-05-17

- **Doc type**: procedure
- **Topic**: dev workflow — CI/CD (s13-001..018: GitHub Actions workflow cơ bản, matrix Node, cache deps, secrets, artifact, schedule cron, reusable workflow, required status checks, self-hosted runner, lint job, test sharding, Codecov, Docker build/push, release on tag, Slack notify, pin action SHA, Playwright E2E, GitLab CI), code review (s13-019..030: PR template, CODEOWNERS, Conventional Commits, squash merge, review checklist, self-review, stacked PRs, draft PR, resolve conversation, comment etiquette, auto-merge, pair review), deploy (s13-031..044: blue-green, canary, K8s rolling update, feature flag, Vercel, Fly.io, DB migration, smoke test, K8s probes, rollback, Lambda Serverless, ArgoCD GitOps, preview env per PR, maintenance mode), release (s13-045..050: semver, release-please CHANGELOG, Git tag, release notes, hotfix branch, Grafana deploy monitor)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s13-002, 005, 009, 011, 017, 023, 025), ~10% mix
- **Leaves/note**: 6–8 (procedure step-heavy + intro/outro)
- **Validate**: 50/50 OK, 0 hard errors, 24 soft warnings (intro fact không có ordinal — skill cho phép), 100% pass ≥0.75, avg score **0.901**
- **File**: `backend/data/raw_leaves.jsonl` lines 601–650

### Session 14 — 2026-05-17

- **Doc type**: procedure
- **Topic**: thể dục & sức khoẻ — gym (s14-001..017: squat, deadlift, bench, OHP, pull-up, barbell row, lunge, plank, push-up, warm-up, progressive overload, rest periods, cool-down, mobility, foam rolling, gym etiquette, máy vs tạ tự do), yoga (s14-018..034: Surya Namaskar A, downward dog, Warrior I/II/III, tree pose, child's pose, pranayama, vinyasa flow sáng, restorative tối, yin 60 phút, hatha 30 phút, mindfulness meditation, savasana, hot yoga prep, chăm sóc thảm, hip openers, backbend, balance tối), chạy bộ (s14-035..050: C25K tuần 1, running form, thở 3:2, interval 400m, long run, tempo, recovery run, chọn giày, hydration, fueling, heat acclimation, hill repeats, treadmill, race morning, phòng knee injury, stretch sau chạy)
- **Ngôn ngữ**: ~62% Vi, ~28% En (s14-002, 005, 008, 012, 015, 019, 022, 026, 029, 032, 036, 038, 041, 045, 048), ~10% mix (s14-010, 024, 044)
- **Leaves/note**: 5–6 (procedure step-heavy + intro definition + outro note/example)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.891**
- **File**: `backend/data/raw_leaves.jsonl` lines 651–700

### Session 4 redo — 2026-05-17 (LaTeX)

- **Doc type**: theory
- **Topic**: ML/AI — NN fundamentals (s04-001..010), Transformer & attention (s04-011..020), Embeddings & RAG (s04-021..030), Training & efficiency (s04-031..040), Evaluation & misc (s04-041..050)
- **Ngôn ngữ**: ~52% Vi, ~38% En, ~10% mix
- **Leaves/note**: 3
- **LaTeX**: **33/50 example (66%)** chứa công thức (attention scaling, softmax, RoPE, LoRA, distillation, perplexity, BLEU, MoE...); mọi leaf chứa LaTeX có `metadata.format: "math"`
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.868**
- **File**: `backend/data/raw_leaves.jsonl` lines 551–600 (vị trí mới sau strip+append)

### Session 15 — 2026-05-17

- **Doc type**: procedure
- **Topic**: đời sống — du lịch packing (s15-001..017: công tác 3 ngày, carry-on quốc tế, cuộn quần áo, packing cubes, đồ điện tử, TSA 3-1-1, trekking 5 ngày, beach trip, gia đình có em bé, winter layering, camping cuối tuần, backpacking Europe, vali ký gửi, travel laundry, túi y tế, documents wallet, bleisure), chăm sóc cây (s15-018..034: sen đá, monstera, trầu bà, fiddle leaf fig, húng quế, snake plant, rệp sáp, basil pinching, phát lộc thuỷ canh, orchid fertilizing, xương rồng mùa đông, succulent propagation, cà chua, pothos, phục hồi úng nước, Kratky hydroponic, mai chiếu thuỷ), dọn dẹp (s15-035..050: KonMari 6 bước, weekly schedule, bếp gas, bathroom deep clean, drap giường, carpet stain, cửa kính, stainless sink, tủ quần áo theo mùa, paperwork 3-pass, máy giặt cửa trước, microwave steam, sàn gỗ, pantry tier, mùi tủ lạnh, digital declutter)
- **Ngôn ngữ**: ~58% Vi, ~32% En (s15-002, 004, 006, 008, 010, 012, 014, 016, 019, 021, 023, 025, 027, 029, 031, 036, 038, 040, 042, 044, 046, 050), ~10% mix (s15-017, 033, 048)
- **Leaves/note**: 6–8 (procedure step-heavy + intro definition + outro note)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.906**
- **File**: `backend/data/raw_leaves.jsonl` lines 701–750

### Session 17 — 2026-05-18

- **Doc type**: narrative
- **Topic**: nhật ký học tập — lần đầu coding (s17-001..017: cài Python, JS loop, debug 3 tiếng, arrow function, React first, prod incident, pytest, CS50 finish, git rebase, Vercel deploy, first PR open source, hackathon 48h, freelance đầu tiên, SQL 3 ngày, leetcode hard, mentor junior, bỏ Java), thi cử (s17-018..032: thi tốt nghiệp Toán, IELTS Speaking, trượt Google, ôn thi gấp, TOEIC retake, HSG Toán cấp tỉnh, AWS SAA, trượt Meta lần 2, bảo vệ đồ án, JLPT N3, CCHN kế toán, PhD comprehensive, bằng lái B2, Chevening rớt pre-screening, bar exam), học tập khác (s17-033..050: học vẽ tuổi 32, học bơi tuổi 28, học guitar, UK driving theory, Spanish 30p/ngày, math olympiad, GMAT first lesson, self-taught engineer, rớt môn ĐSTT, thi bartender, mock thesis defense, PMP, relearn math at 34, spelling bee lớp 6, tự nấu ăn, sourdough loaf 10, đội bơi cấp 2, phỏng vấn Ams)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s17-002, 006, 009, 012, 015, 017, 019, 022, 024, 027, 029, 032, 034, 036, 038, 040, 043, 045, 048), ~10% mix
- **Leaves/note**: 3–4 (narrative — fact theo timeline + 1 note rút ra bài học)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.895**
- **File**: `backend/data/raw_leaves.jsonl` lines 801–850

### Session 18 — 2026-05-18

- **Doc type**: narrative
- **Topic**: nhật ký làm việc — deadline & release (s18-001..017: ship Stripe, v2.0 cutover, hotfix Fri, investor demo, EoQ crunch, mobile launch, OKR review, PyCon submit, Black Friday prep, code freeze, cloud migration, Q1 roadmap, grant proposal, SOC2 audit, urgent customer fix, press timing, MVP 6-week), meeting (s18-018..034: standup quá dài, sprint planning, architecture review, 1-on-1 manager mới, retro incident, demo go sideways, all-hands, design critique, vendor pitch, cross-team sync, stakeholder update, onboarding, perf review, backlog grooming, tech talk, hiring panel, town hall layoff), bug khó (s18-035..050: prod outage 3am, Node memory leak, race deploy, CI flaky, Safari CORS, SQL deadlock, Samsung crash, timezone billing, stale cache, WS Cloudflare timeout, off-by-one pagination, float money, Rust jemalloc, CLS font swap, JWT renew race, Pydantic upgrade regression)
- **Ngôn ngữ**: ~60% Vi, ~28% En (s18-002, 009, 011, 017, 040, 050), ~12% mix
- **Leaves/note**: 3–4 (narrative — fact theo timeline + note bài học)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.878**
- **File**: `backend/data/raw_leaves.jsonl` lines 851–900

### Session 19 — 2026-05-18

- **Doc type**: narrative
- **Topic**: kỷ niệm du lịch — Hà Nội & miền Bắc (s19-001..017: phở Bát Đàn, Old Quarter, giao thừa Tết, Sapa tàu đêm, Cát Cát trek, Ninh Bình day trip, Tam Cốc mưa lũ, làng cổ Đường Lâm, Train Street, Hạ Long cruise, Cát Bà solo, phố cổ countdown, bún chả Obama, Mai Châu một tuần, Tạ Hiện late night, Lăng Bác, Hà Giang loop), Đà Nẵng & miền Trung (s19-018..034: Đà Nẵng đầu tiên, My Khe sunrise, Bà Nà Hills, Hội An lantern, Đồng Văn, Huế mưa, Phú Quốc resort, Đà Lạt hoa, Quy Nhơn coast, Bãi Sao bình minh, Phong Nha hang, Nha Trang bão, Mui Ne dunes, Côn Đảo, Vũng Tàu, Hội An ngày thường, đèo Hải Vân), nước ngoài (s19-035..050: Tokyo solo, Kyoto autumn, Singapore 36h, Bangkok food, Bali Ubud, Seoul đông, HK layover, Taipei night markets, Chiang Mai temple, Paris, Berlin techno, Lisbon trams, Cappadocia balloon, Iceland Ring Road, NYC, Đà Lạt mất ví)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s19-002, 006, 010, 013, 015, 019, 021, 026, 030, 032, 035, 036, 038, 042, 044, 046, 048, 049), ~10% mix
- **Leaves/note**: 3 (narrative — 2 fact theo timeline + 1 note bài học)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.891**
- **File**: `backend/data/raw_leaves.jsonl` lines 901–950

### Session 20 — 2026-05-18

- **Doc type**: narrative
- **Topic**: sự kiện gia đình & bạn bè — family events (s20-001..017: Tết đoàn viên, sinh nhật bố 60, đám cưới chị, giỗ ông nội, tân gia, đầy tháng cháu, mừng thọ bà 80, sinh nhật mẹ bất ngờ, Tết Đoan Ngọ, họp gia đình lớn, Ngày của Mẹ tự nấu, Vu Lan, đám cưới bạc 25 năm, thôi nôi bốc đồ, ăn hỏi em gái, giỗ tổ họ, sinh nhật chung anh em), friend events (s20-018..034: reunion cấp 3, sinh nhật bạn ở Đà Lạt, bachelor party Hạ Long, chia tay đồng nghiệp 8 năm, du lịch Cát Bà, reunion trại hè, baby shower, nhậu mừng FAANG offer, đám cưới best friend, Halloween party, countdown rooftop, picnic Ba Vì, BBQ rooftop, karaoke chia tay đồng nghiệp Nhật, Ghibli marathon, camping Mộc Châu, đám cưới ở Đà Nẵng), milestones (s20-035..050: tốt nghiệp ĐH, first paycheck dinner, bố mẹ thăm Hà Nội, chia tay người yêu, mua nhà đầu tiên, đám tang ông ngoại, em đi du học, best friend moving abroad, sinh nhật 30 tự thưởng, bringing baby home, bố nghỉ hưu 38 năm, mẹ phục hồi phẫu thuật, cancer recovery 5 năm, Baek-il con gái, cháu trai đầu lòng, reunion KTX Sài Gòn)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s20-002, 007, 018, 024, 027, 034, 036, 042, 044, 047), ~10% mix
- **Leaves/note**: 3 (đa số) — narrative: 2 fact theo timeline + 1 note bài học; s20-048 có thêm 1 definition (Baek-il)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.924**
- **File**: `backend/data/raw_leaves.jsonl` lines 951–1000

### Session 21 — 2026-05-18

- **Doc type**: narrative
- **Topic**: hành trình cá nhân — học ngôn ngữ (s21-001..017: tiếng Nhật N5→N3, Spanish Duolingo, IELTS Speaking 5→7, tiếng Trung qua phim Đài Loan, French A1 self-taught, Korean qua K-pop, German B1 8 tháng, shadow speaking, Alliance Française, 100 days Italian Anki, Cyrillic 2 tuần, Portuguese sau Spanish, Thai Bangkok, Vietnamese heritage speaker, Cantonese parents-only, ASL 6 tháng, Latin nghiên cứu), thay đổi thói quen (s21-018..050: bỏ thuốc lá, thiền 5 phút, ngủ 10h tối, bỏ Instagram 1 tháng, 2L nước/ngày, gym 5x/tuần, đọc trước ngủ, viết nhật ký 365 ngày, bỏ cà phê 30 ngày, học code 1h/ngày, 10000 bước, nấu ăn ở nhà, C25K, bỏ ăn vặt tối, pay yourself first, piano tuổi 35, 12 sách/năm, cold shower 30 ngày, no-phone bữa ăn, bullet journal, yoga tối, no-spend month, vegan trial, dậy 5h sáng, Pomodoro, hand-lettering 100 ngày, đi xe đạp làm, bỏ social drinking, cắt news consumption, digital sabbath, 24h impulse rule, breathing 4-7-8, stress eating)
- **Ngôn ngữ**: ~58% Vi, ~32% En (s21-002, 005, 007, 010, 012, 019, 023, 026, 030, 034, 040, 046), ~10% mix (s21-008, 015, 042, 045)
- **Leaves/note**: 3–5 (narrative — 2-3 fact theo timeline + 1 note bài học, một số có thêm fact thứ 4 cho insight)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.922**
- **File**: `backend/data/raw_leaves.jsonl` lines 1001–1050

### Session 22 — 2026-05-18

- **Doc type**: narrative
- **Topic**: review sách, phim, podcast — sách (s22-001..017: Atomic Habits, Sapiens, Đắc Nhân Tâm, Pragmatic Programmer, Tuổi Trẻ Đáng Giá Bao Nhiêu, Thinking Fast and Slow, Cà Phê Cùng Tony, Deep Work, Nhà Giả Kim, DDIA, Người Đua Diều, Lean Startup, Cây Cam Ngọt Của Tôi, Mindset, Số Đỏ, Clean Code, Tôi Tài Giỏi Bạn Cũng Thế), phim (s22-018..034: Inception, Mắt Biếc, Parasite, Interstellar, Bố Già, Spirited Away, La La Land, Em Và Trịnh, Shawshank, Tiệc Trăng Máu, EEAAO, Hai Phượng, The Dark Knight, Khi Cha Vào Bếp phim ngắn, Whiplash, Tro Tàn Rực Rỡ, Your Name), podcast (s22-035..050: Have A Sip, Lex Fridman, Tiền Tỷ Mỗi Ngày, Tim Ferriss, Vietnam Innovators, Hidden Brain, Sunhuyn, Acquired, Fonos sách nói, Huberman Lab, Tâm Sự Tuổi 30, The Daily NYT, Vui Vẻ Là Chính, Darknet Diaries, Workup Podcast, Founders Podcast)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s22-002, 004, 006, 008, 010, 012, 014, 018, 021, 024, 026, 028, 030, 032, 036, 038, 040, 042, 044, 046, 048, 050), ~10% mix (s22-034, 039)
- **Leaves/note**: 3 (narrative — 2 fact theo timeline/quan sát + 1 note bài học/khuyến nghị)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.913**
- **File**: `backend/data/raw_leaves.jsonl` lines 1051–1100

### Session 23 — 2026-05-18

- **Doc type**: narrative
- **Topic**: thất bại & bài học rút ra — học tập (s23-001..010: trượt NV1, rớt ĐSTT, đồ án làm lại, PhD scholarship, IELTS Writing 6.0, GMAT thấp target 100, Chevening pre-screen, dropout MBA, MOS Excel, comp exam PhD), sự nghiệp (s23-011..022: layoff startup, từ chối lên Senior, co-founder split, SaaS doanh thu 0, fire vì conflict manager, FAANG fail 3 onsite, mất khách freelance 65%, quit Friday emotion, skip promotion politics, side project abandoned, quán cà phê đóng, email Bcc lộ pricing), quan hệ (s23-023..032: yêu xa 5 năm, mất bạn thân 12 năm, cãi bố 6 tháng, divorce year 2, isolated in-laws, mất mentor, roommate đuổi, family business rift, mèo Mochi FIP, college group drift), tài chính (s23-033..040: crypto mất 80%, scam Shopee, mua nhà sai timing, payday loan 380% APR, P2P Ponzi, xe trả góp, NVDA options, lifestyle creep), sức khoẻ & lối sống (s23-041..050: burnout 12 tuần leave, knee tear marathon, +12 kg pandemic, insomnia caffeine, bỏ thuốc fail 3 lần, panic attack, trĩ cube farm, chuyển SG sai 8 tháng, sourdough 15 fail, piano abandoned)
- **Ngôn ngữ**: ~58% Vi, ~32% En (s23-002, 010, 016, 018, 026, 027, 030, 032, 036, 039, 042, 044, 046), ~10% mix (s23-020, 028, 034, 048)
- **Leaves/note**: 3 (narrative — 2 fact theo timeline + 1 note bài học)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.856**
- **File**: `backend/data/raw_leaves.jsonl` lines 1101–1150

### Session 24 — 2026-05-18

- **Doc type**: narrative
- **Topic**: mục tiêu năm & nhìn lại — yearly goals & resolutions (s24-001..017: 3 mục tiêu lớn 2026, 24-book reading challenge, nhìn lại 2024 chuyển việc, 7 nước backpacker, half marathon Q1, MicroSaaS Q2 200 USD MRR, quỹ khẩn cấp 6 tháng 96tr, half-year check kill goals, JLPT N2 tháng 12, giảm 10kg 2024, lên Senior Engineer matrix 4 trục, PhD comprehensive pass, ngủ trước 11h, career pivot to data 2023, ít drama relationships, less doom-scroll intentions, blog 52 bài/năm), nhìn lại & retrospective (s24-018..034: năm đầu làm mẹ, 3 biggest wins, khám định kỳ 4 lần/năm, Q3 Start/Stop/Continue, 18 sách Việt, 2024 in numbers fiancé, nấu 5 ngày/tuần, 84 GitHub stars adjust target, giảm caffeine 4→1 ly, decade reflection 2015-2025, FAANG volume goals 8 lần, 30s lessons, Canada PR Express Entry, year of saying yes 28 yeses, 100 ngày thiền ngày 67, bad year 2024 stripped, giảm nhựa 31→7), milestones & specific bets (s24-035..050: tốt nghiệp sớm 1 kỳ, mid-year June 2025 delete, xuất bản truyện 10 nơi, 3 lessons 2023 closet door, leo Fansipan tháng 4, post-layoff reset February, vườn ban công 5 loại, thesis chapter 3 trước Tết, gọi bố mẹ Chủ Nhật 15p, intentional spending 72h rule, guitar 20 bài tủ, FOMO defensive 5-step rule, post-wedding shared goals, chữa lành sau 4 năm, 30s big bets depth/family/roots, Instagram <30p/day claim 75h)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s24-002, 004, 006, 008, 010, 012, 014, 019, 021, 023, 025, 029, 031, 033, 036, 038, 040, 044, 047, 049), ~10% mix (s24-016, 027, 042)
- **Leaves/note**: 3 (narrative — 2 fact theo timeline/observation + 1 note bài học/insight)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.916**
- **File**: `backend/data/raw_leaves.jsonl` lines 1151–1200

### Session 25 — 2026-05-18

- **Doc type**: reference
- **Topic**: cheatsheet — Git commands (s25-001..025: init/clone, status/add, commit, log, diff, branch, switch/restore, merge, rebase, fetch/pull, push, reset, reset-vs-revert, stash, tag, remote, cherry-pick, bisect, reflog, config, blame, .gitignore, submodule, hooks, pull --rebase vs merge), SQL queries (s25-026..050: SELECT, WHERE, JOIN types, GROUP BY, HAVING vs WHERE, ORDER BY/LIMIT, INSERT, UPDATE, DELETE/TRUNCATE, CREATE TABLE, ALTER TABLE, subquery, CTE, window functions, UNION vs UNION ALL, CASE WHEN, NULL handling, transactions/ACID, INDEX, PK vs UNIQUE, FOREIGN KEY, VIEW, EXPLAIN, string functions, date/time functions)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s25-003, 007, 010, 013, 016, 027, 030, 033, 036, 040, 042, 045, 048), ~10% mix (s25-035)
- **Leaves/note**: 3–4 (reference — mix definition + fact + occasional example/note; fact KHÔNG có ordinal vì reference)
- **Format note**: heading + danh sách + 1 blockquote tip; nhiều leaf code có `metadata.format: "code"`
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.865**
- **File**: `backend/data/raw_leaves.jsonl` lines 1201–1250

### Session 26 — 2026-05-18

- **Doc type**: reference
- **Topic**: cheatsheet — Regex (s26-001..017: metacharacters, quantifiers, groups & alternation, lookaround, flags, email validation, URL parsing, VND amount, VN phone, ISO date, CSV split, sed/grep flavors, replacement template, advanced anchors, common pitfalls, log parsing, test tools), HTTP status codes (s26-018..026, 034: 1xx informational, 2xx success, 3xx redirection, 400 vs 401 vs 403, 404 vs 410, 405 vs 409, 422 vs 400, 429 rate limit, 5xx server errors, 451 legal), CLI tools (s26-027..033, 035..050: ls/eza, grep/ripgrep, find/fd, curl, jq, tmux, ssh advanced, sed, awk, xargs, tar/gzip, rsync, chmod/chown, fzf, bat, process management, networking, disk usage, zoxide, which/type, env vars, history shortcuts, less pager)
- **Ngôn ngữ**: ~58% Vi, ~32% En (s26-002, 007, 015, 030, 042), ~10% mix
- **Leaves/note**: 3–4 (reference — mix definition + fact + example/note; fact KHÔNG có ordinal vì reference)
- **Format note**: heading + danh sách + blockquote; nhiều leaf code có `metadata.format: "code"` cho snippet command/regex
- **Validate**: 50/50 OK, 0 hard errors, 3 soft warnings (s26-002/014/015 low_coverage gần ngưỡng), 94% pass ≥0.75, avg score **0.826**
- **File**: `backend/data/raw_leaves.jsonl` lines 1251–1300

### Session 27 — 2026-05-18

- **Doc type**: reference
- **Topic**: cheatsheet — Python stdlib (s27-001..025: collections.Counter/defaultdict/deque/OrderedDict+namedtuple, itertools.chain+islice/groupby/combinatorics, functools.lru_cache/partial/reduce, pathlib.Path basics + glob, datetime basics + timedelta+tz, json module, os.path+environ, sys.argv+path, re module, typing Optional/Union + TypedDict/Protocol, dataclasses, enum, contextlib, asyncio, subprocess.run), JS built-ins (s27-026..050: Array map/filter/reduce + find/includes + flat/flatMap + destructuring, Object keys/values/entries + spread/rest + assign vs spread, String split/replace + template literals, Number parseInt+isNaN, Map vs Object + Set, Promise.all/race/allSettled/any + async/await, JSON stringify/parse, Date, Math, RegExp methods, Symbol, Iterator + for-of, fetch API, Intl, optional chaining + nullish coalescing, structuredClone, Generators)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s27-002, 005, 009, 012, 015, 020, 024, 027, 029, 032, 036, 038, 040, 045, 047), ~10% mix
- **Leaves/note**: 3–4 (reference — mix definition + fact + example/note; fact KHÔNG có ordinal vì reference)
- **Format note**: heading + danh sách + 1 blockquote tip + fenced-style code description; phần lớn leaf code có `metadata.format: "code"` cho snippet command/regex/code; s27-007/014/042/044 dùng LaTeX `$...$` cho công thức toán
- **Validate**: 50/50 OK, 0 hard errors, 1 soft warning (s27-002 score 0.74 — low_coverage gần ngưỡng), 98% pass ≥0.75, avg score **0.846**
- **File**: `backend/data/raw_leaves.jsonl` lines 1301–1350

### Session 29 — 2026-05-18

- **Doc type**: reference
- **Topic**: thuật ngữ kinh tế & pháp lý — kinh tế vĩ mô (s29-001..011: GDP, inflation, monetary vs fiscal policy, supply/demand, elasticity, market structures, CPI VN, labor market, exchange rate regimes, lãi suất danh nghĩa/thực/lãi kép, balance of payments), kinh tế vi mô & hành vi (s29-012..015, 027, 035, 038, 039, 049: game theory, behavioral biases, public goods/externalities, classification hàng theo thu nhập, tax progressivity, diversification, doanh thu/lợi nhuận/dòng tiền, time value of money, comparative advantage), pháp lý chung (s29-016..018, 021, 022, 030, 031, 044, 050: common law vs civil law, nguồn luật VN, jurisdiction, civil vs criminal, thời hiệu, burden of proof, constitutional rights, habeas corpus, equity vs law), hợp đồng/lao động/sở hữu trí tuệ (s29-019, 020, 023, 024, 025, 029, 048: hợp đồng VN, force majeure, tort law, IP four pillars, business entities, hợp đồng lao động VN, negotiable instruments), tài chính/kinh doanh & quy định (s29-026, 028, 032..034, 036, 037, 040..043, 045..047: thuế VN, antitrust, bonds, cổ phiếu, financial ratios, insurance, bankruptcy US, ESG, AML/KYC, GDPR, lãi suất NHTW, treaties, government bonds VN, criminal severity classes)
- **Ngôn ngữ**: ~58% Vi, ~32% En (s29-002, 004, 006, 009, 012, 013, 014, 018, 023, 025, 027, 028, 030, 032, 034, 036, 037, 040, 042, 044, 045, 048, 050), ~10% mix
- **Leaves/note**: 3–4 (reference — mix definition + fact + example/note; fact KHÔNG có ordinal vì reference)
- **Format note**: heading + danh sách + 1 blockquote tip; nhiều leaf chứa LaTeX `$...$` cho công thức kinh tế (elasticity, lãi kép, Fisher, PV/FV, Sharpe ratio)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.865**
- **File**: `backend/data/raw_leaves.jsonl` lines 1401–1450

### Session 28 — 2026-05-18

- **Doc type**: reference
- **Topic**: thuật ngữ y học & sức khoẻ — vital signs & chỉ số cơ bản (s28-001..010: vital signs, BMI, hypertension, diabetes, lipid panel, CBC, LFT, kidney function, electrolytes/anion gap, CRP/ESR), thuốc & điều trị (s28-011..016, 022, 037, 043: nhóm giảm đau, antibiotic classes, tim mạch, insulin, vitamin ADEK/B12, macronutrient, drug interactions, DOACs vs warfarin, antihypertensive first-line), bệnh lý & lâm sàng (s28-017..020, 029, 033, 042, 044, 045: stroke, COPD vs asthma, TNM, pregnancy/APGAR, burns rule of 9, ABO/Rh, CKD staging, GI symptoms, common pathogens), cấp cứu & đánh giá (s28-030, 035, 039, 046, 049, 050: CPR/BLS, GCS, anaphylaxis, đường tiêm IV/IM/SC/IO, pain scales, glucose thresholds & rule of 15), khác (s28-021, 023..028, 031..032, 034, 036, 038, 040, 041, 047, 048: vaccine EPI, mental health, sàng lọc ung thư, target HR, ECG, sleep stages, thyroid, hydration, milestones nhi, cytokines, body fat %, liều mg/kg, imaging, preventive screening adult, contraception)
- **Ngôn ngữ**: ~58% Vi, ~32% En (s28-002, 005, 009, 012, 014, 016, 020, 022, 024, 027, 028, 030, 032, 034, 036, 038, 039, 041, 042, 044, 045, 047, 049), ~10% mix
- **Leaves/note**: 3–4 (reference — mix definition + fact + occasional example/note; fact KHÔNG có ordinal vì reference)
- **Format note**: heading + danh sách + 1 blockquote tip; nhiều leaf chứa LaTeX `$...$` (BMI, anion gap, eGFR, QTc, HRmax, BMR, liều mg/kg) cho công thức y học
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.865**
- **File**: `backend/data/raw_leaves.jsonl` lines 1351–1400

### Session 31 — 2026-05-18

- **Doc type**: reference
- **Topic**: danh sách — sách (s31-001..017: programming kinh điển, productivity, triết học, kinh tế phổ thông, tiểu thuyết Việt Nam, modern English fiction, lịch sử Việt Nam, popular science, biography/memoir, self-help, startup, UX/UI, viết lách, tài chính cá nhân, AI cho người không chuyên, thơ Việt, dạy con), tool (s31-018..034: dev terminal CLI, productivity stack, design tool, code editor, note-taking, research, video editing, audio podcast, communication team, finance, DevOps startup, AI 2025, browser extension, backup, mobile digital wellness, writing tools, self-hosted privacy), resource học (s31-035..050: MOOC, YouTube channels, podcast lập trình, blog RSS, newsletter, Vietnam dev community, English, ML, design UI/UX, product management, data science, finance investing, writing, foreign language, career change tech, freelance solopreneur)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s31-002, 006, 014, 015, 016, 019, 020, 022, 024, 027, 029, 030, 036, 037, 038, 039, 041, 042, 044, 047), ~10% mix (s31-009, 023, 025, 034, 046, 050)
- **Leaves/note**: 3 (reference — mix definition + fact + note; fact KHÔNG có ordinal vì reference)
- **Format note**: heading + danh sách + 1 blockquote tip; vài leaf code (s31-018 CLI replacement) có `metadata.format: "code"`
- **Validate**: 50/50 OK, 0 hard errors, 2 soft warnings (s31-002/019 low_coverage gần ngưỡng — note có 5-6 mục danh sách dày), 96% pass ≥0.75, avg score **0.803**
- **File**: `backend/data/raw_leaves.jsonl` lines 1501–1550

### Session 30 — 2026-05-18

- **Doc type**: reference
- **Topic**: thuật ngữ tâm lý & giáo dục — phát triển & lâm sàng (s30-001..011: Erikson 8 stages, Piaget cognitive stages, attachment theory Bowlby/Ainsworth, MDD DSM-5, anxiety disorders, PTSD, CBT, REBT, psychodynamic vs humanistic, working memory Baddeley, long-term memory taxonomy), nhận thức & xã hội (s30-012..025: Bloom revised, growth mindset Dweck, self-efficacy Bandura, attribution Weiner, Asch conformity, bystander effect, cognitive dissonance, Cialdini influence, Big Five OCEAN, locus of control Rotter, Theory of Mind, operant conditioning Skinner, classical conditioning Pavlov, cognitive biases), đánh giá & đo lường (s30-026..031: Wechsler IQ, Cronbach alpha, reliability vs validity, z-score & normal distribution, MMPI vs MBTI, Cohen's d effect size), giáo dục phương pháp (s30-032..042: ZPD Vygotsky, constructivism, Montessori, flipped classroom, Socratic method, PBL, inquiry vs direct instruction, differentiated instruction Tomlinson, formative vs summative, rubric, multiple intelligences Gardner), giáo dục thực hành (s30-043..050: SMART goals, spaced repetition Ebbinghaus, Pomodoro, active recall, Feynman technique, metacognition Flavell, IEP/504 plan, UDL)
- **Ngôn ngữ**: ~60% Vi, ~32% En (s30-002, 004, 005, 006, 010, 012, 019, 022, 024, 035..050 mostly Vi với nhiều term tiếng Anh), ~8% mix
- **Leaves/note**: 3 (reference — mix definition + fact + occasional example/note; fact KHÔNG có ordinal vì reference)
- **Format note**: heading + danh sách + 1 blockquote tip; nhiều leaf chứa LaTeX `$...$`/`$$...$$` cho công thức (Cronbach α, z-score, Cohen's d, Ebbinghaus forgetting curve)
- **Validate**: 50/50 OK, 0 hard errors, 5 soft warnings (s30-002/004/006/012/022 low_coverage gần ngưỡng — note dense bullet-list nhiều ý), 90% pass ≥0.75, avg score **0.816**
- **File**: `backend/data/raw_leaves.jsonl` lines 1451–1500

### Session 16 — 2026-05-17

- **Doc type**: procedure
- **Topic**: DIY & craft — origami (s16-001..017: hạc, jumping frog, hoa sen, lucky star, trái tim, butterfly, fox, kabuto samurai, sonobe modular, thuyền giấy, dart plane, tulip có cuống, dog face, koi fish, waterbomb, ếch búng post-it, kusudama cherry blossom), vẽ tranh & nghệ thuật (s16-018..034: quả cầu grayscale chì, watercolor wet-on-wet sky, acrylic núi tuyết, gouache chân dung chibi-character, charcoal gesture, thư pháp Việt chữ Tâm, manga chibi, one-point perspective phòng, chân dung Loomis, plein-air oil, mandala, Procreate digital, sumi-e tre, soft pastel hoàng hôn, ink wash núi, gel pen trên giấy đen, travel sketch), sửa đồ gia dụng (s16-035..050: vòi nước rò rỉ, shower head tắc, toilet flush yếu, LED ceiling panel, thông tắc bồn baking soda, ghế gỗ lung lay, dán bàn nứt, sửa zip kẹt, vá jean invisible, bản lề kẽo kẹt, pin remote CR2032, máy giặt cửa trước hôi, kệ tường nhẹ, touch-up tường sơn, gioăng tủ lạnh, nồi cơm không nóng)
- **Ngôn ngữ**: ~60% Vi, ~30% En (s16-002, 006, 009, 014, 019, 027, 036, 038), ~10% mix
- **Leaves/note**: 7–8 (procedure step-heavy + intro definition + outro note)
- **Validate**: 50/50 OK, 0 hard errors, 0 soft warnings, 100% pass ≥0.75, avg score **0.912**
- **File**: `backend/data/raw_leaves.jsonl` lines 751–800

---

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
