---
name: conductor
description: |
  Context-driven development methodology for organized, spec-first coding. Use when:
  - Project has a `conductor/` directory
  - User mentions specs, plans, tracks, or context-driven development
  - Files like `conductor/tracks.md`, `conductor/product.md`, `conductor/workflow.md` exist
  - User asks about project status, implementation progress, or track management
  - User wants to organize development work with TDD practices
  - User invokes `/conductor-*` commands (setup, newtrack, implement, status, revert, validate, block, skip, revise, archive, export, handoff, refresh, formula, wisp, distill)
  - User mentions documentation is outdated or wants to sync context with codebase changes
  
  Interoperable with Gemini CLI extension and Claude Code commands.
  Integrates with Beads for persistent task memory across sessions.
---

# Conductor: Context-Driven Development

Measure twice, code once.

## Overview

Conductor enables context-driven development by:
1. Establishing project context (product vision, tech stack, workflow)
2. Organizing work into "tracks" (features, bugs, improvements)
3. Creating specs and phased implementation plans
4. Executing with TDD practices and progress tracking
5. **Parallel execution** of independent tasks using sub-agents

## Parallel Execution (New Feature)

Conductor now supports parallel task execution for eligible phases:

### How It Works
- During `/conductor-newtrack`, tasks are analyzed for parallelization potential
- Tasks with no file conflicts and no dependencies can run in parallel
- Parallel phases use `<!-- execution: parallel -->` annotation
- Each task has `<!-- files: ... -->` for exclusive file ownership
- Dependencies use `<!-- depends: ... -->` annotation

### Plan.md Format for Parallel Phases
```markdown
## Phase 1: Core Setup
<!-- execution: parallel -->

- [ ] Task 1: Create auth module
  <!-- files: src/auth/index.ts, src/auth/index.test.ts -->
  
- [ ] Task 2: Create config module
  <!-- files: src/config/index.ts -->
  
- [ ] Task 3: Create utilities
  <!-- files: src/utils/index.ts -->
  <!-- depends: task1 -->
```

### Execution Flow
1. **Coordinator** parses parallel annotations
2. Detects file conflicts (fails safe if found)
3. Spawns sub-agents via `Task()` for independent tasks
4. Monitors `parallel_state.json` for completion
5. Aggregates results and updates plan.md

### When to Use Parallel Execution
- ✅ Tasks modifying different files
- ✅ Independent components (auth, config, utils)
- ✅ Multiple test file creation
- ❌ Tasks with shared state
- ❌ Tasks with sequential dependencies

## Context Loading

When this skill activates, load these files to understand the project:
1. `conductor/product.md` - Product vision and goals
2. `conductor/tech-stack.md` - Technology constraints
3. `conductor/workflow.md` - Development methodology (TDD, commits)
4. `conductor/tracks.md` - Current work status
5. `conductor/patterns.md` - **Codebase patterns (read before starting work)**

**Important**: Conductor commits locally but never pushes. Users decide when to push to remote.

For active tracks, also load:
- `conductor/tracks/<track_id>/spec.md`
- `conductor/tracks/<track_id>/plan.md`
- `conductor/tracks/<track_id>/learnings.md` - **Patterns/gotchas from this track**

## Learnings System (Ralph-style)

