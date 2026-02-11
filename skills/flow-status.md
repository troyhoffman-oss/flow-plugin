---
name: flow:status
description: Quick orientation — shows current milestone, phase progress, and next actions
user_invocable: true
---

# /flow:status — Quick Orientation

You are executing the `/flow:status` skill. This is a READ-ONLY operation. Do NOT modify any files.

## Steps

1. **Read context files:**
   - Read `.planning/STATE.md`
   - Read `.planning/ROADMAP.md`
   - If either file is missing, print: "No flow project found. Run `/flow:init` to set up."

2. **Extract and display:**
   - Current milestone name and version
   - Phase progress (e.g., "5/9 phases complete")
   - Last session date and what was built
   - Next phase name and description
   - Count of lessons in `tasks/lessons.md` (if it exists)

3. **Print concise status block:**

```
Milestone: [name] ([X/Y] phases complete)
Last session: [date] — [what was built]
Next: Phase [N] — [name] ([short description])
Lessons: [N] rules ([N] added last session)

-> /flow:go to execute Phase [N]
-> /flow:done if wrapping up
-> /flow:spec if PRD needs updates
```

4. **No file writes.** This is purely informational.
