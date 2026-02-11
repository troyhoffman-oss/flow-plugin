---
name: flow:go
description: Execute the next phase from PRD using wave-based agent teams
user_invocable: true
---

# /flow:go — Execute Next Phase

You are executing the `/flow:go` skill. This reads the PRD, identifies the next unstarted phase, and executes it using wave-based agent teams.

**Core principle:** The PRD is the execution contract. You execute what it specifies. Do not freelance.

## Step 1 — Orient

Read these files (in parallel):
- `.planning/STATE.md` — current position
- `.planning/ROADMAP.md` — phase progress
- `PRD.md` — the execution spec
- `tasks/lessons.md` — anti-patterns to avoid
- `CLAUDE.md` — execution rules and verification commands

**Identify the next phase:** Find the first phase in ROADMAP.md with status "Pending" or the first unstarted phase in the PRD.

## Step 2 — Pre-flight Checks

Run these checks before executing. If any fail, stop and tell the user what to do:

1. **PRD exists?** If `PRD.md` is missing: "No PRD found. Run `/flow:spec` first."
2. **Phase detailed enough?** The phase section in the PRD must have:
   - Wave structure with agent assignments
   - Explicit file lists per agent
   - Verification commands
   - If missing: "PRD phase section is too vague. Add wave structure + file lists, or run `/flow:spec`."
3. **Branch check:** Verify you're on the correct feature branch (from PRD header). If not, warn the user.
4. **All phases done?** If no pending phases remain: "All phases complete! Run `/flow:done` to wrap up, or `/flow:milestone` for the next milestone."

## Step 3 — Staleness Check

Compare this phase's PRD section against the actual codebase:
- Do the files it references still exist / have the expected structure?
- Were files created/deleted/significantly changed by prior phases that affect this phase?
- If stale references found: fix them in the PRD (update file paths, note structural changes) before proceeding. Print what you corrected.

Do NOT rewrite the phase — just fix stale references so agents get accurate context.

## Step 4 — Execute Waves

For each wave defined in the PRD phase section:

### 4a. Prepare Agent Prompts

For each agent in the wave, build a prompt containing:

```
You are [agent-name] working on Phase [N]: [Phase Name].

## Your Task
[Task description from PRD wave structure]

## Files to Create/Modify
[Exact file list from PRD — absolute paths]

## Acceptance Criteria
[Relevant criteria from the user stories this phase covers]

## Existing Code to Reuse
[Inline the actual code/types/signatures from the "Key Existing Code" PRD section.
Do NOT just reference file paths — READ the files and INLINE the relevant code
so agents have it in their context without needing to search.]

## Rules
- Only modify files in your list. Do not touch anything else.
- Run verification after your work: [commands from CLAUDE.md]
- Stage only your files when committing (never `git add .` or `git add -A`)
- If you need output from another agent that isn't available yet, create a temporary stub and continue. Delete the stub before your final commit.

## Anti-Patterns to Avoid
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
  - "Abort phase"

**If SOME agents failed but others succeeded:**
- Print: **"Wave N: X/Y agents succeeded, Z failed."**
- Show failed agent error summaries
- Use AskUserQuestion: "Some agents failed. How to proceed?"
  - "Retry failed agents"
  - "Continue without them"
  - "Abort phase"

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
2. Check all acceptance criteria for this phase's user stories
3. If verification fails, attempt to fix (max **3 attempts**):
   - After attempt 1 fails: Print **"Verification failed. Attempting fix (1/3)..."**
   - After attempt 2 fails: Print **"Verification failed. Attempting fix (2/3)..."**
   - After attempt 3 fails: Print **"Verification failed after 3 attempts. STOP."** Print the errors and use AskUserQuestion:
     - "Skip verification and continue"
     - "Fix manually and retry"
     - "Abort this phase"
   - Do NOT loop further beyond 3 attempts.

## Step 5 — Commit

Create an atomic commit for this phase:
- Stage only the files created/modified by this phase's agents
- Commit message: `feat: [phase description] (Phase N)`
- Do NOT push unless the user asks

## Step 6 — Update Docs

**STATE.md:** Update "What Was Built" section with:
- Files created/modified (count + key names)
- Commit SHA
- Phase completion note

**ROADMAP.md:** Mark this phase as "Complete ([today's date])"

## Step 7 — Route Next Action

Print phase summary:
```
Phase [N]: [Name] — Complete
- [X] files created, [Y] modified
- Commit: [SHA]
- Verification: passed

Next:
- /flow:go for Phase [N+1]: [Next Phase Name]
- /flow:done to end session
```

If this was the last phase: "All phases complete! Run `/flow:done` to finalize."
