# Mistakes — Leafnote

> Lỗi đã gặp và cần tránh. Đọc file này TRƯỚC khi bắt đầu task mới.

---

## Format mỗi entry

**[YYYY-MM-DD] — [Tên lỗi ngắn gọn]**

- **Triệu chứng**: Điều gì xảy ra / user thấy gì
- **Root cause**: Tại sao xảy ra
- **Fix**: Đã sửa thế nào
- **Phòng tránh**: Lần sau làm thế nào để không lặp lại

---

## Entries

**2026-05-13 — Thêm entry HISTORY.md sai vị trí (đầu file thay vì cuối)**

- **Triệu chứng**: Entry mới nhất xuất hiện ở đầu file, đảo ngược thứ tự thời gian
- **Root cause**: Dùng `Edit` với `old_string` là separator `---` đầu tiên gặp → entry bị chèn vào đầu thay vì cuối
- **Fix**: Di chuyển entry xuống cuối file
- **Phòng tránh**: `HISTORY.md` luôn append vào **cuối file** — entry mới nhất ở dưới cùng. Khi dùng `Edit`, target `old_string` là nội dung cuối cùng của file hiện tại, thêm entry sau đó.

**2026-05-13 — Edit/delete trên optimistic item có tmp ID**

- **Triệu chứng**: Gọi `PATCH /api/v1/tags/tmp-1234567` hoặc `DELETE /api/v1/tags/tmp-1234567` → 404 vì id này chưa tồn tại trên server
- **Root cause**: Khi create dùng optimistic update, item có id `tmp-xxx` được thêm vào cache ngay. Nếu user click edit/delete trước khi `onSettled` invalidate và server trả id thật → API nhận id ảo
- **Fix**: Lock mọi interaction trên item có `id.startsWith('tmp-')` — không render hover menu, không cho click navigate/edit/delete. `pointer-events-none` trên div wrapper.
- **Phòng tránh**: Mọi list item cần check `isTmp = id.startsWith('tmp-')`. Template pattern đã có trong `patterns.md`. Cách khác (merge mutation vào queue) phức tạp hơn và không cần thiết ở phase 1.
