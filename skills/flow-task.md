---
name: flow:task
description: Lightweight task execution — bug fixes, cleanup, and small features without a PRD
user_invocable: true
---

# /flow:task — Lightweight Task Execution

You are executing the `/flow:task` skill. This is for small, focused work — bug fixes, cleanup, one-off features — that doesn't warrant a full PRD. Understand the task, execute it, verify it works, commit it, and document it.

RULES:
- NO AGENT TEAMS. NO PRD. Single execution context.
- Exception: ONE Task agent for an isolated subtask to prevent context bloat.
- This skill MUST work without `/flow:init`. Missing planning files are fine.

## Step 1 — Context Load

Read ALL of the following in parallel. If any file is missing, skip it gracefully:
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `CLAUDE.md`
- `tasks/lessons.md`
- `PRD.md`

If no `.planning/` directory exists, print:
> No `.planning/` directory found — running standalone. Task will still be executed, verified, and committed.

Then continue.

## Step 2 — Task Understanding

Parse the user's argument (text provided after `/flow:task`).

IF no argument was provided:
- Use AskUserQuestion: "What needs to be done?"
- Provide 2-4 example options based on common task types (fix, cleanup, add, update)

Run a quick codebase scan (Grep/Glob) for files relevant to the task description.

## Step 3 — Quick Clarification

Ask 0-3 clarifying questions maximum.

RULES:
- NEVER MORE THAN 3 QUESTIONS.
- USE AskUserQuestion with 2-4 CONCRETE OPTIONS derived from codebase exploration.
- IF THE TASK IS UNAMBIGUOUS, ASK ZERO QUESTIONS. Proceed directly.

Decision gate: Can you identify WHAT to change, WHERE to change it, and the EXPECTED OUTCOME? If yes, skip to Step 4.

## Step 4 — Scope Guard

Estimate:
- Number of files affected
- Number of architectural layers touched (e.g., UI, API, DB, config)

IF 5+ files OR 3+ architectural layers:
- Use AskUserQuestion to recommend `/flow:spec` instead:
  - Option 1: "Switch to /flow:spec (Recommended)" — "This touches [N] files across [N] layers. A PRD will keep it organized."
  - Option 2: "Continue with /flow:task" — "I understand the scope. Execute it here."

The user can always override. Do not block.

## Step 5 — Execute

Do the work directly in the current context.

RULES:
- NO AGENT TEAMS. NO PRD. Direct execution.
- Exception: ONE Task agent is allowed for a single isolated subtask if it prevents context bloat.
- Follow existing code patterns and conventions found in CLAUDE.md and the codebase.

## Step 6 — Verify (MANDATORY)

RULE: NEVER SILENTLY SKIP VERIFICATION.

1. Check CLAUDE.md for project-specific verification commands (build, test, lint).
2. If no CLAUDE.md commands: check `package.json` scripts, `Makefile`, `pyproject.toml`, or similar for standard commands.
3. If verification commands are found: run them.
4. If NO verification commands exist anywhere: print a warning and continue.
   > ⚠ No verification commands found. Skipping automated verification.
5. If verification fails: fix the issue and re-verify. Up to 2 fix cycles.
6. If still failing after 2 cycles: report the failure clearly with the error output. Do not silently move on.

## Step 7 — Commit

- Stage ONLY the files you changed (never `git add .` or `git add -A`)
- Commit message format: `fix:` / `feat:` / `refactor:` / `chore:` followed by a concise description
- Do NOT push

## Step 8 — Update Docs

IF `.planning/STATE.md` exists:
- Append to the "What Was Built" section (or create it if missing):
  ```
  - /flow:task — [description] ([N] files, commit [short SHA])
  ```

RULES:
- DO NOT update ROADMAP.md — tasks are not milestone phases.
- DO NOT update PRD.md — tasks are not part of the spec.
- DO NOT create `.planning/` if it doesn't exist.

Quick lessons prompt via AskUserQuestion:
- "Any lessons from this task worth capturing?"
  - Option 1: "No, nothing new" — Skip lessons.
  - Option 2: "Yes, let me describe it" — Capture to `tasks/lessons.md` in PATTERN/CAUSE/FIX/RULE format.

If `tasks/lessons.md` doesn't exist, skip the lessons prompt.

## Step 9 — Summary

Print a compact completion block:

```
✓ /flow:task complete
  [description of what was done]
  Files: [N] changed | Commit: [short SHA]
  Verified: [pass/fail/skipped]

Next:
  → /flow:task [description] for another quick fix
  → /flow:go to continue milestone phases
  → /flow:done to wrap up the session
```
