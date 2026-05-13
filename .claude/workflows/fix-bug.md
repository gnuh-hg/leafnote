# Workflow: Fix Bug

> Quy trình debug có hệ thống cho Leafnote. Chạy từ đầu đến cuối — không đoán, không skip bước.

---

## Bước 0 — Đọc context trước

1. `.claude/memory/mistakes.md` — bug này đã từng xảy ra chưa? Có entry tương tự không?
2. `.claude/memory/context.md` — pattern đang dùng, quyết định đã chốt
3. `.claude/skills/debug/SKILL.md` — debug React + FastAPI chi tiết

---

## Bước 1 — Reproduce (Tái hiện lỗi)

**Không sửa trước khi reproduce được.**

### Frontend (React)
```powershell
cd frontend && npm run dev   # http://localhost:5173
```
- Browser DevTools → **Console tab**: xem error message + stack trace
- **Network tab**: xem API call nào fail (status code, request payload, response body)
- React DevTools → component tree, kiểm tra props/state

### Backend (FastAPI)
```powershell
cd backend && uvicorn app.main:app --reload   # http://localhost:8000
```
- Xem terminal output — uvicorn log error trực tiếp
- Mở `/docs` Swagger UI → test endpoint với input gây lỗi
- Thêm `print()` tạm trong service để trace data flow

### GitNexus
```
gitnexus_query({query: "symptom description"})   # tìm execution flow liên quan
gitnexus_context({name: "functionName"})          # xem callers + callees
```

---

## Bước 2 — Isolate (Khoanh vùng)

Xác định lỗi ở tầng nào:

```
Lỗi hiện trên UI?
  ├─ Network request fail → bug ở backend hoặc API contract
  │   ├─ 401 Unauthorized     → auth issue → kiểm tra get_current_user dependency
  │   ├─ 422 Unprocessable    → validation fail → kiểm tra Pydantic schema vs payload
  │   ├─ 500 Server Error     → server crash → xem uvicorn logs, kiểm tra service layer
  │   └─ Network Error / CORS → backend không chạy hoặc CORS config sai
  └─ Request OK (2xx) nhưng UI sai → bug ở frontend
      ├─ Data đúng nhưng render sai → bug ở component / template logic
      ├─ Data sai / thiếu       → bug ở service call hoặc TanStack Query hook
      └─ State không update     → thiếu invalidateQueries() hoặc Zustand mutation
```

---

## Bước 3 — Root Cause Analysis

**Trước khi sửa bất kỳ symbol nào:**
```
gitnexus_impact({target: "symbolName", direction: "upstream"})
```
Nếu kết quả trả về **HIGH** hoặc **CRITICAL** → cảnh báo user trước khi tiến hành.

### Common root causes trong Leafnote

| Triệu chứng | Nguyên nhân hay gặp |
|---|---|
| UI không update sau mutation | Thiếu `queryClient.invalidateQueries()` trong onSuccess |
| 401 trên mọi request | Token expired hoặc thiếu `Depends(get_current_user)` trên route |
| 422 Unprocessable Entity | Type mismatch giữa frontend payload và Pydantic schema |
| Component re-render vô hạn | Object/array literal trong `useEffect` deps array |
| i18n hiện key thay vì text | Key trong JSX không khớp key trong `vi.json`/`en.json` |
| Mock data hiện thay vì API | Quên replace mock import bằng service call thật |
| CORS error (localhost) | Thiếu origin trong FastAPI CORS `allow_origins` |
| Session mất sau refresh | `supabase.auth.getSession()` chưa được gọi khi mount |
| Empty state không hiện | Điều kiện check chỉ có 1 trong 2 case (main empty vs filter empty) |

---

## Bước 4 — Fix

### Ngưỡng 100-Token Rule
- Fix đơn giản (1 file, < 50 dòng): tự sửa
- Fix phức tạp (nhiều file, cần trace nhiều layer): delegate `@debug-worker` qua Gemini

### Quy tắc sửa
- Sửa đúng tầng — không patch UI để che lỗi backend
- Không remove error handling — fix root cause
- Không dùng `any` trong TypeScript chỉ để qua lỗi type
- Không dùng `# type: ignore` trong Python chỉ để qua mypy

### Agent phù hợp để review sau khi sửa

| Loại bug | Agent |
|---|---|
| Bug frontend (React/TS) | `@typescript-reviewer` |
| Bug backend (FastAPI/Python) | `@python-reviewer` |
| Bug security (JWT, auth, input) | `@security-reviewer` |
| Bug performance (render, query) | `@optimizer` |

---

## Bước 5 — Verify

### Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
# Test endpoint tại /docs với case đã fail trước đó → phải 200
```

### Frontend
```powershell
cd frontend && npm run dev
# Reproduce original bug → confirm đã fix
# Test edge case liên quan (empty input, invalid data, offline...)
```

### Type check
```powershell
cd frontend && npx tsc --noEmit
# Phải: 0 error
```

---

## Bước 6 — Document

### Ghi vào `.claude/memory/mistakes.md`
```markdown
**[YYYY-MM-DD] — [Tên lỗi ngắn gọn]**
- **Triệu chứng**: [user thấy gì]
- **Root cause**: [tại sao xảy ra]
- **Fix**: [đã sửa thế nào]
- **Phòng tránh**: [lần sau làm thế nào để không lặp lại]
```

### Commit message convention
```
fix(<domain>): <mô tả ngắn gọn>

# Ví dụ:
fix(auth): handle expired Supabase JWT on page refresh
fix(notes): invalidate query cache after note deletion
fix(ui): missing i18n key for filter empty state
fix(api): add missing auth dependency on PATCH /notes/:id
```

---

## Bước 7 — Post-task checklist

Chạy checklist từ `.claude/workflows/master.md` Bước 3.

Đặc biệt cho bug fix:
- `mistakes.md` — đã ghi entry chưa?
- `patterns.md` — nếu fix dẫn đến pattern mới, ghi lại
- Nếu fix thay đổi API contract → cập nhật `information/api-spec.md`
- Nếu fix thay đổi DB query → cập nhật `information/database-schema.md`
