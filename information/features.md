# Tính năng — Leafnote

> Mô tả tính năng theo từng page, kèm MH/NTH. MH = Must-have, NTH = Nice-to-have.

---

## Thứ tự làm

```
auth → note → graph → onboarding → review → insights → about me → help
```

---

## 1. Auth

Người dùng đăng ký và đăng nhập bằng email — không cần điền form dài. Sau lần đăng nhập đầu tiên, app dẫn qua luồng onboarding.

### MH

**Đăng ký**

- Form: tên hiển thị, email, mật khẩu, nhập lại mật khẩu
- Validate: email hợp lệ, mật khẩu ≥ 8 ký tự, hai ô mật khẩu khớp nhau
- Submit → tạo tài khoản → chuyển sang trang đăng nhập kèm toast "Đăng ký thành công"

**Đăng nhập**

- Form: email, mật khẩu
- Submit → có session → vào `/` (dashboard)
- Hiển thị lỗi inline nếu sai credentials

**Flow tổng**

```
Đăng ký → (redirect) Đăng nhập → (session) Dashboard
```

**Bảo vệ route**

- Tất cả page trừ `/auth` đều yêu cầu session; redirect về `/auth` nếu chưa đăng nhập
- Đã có session mà vào `/auth` → redirect về `/`

### NTH

- Đăng nhập bằng magic link (nhập email → nhận link qua mail, không cần mật khẩu)
- Khôi phục mật khẩu (quên mật khẩu → nhập email → nhận link reset)
- Hiện/ẩn mật khẩu (toggle eye icon)

---

## 2. Note

Toàn bộ quá trình tạo và quản lý note diễn ra trong **một editor duy nhất** — giống nhau giữa note mới và note cũ, không phải modal/wizard riêng. Sau khi lưu, hệ thống tự tách note thành các lá tri thức nhỏ (leaf) và hiển thị trong panel bên cạnh.

Gồm 3 view: dashboard surfacing (`/`), danh sách note (`/notes`), editor (`/note/:id`).

### MH

**Dashboard — Đang nổi lên (`/`)**

- Hiển thị feed leaf được surface dựa trên ngữ cảnh phiên làm việc, forgetting curve và hành vi 7 ngày
- Filter pills: Tất cả / Sắp quên / Liên quan ngay / Mâu thuẫn / Mới sinh
- Stats hôm nay: số leaf surface, streak, số leaf cần ôn
- Leaf card: content, type badge, nguồn note, retention bar, nút "Xem chi tiết"
- Leaf detail modal: xem đầy đủ content, link về note gốc
- Panel xung đột (conflict): liệt kê cặp leaf contradicts nhau

**Danh sách note (`/notes`)**

- Grid note cards: tiêu đề, excerpt, danh sách tag, số leaf, thời gian cập nhật
- Filter tag (AND logic): click nhiều tag → chỉ hiện note có tất cả tag đó; URL sync `?tag=t1,t2`
- Nút "Ghi chú mới" → mở editor mới
- Click card → mở editor note đó

**Editor (`/note/:id` và `/note/new`)**

- Tiêu đề + body text, chế độ Read / Edit
- Editor có **3 kênh nạp dữ liệu** trên toolbar, không phải 3 mode tách biệt:
  - **Gõ trực tiếp (Text)** — mở app là gõ ngay; tiêu đề để trống thì AI tự sinh sau khi tách lá; auto-save mỗi 2 giây
  - **Ghi âm (Voice)** — bấm nút mic mở panel thu âm; transcript được chèn vào vị trí con trỏ; STT chạy nền
  - **Ảnh / OCR** — bấm nút ảnh mở panel upload; tối đa 5 ảnh; OCR + LLM sửa lỗi tiếng Việt chạy nền
- Lưu note (Save): nếu note mới → redirect sang `/note/:id?fresh=1`
- Banner "AI vừa phân rã N leaf từ note này" xuất hiện sau khi lưu lần đầu
- Panel leaf bên phải: danh sách leaf được tách từ note, mỗi leaf có type badge + content, hiện dần (streaming)
- Highlight mapping: click leaf → highlight đoạn text tương ứng trong body (và ngược lại)
- Leaf actions: edit content leaf, delete leaf
- Tag picker: gắn / bỏ tag vào note
- Surfacing panel trong lúc viết: đẩy lên 3–5 leaf liên quan từ kho cũ kèm lý do ("Sắp quên", "Mâu thuẫn với ghi chú cũ", v.v.)

