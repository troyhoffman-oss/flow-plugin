---
name: flow:update
description: Update Flow plugin to the latest version from npm
user_invocable: true
---

# /flow:update — Update Flow Plugin

You are executing the `/flow:update` skill. Follow these steps exactly:

## Step 1: Check current version

Read `~/.claude/commands/flow/VERSION` to get the installed version. Print it:

```
Flow v<installed> installed
```

If the VERSION file does not exist, print this and stop:

```
Flow is not installed. Install with: npx flow-cc
```

## Step 2: Check latest version

Run `npm view flow-cc version` to get the latest published version. Print it:

```
Latest available: v<latest>
```

If the npm command fails (offline, package not found), print:

```
Could not check for updates — are you online?
```

And stop.

## Step 3: Compare versions

If installed version equals latest version, print this and stop:

```
Flow is up to date (v<version>)
```

## Step 4: Confirm update

Print the available update and ask the user to confirm:

```
Update available: v<installed> → v<latest>
```

Wait for user confirmation before proceeding.

## Step 5: Run update

Run `npx flow-cc` to re-install with the latest version. Show the output.

## Step 6: Confirm success

Read `~/.claude/commands/flow/VERSION` again to get the new version. Print:

```
Updated Flow: v<old> → v<new>
```

## Step 7: Clear update notification

Delete `~/.claude/cache/flow-update-check.json` so the statusline notification disappears.

Print:

```
Restart Claude Code to see changes.
```
