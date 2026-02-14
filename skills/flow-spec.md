---
name: flow:spec
description: Spec interview that produces an executable PRD with wave-based phases and testable acceptance criteria
user_invocable: true
---

# /flow:spec — Spec Interview → Executable PRD

You are executing the `/flow:spec` skill. This is the KEYSTONE skill of the flow system. You will interview the user about their milestone, then produce a detailed PRD that agents can execute without ambiguity.

**Interview mode:** Always thorough by default. The user can say "done", "finalize", "that's enough", or "move on" at ANY time to wrap up early. Respect their signal and finalize with whatever depth has been achieved.

**Plan mode warning:** Do NOT use this skill with plan mode enabled. Plan mode's read-only constraint prevents the PRD from being written during the interview. `/flow:spec` IS the planning phase — plan mode on top of it is redundant and breaks the workflow.

**Skill boundary:** You are inside the `/flow:*` workflow. NEVER invoke, suggest, or reference skills from other workflow systems (`/lisa:*`, `/gsd:*`, `/superpowers:*`, etc.). Only suggest `/flow:*` commands as next steps. Do NOT use the Skill tool to call any non-flow skill. If the user needs a different workflow, they will invoke it themselves.

## Phase 1 — Context Gathering

1. Read `.planning/STATE.md` and `.planning/ROADMAP.md` — understand current milestone and what's done
2. Read `CLAUDE.md` — understand project rules and tech stack
3. Check for existing PRD:
   - List `.planning/prds/` directory (if it exists) for existing PRD files
   - Also check for legacy `PRD.md` at project root (backward compat)
   - If a PRD exists for the target milestone, note it for resume/extend flow
4. **Milestone Targeting** — determine which milestone this PRD targets before scanning the codebase:

   1. **If the user passed an argument** (e.g., `/flow:spec v3: Payments`) — match against ROADMAP.md milestones. If no match, print available milestones and ask which one.

   2. **If no argument** — read ROADMAP.md and list all incomplete milestones. Use AskUserQuestion to let the user pick which milestone to spec. Pre-select the next unspecced milestone as the first option. Always show the picker, even if only one milestone is listed — the user may want to confirm or choose "Other" to define a new milestone first.

   3. **Derive the PRD slug:** Take the milestone's version prefix and name (e.g., "v3: Dashboard Analytics"), lowercase it, replace spaces and special characters with hyphens, collapse consecutive hyphens. Result: `v3-dashboard-analytics`. The PRD path is `.planning/prds/{slug}.md`.

   4. **Check for existing PRD at that path:**
      - **If PRD exists** → Use AskUserQuestion: "A PRD already exists for this milestone at `.planning/prds/{slug}.md`. What would you like to do?"
        - "Resume editing" — load the existing PRD and continue the interview from where it left off
        - "Start fresh" — delete the existing PRD and start a new interview
        - "Pick a different milestone" — show available milestones
      - **If no PRD exists** → Proceed with a fresh interview

   5. **Future milestone detection:** If the target milestone is NOT the current milestone in STATE.md, note this — the PRD will be written but STATE.md's "Active PRD" field will NOT be updated (it stays pointing at the current milestone's PRD). Print: "Speccing future milestone [name]. STATE.md will not be updated — this PRD will be available when you reach this milestone."

