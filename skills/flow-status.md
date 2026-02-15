---
name: flow:status
description: Quick orientation — shows current project, milestone progress, and next actions
user_invocable: true
---

# /flow:status — Quick Orientation

You are executing the `/flow:status` skill. This is a READ-ONLY operation. Do NOT modify any files.

**Skill boundary:** Only use `/flow:*` commands. Never invoke or suggest `/lisa:*`, `/gsd:*`, `/superpowers:*` or any non-flow skill.

## Step 1 — Read Context Files

Read ALL in parallel:
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- List `.planning/prds/` for all PRD files (or legacy root `PRD.md`)
- Read the active PRD (from STATE.md "Active PRD" field) for milestone details
- Count lessons in `tasks/lessons.md` (if exists)
- `.claude/memory/session.md` (if exists)
- Run `git config user.name` for developer identity

IF both STATE.md AND ROADMAP.md are missing:
- Print: "No flow project found. Run `/flow:setup` to set up, or `/flow:task` for a quick standalone fix."
- STOP here.

IF only one file exists, continue with what's available.

## Step 2 — Analyze Milestone Status

Parse ROADMAP.md to determine milestone progress:
- Count total, complete (`Done`/`Complete`/`[x]`/`✓`), and pending/in-progress milestones
- Identify the FIRST incomplete milestone — this is the **next milestone**

RULE: Determine next action from ROADMAP.md milestone statuses, NOT from STATE.md "Next Actions" text. STATE.md may be stale. ROADMAP.md is the source of truth.

## Step 3 — Determine Routing

**IF pending milestones exist AND a PRD exists (in `.planning/prds/` or legacy root):**
→ Primary: `/flow:go` to execute Milestone [N]: [name]
→ Alt: `/flow:done` if wrapping up
→ Alt: `/flow:task` for quick fixes (no PRD needed)

**IF pending milestones exist BUT no PRD exists:**
→ `/flow:spec` — select a project and build its execution plan
→ `/flow:task` — for quick fixes (no PRD needed)

**IF all milestones complete AND a "Planned" project exists in ROADMAP.md:**
→ Primary: `/flow:done` to finalize (will auto-transition to next project)
→ Alt: `/flow:task` for quick fixes (no PRD needed)

**IF all milestones complete AND no next project:**
→ Primary: `/flow:done` to finalize
→ Then: `/flow:triage` to add the next project
→ Alt: `/flow:task` for quick fixes (no PRD needed)

**IF no milestones exist in ROADMAP (project defined but not planned):**
→ `/flow:spec` — select a project and build its execution plan
→ `/flow:task` — for quick fixes (no PRD needed)

When suggesting /flow:spec, do NOT append a project name — the project picker inside /flow:spec handles selection.

## Step 4 — Print Status Block

```
Project: [name] ([X/Y] milestones complete)
Developer: [git config user.name]
Session: [session.md "Working On" field if exists, or "No active session"]
Last session: [date] — [what was built]
Next: Milestone [N] — [name] ([short description])
Lessons: [N]/10 active

PRDs:
  * {slug}.md (active — current project)
  * {slug}.md (ready — future project)
  * PRD.md (legacy — at project root)

[routing recommendations from Step 3]
```

The PRDs section shows all PRD files found. Mark the one matching STATE.md "Active PRD" as "(active — current project)". Mark others as "(ready — future project)". Legacy root `PRD.md` shows as "(legacy — at project root)". Omit PRDs section if no PRD files exist.

Adapt the block based on available information. If STATE.md is missing, omit "Last session". If ROADMAP.md is missing, omit milestone counts and say "Run /flow:setup to set up tracking."

## Step 5 — No File Writes

This is purely informational. Do not modify any files.
