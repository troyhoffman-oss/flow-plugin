---
name: flow:setup
description: Set up a new project with Flow planning scaffolding
user_invocable: true
---

# /flow:setup — Set Up New Project

You are executing the `/flow:setup` skill. This sets up the planning scaffolding for a new project.

## Guard: Already Initialized

Check if `.planning/STATE.md` already exists:
- **If it exists** → Print: "This project is already set up. Run `/flow:triage` to add milestones, or `/flow:spec` to spec the current one." and **STOP. Do not overwrite.**
- **If it does NOT exist** → Continue with setup below.

---

## Step 1: Ask Setup Questions

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

**Question 4 — Roadmap:**
- "Do you already have a roadmap or list of milestones?" with options:
  - "Yes — I'll paste or describe them"
  - "No — let's figure it out together"

**If user selects "Yes":**
- Accept free text (bullet list, paragraph, pasted doc — any format)
- Parse into milestones, each with a name + brief goal
- Print back: "Here's what I got:" followed by the parsed list (e.g., "Auth — user registration and login", "Dashboard — analytics and settings")
- Use AskUserQuestion to confirm: "Does this look right?" with options:
  - "Yes — looks good"
  - "Let me adjust" (user re-enters)

**If user selects "No" (guided):**
- Ask: "What's the first milestone?" (name + one-sentence goal)
- Then: "Any more milestones you can see right now? List them, or skip to add them later with `/flow:triage`." with options:
  - "I have more to add" (user enters additional milestones)
  - "That's it for now"

**Question 5 — Brownfield scan:**
- "Is this an existing codebase I should scan?" with options:
  - "Yes — scan and catalog existing code"
  - "No — greenfield project"

## Step 2: Brownfield Scan (if requested)

If the user said yes to scanning:
1. Use Glob to find key directories: `src/`, `app/`, `lib/`, `components/`, `api/`, `pages/`, `utils/`, `types/`
2. Use Grep to find patterns: exports, route definitions, database models, config files
3. Build a brief catalog of what exists (key components, patterns, data layer)
4. Include this in the CLAUDE.md Quick Context section

## Step 3: Create Project Files

Create these 5 files (create directories as needed):

**`.planning/STATE.md`:**
```
# [Project Name] — Project State

## Current Position
- **Milestone:** [first milestone name]
- **Phase:** Not started — run `/flow:spec` to build PRD
- **Branch:** main
- **Active PRD:** None — run `/flow:spec` to create
- **Last Session:** [today's date]

## Milestone Progress

| Phase | Name | Status |
|-------|------|--------|
| — | Run `/flow:spec` to define phases | — |

## What Was Built (This Session)
- Project initialized with `/flow:setup`
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

| Milestone | Status | Phases |
|-----------|--------|--------|
| [first milestone] | Pending — needs `/flow:spec` | TBD |
[For each additional milestone:]
| [milestone name] | Planned | TBD |

---

## [first milestone]

**Goal:** [milestone goal from user]

**Phases:** Run `/flow:spec` to define implementation phases.

[For each additional milestone:]

## [milestone name]

**Goal:** [milestone goal]

**Phases:** Run `/flow:spec` when this milestone is active.
```

Note: The first milestone gets status "Pending — needs `/flow:spec`". All subsequent milestones get status "Planned". Each milestone gets its own section with its goal.

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
4. Read active PRD from `.planning/prds/` for current milestone (if one exists)

## Execution Rules
- **Plan before building.** For non-trivial work, read the milestone's PRD in `.planning/prds/` before touching anything.
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
# [Project Name] — Lessons (max 10 active)

One-liner format: `- **[topic]** The rule`

<!-- EXAMPLE: - **[agent context]** Always tell agents exactly which functions/lines to read — never "read file.ts", say "read file.ts lines 50-120" -->
```

**`.planning/prds/`** — Create this empty directory (use `mkdir -p` via Bash). PRDs are stored here per-milestone.

**`.planning/archive/`** — Create this empty directory (use `mkdir -p` via Bash).

## Step 4: Print Completion Message

```
Project initialized:
- CLAUDE.md — project execution rules
- .planning/STATE.md — session GPS
- .planning/ROADMAP.md — milestone tracker
- tasks/lessons.md — active lessons (max 10)
- .planning/prds/ — per-milestone PRD specs
- .planning/archive/ — for completed milestones

Run `/flow:spec` to plan your first milestone.
```
