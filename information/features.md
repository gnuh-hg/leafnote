# Tính năng — Leafnote

> Mô tả các tính năng có trong web app theo góc nhìn sản phẩm.

---

## 1. Đăng nhập & Onboarding

Người dùng đăng ký và đăng nhập bằng Google hoặc email — không cần điền form dài. Sau lần đăng nhập đầu tiên, app dẫn qua 3 màn giới thiệu ngắn: atom là gì, thử capture một note, tạo project đầu tiên. Cả 3 màn đều có thể bỏ qua; app vẫn tạo sẵn một project "Inbox" mặc định để người dùng bắt đầu ngay.

---

## 2. Ghi chú nhanh (Text Capture)

Mở app là có thể gõ ngay — không cần đặt tiêu đề, không cần chọn thư mục trước. Editor tự lưu mỗi 2 giây. Nếu mất mạng, note được giữ lại và tự đồng bộ khi online trở lại. Tiêu đề để trống thì AI tự sinh sau khi xử lý xong.

---

## 3. Ghi âm → Chuyển thành note (Voice Capture)

Một chạm để ghi âm, một chạm để dừng. Âm thanh được chuyển tự động thành văn bản, sau đó trở thành nội dung của note. Trong lúc chờ chuyển đổi, note vẫn hiển thị ngay với trạng thái "Đang xử lý giọng nói". Người dùng có thể sửa lại transcript trước khi hệ thống bắt đầu phân tích nội dung.

---

## 4. Chụp ảnh → Chuyển thành note (Image / OCR)

Upload ảnh chụp whiteboard, slide, hoặc trang sách — tối đa 5 ảnh ghép thành một note. Hệ thống nhận dạng chữ (kể cả tiếng Việt và ký hiệu toán), sửa lỗi nhận dạng bằng AI, và tạo note văn bản từ đó. Ảnh gốc được lưu lại để người dùng đối chiếu hoặc sửa tay nếu cần.

---

## 5. Quản lý Project & Ngữ cảnh

Người dùng tạo các project (ví dụ: "Đồ án tốt nghiệp", "Tiếng Anh B2") để phân nhóm note. Khi đang mở một project, mọi note mới tự động thuộc project đó — không cần chọn lại mỗi lần. Chuyển project được một chạm. Note không gán project nào thì vào Inbox.

---

## 6. Phân rã tri thức thành Atom

Sau khi lưu note, hệ thống tự động phân tích và tách nội dung thành các hạt tri thức nhỏ — gọi là **atom**. Mỗi atom là một mệnh đề, định nghĩa, dữ kiện, hoặc quan hệ độc lập. Các atom hiện ra dần trong panel bên cạnh editor (streaming), kèm badge phân loại và highlight ngược về đoạn gốc trong note.

Người dùng có thể:
- **Gộp** hai atom thành một nếu thấy quá vụn
- **Tách** một atom ra nếu thấy quá gộp
- **Sửa** nội dung atom
- **Bỏ qua** atom không cần thiết

---

## 7. Phát hiện trùng lặp & mâu thuẫn

Khi atom mới được tạo, hệ thống so sánh với toàn bộ atom của người dùng. Nếu phát hiện nội dung gần giống (duplicate) hoặc mâu thuẫn về ngữ nghĩa, hệ thống hiển thị gợi ý cùng trích dẫn cả hai phiên bản. Người dùng chọn: giữ cả hai, gộp lại, chọn phiên bản đúng, hoặc bỏ qua.

---

## 8. Ôn tập chủ động (Active Recall)

Mỗi ngày hệ thống chọn ra một tập atom sắp bị quên và hiển thị thành các câu hỏi trên trang Recall. Câu hỏi có nhiều dạng khác nhau để tránh học vẹt: điền vào chỗ trống (cloze), định nghĩa ngược, câu hỏi ứng dụng. Người dùng đọc câu hỏi, tự trả lời, rồi đánh giá độ nhớ theo 4 mức: **Again / Hard / Good / Easy**.

