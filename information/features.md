# Tính năng — Leafnote

> Mô tả các tính năng có trong web app theo góc nhìn sản phẩm.

---

## 1. Đăng nhập & Onboarding

Người dùng đăng ký và đăng nhập bằng Google hoặc email — không cần điền form dài. Sau lần đăng nhập đầu tiên, app dẫn qua 2 màn giới thiệu ngắn: leaf là gì, thử capture một note. Cả 2 màn đều có thể bỏ qua; app dẫn user thẳng vào editor trống để bắt đầu ngay.

---

## 2. Capture đa kênh trong Editor thống nhất

Toàn bộ quá trình tạo note diễn ra trong **một editor duy nhất** (`/note/new`) — giống editor sửa note (`/note/:id`), không phải modal/wizard riêng. Điều này giảm cognitive load: user không phải học hai UI khác nhau cho cùng một hành động (viết note).

Editor có **3 kênh nạp dữ liệu** (input methods) như nút trên toolbar, không phải 3 mode tách biệt:

- **Gõ trực tiếp (Text)** — Mở app là gõ ngay, không cần đặt tiêu đề, không cần chọn thư mục. Editor tự lưu mỗi 2 giây. Mất mạng → giữ local queue → tự đồng bộ khi online. Tiêu đề để trống thì AI tự sinh sau khi tách lá.
- **Ghi âm (Voice)** — Bấm nút mic trên toolbar mở panel thu âm trong editor. Một chạm để bắt đầu/dừng. Sau khi thu xong, transcript được chèn vào vị trí con trỏ trong cùng note. STT chạy nền — note vẫn hiển thị với placeholder "Đang chuyển giọng nói".
- **Ảnh / OCR** — Bấm nút ảnh trên toolbar mở panel upload trong editor. Tối đa 5 ảnh ghép thành nội dung của note hiện tại. OCR + LLM sửa lỗi tiếng Việt và ký hiệu toán chạy nền. Ảnh gốc được lưu lại để đối chiếu.

Cả 3 kênh đều ghi vào cùng một note, cùng một editor — voice và image không tạo note riêng mà bổ sung vào note đang viết.

---

## 3. Tag & Filter

Mỗi note có thể được gắn **nhiều tag** (many-to-many) — ví dụ một note vừa thuộc `triết-học` vừa thuộc `reading`. Tag là nhãn nhẹ: tên + màu, không phải workspace, không có "tag đang mở".

- **Gắn tag** — Trong editor, chip "+ Thêm tag" mở popover multi-select hoặc tạo tag mới inline. Tag được lưu cùng note.
- **Filter trong danh sách ghi chú** — Thanh chips ở đầu trang `/notes`. Click 1 tag → lọc note có tag đó. Click thêm tag = thu hẹp dần (**AND**: note phải có tất cả tag đã chọn). URL sync `?tag=t1,t2` để chia sẻ link filter.
- **Sidebar** — Section "Tag" liệt kê tag với số note. Click tag → navigate `/notes?tag=t_id` với filter đã set sẵn.
- **Note không tag** — Vẫn xuất hiện trong danh sách "all" (không có khái niệm Inbox). Filter chỉ hoạt động khi user chọn tag cụ thể.

> **Quyết định kiến trúc**: Bỏ khái niệm "active project" (workspace context) — note không bị ràng buộc bởi context phiên làm việc. Filter là cách duy nhất để giới hạn phạm vi.
>
> **OR-filter** không có trong MVP — search bar đã đủ cho use case "mở rộng". Nếu feedback yêu cầu, P1 sẽ thêm toggle "Khớp tất cả / Khớp bất kỳ".

---

## 4. Tách note thành Leaf

Sau khi lưu note, hệ thống tự động phân tích và tách nội dung thành các lá tri thức nhỏ — gọi là **leaf**. Mỗi leaf là một mệnh đề, định nghĩa, dữ kiện, hoặc quan hệ độc lập. Các leaf hiện ra dần trong panel bên cạnh editor (streaming), kèm badge phân loại và highlight ngược về đoạn gốc trong note.

Người dùng có thể:
- **Gộp** hai leaf thành một nếu thấy quá vụn
- **Tách** một leaf ra nếu thấy quá gộp
- **Sửa** nội dung leaf
- **Bỏ qua** leaf không cần thiết

---

## 5. Phát hiện trùng lặp & mâu thuẫn

Khi leaf mới được tạo, hệ thống so sánh với toàn bộ leaf của người dùng. Nếu phát hiện nội dung gần giống (duplicate) hoặc mâu thuẫn về ngữ nghĩa, hệ thống hiển thị gợi ý cùng trích dẫn cả hai phiên bản. Người dùng chọn: giữ cả hai, gộp lại, chọn phiên bản đúng, hoặc bỏ qua.

