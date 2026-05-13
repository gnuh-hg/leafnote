# Patterns — Leafnote

> Pattern đã được thực chiến và rút ra từ code thật. Ưu tiên dùng lại trước khi tự nghĩ ra cách mới.

---

## Format mỗi entry

**[Tên pattern]**
- **Vấn đề giải quyết**: Khi nào dùng pattern này
- **Implementation**: Code snippet hoặc mô tả cách làm
- **Ví dụ trong codebase**: File tham khảo
- **Caveats**: Khi nào KHÔNG nên dùng

---

## Patterns đã chốt

### TYPE_STYLES với i18n key
- **Vấn đề giải quyết**: Hiển thị label cho leaf type với đúng màu và text đa ngôn ngữ
- **Implementation**: Object map `type → { label: i18nKey, className }`, caller dùng `t(T.label)` — không hardcode string
- **Ví dụ trong codebase**: `frontend/src/components/LeafCard.tsx`
- **Caveats**: `label` phải là i18n key hợp lệ trong cả `vi.json` và `en.json`

### Empty state 2 trường hợp
- **Vấn đề giải quyết**: Mọi view data-dependent cần phân biệt "chưa có data nào" vs "filter không có kết quả"
- **Implementation**: Check `data.length === 0 && !activeFilter` (empty chính) vs `data.length === 0 && activeFilter` (empty khi filter)
- **Ví dụ trong codebase**: `frontend/src/pages/NotesList.tsx`, `.claude/workflows/build-feature.md` Bước 6
- **Caveats**: Cả 2 case cần i18n key riêng và empty illustration riêng

### URL-based filter state
- **Vấn đề giải quyết**: Filter tag/category cần persist qua page refresh và shareable qua URL
- **Implementation**: `useSearchParams` (React Router) thay vì `useState` cho filter active
- **Ví dụ trong codebase**: `frontend/src/pages/NotesList.tsx`
- **Caveats**: Chỉ dùng cho filter có ý nghĩa khi share URL; filter ephemeral (sort order tạm) vẫn dùng `useState`

### get_or_create_user pattern
- **Vấn đề giải quyết**: Sync user từ Supabase vào DB nội bộ khi đăng nhập lần đầu mà không tạo duplicate
- **Implementation**: Query by `supabase_id`; nếu không tìm thấy thì `INSERT` mới; trả về user dù là new hay existing
- **Ví dụ trong codebase**: `backend/app/services/auth.py`
- **Caveats**: Phải wrap trong transaction; race condition nếu 2 request đồng thời — dùng `ON CONFLICT DO NOTHING` hoặc lock

### Supabase client fallback
- **Vấn đề giải quyết**: App không crash khi env vars chưa được set (local dev chưa có `.env`)
- **Implementation**: `createClient(url ?? 'https://placeholder.supabase.co', key ?? 'placeholder-key')` — không throw, chỉ fail khi thực sự gọi API
- **Ví dụ trong codebase**: `frontend/src/lib/supabase.ts`
- **Caveats**: Placeholder phải có format hợp lệ (URL + base64-like key) để Supabase client không throw lúc khởi tạo
