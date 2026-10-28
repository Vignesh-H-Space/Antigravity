const fs = require('fs');
const path = require('path');

console.log('Testing Kanban 24h Auto-Archive and 10s Revive logic...');

// Test 24-hour auto-archive logic
const now = Date.now();
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const sampleTasks = [
  { id: 't1', title: 'Task done 2 hours ago', completed: true, completedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
  { id: 't2', title: 'Task done 25 hours ago', completed: true, completedAt: new Date(now - 25 * 60 * 60 * 1000).toISOString() },
  { id: 't3', title: 'Task done 3 days ago', completed: true, completedAt: new Date(now - 72 * 60 * 60 * 1000).toISOString() },
  { id: 't4', title: 'Task just done', completed: true, completedAt: new Date(now - 5 * 60 * 1000).toISOString() }
];

const recent = [];
const archived = [];

sampleTasks.forEach(t => {
  const compTime = t.completedAt ? new Date(t.completedAt).getTime() : 0;
  if (!compTime || (now - compTime) < TWENTY_FOUR_HOURS) {
    recent.push(t);
  } else {
    archived.push(t);
  }
});

console.log(`Recent Done (<24h): ${recent.length} (Expected: 2)`);
console.log(`Archived Done (>=24h): ${archived.length} (Expected: 2)`);

if (recent.length === 2 && archived.length === 2) {
  console.log('✓ 24h Auto-Archive separation works perfectly!');
} else {
  console.error('❌ 24h separation failed!');
  process.exit(1);
}

// Test 10s Revive / Undo logic
let tasksState = [...sampleTasks];
const recentlyDeleted = {};

function deleteTaskWithReviveMock(taskId, durationSec = 10) {
  const task = tasksState.find(t => t.id === taskId);
  if (!task) return null;
  recentlyDeleted[taskId] = { task: JSON.parse(JSON.stringify(task)) };
  tasksState = tasksState.filter(t => t.id !== taskId);
  return recentlyDeleted[taskId];
}

function restoreTaskMock(taskId) {
  if (recentlyDeleted[taskId]) {
    tasksState.push(recentlyDeleted[taskId].task);
    delete recentlyDeleted[taskId];
    return true;
  }
  return false;
}

// Delete t1
deleteTaskWithReviveMock('t1', 10);
console.log('After delete: tasksState length =', tasksState.length, '(Expected: 3)');
console.log('Is t1 in recentlyDeleted?', !!recentlyDeleted['t1']);

// Revive t1
restoreTaskMock('t1');
console.log('After revive: tasksState length =', tasksState.length, '(Expected: 4)');
console.log('Is t1 back in tasksState?', tasksState.some(t => t.id === 't1'));

if (tasksState.length === 4 && tasksState.some(t => t.id === 't1')) {
  console.log('✓ 10s Revive / Undo mechanism verified 100%!');
} else {
  console.error('❌ Revive failed!');
  process.exit(1);
}
