# Project Structure — Leafnote

> Cấu trúc **đích đến** khi đã code. Hiện tại (`pre-project`) chưa có `backend/`, `frontend/`, `tests/`.
> Tạo folder khi bắt đầu phase tương ứng — không tạo trước.

---

## Tổng quan

```
leafnote/
├── CLAUDE.md                  # Bản đồ cho Claude, quy tắc code
├── PHASE.md                   # Phase hiện tại & tiêu chí thoát
├── README.md                  # Giới thiệu, cách chạy (viết khi có cách chạy thật)
├── ROADMAP.md                 # Lộ trình theo milestone
├── CHANGELOG.md               # Lịch sử release (tạo sau release đầu)
├── HISTORY.md                 # Lịch sử plan đã thực hiện
├── .env.example               # Mẫu biến môi trường
├── .gitignore
│
├── .claude/                   # Bộ nhớ làm việc của Claude
├── information/               # Tài liệu dự án
├── backend/                    # FastAPI + Celery (Python)
├── frontend/                   # React + Vite (web app duy nhất)
├── tests/                     # Test tổng hợp (tạo từ M1)
└── experiments/               # Thử nghiệm nhanh (tạo khi cần)
```

---

## `.claude/` — Bộ nhớ làm việc Claude

```
.claude/
└── memory/
    ├── context.md             # Đang làm đến đâu, quyết định đã chốt
    ├── mistakes.md            # Lỗi đã gặp, tránh lặp (tạo khi gặp lỗi đầu)
    └── patterns.md            # Pattern code hay dùng (tạo khi rút ra được)
```

**Không có** `skills/`, `agents/`, `workflows/`, `hooks/` trong phase này — tạo khi thực sự cần, không tạo sẵn rỗng.

---

## `information/` — Tài liệu dự án

```
information/
├── project-overview.md        # Concept, MVP scope, success criteria
├── project-structure.md       # File này
├── design-system.md           # Màu sắc, typography, component pattern — nguồn chân lý UI
├── tech-stack.md              # Công nghệ & lý do chọn
├── architecture.md            # Kiến trúc hệ thống (high-level)
├── api-spec.md                # API endpoints (high-level)
├── database-schema.md         # Schema DB (high-level)
├── user-stories.md            # Stories P0/P1/P2 theo persona
└── runbooks/                  # Xử lý sự cố vận hành (tạo khi deploy)
```

---

## `backend/` — FastAPI (Python)

```
backend/
├── requirements.txt
├── requirements-dev.txt       # pytest, ruff, black, ...
├── .env.example
├── alembic.ini
├── alembic/
│   └── versions/              # Migration files M001, M002, ...
└── app/
    ├── main.py                # Entry point, khởi tạo FastAPI + CORS + Sentry
    ├── core/
    │   ├── config.py          # Settings đọc từ env (pydantic-settings)
    │   ├── database.py        # SQLAlchemy engine + session
    │   ├── auth.py            # get_current_user dependency (verify Supabase JWT)
    │   └── security.py        # Verify Supabase JWT
    ├── api/
    │   └── v1/
    │       ├── router.py      # Gắn tất cả route groups
    │       └── routes/        # 1 file = 1 domain
    │           ├── auth.py
    │           ├── projects.py
    │           ├── notes.py
    │           ├── leaves.py
    │           ├── recall.py
    │           ├── surfacing.py
    │           └── me.py
    ├── models/                # SQLAlchemy ORM models (1 file = 1 domain)
    │   ├── user.py
    │   ├── project.py
    │   ├── note.py
    │   ├── leaf.py
    │   ├── review.py
    │   └── event.py
    ├── schemas/               # Pydantic request/response schemas
    │   └── (cùng naming với models)
    ├── services/              # Business logic — LUÔN ĐỂ LOGIC Ở ĐÂY
    │   ├── ai/
    │   │   ├── client.py      # Abstraction LLMClient, Embedder, STT, OCR
    │   │   ├── decompose.py   # Prompt + parse leaves từ note
    │   │   ├── embed.py       # Gọi embedding API, ghi pgvector
    │   │   ├── link.py        # k-NN + phát hiện duplicate/contradicts
    │   │   └── recall_gen.py  # Sinh câu hỏi active recall
    │   ├── notes.py
    │   ├── leaves.py
    │   ├── scheduler.py       # FSRS per-leaf + fit per-user
    │   ├── surfacing.py       # Context-aware ranking
    │   └── personalization.py # Fit cognitive profile
    └── workers/               # Celery tasks
        ├── celery_app.py      # Config Celery + Redis broker
        ├── pipeline.py        # decompose_note, embed_leaves, link_leaves, generate_recall
        └── nightly.py         # fit_fsrs, fit_profile, update_relevance
```

