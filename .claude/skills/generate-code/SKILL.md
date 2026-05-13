---
name: generate-code
description: "Guidelines for generating Leafnote-compliant code. Use when writing new components, endpoints, or services. Enforces naming, layer separation, i18n, and design-system rules."
---

# Generate Code — Leafnote Conventions

## Before Writing Any Code

1. Read `information/design-system.md` — if writing any UI
2. Read `information/api-spec.md` + `information/database-schema.md` — if writing backend
3. Check `ROADMAP.md` — confirm feature is in Phase 1 scope

## Frontend Checklist

```
□ Component in src/components/ — pure UI, no direct fetch
□ API calls via src/services/<domain>.ts only
□ All user-facing strings use useTranslation() — no hardcoded text
□ Colors/spacing from design-system.md — no arbitrary Tailwind values
□ Custom hooks start with "use", live in src/hooks/
□ New i18n keys added to BOTH locales/vi.json AND locales/en.json
□ No any types — explicit TypeScript everywhere
```

### Component Template

```tsx
import { useTranslation } from 'react-i18next';

interface Props {
  // explicit types, no any
}

export function MyComponent({ }: Props) {
  const { t } = useTranslation();

  return (
    <div className="...">  {/* design-system tokens only */}
      {t('namespace.key')}
    </div>
  );
}
```

## Backend Checklist

```
□ Business logic in services/<domain>.py — never in routes
□ Route handler is thin: parse input → call service → return response
□ Pydantic v2 schemas: model_config = {"from_attributes": True}
□ All env vars via settings (app/core/config.py)
□ Protected routes have: current_user: User = Depends(get_current_user)
□ Async SQLAlchemy: no lazy loading — use selectinload()
□ 404 check after scalar_one_or_none()
```

### Service + Route Template

```python
# services/notes.py
class NoteService:
    def __init__(self, session: AsyncSession): ...
    async def create(self, user_id: int, data: NoteCreate) -> Note: ...

# routes/notes.py
@router.post("/notes", response_model=NoteOut, status_code=201)
async def create_note(
    data: NoteCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    return await NoteService(session).create(current_user.id, data)
```

## What NOT to Do

- No `fetch()` directly in React components
- No `os.environ["KEY"]` in backend (use `settings.KEY`)
- No `// TODO` or placeholder comments in committed code
- No shadcn/ui (not installed) — use Tailwind + Lucide
- No lazy loading in async SQLAlchemy
