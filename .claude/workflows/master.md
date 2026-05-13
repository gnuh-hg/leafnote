# Master Workflow — Leafnote

> Điểm vào duy nhất cho mọi task. Đọc file này TRƯỚC TIÊN — nó route bạn đến đúng workflow, skill, hoặc agent.

---

## BƯỚC 0 — LUÔN ĐỌC TRƯỚC (mọi task)

Đọc theo thứ tự này, không bỏ qua:

1. `CLAUDE.md` — phase hiện tại, trạng thái file, quy tắc code
2. `.claude/memory/context.md` — quyết định đã chốt, pattern đang dùng
3. `.claude/memory/mistakes.md` — lỗi đã từng xảy ra, cần tránh
4. `.claude/memory/patterns.md` — pattern tái sử dụng đã được thực chiến

**Không đọc = không bắt đầu.**

### GitNexus — kiểm tra index trước khi làm

Nếu task liên quan đến code (feature/bug/refactor): kiểm tra index có fresh không qua `gitnexus://repo/leafnote/context`. Nếu index stale hoặc sau khi có thay đổi lớn:

```bash
npx gitnexus analyze --skip-git
```

> `--skip-git` bỏ qua phân tích git history — nhanh hơn ~3x, đủ dùng cho mid-session re-index. Chỉ chạy full `npx gitnexus analyze` khi cần blame/author context.

---

## BƯỚC 1 — XÁC ĐỊNH LOẠI TASK

Đọc yêu cầu của user → chọn nhãn → đi đến bước tương ứng:

| Nhãn | Khi nào dùng | Route |
|---|---|---|
| `feature` | Thêm tính năng mới (component, endpoint, service) | → Bước 2A |
| `bug` | Sửa lỗi đang xảy ra | → Bước 2B |
| `refactor` | Tái cấu trúc code không thêm tính năng | → Bước 2C |
| `docs` | Viết hoặc cập nhật tài liệu `.md` | → Bước 2D |
| `review` | Review code trước commit | → Bước 2E |
| `ship` | Deploy lên production | → Bước 2F |

---

## BƯỚC 2A — Feature Task

→ Đọc `.claude/workflows/build-feature.md` và làm theo từng bước

### GitNexus — trước khi viết code:
```
gitnexus_query({query: "tên tính năng hoặc domain liên quan"})
```
→ Hiểu entry point và luồng thực thi liên quan. Sau đó, **trước khi sửa bất kỳ symbol nào**:
```
gitnexus_impact({target: "symbolName", direction: "upstream"})
```
Nếu risk HIGH hoặc CRITICAL → báo user trước khi tiến hành.

### Context bắt buộc đọc trước khi viết code:
| Task có... | Đọc thêm |
|---|---|
| UI | `information/design-system.md` + `information/product-principles.md` |
| API endpoint | `information/api-spec.md` |
| DB model/migration | `information/database-schema.md` |
| Tính năng mới chưa rõ scope | `information/features.md` + `information/user-stories.md` |

### Code rules khi làm (xem chi tiết `.claude/workflows/pre-flight.md` Bước 2):
- Business logic **luôn** trong `services/` — không viết trong `routes/` hay component
- API call **luôn** qua `services/` — không `fetch()` trong component
- String user-facing **luôn** qua `t()` — thêm key vào cả `vi.json` và `en.json` ngay lúc viết
- Design token từ `design-system.md` — không hardcode hex, không `bg-white`/`bg-gray-*`
- Empty state: 2 case (main empty + filter empty)
- Filter state dùng `useSearchParams`, không `useState`

---

## BƯỚC 2B — Bug Task

→ Đọc `.claude/workflows/fix-bug.md` và làm theo đầy đủ

### GitNexus — trace bug trước khi sửa:
```
gitnexus_query({query: "mô tả lỗi hoặc tên function bị lỗi"})
gitnexus_context({name: "symbolBịLỗi"})   # callers + callees + execution flows
gitnexus_impact({target: "symbolBịLỗi", direction: "upstream"})
```
→ Biết root cause nằm ở đâu và fix sẽ ảnh hưởng gì trước khi đụng vào code.

### Agent phù hợp để gọi:
| Loại bug | Agent |
|---|---|
| Bug frontend (React/TS) | `@typescript-reviewer` |
| Bug backend (FastAPI/Python) | `@python-reviewer` |
| Bug security | `@security-reviewer` |
| Bug performance | `@optimizer` |

---

## BƯỚC 2C — Refactor Task

