const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING DOCKET & MATRIX TASK VANISHING & PERSISTENCE');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Check CSS Balance in styles.css
const cssPath = path.join(__dirname, '../css/styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const openBraces = (cssContent.match(/\{/g) || []).length;
const closeBraces = (cssContent.match(/\}/g) || []).length;
console.log(`CSS Check: ${openBraces} open braces, ${closeBraces} close braces`);
assert.strictEqual(openBraces, closeBraces, 'CSS braces must balance!');
assert(cssContent.includes('.docket-completed-drawer'), 'CSS must include .docket-completed-drawer');
assert(cssContent.includes('.btn-docket-restore'), 'CSS must include .btn-docket-restore');
assert(cssContent.includes('[data-theme="light"] .docket-completed-drawer'), 'CSS must include light theme overrides');
console.log('✓ CSS validation passed!\n');

// 2. Mock Browser Environment for DocketEngine
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

global.showToast = (msg, type) => console.log(`[Toast ${type}] ${msg}`);
global.XPEngine = { addXP: (amount, reason) => console.log(`[XP] +${amount} (${reason})`) };
global.BacklogEngine = {
  items: [{ id: 'bkl_123', objective: 'Backlog Item Synced', completed: false }],
  save: () => {},
  render: () => {},
  finalizeVanish: (id) => {
    const b = global.BacklogEngine.items.find(x => x.id === id);
    if (b) b.completed = true;
  }
};

global.window = global;

// Load DocketEngine
const docketCode = fs.readFileSync(path.join(__dirname, '../js/docket_engine.js'), 'utf8');
eval(docketCode);
const DocketEngine = global.DocketEngine;

console.log('--- Testing DocketEngine Vanishing & Active List Separation ---');
DocketEngine.init();

// Add a test task for today
const todayStr = DocketEngine.getTodayStr();
const task = DocketEngine.addItem('Urgent High-Leverage Strategic Agenda', 'high');
assert(task, 'Task should be created');
assert.strictEqual(task.completed, false, 'Task should initially be uncompleted');

// Check active items before completion
let todayItems = DocketEngine.getTodayItems();
let activeItems = todayItems.filter(i => !i.completed || DocketEngine.pendingVanishes[i.id]);
let completedItems = todayItems.filter(i => i.completed && !DocketEngine.pendingVanishes[i.id]);
console.log(`Before complete: ${activeItems.length} active, ${completedItems.length} completed`);
assert.strictEqual(activeItems.length >= 1, true, 'Active items should include new task');

// Trigger countdown
DocketEngine.markDoneWithCountdown(task.id);
assert(DocketEngine.pendingVanishes[task.id], 'pendingVanishes should be set during 5s window');

// While pending vanish, it should still be in active list so user can click "Undo"
todayItems = DocketEngine.getTodayItems();
activeItems = todayItems.filter(i => !i.completed || DocketEngine.pendingVanishes[i.id]);
assert(activeItems.some(i => i.id === task.id), 'Task should remain visible with undo during countdown');

// Finalize vanish (simulating 5s expiration)
DocketEngine.finalizeVanish(task.id);
assert.strictEqual(DocketEngine.pendingVanishes[task.id], undefined, 'pendingVanishes should be cleared');
assert.strictEqual(task.completed, true, 'Task completed flag should be true');

// Check active items after finalize: TASK MUST HAVE VANISHED FROM ACTIVE AGENDA!
todayItems = DocketEngine.getTodayItems();
activeItems = todayItems.filter(i => !i.completed || DocketEngine.pendingVanishes[i.id]);
completedItems = todayItems.filter(i => i.completed && !DocketEngine.pendingVanishes[i.id]);

console.log(`After finalize: ${activeItems.length} active, ${completedItems.length} completed`);
assert(!activeItems.some(i => i.id === task.id), 'CRITICAL: Completed task MUST vanish from active agenda!');
assert(completedItems.some(i => i.id === task.id), 'Completed task should be filed in completedTodayItems');
console.log('✓ Task successfully vanished from active agenda into completed archive!');

// Simulate navigating away to another page and returning (re-initializing DocketEngine)
const reloadedDocket = JSON.parse(storage['tesseract_docket_data']);
DocketEngine.items = reloadedDocket;
const reloadedTodayItems = DocketEngine.getTodayItems();
const reloadedActive = reloadedTodayItems.filter(i => !i.completed || DocketEngine.pendingVanishes[i.id]);
assert(!reloadedActive.some(i => i.id === task.id), 'CRITICAL: After page navigation, completed task MUST NOT be in active list!');
console.log('✓ Persistence verified: returning to the page keeps completed task gone from active list!');

// Test Restore functionality
DocketEngine.restoreCompleted(task.id);
const restoredItem = DocketEngine.items.find(i => i.id === task.id);
assert.strictEqual(restoredItem.completed, false, 'Task should be uncompleted after restore');
todayItems = DocketEngine.getTodayItems();
activeItems = todayItems.filter(i => !i.completed || DocketEngine.pendingVanishes[i.id]);
assert(activeItems.some(i => i.id === task.id), 'Restored task should reappear in active agenda');
console.log('✓ Restore completed task verified!\n');

// 3. Verify app.js viewMode persistence & renderAll handling
console.log('--- Testing app.js viewMode Persistence & Matrix View ---');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

assert(appCode.includes("localStorage.getItem('tesseract_view_mode')"), 'app.js must read tesseract_view_mode from localStorage');
assert(appCode.includes("localStorage.setItem('tesseract_view_mode', mode)"), 'app.js must save tesseract_view_mode on switchView');
assert(appCode.includes("if (state.viewMode === 'eisenhower')"), 'renderAll must re-render eisenhower matrix when viewMode is eisenhower');
assert(appCode.includes("window.toggleTaskCompletion = toggleTaskCompletion"), 'toggleTaskCompletion must be exposed on window');
console.log('✓ app.js matrix view persistence & renderAll integration verified!');

console.log('\n===========================================================');
console.log('🎉 ALL DOCKET & MATRIX TASK VANISHING TESTS PASSED 100%!');
console.log('===========================================================');
