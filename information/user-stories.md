# User Stories — Leafnote

> Định dạng: **Là [persona], tôi muốn [hành vi], để [giá trị].**
> Mỗi story kèm **Acceptance Criteria** dạng Given-When-Then, **mức ưu tiên** (P0 = MVP, P1 = sau MVP gần, P2 = tương lai), và **liên kết tới feature** trong `project-overview.md`.

---

## Personas

### P1 — Minh, học sinh chuyên (16 tuổi)

- Học 6–8 môn song song, ôn thi học sinh giỏi.
- Ghi chú trên cả điện thoại (trong giờ học, gõ nhanh) và laptop (buổi tối, edit kỹ).
- Vấn đề chính: **viết rất nhiều nhưng không nhớ**, đặc biệt là kiến thức từ tháng trước.
- Mong muốn: hệ thống tự nhắc và tự kiểm tra, không phải chủ động lập flashcard.

### P2 — Hà, sinh viên năm cuối (22 tuổi), làm đồ án + thực tập

- Quản lý đồng thời 2 ngữ cảnh: đồ án tốt nghiệp & dự án ở công ty.
- Đọc nhiều paper, ghi chú từ web/PDF.
- Vấn đề: ghi chú lẫn lộn giữa các ngữ cảnh, mở lại không nhớ thuộc dự án nào.

### P3 — Quân, kỹ sư phần mềm (28 tuổi), self-learner

- Học chủ đề mới (rust, system design) song song công việc.
- Đã quen Notion/Obsidian, đang tìm thứ "ít công sức tổ chức hơn".
- Vấn đề: graph Obsidian phải tự link, Notion không nhắc ôn.

### P4 — Lan, giáo viên / nghiên cứu (35 tuổi)

- Tổng hợp tài liệu giảng dạy nhiều năm.
- Vấn đề: tri thức cũ bị "đóng băng" trong file, không tái dùng khi dạy lớp mới có chủ đề lân cận.

---

## Hành trình tổng quát (epic map)

```
Onboarding → Capture → Decompose & Review → Personalization mature → Long-term knowledge
   E1          E2           E3                    E4                       E5
```

- **E1 Onboarding** — đăng ký, giới thiệu khái niệm "atom", tạo project đầu, capture note đầu.
- **E2 Capture** — đa kênh, đa nền tảng, không ma sát.
- **E3 Decompose & Review** — atomic engine + active recall + surfacing trong editor.
- **E4 Personalization mature** — sau 2–4 tuần, hệ thống thể hiện rõ là "đã hiểu user".
- **E5 Long-term knowledge** — sau tháng thứ 3, graph có giá trị retrospective: phát hiện gap, chủ đề lạnh, mâu thuẫn.

---

# E1 — Onboarding

### S-1.1 Đăng ký nhanh, không hỏi nhiều

**Là** Minh, **tôi muốn** đăng ký bằng email/Google trong dưới 30 giây, **để** bắt đầu ghi chú ngay không bị chặn.

- **AC1**: Given trang landing, When chọn "Đăng ký bằng Google", Then sau OAuth quay về app đã có user mirror, locale=`vi`, timezone=device.
- **AC2**: Given user mới, When vào lần đầu, Then thấy tối đa 3 màn onboarding (atom là gì → demo capture → tạo project đầu) — có thể skip.
- **AC3**: Given đã skip onboarding, When về home, Then có 1 project mặc định "Inbox" và 1 note mẫu giải thích cách hoạt động.
- **Ưu tiên**: P0.

### S-1.2 Hiểu khái niệm "atom" qua ví dụ trực quan

**Là** Hà, **tôi muốn** xem một ví dụ note → atoms thật, **để** hiểu vì sao Leafnote khác Notion.

- **AC1**: Onboarding screen 2 hiển thị note mẫu 4 dòng + side panel hiện 5 atoms được tách ra, kèm highlight ngược về dòng gốc.
- **AC2**: Có nút "Thử với note của bạn" → mở capture trực tiếp.
- **AC3**: Không buộc xem hết — luôn có "Bỏ qua".
- **Ưu tiên**: P0.

### S-1.3 Tạo project đầu tiên

**Là** Hà, **tôi muốn** tạo project "Đồ án tốt nghiệp" ngay khi onboarding, **để** atom đầu tiên đã có ngữ cảnh.

- **AC1**: Onboarding screen 3 có form 1 trường `name` + chọn màu.
- **AC2**: Skip được; nếu skip, mọi note vào "Inbox".
- **Ưu tiên**: P0.

