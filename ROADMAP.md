# ROADMAP — Leafnote

> Lộ trình phát triển theo phase tăng dần. Mỗi phase kết thúc là một vòng lặp dùng được thật sự — không phải trang đẹp thiếu core.

---

## Triết lý

Không hoàn thiện 1 page rồi mới sang page khác. Thay vào đó, mỗi phase mở rộng năng lực của toàn hệ thống theo chiều dọc — từ đủ dùng → hoàn thiện dần. Phase sau luôn build trên nền phase trước.

---

## Phase 1 — Shell

**Mục tiêu:** User đăng nhập được và ghi chú được. Đây là nền tảng — không có gì thú vị nhưng không có nó thì không có gì chạy được.

### Auth

- Trang `/auth` với 2 tab: Đăng ký / Đăng nhập
- Đăng ký: form tên hiển thị + email + mật khẩu + nhập lại mật khẩu; validate inline (email hợp lệ, mật khẩu ≥ 8 ký tự, hai ô khớp nhau); submit → tạo tài khoản → redirect sang tab Đăng nhập kèm toast
- Đăng nhập: form email + mật khẩu; submit → session → redirect `/`; lỗi sai credentials hiện inline
- Route guard: chưa có session → redirect `/auth`; đã có session vào `/auth` → redirect `/`
- Đăng xuất từ sidebar

### Note — mức tối thiểu

- Layout chính: sidebar + topbar + main content
- Sidebar: logo, nav (Đang nổi lên / Ghi chú / ...), section tag (trống)
- Trang `/notes`: danh sách note dạng grid; mỗi card hiện tiêu đề + excerpt + thời gian cập nhật; nút "Ghi chú mới"
- Trang `/note/new`: editor trống với ô tiêu đề + body; nút Lưu; sau khi lưu → redirect `/note/:id`
- Trang `/note/:id`: xem note; toggle Read / Edit; lưu thay đổi; xoá note (confirm dialog)
- Auto-save mỗi 2 giây khi đang Edit mode
- Tiêu đề để trống → hiện placeholder "Ghi chú chưa đặt tên"

### Gate

- [ ] Đăng ký → đăng nhập → vào app thành công
- [ ] Tạo note mới → lưu → thấy trong danh sách
- [ ] Sửa note → lưu → thay đổi được giữ
- [ ] Xoá note → biến khỏi danh sách
- [ ] F5 khi chưa đăng nhập → về `/auth`

---

## Phase 2 — Tag + Leaf Engine

**Mục tiêu:** Note có cấu trúc. Sau khi lưu, AI tách ra các leaf và hiện bên cạnh editor. Đây là tính năng định nghĩa Leafnote.

### Tag system

- Modal tạo tag từ sidebar: nhập tên + chọn màu dot; tag lưu vào DB
- Tag hiện trong sidebar kèm số note; click → navigate `/notes?tag=t_id`
- Tag picker trong editor: chip "+ Thêm tag" mở popover multi-select; tạo tag mới inline từ popover
- Trang `/notes`: thanh filter tag ở đầu trang; click 1 tag → lọc; click thêm = AND (note phải có tất cả tag); URL sync `?tag=t1,t2`; nút "Xoá filter"
- Note card hiện danh sách tag pills

### Leaf engine — mức cơ bản

- Sau khi lưu note: gọi AI pipeline tách leaf (chạy nền)
- Banner "AI vừa phân rã N leaf từ note này" xuất hiện khi kết quả về (query param `?fresh=1`)
- Panel leaf bên phải editor: danh sách leaf theo thứ tự xuất hiện trong note; mỗi leaf có type badge (definition / concept / claim / process / fact) + content text
- Highlight mapping: click leaf → highlight đoạn text tương ứng trong body; click đoạn text → highlight leaf tương ứng
- Leaf actions cơ bản: edit content, delete (với confirm)
- Note card trong `/notes` hiện số leaf

### Gate

- [ ] Tạo tag → hiện trong sidebar
- [ ] Gắn tag vào note → tag hiện trên note card
- [ ] Filter 2 tag cùng lúc → chỉ hiện note có cả 2
- [ ] Lưu note → sau vài giây thấy banner + leaf panel
- [ ] Click leaf → đoạn text tương ứng được highlight
- [ ] Sửa content leaf → lưu được
- [ ] Xoá leaf → biến khỏi panel

---

## Phase 3 — Review Loop

**Mục tiêu:** Vòng lặp capture → leaf → ôn tập chạy được end-to-end. Đây là lý do Leafnote tồn tại.

### Review — mức cơ bản

