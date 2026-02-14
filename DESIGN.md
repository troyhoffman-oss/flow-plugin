# `/flow:*` -- Troy's Workflow System

## Context

Troy has organically converged on a workflow where a single handoff prompt kicks off full agent-team execution of multi-file milestones. The system works because of 5 interlocking parts: per-project PRDs in `.planning/prds/` (execution contracts), STATE.md (GPS), ROADMAP.md (milestone status), lessons.md (immune system), and CLAUDE.md (execution rules).

**Problem:** This system evolved through manual effort. Troy wants it formalized into reusable skills so any new project gets this workflow automatically.

**Decision: Build 5 fresh skills, not a GSD fork.** GSD's complexity comes from solving problems at execution time (research, planning, checking). Troy's workflow front-loads all decisions into the spec interview, making execution simple. The skills just need to systematize creating and maintaining the artifacts that make execution work.

**Compatible with GSD:** Uses the same `.planning/` directory structure. Troy can still use `/gsd:debug` and `/gsd:map-codebase` for specialized tasks.

**Distribution:** GitHub repo with setup script. Cross-platform (Mac + Windows). Shareable with coworkers.

## Architecture: Skills as Markdown Files

```
~/.claude/skills/
├── flow-setup.md       # /flow:setup -- New project scaffolding
├── flow-spec.md        # /flow:spec -- Spec interview -> executable PRD
├── flow-task.md        # /flow:task -- Lightweight task execution (no PRD needed)
├── flow-go.md          # /flow:go -- Execute next milestone from PRD
├── flow-done.md        # /flow:done -- Session-end docs + handoff
├── flow-status.md      # /flow:status -- Quick orientation
└── flow-update.md      # /flow:update -- Pull latest + re-install
```

Each skill is a single markdown file containing the prompt instructions. No code, no setup scripts beyond the initial copy. Instantly active once installed.

**`flow-task.md`** is the lightweight companion to `flow-spec.md` + `flow-go.md`. Where the spec-to-execution pipeline handles project-level work through PRDs and agent teams, `/flow:task` handles bug fixes, cleanup, and small features in a single execution context. It works standalone without `/flow:setup`, making it the lowest-friction entry point to Flow.

## File Structure (Universal Template)

Every `/flow:setup` project gets this:

```
project-root/
├── CLAUDE.md                    # Project-specific execution rules
├── .planning/
│   ├── STATE.md                 # Session GPS (<80 lines, replaced each session)
│   ├── ROADMAP.md               # Project table + current project milestones
│   ├── prds/                    # Per-project PRD specs
│   │   ├── user-auth.md          # e.g., project PRD
│   │   └── dashboard.md          # e.g., project PRD (can pre-spec)
│   └── archive/                 # Completed project details, old PRDs
├── tasks/
│   └── lessons.md               # Active lessons (max 10 one-liners)
```

## Lessons Lifecycle

**Stage 1 -- Capture:** Mistake happens, one-liner written to `tasks/lessons.md` (max 10 active)

**Stage 2 -- Promote:** When lessons.md hits 10 items, most battle-tested lesson promotes to `CLAUDE.md ## Learned Rules` (max 15), freeing a slot for new lessons

## What NOT to Build

- No REQ-IDs or requirements traceability
- No separate research phases
- No specialized sub-agents (planner, checker, etc.)
- No debug system (use `/gsd:debug`)
- No codebase mapping (use `/gsd:map-codebase`)
- No JSON output format -- markdown only
- No plugin infrastructure beyond setup scripts
- No model profile switching

## Plan Mode Compatibility

Flow skills are NOT compatible with Claude Code's plan mode. The spec interview (`/flow:spec`) IS the planning phase — it produces a PRD in `.planning/prds/` that serves as the execution contract. Plan mode on top of Flow skills creates:
- Double-planning overhead
- Read-only conflicts (spec needs to write PRD files iteratively)
- Wasted context window

If you want a planning gate, run `/flow:spec`. If you want execution, run `/flow:go`. Don't stack plan mode on either.

## Multi-Developer Architecture

### File Ownership Model

Flow splits state into shared and per-developer files:

| File | Scope | Git | Update Frequency |
|------|-------|-----|-----------------|
| `STATE.md` | Project-level | Committed | Project boundaries |
| `ROADMAP.md` | Project-level | Committed | Project boundaries |
| `session.md` | Per-developer | Gitignored | Every session |
| `lessons.md` | Shared | Committed | Every session (append-only) |
| `CLAUDE.md` | Shared | Committed | Rarely (promoted lessons) |

### Design Decisions

- **Linear is assignment authority, Flow is execution authority.** Linear tracks who owns what issue. Flow tracks execution state (which milestone, which agent wave). Neither duplicates the other's data.
- **session.md is gitignored** — eliminates merge conflicts from parallel developers. Each developer's session state is local-only. Project-level state lives in STATE.md (committed, updated rarely).
- **PRD assignability is advisory** — PRDs can note which developer is assigned, but this is metadata for humans, not enforcement logic. Any developer can run `/flow:go` on any PRD.
- **session.md lifecycle:** Created on first `/flow:done`, replaced (not appended) each session. Contains: where you left off, what's in flight, what's next. Max 40 lines.
