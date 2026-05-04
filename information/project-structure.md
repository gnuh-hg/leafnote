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
├── CONTRIBUTING.md            # Quy ước commit, PR (tạo khi cần)
├── .env.example               # Mẫu biến môi trường toàn monorepo
├── .gitignore
│
├── .claude/                   # Bộ nhớ làm việc của Claude
├── information/               # Tài liệu dự án
├── backend/                   # FastAPI + Celery (Python)
├── frontend/
│   ├── web/                   # React + Vite (web app)
│   └── mobile/                # React Native + Expo (mobile app)
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
├── tech-stack.md              # Công nghệ & lý do chọn
├── architecture.md            # Kiến trúc hệ thống (high-level)
├── api-spec.md                # API endpoints (high-level)
├── database-schema.md         # Schema DB (high-level)
├── user-stories.md            # Stories P0/P1/P2 theo persona
├── runbooks/                  # Xử lý sự cố vận hành (tạo khi deploy)
└── plan/
    ├── mvp-scope.md           # Phạm vi MVP chốt
    ├── milestones.md          # Mốc có deliverable & gate
    ├── backlog.md             # Tính năng chưa làm (tạo từ M1)
    ├── drafts/                # Spec chi tiết tham chiếu khi code
    │   ├── database-schema.draft.md
    │   └── api-spec.draft.md
    └── sprints/               # Kế hoạch sprint (tạo từng sprint khi bắt đầu)
        ├── sprint-01.md
        └── sprint-02.md
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
    │   └── security.py        # Verify Supabase JWT
    ├── api/
    │   └── v1/
    │       ├── router.py      # Gắn tất cả route groups
    │       └── routes/        # 1 file = 1 domain
    │           ├── auth.py
    │           ├── projects.py
    │           ├── notes.py
    │           ├── atoms.py
    │           ├── recall.py
    │           ├── surfacing.py
    │           └── me.py
    ├── models/                # SQLAlchemy ORM models (1 file = 1 domain)
    │   ├── user.py
    │   ├── project.py
    │   ├── note.py
    │   ├── atom.py
    │   ├── review.py
    │   └── event.py
    ├── schemas/               # Pydantic request/response schemas
    │   └── (cùng naming với models)
    ├── services/              # Business logic — LUÔN ĐỂ LOGIC Ở ĐÂY
    │   ├── ai/
    │   │   ├── client.py      # Abstraction LLMClient, Embedder, STT, OCR
    │   │   ├── decompose.py   # Prompt + parse atoms từ note
    │   │   ├── embed.py       # Gọi embedding API, ghi pgvector
    │   │   ├── link.py        # k-NN + phát hiện duplicate/contradicts
    │   │   └── recall_gen.py  # Sinh câu hỏi active recall
    │   ├── notes.py
    │   ├── atoms.py
    │   ├── scheduler.py       # FSRS per-atom + fit per-user
    │   ├── surfacing.py       # Context-aware ranking
    │   └── personalization.py # Fit cognitive profile
    └── workers/               # Celery tasks
        ├── celery_app.py      # Config Celery + Redis broker
        ├── pipeline.py        # decompose_note, embed_atoms, link_atoms, generate_recall
        └── nightly.py         # fit_fsrs, fit_profile, update_relevance
```

**Quy ước:**

- **Route không chứa business logic.** Route chỉ: validate input (Pydantic) → gọi service → trả response.
- **Biến môi trường chỉ đọc qua `core/config.py`**, không `import os` trực tiếp.
- **Mỗi domain** có file riêng trong `routes/`, `models/`, `schemas/`, `services/`.
- **AI workers idempotent**: mọi Celery task nhận `dedup_key`, skip nếu đã `done`.

---

## `frontend/web/` — React + Vite (web app)

```
frontend/web/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx                # Router (React Router v6), layout root
    ├── components/            # UI primitive tái sử dụng — không có business logic
    │   ├── atoms/             # AtomCard, AtomPanel, AtomBadge
    │   ├── editor/            # TiptapEditor, SurfacingPanel, AtomHighlight
    │   ├── recall/            # RecallCard, RatingBar
    │   ├── graph/             # KnowledgeGraph (Cytoscape/react-force-graph)
    │   └── ui/                # shadcn/ui overrides + custom primitives
    ├── pages/
    │   ├── AuthPage.tsx
    │   ├── WorkspacePage.tsx  # editor + atom panel + surfacing
    │   ├── AtomDetailPage.tsx
    │   ├── ProfilePage.tsx    # /me/cognitive-profile
    │   └── SettingsPage.tsx
    ├── hooks/                 # Custom hooks — bắt đầu bằng `use`
    │   ├── useAtoms.ts
    │   ├── useSurfacing.ts
    │   ├── useRecall.ts
    │   └── useSSE.ts          # Subscribe SSE pipeline events
    ├── services/              # Gọi API — KHÔNG fetch trực tiếp trong component
    │   ├── api.ts             # Axios/fetch instance + auth header
    │   ├── notes.ts
    │   ├── atoms.ts
    │   ├── recall.ts
    │   ├── surfacing.ts
    │   └── me.ts
    ├── stores/                # Zustand global state (session, active project)
    └── types/                 # TypeScript types — codegen từ OpenAPI schema
```

**Quy ước:**

- `components/` = UI thuần. Logic nghiệp vụ → hook hoặc service.
- API call → `services/`, không fetch trực tiếp trong component hay hook.
- Types trong `types/` được codegen tự động — không viết tay lại.

---

## `frontend/mobile/` — React Native + Expo

```
frontend/mobile/
├── package.json
├── app.json                   # Expo config
├── tsconfig.json
└── src/
    ├── App.tsx                # Navigation root (React Navigation)
    ├── screens/
    │   ├── AuthScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── CaptureScreen.tsx  # text + voice + ảnh
    │   ├── RecallFeedScreen.tsx
    │   └── ProfileScreen.tsx
    ├── components/            # UI component mobile-specific
    │   ├── RecallCard.tsx
    │   ├── VoiceRecorder.tsx
    │   └── ImageCapture.tsx
    ├── hooks/
    │   ├── useCapture.ts      # Gộp logic text / voice / image
    │   ├── useRecallFeed.ts
    │   └── useNotification.ts
    ├── services/              # Gọi API — share types với web qua shared/
    │   └── (mirror web/services nhưng dùng expo fetch)
    └── shared/                # Types & utils share được với web
        └── types/             # Symlink hoặc copy từ web/src/types/
```

**Lý do tách `web/` và `mobile/`** thay vì monorepo Expo Router:

- Editor web dùng Tiptap + DOM API — không chạy được trên RN.
- Graph view dùng Cytoscape — không chạy được trên RN.
- Share logic qua `services/` và `types/` là đủ; không cần Universal App phức tạp hơn.

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
| Trang mới web | Thêm vào `frontend/web/src/pages/` |
| Màn hình mới mobile | Thêm vào `frontend/mobile/src/screens/` |
| Celery task mới | Thêm vào `backend/app/workers/pipeline.py` hoặc `nightly.py` |
| Sprint mới | Tạo `information/plan/sprints/sprint-NN.md` |
| Thử nghiệm ý tưởng | Tạo trong `experiments/prototypes/<tên>/` |
| Migration DB mới | `alembic revision --autogenerate -m "M00N_<tên>"` |
