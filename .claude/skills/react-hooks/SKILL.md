---
name: react-hooks
description: "Patterns for writing custom React hooks in Leafnote. Use when creating hooks in src/hooks/. Covers naming, TanStack Query hooks, auth hooks, and common pitfalls."
---

# React Hooks — Leafnote Patterns

## Naming & Location

- All custom hooks start with `use` — `useNotes`, `useAuth`, `useOnlineStatus`
- Live in `src/hooks/<name>.ts`
- One hook per file

## TanStack Query Hook Pattern

```ts
// src/hooks/useNotes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote } from '../services/notes';

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}
```

## Auth Hook Pattern

```ts
// Reading auth state — never read Zustand store directly in components
import { useAuthStore } from '../stores/authStore';

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}
```

## Rules

```
□ Hooks must not contain JSX
□ Hooks must not call other hooks conditionally
□ All useEffect dependencies must be exhaustive (eslint rule)
□ Cleanup async effects to avoid state updates after unmount
□ Separate data-fetching hooks (TanStack Query) from UI state hooks
```

## Async Effect Cleanup

```ts
useEffect(() => {
  let cancelled = false;
  async function load() {
    const data = await fetchSomething();
    if (!cancelled) setState(data);
  }
  load();
  return () => { cancelled = true; };
}, []);
```
