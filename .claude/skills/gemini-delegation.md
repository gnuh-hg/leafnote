# Kỹ năng giao việc cho Gemini (Gemini Delegation Skill)

> Hướng dẫn Claude (Manager) cách điều phối công việc qua Gemini CLI Orchestrator → Gemini Workers để tiết kiệm token cho các task nặng.

---

## Kiến trúc 3 tầng

```
Claude (Manager)
  └─► Gemini CLI (Orchestrator)  — phân tích, chọn worker, review output
        └─► Gemini Worker        — thực thi code/doc/refactor
```

Claude **không** gọi worker trực tiếp. Claude gửi directive cho Gemini CLI, Gemini CLI sẽ chọn worker phù hợp và đóng gói context.

---

## 1. Khi nào delegate?

**100-Token Rule**: Delegate bất kỳ task nào thỏa 1 trong 2 điều kiện:
- Sinh ra > 100 dòng code, hoặc
- Cần đọc > 5 file cùng lúc

Các loại task phù hợp:
- **Task khối lượng lớn**: đọc toàn codebase, phân tích log dài.
- **Task lặp lại**: viết boilerplate nhiều file, chuyển đổi định dạng quy mô lớn.
- **Task nghiên cứu rộng**: tìm pattern/inconsistency trên toàn project.

---

## 2. Workers hiện có

| Worker | Chuyên môn | Khi nào dùng |
|---|---|---|
| `frontend-worker` | React, TypeScript, Tailwind, i18n | Build component, styling, hook, service wrappers |
| `backend-worker` | FastAPI, Python, SQLAlchemy, Alembic | Endpoint, service layer, migration, model |
| `refactor-worker` | DRY, SOLID, tối ưu | Cleanup debt, đổi tên, extract module |
| `doc-worker` | Markdown, architecture mapping | Cập nhật docs sau khi code thay đổi |
| `test-worker` | pytest, Vitest, Playwright | Viết unit/integration/E2E tests |

---

## 3. Cách soạn directive gửi Gemini CLI

### A. Thiết lập vai trò worker cần dùng

Chỉ định rõ worker target trong directive:
> "Delegate task này cho `@frontend-worker`. Context: [...]"

Không cần thiết lập persona thêm — worker đã có system prompt riêng.

### B. Bắt buộc Chain of Thought

Thêm vào directive:
> "TRƯỚC KHI thực hiện, viết vào thẻ `<thinking>`:
> 1. Tóm tắt yêu cầu và ràng buộc kỹ thuật.
> 2. Liệt kê file liên quan và blast radius.
> 3. Đề xuất giải pháp từng bước."

### C. Chống lười biếng

> "KHÔNG tóm tắt hay dùng `// ... unchanged`. Viết lại toàn bộ nội dung file."

### D. Đính kèm context đầy đủ

Gửi kèm trong directive:
- Nội dung các file liên quan (full content, không tóm tắt).
- `GEMINI.md` nếu worker cần hiểu conventions của project.
- Báo cáo GitNexus nếu có impact analysis.

---

## 4. Response format cần expect

Gemini CLI trả về theo chuẩn định nghĩa trong `.gemini/response-format.md`:

```
## Summary
[1-2 câu tóm tắt]

## Files Changed
- `path/to/file` — [lý do]

## Code
[full file content trong code blocks]

## Notes
[caveat, assumption, điểm cần Claude review]
```

---

## 5. Quy trình kiểm soát chất lượng (QC)

Sau khi Gemini CLI phản hồi, Claude kiểm tra:

| Worker | Điểm cần kiểm tra |
|---|---|
| `frontend-worker` | Design tokens đúng không? i18n key có trong cả vi.json + en.json? Không fetch trực tiếp trong component? |
| `backend-worker` | Logic có nằm trong services/ không? Env var qua config.py? Type hints đầy đủ? |
| `refactor-worker` | Có phá vỡ interface nào không? Tests còn pass? |
| `doc-worker` | Docs có sync với code thực tế không? |
| `test-worker` | Test có cover đủ edge case? Mock có phản ánh đúng behavior thật? |

Nếu thiếu sót: *"Bạn đã bỏ sót [X], hãy hoàn thiện với độ chi tiết cao nhất."*

---

## 6. Cách gọi Gemini từ Bash

**Template chuẩn với retry + auto key rotation** — tự thử tất cả key trước khi từ bỏ:

```bash
cd /c/Users/admin/all/project/leafnote
TOTAL_KEYS=$(grep -c "^GEMINI_KEY_" .env.workers)
success=false
for attempt in $(seq 1 $TOTAL_KEYS); do
  ACTIVE_KEY=$(grep "ACTIVE_WORKER_KEY=" .env.workers | cut -d'=' -f2 | tr -d ' \r')
  GEMINI_API_KEY=$(grep "GEMINI_KEY_${ACTIVE_KEY}=" .env.workers | cut -d'=' -f2 | awk '{print $1}')
  OUTPUT=$(GEMINI_API_KEY="$GEMINI_API_KEY" gemini -p "@worker-name <directive>" 2>&1)
  if echo "$OUTPUT" | grep -qiE "429|Too Many Requests|RESOURCE_EXHAUSTED|quota exceeded"; then
    echo "⚠️  Key $ACTIVE_KEY rate limited (attempt $attempt/$TOTAL_KEYS). Rotating..."
    node tools/scripts/rotate-workers.js --next
    continue
  fi
  echo "$OUTPUT"
  success=true
  break
done
[ "$success" != "true" ] && echo "❌ Tất cả key đều bị rate limit."
```

Directive dài (fullstack task) → dùng heredoc thay `<directive>` bằng `"$(cat <<'EOF' ... EOF)"`:

```bash
cd /c/Users/admin/all/project/leafnote
TOTAL_KEYS=$(grep -c "^GEMINI_KEY_" .env.workers)
success=false
for attempt in $(seq 1 $TOTAL_KEYS); do
  ACTIVE_KEY=$(grep "ACTIVE_WORKER_KEY=" .env.workers | cut -d'=' -f2 | tr -d ' \r')
  GEMINI_API_KEY=$(grep "GEMINI_KEY_${ACTIVE_KEY}=" .env.workers | cut -d'=' -f2 | awk '{print $1}')
  OUTPUT=$(GEMINI_API_KEY="$GEMINI_API_KEY" gemini -p "$(cat <<'EOF'
Act as @frontend-worker.
## Context
[full file content]
## Task
[mô tả chi tiết]
EOF
)" 2>&1)
  if echo "$OUTPUT" | grep -qiE "429|Too Many Requests|RESOURCE_EXHAUSTED|quota exceeded"; then
    echo "⚠️  Key $ACTIVE_KEY rate limited (attempt $attempt/$TOTAL_KEYS). Rotating..."
    node tools/scripts/rotate-workers.js --next
    continue
  fi
  echo "$OUTPUT"
  success=true
  break
done
[ "$success" != "true" ] && echo "❌ Tất cả key đều bị rate limit."
```

---

## 7. Xử lý lỗi quota

Rotate key thủ công (dùng khi cần):
```
node tools/scripts/rotate-workers.js --next     # sang key tiếp theo
node tools/scripts/rotate-workers.js --set 2    # đặt key cụ thể
node tools/scripts/rotate-workers.js --current  # xem key đang dùng
```

**Nếu tất cả key đều bị rate limit:** báo user — KHÔNG tự làm task thay Gemini.
