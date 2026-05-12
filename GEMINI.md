# Leafnote — Project Context & Instructions

> Intelligent note-taking application where knowledge is a tree, notes are branches, and AI decomposes them into "leaves" for optimal retention and surfacing.

## Project Overview

Leafnote is a smart note-taking system designed to help users capture information and recall it at the right time. It features a unique "leaf" concept where long notes are automatically decomposed into smaller, atomic units of knowledge (leaves) using AI.

### Core Architecture

- **Backend:** FastAPI (Python 3.11+) providing a REST API and managing an asynchronous AI pipeline.
- **Frontend:** React 18 (TypeScript) with Vite, Tailwind CSS, and Tiptap editor.
- **Database:** PostgreSQL with `pgvector` for storing notes, leaves, and vector embeddings.
- **Task Queue:** Celery + Redis for asynchronous AI tasks (STT, OCR, decomposition, embedding).
- **AI Stack:** Integration with LLMs (OpenAI/Anthropic), Whisper for STT, and FSRS for spaced repetition.
- **Auth:** Supabase Auth (JWT-based).

### Key Concepts

- **Notes:** The primary container for user input (text, voice, or image).
- **Leaves:** Atomic units of knowledge extracted from notes. Each leaf has its own retention and relevance state.
- **Surfacing:** The mechanism that brings relevant or "about to be forgotten" leaves back to the user within the editor or a recall feed.

---

## Building and Running

### Prerequisites

- Python 3.11+
- Node.js & npm
- PostgreSQL with `pgvector`
- Redis (for Celery)

### Backend Setup

```powershell
cd backend
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate
# Install dependencies
pip install -r requirements.txt
# Run the development server
uvicorn app.main:app --reload
```

### Frontend Setup

```powershell
cd frontend
# Install dependencies
npm install
# Run the development server
npm run dev
```

### Testing

- **Backend:** Run `pytest` in the `backend/` directory.
- **Frontend:** Run `npm test` or `vitest` (verify `package.json` for exact command).
- **Integration/E2E:** Located in the root `tests/` directory.

---

## Development Conventions

### General Principles

- **Documentation First:** All major decisions and architectural details are documented in the `information/` directory. Refer to `CLAUDE.md` as the primary guide.
- **Modern CLI Tools:** Prefer modern tools like `rg` (ripgrep), `fd`, `eza`, and `bat` in the Windows PowerShell environment.

### Backend (FastAPI)

- **Service Layer Pattern:** Business logic must reside in `backend/app/services/`, not in routes.
- **Pydantic V2:** Use Pydantic for data validation and settings management.
- **SQLAlchemy 2.0:** Use async sessions for database interactions.
- **Type Hinting:** Mandatory for all function signatures.

### Frontend (React)

- **Service Wrappers:** All API calls must go through `frontend/src/services/`.
- **Atomic Components:** Keep UI components in `components/` pure and logic-free.
- **State Management:** Use Zustand for global state (e.g., `authStore`).
- **Styling:** Follow the `information/design-system.md` using Tailwind CSS and shadcn/ui.

### Git & Collaboration

- **Branching:** Follow the roadmap and feature catalog (`information/features.md`).
- **Commit Messages:** Clear and concise, focusing on "why" rather than "what".
- **Impact Analysis:** Use `gitnexus` tools (if available/configured) to assess the blast radius of changes to existing symbols.

### Delegation Manual

To maintain efficiency and manage quotas, the Manager (Claude) follows these protocols via the Gemini CLI Orchestrator:

- **The 100-Token Rule:** If a task requires generating more than 100 lines of code or reading more than 5 files, it **must** be delegated to a worker.
- **Quota Management:** Use `node tools/scripts/rotate-workers.js --next` to switch API keys if a `429 Too Many Requests` error occurs.
- **Workflow Automation:** Standardized delegation procedures are defined in `.gemini/workflows/`:
  - `delegate-feature.md`: For new feature implementation.
  - `bulk-refactor.md`: For system-wide refactoring.
  - `sync-docs.md`: For keeping documentation up-to-date.

---

## Directory Structure Highlights

- `backend/`: FastAPI application code.
- `frontend/`: React application code.
- `information/`: Core project documentation (Architecture, API Spec, DB Schema).
- `.claude/`: Instructions, workflows, and memory for AI assistants.
- `prompts/`: Library of reusable AI prompts.
- `experiments/`: Prototypes and failed ideas.
- `tests/`: Unit, integration, and AI evaluation tests.

---

## Manager-Worker Architecture

To optimize performance and context usage, Leafnote uses a **Manager-Worker architecture**. Claude acts as the **Manager**, orchestrating high-level planning and review, while the Gemini CLI session acts as the **Orchestrator**, delegating specialized tasks to **Worker** sub-agents.

### Available Workers

Specialized worker definitions are located in `.gemini/agents/`:

- **`frontend-worker`**: Expert in React, TypeScript, and Tailwind CSS implementation.
- **`backend-worker`**: Specialist in FastAPI, Python, and SQLAlchemy service layer patterns.
- **`refactor-worker`**: Dedicated to code quality, optimization, and technical debt reduction.
- **`doc-worker`**: Technical writer and architect for knowledge management and mapping.

### Usage

**For the Orchestrator:**
Delegate tasks using `invoke_agent` with the specialized worker (e.g., `frontend-worker`, `backend-worker`) and provide the task details.

**For the User:**
You can directly invoke these workers in the terminal using the `@` syntax:
`@frontend-worker Create a new component for the Leaf detail view.`
