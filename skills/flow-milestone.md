---
name: flow:milestone
description: Add new milestones to the roadmap
user_invocable: true
---

# /flow:milestone — Add New Milestones

You are executing the `/flow:milestone` skill. This adds new milestones to the project roadmap.

## Guard: Project Must Exist

Check if `.planning/STATE.md` exists:
- **If it does NOT exist** → Print: "No project found. Run `/flow:setup` first." and **STOP.**
- **If it exists** → Continue.

## Step 1: Read Context

Read `.planning/STATE.md` and `.planning/ROADMAP.md` to understand:
- Current milestone status (what's active, what's complete, what's planned)
- What version numbers are already used

## Step 2: Show Current Status

Print a summary of the roadmap:
- List all milestones with their status (Complete, Pending, Planned, In Progress)
- Highlight the currently active milestone (if any)

## Step 3: Check for Active Work

If there is a milestone with status "Pending" or with incomplete phases (In Progress):
- Print: "Note: [milestone name] is currently active. New milestones will be added after existing planned milestones."

## Step 4: Gather New Milestones

Use AskUserQuestion:
- "How would you like to add milestones?" with options:
  - "I'll paste or describe them"
  - "One at a time (guided)"

**If paste/describe:**
- Accept free text (bullet list, paragraph, pasted doc — any format)
- Parse into milestones, each with a name + brief goal
- Print back: "Here's what I got:" followed by the parsed list
- Use AskUserQuestion to confirm: "Does this look right?" with options:
  - "Yes — looks good"
  - "Let me adjust" (user re-enters)

**If guided:**
- Ask: "What's this milestone called?" (name) and "What's the goal?" (one-sentence description)
- Then: "Add another milestone?" with options:
  - "Yes — add another"
  - "That's all"
- Repeat until user says that's all

## Step 5: Update Planning Docs

**ROADMAP.md:**
- Determine the next available version number (after existing milestones)
- Add new milestone rows to the table with status "Planned"
- Add new milestone sections with goals and "Run `/flow:spec` when this milestone is active."

**If no active milestone** (all existing milestones are "Complete" or there are none):
- Set the first new milestone's status to "Pending — needs `/flow:spec`"
- Update STATE.md to point to the new milestone as current

## Step 6: Print Completion Message

```
Added [N] milestone(s) to the roadmap:
[list of added milestones with version numbers]

[If a milestone was activated:]
v[X] [name] is now active. Run /flow:spec to plan it.

[If milestones were just queued:]
These will activate in order as you complete current milestones.
```
