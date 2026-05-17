# Leaf Engine — Interface Contract

> Hợp đồng kỹ thuật giữa backend Leafnote và bất kỳ LLM endpoint nào đóng vai trò Leaf Engine. Backend không hard-code provider — bạn trỏ env `LEAF_ENGINE_URL` vào đâu cũng được, miễn endpoint tuân theo schema dưới đây.

---

## 1. Endpoint shape

OpenAI-compatible **chat completions** API. Backend gửi:

```http
POST {LEAF_ENGINE_URL}
Authorization: Bearer {LEAF_ENGINE_API_KEY}
Content-Type: application/json
```

Body:

```json
{
  "model": "{LEAF_ENGINE_MODEL}",
  "temperature": 0.1,
  "max_tokens": 2000,
  "response_format": {"type": "json_object"},
  "messages": [
    {"role": "system", "content": "<system prompt theo document_type>"},
    {"role": "user",   "content": "## Note\n\n<nội dung note>"}
  ]
}
```

Endpoint trả:

```json
{
  "choices": [
    {"message": {"content": "<JSON array string>"}}
  ]
}
```

`content` là **chuỗi JSON** (không phải object). Backend `json.loads()` chuỗi đó.

> Nếu provider chỉ trả `{"leaves": [...]}` thay vì array thuần, backend tự rút key — tolerant với 4 key: `leaves`, `items`, `data`, `result`.

---

## 2. Output schema (mỗi leaf)

```json
{
  "type": "definition" | "fact" | "example" | "question" | "note",
  "content": "string, 1..2000 chars",
  "metadata": { ... },
  "confidence": 0.0..1.0
}
```

Leaf nào sai schema → **bị drop** (không fail toàn bộ request). Pydantic strict validation ở `app.schemas.leaf.LeafEngineItem`.

### Metadata theo type

| type | metadata bắt buộc | metadata tùy chọn |
|---|---|---|
| `definition` | `term`, `meaning` | — |
| `fact` | — | `ordinal` (procedure), `source` (meeting/quote), `format` (`text`/`code` — bỏ `math` từ 2026-05-17 vì LaTeX detect trực tiếp từ delimiter `$` trong content), `polarity` |
| `example` | `polarity` (`positive`/`negative`) | `parent_leaf_id` |
| `question` | — | — |
| `note` | — | — |

---

## 3. System prompt — code-side là nguồn chân lý

Source: `backend/app/services/leaf_engine.py` — hằng số `_BASE_PROMPT` + `_DOC_TYPE_HINT`.

Khi sinh training data hoặc test endpoint mới, **dùng đúng prompt này** (copy từ file source). Nếu prompt thay đổi, training data cũng phải re-generate.

Tóm tắt:
- Base prompt cố định cho mọi note: rules atomic, taxonomy đóng, granularity 15..80 từ.
- Hint riêng cho mỗi `document_type` (theory/narrative/procedure/reference/meeting). `freeform` short-circuit ở backend, không gọi engine.

---

## 4. Quality gate (chạy ở backend, không phải engine)

Sau khi nhận output từ engine, backend chấm điểm theo `app/services/leaf_quality.py`:

| Metric | Trọng số | Pass khi |
|---|---|---|
| coverage | 0.35 | leaf phủ ≥75% từ trong note |
| atomicity | 0.20 | không leaf nào >80 từ |
| no_duplicate | 0.15 | jaccard giữa các leaf <0.85 |
| type_valid | 0.15 | 100% leaf có type hợp lệ |
| granularity_floor | 0.15 | không leaf nào <15 từ (trừ definition có term) |

Nếu `total < LEAF_QUALITY_MIN_SCORE` (default 0.75):
1. Backend **retry 1 lần** với hint cụ thể về issue (vd "tách nhỏ leaf vượt 80 từ").
2. Nếu lần 2 vẫn fail → backend trả `HTTP 422` + body `{message, quality, raw_leaves}` → frontend hiện thử/giữ nguyên/retry.

Engine **không cần biết về quality gate** — chỉ cần tách tốt nhất có thể.

---

## 5. Granularity rules

- 1 leaf = 1 ý đứng độc lập, hiểu được không cần ngữ cảnh leaf khác.
- 15 ≤ words ≤ 80. Vượt 80 → tách. Dưới 15 → ghép vào leaf khác hoặc bỏ.
- Definition có `term` ngắn được miễn rule sàn.
- LaTeX trong note (`$...$` inline, `$$...$$` block) phải GIỮ NGUYÊN trong `content` của leaf. Mỗi công thức quan trọng nên là 1 leaf riêng kiểu `fact`. Quality filter coi mỗi công thức là 1 token duy nhất khi tính coverage/duplicate. KHÔNG cần gắn `metadata.format: "math"` (đã bỏ rule này 2026-05-17 vì delimiter `$` đủ để downstream nhận diện).

---

## 6. Test fixtures

Bạn dùng để regression mỗi lần đổi model:

- `backend/tests/fixtures/seed_all_doctypes.jsonl` — 10 example đa dạng (theory/narrative/procedure/reference/meeting/freeform), có `expected_leaves` do người verify tay.
- `backend/tests/fixtures/golden_leaves.jsonl` — golden set đầy đủ, **bạn fill** trước khi swap model production.

Chạy regression:
```bash
cd backend
python -m scripts.eval_engine
```
→ in score table + so với baseline. Nếu regression → block deploy.

---

## 7. Versioning prompt

Khi thay đổi `_BASE_PROMPT` hoặc `_DOC_TYPE_HINT`:
1. Tăng `PROMPT_VERSION` (sẽ thêm khi cần — hiện chưa cần version).
2. Re-generate training data.
3. Re-train Qwen.
4. Chạy `eval_engine.py` so với baseline.

---

## 8. Env vars cần set

```bash
LEAF_ENGINE_URL=https://api.together.xyz/v1/chat/completions
LEAF_ENGINE_API_KEY=<provider api key>
LEAF_ENGINE_MODEL=<model name on provider>
LEAF_ENGINE_TIMEOUT_S=60          # default
LEAF_QUALITY_MIN_SCORE=0.75       # default
```

Verify: `python -m scripts.check_env` trong `backend/`.
