# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2026-02-14

### Changed
- **BREAKING:** Terminology aligned with Linear hierarchy — "Milestone" → "Project", "Phase" → "Milestone" across all skills, templates, and docs
- `/flow:go` adds Step 2.5: automatically moves Linear issues to "In Progress" when starting a milestone
- `/flow:go` Step 7: detects final milestone and routes to `/flow:done` for PR creation
- `/flow:done` adds Step 5.25: auto-creates PR with `Closes MSIG-XX` body when project is complete
- `/flow:done` Step 5.5: moves completed issues to "In Review" when PR is detected
- `/flow:spec` creates Linear **milestones** (not issues) for implementation stages, issues for tasks
- All templates updated: STATE.md uses "Project:", ROADMAP.md uses "Projects" table
- DESIGN.md and README.md updated to reflect new terminology

## [0.7.1] - 2026-02-14

### Fixed
- Installer now cleans stale skill files from previous versions (e.g., `milestone.md`, `init.md` left behind after removal)

## [0.7.0] - 2026-02-14

### Changed
- **BREAKING:** Removed `/flow:milestone` — its behavior is now part of `/flow:triage`
- `/flow:triage` gains "Milestone" category — brain dump items that are milestone-sized get added to ROADMAP.md with status "Planned", with optional Linear project creation
- Dropped version number convention from new milestones — milestones use descriptive names only (e.g., "Student Leasing & Rate Modeling" instead of "v18.0")
- `/flow:setup` ROADMAP template drops "Version" column, STATE template drops `(v1)` prefix
- `/flow:spec` PRD slug derivation no longer expects version prefixes
- `/flow:done` archive paths use milestone slug instead of version number, "all milestones complete" routes to `/flow:triage`
- `/flow:status` routes to `/flow:triage` (not `/flow:milestone`) when no next milestone exists
- `/flow:intro` updated lifecycle: `triage → spec → go → done`
- Simplified mental model: 4 core commands (triage, spec, go, done) + 4 utility (setup, task, status, update)

### Removed
- `flow-milestone.md` skill file — deleted entirely

## [0.6.1] - 2026-02-14

### Fixed
- VERSION file now syncs with package.json on publish (was showing 0.5.8 in install banner)

## [0.6.0] - 2026-02-14

### New
- `/flow:triage` — brain dump → categorized Linear issues, ROADMAP entries, and lessons
- `session.md.template` — per-developer session state (gitignored)
- Linear MCP integration — optional issue creation from /flow:spec, progress comments from /flow:done
- Developer identity detection via `git config user.name`
- PRD `Assigned To` field for phase-level developer assignment

### Changed
- `/flow:done` — writes session.md instead of replacing STATE.md every session. STATE.md updates only at milestone boundaries.
- `/flow:go` — reads session.md, respects PRD assignment (advisory), updates session.md on phase completion
- `/flow:spec` — adds assignability probing during interview, creates Linear issues for phases (optional)
- `/flow:status` — shows developer identity and session state
- `/flow:task` — writes to session.md, posts Linear comment (optional)

### Design
- Linear integration is optional — all skills degrade gracefully without Linear MCP
- STATE.md becomes project-level (milestone boundaries only), session.md is per-developer (every session, gitignored)

## [0.5.8] - 2026-02-14

### Fixed
- `/flow:go` Step 7 now enforces mandatory `/flow:done` suggestion in every phase completion output
- Added STOP RULE to prevent autonomous post-phase work (PR creation, comment resolution, cleanup)
- Separated "next flow commands" from project-specific actions so `/flow:done` never gets dropped

## [0.5.0] - 2026-02-13

### Added
- Multi-PRD support — PRDs now live at `.planning/prds/{version-slug}.md` instead of a single root `PRD.md`
- 5-step PRD resolution logic across all skills: user argument → STATE.md Active PRD → slug derivation → legacy fallback → not found
- `**Milestone:**` header field in PRDs for ROADMAP correlation
- `Active PRD` field in STATE.md tracking the current milestone's PRD path
- Milestone Targeting in `/flow:spec` — pass a milestone name to pre-spec future milestones in parallel
- PRD inventory display in `/flow:status` showing active/ready tags per PRD file
- `/flow:setup` now creates `.planning/prds/` directory during project scaffolding

### Changed
- `/flow:spec` writes PRDs to `.planning/prds/{version-slug}.md` (was root `PRD.md`)
- `/flow:go` resolves PRDs via 5-step resolution instead of hardcoded `PRD.md`
- `/flow:done` archives PRDs from `.planning/prds/` to `.planning/archive/PRD-{slug}.md`
- `/flow:status` lists all PRDs in `.planning/prds/` with active/ready status
- `/flow:task` reads active PRD from `.planning/prds/` via STATE.md
- All templates and docs updated to reflect new PRD paths
- Legacy root `PRD.md` still consumed transparently — migration happens organically

## [0.4.3] - 2026-02-12

