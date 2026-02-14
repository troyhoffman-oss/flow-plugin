---
name: flow:intro
description: Introduction to the Flow workflow system — shows all commands and how to use them
user_invocable: true
---

# /flow:intro — Welcome to Flow

You are executing the `/flow:intro` skill. Print the following guide EXACTLY as written. Do NOT modify any files. This is purely informational.

Print this:

---

## Flow — Your Workflow System

Flow is a structured workflow for Claude Code. Four core commands that turn your specs into shipped code through agent teams.

### The Lifecycle

```
/flow:triage → /flow:spec → /flow:go (repeat) → /flow:done
  (intake)       (plan)       (build)              (wrap)
                    ↑                                 |
                    |     auto-transitions to          |
                    +---- next planned milestone ------+

/flow:spec ← can pre-spec future milestones (each gets its own PRD in .planning/prds/)

/flow:task ← standalone path for bug fixes, cleanup, small features (no PRD needed)
```

### Command by Command

**`/flow:setup`** — Run once per project
- Asks you 4-5 questions (what is it, tech stack, verify commands, roadmap/milestones)
- Captures your full roadmap upfront (paste a list or build one milestone at a time)
- Creates the scaffolding: `CLAUDE.md`, `.planning/STATE.md`, `.planning/ROADMAP.md`, `tasks/lessons.md`
- If project already set up, tells you to use `/flow:triage` or `/flow:spec` instead

**`/flow:triage`** — Sort a brain dump into action
- Takes unstructured text (bullets, stream of consciousness, whatever)
- Categorizes each item: Linear Issue, ROADMAP Entry, Milestone, Lesson, or Discard
- Milestones get added to ROADMAP.md with status "Planned"
- Linear issues created automatically (if Linear MCP available)
- This is the single intake command — use it to add milestones, capture ideas, or file bugs

**`/flow:task`** — Run anytime for small work
- Bug fixes, cleanup, one-off features — anything that doesn't need a full PRD
- Works standalone without `/flow:setup` — lowest friction entry to Flow
- Executes, verifies, commits, and logs to STATE.md (if it exists)
- Scope guard recommends `/flow:spec` if the task grows beyond 5 files or 3 layers

**`/flow:spec`** — Run once per milestone
- Interviews you about scope, user stories, technical design, trade-offs, and phasing
- You can say "done" or "that's enough" anytime to cut the interview short
- Produces `.planning/prds/{milestone}.md` — the execution contract with wave-based phases, file lists, and acceptance criteria
- Can pre-spec future milestones in parallel terminal windows (each milestone gets its own PRD file)
- Updates ROADMAP and STATE to reflect the plan (for the current milestone; future milestone specs skip STATE updates)

**`/flow:go`** — Run once per phase (this is where the work happens)
- Reads the PRD, finds the next pending phase
- Checks for staleness (did prior phases change things this phase references?)
- Spawns agent teams per the wave structure in the PRD
- Verifies after each wave, commits when done
- Updates docs and prints "run `/flow:go` again for the next phase"

**`/flow:done`** — Run at end of every session
- Replaces STATE.md with current status
- Updates ROADMAP.md with phase completions
- Auto-transitions to the next planned milestone when the current one completes
- Captures lessons as one-liners, enforces 10-item cap (promotes to CLAUDE.md when full)
- Commits doc updates
- Generates a handoff prompt you copy-paste to start the next session

**`/flow:status`** — Run anytime, read-only
- Quick "where am I?" — milestone, phase progress, next step, lesson count

**`/flow:update`** — Run anytime to update Flow
- Pulls latest changes from the flow-plugin repo and re-installs all skills
- No need to remember where you cloned the repo — it finds it automatically

### Typical Session

```
1. Paste the handoff prompt from last session (or /flow:status to orient)
2. /flow:go          ← executes the next phase
3. /flow:go          ← executes the phase after that (if time permits)
4. /flow:done        ← wraps up, gives you the handoff prompt for tomorrow
```

**Quick fix mid-session?** Run `/flow:task fix the broken test` — no PRD, no ceremony. It executes, verifies, commits, and you're back to `/flow:go`.

### Starting a Brand New Project

```
1. /flow:setup       ← scaffolds everything
2. /flow:spec        ← interview → PRD
3. /flow:go          ← phase 1
4. /flow:done        ← wrap up
```

### Learn More

- Full design doc: see `DESIGN.md` in the flow-plugin repo
- Compatible with GSD: `/gsd:debug` and `/gsd:map-codebase` still work alongside Flow
