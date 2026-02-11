---
name: flow:done
description: Session-end documentation — updates STATE.md, ROADMAP.md, lessons.md, generates handoff prompt
user_invocable: true
---

# /flow:done — Session End + Handoff

You are executing the `/flow:done` skill. This finalizes the current session by updating all planning documents and generating a handoff prompt for the next session.

**This is the most important skill for sustainability.** Without proper session-end docs, the next session starts blind.

## Steps

### 1. Gather Context

Read these files (in parallel where possible):
- `.planning/STATE.md` — current state
- `.planning/ROADMAP.md` — milestone/phase progress
- `tasks/lessons.md` — existing lessons
- `CLAUDE.md` — project rules
- `PRD.md` — current spec (if exists)

Also gather:
- Run `git log --oneline -20` to see commits this session
- Run `git diff --stat` to check for uncommitted changes
- If uncommitted changes exist, warn the user before proceeding

### 2. Update STATE.md

**REPLACE the entire file** (do NOT append). Keep under 80 lines.

Structure:
```
# [Project Name] — Project State

## Current Position
- **Milestone:** [name] (vX)
- **Phase:** [current phase status]
- **Branch:** [current branch]
- **Last Session:** [today's date]

## Milestone Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | [name] | Complete (date) |
| 2 | [name] | Complete (date) |
| 3 | [name] | In Progress |
| 4 | [name] | Pending |

## What Was Built (This Session)
- [Bullet list of what was accomplished]
- [Include file counts, key components, commit SHAs]

## Key Decisions
- [Any architectural or design decisions made]

## Next Actions
1. [Specific next step — usually "Run /flow:go for Phase N"]
```

### 3. Update ROADMAP.md

- Mark completed phases with completion date
- Ensure pending phases have enough detail that the next session can start with a one-line prompt
- **Archive check:** If the current milestone is fully complete:
  - If `.planning/` does not exist, skip archiving entirely — there's nothing to archive
  - Create `.planning/archive/` if it doesn't already exist (use `mkdir -p` or equivalent)
  - Move milestone phase details to `.planning/archive/milestones-vX.md`
  - Keep only the summary row in the ROADMAP milestone table
  - Move `PRD.md` to `.planning/archive/PRD-vX.md`

### 4. Update lessons.md

- Review the session for mistakes, corrections, or discovered issues
- Auto-suggest lessons based on errors encountered (if any)
- Ask the user: "Any lessons from this session?" using AskUserQuestion with options:
  - "No new lessons"
  - "Yes, let me add some" (user types them)
  - "Use your suggestions" (if you auto-suggested any)
- Add new lessons in PATTERN/CAUSE/FIX/RULE format
- **Refine existing lessons:** merge duplicates, sharpen vague rules, delete obvious ones
- **Promote check:** For lessons that seem universal (not project-specific), ask: "This lesson seems universal. Promote to global lessons (~/.claude/lessons.md)?"

### 5. Commit Doc Updates

- Stage only the planning docs: STATE.md, ROADMAP.md, lessons.md, and any archived files
- Commit with message: `docs: session-end updates — [brief summary]`
- Do NOT push unless the user asks

### 6. Generate Handoff Prompt

Determine the next action and generate a copyable handoff prompt:

- If next phase exists in PRD:
  ```
  Phase [N]: [Name] — [short description]. Read STATE.md, ROADMAP.md, and PRD.md (US-X).
  [One sentence of context]. [One sentence of what NOT to do if relevant].
  ```
- If milestone is complete:
  ```
  Milestone [name] complete. Run /flow:milestone to start the next milestone.
  ```

Print the handoff prompt in a fenced code block so the user can copy it.

### 7. Print Summary

```
Session complete.
- STATE.md: updated
- ROADMAP.md: [N] phases marked complete
- lessons.md: [N] lessons added, [N] refined
- Committed: [SHA]

Handoff prompt:
[the prompt in a code block]
```
