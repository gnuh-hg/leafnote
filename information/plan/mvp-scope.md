# MVP Scope — Leafnote

> **Mục đích file**: Khoá phạm vi MVP. Khi user / Claude phân vân "có làm cái này trong MVP không?", câu trả lời nằm ở đây — không nằm ở ý tưởng mới hay user-stories.md. user-stories liệt kê **mọi mong muốn**; file này liệt kê **những gì sẽ được code trong MVP**.
> **Liên quan**: [`project-overview.md`](../project-overview.md), [`user-stories.md`](../user-stories.md), [`../../ROADMAP.md`](../../ROADMAP.md), [`../../PHASE.md`](../../PHASE.md).

---

## Định nghĩa MVP

Một bản chạy được **end-to-end** chứng minh được **personalization loop** — đủ để demo cho ban giám khảo cuộc thi và cho 3–5 user thử thật.

Cụ thể MVP đạt khi: **một user dùng Leafnote ≥ 2 tuần với ≥ 50 lượt review thật, và hệ thống cho thấy lịch ôn / surfacing đã thay đổi rõ rệt so với cấu hình mặc định ban đầu, được hiển thị minh bạch trên trang `/me/cognitive-profile`.**

---

## Vòng lặp tối thiểu phải chạy được (core loop)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────────┐
│ Capture │ ──▶ │ Atomic  │ ──▶ │ Review  │ ──▶ │Surfacing │ ──▶ │Personalization│
│         │     │ Engine  │     │  (FSRS) │     │ context  │     │     fit       │
└─────────┘     └─────────┘     └─────────┘     └──────────┘     └──────┬───────┘
       ▲                                                                  │
       └──────────────────── feeds back ──────────────────────────────────┘
