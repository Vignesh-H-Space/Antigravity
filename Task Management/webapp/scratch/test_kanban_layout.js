const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

// Check that kanbanBoard container is present inside kanban-grid-wrapper
const hasKanbanBoardDiv = appJs.includes('<div class="kanban-board" id="kanbanBoard">');
console.log('1. Contains <div class="kanban-board" id="kanbanBoard">:', hasKanbanBoardDiv);

// Check that reviving button has no overflowing text span
const hasReviveSpan = appJs.includes('<span>10s Revive</span>');
console.log('2. Does NOT have overflowing <span>10s Revive</span>:', !hasReviveSpan);

// Check CSS rules
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'modules', 'kanban.css'), 'utf8');
const hasContainerFlexCol = css.includes('flex-direction: column !important');
const hasBoardFlexRow = css.includes('flex-direction: row');
console.log('3. CSS #kanban-board-container is flex-direction column:', hasContainerFlexCol);
console.log('4. CSS .kanban-board is flex-direction row:', hasBoardFlexRow);

if (hasKanbanBoardDiv && !hasReviveSpan && hasContainerFlexCol && hasBoardFlexRow) {
  console.log('\nAll Kanban layout verification checks PASSED!');
  process.exit(0);
} else {
  console.error('\nVerification checks FAILED!');
  process.exit(1);
}
