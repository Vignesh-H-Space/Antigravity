/**
 * Apex Goal & Task Management Web Application
 * Full interactive reactive state manager with goal cascade & confetti
 */

const STORAGE_KEY = 'apex_goals_tasks_data';
const THEME_KEY = 'apex_goals_theme';

const TIERS = [
  { id: 'daily', name: 'Daily Tasks', emoji: '🌅', color: '#06b6d4', desc: "Today's high-leverage execution items" },
  { id: 'weekly', name: 'Weekly Milestones', emoji: '📅', color: '#8b5cf6', desc: 'Tactical milestones for this week' },
  { id: 'monthly', name: 'Monthly Goals', emoji: '🗓️', color: '#10b981', desc: 'Deliverables and focus areas for this month' },
  { id: 'quarterly', name: 'Quarterly OKRs', emoji: '🎯', color: '#f59e0b', desc: '90-day objectives & key strategic results' },
  { id: 'annual', name: 'Annual Vision', emoji: '🏆', color: '#ec4899', desc: 'North star pillars & yearly ambitions' }
];

let state = {
  tasks: [],
  activeHorizon: 'all', // 'all' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  activeView: 'list', // 'list' | 'cascade' | 'analytics'
  statusFilter: 'all', // 'all' | 'active' | 'completed'
  categoryFilter: 'all',
  priorityFilter: 'all',
  searchQuery: '',
  editingTaskId: null
};

// DOM Elements
const tasksContainer = document.getElementById('tasks-container');
const cascadeContainer = document.getElementById('cascade-container');
const analyticsContainer = document.getElementById('analytics-container');
const currentViewHeading = document.getElementById('current-view-heading');
const currentViewDesc = document.getElementById('current-view-desc');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitleText = document.getElementById('modal-title-text');
const formParentSelect = document.getElementById('form-parent');
const toastContainer = document.getElementById('toast-container');

// Initialization
function init() {
  loadTheme();
  loadData();
  bindEvents();
  renderAll();
  lucide.createIcons();
}

// Storage & Data Loading
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state.tasks = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
      state.tasks = typeof INITIAL_TASKS !== 'undefined' ? [...INITIAL_TASKS] : [];
    }
  } else if (typeof INITIAL_TASKS !== 'undefined') {
    state.tasks = [...INITIAL_TASKS];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

// Theme handling
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  lucide.createIcons();
}

// Event Bindings
function bindEvents() {
  // Horizon Tabs
  document.querySelectorAll('.nav-menu button[data-horizon]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-menu button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeHorizon = btn.getAttribute('data-horizon');
      state.activeView = 'list';
      renderAll();
    });
  });

  // Secondary Views
  document.getElementById('btn-view-cascade').addEventListener('click', () => {
    document.querySelectorAll('.nav-menu button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-view-cascade').classList.add('active');
    state.activeView = 'cascade';
    renderAll();
  });

  document.getElementById('btn-view-analytics').addEventListener('click', () => {
    document.querySelectorAll('.nav-menu button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-view-analytics').classList.add('active');
    state.activeView = 'analytics';
    renderAll();
  });

  // Horizon Card click
  document.querySelectorAll('.horizon-card').forEach(card => {
    card.addEventListener('click', () => {
      const horizon = card.getAttribute('data-horizon');
      const tabBtn = document.getElementById(`tab-${horizon}`);
      if (tabBtn) tabBtn.click();
    });
  });

  // Status Segment Filter
  document.querySelectorAll('#status-filter .segment').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#status-filter .segment').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.statusFilter = btn.getAttribute('data-status');
      renderTaskList();
    });
  });

  // Dropdown Filters
  document.getElementById('category-filter').addEventListener('change', (e) => {
    state.categoryFilter = e.target.value;
    renderTaskList();
  });

  document.getElementById('priority-filter').addEventListener('change', (e) => {
    state.priorityFilter = e.target.value;
    renderTaskList();
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderTaskList();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderTaskList();
    searchInput.focus();
  });

  // Keyboard shortcut '/' to search & 'N' for new task
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !taskModal.style.display.includes('block')) {
      e.preventDefault();
      searchInput.focus();
    }
    if ((e.key === 'n' || e.key === 'N') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && taskModal.style.display === 'none') {
      e.preventDefault();
      openAddModal();
    }
    if (e.key === 'Escape' && taskModal.style.display !== 'none') {
      closeModal();
    }
  });

  // Theme & User Actions
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-open-add-modal').addEventListener('click', () => openAddModal());
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('btn-reset-data').addEventListener('click', resetToSampleData);
  document.getElementById('btn-export-json').addEventListener('click', exportJSON);
  document.getElementById('btn-export-markdown').addEventListener('click', exportMarkdown);

  const importTrigger = document.getElementById('btn-import-trigger');
  const importInput = document.getElementById('import-file-input');
  importTrigger.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', handleImportJSON);

  // Form Submit
  taskForm.addEventListener('submit', handleFormSubmit);
}

