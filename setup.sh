#!/bin/bash
set -e
SKILL_DIR="$HOME/.claude/skills"
mkdir -p "$SKILL_DIR"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR"/skills/flow-*.md "$SKILL_DIR/"
echo ""
echo "Flow plugin installed successfully!"
echo "Skills available: /flow:init, /flow:spec, /flow:go, /flow:done, /flow:status"
echo ""
echo "Get started: open any project and run /flow:init"
