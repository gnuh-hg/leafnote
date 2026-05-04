# Tech Stack — Leafnote

## Backend

- **Python 3.11+ / FastAPI** — async, type hint, dễ tích hợp pipeline AI.
- **Pydantic v2** — schema validation, settings.
- **SQLAlchemy 2.x + Alembic** — ORM + migration.
- **Celery + Redis** — queue tác vụ AI bất đồng bộ (decompose, embed, generate question).

**Lý do**: Atomic Engine cần nhiều tác vụ AI tốn thời gian; FastAPI + Celery cho phép tách lớp request đồng bộ và pipeline nền.

## Database

- **PostgreSQL 15+** (qua Supabase) — bảng quan hệ chính: notes, atoms, reviews, projects.
- **pgvector** — lưu embedding hạt (1536-dim hoặc 768-dim tuỳ model).
- **Supabase Auth** — xác thực email/OAuth.
- **Supabase Storage** — ảnh OCR, audio voice note.

**Lý do**: pgvector trong Postgres tránh phải vận hành thêm vector DB riêng (Pinecone/Weaviate). Phù hợp scope thi.

## AI / ML

- **LLM provider**: OpenAI / Anthropic API qua một abstraction layer trong `services/ai/` (cho phép swap provider).
- **Embedding**: `text-embedding-3-small` (OpenAI) hoặc `bge-m3` (self-host nếu cần Việt hoá).
- **STT (voice)**: Whisper API (cloud) cho MVP.
- **OCR**: Tesseract self-host hoặc Google Vision API.
- **FSRS**: thư viện `py-fsrs` — fit tham số per-user theo lịch sử review.

## Frontend (Web)

- **React 18 + Vite + TypeScript**.
- **TailwindCSS** + **shadcn/ui** — UI primitive nhất quán.
- **TanStack Query** — cache & sync state với backend.
- **Tiptap (ProseMirror)** — editor hỗ trợ inline atom highlight, mention, slash command.
- **Cytoscape.js** hoặc **react-force-graph** — visualize knowledge graph.

## Frontend (Mobile)

- **React Native + Expo** — share tối đa logic (services, types) với web.
- **expo-speech / expo-av** — voice capture.
- **expo-camera + expo-image-picker** — OCR input.
- **expo-notifications** — đẩy active recall feed hằng ngày.

**Lý do chọn React Native thay vì Flutter**: tận dụng nền tảng JS/TS đã có ở web, share schema và API client.

## DevOps

- **Backend hosting**: Railway / Fly.io / Render (FastAPI + Celery worker + Redis).
- **Frontend web**: Vercel / Cloudflare Pages.
- **Mobile build**: EAS Build (Expo).
- **CI/CD**: GitHub Actions — lint, test, deploy preview.

## Observability

- **Sentry** — error tracking cả web/mobile/backend.
- **PostHog** — sản phẩm analytics + funnel personalization (đo loop AI).

## Development

- **Lint/Format**: ruff + black (Python), ESLint + Prettier (TS).
- **Test**: pytest (backend), Vitest (web), Jest + RNTL (mobile), Playwright (E2E web).
- **Type-share**: code-gen TypeScript types từ Pydantic schema (e.g. `datamodel-code-generator` hoặc OpenAPI).
