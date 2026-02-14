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
- **Per-milestone PRDs** in `.planning/prds/` become execution contracts — spec future milestones in parallel
- **Wave-based agent teams** execute phases autonomously with built-in verification
- **Session handoffs** preserve full context across fresh sessions — no more "where was I?"
- **Lessons compound** — mistakes get captured, refined, and promoted into permanent rules

---

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

---

## Multi-PRD: Parallel Milestone Planning

<table>
<tr>
<td width="50%">

**Before (single PRD)**
```
project/
└── PRD.md          ← one at a time
```
Finish or archive the current milestone before speccing the next. Serial bottleneck on large roadmaps.

</td>
<td width="50%">

**Now (per-milestone PRDs)**
```
.planning/prds/
├── v1-user-auth.md       ← active
├── v2-dashboard.md       ← pre-specced
└── v3-payments.md        ← pre-specced
```
Spec any milestone at any time. Execute the current one while planning ahead.

</td>
</tr>
</table>

**How it works:**

- `/flow:spec` writes PRDs to `.planning/prds/{version-slug}.md` — one file per milestone
- `/flow:spec v3: Payments` targets a specific future milestone without changing your current position
- STATE.md tracks the **Active PRD** field so `/flow:go` always knows which spec to execute
- Smart resolution: user argument > STATE.md > slug derivation > legacy fallback
- Existing `PRD.md` at root? Still works — legacy files are consumed transparently and migrated on archive

---

## Commands

### The Build Cycle

| Command | When | What it does |
|---|---|---|
| `/flow:setup` | Once per project | Creates `.planning/`, CLAUDE.md, templates, full roadmap |
| `/flow:spec` | Once per milestone | Interview that produces an executable PRD in `.planning/prds/` |
| `/flow:go` | Once per phase | Executes the next phase with wave-based agent teams |
| `/flow:done` | End of session | Updates docs, captures lessons, generates handoff prompt |

### Standalone

| Command | When | What it does |
|---|---|---|
| `/flow:task` | Anytime | Bug fixes, cleanup, small features — no PRD needed |
| `/flow:triage` | Anytime | Brain dump → categorized Linear issues, ROADMAP entries, lessons |
| `/flow:milestone` | Anytime | Add new milestones to the roadmap |

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
│       └── session.md           # Per-developer session state (gitignored)
├── .planning/
│   ├── STATE.md                 # Project-level GPS — shared across developers
│   ├── ROADMAP.md               # Milestone phases and progress tracking
│   ├── prds/                    # Per-milestone PRD specs
│   │   ├── v1-user-auth.md      #   One file per milestone
│   │   └── v2-dashboard.md      #   Pre-spec future milestones anytime
│   └── archive/                 # Completed milestones and archived PRDs
└── tasks/
    └── lessons.md               # Active lessons (max 10) → promoted to CLAUDE.md
```

---

## What Gets Installed

```
~/.claude/
├── commands/flow/
│   ├── flow-setup.md            # 10 skill files
│   ├── flow-milestone.md
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

- **`session.md`** — Per-developer session state, stored in `.claude/memory/session.md` (gitignored). Each developer has their own session GPS that never conflicts.
- **`STATE.md`** — Shared project-level state in `.planning/STATE.md`. Updated at milestone boundaries only (not every session), so conflicts are rare.
- **Developer identity** — `/flow:spec` and `/flow:go` track who is working on what. PRDs can be assigned to specific developers (advisory, not blocking).
- **Template provided** — `session.md.template` scaffolds the per-developer file on first use.

---

## Linear Integration

Flow optionally integrates with Linear via MCP for issue tracking:

- **`/flow:spec`** can create Linear issues automatically from PRD phases
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
