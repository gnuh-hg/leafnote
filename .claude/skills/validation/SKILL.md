---
name: validation
description: "Validation patterns for Leafnote — Pydantic v2 on backend, Zod/React Hook Form on frontend. Use when adding form validation or API input validation."
---

# Validation — Leafnote

## Backend: Pydantic v2

```python
from pydantic import BaseModel, Field, field_validator

class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default="", max_length=100_000)

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        return v.strip()
```

FastAPI returns `422 Unprocessable Entity` automatically when validation fails.
Response shape: `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}`

## Frontend: Form Validation

Since shadcn/ui is not installed, use controlled inputs with inline validation:

```tsx
const [error, setError] = useState('');

function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!title.trim()) {
    setError(t('notes.error.title_required'));
    return;
  }
  setError('');
  // proceed
}
```

Error messages must use `t()` — never hardcode strings.

## API Error Display Pattern

```tsx
// Show backend validation errors in the UI
try {
  await createNote(data);
} catch (err) {
  if (err.status === 422) {
    const detail = err.body?.detail?.[0]?.msg ?? t('common.error.invalid_input');
    setError(detail);
  } else {
    showError(t('common.error.server'));
  }
}
```

## What NOT to Validate

- Internal IDs passed between services — trust them
- JWT claims after `get_current_user` runs — already verified
- Types that TypeScript already enforces at compile time
