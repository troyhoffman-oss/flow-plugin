#!/usr/bin/env node
// Check for Flow updates in background, write result to cache
// Called by flow-statusline.js when cache is stale or missing

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const homeDir = os.homedir();
const cacheDir = path.join(homeDir, '.claude', 'cache');
const cacheFile = path.join(cacheDir, 'flow-update-check.json');
const versionFile = path.join(homeDir, '.claude', 'commands', 'flow', 'VERSION');
const errorLog = path.join(homeDir, '.claude', 'hooks', 'flow-error.log');

function logError(context, err) {
  try {
    const line = `[${new Date().toISOString()}] flow-check-update: ${context}: ${err.message || err}\n`;
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

try {
  // Ensure cache directory exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Run check in background (spawn detached process, windowsHide prevents console flash)
  const child = spawn(process.execPath, ['-e', `
    const fs = require('fs');
    const { execSync } = require('child_process');

    const cacheFile = ${JSON.stringify(cacheFile)};
    const versionFile = ${JSON.stringify(versionFile)};
    const errorLog = ${JSON.stringify(errorLog)};

    function logError(context, err) {
      try {
        const line = '[' + new Date().toISOString() + '] flow-check-update(child): ' + context + ': ' + (err.message || err) + '\\n';
        if (fs.existsSync(errorLog)) {
          const stat = fs.statSync(errorLog);
          if (stat.size > 50 * 1024) {
            const content = fs.readFileSync(errorLog, 'utf8');
            const lines = content.split('\\n');
            fs.writeFileSync(errorLog, lines.slice(Math.floor(lines.length / 2)).join('\\n'));
          }
        }
        fs.appendFileSync(errorLog, line);
      } catch (_) {}
    }

    try {
      let installed = '0.0.0';
      try {
        if (fs.existsSync(versionFile)) {
          installed = fs.readFileSync(versionFile, 'utf8').trim();
        }
      } catch (e) {
        logError('read-version', e);
      }

      let latest = null;
      try {
        latest = execSync('npm view flow-cc version', { encoding: 'utf8', timeout: 10000, windowsHide: true }).trim();
      } catch (e) {
        logError('npm-view', e);
      }

      const result = {
        update_available: latest && installed !== latest,
        installed,
        latest: latest || 'unknown',
        checked: Math.floor(Date.now() / 1000)
      };

      fs.writeFileSync(cacheFile, JSON.stringify(result));
    } catch (e) {
      logError('main', e);
    }
  `], {
    stdio: 'ignore',
    windowsHide: true
  });

  child.unref();
} catch (e) {
  logError('spawn', e);
}
