---
name: doc-writing
description: "Documentation writing conventions for Leafnote .md files. Use when creating or updating any markdown file in information/, CLAUDE.md, ROADMAP.md, or other project docs."
---

# Doc Writing — Leafnote Conventions

## Rules for All .md Files

1. First line after `#` title must be a `> one-sentence description` explaining the file's purpose
2. Use tables for comparisons and lists of items with multiple attributes
3. Use code blocks with language tags for all code and commands
4. No filler phrases ("As mentioned above", "It's worth noting")

## File Status Tracking

When creating a new file, add it to the table in `CLAUDE.md` with status `draft` or `ready`.

Status values:
- `ready` — complete, accurate, can be relied on
- `draft` — high-level only, may be incomplete
- `scaffold` — structure exists, content placeholder
- `done` — work completed, file no longer actively maintained
- `chưa cần` — not needed yet

## Updating CLAUDE.md

After any code change that affects architecture, file structure, or conventions:
1. Update the relevant row in the "Trạng thái file" table
2. If a `draft` file is now accurate, promote to `ready`
3. If a new file was created, add a row

## API Spec Updates (information/api-spec.md)

After adding or changing an endpoint:
```
- Method + path
- Request body (Pydantic schema name)
- Response body (Pydantic schema name)
- Auth required: yes/no
- Status codes
```

## Keeping HISTORY.md Current

After completing a major implementation plan:
1. Add an entry to `HISTORY.md` with: date, what was built, key decisions made
2. Helps future Claude sessions understand what changed and why
