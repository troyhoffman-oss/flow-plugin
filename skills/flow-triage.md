---
name: flow:triage
description: Sort brain dump into Linear issues, ROADMAP entries, lessons, or discard
user_invocable: true
---

# /flow:triage — Brain Dump Triage

You are executing the `/flow:triage` skill. This takes a brain dump (text blob, bullet list, or stream of consciousness) and sorts it into actionable categories: Linear issues, ROADMAP entries, lessons, or discard.

**Skill boundary:** You are inside the `/flow:*` workflow. NEVER invoke, suggest, or reference skills from other workflow systems (`/lisa:*`, `/gsd:*`, `/superpowers:*`, etc.). Only suggest `/flow:*` commands as next steps. Do NOT use the Skill tool to call any non-flow skill.

## Step 1 — Input

Check if the user provided text after `/flow:triage`.

IF argument provided: use it as the brain dump.
IF no argument: use AskUserQuestion: "Paste your brain dump — bullet list, stream of consciousness, whatever format. I'll sort it."

## Step 2 — Context Load

Read in parallel (skip gracefully if missing):
- `.planning/ROADMAP.md` — to understand existing projects and avoid duplicates
- `tasks/lessons.md` — to check for existing lessons and enforce cap
- `CLAUDE.md` — project context

Run `git config user.name` to identify the developer.

## Step 3 — Categorize

For each distinct item in the brain dump, classify into one of:
- **Linear Issue** — actionable task, bug, or feature → will become a Linear issue
- **ROADMAP Entry** — future project or milestone idea → append to ROADMAP.md Future section
- **Lesson** — learning, pattern, or rule → append to tasks/lessons.md
- **Project** — project-sized work item → add to ROADMAP.md as a planned project
- **Discard** — not actionable, already done, duplicate, or too vague to action

## Step 4 — Present Plan

Show the full categorization in a table:

```
| # | Item | Category | Details |
|---|------|----------|---------|
| 1 | "Rate modeling table" | Linear Issue | Project: v18 Student Leasing, Priority: Normal |
| 2 | "Never use git add ." | Lesson | "Always stage specific files" |
| 3 | "Maybe add dark mode" | ROADMAP | Future/Unscheduled |
| 4 | "Had a thought about..." | Discard | Too vague to action |
| 5 | "Student leasing rate modeling" | Project | Add to ROADMAP as planned project |
```

Use AskUserQuestion: "Here's how I'd categorize your brain dump. Review and approve, or tell me what to change."
- "Looks good — execute it"
- "I want to make changes" (user provides corrections)

If the user wants changes, update the categorization and present again.

## Step 5 — Execute

For approved items:

**Linear Issues:**
- Check if Linear MCP tools are available (try `mcp__linear__list_teams`)
- If available: create issues with `mcp__linear__create_issue` (team: "Monument Square", default project: "Future / Backlog" unless a better match exists based on the item content and existing Linear projects)
- If not available: print the issues as formatted text for manual creation:
  ```
  Linear issues to create manually:
  - [Title] | Team: Monument Square | Project: [suggested] | Priority: [suggested]
  ```

**ROADMAP Entries:**
- Append to `.planning/ROADMAP.md` under a "Future (Unscheduled)" section
- If that section doesn't exist, create it at the bottom of the file
- Format: `| [name] | Unscheduled | — |`

**Projects:**
- Add to `.planning/ROADMAP.md` main project table with status "Planned"
- Add a section with the project goal: `## [Project Name]\n\n**Goal:** [goal]\n\n**Milestones:** Run /flow:spec when this project is active.`
- If no active project exists (all existing projects are "Complete" or none exist):
  - Set the first new project's status to "Pending — needs `/flow:spec`"
  - Update STATE.md to point to the new project as current
- Optionally create a Linear project (if Linear MCP tools available via `mcp__linear__list_teams`)

**Lessons:**
- Append to `tasks/lessons.md` as one-liners: `- **[topic]** The rule`
- Enforce max 10 cap (promote most battle-tested to `CLAUDE.md ## Learned Rules` if full)
- If `tasks/lessons.md` doesn't exist, create it

**Discard:** No action needed.

## Step 6 — Summary

Print a compact completion block:

```
Triage complete:
- [N] Linear issues created (in [project names])
- [N] ROADMAP entries added
- [N] projects added to ROADMAP
- [N] lessons captured
- [N] items discarded
```

Then suggest next actions:
```
Next:
  → /flow:triage for another brain dump
  → /flow:spec to plan a project from triaged items
  → /flow:status to see current state
```
