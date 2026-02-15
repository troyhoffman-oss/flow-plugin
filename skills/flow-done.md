---
name: flow:done
description: Session-end documentation — updates STATE.md, ROADMAP.md, lessons.md. Handles project-complete PR creation, automated review, and Linear status management.
user_invocable: true
---

# /flow:done — Session End + Handoff

You are executing the `/flow:done` skill. This finalizes the current session by updating all planning documents and routing to the next action.

**This is the most important skill for sustainability.** Without proper session-end docs, the next session starts blind.

**Skill boundary:** Only use `/flow:*` commands. Never invoke or suggest `/lisa:*`, `/gsd:*`, `/superpowers:*` or any non-flow skill.

## Steps

### 1. Gather Context

Read in parallel:
- `.planning/STATE.md`, `.planning/ROADMAP.md`, `tasks/lessons.md`, `CLAUDE.md`
- Active PRD from `.planning/prds/` (resolve via STATE.md "Active PRD" field, or legacy root `PRD.md`)
- `.claude/memory/session.md` (if exists)

Also run:
- `git log --oneline -20` — commits this session
- `git diff --stat` — uncommitted changes (warn user if any exist)
- `git config user.name` — developer identity

### 2. Update STATE.md (Project Boundaries Only)

Check ROADMAP.md progress and commits to determine if a project completed this session.

**IF project completed** — REPLACE the entire file (do NOT append). Keep under 80 lines:

```
# [Project Name] — Project State

## Current Position
- **Project:** [name]
- **Milestone:** [current milestone status]
- **Branch:** [current branch]
- **Active PRD:** [path or "None" if project complete]
- **Last Session:** [today's date]

## Milestone Progress
| Milestone | Name | Status |
|-----------|------|--------|
| 1 | [name] | Complete (date) |
| 2 | [name] | In Progress |

## What Was Built (This Session)
- [Bullet list — file counts, key components, commit SHAs]

## Key Decisions
- [Architectural or design decisions made]

## Next Actions
1. [Specific next step]
```

**IF normal session** — SKIP STATE.md. Print: "Normal session — STATE.md skipped (project boundaries only)."

### 2.5. Write session.md (Every Session)

Always runs. Create `.claude/memory/` if needed. Write `.claude/memory/session.md`:

```
# Session State
**Date:** [today]
**Developer:** [git config user.name]
**Branch:** [current branch]
**Working On:** [Linear issue ID + desc, or PRD milestone, or "standalone task"]
**Status:** [bullet list of accomplishments]
**Next:** [what to pick up next]
**Blockers:** [any blockers, or "None"]
```

### 3. Update ROADMAP.md (Project Boundaries Only)

**IF project completed:**
- Mark completed milestones with dates
- Ensure pending milestones have enough detail for a one-line-prompt start
- **Archive check** (if project fully complete):
  - Skip if `.planning/` doesn't exist
  - Create `.planning/archive/` if needed (`mkdir -p`)
  - Move milestone details to `.planning/archive/project-{slug}.md`
  - Keep only summary row in ROADMAP table
  - Archive PRD: move `.planning/prds/{slug}.md` (or legacy root `PRD.md`) to `.planning/archive/PRD-{slug}.md`
  - Clear STATE.md "Active PRD" → "None"; mark project "Complete" in ROADMAP
  - **Project transition:** Check for next "Planned" project:
    - If exists: update to "Pending — needs `/flow:spec`", update STATE.md current project
    - If none: no transition needed

**IF normal session** — SKIP ROADMAP.md. Print: "Normal session — ROADMAP.md skipped (project boundaries only)."

### 4. Update lessons.md

- Review session for mistakes, corrections, or discovered issues
- Auto-suggest lessons from errors encountered
- AskUserQuestion: "Any lessons from this session?" with options: "No new lessons" / "Yes, let me add some" / "Use your suggestions"
- Format: `- **[topic]** The rule`
- **Hard cap (max 10):** If at 10, promote the most battle-tested to `CLAUDE.md ## Learned Rules`, delete from lessons.md, then add new. If Learned Rules hits 15, delete the most obvious rule to make room.