**Tag system**

- Tạo tag mới từ sidebar (modal: tên + màu dot)
- Tag hiển thị trong sidebar kèm số note; click tag → `/notes?tag=t_id`
- Note không tag vẫn xuất hiện trong danh sách "all" (không có Inbox)

**Phát hiện trùng lặp & mâu thuẫn**

- Khi leaf mới tạo, hệ thống so sánh với toàn bộ leaf của user
- Nếu phát hiện duplicate hoặc mâu thuẫn → hiện gợi ý kèm trích dẫn cả hai phiên bản
- User chọn: giữ cả hai / gộp lại / chọn phiên bản đúng / bỏ qua

### NTH

- Leaf actions nâng cao: gộp 2 leaf (merge), tách 1 leaf (split)
- Leaf dormant: đánh dấu một leaf hoặc cả chủ đề là "dormant" khi không muốn bị nhắc — không xuất hiện trong recall hằng ngày nhưng không bị xoá; khi viết note mới về chủ đề liên quan, hệ thống gợi ý "hồi sinh"
- Trang chi tiết leaf: nội dung, loại, note gốc với highlight, lịch sử ôn tập, danh sách leaf liên quan, sinh lại câu hỏi
- Filter OR-mode: toggle "Khớp tất cả / Khớp bất kỳ" trên thanh filter
- Web Clip Extension: clip đoạn văn từ trình duyệt thẳng vào Leafnote kèm URL nguồn
- Import Markdown / Notion: upload `.zip` Markdown để nhập kho ghi chú cũ, tự gắn tag dựa trên tên folder
- Gap Detection: phát hiện khái niệm được nhắc nhiều nhưng chưa có định nghĩa rõ ràng
- Note Local-only: đánh dấu note không gửi qua AI cho nội dung nhạy cảm

---

## 3. Graph

Visualize toàn bộ leaf theo cụm chủ đề dưới dạng đồ thị tương tác — leaf là node, liên kết ngữ nghĩa là edge. Cụm nóng nổi rõ, leaf ngủ đông mờ dần.

### MH

- Render đồ thị SVG/Canvas: node = leaf, edge = liên kết ngữ nghĩa giữa các leaf
- Node có kích thước tỉ lệ theo số lần review (popularity)
- Toggle chế độ màu: **theo cụm** (project/tag) hoặc **theo retention** (xanh → đỏ theo %)
- Cluster halo: vùng mờ bao quanh nhóm node cùng project
- Hover node → tooltip mini: content rút gọn, type badge, retention %
- Click node → panel chi tiết bên phải: content đầy đủ, source note, liên kết kề

### NTH

- Zoom / pan canvas
- Filter theo project: chỉ hiện node thuộc project đang chọn
- Active/dormant visual: node ngủ đông mờ dần, node hot sáng hơn
- Minimap khi graph lớn
- Xem sự tiến hoá graph theo thời gian

---

## 4. Onboarding

Sau lần đăng nhập đầu tiên, app dẫn qua luồng giới thiệu ngắn — leaf là gì, thử capture một note. Mọi màn đều có thể bỏ qua; app dẫn user thẳng vào dashboard để bắt đầu ngay.

### MH

- Kích hoạt tự động sau đăng nhập lần đầu (flag `onboarding_done` chưa set)
- Màn hình 1 — Chào mừng: giải thích concept "lá tri thức" (note → leaf → ôn tập)
- Màn hình 2 — Tạo note đầu tiên: textarea + nút "Tạo ngay" → chạy decompose demo → hiện kết quả leaf
- Màn hình 3 — Giải thích review: mô tả vòng lặp FSRS (Quên → Ôn → Nhớ lâu hơn)
- Màn hình 4 — Xong: nút "Bắt đầu dùng Leafnote" → vào dashboard, set flag `onboarding_done`
- Nút "Bỏ qua" ở mọi màn hình → skip thẳng vào dashboard, set flag

### NTH

- Màn hình chọn chủ đề quan tâm (pre-seed project mẫu)
- Progress dots hiển thị đang ở bước mấy / tổng bao nhiêu bước
- Animation chuyển màn hình

---

## 5. Review