Conductor captures and consolidates learnings across tracks, inspired by [Ralph](https://github.com/snarktank/ralph).

### Key Files
- `conductor/patterns.md` - Project-level consolidated patterns
- `conductor/tracks/<id>/learnings.md` - Per-track discoveries

### Templates
Templates are bundled in the skill's `references/` folder:
- [references/patterns-template.md](references/patterns-template.md) - Full patterns.md template
- [references/learnings-template.md](references/learnings-template.md) - Full learnings.md template

### Knowledge Flywheel
1. **Capture** - After each task, append to track's `learnings.md`
2. **Elevate** - At phase/track completion, promote reusable patterns to `patterns.md`
3. **Archive** - Extract remaining patterns before archiving
4. **Inherit** - New tracks read `patterns.md` to prime context

### Learnings Entry Format
```markdown
## [YYYY-MM-DD HH:MM] - Phase N Task M: <task_name>
Thread: $AMP_CURRENT_THREAD_ID
- **Implemented:** <brief description>
- **Files changed:** <list>
- **Commit:** <sha_7chars>
- **Learnings:**
  - Patterns: <reusable patterns discovered>
  - Gotchas: <things to watch out for>
  - Context: <useful context for future>
---
```

### Proactive Behaviors for Learnings
- **On implement start**: Read `patterns.md` and announce pattern count
- **On task complete**: Prompt for learnings capture
- **On phase complete**: Offer pattern elevation to `patterns.md`
- **On archive**: Extract remaining patterns before archiving
- **On refresh**: Consolidate learnings across all tracks

## Beads Integration

Beads integration is **always attempted** for persistent task memory. If `bd` CLI is unavailable or fails, the user can choose to continue without it.

### Detection (MUST check before using bd commands)

Before using ANY `bd` command, you MUST verify:
1. `bd` CLI is installed: `which bd` returns a path
2. `conductor/beads.json` exists AND has `"enabled": true`

```bash
# Check availability - run this before any bd command
if which bd > /dev/null 2>&1 && [ -f conductor/beads.json ]; then
  BEADS_ENABLED=$(cat conductor/beads.json | grep -o '"enabled"[[:space:]]*:[[:space:]]*true' || echo "")
  if [ -n "$BEADS_ENABLED" ]; then
    # Beads is available and enabled - use bd commands
  fi
fi
```

### If Beads is NOT available:
- **DO NOT** run any `bd` commands
- Use only plan.md markers for task tracking
- All conductor commands work normally without Beads

### If Beads IS available:
- Tracks become Beads epics
- Tasks sync to Beads for persistent memory
- Use `bd ready` instead of manual task selection
- Notes survive context compaction

### Beads CLI Commands (`bd`)

#### Essential Commands
| Command | Description |
|---------|-------------|
| `bd init` | Initialize Beads in project (creates `.beads/`) |
| `bd prime` | AI-optimized workflow context (run at session start) |
| `bd ready` | List unblocked, ready-to-work tasks |
| `bd show <id>` | Show task details and audit trail |
| `bd sync` | Push local changes to remote (run at session end) |

#### Task Lifecycle
| Command | Description |
|---------|-------------|
| `bd create "<desc>" -p <priority> [--notes "..."]` | Create task with optional notes |
| `bd create "<desc>" --deps discovered-from:<id>` | Create and link discovered work (one command) |
| `bd update <id> --status in_progress` | Mark task as in-progress |
| `bd update <id> --notes "..."` | Add notes (survives compaction!) |
| `bd close <id> --reason "..."` | Complete a task |
| `bd close <id> --continue` | Complete and auto-advance to next step |
| `bd list [--parent <epic-id>] [--status <status>]` | List tasks with filters |
| `bd dep tree <id>` | Visualize dependency graph |

#### Dependencies
| Command | Description |
|---------|-------------|
| `bd dep add <child> <parent>` | Set dependency (child waits for parent) |
| `bd dep add <id> external:<project>:<capability>` | Cross-project dependency |

#### Molecules (Workflow Templates) - v0.34+
| Command | Description |
|---------|-------------|
| `bd formula list` | Available formulas (workflow templates) |
| `bd cook <formula>` | Formula → Protomolecule (frozen template) |
| `bd mol pour <proto>` | Create persistent molecule (auditable) |
| `bd mol wisp <proto>` | Create ephemeral molecule (no audit trail) |
| `bd mol current` | Where am I in the current molecule? |
| `bd mol squash <id>` | Condense completed molecule to digest |
| `bd mol burn <wisp>` | Delete wisp without trace |
| `bd mol distill <epic> --as "<name>"` | Extract reusable template from ad-hoc work |

#### Agents & Gates (v0.40+)
| Command | Description |
|---------|-------------|
| `bd agent register <name>` | Register parallel worker agent |
| `bd agent heartbeat` | Keep worker alive (prevents timeout) |
| `bd gate create "<checkpoint>"` | Create human-in-the-loop gate |
| `bd gate wait <id>` | Wait for human approval |
| `bd gate approve <id>` | Approve gate (human action) |

#### Worktrees (v0.40+)
| Command | Description |
|---------|-------------|
| `bd worktree create <branch>` | Create isolated worktree for parallel work |
| `bd worktree list` | List active worktrees |

#### Maintenance
| Command | Description |
|---------|-------------|
| `bd compact --auto` | Archive old completed tasks |
| `bd doctor` | Health check |

## Proactive Behaviors

1. **On new session**: Check for in-progress tracks, offer to resume
2. **On task completion**: Suggest next task or phase verification
3. **On blocked detection**: Alert user and suggest alternatives
4. **On all tasks complete**: Congratulate and offer archive/cleanup
5. **On stale context detected**: If setup >2 days old or significant codebase changes detected, suggest `/conductor-refresh`
6. **On Beads available**: If `bd` CLI detected during setup, offer integration

## Intent Mapping

| User Intent | Command |
|-------------|---------|
| "Set up this project" | `/conductor-setup` |
| "Create a new feature" | `/conductor-newtrack [desc]` |
| "Start working" / "Implement" | `/conductor-implement [id]` |
| "What's the status?" | `/conductor-status` |
| "Undo that" / "Revert" | `/conductor-revert` |
| "Check for issues" | `/conductor-validate` |
| "This is blocked" | `/conductor-block` |
| "Skip this task" | `/conductor-skip` |
| "This needs revision" / "Spec is wrong" | `/conductor-revise` |
| "Save context" / "Handoff" / "Transfer to next section" | `/conductor-handoff` |
| "Archive completed" | `/conductor-archive` |
| "Export summary" | `/conductor-export` |
| "Docs are outdated" / "Sync with codebase" | `/conductor-refresh` |
| "List templates" / "Show formulas" | `/conductor-formula` |
| "Quick exploration" / "Ephemeral track" | `/conductor-wisp [formula]` |
| "Extract template" / "Create reusable pattern" | `/conductor-distill [track_id]` |

## References

- **Detailed workflows**: [references/workflows.md](references/workflows.md) - Step-by-step command execution
- **Directory structure**: [references/structure.md](references/structure.md) - File layout and status markers
- **Beads integration**: [references/beads-integration.md](references/beads-integration.md) - Session protocol, chemistry patterns
- **Learnings system**: [references/learnings-system.md](references/learnings-system.md) - Ralph-style knowledge capture
- **Patterns template**: [references/patterns-template.md](references/patterns-template.md) - Template for conductor/patterns.md
- **Learnings template**: [references/learnings-template.md](references/learnings-template.md) - Template for track learnings.md