```

Nếu **bất kỳ mắt xích nào** không chạy được, đó **không phải MVP**.

---

## Các story P0 nằm trong MVP

Tham chiếu mã trong [`user-stories.md`](../user-stories.md).

### Bắt buộc (đường găng)

| ID | Story | Lý do bắt buộc |
|---|---|---|
| S-1.1 | Đăng ký nhanh | Không vào được app thì không có gì cả |
| S-1.2 | Demo "atom là gì" | Người dùng phải hiểu khái niệm để dùng đúng |
| S-1.3 | Tạo project đầu | Relevance axis cần ngữ cảnh |
| S-2.1 | Gõ note mobile | Capture chính |
| S-2.2 | Voice → STT → note | Yếu tố thi: mobile + AI nhập liệu |
| S-2.3 | Ảnh → OCR → note | Yếu tố thi: mobile + AI nhập liệu |
| S-2.6 | Auto-attach project khi capture | Để relevance hoạt động |
| S-3.1 | Atoms streaming sau capture | **Đây là core feature** |
| S-3.2 | Phát hiện duplicate / contradicts | Chứng minh AI hiểu nội dung |
| S-3.3 | Recall hằng ngày mobile | Nhánh retention |
| S-3.4 | Câu hỏi đa dạng | Không học vẹt = chấm cao hơn |
| S-3.5 | Surfacing chủ động khi viết | Chứng minh hệ thống "biết lúc cần" |
| S-3.6 | Dormant ↔ active | Phân biệt với spaced repetition thuần |
| S-3.7 | Chi tiết atom (lịch sử, nguồn) | Minh bạch dữ liệu |
| S-4.1 | Lịch ôn cá nhân hoá rõ rệt | **Tiêu chí thành công #1** |
| S-4.6 | Personalization minh bạch (giải thích lý do surfacing) | Yếu tố thi: AI explainability |
| S-X.1 | Xoá tài khoản & dữ liệu | Compliance tối thiểu |
| S-X.4 | Hiệu năng tối thiểu | Demo không lag |

### Đẹp-có (nice-to-have, làm nếu kịp)

| ID | Story | Lý do hoãn được |
|---|---|---|
| S-1.4 | QR đăng nhập mobile | Có thể đăng nhập tay |
| S-X.3 | Sync web ↔ mobile realtime | Có thể chấp nhận refresh tay 1–2s |
| S-5.1 | Bản đồ tri thức tiến hoá | Đẹp nhưng không cần để chứng minh personalization |

### Ngoài MVP (Out of scope)

| ID | Story | Lý do |
|---|---|---|
| S-2.4 | Web clip extension | Phức tạp + ngoài đường găng |
| S-2.5 | Import Markdown / Notion | Tốn thời gian, không demo được trên live |
| S-4.2 | Format câu hỏi thích nghi | Cần dataset đủ lớn |
| S-4.3 | Granularity decompose tự điều chỉnh | Tinh chỉnh sau khi có dữ liệu |
| S-4.4 | Surfacing weights tự xoay theo phase project | Tinh chỉnh sau |
| S-4.5 | Peak hours notification | Cần ≥ 2 tuần dữ liệu user thật |
| S-5.2 | Phát hiện gap kiến thức | Job nightly nặng, hoãn |
| S-5.3 | Hồi sinh dormant atom | Nâng cao sau MVP |
| S-5.4, S-5.5 | Export curated / báo cáo retrospective | Polish phase |
| S-X.2 | Local-only note (skip AI) | Compliance nâng cao |
| S-X.5 | Accessibility hoàn chỉnh | Polish phase |

---

## Bề mặt sản phẩm tối thiểu (UI surface)

### Web (5 màn)

1. **Auth** — đăng ký / đăng nhập / xoá tài khoản.
2. **Workspace** — sidebar projects + list note + editor (Tiptap) + atom panel + surfacing panel.
3. **Atom detail** — text, lịch sử review, links, project relevance, các nút sửa.
4. **Profile** (`/me/cognitive-profile`) — minh bạch personalization, weights, peak hours, accuracy.
5. **Settings** — locale, timezone, granularity_pref, xoá tài khoản.

> **Không có trong MVP web**: graph view, gaps page, conflicts inbox riêng (gộp vào atom panel).

### Mobile (4 màn)

1. **Auth + onboarding** (3 step skippable).
2. **Capture** — text editor + nút voice + nút ảnh + chọn project.
3. **Recall feed** — swipe trả lời câu hỏi.
4. **Profile** — minh bạch personalization (read-only mirror của web).

> **Không có trong MVP mobile**: graph, search, settings nâng cao (push về web).

---

## Bề mặt API tối thiểu (xem chi tiết high-level trong [`api-spec.md`](../api-spec.md))

Bắt buộc:

- Auth: `/auth/exchange`, `/me`.
- Projects: CRUD + `:activate`.
- Notes: `POST /notes` (text + voice + image), `GET /notes/{id}/stream`, `GET /notes/{id}`, `PATCH`, `DELETE`.
- Atoms: list, detail, patch, dismiss/revive, merge, split.
- Atom links: list, decide.
- Recall: today, answer, skip, stats.
- Surfacing: contextual, served, interact, daily.
- Personalization: cognitive-profile (GET + PATCH cơ bản), fsrs-params (GET).
- Events: batch.

Hoãn: search hybrid, graph endpoints, gaps, knowledge conflicts riêng, import/export, regenerate-questions.

---

## Bảng DB tối thiểu

Migration M001 → M005 (xem [`database-schema.md`](../database-schema.md)).
**Không có** trong MVP: materialized view graph snapshot, partitioning events theo tuần, multi-model embedding columns.

---

## Tiêu chí "MVP đã xong"

Tất cả các điều kiện sau **phải** đúng:

1. **End-to-end chạy thật**: Tác giả dùng Leafnote thay Notion/Obsidian cho ≥ 2 tuần, không xài tool khác.
2. **≥ 3 user thử**: Mỗi người dùng ≥ 1 tuần, capture ≥ 30 note, review ≥ 50 atom.
3. **Personalization fit thành công**: Mỗi user có `user_fsrs_params.fitted_at` không null, weights khác mặc định.
4. **Demo A/B**: Cùng 1 note input → 2 user → kết quả surfacing / lịch ôn / câu hỏi sinh ra **khác nhau rõ rệt** (có screenshot/video).
5. **Latency**: capture text < 300ms (excl. AI), recall answer ack < 200ms, surfacing contextual < 800ms (P95).
6. **Crash-free**: ≥ 99% session theo Sentry trên cả web và mobile.
7. **Tài liệu thi**: slide + demo video + bài giải thích cơ chế personalization (ngắn).

Nếu thiếu **bất kỳ tiêu chí nào** → chưa phải MVP, không demo thi.

---

## Rủi ro chính & cắt giảm dự phòng

| Rủi ro | Khả năng | Tác động | Phản ứng |
|---|---|---|---|
| Cost LLM vượt ngân sách (decompose + Q-gen + surfacing nhiều token) | Cao | Cao | Cache aggressive, batch decompose, dùng model nhỏ cho `surfacing/contextual` (re-rank thôi) |
| pgvector HNSW chậm trên Supabase free | Trung | Trung | Fallback IVFFlat hoặc tăng Postgres tier; giới hạn k-NN ≤ 50 |
| STT tiếng Việt chất lượng thấp | Trung | Cao | Cho phép user "Sửa transcript" trước khi decompose; cân nhắc `whisper-large-v3` thay `tiny` |
| Personalization khó "thấy được" sau 2 tuần | Cao | **Rất cao** (mất tiêu chí thi) | Pha demo: nạp synthetic data của 2 user-mock có hành vi đối lập để show A/B trong slide |
| Mobile build EAS fail vào lúc thi | Thấp | Cao | Có web responsive thay thế dự phòng |

---

## Quyết định cần đưa ra trước khi rời pre-project

Các quyết định khoá MVP scope:

1. ✅ **Đường găng M1→M2→M3→M4→M6** (đã chốt trong ROADMAP).
2. ⬜ Quyết định LLM provider chính (OpenAI vs Anthropic) — ảnh hưởng cost & quality VI.
3. ⬜ Quyết định monorepo vs đa repo.
4. ⬜ Wireframe 5 màn web + 4 màn mobile (giấy hoặc Figma).
5. ⬜ Có làm graph view trong MVP không? — đề xuất: **không**, hoãn sau M6.

→ Khi cả 5 ô tick, chuyển phase từ `pre-project` → `scaffolding`.
