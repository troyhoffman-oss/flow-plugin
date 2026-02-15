---
name: flow:spec
description: Spec interview that produces an executable PRD with wave-based milestones and testable acceptance criteria
user_invocable: true
---

# /flow:spec — Spec Interview → Executable PRD

You are executing the `/flow:spec` skill. This is the KEYSTONE skill of the flow system. You will interview the user about their project, then produce a detailed PRD that agents can execute without ambiguity.

**Interview mode:** Always thorough by default. The user can say "done", "finalize", "that's enough", or "move on" at ANY time to wrap up early. Respect their signal and finalize with whatever depth has been achieved.

**Constraints:** Do NOT use with plan mode (prevents file writes). Only use `/flow:*` commands — never invoke `/lisa:*`, `/gsd:*`, `/superpowers:*` or other skills.

## Phase 1 — Context Gathering

1. Read `.planning/STATE.md`, `.planning/ROADMAP.md`, `CLAUDE.md`
2. Check for existing PRD in `.planning/prds/` (or legacy root `PRD.md`)
3. **Project Targeting:**

   1. **If argument provided** (e.g., `/flow:spec v3: Payments`) — match against ROADMAP.md projects. If no match, print available projects and ask.

   2. **If no argument** — list incomplete projects from ROADMAP.md. Use AskUserQuestion to let the user pick. Pre-select the next unspecced project. Always show the picker.

   3. **Derive PRD slug:** Lowercase project name, replace spaces/special chars with hyphens, collapse consecutive hyphens. PRD path: `.planning/prds/{slug}.md`.

   4. **If PRD exists at that path** → AskUserQuestion: "A PRD already exists at `.planning/prds/{slug}.md`. What would you like to do?" Options: "Resume editing", "Start fresh", "Pick a different project".
      **If no PRD** → fresh interview.

   5. **Future project detection:** If target project != STATE.md current project, note it — STATE.md won't be updated. Print: "Speccing future project [name]. STATE.md will not be updated."

4. **Codebase scan** (brownfield) — spawn **3 parallel Explore subagents** via Task tool:
   - **Structure & Config** — project skeleton, build tooling, entry points, CI/CD
   - **UI, Pages & Routes** — components, pages, routing, layouts, navigation
   - **Data Layer & APIs** — database, APIs, types, schemas, ORM, queries

   All agents: exclude `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `__pycache__/`, `*.min.js`, `*.map`, `*.lock`. If domain has >200 files, switch to focused mode (entry points, config, types only). 20-file cap per agent. Return 15-line structured summary only — no raw file contents.

5. **Assemble summaries:** Collect 3 agent summaries (~45 lines total). Print: "Here's what I found in the codebase: [key components, patterns, data layer]. Starting the spec interview."

## Phase 2 — Adaptive Interview

### Critical Rules

1. **USE AskUserQuestion FOR ALL QUESTIONS.** Provide 2-4 concrete options per question based on Phase 1 context.
2. **ASK NON-OBVIOUS QUESTIONS.** Probe deeper — edge cases, failure modes, downstream effects, minimum viable versions. Don't ask what you can infer from the codebase.
3. **CONTINUE UNTIL THE USER SAYS STOP.** A thorough interview is 15-30 questions. After each answer, immediately ask the next question.
4. **MAINTAIN A RUNNING DRAFT.** Every 2-3 questions, update `.planning/prds/{slug}.md` with what you've learned (create dir if needed). Print: "Updated PRD draft — added [brief summary]."
5. **BE ADAPTIVE.** Base next question on previous answer. Follow interesting threads rather than robotically moving through categories.

### First-Principles Mode (optional)

Trigger: user says "challenge this", "first principles", or "push back". Ask 3-5 challenges first: Why build this? Simpler 80% alternative? What assumptions might be wrong? Then proceed to coverage areas.

### Coverage Areas

Cover these fluidly — no rigid rounds. Circle back when later answers reveal new info.

**1. Scope Definition** — What's in/out of scope? MVP vs full vision? Sacred code?

**2. User Stories (CRITICAL — most time here)** — Walk through key workflows step by step.
- **Story-splitting:** If a story has >3-4 acceptance criteria, split it. Each story independently deliverable.
- **Anti-vagueness:** BAD: "Works correctly", "Is fast". GOOD: "Returns 200 with JSON body", "Page renders in <200ms on 3G". Push back on vague criteria: "How would you specifically test that?"
- **Verification per story:** Each must have at least one concrete verification step.

**3. Technical Design** — DB changes, API endpoints, new/modified files, reusable code, data flow, parallelization opportunities.

**4. User Experience** — Key flows, edge cases (empty/error/loading states), accessibility, responsive behavior.

**5. Trade-offs & Constraints** — Performance vs simplicity, security, third-party deps, acceptable tech debt.

**6. Implementation Milestones** — Sequential breakdown, parallelization within milestones, critical path, cuttable milestones.
- **Assignability check:** Probe which milestones could go to a second developer. Evaluate dependency chains, domain independence, context requirements. Add assignability notes per milestone.

**7. Verification & Feedback Loops** — Build verification commands, per-milestone "done" criteria, integration testing, monitoring.

**User signals done:** If user says "done"/"finalize"/"ship it" — immediately go to Phase 3.

## Phase 3 — PRD Generation

### Minimum Viable PRD Check

Validate: at least **3 user stories** with acceptance criteria, **1 milestone**, **1 verification command**. If missing, AskUserQuestion: "Continue interview" or "Finalize as-is".

### Write PRD

Write to `.planning/prds/{slug}.md` (create dir if needed) with this structure:

```markdown
# [Project Name] — Specification