// Toggle Task Completion
function toggleTaskCompletion(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  saveData();

  if (task.completed) {
    triggerConfetti();
    showToast(`Completed: "${task.title}" 🎉`, 'success');
  } else {
    showToast(`Reopened: "${task.title}"`, 'info');
  }

  renderAll();
}

// Delete Task
function deleteTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    // Remove task and unlink children
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    state.tasks.forEach(t => {
      if (t.parentId === taskId) t.parentId = null;
    });
    saveData();
    showToast('Task removed.', 'info');
    renderAll();
  }
}

// Confetti Celebration
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']
    });
  }
}

// Render Functions
function renderAll() {
  updateSidebarBadges();
  updateProgressCards();
  
  if (state.activeView === 'list') {
    tasksContainer.style.display = 'block';
    cascadeContainer.style.display = 'none';
    analyticsContainer.style.display = 'none';
    document.querySelector('.filter-bar').style.display = 'flex';
    document.getElementById('progress-summary-container').style.display = 'grid';
    updateHeaderTitle();
    renderTaskList();
  } else if (state.activeView === 'cascade') {
    tasksContainer.style.display = 'none';
    cascadeContainer.style.display = 'block';
    analyticsContainer.style.display = 'none';
    document.querySelector('.filter-bar').style.display = 'none';
    document.getElementById('progress-summary-container').style.display = 'none';
    currentViewHeading.textContent = 'Strategic Goal Cascade';
    currentViewDesc.textContent = 'Multi-horizon vertical alignment linking daily actions to annual vision.';
    renderCascadeView();
  } else if (state.activeView === 'analytics') {
    tasksContainer.style.display = 'none';
    cascadeContainer.style.display = 'none';
    analyticsContainer.style.display = 'block';
    document.querySelector('.filter-bar').style.display = 'none';
    document.getElementById('progress-summary-container').style.display = 'grid';
    currentViewHeading.textContent = 'Productivity & Goal Analytics';
    currentViewDesc.textContent = 'Comprehensive metric tracking and horizon performance.';
    renderAnalyticsView();
  }

  lucide.createIcons();
}

function updateHeaderTitle() {
  if (state.activeHorizon === 'all') {
    currentViewHeading.textContent = 'All Goals & Tasks';
    currentViewDesc.textContent = 'Holistic overview across all 5 strategic time horizons.';
  } else {
    const tierObj = TIERS.find(t => t.id === state.activeHorizon);
    if (tierObj) {
      currentViewHeading.textContent = `${tierObj.emoji} ${tierObj.name}`;
      currentViewDesc.textContent = tierObj.desc;
    }
  }
}

function updateSidebarBadges() {
  document.getElementById('badge-all').textContent = state.tasks.length;
  TIERS.forEach(t => {
    const count = state.tasks.filter(task => task.tier === t.id).length;
    const badge = document.getElementById(`badge-${t.id}`);
    if (badge) badge.textContent = count;
  });
}