### Trước khi bắt đầu (BẮT BUỘC):
```
gitnexus_impact({target: "symbolName", direction: "upstream"})
```
Nếu risk HIGH hoặc CRITICAL → cảnh báo user, hỏi trước khi tiến hành.

### Scope nhỏ (1-2 file, rename/extract đơn giản):
→ Tự làm. Dùng `gitnexus_rename` thay find-and-replace.

### Scope lớn (nhiều file, thay đổi interface):
→ Gọi agent `@coder` hoặc làm trực tiếp với plan chi tiết

### Verify sau refactor:
- `@architect` — kiểm tra layer separation sau khi xong
- `@reviewer` — review kết quả tổng thể
- `npx tsc --noEmit` — 0 error

---

## BƯỚC 2D — Docs Task

### Scope nhỏ (update 1 file, thêm section):
→ Tự làm. Theo convention trong `.claude/skills/doc-writing/SKILL.md`

### Scope lớn (viết lại nhiều file, tạo tài liệu mới):
→ Tự làm với Plan mode hoặc gọi agent `@coder`

### Quy tắc bắt buộc:
- Mọi file `.md` tạo mới: dòng đầu sau `#` phải là `> [mô tả ngắn một câu]`
- Sau khi tạo file → cập nhật bảng "Trạng thái file" trong `CLAUDE.md` ngay

---

## BƯỚC 2E — Review Task

Chọn agent theo loại code cần review:

| Code cần review | Agent |
|---|---|
| TypeScript / React / hooks / i18n | `@typescript-reviewer` |
| Python / FastAPI / SQLAlchemy | `@python-reviewer` |
| Security (JWT, CORS, secrets, input) | `@security-reviewer` |
| Performance (re-render, query, bundle) | `@optimizer` |
| Architecture (layer separation, state) | `@architect` |
| General (conventions, correctness) | `@reviewer` |

### Workflow review trước commit:
1. `rtk git diff --staged` — xem những gì sẽ commit
2. Gọi agent review phù hợp
3. Fix tất cả CRITICAL và HIGH trước khi commit
4. `gitnexus_detect_changes()` — verify scope thay đổi đúng dự kiến

---

## BƯỚC 2F — Ship Task

→ Đọc `.claude/workflows/ship-product.md` và làm theo đầy đủ

---

## BƯỚC 3 — POST-TASK CHECKLIST (mọi task)

Sau khi hoàn thành, check từng dòng trong bảng này:

### GitNexus — bắt buộc trước khi commit

```
gitnexus_detect_changes()
```
Verify: scope thay đổi đúng dự kiến, không có symbol ngoài ý muốn bị ảnh hưởng. Nếu có unexpected change → investigate trước khi commit.

### Bảng trigger → update

| Nếu đã làm gì | Thì cập nhật file nào |
|---|---|
| **Tạo file mới** (bất kỳ loại) | `CLAUDE.md` → bảng "Trạng thái file" |
| **Tạo file trong `backend/` hoặc `frontend/`** | `information/project-structure.md` → cây thư mục |
| **Xóa file** | `CLAUDE.md` (xóa hàng) + `information/project-structure.md` |
| **Đổi tên file/folder** | `CLAUDE.md` + `information/project-structure.md` + mọi import/reference |
| **Thêm thư mục domain mới** | `information/project-structure.md` + `information/architecture.md` |
| **Thêm dependency lớn** (npm/pip) | `information/architecture.md` — tech stack section |
| **Thêm/sửa API endpoint** | `information/api-spec.md` |
| **Thêm/sửa bảng hoặc column DB** | `information/database-schema.md` |
| **Thêm migration Alembic** | `information/database-schema.md` (ghi tên migration) |
| **Thay đổi design token hoặc pattern UI** | `information/design-system.md` |
| **Thêm i18n key** | Kiểm tra cả `vi.json` **và** `en.json` đều có key |
| **Chốt quyết định lớn** (tech/pattern/schema) | `.claude/memory/context.md` |
| **Phát hiện lỗi cần tránh lần sau** | `.claude/memory/mistakes.md` |
| **Rút ra pattern tái sử dụng** | `.claude/memory/patterns.md` |
| **Tạo/sửa workflow, agent, hoặc skill** | `CLAUDE.md` → bảng "Trạng thái file" |
| **Tick xong gate condition** | `ROADMAP.md` → tick checkbox `[x]` |
| **Hoàn thành task lớn / phase** | `HISTORY.md` → thêm entry mới (xem format bên dưới) |

