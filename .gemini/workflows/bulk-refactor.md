# BULK REFACTOR WORKFLOW

> This workflow is used for system-wide code improvements, technical debt reduction, or applying new patterns across multiple files, orchestrated by Gemini CLI under Claude's guidance.

## 1. Identification (Manager / Orchestrator)
- Claude identifies technical debt or structural improvements.
- Gemini CLI uses `grep_search` or `refactor-worker` to identify specific patterns that need refactoring.
- List all files involved in the refactor.

## 2. Delegation (Execution)
- Invoke `@refactor-worker` with:
  - The specific refactoring goal (e.g., "Convert all class-based components to functional components").
  - The list of files to process.
  - Coding standards from `GEMINI.md`.
- For large batches, process files in groups to maintain context efficiency.

## 3. Validation (Orchestrator)
- Review changes for correctness and adherence to DRY/SOLID principles.
- Run project-wide linting and type checks (`npm run lint`, `tsc`, `ruff check`).
- Ensure no regressions were introduced in core logic.

## 4. Documentation
- Update `CHANGELOG.md` or `HISTORY.md` if the refactor significantly changes internal APIs or structure.