5. **Codebase scan** (brownfield projects) — spawn **3 parallel Explore subagents** via the Task tool to scan the codebase without consuming main context:

   | Agent | Focus | Looks For |
   |-------|-------|-----------|
   | **Structure & Config** | Project skeleton, build tooling | `package.json`, `tsconfig`, config files, entry points, CI/CD, env setup |
   | **UI, Pages & Routes** | Components, pages, routing | `components/`, `pages/`, `app/`, route definitions, layouts, navigation |
   | **Data Layer & APIs** | Database, APIs, types | `api/`, `models/`, `types/`, `schemas/`, ORM definitions, query functions |

   **Each subagent prompt MUST include:**
   - **Exclusions:** NEVER scan `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `__pycache__/`, `*.min.js`, `*.map`, `*.lock`
   - **Size-adaptive scanning:** If the agent's domain has >200 files, switch to focused mode (entry points, config, and type definitions only)
   - **20-file sample cap per agent** (60 total across all 3)
   - **15-line summary max** — structured as: key files found, patterns observed, reusable code/components, notes
   - **Explicit instruction:** Do NOT return raw file contents — return only structured summaries

6. **Assemble summaries:** Collect the 3 agent summaries into a brief context block (~45 lines total). Print to user: "Here's what I found in the codebase: [key components, patterns, data layer]. Starting the spec interview."

## Phase 2 — Adaptive Interview

### CRITICAL RULES (follow these exactly)

1. **USE AskUserQuestion FOR ALL QUESTIONS.** Never just print questions as text. Always use the AskUserQuestion tool so the user gets structured prompts with selectable options. Provide 2-4 concrete options per question based on what you learned in Phase 1.

2. **ASK NON-OBVIOUS QUESTIONS.** Don't just ask "what features do you want?" — you already read the codebase. Ask questions that PROBE deeper:
   - "I see you have [existing pattern]. Should we extend that or build a new approach?"
   - "What happens when [edge case] occurs?"
   - "You mentioned [X] — does that mean [Y] is also needed, or is that separate?"
   - "What's the failure mode here? What does the user see when things go wrong?"
   - "Who else touches this data/workflow? Any downstream effects?"
   - "What's the minimum version of this that would be useful?"

3. **CONTINUE UNTIL THE USER SAYS STOP.** Do NOT stop after covering all 7 areas once. After each answer, immediately ask the next question. Keep going deeper until the user says "done", "finalize", "that's enough", "ship it", or similar. A thorough interview is 15-30 questions, not 5.

4. **MAINTAIN A RUNNING DRAFT.** Every 2-3 questions, update `.planning/prds/{slug}.md` with what you've learned so far (create `.planning/prds/` directory if it doesn't exist). Print: "Updated PRD draft — added [brief summary]." The user should see the spec taking shape in real-time, not all at the end.

5. **BE ADAPTIVE.** Base your next question on the previous answer. If the user reveals something surprising, probe deeper on THAT — don't robotically move to the next category. The best specs come from following interesting threads.

### First-Principles Mode (optional)

If the user says "challenge this", "first principles", or "push back" — start with 3-5 challenge questions before detailed spec gathering:
- "Why build this at all? What's the cost of NOT building it?"
- "Is there a simpler way to achieve 80% of this value?"
- "What assumptions are we making that might be wrong?"
- "Who is this really for, and have they asked for it?"
- "What would you cut if you had half the time?"

Then proceed to the coverage areas below.

### Coverage Areas

Cover these areas thoroughly. There are no "rounds" — move fluidly between areas based on the conversation. Circle back to earlier areas when later answers reveal new information.

**1. Scope Definition**
- What features are IN scope for this milestone? What's the MVP vs. the full vision?
- What is explicitly OUT of scope / deferred to a future milestone?
- Is there any code that is sacred (must NOT be touched)? Why?
- What existing code/features should we ignore entirely (not break, not improve, not touch)?

**2. User Stories (CRITICAL — spend the most time here)**
- What does the user actually DO? Walk through the key workflows step by step.
- What should they see at each step? What feedback do they get?
- Frame as: "As [role], I want [action], so that [outcome]"
- **Story-splitting:** If a story has more than 3-4 acceptance criteria, split it into smaller stories. Each story should be independently deliverable.
- **Anti-vagueness enforcement:**
  - BAD acceptance criteria: "Works correctly", "Is fast", "Handles errors well", "Looks good"
  - GOOD acceptance criteria: "Returns 200 with JSON body for valid input", "Shows error toast with message for invalid email format", "Page renders in < 200ms on 3G", "Matches Figma comp within 4px"
  - If the user gives vague criteria, push back: "How would you specifically test that? What would you check?"
- **Verification per story:** Each story must have at least one concrete verification step (a command to run, a page to visit, a state to check)

**3. Technical Design**
- What database changes are needed? (new tables, columns, indexes, migrations)
- What API endpoints? (method, path, request/response shape, auth requirements)
- What new files need to be created? What existing files get modified?
- What existing utilities/components/DAL queries should be reused (not rebuilt)?
- What's the data flow? Where does data originate, transform, and render?
- Any wave-parallelization opportunities? (independent agents building separate files)

**4. User Experience**
- What are the key user flows? Walk through click-by-click.
- What edge cases exist? (empty states, error states, loading states, partial data)
- Accessibility requirements? (keyboard navigation, screen readers, ARIA labels)
- Mobile/responsive behavior? (breakpoints, touch targets, layout shifts)
- What does the user see while waiting? (loading spinners, skeletons, optimistic updates)

**5. Trade-offs & Constraints**
- Performance vs. simplicity? What's good enough for v1?
- Any security considerations? (auth, data access, input validation)
- Any third-party dependencies or integrations?
- What technical debt is acceptable for now vs. must be done right?
- Any browser/device support requirements?

**6. Implementation Phases**
- How should this break into sequential phases?
- What can be parallelized within each phase? (wave-based agent structure)
- What's the critical path — what must be built first?
- What's the minimum viable first phase? (what gives us something testable fastest?)
- Any phases that could be cut if time runs short?
- **Assignability check:** After defining phases, probe which are independent enough for a different developer:
  - "Which of these phases could a second developer work on independently?"
  - Evaluate each phase for: dependency chains (does it need output from another phase?), domain independence (is it a separate concern?), context requirements (does it need deep codebase familiarity?), onboarding suitability (could a newer dev handle it?)
  - Add assignability notes to each phase, e.g., "Phase 3 is independent — good for either dev" or "Phase 2 depends on Phase 1 — same dev"

**7. Verification & Feedback Loops**
- What commands verify the build works? (`tsc`, `biome`, test suite)
- What does "done" look like for each phase? How do we know it worked?
- Are there integration points that need end-to-end testing?
- What should we check after each phase before moving to the next?
- Any monitoring or logging needed to confirm production behavior?

**User signals done:** If the user says "done", "finalize", "that's enough", "ship it", or similar — immediately stop interviewing and go to Phase 3. Finalize the PRD with whatever depth has been achieved.

## Phase 3 — PRD Generation

### Minimum Viable PRD Check

Before generating the final PRD, validate:
- At least **3 user stories** with acceptance criteria have been discussed
- At least **1 implementation phase** has been defined
- At least **1 verification command** has been specified

If any check fails, print what's missing and use AskUserQuestion:
- "The PRD is thin — [missing items]. Want to continue the interview to flesh it out, or finalize as-is?"
  - "Continue interview" — return to Phase 2 and probe the missing areas
  - "Finalize as-is" — proceed with what we have

### Write PRD

Write the PRD to `.planning/prds/{slug}.md` (create `.planning/prds/` directory first if it doesn't exist) with this EXACT structure:

```markdown
# [Milestone Name] — Specification