### Khi nào ghi HISTORY.md

**Ghi khi:**
- Hoàn thành implementation của 1 plan đã được approve
- Hoàn thành 1 phase hoặc milestone
- Hoàn thành 1 tính năng có cả frontend + backend
- Refactor/migration quy mô lớn (> 5 file)
- Tích hợp tool/service mới vào project

**KHÔNG ghi:** fix bug nhỏ (< 3 file), update doc đơn lẻ, thêm i18n key, fix typo.

**Format bắt buộc:**
```markdown
## YYYY-MM-DD — [Tên task ngắn gọn]

**Mục tiêu**: [1-2 câu mô tả mục đích và kết quả]

**Đã làm**:
- [Bullet theo domain, đủ để reconstruct context]

**Files đã can thiệp**:
- `path/file` — tạo mới / sửa (mô tả cụ thể) / xóa
```

### Xử lý công việc còn dang dở

| Tình huống | Nơi ghi |
|---|---|
| Feature làm dở, cần tiếp tục sau | `ROADMAP.md` → unchecked item dưới phase đang làm |
| Bug fix là workaround tạm thời | `mistakes.md` → "Phòng tránh: cần fix root cause tại [file:line]" |
| Quyết định kỹ thuật còn pending | `context.md` → `**Pending**: [lý do, điều kiện để chốt]` |
| Tech debt phát hiện ngoài scope | `context.md` → mục "Tech Debt" kèm file/symbol |
| Plan xong một phần | `HISTORY.md` → `**WIP**: đến đây [ngày], còn lại [X]` + `ROADMAP.md` unchecked item |

### Quick mental checklist
```
□ gitnexus_detect_changes() — scope thay đổi đúng dự kiến?
□ CLAUDE.md             — bảng trạng thái file cập nhật?
□ project-structure.md  — cây thư mục phản ánh thay đổi?
□ api-spec.md           — endpoint mới ghi chưa?
□ db-schema.md          — bảng/column mới ghi chưa?
□ context.md            — quyết định lớn ghi chưa?
□ mistakes.md           — lỗi gặp phải ghi chưa?
□ patterns.md           — pattern rút ra ghi chưa?
□ HISTORY.md            — task lớn có entry chưa?
□ ROADMAP.md            — gate đã tick chưa?
□ vi.json + en.json     — i18n đồng bộ cả hai file?
```

**Không cập nhật tài liệu = task chưa xong.**

---

## APPENDIX — Bản đồ toàn hệ thống

### Skills (đọc trước khi làm task liên quan)

| Skill | Khi nào dùng |
|---|---|
| `task-planner` | Phân tích scope + chọn worker trước khi delegate |
| `gemini-delegation` | Cách soạn directive + QC output Gemini |
| `browser-qa` | Test UI trên browser sau khi thay đổi frontend |
| `backend-patterns` | FastAPI + SQLAlchemy async patterns |
| `debug` | Debug React + FastAPI chi tiết (console, network, logs) |
| `generate-code` | Convention đặt tên, layer separation, i18n |
| `optimize` | Performance checklist (React, TanStack Query, SQLAlchemy) |
| `react-hooks` | Custom hook patterns |
| `doc-writing` | Convention viết file `.md` |
| `feature-ideation` | Scope tính năng vs product principles + phase constraints |
| `validation` | Pydantic v2 backend + form validation frontend |

### Agents (sub-agents có tools riêng, gọi theo tên)

| Agent | Chuyên môn |
|---|---|
| `@architect` | Kiểm tra layer separation, state management tree |
| `@coder` | Feature implementation end-to-end |
| `@reviewer` | General review: security + conventions |
| `@optimizer` | Performance: React re-render, FastAPI query, bundle size |
| `@typescript-reviewer` | TypeScript/React: type safety, hooks, i18n compliance |
| `@python-reviewer` | FastAPI/Python: service layer, async, SQLAlchemy |
| `@security-reviewer` | Supabase JWT, OWASP, secrets exposure |
| `@tdd-guide` | TDD workflow: Vitest + pytest |

### Sub-workflows (đọc khi route đến)

| Workflow | Mô tả |
|---|---|
| `build-feature.md` | 10 bước build feature fullstack từ đầu |
| `fix-bug.md` | Debug có hệ thống: reproduce → root cause → fix → document |
| `ship-product.md` | Checklist deploy: gate → quality → security → QA → deploy |
| `pre-flight.md` | Code rules chi tiết (Bước 2) — reference khi cần nhắc lại quy tắc |
