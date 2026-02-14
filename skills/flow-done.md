---
name: flow:done
description: Session-end documentation — updates STATE.md, ROADMAP.md, lessons.md, generates handoff prompt. Handles project-complete PR creation and Linear status management.
user_invocable: true
---

# /flow:done — Session End + Handoff

You are executing the `/flow:done` skill. This finalizes the current session by updating all planning documents and generating a handoff prompt for the next session.

**This is the most important skill for sustainability.** Without proper session-end docs, the next session starts blind.

**Skill boundary:** You are inside the `/flow:*` workflow. NEVER invoke, suggest, or reference skills from other workflow systems (`/lisa:*`, `/gsd:*`, `/superpowers:*`, etc.). Only suggest `/flow:*` commands as next steps. Do NOT use the Skill tool to call any non-flow skill.

## Steps

### 1. Gather Context

Read these files (in parallel where possible):
- `.planning/STATE.md` — current state
- `.planning/ROADMAP.md` — project/milestone progress
- `tasks/lessons.md` — active lessons (max 10)
- `CLAUDE.md` — project rules
- Active PRD from `.planning/prds/` (resolve via STATE.md "Active PRD" field, or fall back to legacy `PRD.md` at root)
- `.claude/memory/session.md` (if exists) — personal session state

Also gather:
- Run `git log --oneline -20` to see commits this session
- Run `git diff --stat` to check for uncommitted changes
- Run `git config user.name` to get developer identity
- If uncommitted changes exist, warn the user before proceeding

### 2. Update STATE.md (Project Boundaries Only)

**Determine if a project was completed this session** by checking ROADMAP.md progress and commits.

**IF project completed this session** — REPLACE the entire file (do NOT append). Keep under 80 lines.

Structure:
```
# [Project Name] — Project State

## Current Position
- **Project:** [name]
- **Milestone:** [current milestone status]
- **Branch:** [current branch]
- **Active PRD:** [path to active PRD, or "None" if project complete]
- **Last Session:** [today's date]

## Milestone Progress

| Milestone | Name | Status |
|-----------|------|--------|
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
1. [Specific next step — usually "Run /flow:go for Milestone N"]
```

**IF normal session (no project completed)** — SKIP STATE.md entirely. Print: "Normal session — STATE.md skipped (project boundaries only)."

### 2.5. Write session.md (Every Session)

This step ALWAYS runs, regardless of whether a project was completed.

Create `.claude/memory/` directory if it doesn't exist.

Write `.claude/memory/session.md` with the following content:

```
# Session State

**Date:** [today's date]
**Developer:** [git config user.name result]
**Branch:** [current git branch]
**Working On:** [Linear issue ID + description if detectable from branch name, or PRD milestone, or "standalone task"]
**Status:** [what was accomplished this session — bullet list of key items]
**Next:** [what to pick up next session]
**Blockers:** [any blockers, or "None"]
```

### 3. Update ROADMAP.md (Project Boundaries Only)

**IF project completed this session:**

- Mark completed milestones with completion date
- Ensure pending milestones have enough detail that the next session can start with a one-line prompt
- **Archive check:** If the current project is fully complete:
  - If `.planning/` does not exist, skip archiving entirely — there's nothing to archive
  - Create `.planning/archive/` if it doesn't already exist (use `mkdir -p` or equivalent)
  - Move project milestone details to `.planning/archive/project-{slug}.md`
  - Keep only the summary row in the ROADMAP project table
  - Archive the project's PRD: move `.planning/prds/{slug}.md` to `.planning/archive/PRD-{slug}.md`. If using legacy root `PRD.md`, move it to `.planning/archive/PRD-{slug}.md` instead.
  - Clear STATE.md "Active PRD" field (set to "None")
  - Mark the project as "Complete" in the ROADMAP table
  - **Project transition:** Check ROADMAP.md for the NEXT project with status "Planned":
    - **If a next project exists:** Update its status from "Planned" to "Pending — needs `/flow:spec`". Update STATE.md current project to point to the new project.
    - **If no next project exists:** No transition needed — all planned projects are done.

**IF normal session (no project completed)** — SKIP ROADMAP.md entirely. Print: "Normal session — ROADMAP.md skipped (project boundaries only)."

### 4. Update lessons.md

