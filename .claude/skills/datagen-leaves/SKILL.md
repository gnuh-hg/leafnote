# Skill: datagen-leaves

> Claude dùng skill này khi user gõ `/datagen-leaves`. Claude tự đếm session hiện tại, chọn doc_type + topic, sinh 50 examples JSONL, tự validate, rồi hướng dẫn user append vào file.

---

## Bước 1 — Xác định session hiện tại

Đếm số dòng trong `backend/data/raw_leaves.jsonl` (nếu file chưa tồn tại thì session = 1):

```powershell
(Get-Content backend/data/raw_leaves.jsonl -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
```

`session_number = floor(line_count / 50) + 1`

Nếu session > 40: thông báo "Đã đủ 40 session (2000 examples). Chuyển sang filter + train."

---

## Bước 2 — Chọn doc_type và topic

Tra bảng rotation theo `session_number`:

| Sessions | Doc type | Topic |
|---|---|---|
| 1 | theory | lập trình: Python, JS, TypeScript, thuật toán cơ bản |
| 2 | theory | khoa học tự nhiên: vật lý, hóa học, sinh học |
| 3 | theory | toán học: xác suất, đại số tuyến tính, giải tích |
| 4 | theory | ML/AI: neural network, transformer, embedding, RAG |
| 5 | theory | web/system: HTTP, REST, SQL, OS concepts |
| 6 | theory | kinh tế & tài chính: macro, vi mô, đầu tư cơ bản |
| 7 | theory | tâm lý học & hành vi học |
| 8 | theory | ngôn ngữ học & dịch thuật |
| 9 | procedure | nấu ăn Việt: phở, bún bò, bánh mì, chè |
| 10 | procedure | nấu ăn Á: sushi, kimchi, dim sum |
| 11 | procedure | bánh & dessert: macaron, tiramisu, bánh flan |
| 12 | procedure | tech setup: Docker, Git flow, Linux, PostgreSQL |
| 13 | procedure | dev workflow: CI/CD, code review, deploy |
| 14 | procedure | thể dục & sức khoẻ: gym, yoga, chạy bộ |
| 15 | procedure | đời sống: du lịch packing, chăm sóc cây, dọn dẹp |
| 16 | procedure | DIY & craft: origami, vẽ tranh, sửa đồ gia dụng |
| 17 | narrative | nhật ký học tập: lần đầu học coding, thi cử |
| 18 | narrative | nhật ký làm việc: deadline, meeting, bug khó |
| 19 | narrative | kỷ niệm du lịch: Hà Nội, Đà Nẵng, nước ngoài |
| 20 | narrative | sự kiện gia đình & bạn bè |
| 21 | narrative | hành trình cá nhân: học ngôn ngữ, thay đổi thói quen |
| 22 | narrative | review sách, phim, podcast |
| 23 | narrative | thất bại & bài học rút ra |
| 24 | narrative | mục tiêu năm & nhìn lại |
| 25 | reference | cheatsheet: Git commands, SQL queries |
| 26 | reference | cheatsheet: Regex, HTTP status codes, CLI tools |
| 27 | reference | cheatsheet: Python stdlib, JS built-ins |
| 28 | reference | thuật ngữ y học & sức khoẻ |
| 29 | reference | thuật ngữ kinh tế & pháp lý |
| 30 | reference | thuật ngữ tâm lý & giáo dục |
| 31 | reference | danh sách: sách hay, tool hữu ích, resource học |
| 32 | reference | so sánh công nghệ: React vs Vue, SQL vs NoSQL |
| 33 | meeting | sprint planning & sprint review |
| 34 | meeting | design review & architecture review |
| 35 | meeting | 1-on-1 & performance review |
| 36 | meeting | họp khách hàng & stakeholder update |
| 37 | meeting | retrospective: what went well / what to improve |
| 38 | meeting | incident post-mortem |
| 39 | meeting | brainstorm & ideation session |
| 40 | meeting | onboarding & knowledge transfer |

---

## Bước 3 — Sinh 50 examples

Sinh trực tiếp trong response. Format JSONL — mỗi dòng 1 object:

```
{"id":"sNNN","document_type":"<DOC_TYPE>","note":"...","expected_leaves":[...]}
```