Dựa trên đánh giá đó, hệ thống tự tính thời điểm nhắc lại tiếp theo cho từng atom — atom nhớ tốt thì nhắc thưa hơn, atom hay quên thì nhắc dày hơn.

Badge trên thanh điều hướng hiển thị số atom cần ôn hôm nay. Có thể bỏ qua cả ngày ("Hôm nay bận") mà không bị phạt.

---

## 9. Atom Dormant (Tạm ngủ đông)

Người dùng có thể đánh dấu một atom hoặc cả chủ đề là "dormant" khi không muốn bị nhắc nữa (ví dụ: chủ đề học xong kỳ thi). Atom dormant không xuất hiện trong recall hằng ngày, nhưng không bị xoá. Khi người dùng viết note mới về chủ đề liên quan, hệ thống tự gợi ý "hồi sinh" atom đó.

---

## 10. Surfacing trong lúc viết

Trong khi người dùng đang gõ note, panel bên cạnh editor tự động đẩy lên 3–5 atom liên quan từ kho tri thức cũ — không cần tìm kiếm thủ công. Mỗi gợi ý kèm lý do ngắn: "Sắp quên", "Mâu thuẫn với ghi chú cũ", "Liên quan tới bản nháp", "Đã lâu không xem".

Người dùng có thể chèn atom vào note đang viết, mở xem chi tiết, hoặc bỏ qua. Atom đã bỏ qua trong phiên làm việc đó sẽ không lặp lại.

---

## 11. Trang chi tiết Atom

Mỗi atom có trang riêng hiển thị đầy đủ: nội dung, loại, note gốc (với highlight đoạn tương ứng), lịch sử ôn tập, và danh sách các atom liên quan. Từ đây người dùng có thể sửa nội dung, sinh lại câu hỏi, chia nhỏ, hoặc gộp với atom khác.

---

## 12. Lịch ôn cá nhân hoá (FSRS per-user)

Sau một thời gian dùng đều, hệ thống học được nhịp ghi nhớ riêng của từng người — ai quên nhanh, ai nhớ lâu, ai mạnh môn nào. Lịch ôn tự điều chỉnh theo dữ liệu thực tế của từng người thay vì dùng thông số mặc định. Trang `/me` cho thấy profile nhận thức hiện tại: độ chính xác theo loại câu hỏi, thời điểm ôn hiệu quả nhất, xu hướng granularity.

---

## 13. Giải thích lý do (Explainability)

Mọi gợi ý từ hệ thống — dù là atom surfacing, câu hỏi recall, hay cảnh báo mâu thuẫn — đều kèm theo dòng giải thích ngắn bằng ngôn ngữ tự nhiên. Trang profile hiển thị rõ hệ thống đang dùng thông số gì cho người dùng hiện tại và được fit lại lần cuối khi nào.

---

## Tính năng P1 (sau MVP)

| Tính năng | Mô tả ngắn |
|---|---|
| Web Clip Extension | Clip đoạn văn từ trình duyệt thẳng vào Leafnote, kèm URL nguồn |
| Import Markdown / Notion | Upload `.zip` Markdown để nhập kho ghi chú cũ, tự phân loại vào project |
| Câu hỏi thích nghi | Tự giảm/tăng tần suất loại câu hỏi dựa trên điểm mạnh/yếu của từng người |
| Granularity thích nghi | Tự điều chỉnh độ chi tiết khi phân rã dựa trên phản hồi người dùng |
| Knowledge Graph | Visualize toàn bộ atom theo cụm chủ đề, xem sự tiến hoá theo thời gian |
| Gap Detection | Phát hiện khái niệm được nhắc nhiều nhưng chưa có định nghĩa rõ ràng |
| Note Local-only | Đánh dấu note không gửi qua AI cho nội dung nhạy cảm |