function updateProgressCards() {
  TIERS.forEach(t => {
    const tierTasks = state.tasks.filter(task => task.tier === t.id);
    const total = tierTasks.length;
    const completed = tierTasks.filter(task => task.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const ratioEl = document.getElementById(`stat-ratio-${t.id}`);
    const pctEl = document.getElementById(`stat-pct-${t.id}`);
    const barEl = document.getElementById(`stat-bar-${t.id}`);

    if (ratioEl) ratioEl.textContent = `${completed}/${total}`;
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
  });
}

// Render Task List View
function renderTaskList() {
  tasksContainer.innerHTML = '';

  let filtered = state.tasks.filter(task => {
    // Horizon filter
    if (state.activeHorizon !== 'all' && task.tier !== state.activeHorizon) return false;

    // Status filter
    if (state.statusFilter === 'active' && task.completed) return false;
    if (state.statusFilter === 'completed' && !task.completed) return false;

    // Category filter
    if (state.categoryFilter !== 'all' && task.category !== state.categoryFilter) return false;

    // Priority filter
    if (state.priorityFilter !== 'all' && task.priority !== state.priorityFilter) return false;

    // Search query
    if (state.searchQuery) {
      const matchTitle = task.title.toLowerCase().includes(state.searchQuery);
      const matchDesc = (task.description || '').toLowerCase().includes(state.searchQuery);
      const matchCat = (task.category || '').toLowerCase().includes(state.searchQuery);
      const matchTags = (task.tags || []).some(tg => tg.toLowerCase().includes(state.searchQuery));
      if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-title">No goals or tasks match your filter</div>
        <div class="empty-sub">Try adjusting search parameters or click "Add Goal / Task" to create one.</div>
      </div>
    `;
    return;
  }

  // If "all" horizon selected, group by tier
  if (state.activeHorizon === 'all') {
    TIERS.forEach(tierObj => {
      const tierItems = filtered.filter(t => t.tier === tierObj.id);
      if (tierItems.length > 0) {
        const groupEl = document.createElement('div');
        groupEl.className = 'task-tier-group';
        groupEl.innerHTML = `
          <div class="tier-group-header">
            <div class="tier-group-title">
              <span>${tierObj.emoji}</span>
              <span>${tierObj.name}</span>
              <span class="tier-group-count">${tierItems.length}</span>
            </div>
          </div>
          <div class="tasks-grid" id="grid-${tierObj.id}"></div>
        `;
        tasksContainer.appendChild(groupEl);
        const grid = groupEl.querySelector(`#grid-${tierObj.id}`);
        tierItems.forEach(task => grid.appendChild(createTaskCardElement(task)));
      }
    });
  } else {
    const grid = document.createElement('div');
    grid.className = 'tasks-grid';
    filtered.forEach(task => grid.appendChild(createTaskCardElement(task)));
    tasksContainer.appendChild(grid);
  }

  lucide.createIcons();
}

function createTaskCardElement(task) {
  const card = document.createElement('div');
  card.className = `task-card ${task.completed ? 'completed' : ''}`;
  card.setAttribute('data-tier', task.tier);
  card.setAttribute('data-id', task.id);

  const parentTask = task.parentId ? state.tasks.find(p => p.id === task.parentId) : null;
  const parentBadge = parentTask ? `<span class="meta-pill cascade-pill" title="Cascades up to: ${parentTask.title}"><i data-lucide="arrow-up-right"></i> ${parentTask.title.substring(0, 24)}...</span>` : '';

  card.innerHTML = `
    <div class="checkbox-wrapper">
      <input type="checkbox" class="custom-checkbox" id="chk-${task.id}" ${task.completed ? 'checked' : ''} aria-label="Mark ${task.title} complete" />
    </div>

    <div class="task-content">
      <div class="task-header-row">
        <div class="task-title">${escapeHTML(task.title)}</div>
        <div class="task-actions">
          <button class="action-btn edit-btn" title="Edit Task" data-id="${task.id}"><i data-lucide="edit-2"></i></button>
          <button class="action-btn delete-btn" title="Delete Task" data-id="${task.id}"><i data-lucide="trash-2"></i></button>
        </div>
      </div>

      ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}

      <div class="task-meta-row">
        <span class="meta-pill prio-pill prio-${task.priority}">${task.priority}</span>
        <span class="meta-pill category-pill">#${task.category || 'General'}</span>
        ${task.dueDate ? `<span class="meta-pill due-pill"><i data-lucide="calendar"></i> ${task.dueDate}</span>` : ''}
        ${parentBadge}
        ${(task.tags || []).map(tg => `<span class="tag-pill">#${escapeHTML(tg)}</span>`).join(' ')}
      </div>
    </div>
  `;

  // Checkbox event
  const chk = card.querySelector(`#chk-${task.id}`);
  chk.addEventListener('change', () => toggleTaskCompletion(task.id));

  // Edit / Delete events
  card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
  card.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

  return card;
}

