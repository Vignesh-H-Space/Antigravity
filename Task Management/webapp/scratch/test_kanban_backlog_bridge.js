const fs = require('fs');
const path = require('path');

const webappDir = path.join(__dirname, '..');

// 1. Check HTML script inclusions
console.log('--- 1. Testing Script Inclusions ---');
const indexHtml = fs.readFileSync(path.join(webappDir, 'index.html'), 'utf8');
const backlogsHtml = fs.readFileSync(path.join(webappDir, 'backlogs.html'), 'utf8');
const completedBacklogsHtml = fs.readFileSync(path.join(webappDir, 'completed_backlogs.html'), 'utf8');

if (!indexHtml.includes('js/backlog_engine.js') || !indexHtml.includes('js/horizon_bridge.js')) {
  console.error('FAIL: index.html missing backlog_engine.js or horizon_bridge.js');
  process.exit(1);
}
console.log('✓ index.html includes backlog_engine.js & horizon_bridge.js');

if (!backlogsHtml.includes('js/horizon_bridge.js')) {
  console.error('FAIL: backlogs.html missing horizon_bridge.js');
  process.exit(1);
}
console.log('✓ backlogs.html includes horizon_bridge.js');

if (!completedBacklogsHtml.includes('js/horizon_bridge.js')) {
  console.error('FAIL: completed_backlogs.html missing horizon_bridge.js');
  process.exit(1);
}
console.log('✓ completed_backlogs.html includes horizon_bridge.js');

// 2. Test CSS brace balance and styles
console.log('\n--- 2. Testing CSS Integrity & Badges ---');
const css = fs.readFileSync(path.join(webappDir, 'css', 'styles.css'), 'utf8');
const opens = (css.match(/\{/g) || []).length;
const closes = (css.match(/\}/g) || []).length;
if (opens !== closes) {
  console.error(`FAIL: CSS brace mismatch! Opens: ${opens}, Closes: ${closes}`);
  process.exit(1);
}
console.log(`✓ CSS brace balance valid (${opens} braces)`);
if (!css.includes('.kb-backlog-badge') || !css.includes('[data-theme="light"] .kb-backlog-badge')) {
  console.error('FAIL: Missing .kb-backlog-badge styles in styles.css');
  process.exit(1);
}
console.log('✓ .kb-backlog-badge styles verified for dark and light theme');

// 3. Test Bridge Logic in simulated environment
console.log('\n--- 3. Testing HorizonBridge & Kanban Logic ---');

// Mock localStorage
const localStorageMap = {};
global.localStorage = {
  getItem: (key) => localStorageMap[key] || null,
  setItem: (key, val) => { localStorageMap[key] = String(val); },
  removeItem: (key) => { delete localStorageMap[key]; }
};

// Seed sample backlogs in localStorage
const sampleBacklogs = [
  {
    id: 'bkl_test_1',
    objective: 'Build High-Leverage Cloud Pipeline',
    group: 'work',
    severity: 'high',
    dueDate: '2026-10-25',
    recurrence: 'none',
    completed: false
  },
  {
    id: 'bkl_test_2',
    objective: 'Weekly Ergonomics & Recovery Routine',
    group: 'physical',
    severity: 'moderate',
    dueDate: null,
    recurrence: 'weekly',
    completed: false
  },
  {
    id: 'bkl_test_3',
    objective: 'Finished Quarter Strategic Review',
    group: 'tesseract',
    severity: 'low',
    dueDate: '2026-10-01',
    recurrence: 'none',
    completed: true,
    completedAt: '2026-10-02T10:00:00Z'
  }
];
localStorage.setItem('tesseract_backlog_data', JSON.stringify(sampleBacklogs));

// Mock state
global.state = {
  tasks: [
    { id: 'task_regular_1', title: 'Regular Daily Task', tier: 'daily', priority: 'high', dueDate: '2026-10-14', completed: false }
  ],
  activeHorizon: 'general',
  searchQuery: ''
};
global.saveData = () => {};
global.renderAll = () => {};

