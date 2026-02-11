---
name: flow:status
description: Quick orientation — shows current milestone, phase progress, and next actions
user_invocable: true
---

# /flow:status — Quick Orientation

You are executing the `/flow:status` skill. This is a READ-ONLY operation. Do NOT modify any files.

## Step 1 — Read Context Files

Read ALL of the following in parallel:
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `PRD.md` (if exists)
- Count lessons in `tasks/lessons.md` (if exists)

IF both STATE.md AND ROADMAP.md are missing:
- Print: "No flow project found. Run `/flow:init` to set up, or `/flow:task` for a quick standalone fix."
- STOP here.

IF only one file exists, continue with what's available.

## Step 2 — Analyze Phase Status

Parse ROADMAP.md to determine phase progress:
- Count total phases
- Count phases marked "Complete", "Done", or containing a completion date (e.g., `✓`, `[x]`, `completed`)
- Count phases marked "Pending", "In Progress", or not yet started
- Identify the FIRST phase that is NOT complete — this is the **next phase**

RULE: Determine the next action from ROADMAP.md phase statuses, NOT from STATE.md "Next Actions" text. STATE.md may be stale from a previous session. ROADMAP.md is the source of truth for phase progress.

## Step 3 — Determine Routing

Use this explicit decision tree:

**IF pending phases exist in ROADMAP AND PRD.md exists:**
→ Primary: `/flow:go` to execute Phase [N]: [name]
→ Alt: `/flow:done` if wrapping up the session
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF pending phases exist in ROADMAP BUT PRD.md is missing:**
→ Primary: `/flow:spec` to create the execution plan
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF all phases are complete:**
→ Primary: `/flow:done` to finalize this milestone
→ Then: `/flow:init` to start the next milestone
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF no phases exist in ROADMAP (milestone defined but not planned):**
→ Primary: `/flow:spec` to plan this milestone
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

## Step 4 — Print Status Block

```
Milestone: [name] ([X/Y] phases complete)
Last session: [date] — [what was built]
Next: Phase [N] — [name] ([short description])
Lessons: [N] rules

[routing recommendations from Step 3]
```

Adapt the block based on available information. If STATE.md is missing, omit "Last session". If ROADMAP.md is missing, omit phase counts and say "Run /flow:init to set up tracking."

## Step 5 — No File Writes

This is purely informational. Do not modify any files.
