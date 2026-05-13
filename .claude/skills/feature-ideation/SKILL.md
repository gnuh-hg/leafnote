---
name: feature-ideation
description: "Use when evaluating or scoping new Leafnote feature ideas. Checks against product principles, MVP scope (F-01..F-20), Phase 1 constraints, and user stories before any implementation."
---

# Feature Ideation — Leafnote

## Before Proposing Any Feature

Check these files first:
- `information/features.md` — F-01..F-20 catalog. Is this already planned?
- `information/product-principles.md` — 7 cross-cutting principles. Does this violate any?
- `information/user-stories.md` — P0/P1/P2 stories. Does this serve a real user need?
- `ROADMAP.md` — current phase. Is this in scope now?

## Product Principles Checklist (from product-principles.md)

Before adding any feature, confirm it respects:
1. **Leaf-first** — knowledge becomes small, reusable leaves, not big documents
2. **Retention-aware** — surfacing logic based on forgetting curves
3. **Low friction capture** — adding a note should be < 3 seconds
4. **Offline-capable** — works without network
5. **Privacy by default** — user data stays local or encrypted
6. **Progressive disclosure** — simple by default, power available on demand
7. **AI as assistant, not replacement** — AI suggests, user decides

## Scoping Questions

Answer these before writing any code:

```
1. Which user story does this serve? (cite P0/P1 priority)
2. What's the minimum implementation that delivers value?
3. What does this NOT do? (explicit non-scope)
4. Does this require new backend endpoints? New DB tables?
5. Is this Phase 1 (Shell) or Phase 2+ (Leaf engine)?
```

## Phase 1 Constraint

Phase 1 = Auth + Notes CRUD + basic UI shell.
**Do not build**: Tags, Leaf engine, Review feed, AI features, Knowledge graph logic.
These are Phase 2+. If a feature idea requires them, log it in ROADMAP.md under the correct phase.