// Require HorizonBridge
const { HorizonBridge } = require(path.join(webappDir, 'js', 'horizon_bridge.js'));

// Test syncAll
HorizonBridge.syncAll();

console.log(`state.tasks count after sync: ${global.state.tasks.length}`);
if (global.state.tasks.length !== 4) {
  console.error('FAIL: Expected 4 tasks in state.tasks after sync (1 regular + 3 backlogs)');
  process.exit(1);
}
console.log('✓ Backlogs successfully synced into state.tasks');

const bklTask1 = global.state.tasks.find(t => t.backlogId === 'bkl_test_1');
const bklTask2 = global.state.tasks.find(t => t.backlogId === 'bkl_test_2');
const bklTask3 = global.state.tasks.find(t => t.backlogId === 'bkl_test_3');

if (!bklTask1 || !bklTask2 || !bklTask3) {
  console.error('FAIL: Bridged tasks missing from state.tasks');
  process.exit(1);
}

// 4. Test Kanban Status helper function
function getKanbanStatus(task) {
  if (task.completed) return 'done';
  if (task.kanbanStatus) return task.kanbanStatus;
  if (task.backlogId || task.isBacklog || task.tier === 'general') return 'backlog';
  if (task.priority === 'low' && !task.dueDate) return 'backlog';
  return 'todo';
}

const status1 = getKanbanStatus(bklTask1);
const status2 = getKanbanStatus(bklTask2);
const status3 = getKanbanStatus(bklTask3);

console.log(`Task 1 (open high severity backlog) status: ${status1}`);
console.log(`Task 2 (open weekly backlog) status: ${status2}`);
console.log(`Task 3 (completed backlog) status: ${status3}`);

if (status1 !== 'backlog') {
  console.error('FAIL: Expected bklTask1 status to be "backlog", got:', status1);
  process.exit(1);
}
if (status2 !== 'backlog') {
  console.error('FAIL: Expected bklTask2 status to be "backlog", got:', status2);
  process.exit(1);
}
if (status3 !== 'done') {
  console.error('FAIL: Expected bklTask3 status to be "done", got:', status3);
  process.exit(1);
}
console.log('✓ getKanbanStatus maps backlogs to "backlog" column and completed to "done"');

// 5. Test moving task in Kanban to 'in_progress' and bi-directional sync
console.log('\n--- 4. Testing Bi-Directional Move in Kanban ---');
bklTask1.kanbanStatus = 'in_progress';
HorizonBridge.syncHorizonTaskToBacklog(bklTask1);

const updatedBacklogs = JSON.parse(localStorage.getItem('tesseract_backlog_data'));
const updatedBkl1 = updatedBacklogs.find(b => b.id === 'bkl_test_1');

if (updatedBkl1.kanbanStatus !== 'in_progress') {
  console.error('FAIL: Expected updatedBkl1.kanbanStatus to be "in_progress", got:', updatedBkl1.kanbanStatus);
  process.exit(1);
}
console.log('✓ Moving task to "in_progress" in Kanban updated Backlog item in storage');

// 6. Test moving task in Kanban to 'done'
bklTask1.completed = true;
bklTask1.completedAt = new Date().toISOString();
bklTask1.kanbanStatus = 'done';
HorizonBridge.syncHorizonTaskToBacklog(bklTask1);

const finalBacklogs = JSON.parse(localStorage.getItem('tesseract_backlog_data'));
const finalBkl1 = finalBacklogs.find(b => b.id === 'bkl_test_1');

if (!finalBkl1.completed) {
  console.error('FAIL: Expected finalBkl1.completed to be true');
  process.exit(1);
}
console.log('✓ Marking task "done" in Kanban marked Backlog item complete in storage');

console.log('\n========================================');
console.log('🎉 ALL KANBAN-BACKLOG TESTS PASSED 100%!');
console.log('========================================');
