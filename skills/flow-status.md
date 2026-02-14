---
name: flow:status
description: Quick orientation — shows current project, milestone progress, and next actions
user_invocable: true
---

# /flow:status — Quick Orientation

You are executing the `/flow:status` skill. This is a READ-ONLY operation. Do NOT modify any files.

**Skill boundary:** You are inside the `/flow:*` workflow. NEVER invoke, suggest, or reference skills from other workflow systems (`/lisa:*`, `/gsd:*`, `/superpowers:*`, etc.). Only suggest `/flow:*` commands as next steps. Do NOT use the Skill tool to call any non-flow skill.

## Step 1 — Read Context Files

Read ALL of the following in parallel:
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- List `.planning/prds/` directory for all PRD files (if directory exists)
- Also check for legacy `PRD.md` at project root (backward compat)
- Read the active PRD (from STATE.md "Active PRD" field) to get milestone details
- Count lessons in `tasks/lessons.md` (if exists)
- `.claude/memory/session.md` (if exists) — personal session state
- Run `git config user.name` to get developer identity

IF both STATE.md AND ROADMAP.md are missing:
- Print: "No flow project found. Run `/flow:setup` to set up, or `/flow:task` for a quick standalone fix."
- STOP here.

IF only one file exists, continue with what's available.

## Step 2 — Analyze Milestone Status

Parse ROADMAP.md to determine milestone progress:
- Count total milestones
- Count milestones marked "Complete", "Done", or containing a completion date (e.g., `✓`, `[x]`, `completed`)
- Count milestones marked "Pending", "In Progress", or not yet started
- Identify the FIRST milestone that is NOT complete — this is the **next milestone**

RULE: Determine the next action from ROADMAP.md milestone statuses, NOT from STATE.md "Next Actions" text. STATE.md may be stale from a previous session. ROADMAP.md is the source of truth for milestone progress.

## Step 3 — Determine Routing

Use this explicit decision tree:

**IF pending milestones exist in ROADMAP AND a PRD exists for the current project (in `.planning/prds/` or legacy root):**
→ Primary: `/flow:go` to execute Milestone [N]: [name]
→ Alt: `/flow:done` if wrapping up the session
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF pending milestones exist in ROADMAP BUT no PRD exists for the current project:**
→ `/flow:spec` — select a project and build its execution plan
→ `/flow:task` — for quick fixes or cleanup (no PRD needed)

**IF all milestones are complete AND a next project with status "Planned" exists in ROADMAP.md:**
→ Primary: `/flow:done` to finalize this project (will auto-transition to next project)
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF all milestones are complete AND no next project exists:**
→ Primary: `/flow:done` to finalize this project
→ Then: `/flow:triage` to add the next project
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF no milestones exist in ROADMAP (project defined but not planned):**
→ `/flow:spec` — select a project and build its execution plan
→ `/flow:task` — for quick fixes or cleanup (no PRD needed)

**CRITICAL — `/flow:spec` suggestion format:** When printing routing recommendations, output EXACTLY this text for /flow:spec suggestions:
```
→ /flow:spec — select a project and build its execution plan
```
Do NOT append a project name, do NOT say "for v16" or "to plan v16" or any variation. The project picker inside /flow:spec handles selection. Adding a name here confuses users who may have multiple projects in flight across terminals. Print the line EXACTLY as shown above — no modifications.

## Step 4 — Print Status Block

```
Project: [name] ([X/Y] milestones complete)
Developer: [git config user.name]
Session: [session.md "Working On" field if session.md exists, or "No active session"]
Last session: [date] — [what was built]
Next: Milestone [N] — [name] ([short description])
Lessons: [N]/10 active

PRDs:
  * {slug}.md (active — current project)
  [For each additional PRD in .planning/prds/:]
  * {slug}.md (ready — future project)
  [If legacy PRD.md at root:]
  * PRD.md (legacy — at project root)

[routing recommendations from Step 3]
```

The PRDs section shows all PRD files found. Mark the one matching STATE.md's "Active PRD" as "(active — current project)". Mark others as "(ready — future project)". If a legacy root `PRD.md` exists, show it as "(legacy — at project root)". Omit the PRDs section entirely if no PRD files exist anywhere.

When listing PRDs, if a PRD has `**Assigned To:**` fields in its milestone sections, show assignment status in the PRD listing, e.g.:
```
  * {slug}.md (active — Milestone 3 assigned to Matt, Milestone 4 unassigned)
```

Adapt the block based on available information. If STATE.md is missing, omit "Last session". If ROADMAP.md is missing, omit milestone counts and say "Run /flow:setup to set up tracking."

## Step 5 — No File Writes

This is purely informational. Do not modify any files.
