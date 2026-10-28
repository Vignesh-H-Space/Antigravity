const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'css', 'styles.css');
const content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');

console.log('Original lines count:', lines.length);

// Define slices: 1-indexed start and end
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

let totalLinesAccounted = 0;
let prevEnd = 0;
let errors = 0;

for (const mod of modules) {
  if (mod.start !== prevEnd + 1) {
    console.error(`GAP or OVERLAP before ${mod.name}: prevEnd=${prevEnd}, start=${mod.start}`);
    errors++;
  }
  const count = (mod.end - mod.start) + 1;
  totalLinesAccounted += count;
  console.log(`${mod.name.padEnd(22)}: L${mod.start} - L${mod.end} (${count} lines)`);
  prevEnd = mod.end;
}

console.log('Total accounted lines:', totalLinesAccounted);
if (totalLinesAccounted === lines.length && errors === 0) {
  console.log('PERFECT 100% CONTIGUOUS MATCH! No gaps, no overlaps, zero lost lines.');
} else {
  console.error('MISMATCH DETECTED!');
}
