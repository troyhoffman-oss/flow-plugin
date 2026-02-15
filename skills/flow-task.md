---
name: flow:task
description: Lightweight task execution — bug fixes, cleanup, and small features without a PRD
user_invocable: true
---

# /flow:task — Lightweight Task Execution

You are executing the `/flow:task` skill. For small, focused work — bug fixes, cleanup, one-off features — that doesn't need a PRD. Understand, execute, verify, commit, document.

**Skill boundary:** Only use `/flow:*` commands. Never invoke or suggest `/lisa:*`, `/gsd:*`, `/superpowers:*` or any non-flow skill.

RULES:
- NO AGENT TEAMS. NO PRD. Single execution context.
- Exception: ONE Task agent for an isolated subtask to prevent context bloat.
- MUST work without `/flow:setup`. Missing planning files are fine.

## Step 1 — Context Load

Read ALL in parallel (skip missing files gracefully):
- `.planning/STATE.md`, `.planning/ROADMAP.md`, `CLAUDE.md`, `tasks/lessons.md`
- Active PRD: (1) `git branch --show-current` (2) read first 10 lines of each `.planning/prds/*.md` for `**Branch:**` header (3) match current branch → active PRD (4) no match: fall back to STATE.md "Active PRD" (5) still none: check legacy root `PRD.md` (6) nothing: no active PRD
- `.claude/memory/session-{branch-slug}.md` (if exists). Branch slug: `git branch --show-current`, replace `/` with `-`, lowercase. Detached HEAD fallback: `session.md`.

Run `git config user.name` for developer identity.

If no `.planning/` directory: print "No `.planning/` found — running standalone." Then continue.

## Step 2 — Task Understanding

Parse the user's argument (text after `/flow:task`).

If no argument: AskUserQuestion "What needs to be done?" with 2-4 example options (fix, cleanup, add, update).

Run a quick codebase scan (Grep/Glob) for files relevant to the task.

## Step 3 — Quick Clarification

0-3 clarifying questions maximum. NEVER MORE THAN 3.

Use AskUserQuestion with 2-4 concrete options derived from codebase exploration. If the task is unambiguous, ask zero questions and proceed.

Decision gate: Can you identify WHAT, WHERE, and EXPECTED OUTCOME? If yes, skip to Step 4.

## Step 4 — Scope Guard

Estimate files affected and architectural layers touched.

IF 5+ files OR 3+ layers:
- AskUserQuestion: recommend `/flow:spec` instead:
  - "Switch to /flow:spec (Recommended)" — touches [N] files across [N] layers, PRD keeps it organized
  - "Continue with /flow:task" — understood, execute here

User can always override. Do not block.

## Step 5 — Execute

Do the work directly. NO AGENT TEAMS. NO PRD. Exception: ONE Task agent for isolated subtask if it prevents context bloat. Follow existing code patterns from CLAUDE.md and codebase.

## Step 6 — Verify (MANDATORY)

NEVER SILENTLY SKIP.

1. Check CLAUDE.md for verification commands (build, test, lint)
2. If none: check `package.json`, `Makefile`, `pyproject.toml` for standard commands
3. If found: run them
4. If nothing found anywhere: warn and continue
5. If verification fails: fix and re-verify. Up to 2 fix cycles.
6. Still failing after 2 cycles: report failure clearly with error output. Do not silently move on.

## Step 7 — Commit

- Stage ONLY changed files (never `git add .` or `git add -A`)
- Message format: `fix:` / `feat:` / `refactor:` / `chore:` + concise description
- Do NOT push

## Step 8 — Update Docs

IF `.planning/STATE.md` exists, append to "What Was Built":
```
- /flow:task — [description] ([N] files, commit [short SHA])
```

RULES: Do NOT update ROADMAP.md, PRDs, or create `.planning/` if missing.

**Session state:** Write `.claude/memory/session-{branch-slug}.md` (create dir if needed). Branch slug: `git branch --show-current`, replace `/` with `-`, lowercase. Detached HEAD fallback: `session.md`.
`# Session State` with Date, Developer, Branch, Working On (`/flow:task — [desc]`), Status, Next, Blockers fields.

Lessons prompt via AskUserQuestion: "Any lessons worth capturing?" — "No" / "Yes, let me describe it" → capture to `tasks/lessons.md` as one-liner. Skip if lessons.md doesn't exist. If at 10, promote most battle-tested to `CLAUDE.md ## Learned Rules` first.

## Step 9 — Summary

```
✓ /flow:task complete
  [description]
  Files: [N] changed | Commit: [short SHA]
  Verified: [pass/fail/skipped]

Next:
  → /flow:task [desc] for another quick fix
  → /flow:go to continue project milestones
  → /flow:done to wrap up the session
```

**Linear comment:** If branch name contains a Linear issue ID (e.g., `msig-45` in `feat/msig-45-rate-modeling`):
- Try `mcp__linear__list_issues` matching the identifier
- If Linear MCP available AND issue found: post progress comment via `mcp__linear__create_comment` with task summary
- Otherwise: skip silently

No Linear ID in branch name: skip silently.
