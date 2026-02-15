---
name: flow:go
description: Execute the next milestone from PRD using wave-based agent teams
user_invocable: true
---

# /flow:go — Execute Next Milestone

You are executing the `/flow:go` skill. This reads the PRD, identifies the next unstarted milestone, and executes it using wave-based agent teams.

**Core principle:** The PRD is the execution contract. Execute what it specifies. Do not freelance.

**Constraints:** Do NOT use with plan mode (prevents file writes). Only use `/flow:*` commands — never invoke `/lisa:*`, `/gsd:*`, `/superpowers:*` or other skills.

## Step 1 — Orient

Read in parallel: `.planning/STATE.md`, `.planning/ROADMAP.md`, `tasks/lessons.md`, `CLAUDE.md`, `.claude/memory/session.md` (if exists).

Run `git config user.name` to get developer identity.

### PRD Selection

The user must always select which PRD to execute.

1. **If argument provided** (e.g., `/flow:go v3-payments`) — match against `.planning/prds/` by slug or `**Project:**` header. If no match, show available PRDs and ask.

2. **If no argument** — list all PRDs in `.planning/prds/`, read each `**Status:**` and `**Project:**` header. AskUserQuestion to pick. Pre-select first "Ready for execution" PRD. Always show picker. Include legacy root `PRD.md` if found.

3. **No PRDs found** — "No PRDs found in `.planning/prds/`. Run `/flow:spec` first." Stop.

**After selection:** Read chosen PRD. If its project doesn't match STATE.md current project, warn: "PRD project doesn't match current project. Verify you're executing the right spec."

**Assignment check:** Check milestone's `**Assigned To:**` against `git config user.name`. If different, print advisory warning. Do NOT block execution.

**Identify next milestone:** First "Pending" milestone in ROADMAP.md or first unstarted in the PRD.

## Step 2 — Pre-flight Checks

If any fail, stop and tell the user:

1. **PRD selected?** If no PRDs found, stop.
2. **Milestone detailed enough?** Must have wave structure, file lists, verification commands. If missing: "PRD milestone too vague. Add wave structure + file lists, or run `/flow:spec`."
3. **Branch check:** Verify correct feature branch (from PRD header). Warn if wrong.
4. **All done?** If no pending milestones: "All milestones complete! Run `/flow:done` to wrap up."

## Step 2.5 — Linear Status: In Progress

- Read PRD header for `**Linear Project:**` field
- If present and Linear MCP available:
  - Find project (`mcp__linear__get_project`), list milestones, match current milestone name
  - Find issues in that milestone: `mcp__linear__list_issues`
  - Move Backlog/Todo issues to In Progress: `mcp__linear__update_issue`
  - Print: "Linear: [N] issues → In Progress ([milestone name])"
- If no Linear Project or MCP unavailable: skip silently

## Step 3 — Staleness Check

Compare milestone's PRD section against actual codebase: do referenced files still exist with expected structure? Were files changed by prior milestones? If stale, fix references in the PRD before proceeding. Print corrections. Do NOT rewrite the milestone.

## Step 4 — Execute Waves

For each wave in the PRD milestone:

### 4a. Agent Prompts

Build each agent's prompt:

```
You are [agent-name] working on Milestone [N]: [Name].

## Task
[From PRD wave structure]

## Files to Create/Modify
[Absolute paths from PRD]

## Acceptance Criteria
[From user stories this milestone covers]

## Existing Code to Reuse
[INLINE actual code/types/signatures from "Key Existing Code" — do NOT just list paths]

## Rules
- Only modify files in your list
- Run verification: [commands from CLAUDE.md]
- Stage only your files (never `git add .`)

## Lessons
[Relevant items from tasks/lessons.md]
```

### 4b. Spawn Wave

- Spawn all agents simultaneously via TeamCreate/Task with `mode: "bypassPermissions"`
- Print: **"Wave N: Spawned X agents — [tasks]"**
- As each completes: **"Wave N: agent-name completed (X/Y)"**
- 10-minute timeout per agent — check if stuck, stop and note failure
- Wait for all agents before next wave

### 4c. Wave Failure Handling

**ALL agents failed:**
- Print: **"Wave N failed — all X agents errored."** Show error summaries.
- AskUserQuestion: "Retry this wave" / "Skip to next wave" / "Abort milestone"

**SOME agents failed:**
- Print: **"Wave N: X/Y succeeded, Z failed."** Show failed agent errors.
- AskUserQuestion: "Retry failed agents" / "Continue without them" / "Abort milestone"

On success: **"Wave N complete. Proceeding to Wave N+1."**

### 4d. Between Waves

1. Run verification commands from CLAUDE.md
2. Check integration issues between agents' output
3. Fix issues before next wave
4. If verification fails and fixable in <2 minutes, fix it. Otherwise stop and report.

### 4e. Final Verification

After ALL waves:
1. Run full verification suite
2. Check all acceptance criteria for this milestone
3. If verification fails, attempt fix (max **3 attempts**):
   - Attempts 1-2: Print "Verification failed. Attempting fix (N/3)..."
   - After attempt 3: Print "Verification failed after 3 attempts. STOP." Show errors. AskUserQuestion: "Skip verification and continue" / "Fix manually and retry" / "Abort this milestone"
   - Do NOT loop beyond 3 attempts.

## Step 5 — Commit

Atomic commit for this milestone. Stage only files from this milestone's agents. Message: `feat: [milestone description] (Milestone N)`. Do NOT push unless asked.

## Step 6 — Update Docs

**Session state (ALWAYS):** Write `.claude/memory/session.md` (create dir if needed):
`Date | Developer | Branch | Working On: Milestone N: [Name] from [PRD] | Status: complete — [what was built] | Next: [Milestone N+1 or /flow:done] | Blockers: [any or None]`

**ROADMAP.md (ALWAYS):** Mark milestone as "Complete ([date])"

**Linear milestone (ALWAYS):** If `**Linear Project:**` in PRD and Linear MCP available: find completed milestone in Linear via `mcp__linear__list_milestones`, list its issues, move non-Done issues to "Done" via `mcp__linear__update_issue`. Print: "Linear: [N] issues → Done ([milestone name])". If 0 issues: print "Linear: [milestone name] — no issues to update". Skip silently if no Linear Project or MCP unavailable.

**STATE.md (LAST MILESTONE ONLY):** Update only if this was the LAST milestone (project complete): files created/modified count, commit SHA, milestone completion note. Keep "Active PRD" pointing to resolved path. Skip STATE.md for non-final milestones.

## Step 7 — Route Next Action (MANDATORY — FINAL STEP)

**STOP RULE:** After printing the output below, STOP IMMEDIATELY. Do NOT review comments, create PRs, run cleanup, or do any additional work. Post-milestone work belongs in a separate `/flow:go` or `/flow:task`.

Print this EXACT structure:

```
Milestone [N]: [Name] — Complete ✓
- [X] files created, [Y] modified
- Commit: [SHA]
- Verification: [passed/failed]

Next flow command:
→ /flow:go — execute Milestone [N+1]: [Next Milestone Name]
→ /flow:done — end session, update docs, generate handoff prompt
```

If this was the LAST milestone (no pending remain), replace "Next flow command" with:

```
All milestones complete — project done!
→ /flow:done — finalize project, auto-create PR, move issues to In Review (REQUIRED)
```

Do NOT suggest `/flow:go` when no milestones remain.

**CRITICAL:** The `/flow:done` line MUST appear in EVERY milestone completion output. Non-negotiable.