Mỗi ngày hệ thống chọn ra tập leaf sắp bị quên và hiển thị thành các câu hỏi. Câu hỏi có nhiều dạng để tránh học vẹt: cloze, định nghĩa ngược, câu hỏi ứng dụng. User đánh giá độ nhớ theo 4 mức → hệ thống tính thời điểm nhắc lại tiếp theo cho từng leaf.

### MH

- Queue leaf cần ôn hôm nay (do FSRS scheduler xác định); có thể bỏ qua cả ngày mà không bị phạt
- Progress bar: số đã ôn / tổng queue
- Streak counter
- Card câu hỏi: hiển thị prompt (cloze / recall / definition-reverse / application)
- Nút "Hiện đáp án" → reveal answer panel (đáp án + leaf gốc)
- Difficulty rating sau khi reveal: **Again / Hard / Good / Easy** → submit → cập nhật FSRS → sang card tiếp
- Meta strip dưới card: retention %, relevance %, lần ôn thứ mấy
- Badge trên nav hiển thị số leaf cần ôn hôm nay
- Màn hình "Xong phiên": số leaf đã ôn, nút quay về dashboard

### NTH

- Thoát giữa chừng + xác nhận (progress vẫn được lưu)
- Xem lại phiên: danh sách leaf đã ôn + rating đã chọn
- Câu hỏi thích nghi: tự giảm/tăng tần suất loại câu hỏi dựa trên điểm mạnh/yếu của từng người
- Animation flip card khi reveal

---

## 6. Insights

Sau một thời gian dùng đều, hệ thống học được nhịp ghi nhớ riêng của từng người. Trang này hiển thị profile nhận thức và các điều chỉnh hệ thống đã tự áp dụng — minh bạch, không phải hộp đen. Mọi gợi ý đều kèm dòng giải thích ngắn bằng ngôn ngữ tự nhiên.

### MH

**Stats tổng quan** (4 ô lớn)

- Tổng số leaf, retention trung bình, streak hiện tại, tổng số lần review

**Forgetting curve cá nhân**

- Biểu đồ đường: curve của user so với FSRS default
- Chú thích nếu user quên nhanh / chậm hơn mặc định bao nhiêu %

**Đặc điểm nhận thức** (cognitive traits)

- Danh sách trait: granularity ưa thích, question type hiệu quả nhất, peak hours, v.v.
- Mỗi trait có giá trị + giải thích ngắn

**Bản đồ nhiệt chủ đề** (topic heatmap)

- Lưới: hàng = project/tag, cột = 12 tuần gần nhất
- Ô màu theo mức độ hoạt động (lạnh → nóng)

**Tín hiệu đang theo dõi**

- Danh sách signal: tên, mô tả, strength bar (%)

**Leafnote đã điều chỉnh cho bạn**

- Danh sách thay đổi hệ thống đã tự áp dụng dựa trên profile (interval, question type, granularity)
- Hiển thị thông số đang dùng cho user và lần fit lại cuối

### NTH

- Bộ lọc khoảng thời gian (7 ngày / 30 ngày / toàn bộ)
- So sánh với benchmark cộng đồng ẩn danh
- Granularity thích nghi: tự điều chỉnh độ chi tiết khi tách lá dựa trên phản hồi user

---

## 7. About Me

Trang cài đặt tài khoản và thông tin cá nhân.

### MH

- Hiển thị: tên hiển thị, email, ngày tạo tài khoản
- Chỉnh sửa tên hiển thị
- Đổi mật khẩu (nhập mật khẩu cũ + mới + xác nhận)
- Đăng xuất

### NTH

- Upload avatar
- Xoá tài khoản (destructive action, yêu cầu nhập lại mật khẩu xác nhận)
- Xem tóm tắt hoạt động (total notes, total leaf, member since)

---

## 8. Help

Trang trợ giúp — giải thích khái niệm và hướng dẫn sử dụng.

### MH

- Giải thích các khái niệm core: leaf là gì, FSRS là gì, retention là gì, surfacing là gì
- FAQ dạng accordion: câu hỏi thường gặp + trả lời ngắn
- Link liên hệ / báo lỗi

### NTH

- Search trong help
- Video demo nhúng (2–3 phút walkthrough)
- Changelog / what's new

---

## Gate done cho mỗi page

1. Toàn bộ MH hoạt động đúng trên staging
2. Không có lỗi console unhandled
3. Responsive ở 375px và 1280px+

Page xong theo thứ tự → mở page tiếp theo. Không làm song song.
