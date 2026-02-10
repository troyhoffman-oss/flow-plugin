---
name: flow-init
description: Initialize a new project or start a new milestone with planning scaffolding
user_invocable: true
---

# /flow:init — Initialize Project or Milestone

You are executing the `/flow:init` skill. This sets up the planning scaffolding for a new project or a new milestone within an existing project.

## Mode Detection

Check if `.planning/STATE.md` exists:
- **If it does NOT exist** → New Project Mode
- **If it exists** → New Milestone Mode

---

## New Project Mode

### Step 1: Ask Setup Questions

Use AskUserQuestion to gather project info. Ask these questions (you may combine into 2-3 AskUserQuestion calls):

**Question 1 — Project basics:**
- "What is this project?" (one sentence description)

**Question 2 — Tech stack:**
- "What's the tech stack?" with options like:
  - "Next.js + TypeScript + PostgreSQL"
  - "Python + FastAPI + PostgreSQL"
  - "React + Node.js + MongoDB"
  - (Other — user types custom)

**Question 3 — Verification commands:**
- "What commands verify the build?" with options like:
  - "npx tsc --noEmit && npx biome check"
  - "pytest && mypy ."
  - "cargo build && cargo test"
  - (Other — user types custom)

**Question 4 — First milestone:**
- "What's the first milestone?" (name + one-sentence goal)

**Question 5 — Brownfield scan:**
- "Is this an existing codebase I should scan?" with options:
  - "Yes — scan and catalog existing code"
  - "No — greenfield project"

### Step 2: Brownfield Scan (if requested)

If the user said yes to scanning:
1. Use Glob to find key directories: `src/`, `app/`, `lib/`, `components/`, `api/`, `pages/`, `utils/`, `types/`
2. Use Grep to find patterns: exports, route definitions, database models, config files
3. Build a brief catalog of what exists (key components, patterns, data layer)
4. Include this in the CLAUDE.md Quick Context section

### Step 3: Create Project Files

Create these 5 files (create directories as needed):

**`.planning/STATE.md`:**
```
# [Project Name] — Project State

## Current Position
- **Milestone:** [first milestone name] (v1)
- **Phase:** Not started — run `/flow:spec` to build PRD
- **Branch:** main
- **Last Session:** [today's date]

## Milestone Progress

| Phase | Name | Status |
|-------|------|--------|
| — | Run `/flow:spec` to define phases | — |

## What Was Built (This Session)
- Project initialized with `/flow:init`
- Created: CLAUDE.md, STATE.md, ROADMAP.md, tasks/lessons.md

## Key Decisions
- (none yet)

## Next Actions
1. Run `/flow:spec` to interview and generate PRD for [first milestone]
```

**`.planning/ROADMAP.md`:**
```
# [Project Name] — Roadmap

## Milestones

| Version | Milestone | Status | Phases |
|---------|-----------|--------|--------|
| v1 | [first milestone] | Pending — needs `/flow:spec` | TBD |

---

## v1: [first milestone]

**Goal:** [milestone goal from user]

**Phases:** Run `/flow:spec` to define implementation phases.
```

**`CLAUDE.md`:**
```
# [Project Name] — Claude Code Instructions

## Quick Context
[Project description from user]

**Tech Stack:** [tech stack from user]
[If brownfield: brief catalog of existing code]

### START (Every Session)
1. Read this file (CLAUDE.md)
2. Read `.planning/STATE.md` for current status
3. Read `.planning/ROADMAP.md` for milestone progress
4. Read `PRD.md` for current execution spec (if one exists)

## Execution Rules
- **Plan before building.** For non-trivial work, read the PRD phase section before touching anything.
- **Delegate immediately.** If a task touches 3+ files, spawn an agent team within your first 2 tool calls.
- **Verify everything.** Run [verification commands from user] after agent work lands. Nothing is done until proven.

## Git Workflow
- All changes via PR. Never commit directly to main.
- Branch naming: `fix/short-description` or `feat/short-description`

## Session-End Docs (MANDATORY)
1. `.planning/STATE.md` — replace session notes (don't append), keep <80 lines
2. `.planning/ROADMAP.md` — update phase progress
3. `tasks/lessons.md` — add new lessons, refine existing ones
4. Commit doc updates to feature branch

## Critical Rules
- No assumptions — ask if requirements unclear
- Fight entropy — leave code better than you found it
```

**`tasks/lessons.md`:**
```
# [Project Name] — Lessons Learned

Format: PATTERN → CAUSE → FIX → RULE

## Execution Patterns
<!-- Lessons about workflow, delegation, verification -->

## Domain Knowledge
<!-- Lessons about business logic, data models, user behavior -->

## Technical Patterns
<!-- Lessons about the tech stack, libraries, deployment -->
```

**`.planning/archive/`** — Create this empty directory (use `mkdir -p` via Bash).

### Step 4: Print Completion Message

```
Project initialized:
- CLAUDE.md — project execution rules
- .planning/STATE.md — session GPS
- .planning/ROADMAP.md — milestone tracker
- tasks/lessons.md — anti-pattern catalog
- .planning/archive/ — for completed milestones

Run `/flow:spec` to plan your first milestone.
```

---

## New Milestone Mode

### Step 1: Read Context

Read `.planning/STATE.md` and `.planning/ROADMAP.md` to understand:
- What milestone just completed (or is completing)
- What version number to use next
- Current state of the project

### Step 2: Ask Milestone Question

Use AskUserQuestion:
- "What's the goal of this new milestone?" (free text)
- "What should it be called?" (free text, or suggest a name based on context)

### Step 3: Archive Completed Milestone

1. Read current ROADMAP.md phase details for the completed milestone
2. Write them to `.planning/archive/milestones-vX.md` (where X is the completed version)
3. If `PRD.md` exists, move it to `.planning/archive/PRD-vX.md` (read it, write to archive, delete original)
4. In ROADMAP.md, replace the completed milestone's phase details with just the summary row (mark as "Complete")

### Step 4: Update Planning Docs

**ROADMAP.md:**
- Add new milestone row to the table
- Add new milestone section with goal and "Run `/flow:spec` to define phases"

**STATE.md:**
- Replace with fresh state for the new milestone
- Reset phase progress table
- Note the milestone transition in "What Was Built"

### Step 5: Print Completion Message

```
Milestone [name] (v[X]) initialized.
- Archived: previous milestone details + PRD
- Updated: ROADMAP.md, STATE.md

Run `/flow:spec` to build the PRD for this milestone.
```
