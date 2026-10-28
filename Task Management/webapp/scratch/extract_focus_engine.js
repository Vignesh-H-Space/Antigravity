const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'js', 'app.js');
const focusPath = path.join(__dirname, '..', 'js', 'focus_engine.js');
const appBakPath = path.join(__dirname, '..', 'js', 'app.js.bak');

const content = fs.readFileSync(appPath, 'utf8');

// Backup app.js if not already done
if (!fs.existsSync(appBakPath)) {
  fs.copyFileSync(appPath, appBakPath);
  console.log('Backed up app.js to app.js.bak');
}

const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('// ── Focus Mode & Deep Work Engine'));
const endIdx = lines.findIndex(l => l.includes('// ── 📱 Mobile Application Enhancements'));

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find start or end index for FocusEngine in app.js!');
  process.exit(1);
}

const focusLines = [
  '/**',
  ' * ==========================================================================',
  ' * TESSERACT EXECUTIVE ARCHITECTURE — FOCUS & DEEP WORK ENGINE',
  ' * Provides audio synthesis, Pomodoro timer, full-screen overlay, and analytics',
  ' * ==========================================================================',
  ' */',
  '',
  ...lines.slice(startIdx, endIdx),
  '',
  '// Expose FocusEngine globally on window',
  'if (typeof window !== "undefined") {',
  '  window.FocusEngine = FocusEngine;',
  '}',
  ''
];

fs.writeFileSync(focusPath, focusLines.join('\n'), 'utf8');
console.log(`Created js/focus_engine.js (${focusLines.length} lines)`);

const newAppLines = [
  ...lines.slice(0, startIdx),
  '// ── Focus Mode & Deep Work Engine ──────────────────────────',
  '// Modularized into js/focus_engine.js for high performance and separation of concerns.',
  '',
  ...lines.slice(endIdx)
];

fs.writeFileSync(appPath, newAppLines.join('\n'), 'utf8');
console.log(`Updated js/app.js. Reduced from ${lines.length} lines to ${newAppLines.length} lines.`);
