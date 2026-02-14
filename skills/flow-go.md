---
name: flow:go
description: Execute the next milestone from PRD using wave-based agent teams
user_invocable: true
---

# /flow:go — Execute Next Milestone

You are executing the `/flow:go` skill. This reads the PRD, identifies the next unstarted milestone, and executes it using wave-based agent teams.

**Core principle:** The PRD is the execution contract. You execute what it specifies. Do not freelance.

**Plan mode warning:** Do NOT use this skill with plan mode enabled. `/flow:go` is execution — plan mode's read-only constraint prevents it from creating files, running agents, and committing work. The PRD is your plan; run `/flow:go` in normal mode.

**Skill boundary:** You are inside the `/flow:*` workflow. NEVER invoke, suggest, or reference skills from other workflow systems (`/lisa:*`, `/gsd:*`, `/superpowers:*`, etc.). Only suggest `/flow:*` commands as next steps. Do NOT use the Skill tool to call any non-flow skill. If the user needs a different workflow, they will invoke it themselves.

## Step 1 — Orient

Read these files (in parallel):
- `.planning/STATE.md` — current position
- `.planning/ROADMAP.md` — milestone progress
- `tasks/lessons.md` — active lessons (max 10 one-liners)
- `CLAUDE.md` — execution rules and verification commands
- `.claude/memory/session.md` (if exists) — personal session state

Run `git config user.name` to get developer identity.

### PRD Selection

The user must always select which PRD to execute. No silent auto-resolution.

1. **If the user passed an argument** (e.g., `/flow:go v3-payments`) — match it against files in `.planning/prds/` by slug or by the `**Project:**` header field. If an exact match is found, use it directly. If no match, show available PRDs and ask.

2. **If no argument** — list all PRD files in `.planning/prds/`. For each PRD, read its `**Status:**` and `**Project:**` header fields. Use AskUserQuestion to let the user pick which PRD to execute. Pre-select the first PRD with status "Ready for execution" as the first option. Always show the picker, even if only one PRD exists — the user may want to confirm or run `/flow:spec` instead. Also check for legacy `PRD.md` at root (backward compat) and include it in the list if found.

3. **No PRDs found** — "No PRDs found in `.planning/prds/`. Run `/flow:spec` first." Stop here.

**After selection:** Read the chosen PRD. If its `**Project:**` doesn't match STATE.md's current project, warn: "PRD project ([PRD project]) doesn't match current project ([STATE project]). Continuing, but verify you're executing the right spec."

**Assignment check:** After reading the PRD, check the current milestone section for an `**Assigned To:**` field. If present, compare against the developer identity from `git config user.name`. If assigned to a different developer, print: "⚠ This milestone is assigned to [other dev]. Proceeding anyway — override if intentional." Do NOT block execution — this is advisory only.

**Identify the next milestone:** Find the first milestone in ROADMAP.md with status "Pending" or the first unstarted milestone in the PRD.

## Step 2 — Pre-flight Checks

Run these checks before executing. If any fail, stop and tell the user what to do:

1. **PRD selected?** If PRD Selection (above) reached step 3 (no PRDs found): stop with the "No PRDs found" message.
2. **Milestone detailed enough?** The milestone section in the PRD must have:
   - Wave structure with agent assignments
   - Explicit file lists per agent
   - Verification commands
   - If missing: "PRD milestone section is too vague. Add wave structure + file lists, or run `/flow:spec`."
3. **Branch check:** Verify you're on the correct feature branch (from PRD header). If not, warn the user.
4. **All milestones done?** If no pending milestones remain: "All milestones complete! Run `/flow:done` to wrap up."

## Step 2.5 — Linear Status: In Progress

- Read the PRD header for `**Linear Project:**` field (name or URL)
- If present and Linear MCP tools are available:
  - Find the Linear project: `mcp__linear__get_project` with query matching project name
  - List milestones: `mcp__linear__list_milestones` for that project
  - Match current milestone name (e.g., "Milestone 2: Infrastructure Fixes") against Linear milestones
  - Find issues assigned to that milestone: `mcp__linear__list_issues` with project + milestone filter
  - For each issue in Backlog or Todo: `mcp__linear__update_issue` with `state: "In Progress"`
  - Print: "Linear: [N] issues → In Progress ([milestone name])"
- If no Linear Project in PRD header, or MCP not available: skip silently

## Step 3 — Staleness Check

Compare this milestone's PRD section against the actual codebase:
- Do the files it references still exist / have the expected structure?
- Were files created/deleted/significantly changed by prior milestones that affect this milestone?
- If stale references found: fix them in the PRD (update file paths, note structural changes) before proceeding. Print what you corrected.

Do NOT rewrite the milestone — just fix stale references so agents get accurate context.

## Step 4 — Execute Waves

For each wave defined in the PRD milestone section:

### 4a. Prepare Agent Prompts

For each agent in the wave, build a prompt containing:

