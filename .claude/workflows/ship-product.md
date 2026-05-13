# Workflow: Ship Product

> Checklist trước khi deploy lên production. Chạy đầy đủ — không bỏ bước, không giả định "chắc ổn rồi".

---

## Scope của "ship"

| Loại ship | Mô tả |
|---|---|
| **Hotfix** | Push 1 fix khẩn cấp lên production (skip bước QA lớn, nhưng giữ security + type check) |
| **Feature release** | 1 tính năng hoàn chỉnh sẵn sàng deploy |
| **Phase release** | Toàn bộ phase đã đủ gate condition |

---

## Bước 1 — Gate Condition Check

Đọc `ROADMAP.md` → tìm phase/milestone đang ship → xác nhận **tất cả** checkbox `[ ]` đã tick thành `[x]`.

**Không tick đủ gate → không ship.** Ghi lại item nào còn thiếu vào `ROADMAP.md` như unchecked item.

---

## Bước 2 — Code Quality Gate

### 2a. TypeScript
```powershell
cd frontend && npx tsc --noEmit
# Phải: 0 error (bắt buộc)
```

### 2b. Lint
```powershell
cd frontend && npm run lint
# Phải: 0 warnings (0-warnings policy)
```

### 2c. Build thử
```powershell
cd frontend && npm run build
# Phải: build thành công, không có warning về chunk size lớn bất thường
```

### 2d. Backend health
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
# GET http://localhost:8000/health → 200
```

---

## Bước 3 — Security Review

Gọi `@security-reviewer` với diff của branch:

```powershell
rtk git diff main...HEAD
```

Checklist bắt buộc:
- [ ] Không có secret/API key hardcode trong code
- [ ] Tất cả endpoint (trừ `/health`, `/auth/login`, `/auth/register`) có `Depends(get_current_user)`
- [ ] CORS `allow_origins` chỉ chứa origin đã biết (không có `["*"]`)
- [ ] Không có `console.log` chứa data nhạy cảm (token, password, user data)
- [ ] Supabase **service role key** KHÔNG có trong bất kỳ file frontend nào
- [ ] Input user được validate qua Pydantic trước khi vào service

---

## Bước 4 — Functional QA

Chạy `.claude/skills/browser-qa/SKILL.md` cho các flows quan trọng:

### Core flows (bắt buộc mọi lần ship)
- [ ] Login → Dashboard load được, không lỗi console
- [ ] Signup → user mới tạo được trong Supabase dashboard
- [ ] Protected route: redirect về `/auth` khi không có session
- [ ] Session persist: refresh trang vẫn còn đăng nhập (không bị kick ra)
- [ ] Logout → session xóa, redirect về `/auth`

### UI flows
- [ ] Light mode / Dark mode toggle hoạt động, không có flash màu sai
- [ ] Ngôn ngữ VI / EN switch — tất cả text trong viewport đổi đúng
- [ ] Online → Offline → Online — network indicator hiển thị đúng trạng thái
- [ ] Responsive: test tại 375px (mobile) và 1280px (desktop)

### Phase 1 specifics (sau khi có Notes CRUD)
- [ ] Tạo note mới → hiển thị trong danh sách
- [ ] Sửa note → thay đổi persist sau refresh
- [ ] Xóa note → biến mất khỏi danh sách
- [ ] Empty state hiện đúng khi chưa có note

---

## Bước 5 — GitNexus Pre-ship Check

```
gitnexus_detect_changes()
```

Xem kết quả:
- Symbols changed chỉ là những gì đã dự kiến?
- Không có side effect ngoài ý muốn?
- Execution flows bị ảnh hưởng đã được test trong Bước 4?

---

## Bước 6 — Deploy

### Thứ tự bắt buộc khi có database migration

```
Migration → Deploy backend → Deploy frontend
```

Không bao giờ deploy frontend trước migration — schema mới nhất phải có sẵn trước.

### Database migrations (nếu có)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
alembic upgrade head
# Verify: kiểm tra bảng mới đã tạo trong Supabase dashboard → Table Editor
```

### Backend (Render)
```powershell
rtk git push origin main
# Render auto-deploy từ main branch
# Monitor: Render dashboard → leafnote-api → Events
```

Sau deploy: `GET https://[render-url]/health` → phải trả 200.

### Frontend (Vercel)
```powershell
rtk git push origin main
# Vercel auto-deploy từ main branch
# Build command: cd frontend && npm run build
# Output dir: frontend/dist
# Monitor: Vercel dashboard → leafnote-vn → Deployments
```

---

## Bước 7 — Post-deploy Verification

Test trên **production URL** (`https://leafnote-vn.vercel.app`), không phải localhost:

- [ ] Trang load được (không 404, không blank screen)
- [ ] Login flow hoạt động với Supabase **production** (không phải local)
- [ ] Backend `/health` trả 200: `curl https://[render-url]/health`
- [ ] Console browser: không có uncaught error mới
- [ ] Network tab: không có request nào fail với 4xx/5xx không mong muốn

---

## Bước 8 — Document Release

1. **`HISTORY.md`** → thêm entry với format chuẩn (ngày, mục tiêu, đã làm, files can thiệp)
2. **`ROADMAP.md`** → tick gate condition đã ship, cập nhật phase tiếp theo nếu chuyển phase
3. **`CLAUDE.md`** → cập nhật "Phase hiện tại" nếu chuyển sang phase mới
4. **`.claude/memory/context.md`** → ghi quyết định deploy quan trọng (nếu có thay đổi kiến trúc, config)

---

## Bước 9 — Nếu có sự cố post-deploy

**Không panic — đọc log trước.**

### Diagnose
```powershell
# Frontend: Vercel dashboard → Deployments → chọn deploy vừa xong → Function Logs
# Backend: Render dashboard → leafnote-api → Logs
# Auth: Supabase dashboard → Logs → Auth
```

### Rollback frontend (Vercel)
1. Vercel dashboard → Deployments
2. Chọn commit trước deploy lỗi
3. Click "..." → **Redeploy**
4. Vercel sẽ build lại từ commit cũ — không mất data

### Rollback backend (Render)
1. Render dashboard → leafnote-api → **Manual Deploy**
2. Chọn commit trước đó từ dropdown
3. Deploy

### Rollback migration (nếu cần)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
alembic downgrade -1   # rollback 1 migration
# Cẩn thận: nếu đã có data mới trong cột/bảng mới thì downgrade có thể mất data
```

### Sau khi fix sự cố
1. Fix root cause — không patch tạm
2. Chạy lại Bước 2 (Quality Gate) và Bước 5 (GitNexus check)
3. Deploy lại
4. Ghi vào `.claude/memory/mistakes.md`
