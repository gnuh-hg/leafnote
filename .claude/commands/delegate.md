# /delegate — Manager Delegation Command

> Slash command để Claude chạy full manager workflow: phân tích task → chọn worker → delegate → review output.

## Cách dùng

```
/delegate <mô tả task>
```

Ví dụ:
- `/delegate build NoteEditor page with auto-save`
- `/delegate add POST /v1/notes endpoint with service layer`
- `/delegate refactor AppState context to use TanStack Query`

---

## Workflow khi chạy `/delegate`

Khi nhận lệnh `/delegate <task>`, Claude thực hiện tuần tự:

### 1. Đọc task-planner
Đọc `.claude/skills/task-planner.md` và áp dụng Bước 1–3:
- Xác định domain và scope
- Kiểm tra 100-Token Rule
- Chọn worker phù hợp
- Soạn directive đầy đủ với context

### 2. Thông báo trước khi gọi
Trước khi chạy Bash, hiển thị cho user:
```
→ Task: [mô tả]
→ Worker: @<tên worker>
→ Ước lượng: ~X dòng code / Y file
→ Delegating...
```

### 3. Gọi Gemini qua Bash (với retry + key rotation)

Dùng template này — tự động thử tối đa 3 key khi gặp rate limit:

```bash
cd /c/Users/admin/all/project/leafnote
TOTAL_KEYS=$(grep -c "^GEMINI_KEY_" .env.workers)
success=false
for attempt in $(seq 1 $TOTAL_KEYS); do
  ACTIVE_KEY=$(grep "ACTIVE_WORKER_KEY=" .env.workers | cut -d'=' -f2 | tr -d ' \r')
  GEMINI_API_KEY=$(grep "GEMINI_KEY_${ACTIVE_KEY}=" .env.workers | cut -d'=' -f2 | awk '{print $1}')
  OUTPUT=$(GEMINI_API_KEY="$GEMINI_API_KEY" gemini -p "<directive>" 2>&1)
  if echo "$OUTPUT" | grep -qiE "429|Too Many Requests|RESOURCE_EXHAUSTED|quota exceeded"; then
    echo "⚠️  Key $ACTIVE_KEY rate limited (attempt $attempt/$TOTAL_KEYS). Rotating..."
    node tools/scripts/rotate-workers.js --next
    continue
  fi
  echo "$OUTPUT"
  success=true
  break
done
if [ "$success" != "true" ]; then
  echo "❌ Tất cả $TOTAL_KEYS key đều bị rate limit. Dừng lại — KHÔNG tự làm."
fi
```

**QUY TẮC BẮT BUỘC:**
- Nếu tất cả key đều fail → báo user "Tất cả Gemini key đang bị rate limit", **KHÔNG tự viết code**.
- KHÔNG fallback sang tự làm task — đây là quy tắc không có ngoại lệ.

### 4. Review và apply
- Đọc output theo chuẩn `.gemini/response-format.md`
- QC theo checklist trong `gemini-delegation.md` mục 5
- Apply code vào file thực tế
- Báo cáo cho user: files đã thay đổi, điểm cần lưu ý

### 5. Nếu task fullstack (backend + frontend)
- Delegate `@backend-worker` trước → apply → verify
- Rồi mới delegate `@frontend-worker` với API spec vừa tạo