```
You are [agent-name] working on Milestone [N]: [Milestone Name].

## Your Task
[Task description from PRD wave structure]

## Files to Create/Modify
[Exact file list from PRD — absolute paths]

## Acceptance Criteria
[Relevant criteria from the user stories this milestone covers]

## Existing Code to Reuse
[Inline the actual code/types/signatures from the "Key Existing Code" PRD section.
Do NOT just reference file paths — READ the files and INLINE the relevant code
so agents have it in their context without needing to search.]

## Rules
- Only modify files in your list. Do not touch anything else.
- Run verification after your work: [commands from CLAUDE.md]
- Stage only your files when committing (never `git add .` or `git add -A`)
- If you need output from another agent that isn't available yet, create a temporary stub and continue. Delete the stub before your final commit.

## Lessons (Rules to Follow)
[Relevant lessons from tasks/lessons.md — filter to lessons that apply to this agent's work]
```

### 4b. Spawn Wave

- Use TeamCreate or Task tool to spawn all agents in the wave simultaneously
- Each agent runs with `mode: "bypassPermissions"` for autonomous execution
- Print: **"Wave N: Spawned X agents — [agent-1-task], [agent-2-task], ..."**
- As each agent completes, print: **"Wave N: agent-name completed (X/Y)"**
- Set a reasonable timeout for each agent. If an agent hasn't completed after 10 minutes, check on it. If it's stuck, stop it and note the failure.
- Wait for all agents in the wave to complete (or timeout) before moving to the next wave

### 4c. Wave Failure Handling

After a wave completes, check results:

**If ALL agents in a wave failed:**
- Print: **"Wave N failed — all X agents errored."**
- Show error summaries from each agent
- Use AskUserQuestion: "Wave N failed completely. How to proceed?"
  - "Retry this wave"
  - "Skip to next wave"
  - "Abort milestone"

**If SOME agents failed but others succeeded:**
- Print: **"Wave N: X/Y agents succeeded, Z failed."**
- Show failed agent error summaries
- Use AskUserQuestion: "Some agents failed. How to proceed?"
  - "Retry failed agents"
  - "Continue without them"
  - "Abort milestone"

When a wave completes successfully (all agents or user chose to continue), print: **"Wave N complete. Proceeding to Wave N+1."**

### 4d. Between Waves

After each wave completes (and failure handling is resolved):
1. Run verification commands from CLAUDE.md (e.g., `npx tsc --noEmit`, `npx biome check`)
2. Check for integration issues between agents' output
3. Fix any issues before proceeding to the next wave
4. If verification fails and you can fix it quickly (< 2 minutes of work), fix it. Otherwise, stop and report.

### 4e. Final Verification

After ALL waves complete:
1. Run full verification suite
2. Check all acceptance criteria for this milestone's user stories
3. If verification fails, attempt to fix (max **3 attempts**):
   - After attempt 1 fails: Print **"Verification failed. Attempting fix (1/3)..."**
   - After attempt 2 fails: Print **"Verification failed. Attempting fix (2/3)..."**
   - After attempt 3 fails: Print **"Verification failed after 3 attempts. STOP."** Print the errors and use AskUserQuestion:
     - "Skip verification and continue"
     - "Fix manually and retry"
     - "Abort this milestone"
   - Do NOT loop further beyond 3 attempts.

## Step 5 — Commit

Create an atomic commit for this milestone:
- Stage only the files created/modified by this milestone's agents
- Commit message: `feat: [milestone description] (Milestone N)`
- Do NOT push unless the user asks

## Step 6 — Update Docs

**Session state (ALWAYS):** Write `.claude/memory/session.md` (create `.claude/memory/` directory if needed):
```
# Session State
**Date:** [today]
**Developer:** [git config user.name]
**Branch:** [current branch]
**Working On:** Milestone [N]: [Name] from [PRD name]
**Status:** Milestone [N] complete. [brief description of what was built]
**Next:** [Milestone N+1 name, or "/flow:done to finalize project"]
**Blockers:** [any, or "None"]
```

**ROADMAP.md (ALWAYS):** Mark this milestone as "Complete ([today's date])"

**STATE.md (LAST MILESTONE ONLY):** Update STATE.md only if this was the LAST milestone in the PRD (project complete). Update "What Was Built" section with:
- Files created/modified (count + key names)
- Commit SHA
- Milestone completion note
- Keep "Active PRD" field pointing to the resolved PRD path

For non-final milestones, skip STATE.md updates.

## Step 7 — Route Next Action (MANDATORY — FINAL STEP)

**STOP RULE:** This is the LAST thing you do. After printing the output below, STOP IMMEDIATELY. Do NOT:
- Review or resolve code review comments
- Create or update pull requests
- Run additional cleanup or refactoring
- Do any work beyond printing this summary

Any post-milestone work belongs in a SEPARATE `/flow:go` invocation or `/flow:task`.

Print this EXACT structure (fill in values):

```
Milestone [N]: [Name] — Complete ✓
- [X] files created, [Y] modified
- Commit: [SHA]
- Verification: [passed/failed]

Next flow command:
→ /flow:go — execute Milestone [N+1]: [Next Milestone Name]
→ /flow:done — end session, update docs, generate handoff prompt
```

If this was the LAST milestone in the PRD (no more pending milestones remain), replace the ENTIRE "Next flow command" block with:

```
All milestones complete — project done!
→ /flow:done — finalize project, auto-create PR, move issues to In Review (REQUIRED)
```

Do NOT suggest `/flow:go` when there are no remaining milestones — there is nothing left to execute.

**CRITICAL:** The `→ /flow:done` line MUST appear in EVERY milestone completion output, whether or not more milestones remain. This is non-negotiable. `/flow:done` is how session-end documentation happens.
