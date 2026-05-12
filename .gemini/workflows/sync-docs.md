# SYNC DOCS WORKFLOW

> This workflow ensures that project documentation stays in sync with code changes, managed by the Orchestrator (Gemini CLI).

## 1. Trigger (Orchestrator)
- This workflow is triggered automatically after any significant feature implementation or refactor, or as directed by Claude.

## 2. Delegation (Execution)
- Invoke `@doc-worker` with:
  - A summary of recent code changes (e.g., new endpoints, changed schemas, new UI components).
  - Instructions on which files in `information/` or `*.md` in the root need updates.
  - A request to maintain the "Knowledge Tree" structure defined in `GEMINI.md`.

## 3. Review (Orchestrator)
- Verify that documentation accurately reflects the current state of the codebase.
- Ensure that diagrams (if any, as text/mermaid) are updated.

## 4. Persistence
- Commit documentation changes along with the code changes (if requested by the user).
