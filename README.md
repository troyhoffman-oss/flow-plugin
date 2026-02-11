# Flow Plugin

**Formalized workflow skills for Claude Code. Turns a proven spec-interview, agent-team-execution, session-handoff pattern into reusable `/flow:*` commands.**

## What It Does

- `/flow:intro` -- Walkthrough of the system — **start here**
- `/flow:init` -- Initialize a new project or milestone with planning scaffolding
- `/flow:spec` -- Run a spec interview that produces an executable PRD with wave-based phases
- `/flow:task` -- Lightweight task execution — bug fixes, cleanup, small features without a PRD
- `/flow:go` -- Execute the next phase from the PRD using agent teams
- `/flow:done` -- Session-end docs, lessons refinement, and handoff prompt generation
- `/flow:status` -- Quick "where am I?" orientation
- `/flow:update` -- Pull latest and re-install skills from any session

## Installation

```bash
npx flow-cc
```

That's it. Installs all skills, hooks, templates, and configures your statusLine.

**Update:** Run `/flow:update` in any Claude Code session, or just `npx flow-cc` again.

## Getting Started

After installing, run `/flow:intro` in any Claude Code session. It explains the full lifecycle, what each command does, and typical usage patterns.

## How It Works

Skills install to `~/.claude/commands/flow/` and are immediately available in any Claude Code session. The workflow:

1. `/flow:init` -- Creates `.planning/` directory structure, CLAUDE.md, and initial docs
2. `/flow:spec` -- Interviews you about the milestone, produces PRD.md with wave-based phases
3. `/flow:go` -- Reads PRD, spawns agent teams per wave structure, verifies, commits
4. `/flow:task` -- Quick fixes and small features — executes, verifies, commits (no PRD needed)
5. `/flow:done` -- Updates STATE.md, ROADMAP.md, lessons.md, generates handoff prompt
6. `/flow:status` -- Read-only orientation check

## Lifecycle

```
/flow:init -> /flow:spec -> /flow:go (repeat per phase) -> /flow:done
                                                               |
                                                handoff prompt for next session

/flow:task  ← standalone path for bug fixes, cleanup, small features (no PRD needed)
```

## Compatible with GSD

Uses the same `.planning/` directory structure. You can still use `/gsd:debug`, `/gsd:map-codebase`, etc. alongside Flow commands.

## Philosophy

- Front-load decisions into the spec interview, making execution simple
- Knowledge compounds through lessons.md to CLAUDE.md promotion lifecycle
- Fresh context per session; memory lives in the repo, not the conversation
- PRD is the execution contract -- agents execute what was specified

## Requirements

Claude Code CLI with skills support.
