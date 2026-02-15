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

---

## Why Flow?

Claude Code is powerful but unstructured. Without a system, you lose context between sessions, repeat mistakes, and waste tokens re-explaining what you've already decided.

Flow gives Claude Code a **memory system and execution framework**:

- **Spec interviews** extract decisions upfront so agents execute instead of guessing
- **Per-project PRDs** in `.planning/prds/` become execution contracts — spec future projects in parallel
- **Wave-based agent teams** execute milestones autonomously with built-in verification
- **Session handoffs** preserve full context across fresh sessions — no more "where was I?"
- **Lessons compound** — mistakes get captured, refined, and promoted into permanent rules

---

## How It Works

**One-time setup**, then a repeating build cycle:

```
/flow:setup  →  /flow:triage  →  /flow:spec  →  /flow:go  →  /flow:done
  (once)          (intake)         (plan)         (build)       (wrap)
```

1. **`/flow:setup`** — Scaffolds your project with planning docs and execution rules
2. **`/flow:spec`** — Interviews you, then writes an executable PRD with milestones, acceptance criteria, and agent-team structure
3. **`/flow:go`** — Spawns parallel agent teams to build the next milestone, verifies, commits
4. **`/flow:done`** — Updates docs, captures lessons, generates a handoff prompt so the next session starts instantly

Run `/flow:go` repeatedly until all milestones are done, then `/flow:done` to wrap up. Next session, paste the handoff prompt and keep going.

---

## Multi-PRD: Parallel Project Planning

<table>
<tr>
<td width="50%">

**Before (single PRD)**
```
project/
└── PRD.md          ← one at a time
```
Finish or archive the current project before speccing the next. Serial bottleneck on large roadmaps.

</td>
<td width="50%">

**Now (per-project PRDs)**
```
.planning/prds/
├── user-auth.md          ← active
├── dashboard.md          ← pre-specced
└── payments.md           ← pre-specced
```
Spec any project at any time. Execute the current one while planning ahead.

</td>
</tr>
</table>

**How it works:**

- `/flow:spec` writes PRDs to `.planning/prds/{slug}.md` — one file per project
- `/flow:spec Payments` targets a specific future project without changing your current position
- PRD resolution matches the current git branch against each PRD's `**Branch:**` header — STATE.md "Active PRD" is fallback
- Smart resolution: user argument > STATE.md > slug derivation > legacy fallback
- Existing `PRD.md` at root? Still works — legacy files are consumed transparently and migrated on archive

---

## Commands

### The Build Cycle

| Command | When | What it does |
|---|---|---|
| `/flow:setup` | Once per project | Creates `.planning/`, CLAUDE.md, templates, full roadmap |
| `/flow:spec` | Once per project | Interview that produces an executable PRD in `.planning/prds/` |
| `/flow:go` | Once per milestone | Executes the next milestone with wave-based agent teams |
| `/flow:done` | End of session | Updates docs, captures lessons, generates handoff prompt |

### Standalone

| Command | When | What it does |
|---|---|---|
| `/flow:task` | Anytime | Bug fixes, cleanup, small features — no PRD needed |
| `/flow:triage` | Anytime | Brain dump → categorized Linear issues, milestones, ROADMAP entries, lessons |

### Utility

| Command | When | What it does |
|---|---|---|
| `/flow:intro` | First time | Walkthrough of the entire system |
| `/flow:status` | Anytime | Where am I? What's next? Shows PRD inventory |
| `/flow:update` | Anytime | Update Flow to the latest version |

---

## Project Structure

Every Flow project gets this structure via `/flow:setup`:

```
your-project/
├── CLAUDE.md                    # Execution rules + learned rules
├── .claude/
│   └── memory/
│       └── session-{branch}.md  # Per-branch session state (gitignored)
├── .planning/
│   ├── STATE.md                 # Project-level GPS — shared across developers
│   ├── ROADMAP.md               # Project milestones and progress tracking
│   ├── prds/                    # Per-project PRD specs
│   │   ├── user-auth.md         #   One file per project
│   │   └── dashboard.md         #   Pre-spec future projects anytime
│   └── archive/                 # Completed projects and archived PRDs
└── tasks/
    └── lessons.md               # Active lessons (max 10) → promoted to CLAUDE.md
```

---

## What Gets Installed

```
~/.claude/
├── commands/flow/
│   ├── flow-setup.md            # 9 skill files
│   ├── flow-spec.md
│   ├── flow-go.md
│   ├── flow-task.md
│   ├── flow-done.md
│   ├── flow-status.md
│   ├── flow-intro.md
│   ├── flow-triage.md
│   ├── flow-update.md
│   ├── VERSION
│   └── templates/               # Project scaffolding templates
│       ├── CLAUDE.md.template
│       ├── STATE.md.template
│       ├── ROADMAP.md.template
│       ├── lessons.md.template
│       └── session.md.template
├── hooks/
│   ├── flow-check-update.js     # Notifies when updates are available
│   └── flow-statusline.js       # Shows project context in statusLine
└── settings.json                # statusLine configured automatically
```

---

## The Lessons System

Flow's knowledge compounding is what makes it get better over time:

1. **Capture** — Mistake happens, one-liner written to `tasks/lessons.md` (max 10 active)
2. **Promote** — When full, most battle-tested lesson moves to `CLAUDE.md ## Learned Rules` (max 15 permanent)

Hard caps prevent context bloat. Total worst-case: ~30 lines of lessons context per session.

---

## Multi-Developer Support

Flow supports multiple developers on the same repo without conflicts:

- **Branch-scoped sessions** — Each branch gets its own session file at `.claude/memory/session-{branch-slug}.md` (gitignored). Multiple terminals on different branches never conflict. Same-branch conflicts are prevented by Linear assignment (one dev per issue/branch).
- **Branch-based PRD resolution** — Skills match the current git branch against each PRD's `**Branch:**` header to find the active PRD. STATE.md "Active PRD" is fallback.
- **Cross-developer awareness** — `/flow:status` shows all active sessions across branches. `/flow:go` warns if another developer was recently active on the same branch.
- **`STATE.md`** — Shared project-level state in `.planning/STATE.md`. Updated at project boundaries only (not every session), so conflicts are rare.

---

## Linear Integration

Flow optionally integrates with Linear via MCP for issue tracking:

- **`/flow:spec`** can create Linear issues automatically from PRD milestones
- **`/flow:done`** can post progress comments to Linear issues
- **`/flow:triage`** sorts unstructured brain dumps into categorized Linear issues, ROADMAP entries, and lessons
- **Branch convention** `feat/msig-{issue#}-desc` auto-links PRs to Linear issues
- **Auto-close** — `Closes MSIG-XX` in PR body triggers Linear status transition on merge

Requires the [Linear MCP server](https://www.npmjs.com/package/@anthropic/linear-mcp-server) to be configured.

---

## Compatible With GSD

Flow uses the same `.planning/` directory structure as [GSD](https://github.com/gsd-framework/gsd). You can use `/gsd:debug`, `/gsd:map-codebase`, and other GSD commands alongside Flow without conflict.

---

## Requirements

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI with skills support.

## Links

- [Changelog](CHANGELOG.md) — what changed in each version
- [Contributing](CONTRIBUTING.md) — how to report bugs, suggest features, submit PRs
- [Design](DESIGN.md) — architecture decisions and system design

## License

MIT