**Quy ước:**

- **Route không chứa business logic.** Route chỉ: validate input (Pydantic) → gọi service → trả response.
- **Biến môi trường chỉ đọc qua `core/config.py`**, không `import os` trực tiếp.
- **Mỗi domain** có file riêng trong `routes/`, `models/`, `schemas/`, `services/`.
- **AI workers idempotent**: mọi Celery task nhận `dedup_key`, skip nếu đã `done`.

---

## `frontend/` — React + Vite (web app)

```
frontend/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx                # Router (React Router v6), layout root
    ├── components/            # UI primitive tái sử dụng — không có business logic
    │   ├── auth/              # LoginForm, SignupForm, ProtectedRoute, BrandingPanel, PasswordStrengthMeter
    │   ├── leaves/            # LeafCard, LeafPanel, LeafBadge
    │   ├── editor/            # TiptapEditor, SurfacingPanel, LeafHighlight
    │   ├── recall/            # RecallCard, RatingBar
    │   ├── graph/             # KnowledgeGraph (Cytoscape/react-force-graph)
    │   └── ui/                # shadcn/ui overrides + custom primitives
    ├── pages/
    │   ├── AuthPage.tsx
    │   ├── WorkspacePage.tsx  # editor + leaf panel + surfacing + voice/image capture
    │   ├── RecallPage.tsx     # recall feed hằng ngày
    │   ├── LeafDetailPage.tsx
    │   ├── ProfilePage.tsx    # /me/cognitive-profile
    │   └── SettingsPage.tsx
    ├── hooks/                 # Custom hooks — bắt đầu bằng `use`
    │   ├── useOnlineStatus.ts # Detect online/offline, reusable
    │   ├── useLeaves.ts
    │   ├── useSurfacing.ts
    │   ├── useRecall.ts
    │   └── useSSE.ts          # Subscribe SSE pipeline events
    ├── services/              # Gọi API — KHÔNG fetch trực tiếp trong component
    │   ├── auth.ts            # Supabase auth wrapper (signUp, signIn, signOut)
    │   ├── api.ts             # Axios/fetch instance + auth header
    │   ├── notes.ts
    │   ├── leaves.ts
    │   ├── recall.ts
    │   ├── surfacing.ts
    │   └── me.ts
    ├── lib/
    │   ├── supabase.ts        # Supabase client instance
    │   └── i18n.ts            # i18next config
    ├── stores/                # Zustand global state (session, active project)
    │   └── authStore.ts       # Auth state (user, session, loading)
    └── types/                 # TypeScript types — codegen từ OpenAPI schema
```

**Quy ước:**

- `components/` = UI thuần. Logic nghiệp vụ → hook hoặc service.
- API call → `services/`, không fetch trực tiếp trong component hay hook.
- Types trong `types/` được codegen tự động — không viết tay lại.


---

## `tests/` — Kiểm thử (tạo từ M1)

```
tests/
├── unit/                      # pytest (backend), Vitest (web)
├── integration/               # Test API thật với DB test
└── e2e/                       # Playwright (web flows quan trọng)
```

`ai-evals/` tạo khi cần đánh giá chất lượng decompose / recall / surfacing — không phải M1.

---

## `experiments/` — Thử nghiệm (tạo khi cần)

```
experiments/
└── prototypes/                # Mỗi thử nghiệm 1 folder, README ngắn ghi kết quả
```

Không commit code experiments vào nhánh `main` trừ khi chuyển thành feature thật.

---

## Khi nào thêm folder mới?

| Tình huống | Hành động |
|---|---|
| Domain mới (ví dụ: `notification`) | Thêm file vào `routes/`, `models/`, `schemas/`, `services/` — không tạo folder riêng |
| Trang mới web | Thêm vào `frontend/src/pages/` |
| Celery task mới | Thêm vào `backend/app/workers/pipeline.py` hoặc `nightly.py` |
| Sprint mới | Tạo file tạm trong `.claude/memory/` hoặc root |
| Thử nghiệm ý tưởng | Tạo trong `experiments/prototypes/<tên>/` |
| Migration DB mới | `alembic revision --autogenerate -m "M00N_<tên>"` |
