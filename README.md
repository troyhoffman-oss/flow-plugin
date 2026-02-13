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

## How It Works

**One-time setup**, then a repeating build cycle:

```
/flow:setup  →  /flow:spec  →  /flow:go  →  /flow:done
  (once,          (once per      (once per     (end of session,
  captures        milestone)      phase)        auto-transitions
  full roadmap)                                 between milestones)
```

1. **`/flow:setup`** — Scaffolds your project with planning docs and execution rules
2. **`/flow:spec`** — Interviews you, then writes an executable PRD with phases, acceptance criteria, and agent-team structure
3. **`/flow:go`** — Spawns parallel agent teams to build the next phase, verifies, commits
4. **`/flow:done`** — Updates docs, captures lessons, generates a handoff prompt so the next session starts instantly

Run `/flow:go` repeatedly until all phases are done, then `/flow:done` to wrap up. Next session, paste the handoff prompt and keep going.

## Commands

**The build cycle:**

| Command | When to use |
|---|---|
| `/flow:setup` | Once per project — creates `.planning/`, CLAUDE.md, templates |
| `/flow:spec` | Once per milestone — interview that produces the PRD |
| `/flow:go` | Once per phase — executes the next phase with agent teams |
| `/flow:done` | End of session — updates docs, generates handoff prompt |

**Standalone:**

| Command | When to use |
|---|---|
| `/flow:task` | Anytime — bug fixes, cleanup, small features (no PRD needed) |
| `/flow:milestone` | Anytime — add new milestones to the roadmap |

**Utility:**

| Command | When to use |
|---|---|
| `/flow:intro` | First time — walkthrough of the system |
| `/flow:status` | Anytime — where am I? What's next? |
| `/flow:update` | Anytime — update Flow to the latest version |

## What Gets Installed

```
~/.claude/
├── commands/flow/
│   ├── flow-setup.md         # 9 skill files
│   ├── flow-milestone.md
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

Every Flow project gets this structure via `/flow:setup`:

```
your-project/
├── CLAUDE.md              # Project-specific execution rules
├── PRD.md                 # Current milestone spec (created by /flow:spec)
├── .planning/
│   ├── STATE.md           # Session GPS — current status, next actions
│   ├── ROADMAP.md         # Milestone phases and progress
│   └── archive/           # Completed milestones and old PRDs
└── tasks/
    └── lessons.md         # Active lessons (max 10 one-liners) → promoted to CLAUDE.md
```

## The Lessons System

Flow's knowledge compounding is what makes it get better over time:

1. **Capture** — Mistake happens, one-liner written to `tasks/lessons.md` (max 10 active)
2. **Promote** — When full, most battle-tested lesson moves to `CLAUDE.md ## Learned Rules` (max 15 permanent)

Hard caps prevent context bloat. Total worst-case: ~30 lines of lessons context per session.

## Compatible With GSD

Flow uses the same `.planning/` directory structure as [GSD](https://github.com/gsd-framework/gsd). You can use `/gsd:debug`, `/gsd:map-codebase`, and other GSD commands alongside Flow.

## Requirements

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI with skills support.

## Links

- [Changelog](CHANGELOG.md) — what changed in each version
- [Contributing](CONTRIBUTING.md) — how to report bugs, suggest features, submit PRs
- [Design](DESIGN.md) — architecture decisions and system design

## License

MIT
