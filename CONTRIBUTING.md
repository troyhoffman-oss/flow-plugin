# Contributing to Flow

Thanks for your interest in contributing! Flow is a structured workflow system for Claude Code, and contributions are welcome.

## Reporting Bugs

Open an issue at [github.com/troyhoffman-oss/flow-plugin/issues](https://github.com/troyhoffman-oss/flow-plugin/issues) with:

- Steps to reproduce
- Expected vs. actual behavior
- Your OS and Node.js version
- Claude Code version (if relevant)

## Suggesting Features

Open an issue with the `enhancement` label. Describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## Submitting Pull Requests

1. Fork the repo and create a branch from `master`
2. Make your changes
3. Test the installer: `node bin/install.js` from the repo root
4. Verify skills load in Claude Code (run `/flow:intro`)
5. Open a PR with a clear description of what changed and why

### Skill File Format

Skills live in `skills/` as Markdown files with YAML frontmatter:

```markdown
---
name: flow:example
description: One-line description
user_invocable: true
---

# /flow:example — Title

Instructions for Claude Code to follow when this skill is invoked.
```

### Testing Expectations

- Run `node bin/install.js` and verify all files land in `~/.claude/`
- Run `node bin/install.js --uninstall` and verify clean removal
- Run `node bin/install.js --verify` to check install health
- Test on both Windows and macOS/Linux if possible

## Architecture

See [DESIGN.md](DESIGN.md) for architecture decisions and system design.

## Code of Conduct

Be kind, constructive, and respectful. We're all here to build better tools.
