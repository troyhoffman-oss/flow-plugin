---
name: flow:milestone
description: Archive completed milestone and start a new one
user_invocable: true
---

# /flow:milestone — Start New Milestone

You are executing the `/flow:milestone` skill. This archives the current milestone and sets up a new one.

## Guard: Project Must Exist

Check if `.planning/STATE.md` exists:
- **If it does NOT exist** → Print: "No project found. Run `/flow:setup` first." and **STOP.**
- **If it exists** → Continue.

## Step 1: Read Context

Read `.planning/STATE.md` and `.planning/ROADMAP.md` to understand:
- What milestone just completed (or is completing)
- What version number to use next
- Current state of the project

## Step 2: Check for Pending Phases

Parse ROADMAP.md for the current milestone's phases:
- If any phases have status "Pending" or "In Progress" (not complete):
  - Print: "Warning: The current milestone has incomplete phases:"
  - List the pending/in-progress phases
  - Use AskUserQuestion: "Archive this milestone anyway?" with options:
    - "Yes — archive and move on"
    - "No — finish current phases first"
  - If the user says No → Print: "Run `/flow:go` to continue the current milestone." and **STOP.**

## Step 3: Ask Milestone Question

Use AskUserQuestion:
- "What's the goal of this new milestone?" (free text)
- "What should it be called?" (free text, or suggest a name based on context)

## Step 4: Archive Completed Milestone

1. Read current ROADMAP.md phase details for the completed milestone
2. Write them to `.planning/archive/milestones-vX.md` (where X is the completed version)
3. If `PRD.md` exists, move it to `.planning/archive/PRD-vX.md` (read it, write to archive, delete original)
4. In ROADMAP.md, replace the completed milestone's phase details with just the summary row (mark as "Complete")

## Step 5: Update Planning Docs

**ROADMAP.md:**
- Add new milestone row to the table
- Add new milestone section with goal and "Run `/flow:spec` to define phases"

**STATE.md:**
- Replace with fresh state for the new milestone
- Reset phase progress table
- Note the milestone transition in "What Was Built"

## Step 6: Print Completion Message

```
Milestone [name] (v[X]) initialized.
- Archived: previous milestone details + PRD
- Updated: ROADMAP.md, STATE.md

Run `/flow:spec` to build the PRD for this milestone.
```