### S-1.4 ~~Cài app mobile từ link đăng nhập web~~

> **Out of scope** — chỉ có web app, không có mobile app.

---

# E2 — Capture (đa kênh, đa nền tảng)

### S-2.1 Gõ note nhanh trên web

**Là** Minh, **tôi muốn** mở app, gõ note ngay trong dưới 2 giây, **để** không quên ý trong giờ học.

- **AC1**: Cold start ≤ 2s tới editor focus (đo trên thiết bị tham chiếu).
- **AC2**: Auto-save mỗi 2 giây hoặc on blur.
- **AC3**: Offline → lưu local queue → sync khi online; UI hiện "đang chờ đồng bộ".
- **AC4**: Sau khi gõ xong, không bắt user đặt tiêu đề; nếu trống, AI sinh tiêu đề khi xử lý xong.
- **Ưu tiên**: P0.

### S-2.2 Ghi âm và để hệ thống chuyển thành note

**Là** Quân, **tôi muốn** nói trong giờ chạy bộ, **để** ý tưởng không mất.

- **AC1**: Nút mic to, một chạm để bắt đầu/dừng; tối đa 5 phút mỗi đoạn.
- **AC2**: Audio raw lưu trong attachments; STT chạy nền; transcript là `content_md` của note.
- **AC3**: Trong khi STT chạy, note vẫn hiển thị với placeholder "Đang chuyển giọng nói…".
- **AC4**: Sau STT, user có thể click "Sửa transcript" trước khi pipeline decompose chạy (debounce 30s).
- **Ưu tiên**: P0.

### S-2.3 Chụp ảnh whiteboard / sách

**Là** Hà, **tôi muốn** chụp slide bài giảng, **để** không phải gõ tay.

- **AC1**: Cho phép chụp tối đa 5 ảnh ghép thành 1 note.
- **AC2**: OCR + pass LLM sửa lỗi nhận dạng tiếng Việt (dấu, ký hiệu toán).
- **AC3**: Ảnh gốc lưu để user chỉnh tay nếu OCR sai.
- **Ưu tiên**: P0.

### S-2.4 Web clip từ extension

**Là** Quân, **tôi muốn** clip một đoạn từ blog đang đọc, **để** giữ kèm nguồn.

- **AC1**: Extension Chrome gửi `selection_html` + `url` → API.
- **AC2**: Note tự gắn `source_ref` là URL; atom decompose vẫn chạy.
- **Ưu tiên**: P1.

### S-2.5 Import file Markdown / Notion / Obsidian

**Là** Lan, **tôi muốn** đổ kho ghi chú cũ vào Leafnote, **để** không bắt đầu từ con số 0.

- **AC1**: Upload `.zip` Markdown, mỗi folder thành project, mỗi file thành note.
- **AC2**: Pipeline decompose chạy theo batch, có thanh tiến độ; có thể tắt để xử lý dần (background).
- **AC3**: Sau import, surfacing tạm tắt 24h để tránh "spam" atom mới.
- **Ưu tiên**: P1.

### S-2.6 Tự chuyển project khi capture từ ngữ cảnh

**Là** Hà, **tôi muốn** capture trong khi đang mở project "Đồ án", **để** note tự thuộc project đó.

- **AC1**: Active session có `active_project_id`; mọi capture từ session đó mặc định gán project ấy.
- **AC2**: User có thể thay đổi 1 chạm trước khi save.
- **AC3**: Nếu không có session active, vào Inbox.
- **Ưu tiên**: P0.

---

# E3 — Decompose & Review (Core Loop)

### S-3.1 Xem atoms được tách ra từ note

**Là** Minh, **tôi muốn** thấy ngay note vừa viết được tách thành những hạt gì, **để** tin rằng hệ thống "hiểu" nội dung.

- **AC1**: Trong vòng 10s sau khi save (note ≤ 500 từ), atoms hiện ra dần dần (streaming) trong panel cạnh editor.
- **AC2**: Mỗi atom có badge `kind` (định nghĩa / mệnh đề / quan hệ / dữ kiện).
- **AC3**: Click atom → highlight đoạn gốc trong note.
- **AC4**: User có thể "Gộp lại" / "Tách thêm" / "Sửa text" / "Bỏ qua" mỗi atom.
- **Ưu tiên**: P0.

### S-3.2 Hệ thống đề xuất atom trùng / mâu thuẫn

