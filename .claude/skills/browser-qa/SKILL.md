---
name: browser-qa
description: "Trigger a browser QA session for Leafnote frontend. Verifies changed features work in Chrome: smoke test, auth flow, golden/error paths, responsive check, dark mode. Use after any frontend change before reporting done."
---

# Browser QA — Leafnote Frontend Testing

## When to Use

- After building or modifying a UI component
- Before reporting a frontend feature as complete
- When debugging a visual regression
- Before committing frontend changes

## Phase 1: Smoke Test (Claude in Chrome)

```
1. Navigate to http://localhost:5173
2. Open browser console — check for errors (filter out Vite HMR noise)
3. Verify no failed network requests (red in Network tab)
4. Check the changed page renders without blank content
```

## Phase 2: Auth Flow Test

```
1. Log out if logged in
2. Go to /auth — verify Login/Signup tabs work
3. Sign up with test email → verify redirect to dashboard
4. Log out → verify redirect to /auth
5. Go to a protected route (e.g. /notes) without auth → verify redirect to /auth
```

## Phase 3: Feature Test (Golden Path + Error Path)

For each changed feature:

```
Golden path: Use the feature as intended — verify success state
Error path:  Submit empty form, invalid input, network error — verify error state shown
Loading state: Slow network (DevTools > Network > Slow 3G) — verify spinner/skeleton
```

## Phase 4: Responsive Check

Test at 3 breakpoints in Chrome DevTools:
- Mobile: 375px (iPhone SE)
- Tablet: 768px
- Desktop: 1440px

Check: no overflow, no overlapping text, sidebar collapses properly.

## Phase 5: Dark/Light Theme

Toggle theme via the TopBar toggle — verify:
- All text is readable
- No hardcoded white/black backgrounds that break in dark mode
- Colors use Tailwind dark: variants from design-system.md

## Tools Available

- `mcp__Claude_in_Chrome__navigate` — go to URL
- `mcp__Claude_in_Chrome__find` — find element
- `mcp__Claude_in_Chrome__read_page` — read page content
- `mcp__Claude_in_Chrome__javascript_tool` — run JS in page
- `mcp__Claude_in_Chrome__computer` — screenshot

## Report Format

```markdown
## Browser QA — [feature] — [date]

### Smoke Test: PASS / FAIL
- Console errors: [count] — [description if any]
- Network failures: [count]

### Auth Flow: PASS / FAIL

### Feature Test (golden path): PASS / FAIL
### Feature Test (error path): PASS / FAIL

### Responsive: PASS / FAIL
- 375px: [note]
- 768px: [note]
- 1440px: [note]

### Verdict: SHIP / FIX FIRST
Issues: [list if any]
```
