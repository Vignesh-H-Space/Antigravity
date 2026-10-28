const fs = require('fs');
const path = require('path');

// Simulate browser localStorage
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

// Mock window and document
global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.navigator = {};

// Load initial data
const initialDataCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'initial_data.js'), 'utf8');
(new Function(initialDataCode + '\nglobal.INITIAL_TASKS = INITIAL_TASKS;'))();

// Initialize state
global.STORAGE_KEY = 'tesseract_goals_tasks_data';
global.state = {
  tasks: [...INITIAL_TASKS],
  viewMode: 'eisenhower'
};

// Load HorizonBridge
const bridgeCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'horizon_bridge.js'), 'utf8');
(new Function(bridgeCode + '\nglobal.HorizonBridge = HorizonBridge;'))();

// Load app.js (mocking things app.js needs)
global.XP_VALUES = { DAILY_TASK: 10, WEEKLY_TASK: 25, MONTHLY_TASK: 50, QUARTERLY_TASK: 100, ANNUAL_VISION: 250, PERFECT_DAY_BONUS: 50 };
global.showToast = () => {};
global.triggerConfetti = () => {};
global.checkAndUpdateStreak = () => {};
global.renderAll = () => {};
global.updateAppBadge = () => {};
global.lucide = { createIcons: () => {} };

const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
(new Function(appCode + '\nglobal.state = state;\nglobal.toggleTaskCompletion = toggleTaskCompletion;\nglobal.classifyTaskQuadrant = classifyTaskQuadrant;\nglobal.saveData = saveData;\nglobal.loadData = loadData;'))();

loadData();

console.log('--- Initial State ---');
console.log('Total tasks in state:', state.tasks.length);

// Let's find tasks in "Do First" (q1)
const q1Tasks = state.tasks.filter(t => !t.completed && classifyTaskQuadrant(t) === 'q1');
console.log('Tasks in Q1 (Do First):', q1Tasks.map(t => ({ id: t.id, title: t.title, isBacklog: t.isBacklog, backlogId: t.backlogId })));

if (q1Tasks.length > 0) {
  const targetTask = q1Tasks[0];
  console.log(`\nTesting completing Q1 task: ${targetTask.id} ("${targetTask.title}")`);
  toggleTaskCompletion(targetTask.id);
  console.log('After toggleTaskCompletion: completed =', targetTask.completed);

  // Check saved in localStorage
  const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const savedTarget = savedTasks.find(t => t.id === targetTask.id);
  console.log('In localStorage tesseract_goals_tasks_data: completed =', savedTarget.completed);
}

// Now test with a Backlog item bridged into state.tasks
console.log('\n--- Testing with Backlog item in Q1 ---');
const bklItem = {
  id: 'bkl_urgent_1',
  objective: 'Fix production memory leak on web worker',
  group: 'work',
  severity: 'high',
  dueDate: new Date().toISOString().split('T')[0],
  recurrence: 'none',
  completed: false,
  completedAt: null
};
localStorage.setItem('tesseract_backlog_data', JSON.stringify([bklItem]));

// Run syncAll as HorizonBridge does
HorizonBridge.syncAll();

const bklTaskInState = state.tasks.find(t => t.backlogId === 'bkl_urgent_1');
console.log('Bridged backlog task in state:', { id: bklTaskInState.id, title: bklTaskInState.title, completed: bklTaskInState.completed, q: classifyTaskQuadrant(bklTaskInState) });

console.log('Toggling completion of bridged backlog task...');
toggleTaskCompletion(bklTaskInState.id);
console.log('After toggleTaskCompletion in state.tasks: completed =', bklTaskInState.completed);

// Now simulate user leaving the page (e.g. to backlogs.html or pulse.html) and returning
console.log('User navigates away and returns -> loadData() executes:');
loadData();

const reloadedBklTask = state.tasks.find(t => t.backlogId === 'bkl_urgent_1');
console.log('After page reload: completed =', reloadedBklTask.completed);

if (reloadedBklTask.completed === false) {
  console.error('❌ BUG REPRODUCED! Backlog task reverted back to UNCOMPLETED on reload!');
} else {
  console.log('✓ Backlog task remained completed after reload.');
}

// Test unchecking / reopening the task
console.log('\nToggling completion again to reopen task...');
toggleTaskCompletion(reloadedBklTask.id);
console.log('After toggleTaskCompletion (reopen): completed =', reloadedBklTask.completed);

console.log('User navigates away and returns -> loadData() executes:');
loadData();

const reopenedTask = state.tasks.find(t => t.backlogId === 'bkl_urgent_1');
console.log('After page reload: completed =', reopenedTask.completed);

if (reopenedTask.completed === false) {
  console.log('✓ Reopened task cleanly stayed open after reload!');
} else {
  console.error('❌ Reopened task was marked completed!');
}