**Là** Hà, **tôi muốn** được cảnh báo khi viết câu mâu thuẫn với ghi chú cũ, **để** không tự lừa mình bằng kiến thức sai.

- **AC1**: Khi atom mới được tạo và similarity ≥ ngưỡng `T_dup` với atom cũ → đề xuất `duplicate`.
- **AC2**: Khi LLM phát hiện mâu thuẫn ngữ nghĩa → đề xuất `contradicts`, kèm trích dẫn cả hai.
- **AC3**: User chọn: giữ cả hai / merge / chọn phiên bản đúng / để sau.
- **AC4**: Quyết định ghi vào `events` để personalization học ngưỡng nhạy của user.
- **Ưu tiên**: P0.

### S-3.3 Active recall hằng ngày trên web

**Là** Minh, **tôi muốn** vào trang recall sáng có sẵn 10–20 câu hỏi, **để** ôn nhanh trước giờ học.

- **AC1**: Badge trên nav "Hôm nay có N hạt cần ôn".
- **AC2**: Trang recall feed — mỗi câu hiển thị prompt; click để xem đáp án; chọn 1 trong 4 mức Again/Hard/Good/Easy.
- **AC3**: Sau khi trả lời, FSRS update + animation feedback (đúng/sai/streak).
- **AC4**: Có thể skip cả batch ("Hôm nay bận") — không phạt FSRS, chỉ trừ relevance ưu tiên.
- **Ưu tiên**: P0.

### S-3.4 Câu hỏi đa dạng, không nhàm

**Là** Quân, **tôi muốn** câu hỏi mỗi ngày khác kiểu (cloze / định nghĩa ngược / ứng dụng), **để** không học vẹt.

- **AC1**: Mỗi atom có ≥ 2 câu hỏi khác `qtype` được sinh sẵn.
- **AC2**: Nếu user trả lời đúng dạng `cloze` 3 lần liên tiếp cho cùng atom → ưu tiên dạng khác.
- **AC3**: User có thể "Câu này tệ — sinh lại" (rate-limited).
- **Ưu tiên**: P0.

### S-3.5 Surfacing chủ động khi đang viết

**Là** Hà, **tôi muốn** trong lúc viết note đồ án, hệ thống đẩy lên các atom liên quan tôi đã viết tháng trước, **để** không lặp lại hoặc bỏ sót.

- **AC1**: Editor có panel phụ; sau mỗi 5–10s gõ (debounced), gửi `draft_text` + project context → trả về 3–5 atom.
- **AC2**: Mỗi gợi ý có "lý do": `due_soon`, `contradicts`, `related`, `dormant_revival`.
- **AC3**: User có thể: chèn vào draft / mở chi tiết / bỏ qua. Mỗi action ghi event.
- **AC4**: Atom đã `dismissed` trong session không lặp lại.
- **Ưu tiên**: P0.

### S-3.6 Đánh dấu atom thành dormant thay vì xoá

**Là** Quân, **tôi muốn** "ngủ đông" một chủ đề không còn hot (Rust async runtime), **để** không bị làm phiền nhưng không mất dữ liệu.

- **AC1**: Một chạm "Để sau" trong feed recall → atom `status='dormant'`.
- **AC2**: Atom dormant không vào recall hằng ngày, nhưng vẫn có thể nổi lên khi search hoặc `dormant_revival`.
- **AC3**: Sau ≥ 60 ngày dormant + một note mới có chủ đề liên quan → đề xuất "hồi sinh".
- **Ưu tiên**: P0.

### S-3.7 Xem chi tiết atom — lịch sử, gốc, link

**Là** Hà, **tôi muốn** xem một atom đầy đủ: nguồn gốc, lịch sử ôn, các atom liên quan, **để** tin tưởng và chỉnh sửa.

- **AC1**: Trang detail hiện: text, kind, origin (note + đoạn highlight), review history (≤ 30 lần gần nhất), link list, project relevances.
- **AC2**: Có nút "Sinh lại câu hỏi", "Chia atom", "Merge với…", "Edit text".
- **Ưu tiên**: P0.

---

# E4 — Personalization mature (sau 2–4 tuần dùng đều)

### S-4.1 Lịch ôn cá nhân hoá rõ rệt

**Là** Minh, **tôi muốn** sau 2 tuần thấy hệ thống nhắc tôi đúng nhịp tôi quên, **để** tin nó "hiểu mình".