---

## 6. Ôn tập chủ động (Active Recall)

Mỗi ngày hệ thống chọn ra một tập leaf sắp bị quên và hiển thị thành các câu hỏi trên trang Recall. Câu hỏi có nhiều dạng khác nhau để tránh học vẹt: điền vào chỗ trống (cloze), định nghĩa ngược, câu hỏi ứng dụng. Người dùng đọc câu hỏi, tự trả lời, rồi đánh giá độ nhớ theo 4 mức: **Again / Hard / Good / Easy**.

Dựa trên đánh giá đó, hệ thống tự tính thời điểm nhắc lại tiếp theo cho từng leaf — leaf nhớ tốt thì nhắc thưa hơn, leaf hay quên thì nhắc dày hơn.

Badge trên thanh điều hướng hiển thị số leaf cần ôn hôm nay. Có thể bỏ qua cả ngày ("Hôm nay bận") mà không bị phạt.

---

## 7. Leaf Dormant (Tạm ngủ đông)

Người dùng có thể đánh dấu một leaf hoặc cả chủ đề là "dormant" khi không muốn bị nhắc nữa (ví dụ: chủ đề học xong kỳ thi). Leaf dormant không xuất hiện trong recall hằng ngày, nhưng không bị xoá. Khi người dùng viết note mới về chủ đề liên quan, hệ thống tự gợi ý "hồi sinh" leaf đó.

---

## 8. Surfacing trong lúc viết

Trong khi người dùng đang gõ note, panel bên cạnh editor tự động đẩy lên 3–5 leaf liên quan từ kho tri thức cũ — không cần tìm kiếm thủ công. Mỗi gợi ý kèm lý do ngắn: "Sắp quên", "Mâu thuẫn với ghi chú cũ", "Liên quan tới bản nháp", "Đã lâu không xem".

Người dùng có thể chèn leaf vào note đang viết, mở xem chi tiết, hoặc bỏ qua. Leaf đã bỏ qua trong phiên làm việc đó sẽ không lặp lại.

---

## 9. Trang chi tiết Leaf

Mỗi leaf có trang riêng hiển thị đầy đủ: nội dung, loại, note gốc (với highlight đoạn tương ứng), lịch sử ôn tập, và danh sách các leaf liên quan. Từ đây người dùng có thể sửa nội dung, sinh lại câu hỏi, chia nhỏ, hoặc gộp với leaf khác.

---

## 10. Lịch ôn cá nhân hoá (FSRS per-user)

Sau một thời gian dùng đều, hệ thống học được nhịp ghi nhớ riêng của từng người — ai quên nhanh, ai nhớ lâu, ai mạnh môn nào. Lịch ôn tự điều chỉnh theo dữ liệu thực tế của từng người thay vì dùng thông số mặc định. Trang `/me` cho thấy profile nhận thức hiện tại: độ chính xác theo loại câu hỏi, thời điểm ôn hiệu quả nhất, xu hướng granularity.

---

## 11. Giải thích lý do (Explainability)

Mọi gợi ý từ hệ thống — dù là leaf surfacing, câu hỏi recall, hay cảnh báo mâu thuẫn — đều kèm theo dòng giải thích ngắn bằng ngôn ngữ tự nhiên. Trang profile hiển thị rõ hệ thống đang dùng thông số gì cho người dùng hiện tại và được fit lại lần cuối khi nào.

---

## Tính năng P1 (sau MVP)

| Tính năng | Mô tả ngắn |
|---|---|
| Web Clip Extension | Clip đoạn văn từ trình duyệt thẳng vào Leafnote, kèm URL nguồn |
| Import Markdown / Notion | Upload `.zip` Markdown để nhập kho ghi chú cũ, tự gắn tag dựa trên tên folder |
| Filter OR-mode | Toggle "Khớp tất cả / Khớp bất kỳ" trên thanh filter — mở rộng phạm vi note hiển thị |
| Câu hỏi thích nghi | Tự giảm/tăng tần suất loại câu hỏi dựa trên điểm mạnh/yếu của từng người |
| Granularity thích nghi | Tự điều chỉnh độ chi tiết khi tách lá dựa trên phản hồi người dùng |
| Knowledge Graph | Visualize toàn bộ leaf theo cụm chủ đề, xem sự tiến hoá theo thời gian |
| Gap Detection | Phát hiện khái niệm được nhắc nhiều nhưng chưa có định nghĩa rõ ràng |
| Note Local-only | Đánh dấu note không gửi qua AI cho nội dung nhạy cảm |
