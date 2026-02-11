# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Updated command descriptions across intro, README, and install.js

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