**Milestone:** [full milestone name, e.g., "v3: Dashboard Analytics"]
**Status:** Ready for execution
**Branch:** feat/[milestone-slug]
**Created:** [today's date]
**Assigned To:** [developer name or "unassigned"]

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
**Assigned To:** [developer name or "unassigned"]
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
**Assigned To:** [developer name or "unassigned"]
...

## Execution Rules
1. DELEGATE EVERYTHING. Lead context is sacred — do not read implementation files into it.
2. Verify after every phase: [verification commands from CLAUDE.md]
3. Atomic commits after each agent's work lands
4. Never `git add .` — stage specific files only
5. Read `tasks/lessons.md` before spawning agents — inject relevant lessons into agent prompts

## Definition of Done
- [ ] All user story acceptance criteria pass
- [ ] All phases verified with [verification commands]
- [ ] Branch pushed and PR opened
- [ ] STATE.md and ROADMAP.md updated
```

## Phase 4 — Post-PRD Updates

After writing the PRD to `.planning/prds/{slug}.md`:

1. **Update ROADMAP.md:** Add phase breakdown under the current milestone section. Each phase gets a row in the progress table with status "Pending".

2. **Update STATE.md** (current milestone only):
   - Set current phase to "Phase 1 — ready for `/flow:go`"
   - Set "Active PRD" to `.planning/prds/{slug}.md`
   - Update "Next Actions" to reference the first phase
   - **Skip this step if speccing a future milestone** — STATE.md stays pointing at the current milestone. Print: "PRD written to `.planning/prds/{slug}.md`. STATE.md not updated (future milestone)."

3. **Generate Phase 1 handoff prompt:**
   ```
   Phase 1: [Name] — [short description]. Read STATE.md, ROADMAP.md, and .planning/prds/{slug}.md.
   [One sentence of context about what Phase 1 builds].
   ```

4. **Linear Issue Creation (optional):**
   - Check if Linear MCP tools are available (try `mcp__linear__list_teams`)
   - If available: search for a Linear project matching the milestone name (`mcp__linear__list_projects` with query)
     - If found: create one Linear issue per phase under that project using `mcp__linear__create_issue`, with title "Phase N: [Name]" and description from PRD phase section. Set team to "Monument Square".
     - If not found: use AskUserQuestion to ask user to pick a project or skip Linear integration
   - If Linear MCP not available: skip silently (no error message)
   - Print count: "[N] Linear issues created under project [name]" (or "Linear integration skipped" if not available)

5. Print the handoff prompt in a fenced code block.

6. Print: "PRD ready at `.planning/prds/{slug}.md`. Run `/flow:go` to execute Phase 1, or review the PRD first."

## Quality Gates

Before finalizing, self-check the PRD:
- [ ] Every phase has wave-based agent assignments with explicit file lists
- [ ] Every user story has checkbox acceptance criteria that are testable
- [ ] Every phase has verification commands
- [ ] "Key Existing Code" section references actual files/functions found in the codebase scan
- [ ] PRD is written to `.planning/prds/{slug}.md`, NOT to root `PRD.md`
- [ ] No phase has more than 5 agents in a single wave (too many = coordination overhead)
- [ ] Sacred code section is populated (even if empty with "None identified")

If any gate fails, fix the PRD before presenting it.