**Prefix id**: `s` + session_number zero-padded + thứ tự (`s01-001` đến `s01-050` cho session 1).

### Quy tắc note

- Viết bằng Markdown: `##` heading, `**bold**`, `_italic_`, danh sách `- / 1.`, `> blockquote`, `` `code inline` ``
- **Không dùng**: fenced code block (``` ``` ```), HTML tags, LaTeX
- Độ dài: 5–15 câu / 80–250 từ
- Ngôn ngữ: 60% tiếng Việt, 30% tiếng Anh, 10% mix Việt-Anh
- Nội dung đa dạng trong topic batch của session

### Quy tắc leaf (bắt buộc)

Mỗi leaf:
- `type` ∈ `{definition, fact, example, question, note}`
- `content`: 15–80 từ (definition ngắn hơn được, miễn không dưới 10 từ)
- Độc lập: đọc leaf không cần context từ leaf khác
- Không trùng nội dung với leaf khác trong cùng note
- Cover hết ý chính của note (không bỏ sót)
- `confidence`: 0.85–0.95 cho ý rõ ràng, 0.65–0.79 cho ý mơ hồ/tranh cãi

Metadata bắt buộc theo type:
- `definition` → `{"term": "...", "meaning": "..."}`
- `fact` trong procedure → `{"ordinal": N}`
- `fact` trong meeting → `{"source": "tên-cuộc-họp"}`
- `example` → `{"polarity": "positive" | "negative"}`
- `question` / `note` → `{}`

### Phân bố trong 50 examples

- 2–8 leaves mỗi note
- Mix đều các `type` leaf trong một batch (không để toàn `fact`)
- Vài examples nên có `confidence` thấp (0.65–0.79) để data realistic
- Session 38–40 (hard cases): thêm notes ngắn (3–5 câu), notes mơ hồ, notes mix 2 chủ đề

---

## Bước 4 — Self-validate trước khi output

Trước khi in JSONL ra, kiểm tra nhanh:

**Loại bỏ example nếu**:
- Note là prose thuần — không có element Markdown nào (không heading, không list, không bold, không blockquote)
- Có leaf nào >100 từ
- Hai leaf liên tiếp nói cùng một điều (paraphrase nhau)
- `expected_leaves` rỗng dù note có nội dung
- Tất cả `confidence` đều là 1.0 — không thực tế
- `definition` thiếu `metadata.term` hoặc `metadata.meaning`
- `fact` trong procedure thiếu `metadata.ordinal`

**Dấu hiệu tốt**:
- Note có ít nhất 1 heading + 1 list hoặc blockquote
- Leaf `definition` có `metadata.meaning` là paraphrase, không copy nguyên câu
- `fact` trong procedure có `ordinal` tăng dần đúng thứ tự
- Leaf cuối không bị cắt ngang

Nếu phát hiện lỗi trong khi sinh: sửa trực tiếp, không giữ example lỗi.

---

## Bước 5 — Hướng dẫn user append

Sau khi in 50 examples, thông báo:

```
Session N hoàn tất — 50 examples (doc_type: <DOC_TYPE>, topic: <TOPIC>).
Tổng cộng sau session này: ~N×50 examples.

Lưu output trên vào file tạm rồi append:
  cat temp.jsonl >> backend/data/raw_leaves.jsonl

Kiểm tra nhanh:
  python -c "import json; errors=[i+1 for i,l in enumerate(open('backend/data/raw_leaves.jsonl').readlines()) if not (lambda: True if json.loads(l) else True)()]; print('OK')"

Phase hiện tại: <PHASE 1/2/3> — còn <N> session nữa đến hết phase.
```

Khi đến phase gate (session 5, 20, 40): nhắc user chạy filter + eval.

---

## Context về Leaf Engine

Leaf Engine phân tách một note thành các "leaf" — đơn vị kiến thức nguyên tử. Mỗi leaf:
- Chứa đúng 1 ý, có thể review độc lập
- Được gắn type phản ánh vai trò nhận thức (definition, fact, example, question, note)
- Được dùng để spaced repetition và surfacing lại đúng lúc

Training data cần phản ánh đúng cách một human expert sẽ tách leaves từ một note thật — không phải tách máy móc theo câu, mà theo ý.