- Review the session for mistakes, corrections, or discovered issues
- Auto-suggest lessons based on errors encountered (if any)
- Ask the user: "Any lessons from this session?" using AskUserQuestion with options:
  - "No new lessons"
  - "Yes, let me add some" (user types them)
  - "Use your suggestions" (if you auto-suggested any)
- Add new lessons as one-liners: `- **[topic]** The rule`
- **Hard cap enforcement (max 10 active):**
  - If lessons.md already has 10 items and a new one needs to be added:
    1. Identify the most battle-tested/internalized lesson
    2. Promote it to `CLAUDE.md ## Learned Rules` section
    3. Delete it from lessons.md
    4. Add the new lesson
  - If `CLAUDE.md ## Learned Rules` hits 15 items, delete the most obvious/internalized rule to make room

### 5. Commit Doc Updates

**Normal session (no project completed):**
- Only stage `tasks/lessons.md` if it changed
- Skip STATE.md and ROADMAP.md (they were not modified)
- Do NOT stage `.claude/memory/session.md` (it is gitignored)
- If nothing needs staging (no changes to shared docs), skip the commit. Print: "No shared doc changes to commit."
- Otherwise commit with message: `docs: session-end updates — [brief summary]`

**Project boundary session:**
- Stage STATE.md, ROADMAP.md, lessons.md, and any archived files
- Do NOT stage `.claude/memory/session.md` (it is gitignored)
- Commit with message: `docs: session-end updates — [brief summary]`

- Do NOT push unless the user asks

### 5.25. Auto-Create PR (Project Complete Only)

- Check if ALL milestones in the PRD are marked "Complete" in ROADMAP.md
- If all complete AND no PR exists for this branch (`gh pr list --head [branch] --state open` returns empty):
  - Parse the PRD for all Linear issue IDs (e.g., MSIG-34, MSIG-35, ...)
  - Push the branch: `git push -u origin [branch]`
  - Auto-generate PR body:
    ```
    ## Summary
    [Project name] — [one-line description from PRD overview]

    ## Milestones Completed
    - Milestone 1: [Name] (completed [date])
    - Milestone 2: [Name] (completed [date])
    ...

    ## Linear Issues
    Closes MSIG-34, Closes MSIG-35, Closes MSIG-36, ...
    [one "Closes MSIG-XX" per issue found in PRD]

    ## Verification
    - `npx tsc --noEmit` — passed
    - `npx biome check` — passed
    ```
  - Create PR: `gh pr create --title "[project name]" --body "[auto-generated body]"`
  - Print: "PR created: [PR URL]"
  - Print: "Linear: [N] issues will auto-close on merge"
- If milestones remain OR PR already exists: skip silently

### 5.5. Linear Status Update + Progress Comment

- Check if Linear MCP tools are available
- If available:
  - Parse the active PRD for `**Linear Project:**` field
  - If found:
    - Check for open PR: `gh pr list --head [branch] --state open`
    - If PR exists:
      - Find all issues in the Linear project that are "In Progress"
      - Move them to "In Review": `mcp__linear__update_issue` with `state: "In Review"`
      - Print: "Linear: [N] issues → In Review (PR open)"
    - If no PR: issues stay In Progress (normal mid-project session end)
  - Post progress comment on any branch-linked Linear issue (existing behavior)
- If not available: skip silently

### 6. Generate Handoff Prompt

Determine the next action and generate a copyable handoff prompt. Include the developer name in the prompt.

- If next milestone exists in PRD:
  ```
  [Developer Name] — Milestone [N]: [Name] — [short description]. Read STATE.md, ROADMAP.md, and .planning/prds/{slug}.md (US-X).
  [One sentence of context]. [One sentence of what NOT to do if relevant].
  ```
- If project is complete AND a next project was transitioned to (from Step 3):
  ```
  [Developer Name] — Project [name] complete. Next: [next project name]. Run /flow:spec to plan it.
  ```
- If project is complete AND no next project exists:
  ```
  [Developer Name] — All projects complete! Run /flow:triage to plan what's next, or enjoy the win.
  ```

Print the handoff prompt in a fenced code block so the user can copy it.

### 7. Print Summary

```
Session complete.
- STATE.md: [updated | skipped (normal session)]
- ROADMAP.md: [N milestones marked complete | skipped (normal session)]
- session.md: updated
- lessons.md: [N]/10 active, [N] promoted to CLAUDE.md
- Committed: [SHA | nothing to commit]

Handoff prompt:
[the prompt in a code block]
```
