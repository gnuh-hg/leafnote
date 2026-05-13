---
name: optimize
description: "Performance optimization checklist for Leafnote. Use before major releases or when the app feels slow. Covers React re-renders, TanStack Query caching, SQLAlchemy N+1, and bundle size."
---

# Optimize — Leafnote Performance

## Frontend

### React Re-renders

```tsx
// Memoize expensive components
const NoteCard = React.memo(({ note }: Props) => { ... });

// Stable callbacks — avoid new function reference each render
const handleClick = useCallback(() => { ... }, [dep]);

// Expensive computed values
const sorted = useMemo(() => notes.sort(...), [notes]);
```

### TanStack Query (when in use)

```ts
// Set staleTime to avoid unnecessary refetches
useQuery({
  queryKey: ['notes'],
  queryFn: fetchNotes,
  staleTime: 1000 * 60 * 5,  // 5 min
});

// Optimistic updates for mutations
useMutation({
  mutationFn: updateNote,
  onMutate: async (newNote) => {
    await queryClient.cancelQueries({ queryKey: ['notes'] });
    const prev = queryClient.getQueryData(['notes']);
    queryClient.setQueryData(['notes'], (old) => /* optimistic update */);
    return { prev };
  },
  onError: (err, vars, ctx) => queryClient.setQueryData(['notes'], ctx.prev),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
});
```

### Bundle Size

```powershell
cd frontend
npm run build
# Check dist/ output — look for chunks > 500KB
# Large deps to watch: chart libs, editor libs
```

## Backend

### N+1 Queries

```python
# BAD — N+1
notes = await session.execute(select(Note))
for note in notes:
    tags = await session.execute(select(Tag).where(Tag.note_id == note.id))  # N queries!

# GOOD — eager load
result = await session.execute(
    select(Note).options(selectinload(Note.tags))
)
```

### Slow Endpoints

```python
# Add index for frequent WHERE clauses
class Note(Base):
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    updated_at: Mapped[datetime] = mapped_column(index=True)

# Paginate large result sets — never return unbounded lists
.limit(limit).offset(offset)
```

### DB Connection Pool

```python
# In database.py — tune for expected concurrency
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
)
```
