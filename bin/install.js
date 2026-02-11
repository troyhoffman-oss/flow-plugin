#!/usr/bin/env node
// Flow plugin installer for Claude Code
// Usage: npx flow-cc [--uninstall]

const fs = require('fs');
const path = require('path');
const os = require('os');

const homeDir = os.homedir();
const claudeDir = path.join(homeDir, '.claude');
const commandsDir = path.join(claudeDir, 'commands', 'flow');
const hooksDir = path.join(claudeDir, 'hooks');
const cacheDir = path.join(claudeDir, 'cache');
const settingsPath = path.join(claudeDir, 'settings.json');

// Source directories (relative to package root, one level up from bin/)
const pkgRoot = path.resolve(__dirname, '..');
const skillsDir = path.join(pkgRoot, 'skills');
const srcHooksDir = path.join(pkgRoot, 'hooks');
const templatesDir = path.join(pkgRoot, 'templates');
const versionFile = path.join(pkgRoot, 'VERSION');

const uninstall = process.argv.includes('--uninstall') || process.argv.includes('-u');

// ---------- Uninstall ----------
if (uninstall) {
  console.log('Uninstalling Flow plugin...\n');

  // Remove flow commands directory
  if (fs.existsSync(commandsDir)) {
    fs.rmSync(commandsDir, { recursive: true });
    console.log('  Removed ~/.claude/commands/flow/');
  }

  // Remove flow hooks
  const hookFiles = ['flow-check-update.js', 'flow-statusline.js'];
  for (const hook of hookFiles) {
    const hookPath = path.join(hooksDir, hook);
    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath);
      console.log(`  Removed ~/.claude/hooks/${hook}`);
    }
  }

  // Remove update cache
  const cacheFile = path.join(cacheDir, 'flow-update-check.json');
  if (fs.existsSync(cacheFile)) {
    fs.unlinkSync(cacheFile);
    console.log('  Removed ~/.claude/cache/flow-update-check.json');
  }

  // Remove statusLine from settings.json if it points to flow
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.statusLine && typeof settings.statusLine.command === 'string' &&
          settings.statusLine.command.includes('flow-statusline')) {
        delete settings.statusLine;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
        console.log('  Removed statusLine from ~/.claude/settings.json');
      }
    } catch (e) {
      // settings.json parse error — leave it alone
    }
  }

  console.log('\nFlow plugin uninstalled.');
  process.exit(0);
}

// ---------- Install ----------
console.log('Installing Flow plugin...\n');

// 1. Create directories
for (const dir of [commandsDir, hooksDir, cacheDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

// 2. Copy skills: skills/flow-*.md → commands/flow/*.md (strip "flow-" prefix)
const skillFiles = fs.readdirSync(skillsDir).filter(f => f.startsWith('flow-') && f.endsWith('.md'));
for (const file of skillFiles) {
  const dest = file.replace(/^flow-/, '');
  fs.copyFileSync(path.join(skillsDir, file), path.join(commandsDir, dest));
}
console.log(`  Installed ${skillFiles.length} skills → ~/.claude/commands/flow/`);

// 3. Copy hooks
const hookFiles = ['flow-check-update.js', 'flow-statusline.js'];
for (const hook of hookFiles) {
  const src = path.join(srcHooksDir, hook);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(hooksDir, hook));
  }
}
console.log('  Installed hooks → ~/.claude/hooks/');

// 4. Copy VERSION
fs.copyFileSync(versionFile, path.join(commandsDir, 'VERSION'));
console.log('  Installed VERSION → ~/.claude/commands/flow/VERSION');

// 5. Copy templates
const destTemplatesDir = path.join(commandsDir, 'templates');
fs.mkdirSync(destTemplatesDir, { recursive: true });
if (fs.existsSync(templatesDir)) {
  const templateFiles = fs.readdirSync(templatesDir);
  for (const file of templateFiles) {
    fs.copyFileSync(path.join(templatesDir, file), path.join(destTemplatesDir, file));
  }
  console.log(`  Installed ${templateFiles.length} templates → ~/.claude/commands/flow/templates/`);
}

// 6. Merge statusLine into settings.json
let settings = {};
if (fs.existsSync(settingsPath)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    // Corrupted settings — start fresh but warn
    console.log('  Warning: could not parse existing settings.json, preserving as backup');
    fs.copyFileSync(settingsPath, settingsPath + '.bak');
  }
}
settings.statusLine = {
  type: 'command',
  command: `node "${path.join(hooksDir, 'flow-statusline.js')}"`
};
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
console.log('  Configured statusLine in ~/.claude/settings.json');

// 7. Write .source breadcrumb (for dev/setup.sh compat)
fs.writeFileSync(path.join(commandsDir, '.source'), pkgRoot + '\n');

// Done
const version = fs.readFileSync(versionFile, 'utf8').trim();
console.log(`
Flow v${version} installed successfully!

Commands available:
  /flow:intro   — Learn the Flow workflow
  /flow:init    — Start a new project or milestone
  /flow:spec    — Spec interview → executable PRD
  /flow:go      — Execute next phase with agent teams
  /flow:done    — Session-end documentation
  /flow:status  — Quick orientation
  /flow:task    — Lightweight task execution
  /flow:update  — Update Flow to latest version

Get started: run /flow:intro in any Claude Code session.
`);