- **AC1**: Sau ≥ 50 lượt review, FSRS được fit per-user; `user_fsrs_params.fitted_at` cập nhật.
- **AC2**: So với baseline FSRS mặc định, retention thực tế đạt ≥ `request_retention - 5%`.
- **AC3**: Trang `/me/cognitive-profile` hiện được sự khác biệt (so với mặc định) ở ≥ 2 chỉ số.
- **Ưu tiên**: P0.

### S-4.2 Format câu hỏi thích nghi với điểm mạnh/yếu

**Là** Quân, **tôi muốn** ít câu cloze hơn (tôi vốn giỏi nhớ từ khoá) và nhiều câu ứng dụng hơn, **để** học sâu chứ không học mặt chữ.

- **AC1**: Sau ≥ 30 lần trả lời mỗi `qtype`, hệ thống tính `accuracy_by_qtype`.
- **AC2**: Nếu user vượt 90% accuracy ở 1 qtype → giảm tần suất sinh dạng đó (sàn 10%).
- **AC3**: Nếu user dưới 50% ở 1 qtype → tăng tần suất + giảm độ khó (cloze ngắn hơn, application có hint).
- **Ưu tiên**: P1.

### S-4.3 Granularity decompose tự điều chỉnh

**Là** Lan, **tôi muốn** ghi chú nghiên cứu được tách ở mức tinh hơn so với ghi chú họp, **để** atom phù hợp ngữ cảnh.

- **AC1**: User profile có `granularity_pref: coarse|medium|fine`, mặc định `medium`.
- **AC2**: Nếu user thường xuyên (≥ 5 lần) "Gộp lại" atoms → đề xuất chuyển `coarse`; ngược lại "Tách thêm" → `fine`.
- **AC3**: User có thể override thủ công trong settings.
- **Ưu tiên**: P1.

### S-4.4 Surfacing weights điều chỉnh theo hành vi

**Là** Hà, **tôi muốn** trong giai đoạn viết đồ án, surfacing ưu tiên relevance hơn retention, **để** không bị làm phiền bởi atom môn khác sắp quên.

- **AC1**: Khi user mở 1 project liên tục ≥ 3 ngày → tăng tự động `surfacing_weights.relevance` lên 0.05 (giới hạn 0.7).
- **AC2**: Khi gần kỳ thi (user đánh dấu deadline trong project) → tăng `retention`.
- **AC3**: User thấy được weights hiện tại và có thể override.
- **Ưu tiên**: P1.

### S-4.5 Peak hours

**Là** Minh, **tôi muốn** notification recall đến đúng giờ tôi tỉnh táo (tối 9 giờ chứ không phải sáng), **để** trả lời tốt.

- **AC1**: Sau ≥ 2 tuần dữ liệu, tính `peak_hours` theo accuracy × thời gian phản hồi.
- **AC2**: Notification daily auto-shift về peak hour gần nhất chưa quá khuya.
- **Ưu tiên**: P1.

### S-4.6 Personalization minh bạch (explainability)

**Là** Quân, **tôi muốn** biết tại sao một atom được đẩy lên, **để** tin hệ thống không tuỳ tiện.

- **AC1**: Mỗi gợi ý surfacing có dòng "Vì: sắp quên (due trong 6h) + liên quan tới bản nháp đang viết (sim 0.78)".
- **AC2**: Trang `/me/cognitive-profile` hiển thị đầy đủ feature vector + thời điểm fit gần nhất.
- **Ưu tiên**: P0 (yếu tố thi: minh bạch AI).

---

# E5 — Long-term knowledge (tháng thứ 3 trở đi)

### S-5.1 Bản đồ tri thức tiến hoá

**Là** Lan, **tôi muốn** xem chủ đề nào của tôi đang phát triển, chủ đề nào đang nguội, **để** tự đánh giá lại hướng học.

- **AC1**: Trang Graph có toggle "Theo thời gian": slider tuần/tháng → hiển thị diff nodes_added / nodes_cooled.
- **AC2**: Mỗi cluster có nhãn AI sinh + size + heat (active/dormant).
- **Ưu tiên**: P1.

### S-5.2 Phát hiện gap kiến thức

**Là** Hà, **tôi muốn** thấy danh sách khái niệm tôi nhắc nhiều nhưng chưa định nghĩa, **để** lấp gap.

- **AC1**: Job nightly chạy entity extraction trên atoms của user → so với atoms `kind='definition'` → list khái niệm chưa có atom.
- **AC2**: Trang "Gaps" hiển thị + nút "Tạo atom định nghĩa" (mở editor pre-fill).
- **Ưu tiên**: P1.

