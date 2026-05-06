# Leafnote

> Hướng dẫn cài đặt và chạy Leafnote — ghi chú tự tách thành lá tri thức, tự quay lại đúng lúc bạn cần.

---

## Cách chạy

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Cấu trúc thư mục

```
my-app/
├── .claude/           # Cấu hình & bộ nhớ Claude
├── information/       # Tài liệu dự án (architecture, API spec, DB schema...)
├── tests/             # Unit, integration, AI evals
├── prompts/           # Thư viện prompt tái sử dụng
├── tools/             # Script tự động hóa
├── experiments/       # Prototype & ý tưởng thử nghiệm
├── backend/           # FastAPI (Python)
└── frontend/          # React + Vite + Tailwind CSS
```

Chi tiết đầy đủ: [`information/project-structure.md`](information/project-structure.md)

---

## Tài liệu

- [Kiến trúc hệ thống](information/architecture.md)
- [Tech stack](information/tech-stack.md)
- [API spec](information/api-spec.md)
- [Database schema](information/database-schema.md)
- [Lộ trình](ROADMAP.md)
- [Lịch sử plan](HISTORY.md)
