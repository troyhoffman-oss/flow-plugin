#!/usr/bin/env node
// Flow plugin installer for Claude Code
// Usage: npx flow-cc [--uninstall] [--verify]

const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------- Node.js version check ----------
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 18) {
  console.error('Flow requires Node.js 18 or later. You have ' + process.version);
  process.exit(1);
}

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
const verify = process.argv.includes('--verify') || process.argv.includes('-v');
const changelog = process.argv.includes('--changelog');

// ---------- Changelog ----------
if (changelog) {
  const changelogPath = path.join(pkgRoot, 'CHANGELOG.md');
  try {
    console.log(fs.readFileSync(changelogPath, 'utf8'));
  } catch (e) {
    console.log('CHANGELOG not available');
  }
  process.exit(0);
}

// ---------- Verify ----------
if (verify) {
  console.log('Flow install health check:\n');

  let passed = 0;
  const total = 5;

  // 1. Skills installed
  try {
    const files = fs.existsSync(commandsDir)
      ? fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'))
      : [];
    if (files.length > 0) {
      console.log(`  \u2713 Skills installed (${files.length} files)`);
      passed++;
    } else {
      console.log('  \u2717 Skills not installed (0 .md files in commands/flow/)');
    }
  } catch (e) {
    console.log('  \u2717 Skills not installed (cannot read commands/flow/)');
  }

  // 2. Hooks installed
  try {
    const hookFiles = ['flow-check-update.js', 'flow-statusline.js'];
    const found = hookFiles.filter(h => fs.existsSync(path.join(hooksDir, h)));
    if (found.length === 2) {
      console.log('  \u2713 Hooks installed (2 files)');
      passed++;
    } else {
      console.log(`  \u2717 Hooks incomplete (${found.length}/2 files)`);
    }
  } catch (e) {
    console.log('  \u2717 Hooks not installed');
  }

  // 3. VERSION file
  try {
    const vPath = path.join(commandsDir, 'VERSION');
    if (fs.existsSync(vPath)) {
      const ver = fs.readFileSync(vPath, 'utf8').trim();
      console.log(`  \u2713 VERSION file present (${ver})`);
      passed++;
    } else {
      console.log('  \u2717 VERSION file missing');
    }
  } catch (e) {
    console.log('  \u2717 VERSION file missing');
  }

  // 4. Templates installed
  try {
    const tDir = path.join(commandsDir, 'templates');
    const files = fs.existsSync(tDir) ? fs.readdirSync(tDir) : [];
    if (files.length > 0) {
      console.log(`  \u2713 Templates installed (${files.length} files)`);
      passed++;
    } else {
      console.log('  \u2717 Templates not installed (0 files)');
    }
  } catch (e) {
    console.log('  \u2717 Templates not installed');
  }

  // 5. StatusLine configured
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.statusLine && typeof settings.statusLine.command === 'string' &&
          settings.statusLine.command.includes('flow-statusline')) {
        console.log('  \u2713 StatusLine configured');
        passed++;
      } else {
        console.log('  \u2717 StatusLine not configured');
      }
    } else {
      console.log('  \u2717 StatusLine not configured (no settings.json)');
    }
  } catch (e) {
    console.log('  \u2717 StatusLine not configured');
  }

  console.log(`\nResult: ${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
}

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
      // settings.json parse error -- leave it alone
    }
  }

  console.log('\nFlow plugin uninstalled.');
  process.exit(0);
}

// ---------- Install ----------
console.log('Installing Flow plugin...\n');

// ---------- Write permission check ----------
const permTestDir = fs.existsSync(claudeDir) ? claudeDir : path.dirname(claudeDir);
const permTestFile = path.join(permTestDir, '.flow-perm-test-' + process.pid);
try {
  fs.writeFileSync(permTestFile, 'test');
  fs.unlinkSync(permTestFile);
} catch (e) {
  console.error('Cannot write to ' + claudeDir + ' \u2014 check permissions.');
  process.exit(1);
}

// ---------- Rollback tracking ----------
const created = []; // paths created during install (files and dirs we created fresh)

function trackFile(filePath) {
  created.push({ type: 'file', path: filePath });
}

function trackDir(dirPath) {
  // Only track if we actually created it (didn't exist before)
  if (!fs.existsSync(dirPath)) {
    created.push({ type: 'dir', path: dirPath });
  }
}

function rollback() {
  console.error('\nRolling back partial install...');
  for (let i = created.length - 1; i >= 0; i--) {
    const item = created[i];
    try {
      if (item.type === 'file' && fs.existsSync(item.path)) {
        fs.unlinkSync(item.path);
      } else if (item.type === 'dir' && fs.existsSync(item.path)) {
        fs.rmSync(item.path, { recursive: true });
      }
    } catch (e) {
      // Best-effort cleanup
    }
  }
  console.error('Rollback complete.');
}

try {
  // 1. Create directories
  for (const dir of [commandsDir, hooksDir, cacheDir]) {
    trackDir(dir);
    fs.mkdirSync(dir, { recursive: true });
  }

  // 2. Copy skills: skills/flow-*.md -> commands/flow/*.md (strip "flow-" prefix)
  const skillFiles = fs.readdirSync(skillsDir).filter(f => f.startsWith('flow-') && f.endsWith('.md'));
  for (const file of skillFiles) {
    const dest = file.replace(/^flow-/, '');
    const destPath = path.join(commandsDir, dest);
    fs.copyFileSync(path.join(skillsDir, file), destPath);
    trackFile(destPath);
  }
  console.log(`  Installed ${skillFiles.length} skills \u2192 ~/.claude/commands/flow/`);

  // 3. Copy hooks
  const hookFiles = ['flow-check-update.js', 'flow-statusline.js'];
  for (const hook of hookFiles) {
    const src = path.join(srcHooksDir, hook);
    if (fs.existsSync(src)) {
      const destPath = path.join(hooksDir, hook);
      fs.copyFileSync(src, destPath);
      trackFile(destPath);
    }
  }
  console.log('  Installed hooks \u2192 ~/.claude/hooks/');

  // 4. Copy VERSION
  const versionDest = path.join(commandsDir, 'VERSION');
  fs.copyFileSync(versionFile, versionDest);
  trackFile(versionDest);
  console.log('  Installed VERSION \u2192 ~/.claude/commands/flow/VERSION');

  // 5. Copy templates
  const destTemplatesDir = path.join(commandsDir, 'templates');
  trackDir(destTemplatesDir);
  fs.mkdirSync(destTemplatesDir, { recursive: true });
  if (fs.existsSync(templatesDir)) {
    const templateFiles = fs.readdirSync(templatesDir);
    for (const file of templateFiles) {
      const destPath = path.join(destTemplatesDir, file);
      fs.copyFileSync(path.join(templatesDir, file), destPath);
      trackFile(destPath);
    }
    console.log(`  Installed ${templateFiles.length} templates \u2192 ~/.claude/commands/flow/templates/`);
  }

  // 6. Merge statusLine into settings.json
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      // Corrupted settings -- start fresh but warn
      console.log('  Warning: could not parse existing settings.json, preserving as backup');
      fs.copyFileSync(settingsPath, settingsPath + '.bak');
    }
  }
  settings.statusLine = {
    type: 'command',
    command: `node "${path.join(hooksDir, 'flow-statusline.js')}"`
  };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  trackFile(settingsPath);
  console.log('  Configured statusLine in ~/.claude/settings.json');

  // 7. Write .source breadcrumb (for dev/setup.sh compat)
  const sourcePath = path.join(commandsDir, '.source');
  fs.writeFileSync(sourcePath, pkgRoot + '\n');
  trackFile(sourcePath);

  // ---------- Post-install verification ----------
  let warnings = 0;

  // Check: at least 1 file in commandsDir
  const installedSkills = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  if (installedSkills.length === 0) {
    console.log('  Warning: no skill files found in commands/flow/');
    warnings++;
  }

  // Check: both hook files
  const installedHooks = hookFiles.filter(h => fs.existsSync(path.join(hooksDir, h)));
  if (installedHooks.length < 2) {
    console.log(`  Warning: only ${installedHooks.length}/2 hook files installed`);
    warnings++;
  }

  // Check: VERSION file
  if (!fs.existsSync(path.join(commandsDir, 'VERSION'))) {
    console.log('  Warning: VERSION file not found after install');
    warnings++;
  }

  // Check: templates directory with at least 1 file
  const tplDir = path.join(commandsDir, 'templates');
  const tplFiles = fs.existsSync(tplDir) ? fs.readdirSync(tplDir) : [];
  if (tplFiles.length === 0) {
    console.log('  Warning: no template files found after install');
    warnings++;
  }

  if (warnings > 0) {
    console.log(`  (${warnings} verification warning${warnings > 1 ? 's' : ''} — install may be incomplete)`);
  }

  // Done
  const version = fs.readFileSync(versionFile, 'utf8').trim();
  console.log(`
Flow v${version} installed successfully!

Commands available:
  /flow:intro      \u2014 Learn the Flow workflow
  /flow:setup      \u2014 Set up a new project with full roadmap
  /flow:triage     \u2014 Sort brain dump into issues, milestones, lessons
  /flow:spec       \u2014 Spec interview \u2192 executable PRD
  /flow:go         \u2014 Execute next phase with agent teams
  /flow:done       \u2014 Session-end documentation
  /flow:status     \u2014 Quick orientation
  /flow:task       \u2014 Lightweight task execution
  /flow:update     \u2014 Update Flow to latest version

Get started: run /flow:intro in any Claude Code session.
`);
} catch (err) {
  rollback();
  console.error('\nInstall failed: ' + err.message);
  process.exit(1);
}