### S-5.3 Hồi sinh atom dormant đúng lúc

**Là** Quân, **tôi muốn** khi viết note mới về Rust async, các atom Rust cũ tự nổi lên dù tôi đã "ngủ đông", **để** không phải tự nhớ là đã ghi rồi.

- **AC1**: Khi atom mới có embedding ≥ ngưỡng `T_revive` với atom dormant → đề xuất hồi sinh trong panel surfacing.
- **AC2**: User có thể "Hồi sinh" (status active, lịch FSRS reset như learning) hoặc "Để dormant".
- **Ưu tiên**: P1.

### S-5.4 Xuất "tri thức tinh" (curated export)

**Là** Lan, **tôi muốn** xuất các atom kind=definition của 1 cluster ra Markdown, **để** dùng làm tài liệu giảng dạy.

- **AC1**: Trên cluster view, nút "Xuất Markdown" → file có heading theo subcluster + atoms.
- **AC2**: Có toggle "Chỉ atom đã review ≥ 3 lần" để lọc atom còn nháp.
- **Ưu tiên**: P2.

### S-5.5 Báo cáo retrospective hằng quý

**Là** Quân, **tôi muốn** mỗi 90 ngày nhận một bản tổng kết: bao nhiêu atom, retention thật, cluster tăng/giảm, **để** nhìn lại bản thân học gì.

- **AC1**: Email + in-app notification ngày thứ 90 từ signup, sau đó mỗi 90 ngày.
- **AC2**: Báo cáo gồm chart + 3 atom "thay đổi cuộc đời" (tương tác cao nhất).
- **Ưu tiên**: P2.

---

# Cross-cutting

### S-X.1 Quyền riêng tư & dữ liệu

**Là** mọi user, **tôi muốn** xoá tài khoản và toàn bộ dữ liệu trong dưới 7 ngày, **để** an tâm.

- **AC1**: Settings → "Xoá tài khoản" → xác nhận 2 bước → mark `deleted_at` ngay, hard-delete sau 7 ngày.
- **AC2**: Trong 7 ngày có thể khôi phục.
- **Ưu tiên**: P0.

### S-X.2 Không gửi dữ liệu nhạy cảm cho LLM khi user opt-out

**Là** Lan (làm việc với tài liệu nội bộ trường), **tôi muốn** chọn note nào không được gửi qua LLM, **để** không vi phạm quy định.

- **AC1**: Mỗi note có toggle "Local-only" (skip decompose AI). Atom không được tạo cho note đó.
- **AC2**: Note local-only vẫn full-text searchable.
- **Ưu tiên**: P1.

### S-X.3 ~~Đồng bộ giữa web và mobile~~

> **Out of scope** — chỉ có web app, không có mobile app.

### S-X.4 Hiệu năng tối thiểu

**Là** mọi user, **tôi muốn** thao tác chính (mở app, save, recall) phản hồi nhanh, **để** không nản.

- **AC1**: P95 latency: capture text < 300ms (chưa kể AI), recall answer ack < 200ms, surfacing contextual < 800ms.
- **AC2**: Web first contentful paint < 1.5s.
- **Ưu tiên**: P0.

### S-X.5 Khả năng truy cập (accessibility)

**Là** mọi user, **tôi muốn** dùng được bằng bàn phím và screen reader, **để** không bị loại trừ.

- **AC1**: Mọi action có shortcut keyboard; Tab order hợp lý.
- **AC2**: ARIA label đủ trên mọi nút icon-only.
- **Ưu tiên**: P1.

---

## Bảng tổng hợp ưu tiên

| Epic | Story | Ưu tiên |
|---|---|---|
| E1 | 1.1, 1.2, 1.3 | P0 |
| E1 | 1.4 | P1 |
| E2 | 2.1, 2.2, 2.3, 2.6 | P0 |
| E2 | 2.4, 2.5 | P1 |
| E3 | 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7 | **P0 — toàn bộ là core loop** |
| E4 | 4.1, 4.6 | P0 |
| E4 | 4.2, 4.3, 4.4, 4.5 | P1 |
| E5 | 5.1, 5.2, 5.3 | P1 |
| E5 | 5.4, 5.5 | P2 |
| X | X.1, X.4 | P0 |
| X | X.2, X.3, X.5 | P1 |

**MVP scope** = tất cả P0. Đây là phạm vi tối thiểu để personalization loop có thể hình thành: capture → atom → review → surfacing → fit profile.