### Changed
- Lessons system refactored to 2-stage with hard caps — `tasks/lessons.md` max 10 active one-liners, `CLAUDE.md ## Learned Rules` max 15 permanent one-liners
- Replaced verbose PATTERN/CAUSE/FIX/RULE format with compact one-liner format: `- **[topic]** The rule`
- Removed 4-stage lifecycle (Capture → Refine → Promote Global → Promote CLAUDE.md), replaced with 2-stage (Capture → Promote to CLAUDE.md when full)
- Removed all references to `~/.claude/lessons.md` global lessons file
- `/flow:done` now enforces cap: promotes most battle-tested lesson to CLAUDE.md when lessons.md hits 10
- `/flow:status` shows `[N]/10 active` instead of `[N] rules`
- Agent prompts section renamed from "Anti-Patterns to Avoid" to "Lessons (Rules to Follow)"
- CLAUDE.md template now includes `## Learned Rules` placeholder section
- Updated DESIGN.md, README.md, and all skill files to reflect 2-stage system

## [0.4.2] - 2026-02-11

### Fixed
- `/flow:spec` Phase 1 codebase scan now delegates to 3 parallel Explore subagents instead of reading files into main context — saves 200-500 lines of context before the interview starts
- Added plan mode warnings to `/flow:spec` and `/flow:go` — plan mode's read-only constraint breaks both skills
- Added Plan Mode Compatibility section to DESIGN.md documenting the design philosophy

## [0.4.1] - 2026-02-11

### Fixed
- `/flow:update` changelog display — `require.resolve` fails under npx; replaced with `--changelog` flag on install.js

## [0.4.0] - 2026-02-11

### Added
- Multi-milestone roadmap input in `/flow:setup` — capture your full roadmap upfront (paste a list or build one at a time)
- Auto-transition between milestones in `/flow:done` — when a milestone completes and the next is planned, it transitions automatically
- Two-path milestone input (paste/describe or guided) in both `/flow:setup` and `/flow:milestone`

### Changed
- `/flow:milestone` purpose shifted from "archive + start next" to "add new milestones to the roadmap" — archive logic moved to `/flow:done`
- `/flow:done` handoff prompt now has three cases: next phase, next milestone (auto-transitioned), or all milestones complete
- `/flow:status` routing updated — recommends `/flow:done` (not `/flow:milestone`) when next milestone exists, since transition is automatic
- `/flow:setup` Question 4 changed from "first milestone" to full roadmap input
- ROADMAP.md template supports multiple milestones with `{{ADDITIONAL_MILESTONES_TABLE}}` and `{{ADDITIONAL_MILESTONES_SECTIONS}}` placeholders
- Updated lifecycle diagrams in README and `/flow:intro` to show pre-planned milestone flow

## [0.3.0] - 2026-02-11

### Added
- `/flow:setup` command — replaces `/flow:init` for project scaffolding only. Adds overwrite protection (stops if project already initialized).
- `/flow:milestone` command — extracted from `/flow:init` for milestone transitions. Adds guard for pending phases before archiving.
- Codebase scan exclusions in `/flow:spec` — explicitly excludes `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `__pycache__/`, `*.min.js`, `*.map`, `*.lock`. Uses targeted glob patterns instead of bare `**/*`.
- Minimum viable PRD check in `/flow:spec` — validates at least 3 user stories, 1 phase, and 1 verification command before finalizing.
- Agent timeout + progress indicators in `/flow:go` — prints wave spawn/completion status, checks stuck agents after 10 minutes.
- Max retry limit (3 attempts) for verification in `/flow:go` — stops after 3 failures with user options instead of looping forever.
- Wave failure handling in `/flow:go` — detects all-failed vs partial-failed waves, asks user how to proceed.

### Changed
- `/flow:init` split into `/flow:setup` (project scaffolding) and `/flow:milestone` (milestone transitions)
- Skill count: 9 skills (was 8 — setup replaces init, milestone is new)
- All cross-references updated: intro, done, status, go, task, README, install.js, DESIGN.md, templates

### Removed
- `/flow:init` command — replaced by `/flow:setup` and `/flow:milestone`

## [0.2.0] - 2026-02-11

### Added
- `CHANGELOG.md` in Keep a Changelog format
- `CONTRIBUTING.md` with skill file format docs and testing expectations
- Example lesson in `templates/lessons.md.template` showing PATTERN/CAUSE/FIX/RULE format
- Node.js version check (requires >= 18) with clear error message
- Write permission check before install starts
- Rollback on install failure — tracks created files and cleans up
- Post-install verification — checks key files exist after copy
- `--verify` flag for install health check without modifying anything
- `engines` field in package.json (`node >= 18`)
- Error logging for hooks — writes to `~/.claude/hooks/flow-error.log` (capped at 50KB)
- Context size limits in `/flow:spec` — caps codebase scan at 50 files, focused mode for 500+ file repos

### Fixed
- `.gitignore` now has proper Node.js entries (was just `nul`)
- `/flow:done` archive step now creates `.planning/archive/` if missing and skips gracefully when no `.planning/` exists
- `/flow:update` now shows changelog for the new version before confirming update

## [0.1.1] - 2025-05-01

### Changed
- Updated package.json metadata (description, keywords, repository links)
- Polished README with badges and install instructions
- Added MIT license file

## [0.1.0] - 2025-05-01

### Added
- Initial release of Flow plugin for Claude Code
- 8 skills: init, spec, go, done, status, task, intro, update
- 2 hooks: statusline display, background update checker
- 4 templates: CLAUDE.md, STATE.md, ROADMAP.md, lessons.md
- One-command installer via `npx flow-cc`
- Automatic statusLine configuration
- Uninstall support via `npx flow-cc --uninstall`
