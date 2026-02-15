---
name: flow:triage
description: Sort brain dump into Linear issues, ROADMAP entries, lessons, or discard
user_invocable: true
---

# /flow:triage — Brain Dump Triage

You are executing the `/flow:triage` skill. Takes a brain dump (text blob, bullets, or stream of consciousness) and sorts it into actionable categories.

**Skill boundary:** Only use `/flow:*` commands. Never invoke or suggest `/lisa:*`, `/gsd:*`, `/superpowers:*` or any non-flow skill.

## Step 1 — Input

Check if the user provided text after `/flow:triage`.

IF argument provided: use it as the brain dump.
IF no argument: use AskUserQuestion: "Paste your brain dump — bullet list, stream of consciousness, whatever format. I'll sort it."

## Step 2 — Context Load

Read in parallel (skip gracefully if missing):
- `.planning/ROADMAP.md` — existing projects, avoid duplicates
- `tasks/lessons.md` — existing lessons, enforce cap
- `CLAUDE.md` — project context

Run `git config user.name` to identify the developer.

## Step 3 — Categorize

For each distinct item, classify into one of:
- **Linear Issue** — actionable task, bug, or feature → becomes a Linear issue
- **ROADMAP Entry** — future project or milestone idea → append to ROADMAP.md Future section
- **Lesson** — learning, pattern, or rule → append to tasks/lessons.md
- **Project** — project-sized work → add to ROADMAP.md as planned project
- **Discard** — not actionable, duplicate, or too vague

## Step 4 — Present Plan

Show categorization in a table:

```
| # | Item | Category | Details |
|---|------|----------|---------|
| 1 | "Rate modeling table" | Linear Issue | Project: v18 Student Leasing, Priority: Normal |
| 2 | "Never use git add ." | Lesson | "Always stage specific files" |
| 3 | "Student leasing rate modeling" | Project | Add to ROADMAP as planned project |
```

Use AskUserQuestion: "Here's how I'd categorize your brain dump. Review and approve, or tell me what to change."
- "Looks good — execute it"
- "I want to make changes" (user provides corrections)

If the user wants changes, update and present again.

## Step 5 — Execute

For approved items:

**Linear Issues:**
- Check if Linear MCP tools are available (try `mcp__linear__list_teams`)
- If available: create issues with `mcp__linear__create_issue` (team: "Monument Square", default project: "Future / Backlog" unless a better match exists)
- If not available: print formatted text for manual creation:
  ```
  Linear issues to create manually:
  - [Title] | Team: Monument Square | Project: [suggested] | Priority: [suggested]
  ```

**ROADMAP Entries:**
- Append to `.planning/ROADMAP.md` under "Future (Unscheduled)" section (create if missing)
- Format: `| [name] | Unscheduled | — |`

**Projects:**
- Add to `.planning/ROADMAP.md` project table with status "Planned"
- Add section: `## [Project Name]\n\n**Goal:** [goal]\n\n**Milestones:** Run /flow:spec when this project is active.`
- If no active project exists (all "Complete" or none):
  - Set first new project status to "Pending — needs `/flow:spec`"
  - Update STATE.md to point to new project as current
- Optionally create a Linear project (if MCP available)

**Lessons:**
- Append to `tasks/lessons.md` as one-liners: `- **[topic]** The rule`
- Enforce max 10 cap (promote most battle-tested to `CLAUDE.md ## Learned Rules` if full)
- Create `tasks/lessons.md` if it doesn't exist

**Discard:** No action needed.

## Step 6 — Summary

```
Triage complete:
- [N] Linear issues created (in [project names])
- [N] ROADMAP entries added
- [N] projects added to ROADMAP
- [N] lessons captured
- [N] items discarded
```

Next actions:
```
→ /flow:triage for another brain dump
→ /flow:spec to plan a project from triaged items
→ /flow:status to see current state
```
