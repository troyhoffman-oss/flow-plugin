---
name: flow:setup
description: Set up a new project with Flow planning scaffolding
user_invocable: true
---

# /flow:setup — Set Up New Project

You are executing the `/flow:setup` skill. This sets up the planning scaffolding for a new project.

## Guard: Already Initialized

Check if `.planning/STATE.md` exists:
- **Exists** → Print: "Already set up. Run `/flow:triage` to add projects, or `/flow:spec` to spec the current one." **STOP.**
- **Does not exist** → Continue.

---

## Step 1: Ask Setup Questions

Use AskUserQuestion to gather project info (combine into 2-3 calls):

**Q1 — Project basics:** "What is this project?" (one sentence)

**Q2 — Tech stack:** Options: "Next.js + TypeScript + PostgreSQL" / "Python + FastAPI + PostgreSQL" / "React + Node.js + MongoDB" / Other

**Q3 — Verification commands:** Options: "npx tsc --noEmit && npx biome check" / "pytest && mypy ." / "cargo build && cargo test" / Other

**Q4 — Roadmap:** "Do you already have a roadmap or list of projects?"
- "Yes — I'll paste or describe them"
- "No — let's figure it out together"

**If Yes:** Accept free text, parse into projects (name + goal), print back, confirm via AskUserQuestion ("Does this look right?" / "Let me adjust").

**If No:** Ask "What's the first project?" (name + goal). Then: "Any more projects? List them, or skip to add later with `/flow:triage`." Options: "I have more to add" / "That's it for now"

**Q5 — Brownfield scan:** "Existing codebase to scan?" Options: "Yes — scan and catalog" / "No — greenfield"

## Step 2: Brownfield Scan (if requested)

1. Glob for key directories: `src/`, `app/`, `lib/`, `components/`, `api/`, `pages/`, `utils/`, `types/`
2. Grep for patterns: exports, routes, DB models, config files
3. Build brief catalog; include in CLAUDE.md Quick Context

## Step 3: Create Project Files

Create these 5 files (create directories as needed):

**`.planning/STATE.md`:**
```
# [Project Name] — Project State

## Current Position
- **Project:** [first project name]
- **Milestone:** Not started — run `/flow:spec` to build PRD
- **Branch:** main
- **Active PRD:** None — run `/flow:spec` to create
- **Last Session:** [today's date]

## Milestone Progress
| Milestone | Name | Status |
|-----------|------|--------|
| — | Run `/flow:spec` to define milestones | — |

## What Was Built (This Session)
- Project initialized with `/flow:setup`

## Next Actions
1. Run `/flow:spec` to interview and generate PRD for [first project]
```

**`.planning/ROADMAP.md`:**
```
# [Project Name] — Roadmap

## Projects
| Project | Status | Milestones |
|---------|--------|------------|
| [first project] | Pending — needs `/flow:spec` | TBD |
| [additional projects] | Planned | TBD |

---

## [first project]
**Goal:** [from user]
**Milestones:** Run `/flow:spec` to define.

## [additional projects]
**Goal:** [from user]
**Milestones:** Run `/flow:spec` when active.
```

Note: First project = "Pending — needs `/flow:spec`". Subsequent = "Planned". Each gets its own section.

**`CLAUDE.md`:**
```
# [Project Name] — Claude Code Instructions

## Quick Context
[Project description]
**Tech Stack:** [from user]
[If brownfield: brief catalog]

### START (Every Session)
1. Read CLAUDE.md
2. Read `.planning/STATE.md`
3. Read `.planning/ROADMAP.md`
4. Read active PRD from `.planning/prds/` (if exists)

## Execution Rules
- **Plan before building.** Read the PRD in `.planning/prds/` before touching anything.
- **Delegate immediately.** 3+ files → spawn agent team within first 2 tool calls.
- **Verify everything.** Run [verification commands] after work lands.

## Git Workflow
- All changes via PR. Never commit directly to main.
- Branch naming: `fix/short-description` or `feat/short-description`

## Session-End Docs (MANDATORY)
1. `.planning/STATE.md` — replace (don't append), <80 lines
2. `.planning/ROADMAP.md` — update milestone progress
3. `tasks/lessons.md` — add/refine lessons
4. Commit doc updates to feature branch

## Critical Rules
- No assumptions — ask if requirements unclear
- Fight entropy — leave code better than you found it
```

**`tasks/lessons.md`:**
```
# [Project Name] — Lessons (max 10 active)

One-liner format: `- **[topic]** The rule`

<!-- EXAMPLE: - **[agent context]** Always tell agents exactly which functions/lines to read -->
```

**`.planning/prds/`** — Create empty directory (`mkdir -p`).
**`.planning/archive/`** — Create empty directory (`mkdir -p`).

## Step 4: Print Completion Message

```
Project initialized:
- CLAUDE.md — project execution rules
- .planning/STATE.md — session GPS
- .planning/ROADMAP.md — project tracker
- tasks/lessons.md — active lessons (max 10)
- .planning/prds/ — per-project PRD specs
- .planning/archive/ — for completed projects

Run `/flow:spec` to plan your first project.
```