- FSRS scheduler tính queue leaf cần ôn hôm nay cho mỗi user
- Badge số trên nav item "Ôn tập" hiện số leaf trong queue
- Trang `/review`:
  - Header: nút thoát phiên + tiến độ (số đã ôn / tổng) + streak counter
  - Progress bar chạy theo tiến độ
  - Card câu hỏi: type badge + dạng câu hỏi (cloze / recall / definition-reverse / application) + prompt text
  - Vùng đáp án ẩn: placeholder "Hãy thử nhớ trước" + nút "Hiện đáp án"
  - Sau khi reveal: hiện đáp án + leaf gốc đầy đủ
  - Difficulty rating: 4 nút **Again / Hard / Good / Easy** kèm số ngày đến lần ôn tiếp; click → submit rating → cập nhật FSRS → sang card tiếp
  - Meta strip dưới card: retention %, relevance %, lần ôn thứ mấy
  - Màn hình "Xong phiên": số leaf đã ôn + nút "Quay về dashboard"
- Có thể bỏ qua cả ngày ("Hôm nay bận") mà không bị phạt

### Dashboard — mức cơ bản

- Trang `/` hiện stats hôm nay: số leaf đang surface, streak hiện tại, số leaf cần ôn
- Feed leaf placeholder (sẽ hoàn thiện ở Phase 5)

### Gate

- [ ] Lưu note → leaf được tạo → xuất hiện trong queue review hôm sau
- [ ] Ôn 1 leaf → rating Good → leaf không xuất hiện lại hôm đó
- [ ] Rating Again → leaf xuất hiện lại sớm hơn
- [ ] Ôn hết queue → màn hình "Xong phiên"
- [ ] Badge nav cập nhật đúng số

---

## Phase 4 — Graph

**Mục tiêu:** User nhìn thấy bản đồ tri thức của mình dưới dạng đồ thị.

### Graph — mức cơ bản

- Trang `/graph` render đồ thị SVG/Canvas: node = leaf, edge = liên kết ngữ nghĩa
- Node size tỉ lệ theo số lần đã review (popularity)
- Cluster halo: vùng mờ bao quanh nhóm node cùng tag/project
- Toggle chế độ màu:
  - **Theo cụm**: mỗi tag/project một màu
  - **Theo retention**: gradient xanh (nhớ tốt) → đỏ (sắp quên)
- Hover node → tooltip mini: content rút gọn, type badge, retention %
- Click node → panel chi tiết bên phải: content đầy đủ, source note (link), danh sách leaf kề
- Header: số node, số edge, số cụm

### Gate

- [ ] Mở `/graph` → thấy đồ thị với node và edge
- [ ] Toggle màu → màu node thay đổi đúng
- [ ] Hover node → tooltip hiện
- [ ] Click node → panel bên phải hiện đúng leaf đó
- [ ] Click link về source note → navigate đúng

---

## Phase 5 — Surfacing + Conflict

**Mục tiêu:** Hệ thống bắt đầu "hiểu" ngữ cảnh và chủ động đẩy thông tin đúng lúc — không còn chỉ lưu trữ thụ động.

### Dashboard — hoàn thiện

- Feed leaf đang nổi lên: dựa trên ngữ cảnh phiên làm việc, forgetting curve, hành vi 7 ngày
- Leaf card đầy đủ: content, type badge, nguồn note, retention bar, nút "Xem chi tiết"
- Leaf detail modal: content đầy đủ + link về note gốc
- Filter pills: Tất cả / Sắp quên / Liên quan ngay / Mâu thuẫn / Mới sinh
- Panel xung đột: liệt kê cặp leaf có nội dung mâu thuẫn nhau kèm trích dẫn cả hai

### Note — surfacing trong lúc viết

- Panel surfacing trong editor: trong khi gõ, tự động đẩy 3–5 leaf liên quan từ kho cũ
- Mỗi gợi ý kèm lý do ngắn: "Sắp quên", "Mâu thuẫn với ghi chú cũ", "Liên quan tới bản nháp", "Đã lâu không xem"
- Leaf đã bỏ qua trong phiên làm việc đó không lặp lại

### Note — phát hiện duplicate & mâu thuẫn

- Khi leaf mới được tạo, so sánh với toàn bộ leaf của user (vector search)
- Nếu phát hiện duplicate hoặc mâu thuẫn → hiện gợi ý inline kèm trích dẫn cả hai phiên bản
- User chọn: giữ cả hai / gộp lại / chọn phiên bản đúng / bỏ qua

### Review — hoàn thiện nhỏ

- Streak counter đầy đủ (số ngày liên tiếp có ôn)
- "Hôm nay bận" không reset streak

### Gate