// Goal Cascade Tree View
function renderCascadeView() {
  const container = document.getElementById('tree-content');
  container.innerHTML = '';

  const annualGoals = state.tasks.filter(t => t.tier === 'annual');

  if (annualGoals.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-title">No Annual Goals Set</div><div class="empty-sub">Create Annual goals and link quarterly/monthly/weekly/daily milestones to them.</div></div>`;
    return;
  }

  annualGoals.forEach(ann => {
    const node = document.createElement('div');
    node.className = 'tree-node';

    // Find children in quarterly
    const quarterlyChildren = state.tasks.filter(t => t.parentId === ann.id);

    node.innerHTML = `
      <div class="tree-node-header">
        <input type="checkbox" class="custom-checkbox" ${ann.completed ? 'checked' : ''} data-id="${ann.id}">
        <span class="horizon-badge tier-annual">🏆 Annual</span>
        <strong>${escapeHTML(ann.title)}</strong>
        <span class="meta-pill category-pill" style="margin-left:auto;">#${ann.category}</span>
      </div>
      <div class="tree-subgoals">
        ${quarterlyChildren.length > 0 ? quarterlyChildren.map(qrt => renderCascadeSubgoal(qrt)).join('') : '<div style="color:var(--text-muted); font-size:0.8rem;">No quarterly milestones linked.</div>'}
      </div>
    `;

    // Bind checkboxes in tree
    node.querySelectorAll('.custom-checkbox').forEach(c => {
      c.addEventListener('change', (e) => toggleTaskCompletion(e.target.getAttribute('data-id')));
    });

    container.appendChild(node);
  });
}

function renderCascadeSubgoal(goal) {
  const children = state.tasks.filter(t => t.parentId === goal.id);
  const tierEmoji = TIERS.find(t => t.id === goal.tier)?.emoji || '🎯';

  return `
    <div style="background:var(--bg-input); padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:6px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <input type="checkbox" class="custom-checkbox" ${goal.completed ? 'checked' : ''} data-id="${goal.id}">
        <span>${tierEmoji} <strong>${escapeHTML(goal.title)}</strong></span>
        <span class="meta-pill prio-pill prio-${goal.priority}" style="margin-left:auto;">${goal.priority}</span>
      </div>
      ${children.length > 0 ? `
        <div style="margin-left:22px; padding-left:12px; border-left:1px dashed var(--border-color); margin-top:8px; display:flex; flex-direction:column; gap:6px;">
          ${children.map(ch => renderCascadeSubgoal(ch)).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Analytics View
function renderAnalyticsView() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('analytic-overall-pct').textContent = `${overallPct}%`;
  document.getElementById('analytic-overall-count').textContent = `${completed} of ${total} goals done`;

  const dailyTasks = state.tasks.filter(t => t.tier === 'daily');
  const dailyDone = dailyTasks.filter(t => t.completed).length;
  const dailyRate = dailyTasks.length > 0 ? Math.round((dailyDone / dailyTasks.length) * 100) : 0;
  document.getElementById('analytic-daily-rate').textContent = `${dailyRate}%`;

  const linkedCount = state.tasks.filter(t => t.parentId !== null || t.tier === 'annual').length;
  const alignmentScore = total > 0 ? Math.round((linkedCount / total) * 100) : 0;
  document.getElementById('analytic-alignment-score').textContent = `${alignmentScore}%`;

  const urgentOpen = state.tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
  document.getElementById('analytic-urgent-open').textContent = urgentOpen;

  // Category breakdown
  const catContainer = document.getElementById('category-breakdown-container');
  catContainer.innerHTML = '';
  const categories = ['Product', 'Engineering', 'Career', 'Finance', 'Health', 'Personal'];

  categories.forEach(cat => {
    const catTasks = state.tasks.filter(t => t.category === cat);
    if (catTasks.length > 0) {
      const catDone = catTasks.filter(t => t.completed).length;
      const catPct = Math.round((catDone / catTasks.length) * 100);

      const row = document.createElement('div');
      row.className = 'cat-row';
      row.innerHTML = `
        <div class="cat-info">
          <span>#${cat}</span>
          <span>${catDone}/${catTasks.length} (${catPct}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar-fill fill-daily" style="width:${catPct}%"></div>
        </div>
      `;
      catContainer.appendChild(row);
    }
  });
}

// Modal Form handling
function openAddModal(defaultTier = null) {
  state.editingTaskId = null;
  modalTitleText.textContent = 'Create Goal / Task';
  taskForm.reset();
  document.getElementById('task-id-input').value = '';
  if (defaultTier) document.getElementById('form-tier').value = defaultTier;
  else if (state.activeHorizon !== 'all') document.getElementById('form-tier').value = state.activeHorizon;

  populateParentGoalDropdown();
  taskModal.style.display = 'flex';
  document.getElementById('form-title').focus();
}

function openEditModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  state.editingTaskId = taskId;
  modalTitleText.textContent = 'Edit Goal / Task';
  document.getElementById('task-id-input').value = task.id;
  document.getElementById('form-tier').value = task.tier;
  document.getElementById('form-title').value = task.title;
  document.getElementById('form-desc').value = task.description || '';
  document.getElementById('form-priority').value = task.priority || 'medium';
  document.getElementById('form-category').value = task.category || 'Product';
  document.getElementById('form-due').value = task.dueDate || '';
  document.getElementById('form-tags').value = (task.tags || []).join(', ');

  populateParentGoalDropdown(task.parentId, task.id);
  taskModal.style.display = 'flex';
}

