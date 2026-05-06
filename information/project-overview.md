# Project Overview — Leafnote

## Tên dự án

**Leafnote** — Ứng dụng ghi chú tự tách mỗi note thành những chiếc lá tri thức, mỗi lá có vòng đời riêng và tự quay lại đúng lúc bạn cần nhớ nhất.

> Tri thức của bạn là một cái cây — mỗi note là một cành, và từ mỗi cành AI tự tách ra những **chiếc lá** nhỏ, mỗi lá là một ý tưởng độc lập, có vòng đời riêng, tự nổi lên đúng lúc bạn cần nhớ lại nhất.

## Tagline

Ghi chú không chết. Tri thức quay lại đúng lúc.

## Vấn đề

Người dùng ghi chú rất nhiều, nhưng phần lớn ghi chú trở thành "nghĩa địa tri thức" — viết xong rồi quên, không bao giờ mở lại. Notion/ClickUp giúp tổ chức, Obsidian giúp liên kết thủ công, Mem.ai giúp tag, nhưng không công cụ nào đảm bảo người dùng **thực sự nhớ và tái sử dụng** những gì họ viết.

## Giải pháp cốt lõi

Leafnote tự tách mỗi note thành những **chiếc lá tri thức** nhỏ — mỗi lá chứa một mệnh đề, định nghĩa, dữ kiện, hoặc quan hệ độc lập. Mỗi lá có vòng đời riêng, được theo dõi theo hai trục:

- **Retention axis** — đường cong quên cá nhân hóa (FSRS fit per-user).
- **Relevance axis** — điểm liên quan với tag/chủ đề đang xem hoặc draft hiện tại.

Hệ thống chủ động đưa lá quay lại đúng thời điểm: khi sắp quên, khi liên quan tới văn cảnh đang viết, hoặc khi mâu thuẫn với lá mới.

## Đối tượng người dùng

- Học sinh / sinh viên ôn thi & học chuyên sâu nhiều môn.
- Researcher, nhà phát triển, knowledge worker phải xử lý lượng lớn tài liệu dài hạn.
- Người học tự định hướng (self-learner) cần duy trì tri thức nhiều lĩnh vực song song.

## Nền tảng

- **Web app** — editor thống nhất (text + voice + OCR trong cùng UI), leaf panel, recall feed, surfacing, tag-based filter.

## Phạm vi MVP

1. Leaf Engine (LLM-based decomposition + embedding).
2. FSRS scheduler cá nhân hóa.
3. Capture đa kênh (text, voice → STT, OCR ảnh).
4. Context-aware surfacing trong editor.
5. Active recall feed.
6. Knowledge graph viewer (web).

## Phạm vi loại trừ (out of scope MVP)

- Real-time collaboration đa người.
- Plugin marketplace.
- Offline-first sync nâng cao.
- Tích hợp bên thứ ba (Slack, Notion import phức tạp).

## Tiêu chí thành công (định lượng)

- Sau 3–6 tháng sử dụng, cùng một input note phải được Engine phân rã / ưu tiên / surfacing **khác nhau rõ rệt** giữa hai user khác nhau (đo bằng A/B nội bộ).
- Tỉ lệ recall đúng trong active recall feed tăng theo thời gian per-user.
- ≥40% lá được surfacing chủ động được người dùng tương tác (mở, edit, dismiss có chủ đích).

## Bối cảnh

Dự án thi khoa học kỹ thuật cấp học sinh (Việt Nam). Tham vọng cao về mặt khái niệm và personalization loop, nhưng phạm vi triển khai vẫn nằm trong khả năng một học sinh có nền tảng web + Supabase.
