const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '..', 'css');
const modulesDir = path.join(cssDir, 'modules');
const srcPath = path.join(cssDir, 'styles.css');
const bakPath = path.join(cssDir, 'styles.css.bak');

// 1. Ensure backup
if (!fs.existsSync(bakPath)) {
  fs.copyFileSync(srcPath, bakPath);
  console.log('Created backup styles.css.bak');
}

// 2. Ensure modules dir exists
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
  console.log('Created css/modules/ directory');
}

const content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');

const modules = [
  { name: 'variables.css', start: 1, end: 203 },
  { name: 'base.css', start: 204, end: 774 },
  { name: 'sidebar.css', start: 775, end: 1122 },
  { name: 'dashboard.css', start: 1123, end: 2768 },
  { name: 'focus_mode.css', start: 2769, end: 3426 },
  { name: 'engines.css', start: 3427, end: 6109 },
  { name: 'matrix.css', start: 6110, end: 6397 },
  { name: 'responsive_core.css', start: 6398, end: 7058 },
  { name: 'report.css', start: 7059, end: 7672 },
  { name: 'command_palette.css', start: 7673, end: 7999 },
  { name: 'kanban.css', start: 8000, end: 8436 },
  { name: 'analytics.css', start: 8437, end: 9399 },
  { name: 'mobile_suite.css', start: 9400, end: 11796 },
  { name: 'backlogs_docket.css', start: 11797, end: 14694 },
  { name: 'pulse.css', start: 14695, end: 15914 },
  { name: 'professional.css', start: 15915, end: 16885 },
  { name: 'tracker.css', start: 16886, end: 18680 },
  { name: 'themes_light.css', start: 18681, end: lines.length }
];

const importLines = [
  '/* ==========================================================================',
  '   TESSERACT EXECUTIVE ARCHITECTURE — MASTER STYLESHEET',
  '   Modular architecture: all subsystems imported in exact cascade order',
  '   ========================================================================== */',
  ''
];

modules.forEach(mod => {
  const modLines = lines.slice(mod.start - 1, mod.end);
  const targetFile = path.join(modulesDir, mod.name);
  fs.writeFileSync(targetFile, modLines.join('\n'), 'utf8');
  console.log(`Wrote ${mod.name}: ${modLines.length} lines`);
  importLines.push(`@import url('modules/${mod.name}');`);
});

importLines.push('');

// Write new master styles.css
fs.writeFileSync(srcPath, importLines.join('\n'), 'utf8');
console.log('Successfully updated master css/styles.css with modular imports!');
