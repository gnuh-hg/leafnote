# Product Principles — Leafnote

> Định hướng sản phẩm cross-cutting: áp dụng cho mọi tính năng, mọi milestone. Đọc file này trước khi thiết kế UI, viết API, hay quyết định scope tính năng mới.

---

## 1. Dark / Light Mode

Giao diện hỗ trợ hai chế độ sáng tối. Mặc định theo system preference của thiết bị (`prefers-color-scheme`). Người dùng có thể override thủ công và lựa chọn được lưu lại.

**Ràng buộc kỹ thuật**:

- Dùng CSS custom properties (variables) cho toàn bộ màu sắc — không hardcode hex trong component.
- Tailwind: dùng `dark:` variant, không tạo class riêng.
- Token màu định nghĩa tại một chỗ duy nhất (design token file), không rải khắp codebase.

---

## 2. Song ngữ VI / EN

App hỗ trợ cả tiếng Việt lẫn tiếng Anh. Kiến trúc i18n được dựng từ M1, giao diện mặc định là **tiếng Việt**. Người dùng có thể chuyển ngôn ngữ trong Settings, lựa chọn được lưu vào profile.

**Ràng buộc kỹ thuật**:

- Toàn bộ string hiển thị cho user (label, placeholder, thông báo lỗi, tooltip) phải đi qua i18n layer — không hardcode string trực tiếp trong JSX.
- File dịch đặt tại `frontend/src/locales/vi.json` và `frontend/src/locales/en.json`.
- AI-generated content (tên leaf, câu hỏi recall) sinh theo ngôn ngữ hiện tại của user, không luôn luôn là tiếng Anh.

**Open question**: Guest chưa chọn ngôn ngữ → default VI. Có thể detect browser locale trong tương lai (P1).

---

## 3. Bảo mật

Bảo mật không phải feature thêm sau — là ràng buộc của mọi feature từ đầu.

**Ràng buộc kỹ thuật**:

- Không bao giờ để thông tin nhạy cảm trong URL (token, user ID, nội dung note).
- Mọi API endpoint (trừ public health check) đều yêu cầu xác thực qua Supabase JWT.
- Input từ user phải được validate ở cả frontend (UX) lẫn backend (security) — không tin tưởng client.
- Rate limiting áp dụng cho mọi endpoint tạo/sửa data.
- AI pipeline: không gửi dữ liệu người dùng tới LLM provider ngoài những gì cần thiết để xử lý — không log nội dung note ra ngoài.
- Note Local-only (P1): user có thể đánh dấu note không qua AI — kiến trúc cần hỗ trợ flag này.

---

## 4. UX thích nghi (Adaptive UX)

Leafnote phục vụ người dùng thật — không phải trẻ con, không phải developer. Hệ thống phải đủ thông minh để biết khi nào cần hướng dẫn và khi nào nên tránh.

**Ràng buộc**:

- **Người mới**: Hiển thị onboarding chỉ lần đầu, có thể bỏ qua bất kỳ lúc nào. Không lặp lại tooltip/walkthrough với user đã dùng app quá 3 ngày hoặc đã tạo hơn 5 note.
- **Người có kinh nghiệm**: Không chú thích điều hiển nhiên. Tooltip chỉ xuất hiện khi hover (không auto-show). Không có màn hình "Are you sure?" cho mọi action — chỉ với action destructive thật sự.
- **Người thường (không phải developer)**: Giải thích bằng ngôn ngữ tự nhiên, không dùng jargon kỹ thuật (không viết "leaf ID", "embedding", "FSRS params" ra UI). Nếu cần giải thích khái niệm lạ (leaf, recall), dùng analogy gần gũi.
- Track ở backend: `user_created_at`, `note_count`, `last_active_at` — dùng để quyết định UX path, không dùng cho marketing.

---

## 5. Responsive Mobile

Leafnote là web app nhưng phải dùng được tốt trên điện thoại — không cần native app riêng.

**Ràng buộc kỹ thuật**:

- Layout dùng mobile-first: thiết kế cho 375px trước, mở rộng cho desktop.
- Không có element nào bị cắt hoặc overflow trên màn 375px.
- Touch target tối thiểu 44×44px (Apple HIG standard).
- Editor ghi note phải dùng được trên mobile keyboard — không bị virtual keyboard che mất nội dung đang gõ.
- Navigation: sidebar collapse thành bottom bar trên mobile.
- Kiểm tra trên Chrome DevTools (375×812) trước mỗi PR ảnh hưởng đến layout.

---

## 6. Offline Support

App vẫn dùng được khi không có mạng — ít nhất là đọc và ghi note.

**Ràng buộc kỹ thuật**:

- Implement PWA với Service Worker từ M1/M2.
- Ghi note khi offline → lưu vào local queue (IndexedDB) → tự sync khi có mạng trở lại.
- UI hiển thị rõ trạng thái mạng: online / offline / syncing.
- Tính năng phụ thuộc server (AI decompose, recall scheduling) có thể không có khi offline — hiển thị thông báo, không crash.
- Conflict resolution khi sync: last-write-wins cho note content, không xoá data local.

---

## Tóm tắt nhanh cho review

| Principle | Check trước khi merge |
|---|---|
| Dark/Light | Có test trên cả 2 theme? |
| i18n | Mọi string qua i18n layer? |
| Bảo mật | Validate ở backend? Rate limit? Không leak data? |
| Adaptive UX | Có hiện gì thừa với user cũ không? |
| Mobile | Test 375px, touch target ≥ 44px? |
| Guest | Flow guest → login có mượt không? |
| Offline | Offline write → sync có hoạt động không? |