### 5. Commit Doc Updates

**Normal session:** Only stage `tasks/lessons.md` if changed. Skip STATE.md/ROADMAP.md. Never stage `.claude/memory/session.md` (gitignored). If no shared doc changes, print "No shared doc changes to commit." Otherwise: `docs: session-end updates — [brief summary]`

**Project boundary session:** Stage STATE.md, ROADMAP.md, lessons.md, archived files. Never stage session.md. Commit: `docs: session-end updates — [brief summary]`

Do NOT push unless user asks.

### 5.25. Auto-Create PR (Project Complete Only)

- Check if ALL milestones in PRD are "Complete" in ROADMAP.md
- If all complete AND no open PR for branch (`gh pr list --head [branch] --state open`):
  - Parse PRD for all Linear issue IDs
  - Push branch: `git push -u origin [branch]`
  - Auto-generate PR body:
    ```
    ## Summary
    [Project name] — [one-line from PRD]
    ## Milestones Completed
    - Milestone 1: [Name] (completed [date])
    ## Linear Issues
    Closes MSIG-34, Closes MSIG-35, ...
    ## Verification
    - `npx tsc --noEmit` — passed
    - `npx biome check` — passed
    ```
  - `gh pr create --title "[project name]" --body "[body]"`
  - Print: "PR created: [URL]" and "Linear: [N] issues will auto-close on merge"
- If milestones remain OR PR exists: skip silently

### 5.3. Await Automated Review (Project Complete Only)

Runs when 5.25 created a PR (or one already exists for this branch).

1. Get PR number from `gh pr create` output or `gh pr list --head [branch]`
2. Parse repo owner/name from `git remote get-url origin`
3. Poll every 2 min, up to 10 min (5 checks max):
   - `gh api repos/{owner}/{repo}/pulls/{N}/reviews` — non-empty reviews
   - `gh api repos/{owner}/{repo}/pulls/{N}/comments` — bot/review comments
4. **Reviews arrive:** Read all, address each, push fixes. Print: "Automated review: [N] comments addressed, fixes pushed."
5. **No reviews after 10 min:** Print: "No comments after 10 min. Proceeding." Write "Automated review pending" in session.md Blockers.
6. **Pre-existing PR:** Check for unaddressed review comments from prior sessions; address before proceeding.

### 5.5. Linear Status Update + Progress Comment

- Check if Linear MCP tools are available; skip silently if not
- Parse active PRD for `**Linear Project:**` field
- If found and open PR exists (`gh pr list --head [branch] --state open`):
  - Move all "In Progress" issues to "In Review" via `mcp__linear__update_issue`
  - Print: "Linear: [N] issues → In Review (PR open)"
- If no PR: issues stay In Progress (normal mid-project session end)
- **If project complete** (all milestones done):
  - Find project via `mcp__linear__list_projects`, match by name from PRD `**Linear Project:**` field
  - Move project to Completed: `mcp__linear__update_project` with `state: "Completed"`
  - Print: "Linear: project → Completed"
- Post progress comment on any branch-linked Linear issue

### 6. Route Next Action

**Mid-project (milestones remain):**
```
Next steps:
→ /flow:go — execute Milestone [N+1]: [Name]
→ /clear + /flow:go — if context is heavy
```

**Project complete + next project exists:**
```
Project complete! → Review + merge PR #[N] → /flow:spec — plan [next project]
```

**Project complete + no next project:**
```
All projects complete! → Review + merge PR #[N] → /flow:triage — plan what's next
```

### 7. Print Summary

```
Session complete.
- STATE.md: [updated | skipped (normal session)]
- ROADMAP.md: [N milestones marked complete | skipped (normal session)]
- session.md: updated
- lessons.md: [N]/10 active, [N] promoted to CLAUDE.md
- Committed: [SHA | nothing to commit]
- PR: [created #N | skipped (milestones remain)]
- Review: [N comments addressed | pending | skipped]
- Linear: [N issues → In Review, project → Completed | N issues → In Review | skipped]

Next: [routing from Step 6]
```
