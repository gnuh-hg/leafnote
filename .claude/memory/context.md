# Context — Leafnote

## 2026-05-04 — Chuyển phase: `pre-project` → `scaffolding`

Tất cả tài liệu nền đã hoàn thành. Quyết định lớn được chốt trước khi vào code:

- **Web only**: bỏ hoàn toàn React Native / Expo mobile. Các tính năng voice, OCR, recall feed sẽ làm trên web (MediaRecorder API, file upload).
- **Cấu trúc đơn giản**: `backend/` + `frontend/` — không cần pnpm workspaces vì chỉ có 1 frontend.

Các quyết định còn lại được hoãn có chủ ý:

- LLM provider (OpenAI vs Anthropic) → chốt khi bắt tay M3 (Atomic Engine).
- pgvector HNSW test → làm spike trong M1.

Next milestone: **M1 — Scaffolding**. Gate: `/health` 200, web Vercel mở được + đăng nhập Supabase Auth, CI xanh.