**Project:** [name]
**Status:** Ready for execution
**Branch:** feat/{project-slug}
**Created:** [date]
**Assigned To:** [developer or "unassigned"]
**Linear Project:** [Linear project name if linked, or blank]

## Overview
[One paragraph summary]

## Problem Statement
[Why this work exists]

## Scope

### In Scope
- [items]

### Out of Scope
- [deferred items]

### Sacred / Do NOT Touch
- [protected code paths with reasons]

## User Stories

### US-1: [Feature Name]
**Description:** As [role], I want [action], so that [outcome].
**Acceptance Criteria:**
- [ ] Specific, testable requirement (names actual functions/components)
- [ ] [Verification command] passes

(Continue US-2, US-3, etc.)

## Technical Design

Subsections: New Database Tables, New API Endpoints, New Files to Create (grouped by milestone), Existing Files to Modify, Key Existing Code (DO NOT recreate — use as-is).

## Implementation Milestones

### Milestone 1: [Name]
**Assigned To:** [developer or "unassigned"]
**Goal:** [One sentence]

**Wave 1 — [Theme] (N agents parallel):**
1. agent-name: Creates/modifies files — [what it does]
2. agent-name: Creates/modifies files — [what changes]

(Continue waves as needed)

**Verification:** [Exact commands]
**Acceptance:** [Which US criteria this covers]

(Continue Milestone 2, etc.)
```

> The `**Branch:**` field is the primary key for PRD resolution. Downstream skills match the current git branch against this field to find the active PRD.

## Phase 4 — Post-PRD Updates

After writing the PRD:

1. **Update ROADMAP.md:** Add milestone breakdown under the project section. Each milestone gets status "Pending".

2. **Update STATE.md** (current project only): Set milestone to "Milestone 1 — ready for `/flow:go`", set "Active PRD" path, update "Next Actions". **Skip if speccing a future project** — print: "PRD written. STATE.md not updated (future project)."

3. **Generate Milestone 1 handoff prompt:**
   ```
   Milestone 1: [Name] — [description]. Read STATE.md, ROADMAP.md, and .planning/prds/{slug}.md.
   [One sentence of context].
   ```

4. **Linear Integration (optional):**
   - Check if Linear MCP tools are available (`mcp__linear__list_teams`)
   - If available: search for matching Linear project (`mcp__linear__list_projects`)
     - Found: use it. Not found: AskUserQuestion to pick existing project or skip Linear
   - Add `**Linear Project:** [project name]` to the PRD header (after `**Assigned To:**`)
   - For each implementation milestone: create a **Linear milestone** (`mcp__linear__create_milestone`) under the project
   - For each user story: create a **Linear issue** (`mcp__linear__create_issue`) with BOTH `projectId` AND `projectMilestoneId` set — assign to the milestone whose `**Acceptance:**` field references that story. Title: "US-N: [story name]"
   - **Critical:** Every issue MUST have `projectMilestoneId` set. Issues without milestone assignment break downstream status tracking.
   - If MCP unavailable: skip silently
   - Print: "[N] milestones + [M] issues created under [project name]"

5. Print handoff prompt in a fenced code block.

6. Print: "PRD ready at `.planning/prds/{slug}.md`. Run `/flow:go` to execute Milestone 1, or review the PRD first."

## Quality Gates

Before finalizing, self-check:
- [ ] Every milestone has wave-based agent assignments with explicit file lists
- [ ] Every user story has checkbox acceptance criteria that are testable
- [ ] Every milestone has verification commands
- [ ] "Key Existing Code" references actual files/functions from the codebase scan
- [ ] PRD written to `.planning/prds/{slug}.md`, NOT root `PRD.md`
- [ ] No milestone has >5 agents in a single wave
- [ ] Sacred code section is populated (even if "None identified")

If any gate fails, fix the PRD before presenting it.
