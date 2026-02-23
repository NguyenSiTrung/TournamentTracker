# Workflow: Tournament Tracker

## Task Execution
1. Read the task from `plan.md`
2. Implement the task following code styleguides in `conductor/code_styleguides/`
3. Write/update tests to maintain >80% coverage
4. Verify all tests pass before marking complete
5. Commit after each completed task

## Commit Convention
- Format: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Scope: module or feature area (e.g., `teams`, `session`, `api`)
- Example: `feat(session): add live scoreboard rendering`

## Task Summary
- Use Git Notes to attach task summaries to commits
- Format: `git notes add -m "Task: <task description>\nStatus: complete\nChanges: <brief summary>"`

## User Manual Verification Protocol
At the end of each phase:
1. Present completed features to user
2. List what was implemented
3. Ask user to verify functionality
4. Only proceed to next phase after user approval

## Quality Gates
- All tests pass
- No console errors or warnings
- Code follows established styleguides
- Destructive actions require confirmation modals
- User input is escaped via `escapeHtml()`
