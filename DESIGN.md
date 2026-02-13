# `/flow:*` -- Troy's Workflow System

## Context

Troy has organically converged on a workflow where a single handoff prompt kicks off full agent-team execution of multi-file phases. The system works because of 5 interlocking parts: PRD (execution contract), STATE.md (GPS), ROADMAP.md (phase status), lessons.md (immune system), and CLAUDE.md (execution rules).

**Problem:** This system evolved through manual effort. Troy wants it formalized into reusable skills so any new project gets this workflow automatically.

**Decision: Build 5 fresh skills, not a GSD fork.** GSD's complexity comes from solving problems at execution time (research, planning, checking). Troy's workflow front-loads all decisions into the spec interview, making execution simple. The skills just need to systematize creating and maintaining the artifacts that make execution work.

**Compatible with GSD:** Uses the same `.planning/` directory structure. Troy can still use `/gsd:debug` and `/gsd:map-codebase` for specialized tasks.

**Distribution:** GitHub repo with setup script. Cross-platform (Mac + Windows). Shareable with coworkers.

## Architecture: Skills as Markdown Files

```
~/.claude/skills/
├── flow-setup.md       # /flow:setup -- New project scaffolding
├── flow-milestone.md   # /flow:milestone -- Archive milestone + start new one
├── flow-spec.md        # /flow:spec -- Spec interview -> executable PRD
├── flow-task.md        # /flow:task -- Lightweight task execution (no PRD needed)
├── flow-go.md          # /flow:go -- Execute next phase from PRD
├── flow-done.md        # /flow:done -- Session-end docs + handoff
├── flow-status.md      # /flow:status -- Quick orientation
└── flow-update.md      # /flow:update -- Pull latest + re-install
```

Each skill is a single markdown file containing the prompt instructions. No code, no setup scripts beyond the initial copy. Instantly active once installed.

**`flow-task.md`** is the lightweight companion to `flow-spec.md` + `flow-go.md`. Where the spec-to-execution pipeline handles milestone-level work through PRDs and agent teams, `/flow:task` handles bug fixes, cleanup, and small features in a single execution context. It works standalone without `/flow:setup`, making it the lowest-friction entry point to Flow.

## File Structure (Universal Template)

Every `/flow:setup` project gets this:

```
project-root/
├── CLAUDE.md                    # Project-specific execution rules
├── PRD.md                       # Current milestone execution spec
├── .planning/
│   ├── STATE.md                 # Session GPS (<80 lines, replaced each session)
│   ├── ROADMAP.md               # Milestone table + current milestone phases
│   └── archive/                 # Completed milestone details, old PRDs
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

Flow skills are NOT compatible with Claude Code's plan mode. The spec interview (`/flow:spec`) IS the planning phase — it produces a PRD that serves as the execution contract. Plan mode on top of Flow skills creates:
- Double-planning overhead
- Read-only conflicts (spec needs to write PRD.md iteratively)
- Wasted context window

If you want a planning gate, run `/flow:spec`. If you want execution, run `/flow:go`. Don't stack plan mode on either.
