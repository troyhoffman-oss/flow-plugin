#!/usr/bin/env node
// Claude Code Statusline — Flow Edition
// Shows: [update notification] | model | current task | directory | context usage

const fs = require('fs');
const path = require('path');
const os = require('os');

const homeDir = os.homedir();
const errorLog = path.join(homeDir, '.claude', 'hooks', 'flow-error.log');

function logError(context, err) {
  try {
    const line = `[${new Date().toISOString()}] flow-statusline: ${context}: ${err.message || err}\n`;
    // Cap log at 50KB — truncate oldest entries
    if (fs.existsSync(errorLog)) {
      const stat = fs.statSync(errorLog);
      if (stat.size > 50 * 1024) {
        const content = fs.readFileSync(errorLog, 'utf8');
        const lines = content.split('\n');
        fs.writeFileSync(errorLog, lines.slice(Math.floor(lines.length / 2)).join('\n'));
      }
    }
    fs.appendFileSync(errorLog, line);
  } catch (_) {
    // Logging must never throw
  }
}

// Read JSON from stdin (Claude Code statusline protocol)
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name || 'Claude';
    const dir = data.workspace?.current_dir || process.cwd();
    const session = data.session_id || '';
    const remaining = data.context_window?.remaining_percentage;

    // --- Context window bar (scaled to 80% limit) ---
    let ctx = '';
    if (remaining != null) {
      const rem = Math.round(remaining);
      const rawUsed = Math.max(0, Math.min(100, 100 - rem));
      const used = Math.min(100, Math.round((rawUsed / 80) * 100));

      const filled = Math.floor(used / 10);
      const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);

      if (used < 63) {
        ctx = ` \x1b[32m${bar} ${used}%\x1b[0m`;
      } else if (used < 81) {
        ctx = ` \x1b[33m${bar} ${used}%\x1b[0m`;
      } else if (used < 95) {
        ctx = ` \x1b[38;5;208m${bar} ${used}%\x1b[0m`;
      } else {
        ctx = ` \x1b[5;31m\uD83D\uDC80 ${bar} ${used}%\x1b[0m`;
      }
    }

    // --- Current task from todos ---
    let task = '';
    const todosDir = path.join(homeDir, '.claude', 'todos');
    if (session && fs.existsSync(todosDir)) {
      try {
        const files = fs.readdirSync(todosDir)
          .filter(f => f.startsWith(session) && f.includes('-agent-') && f.endsWith('.json'))
          .map(f => ({ name: f, mtime: fs.statSync(path.join(todosDir, f)).mtime }))
          .sort((a, b) => b.mtime - a.mtime);

        if (files.length > 0) {
          try {
            const todos = JSON.parse(fs.readFileSync(path.join(todosDir, files[0].name), 'utf8'));
            const inProgress = todos.find(t => t.status === 'in_progress');
            if (inProgress) task = inProgress.activeForm || '';
          } catch (e) {
            logError('parse-todos', e);
          }
        }
      } catch (e) {
        logError('read-todos', e);
      }
    }

    // --- Flow update notification ---
    let flowUpdate = '';
    const cacheFile = path.join(homeDir, '.claude', 'cache', 'flow-update-check.json');
    let shouldCheck = false;

    if (fs.existsSync(cacheFile)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (cache.update_available) {
          flowUpdate = '\x1b[33m\u2B06 /flow:update\x1b[0m \u2502 ';
        }
        // Trigger background re-check if cache is older than 6 hours
        const sixHours = 6 * 60 * 60;
        if (!cache.checked || (Math.floor(Date.now() / 1000) - cache.checked) > sixHours) {
          shouldCheck = true;
        }
      } catch (e) {
        logError('parse-cache', e);
        shouldCheck = true;
      }
    } else {
      shouldCheck = true;
    }

    // Spawn background update check if needed
    if (shouldCheck) {
      try {
        const checkScript = path.join(homeDir, '.claude', 'hooks', 'flow-check-update.js');
        if (fs.existsSync(checkScript)) {
          const { spawn } = require('child_process');
          const child = spawn(process.execPath, [checkScript], {
            stdio: 'ignore',
            windowsHide: true
          });
          child.unref();
        }
      } catch (e) {
        logError('spawn-update-check', e);
      }
    }

    // --- Output ---
    const dirname = path.basename(dir);
    if (task) {
      process.stdout.write(`${flowUpdate}\x1b[2m${model}\x1b[0m \u2502 \x1b[1m${task}\x1b[0m \u2502 \x1b[2m${dirname}\x1b[0m${ctx}`);
    } else {
      process.stdout.write(`${flowUpdate}\x1b[2m${model}\x1b[0m \u2502 \x1b[2m${dirname}\x1b[0m${ctx}`);
    }
  } catch (e) {
    logError('main', e);
    // Silent fail — statusline must never crash
  }
});
