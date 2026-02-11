<p align="center">
  <h1 align="center">Flow</h1>
  <p align="center">A structured workflow system for Claude Code.<br/>Spec interviews. Agent-team execution. Session handoffs. Compounding knowledge.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/flow-cc"><img src="https://img.shields.io/npm/v/flow-cc.svg" alt="npm version"></a>
  <a href="https://github.com/troyhoffman-oss/flow-plugin/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/flow-cc.svg" alt="license"></a>
  <a href="https://www.npmjs.com/package/flow-cc"><img src="https://img.shields.io/npm/dm/flow-cc.svg" alt="downloads"></a>
</p>

---

## Install

```bash
npx flow-cc
```

One command. Installs skills, hooks, templates, and configures your statusLine. Works on Mac, Linux, and Windows.

## Why Flow?

Claude Code is powerful but unstructured. Without a system, you lose context between sessions, repeat mistakes, and waste tokens re-explaining what you've already decided.

Flow fixes this by giving Claude Code a **memory system and execution framework**:

- **Spec interviews** extract decisions upfront so agents execute instead of guessing
- **PRDs become execution contracts** that agent teams follow phase-by-phase
- **Session handoffs** preserve context across fresh sessions — no more "where was I?"
- **Lessons compound** — mistakes get captured, refined, and promoted into permanent rules

## Commands

| Command | What it does |
|---|---|
| `/flow:intro` | Walkthrough of the system — **start here** |
| `/flow:init` | Initialize a project with `.planning/` scaffolding, CLAUDE.md, templates |
| `/flow:spec` | Spec interview that produces an executable PRD with phased execution plan |
| `/flow:go` | Execute the next phase from the PRD using wave-based agent teams |
| `/flow:task` | Bug fixes, cleanup, small features — no PRD needed |
| `/flow:done` | Session-end documentation, lessons refinement, handoff prompt |
| `/flow:status` | Quick orientation — current milestone, phase progress, next actions |
| `/flow:update` | Update Flow to the latest version |

## How It Works

```
/flow:init → /flow:spec → /flow:go (repeat per phase) → /flow:done
                                                            ↓
                                              handoff prompt for next session

/flow:task  ← standalone path for bug fixes and small features
```

**The lifecycle in practice:**

1. **`/flow:init`** — Creates `.planning/` directory, CLAUDE.md, STATE.md, ROADMAP.md, lessons.md
2. **`/flow:spec`** — Interviews you about the milestone. Produces a PRD with wave-based phases, acceptance criteria, and agent-team structure
3. **`/flow:go`** — Reads the PRD, spawns parallel agent teams per wave, builds, verifies, commits
4. **`/flow:done`** — Updates all planning docs, captures lessons, generates a one-line handoff prompt so the next session starts instantly
5. **Repeat** — Next session picks up from the handoff. Context lives in the repo, not the conversation.

## What Gets Installed

```
~/.claude/
├── commands/flow/
│   ├── flow-init.md          # 8 skill files
│   ├── flow-spec.md
│   ├── flow-go.md
│   ├── flow-task.md
│   ├── flow-done.md
│   ├── flow-status.md
│   ├── flow-intro.md
│   ├── flow-update.md
│   ├── VERSION
│   └── templates/            # Project scaffolding templates
│       ├── CLAUDE.md.template
│       ├── STATE.md.template
│       ├── ROADMAP.md.template
│       └── lessons.md.template
├── hooks/
│   ├── flow-check-update.js  # Notifies when updates are available
│   └── flow-statusline.js    # Shows project context in statusLine
└── settings.json             # statusLine configured automatically
```

## Project Structure

Every Flow project gets this structure via `/flow:init`:

```
your-project/
├── CLAUDE.md              # Project-specific execution rules
├── PRD.md                 # Current milestone spec (created by /flow:spec)
├── .planning/
│   ├── STATE.md           # Session GPS — current status, next actions
│   ├── ROADMAP.md         # Milestone phases and progress
│   └── archive/           # Completed milestones and old PRDs
└── tasks/
    └── lessons.md         # Mistake catalog → refined into permanent rules
```

## The Lessons System

Flow's knowledge compounding is what makes it get better over time:

1. **Capture** — Mistake happens, lesson written to `tasks/lessons.md`
2. **Refine** — Each `/flow:done` merges duplicates, sharpens rules, removes obvious ones
3. **Promote** — Universal lessons move to `~/.claude/lessons.md` (all projects)
4. **Permanence** — Recurring patterns become rules in `CLAUDE.md`

The goal: fewer, sharper lessons over time — not an ever-growing list.

## Compatible With GSD

Flow uses the same `.planning/` directory structure as [GSD](https://github.com/gsd-framework/gsd). You can use `/gsd:debug`, `/gsd:map-codebase`, and other GSD commands alongside Flow.

## Requirements

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI with skills support.

## License

MIT