function closeModal() {
  taskModal.style.display = 'none';
  state.editingTaskId = null;
}

function populateParentGoalDropdown(selectedParentId = null, currentTaskId = null) {
  formParentSelect.innerHTML = '<option value="">None (Independent Goal)</option>';
  // Higher tiers to link to
  const potentialParents = state.tasks.filter(t => t.id !== currentTaskId && (t.tier === 'annual' || t.tier === 'quarterly' || t.tier === 'monthly' || t.tier === 'weekly'));

  potentialParents.forEach(p => {
    const tierEmoji = TIERS.find(t => t.id === p.tier)?.emoji || '📌';
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `[${tierEmoji} ${p.tier.toUpperCase()}] ${p.title}`;
    if (selectedParentId && selectedParentId === p.id) opt.selected = true;
    formParentSelect.appendChild(opt);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('form-title').value.trim();
  const tier = document.getElementById('form-tier').value;
  const desc = document.getElementById('form-desc').value.trim();
  const priority = document.getElementById('form-priority').value;
  const category = document.getElementById('form-category').value;
  const due = document.getElementById('form-due').value;
  const parentId = document.getElementById('form-parent').value || null;
  const rawTags = document.getElementById('form-tags').value;
  const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [tier, category.toLowerCase()];

  if (!title) return;

  if (state.editingTaskId) {
    const task = state.tasks.find(t => t.id === state.editingTaskId);
    if (task) {
      task.title = title;
      task.tier = tier;
      task.description = desc;
      task.priority = priority;
      task.category = category;
      task.dueDate = due;
      task.parentId = parentId;
      task.tags = tags;
      showToast('Goal updated successfully.', 'success');
    }
  } else {
    const prefix = tier.substring(0, 3);
    const newId = `${prefix}_${Date.now()}`;
    const newTask = {
      id: newId,
      title,
      description: desc,
      tier,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      dueDate: due || new Date().toISOString().split('T')[0],
      priority,
      category,
      parentId,
      tags
    };
    state.tasks.unshift(newTask);
    showToast('New goal added!', 'success');
  }

  saveData();
  closeModal();
  renderAll();
}

// Data Export & Import
function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `apex_goals_tasks_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Exported JSON data file.', 'info');
}

function handleImportJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        state.tasks = imported;
        saveData();
        renderAll();
        showToast(`Imported ${imported.length} tasks successfully!`, 'success');
      } else {
        alert('Invalid JSON structure: Expected an array of task objects.');
      }
    } catch (err) {
      alert('Error parsing JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function exportMarkdown() {
  let md = `# APEX GOALS & TASKS SUMMARY\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
  TIERS.forEach(tierObj => {
    const tierTasks = state.tasks.filter(t => t.tier === tierObj.id);
    md += `## ${tierObj.emoji} ${tierObj.name} (${tierTasks.filter(t => t.completed).length}/${tierTasks.length})\n`;
    tierTasks.forEach(t => {
      const mark = t.completed ? '[x]' : '[ ]';
      md += `- ${mark} **[${t.priority.toUpperCase()}]** ${t.title} *(Due: ${t.dueDate || 'N/A'}, #${t.category})*\n`;
      if (t.description) md += `  - ${t.description}\n`;
    });
    md += '\n';
  });

  navigator.clipboard.writeText(md).then(() => {
    showToast('Markdown summary copied to clipboard! 📋', 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard.', 'error');
  });
}

function resetToSampleData() {
  if (confirm('Reset all tasks to original sample data? Custom additions will be overwritten.')) {
    state.tasks = typeof INITIAL_TASKS !== 'undefined' ? [...INITIAL_TASKS] : [];
    saveData();
    renderAll();
    showToast('Restored sample data.', 'info');
  }
}

// Helper utilities
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? 'check-circle' : 'info';
  toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${escapeHTML(message)}</span>`;
  toastContainer.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Start application on DOM load
document.addEventListener('DOMContentLoaded', init);
