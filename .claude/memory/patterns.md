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

### Optimistic mutation hook (chuẩn cho mọi CRUD)

- **Vấn đề giải quyết**: UI phải chờ server → cảm giác chậm; offline fail lặng lẽ không rõ ràng
- **Implementation**: Template cho mọi `useMutation`:

  ```typescript
  useMutation({
    mutationFn: ...,
    networkMode: 'offlineFirst',   // mutation vẫn chạy khi offline, retry khi online
    retry: (count, err) => err?.response?.status == null && count < 3,  // chỉ retry network error
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: [KEY] })
      const previous = qc.getQueryData([KEY])
      qc.setQueryData([KEY], /* cập nhật cache ngay */)
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData([KEY], ctx.previous)  // rollback
      addToast('error', t('toast.error.generic'))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [KEY] }),  // sync lại với server
  })
  ```

- **Modal behavior**: Đóng modal ngay sau `mutate()` (không chờ `onSuccess`) — optimistic update đã cập nhật UI
- **tmp ID cho create**: `const tmpId = 'tmp-' + Date.now()` — thêm vào cache với id này; `onSettled` invalidate sẽ thay bằng id thật từ server
- **Ví dụ trong codebase**: `frontend/src/hooks/useTags.ts`
- **Caveats**: Xem "tmp ID lock" trong `mistakes.md` — không cho edit/delete item có id `tmp-*`

### Tiptap node + tiptap-markdown round-trip

- **Vấn đề giải quyết**: Thêm custom node (math, ảnh, embed...) vào Tiptap mà vẫn giữ Markdown thuần khi lưu DB
- **Implementation**: `Extension.extend({ addStorage() { return { markdown: { serialize(state, node) { ... }, parse: {} } } } })` — tiptap-markdown đọc storage này khi `getMarkdown()`. Với content load từ Markdown, dùng migration helper của extension (vd `migrateMathStrings(editor)`) gọi sau `setContent()` để convert raw text → node.
- **Ví dụ trong codebase**: `frontend/src/components/editor/PlainEditor.tsx` (InlineMathMd, BlockMathMd)
- **Caveats**: Serializer phải `state.closeBlock(node)` cho block node, không thì paragraph kế bị merge cùng dòng. Migration cần chạy sau khi `isExternalUpdate` flag set false để không trigger onChange loop.

### Supabase client fallback

- **Vấn đề giải quyết**: App không crash khi env vars chưa được set (local dev chưa có `.env`)
- **Implementation**: `createClient(url ?? 'https://placeholder.supabase.co', key ?? 'placeholder-key')` — không throw, chỉ fail khi thực sự gọi API
- **Ví dụ trong codebase**: `frontend/src/lib/supabase.ts`
- **Caveats**: Placeholder phải có format hợp lệ (URL + base64-like key) để Supabase client không throw lúc khởi tạo
