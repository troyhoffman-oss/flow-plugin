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
- List `.planning/prds/` directory for all PRD files (if directory exists)
- Also check for legacy `PRD.md` at project root (backward compat)
- Read the active PRD (from STATE.md "Active PRD" field) to get phase details
- Count lessons in `tasks/lessons.md` (if exists)

IF both STATE.md AND ROADMAP.md are missing:
- Print: "No flow project found. Run `/flow:setup` to set up, or `/flow:task` for a quick standalone fix."
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

**IF pending phases exist in ROADMAP AND a PRD exists for the current milestone (in `.planning/prds/` or legacy root):**
→ Primary: `/flow:go` to execute Phase [N]: [name]
→ Alt: `/flow:done` if wrapping up the session
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF pending phases exist in ROADMAP BUT no PRD exists for the current milestone:**
→ Primary: `/flow:spec [next milestone name]` to create the execution plan
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF all phases are complete AND a next milestone with status "Planned" exists in ROADMAP.md:**
→ Primary: `/flow:done` to finalize this milestone (will auto-transition to next milestone)
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF all phases are complete AND no next milestone exists:**
→ Primary: `/flow:done` to finalize this milestone
→ Then: `/flow:milestone` to add the next milestone
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**IF no phases exist in ROADMAP (milestone defined but not planned):**
→ Primary: `/flow:spec [milestone name]` to plan this milestone
→ Alt: `/flow:task` for quick fixes or cleanup (no PRD needed)

**When suggesting `/flow:spec`:** Always include the target milestone name in the suggestion (e.g., `→ /flow:spec v16.0: Conventional Leasing & Email Export`). This lets the user see which milestone will be specced before running the command, and passes the name as an argument so flow:spec can match it directly.

## Step 4 — Print Status Block

```
Milestone: [name] ([X/Y] phases complete)
Last session: [date] — [what was built]
Next: Phase [N] — [name] ([short description])
Lessons: [N]/10 active

PRDs:
  * {slug}.md (active — current milestone)
  [For each additional PRD in .planning/prds/:]
  * {slug}.md (ready — future milestone)
  [If legacy PRD.md at root:]
  * PRD.md (legacy — at project root)

[routing recommendations from Step 3]
```

The PRDs section shows all PRD files found. Mark the one matching STATE.md's "Active PRD" as "(active — current milestone)". Mark others as "(ready — future milestone)". If a legacy root `PRD.md` exists, show it as "(legacy — at project root)". Omit the PRDs section entirely if no PRD files exist anywhere.

Adapt the block based on available information. If STATE.md is missing, omit "Last session". If ROADMAP.md is missing, omit phase counts and say "Run /flow:setup to set up tracking."

## Step 5 — No File Writes

This is purely informational. Do not modify any files.
