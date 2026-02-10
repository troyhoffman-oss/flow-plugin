---
name: flow-spec
description: Spec interview that produces an executable PRD with wave-based phases and testable acceptance criteria
user_invocable: true
---

# /flow:spec — Spec Interview → Executable PRD

You are executing the `/flow:spec` skill. This is the KEYSTONE skill of the flow system. You will interview the user about their milestone, then produce a detailed PRD that agents can execute without ambiguity.

**Interview mode:** Always thorough by default. The user can say "done", "finalize", "that's enough", or "move on" at ANY time to wrap up early. Respect their signal and finalize with whatever depth has been achieved.

## Phase 1 — Context Gathering (automatic, no user input needed)

1. Read `.planning/STATE.md` and `.planning/ROADMAP.md` — understand current milestone and what's done
2. Read `CLAUDE.md` — understand project rules and tech stack
3. Read `PRD.md` if it exists — check for existing spec to build on
4. **Codebase scan** (brownfield projects):
   - Use Glob to find: components, pages/routes, API endpoints, types, utilities, config files, database models
   - Use Grep for: export patterns, route definitions, key function signatures
   - Build internal summary: "Here's what exists that we can reuse"
5. Print a brief context summary to the user: "Here's what I found in the codebase: [key components, patterns, data layer]. Starting the spec interview."

## Phase 2 — Adaptive Interview

Ask questions using AskUserQuestion. Cover these areas IN ORDER. Ask 2-3 questions at a time (not all at once).

**Round 1 — Scope:**
- What features are IN scope for this milestone?
- What is explicitly OUT of scope / deferred?
- Is there any code that is sacred (must NOT be touched)?

**Round 2 — User Stories:**
- What does the user actually DO? Walk through the key workflows.
- What should they see at each step?
- Frame as: "As [role], I want [action], so that [outcome]"
- Each story needs specific, testable acceptance criteria

**Round 3 — Technical Design:**
- What database changes are needed? (new tables, columns, indexes)
- What API endpoints? (method, path, request/response shape)
- What new files need to be created? What existing files modified?
- What existing utilities/components should be reused (not rebuilt)?

**Round 4 — Trade-offs & Constraints:**
- Performance vs. simplicity? What's good enough for v1?
- Any third-party dependencies or integrations?
- Mobile/responsive requirements?

**Round 5 — Implementation Phases:**
- How should this break into sequential phases?
- What can be parallelized within each phase?
- What's the critical path?

**Between rounds:** Update PRD.md draft progressively so the user can see it taking shape. Print: "Updated PRD draft. [brief summary of what was added]."

**User signals done:** If the user says "done", "finalize", "that's enough", "ship it", or similar — immediately skip remaining rounds and go to Phase 3.

## Phase 3 — PRD Generation

Write `PRD.md` to the project root with this EXACT structure:

```markdown
# [Milestone Name] — Specification

**Status:** Ready for execution
**Branch:** feat/[milestone-slug]
**Created:** [today's date]

## Overview
[One paragraph summary of the milestone]

## Problem Statement
[Why this work exists — what problem does it solve?]

## Scope

### In Scope
- [Bullet list of what ships in this milestone]

### Out of Scope
- [Explicitly deferred items]

### Sacred / Do NOT Touch
- [Code paths that must not be modified, with reasons]

## User Stories

### US-1: [Feature Name]
**Description:** As [role], I want [action], so that [outcome].
**Acceptance Criteria:**
- [ ] Specific, testable requirement (names actual functions/components)
- [ ] Another requirement
- [ ] [Verification command] passes

### US-2: [Feature Name]
...

## Technical Design

### New Database Tables
[SQL DDL or schema description, with indexes]

### New API Endpoints
[Method + path + request/response shape for each]

### New Files to Create
[Grouped by phase. Absolute paths with one-line descriptions]

### Existing Files to Modify
[Paths + what changes in each]

### Key Existing Code (DO NOT recreate — use as-is)
[Functions, utilities, DAL queries, components that agents should import/reuse]

## Implementation Phases

### Phase 1: [Name]
**Goal:** [One sentence]

**Wave 1 — [Theme] (N agents parallel):**
1. agent-name: Creates file1.ts, file2.ts — [what it does]
2. agent-name: Modifies file3.ts — [what changes]

**Wave 2 — [Theme] (N agents parallel):**
3. agent-name: Creates file4.ts — [what it does]
4. agent-name: Wires component into page — [specifics]

**Wave 3 — Integration:**
5. Integration check, responsive verification, cleanup

**Verification:** [Exact commands to run]
**Acceptance:** US-1 criteria [list which], US-2 criteria [list which]

### Phase 2: [Name]
...

## Execution Rules
1. DELEGATE EVERYTHING. Lead context is sacred — do not read implementation files into it.
2. Verify after every phase: [verification commands from CLAUDE.md]
3. Atomic commits after each agent's work lands
4. Never `git add .` — stage specific files only
5. Read `tasks/lessons.md` before spawning agents — inject relevant anti-patterns

## Definition of Done
- [ ] All user story acceptance criteria pass
- [ ] All phases verified with [verification commands]
- [ ] Branch pushed and PR opened
- [ ] STATE.md and ROADMAP.md updated
```

## Phase 4 — Post-PRD Updates

After writing PRD.md:

1. **Update ROADMAP.md:** Add phase breakdown under the current milestone section. Each phase gets a row in the progress table with status "Pending".

2. **Update STATE.md:** Set current phase to "Phase 1 — ready for `/flow:go`". Update "Next Actions" to reference the first phase.

3. **Generate Phase 1 handoff prompt:**
   ```
   Phase 1: [Name] — [short description]. Read STATE.md, ROADMAP.md, and PRD.md.
   [One sentence of context about what Phase 1 builds].
   ```

4. Print the handoff prompt in a fenced code block.

5. Print: "PRD ready. Run `/flow:go` to execute Phase 1, or review PRD.md first."

## Quality Gates

Before finalizing, self-check the PRD:
- [ ] Every phase has wave-based agent assignments with explicit file lists
- [ ] Every user story has checkbox acceptance criteria that are testable
- [ ] Every phase has verification commands
- [ ] "Key Existing Code" section references actual files/functions found in the codebase scan
- [ ] No phase has more than 5 agents in a single wave (too many = coordination overhead)
- [ ] Sacred code section is populated (even if empty with "None identified")

If any gate fails, fix the PRD before presenting it.
