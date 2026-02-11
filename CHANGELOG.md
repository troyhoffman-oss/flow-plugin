# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
