const fs = require('fs');
const path = require('path');

const webappDir = path.join(__dirname, '..');

// 1. Verify pulse.html contains the date selector markup
console.log('--- 1. Testing pulse.html Markup ---');
const pulseHtml = fs.readFileSync(path.join(webappDir, 'pulse.html'), 'utf8');
const requiredHtmlSnippets = [
  'id="pulse-date-btn-today"',
  'id="pulse-date-btn-yesterday"',
  'id="pulse-date-btn-custom"',
  'id="pulse-date-picker"',
  'id="pulse-date-notice"'
];

for (const snippet of requiredHtmlSnippets) {
  if (!pulseHtml.includes(snippet)) {
    console.error('FAIL: pulse.html missing:', snippet);
    process.exit(1);
  }
}
console.log('✓ pulse.html contains all Date Selector controls');

// 2. Setup mock environment for PulseEngine
console.log('\n--- 2. Testing PulseEngine Retroactive Logging ---');

const localStorageMap = {};
global.localStorage = {
  getItem: (key) => localStorageMap[key] || null,
  setItem: (key, val) => { localStorageMap[key] = String(val); },
  removeItem: (key) => { delete localStorageMap[key]; }
};

global.document = {
  getElementById: (id) => {
    return {
      value: id === 'pulse-text-input' ? 'Overcame difficult bug after deep debugging session' : '',
      focus: () => {},
      classList: {
        add: () => {},
        remove: () => {}
      },
      style: {}
    };
  },
  addEventListener: () => {}
};

global.XPEngine = {
  addXP: (amount, reason) => {
    console.log(`[XP Mock] Added ${amount} XP for "${reason}"`);
  }
};

global.Components = {
  showToast: (msg, type) => {
    console.log(`[Toast Mock] (${type}) ${msg}`);
  }
};

// Require PulseEngine
const { PulseEngine, PULSE_CATEGORIES } = require(path.join(webappDir, 'js', 'pulse_engine.js'));

// Test date helpers
const today = PulseEngine.getTodayStr();
const yesterday = PulseEngine.getYesterdayStr();
console.log(`Today: ${today}, Yesterday: ${yesterday}`);

if (!today.match(/^\d{4}-\d{2}-\d{2}$/) || !yesterday.match(/^\d{4}-\d{2}-\d{2}$/)) {
  console.error('FAIL: Date formats invalid');
  process.exit(1);
}
console.log('✓ getTodayStr & getYesterdayStr format properly');

// Test logging for Yesterday
PulseEngine.setCaptureDate('yesterday');
if (PulseEngine.selectedDate !== yesterday) {
  console.error('FAIL: selectedDate not set to yesterday');
  process.exit(1);
}
console.log('✓ setCaptureDate("yesterday") sets selectedDate correctly');

PulseEngine.submitPulse();
const yesterdayPulse = PulseEngine.entries[0];
console.log('Yesterday Pulse recorded:', yesterdayPulse);

if (yesterdayPulse.date !== yesterday) {
  console.error(`FAIL: Expected pulse date to be ${yesterday}, got ${yesterdayPulse.date}`);
  process.exit(1);
}
console.log('✓ Pulse successfully recorded with Yesterday\'s date');

// Test logging for an older custom date: 2026-10-10
const customPastDate = '2026-10-10';
PulseEngine.setCaptureDate('custom', customPastDate);
if (PulseEngine.selectedDate !== customPastDate) {
  console.error('FAIL: selectedDate not set to custom past date');
  process.exit(1);
}

PulseEngine.submitPulse();
const customPulse = PulseEngine.entries[0];
console.log('Custom Past Date Pulse recorded:', customPulse);

if (customPulse.date !== customPastDate) {
  console.error(`FAIL: Expected pulse date to be ${customPastDate}, got ${customPulse.date}`);
  process.exit(1);
}
console.log('✓ Pulse successfully recorded with custom older date (2026-10-10)');

// Test resetting capture date
PulseEngine.resetCaptureDate();
if (PulseEngine.selectedDate !== null) {
  console.error('FAIL: resetCaptureDate did not clear selectedDate');
  process.exit(1);
}
console.log('✓ resetCaptureDate resets back to Today (null)');

// Test date grouping logic
const groups = {};
PulseEngine.entries.forEach(item => {
  const dateKey = item.date;
  if (!groups[dateKey]) groups[dateKey] = [];
  groups[dateKey].push(item);
});

console.log('\nGrouped Date Keys:', Object.keys(groups));
if (!groups[yesterday] || !groups[customPastDate]) {
  console.error('FAIL: Pulses missing from date groups');
  process.exit(1);
}
console.log('✓ Pulses cleanly group under their past dates for the timeline stream');

// Test date formatting
const dtYesterday = PulseEngine.formatPulseDateTime(yesterdayPulse);
const dtCustom = PulseEngine.formatPulseDateTime(customPulse);

console.log('Yesterday formatted:', dtYesterday);
console.log('Custom past date formatted:', dtCustom);

if (dtYesterday.dateStr !== 'Yesterday') {
  console.error('FAIL: Expected Yesterday dateStr, got:', dtYesterday.dateStr);
  process.exit(1);
}
if (!dtCustom.fullDetailedStr.includes('Oct 10, 2026')) {
  console.error('FAIL: Expected Oct 10, 2026 in fullDetailedStr, got:', dtCustom.fullDetailedStr);
  process.exit(1);
}
console.log('✓ Date formatting matches past dates accurately');

console.log('\n========================================');
console.log('🎉 ALL PULSE RETROACTIVE LOGGING TESTS PASSED!');
console.log('========================================');
