---
name: flow:update
description: Pull latest flow-plugin changes and re-install skills
user_invocable: true
---

# /flow:update — Update Flow Plugin

You are executing the `/flow:update` skill. Follow these steps exactly:

## Step 1: Find the repo

Read `~/.claude/commands/flow/.source` to get the flow-plugin repo path.

If the file does not exist, print this and stop:

```
Flow source location unknown — .source breadcrumb not found.
Manual update: cd <flow-plugin-repo> && git pull && bash setup.sh (or .\setup.ps1 on Windows)
Re-running setup will create the breadcrumb for next time.
```

## Step 2: Pull latest

Run `git pull` in the repo directory. Print the output so the user sees what changed.

If git pull fails (dirty working tree, network error, etc.), print the error and stop.

## Step 3: Re-install

Run the platform-appropriate setup script in the repo directory:
- **Windows:** `.\setup.ps1` (use PowerShell)
- **Mac/Linux:** `bash setup.sh`

## Step 4: Confirm

Print a short summary:
- What git pull reported (already up to date, or list of changed files)
- Confirmation that skills were re-installed