- [ ] Dashboard hiện feed leaf, filter hoạt động đúng
- [ ] Mở editor → sau vài giây thấy leaf liên quan xuất hiện trong surfacing panel
- [ ] Tạo leaf mới trùng nội dung leaf cũ → thấy gợi ý duplicate
- [ ] Gộp 2 leaf duplicate → còn 1 leaf
- [ ] Streak tăng sau mỗi ngày có ôn

---

## Phase 6 — Personalization (Insights)

**Mục tiêu:** User thấy được hệ thống đang cá nhân hoá cho họ — đo được, không phải khẩu hiệu. Đây là điểm demo được nhất khi thuyết trình.

### Insights — đầy đủ

- 4 stat lớn: tổng số leaf, retention trung bình, streak, tổng số lần review
- Forgetting curve cá nhân: biểu đồ đường so sánh curve của user với FSRS default; chú thích "Bạn quên nhanh hơn mặc định X%"
- Cognitive traits: danh sách đặc điểm (granularity ưa thích, question type hiệu quả nhất, peak hours, v.v.); mỗi trait có giá trị + giải thích ngắn
- Topic heatmap: lưới hàng = tag/project, cột = 12 tuần gần nhất; màu theo mức độ hoạt động
- Tín hiệu đang theo dõi: danh sách signal với strength bar và mô tả
- Leafnote đã điều chỉnh cho bạn: danh sách thay đổi hệ thống đã tự áp dụng dựa trên profile; hiện thông số đang dùng và lần fit lại cuối

### FSRS per-user

- Job nightly fit FSRS params per-user sau khi đủ dữ liệu (≥ 50 review)
- Job nightly cập nhật cognitive profile (accuracy theo question type, peak hours, granularity preference)
- Surfacing và scheduling dùng weights cá nhân thay vì default

### Gate

- [ ] Mở `/insights` → thấy đủ 6 block
- [ ] Forgetting curve hiện khác nhau giữa 2 user khác nhau
- [ ] Sau 50+ review → FSRS params thay đổi so với default
- [ ] Cognitive traits cập nhật theo hành vi ôn tập

---

## Phase 7 — Polish & Hoàn thiện

**Mục tiêu:** App sẵn sàng cho người dùng thật. Trải nghiệm mượt từ đầu đến cuối.

### Onboarding

- Kích hoạt tự động sau đăng nhập lần đầu (flag `onboarding_done` chưa set)
- Màn 1 — Chào mừng: giải thích concept "lá tri thức" (note → leaf → ôn tập)
- Màn 2 — Tạo note đầu tiên: textarea + "Tạo ngay" → chạy decompose → hiện kết quả leaf
- Màn 3 — Giải thích review: vòng lặp FSRS (Quên → Ôn → Nhớ lâu hơn)
- Màn 4 — Xong: nút "Bắt đầu dùng Leafnote" → dashboard, set flag
- Nút "Bỏ qua" ở mọi màn → skip + set flag

### About Me

- Hiển thị tên, email, ngày tạo tài khoản
- Chỉnh sửa tên hiển thị
- Đổi mật khẩu: nhập mật khẩu cũ + mới + xác nhận
- Đăng xuất

### Help

- Giải thích khái niệm core: leaf là gì, FSRS là gì, retention là gì, surfacing là gì
- FAQ dạng accordion
- Link liên hệ / báo lỗi

### Input nâng cao (NTH từ Phase 2)

- Voice input: nút mic trên toolbar → panel thu âm → STT → transcript chèn vào vị trí con trỏ
- Image / OCR: nút ảnh trên toolbar → upload tối đa 5 ảnh → OCR + sửa lỗi tiếng Việt → text chèn vào note

### Gate

- [ ] User mới đăng ký → thấy onboarding → có thể bỏ qua
- [ ] Đổi tên hiển thị → hiện đúng trên sidebar
- [ ] Help hiện đủ 4 khái niệm core + FAQ
- [ ] Voice input → transcript xuất hiện trong editor
- [ ] Image upload → text OCR xuất hiện trong editor

---

## Tóm tắt

| Phase | Năng lực mới | Có thể demo |
|---|---|---|
| 1 — Shell | Đăng nhập, viết note | Chưa |
| 2 — Tag + Leaf | Note có cấu trúc, leaf xuất hiện | Sơ bộ |
| 3 — Review | Vòng lặp ôn tập end-to-end | Được |
| 4 — Graph | Bản đồ tri thức | Được |
| 5 — Surfacing | Hệ thống chủ động gợi ý | Tốt |
| 6 — Personalization | Cá nhân hoá đo được | Rất tốt |
| 7 — Polish | Trải nghiệm hoàn chỉnh | Production-ready |
