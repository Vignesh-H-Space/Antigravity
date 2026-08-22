/**
 * Tesseract Goal & Task Management Matrix
 * Multi-dimensional reactive state manager with goal cascade & cosmic feedback
 */

const STORAGE_KEY = 'tesseract_goals_tasks_data';
const THEME_KEY = 'tesseract_goals_theme';
const STREAK_KEY = 'tesseract_streak_data';
const PROFILE_KEY = 'tesseract_profile_data';

// Streak milestone badges
const STREAK_BADGES = [
  { days: 7,   emoji: '🏅', name: '1 Week' },
  { days: 14,  emoji: '⚡', name: '2 Weeks' },
  { days: 30,  emoji: '🌟', name: '30 Days' },
  { days: 50,  emoji: '💎', name: '50 Days' },
  { days: 75,  emoji: '🔥', name: '75 Days' },
  { days: 100, emoji: '👑', name: '100 Days' },
  { days: 150, emoji: '🚀', name: '150 Days' },
  { days: 200, emoji: '🏆', name: '200 Days' },
  { days: 250, emoji: '💫', name: '250 Days' },
  { days: 300, emoji: '🌈', name: '300 Days' },
  { days: 365, emoji: '🎯', name: '1 Year' }
];

const TIERS = [
  { id: 'daily', name: 'Daily Tasks', emoji: '🌅', color: '#f59e0b', desc: "Today's high-leverage execution items" },
  { id: 'weekly', name: 'Weekly Milestones', emoji: '📅', color: '#8b5cf6', desc: 'Tactical milestones for this week' },
  { id: 'monthly', name: 'Monthly Goals', emoji: '🗓️', color: '#10b981', desc: 'Deliverables and focus areas for this month' },
  { id: 'quarterly', name: 'Quarterly Goals', emoji: '🎯', color: '#06b6d4', desc: '90-day objectives & key strategic results' },
  { id: 'annual', name: 'Annual Vision', emoji: '🏆', color: '#f43f5e', desc: 'North star pillars & yearly ambitions' }
];

let state = {
  tasks: [],
  activeHorizon: 'general', // 'general' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'all'
  statusFilter: 'all', // 'all' | 'active' | 'completed'
  categoryFilter: 'all',
  priorityFilter: 'all',
  searchQuery: '',
  editingTaskId: null,
  profile: {
    name: 'Tesseract User',
    image: null
  },
  streak: {
    count: 0,
    lastDate: null
  }
};

// Initialization
function init() {
  loadTheme();
  loadData();
  loadStreak();
  loadProfile();

  // Read URL parameters on index.html (e.g. ?horizon=daily)
  const urlParams = new URLSearchParams(window.location.search);
  const horizonParam = urlParams.get('horizon');
  if (horizonParam && ['general', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'all'].includes(horizonParam)) {
    state.activeHorizon = horizonParam;
  }

  // Inject shared layout components
  const page = typeof Components !== 'undefined' ? Components.getCurrentPage() : 'index';
  if (typeof Components !== 'undefined') {
    Components.renderSidebar(state.activeHorizon);
    
    let headerConfig = { title: 'Executive Command Center', subtitle: 'Unified multi-horizon cockpit & execution launchpad.', showSearch: true };
    if (page === 'cascade') {
      headerConfig = { title: 'Strategic Goal Cascade', subtitle: 'Multi-horizon vertical alignment linking daily actions to annual vision.', showSearch: false };
    } else if (page === 'analytics') {
      headerConfig = { title: 'Productivity & Goal Analytics', subtitle: 'Comprehensive metric tracking and horizon performance.', showSearch: false };
    } else if (page === 'profile') {
      headerConfig = { title: 'Your Profile', subtitle: 'Stats, badges, and activity history.', showSearch: false };
    }
    Components.renderHeader(headerConfig);
    Components.renderModalAndToasts();
  }

  bindEvents();
  renderAll();
  renderStreakUI();
  lucide.createIcons();
}

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

function loadProfile() {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try {
      state.profile = JSON.parse(saved);
    } catch (e) {
      // Keep default
    }
  }
}

function saveProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
}

// ── Streak Engine ──────────────────────────────────────────
function getToday() {
  return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function loadStreak() {
  const saved = localStorage.getItem(STREAK_KEY);
  if (saved) {
    try {
      state.streak = JSON.parse(saved);
    } catch (e) {
      state.streak = { count: 0, lastDate: null };
    }
  } else {
    // Derive initial streak from existing completed daily tasks
    deriveInitialStreak();
  }
}

function saveStreak() {
  localStorage.setItem(STREAK_KEY, JSON.stringify(state.streak));
}

function deriveInitialStreak() {
  const dailyTasks = state.tasks.filter(t => t.tier === 'daily');
  const allDailyDone = dailyTasks.length > 0 && dailyTasks.every(t => t.completed);
  if (allDailyDone) {
    state.streak = { count: 1, lastDate: getToday() };
  } else {
    state.streak = { count: 0, lastDate: null };
  }
  saveStreak();
}

function checkAndUpdateStreak() {
  const today = getToday();
  const dailyTasks = state.tasks.filter(t => t.tier === 'daily');
  if (dailyTasks.length === 0) return;

  const allDailyDone = dailyTasks.every(t => t.completed);

  if (allDailyDone) {
    if (state.streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (state.streak.lastDate === yesterday) {
        state.streak.count += 1;
      } else {
        state.streak.count = 1;
      }
      state.streak.lastDate = today;
      saveStreak();
      triggerConfetti();
      showToast(`🔥 Daily Streak updated! You're on a ${state.streak.count}-day streak!`, 'success');
      renderStreakUI();
    }
  } else {
    if (state.streak.lastDate === today) {
      state.streak.count = Math.max(0, state.streak.count - 1);
      state.streak.lastDate = null;
      saveStreak();
      renderStreakUI();
    }
  }
}

function renderStreakUI() {
  const count = state.streak ? state.streak.count : 0;
  const counterEl = document.getElementById('streak-counter');
  const fillEl = document.getElementById('streak-fill');
  const labelEl = document.getElementById('streak-badge-label');
  const badgeContainer = document.getElementById('streak-badges');

  if (counterEl) counterEl.textContent = `${count} Day${count !== 1 ? 's' : ''}`;

  let nextBadge = STREAK_BADGES.find(b => b.days > count) || STREAK_BADGES[STREAK_BADGES.length - 1];
  let prevDays = 0;
  const currBadgeIndex = STREAK_BADGES.findIndex(b => b.days > count);
  if (currBadgeIndex > 0) {
    prevDays = STREAK_BADGES[currBadgeIndex - 1].days;
  }

  const progressRange = nextBadge.days - prevDays;
  const progressCurrent = count - prevDays;
  const pct = Math.min(100, Math.max(0, Math.round((progressCurrent / progressRange) * 100)));

  if (fillEl) fillEl.style.width = `${pct}%`;
  if (labelEl) {
    if (count >= 365) {
      labelEl.textContent = '🏆 Grandmaster (1 Year Achieved!)';
    } else {
      const daysLeft = nextBadge.days - count;
      labelEl.textContent = `Next: ${nextBadge.emoji} ${nextBadge.name} (${daysLeft}d left)`;
    }
  }

  if (badgeContainer) {
    badgeContainer.innerHTML = '';
    STREAK_BADGES.forEach((badge, idx) => {
      const earned = count >= badge.days;
      const isNext = !earned && (idx === 0 || count >= STREAK_BADGES[idx - 1].days);
      const span = document.createElement('span');
      span.className = `streak-badge-pill ${earned ? 'earned' : isNext ? 'next' : 'locked'}`;
      span.textContent = badge.emoji;
      span.title = earned
        ? `Unlocked: ${badge.name} (${badge.days} days streak)`
        : isNext
        ? `Next up: ${badge.name} (${badge.days - count} days to go!)`
        : `Locked: ${badge.name} (${badge.days} days streak)`;
      badgeContainer.appendChild(span);
    });
  }
}

// ── Theme Switcher ──────────────────────────────────────────
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
}

// Horizon Navigation
function setHorizonFilter(horizon) {
  const page = typeof Components !== 'undefined' ? Components.getCurrentPage() : 'index';
  if (page !== 'index') {
    window.location.href = `index.html?horizon=${horizon}`;
    return;
  }

  state.activeHorizon = horizon;

  // Sync sidebar
  document.querySelectorAll('.nav-menu button[data-horizon]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-horizon') === horizon);
  });

  // Sync dropdown
  const horizonSelectFilter = document.getElementById('horizon-select-filter');
  if (horizonSelectFilter) {
    horizonSelectFilter.value = horizon;
  }

  renderAll();
}

// Event Bindings
function bindEvents() {
  // Horizon Sidebar Tabs
  document.querySelectorAll('.nav-menu button[data-horizon]').forEach(btn => {
    btn.addEventListener('click', () => {
      setHorizonFilter(btn.getAttribute('data-horizon'));
    });
  });

  // Horizon Dropdown Select Filter
  const horizonSelectFilter = document.getElementById('horizon-select-filter');
  if (horizonSelectFilter) {
    horizonSelectFilter.addEventListener('change', (e) => {
      setHorizonFilter(e.target.value);
    });
  }

  // Horizon Card click
  document.querySelectorAll('.horizon-card').forEach(card => {
    card.addEventListener('click', () => {
      const horizon = card.getAttribute('data-horizon');
      setHorizonFilter(horizon);
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
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      renderTaskList();
    });
  }

  const priorityFilter = document.getElementById('priority-filter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      state.priorityFilter = e.target.value;
      renderTaskList();
    });
  }

  // Search
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  if (searchInput && clearSearchBtn) {
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
  }

  // Keyboard shortcut '/' to search & 'N' for new task
  window.addEventListener('keydown', (e) => {
    const taskModal = document.getElementById('task-modal');
    if (e.key === '/' && searchInput && document.activeElement !== searchInput && (!taskModal || taskModal.style.display === 'none')) {
      e.preventDefault();
      searchInput.focus();
    }
    if ((e.key === 'n' || e.key === 'N') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && (!taskModal || taskModal.style.display === 'none')) {
      e.preventDefault();
      openAddModal();
    }
    if (e.key === 'Escape' && taskModal && taskModal.style.display !== 'none') {
      closeModal();
    }
  });

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const btnOpenAddModal = document.getElementById('btn-open-add-modal');
  if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', () => openAddModal());

  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) btnResetData.addEventListener('click', resetToSampleData);

  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) btnExportJson.addEventListener('click', exportJSON);

  const btnExportMd = document.getElementById('btn-export-markdown');
  if (btnExportMd) btnExportMd.addEventListener('click', exportMarkdown);

  // Profile Edit
  const profileAvatarBtn = document.getElementById('profile-avatar-large');
  const profileImageInput = document.getElementById('profile-image-input');
  if (profileAvatarBtn && profileImageInput) {
    profileAvatarBtn.addEventListener('click', () => {
      profileImageInput.click();
    });
    profileImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          state.profile.image = event.target.result;
          saveProfile();
          renderProfileView();
          updateHeaderAvatar();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnEditName = document.getElementById('btn-edit-name');
  if (btnEditName) {
    btnEditName.addEventListener('click', () => {
      const newName = prompt("Enter your new profile name:", state.profile.name);
      if (newName && newName.trim() !== '') {
        state.profile.name = newName.trim();
        saveProfile();
        renderProfileView();
      }
    });
  }

  const importTrigger = document.getElementById('btn-import-trigger');
  const importInput = document.getElementById('import-file-input');
  if (importTrigger && importInput) {
    importTrigger.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', handleImportJSON);
  }

  // Form Submit
  const taskForm = document.getElementById('task-form');
  if (taskForm) taskForm.addEventListener('submit', handleFormSubmit);
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

  // Update streak after any daily task toggle
  if (task.tier === 'daily') {
    checkAndUpdateStreak();
  }

  renderAll();
}

// Delete Task
function deleteTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
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

// Header Profile Avatar Update
function updateHeaderAvatar() {
  const headerImg = document.getElementById('header-avatar-img');
  const headerFallback = document.getElementById('header-avatar-fallback');
  if (headerImg && headerFallback) {
    if (state.profile && state.profile.image) {
      headerImg.src = state.profile.image;
      headerImg.style.display = 'block';
      headerFallback.style.display = 'none';
    } else {
      headerImg.style.display = 'none';
      headerFallback.style.display = 'block';
    }
  }
}

// Quotes list for daily inspiration on Home
const PRODUCTIVITY_QUOTES = [
  "Focus on high-leverage execution. Consistent daily action compounds into extraordinary outcomes.",
  "Discipline is choosing between what you want now and what you want most.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Energy flows where attention goes. Eliminate distractions and conquer the day.",
  "Action cures fear. Take the next highest-leverage step right now.",
  "Small daily improvements over time lead to stunning results.",
  "Strategy is about making choices, trade-offs; it's about deliberately choosing to be different."
];

// Main Render Function
function renderAll() {
  const page = typeof Components !== 'undefined' ? Components.getCurrentPage() : 'index';

  updateHeaderAvatar();
  updateSidebarBadges();
  renderStreakUI();

  if (page === 'index') {
    renderHomeCommandHero();
    syncHorizonUI();
    updateHeaderTitle();
    updateProgressCards();
    renderTaskList();
  } else if (page === 'cascade') {
    renderCascadeView();
  } else if (page === 'analytics') {
    updateProgressCards();
    renderAnalyticsView();
  } else if (page === 'profile') {
    renderProfileView();
  }

  lucide.createIcons();
}

// Render Executive Command Hero on Home
function renderHomeCommandHero() {
  const hero = document.getElementById('command-hero');
  if (!hero) return;

  // If filtered to a single sub-horizon (like quarterly or annual only), hide hero to keep focus
  if (state.activeHorizon !== 'general' && state.activeHorizon !== 'all') {
    hero.style.display = 'none';
    const ribbon = document.getElementById('mindset-ribbon');
    if (ribbon) ribbon.style.display = 'none';
    return;
  }
  hero.style.display = 'block';
  const ribbon = document.getElementById('mindset-ribbon');
  if (ribbon) ribbon.style.display = 'flex';

  // Live Date
  const dateEl = document.getElementById('live-date-text');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  // Greeting
  const userName = (state.profile && state.profile.name) ? state.profile.name : 'Achiever';
  const greetingTitle = document.getElementById('home-greeting-title');
  if (greetingTitle) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    greetingTitle.textContent = `${timeOfDay}, ${userName} 👋`;
  }

  // Quick Metrics
  const dailyTasks = state.tasks.filter(t => t.tier === 'daily');
  const dailyCompleted = dailyTasks.filter(t => t.completed).length;
  const urgentCount = state.tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
  const streakCount = state.streak ? state.streak.count : 0;

  const metricDaily = document.getElementById('metric-daily-ratio');
  const metricStreak = document.getElementById('metric-streak-count');
  const metricUrgent = document.getElementById('metric-urgent-count');

  if (metricDaily) metricDaily.textContent = `${dailyCompleted}/${dailyTasks.length}`;
  if (metricStreak) metricStreak.textContent = `${streakCount} 🔥`;
  if (metricUrgent) metricUrgent.textContent = urgentCount;

  // Spotlight Priority Task
  const spotlightInner = document.getElementById('spotlight-inner');
  if (spotlightInner) {
    const incompleteTasks = state.tasks.filter(t => !t.completed);
    let topTask = incompleteTasks.find(t => t.tier === 'daily' && t.priority === 'urgent')
      || incompleteTasks.find(t => t.tier === 'daily' && t.priority === 'high')
      || incompleteTasks.find(t => t.tier === 'daily')
      || incompleteTasks.find(t => t.priority === 'urgent')
      || incompleteTasks.find(t => t.priority === 'high')
      || incompleteTasks[0];

    if (topTask) {
      const tierObj = TIERS.find(t => t.id === topTask.tier) || { emoji: '📌', name: 'Task' };
      spotlightInner.innerHTML = `
        <div class="spotlight-task-title">
          <span>${tierObj.emoji}</span>
          <span>${escapeHTML(topTask.title)}</span>
        </div>
        <div class="spotlight-task-meta">
          <span class="meta-pill prio-pill prio-${topTask.priority}">${topTask.priority}</span>
          <span class="meta-pill category-pill">#${escapeHTML(topTask.category || 'General')}</span>
          <button class="spotlight-action-btn" onclick="toggleTaskCompletion('${topTask.id}')">
            <i data-lucide="check"></i> <span>Complete</span>
          </button>
        </div>
      `;
    } else {
      spotlightInner.innerHTML = `
        <div class="spotlight-task-title" style="color:#10b981;">
          <span>🎉</span>
          <span>All high-priority goals crushed for now! Take a breath or set a new milestone.</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openAddModal('daily')">
          <i data-lucide="plus"></i> <span>Add New Goal</span>
        </button>
      `;
    }
  }

  // Rotate mindset quote based on day of year
  const quoteEl = document.getElementById('mindset-quote');
  if (quoteEl) {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    quoteEl.textContent = `"${PRODUCTIVITY_QUOTES[dayOfYear % PRODUCTIVITY_QUOTES.length]}"`;
  }
}

// Keep sidebar tabs and filter dropdown in sync
function syncHorizonUI() {
  const h = state.activeHorizon;

  // Sidebar active tab
  document.querySelectorAll('.nav-menu button[data-horizon]').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-horizon') === h);
  });

  // Filter bar dropdown
  const dropdown = document.getElementById('horizon-select-filter');
  if (dropdown && dropdown.value !== h) {
    dropdown.value = h;
  }
}

function updateHeaderTitle() {
  const heading = document.getElementById('current-view-heading');
  const desc = document.getElementById('current-view-desc');
  if (!heading || !desc) return;

  if (state.activeHorizon === 'general') {
    heading.textContent = 'Executive Command Center';
    desc.textContent = 'Unified multi-horizon cockpit & execution launchpad.';
  } else if (state.activeHorizon === 'all') {
    heading.textContent = '🌐 All 5 Strategic Horizons';
    desc.textContent = 'Holistic overview across all 5 strategic time horizons (Daily to Annual).';
  } else {
    const tierObj = TIERS.find(t => t.id === state.activeHorizon);
    if (tierObj) {
      heading.textContent = `${tierObj.emoji} ${tierObj.name}`;
      desc.textContent = tierObj.desc;
    }
  }
}

function updateSidebarBadges() {
  const generalCount = state.tasks.filter(task => ['daily', 'weekly', 'monthly'].includes(task.tier)).length;
  const badgeGeneral = document.getElementById('badge-general');
  if (badgeGeneral) badgeGeneral.textContent = generalCount;

  const badgeAll = document.getElementById('badge-all');
  if (badgeAll) badgeAll.textContent = state.tasks.length;

  TIERS.forEach(t => {
    const count = state.tasks.filter(task => task.tier === t.id).length;
    const badge = document.getElementById(`badge-${t.id}`);
    if (badge) badge.textContent = count;
  });
}

function updateProgressCards() {
  TIERS.forEach(t => {
    const cardEl = document.querySelector(`.horizon-card[data-horizon="${t.id}"]`);
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

    const page = typeof Components !== 'undefined' ? Components.getCurrentPage() : 'index';
    if (cardEl) {
      if (page === 'analytics') {
        cardEl.style.display = 'block';
      } else if (state.activeHorizon === 'general') {
        cardEl.style.display = ['daily', 'weekly', 'monthly'].includes(t.id) ? 'block' : 'none';
      } else if (state.activeHorizon === 'all') {
        cardEl.style.display = 'block';
      } else {
        cardEl.style.display = state.activeHorizon === t.id ? 'block' : 'none';
      }
    }
  });
}

// Render Task List View
function renderTaskList() {
  const tasksContainer = document.getElementById('tasks-container');
  if (!tasksContainer) return;
  tasksContainer.innerHTML = '';

  let filtered = state.tasks.filter(task => {
    // Horizon filter
    if (state.activeHorizon === 'general') {
      if (!['daily', 'weekly', 'monthly'].includes(task.tier)) return false;
    } else if (state.activeHorizon !== 'all') {
      if (task.tier !== state.activeHorizon) return false;
    }

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

  // If "general" or "all" horizon selected, group by visible tiers
  if (state.activeHorizon === 'general' || state.activeHorizon === 'all') {
    const visibleTiers = state.activeHorizon === 'general'
      ? TIERS.filter(t => ['daily', 'weekly', 'monthly'].includes(t.id))
      : TIERS;

    visibleTiers.forEach(tierObj => {
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
  if (!container) return;
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
  const overallPctEl = document.getElementById('analytic-overall-pct');
  if (!overallPctEl) return;

  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  overallPctEl.textContent = `${overallPct}%`;
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
  if (!catContainer) return;
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
  const taskModal = document.getElementById('task-modal');
  const taskForm = document.getElementById('task-form');
  const modalTitleText = document.getElementById('modal-title-text');
  if (!taskModal || !taskForm) return;

  state.editingTaskId = null;
  if (modalTitleText) modalTitleText.textContent = 'Create Goal / Task';
  taskForm.reset();
  document.getElementById('task-id-input').value = '';
  if (defaultTier) document.getElementById('form-tier').value = defaultTier;
  else if (state.activeHorizon !== 'all' && state.activeHorizon !== 'general') document.getElementById('form-tier').value = state.activeHorizon;

  populateParentGoalDropdown();
  taskModal.style.display = 'flex';
  document.getElementById('form-title').focus();
}

function openEditModal(taskId) {
  const taskModal = document.getElementById('task-modal');
  const modalTitleText = document.getElementById('modal-title-text');
  const task = state.tasks.find(t => t.id === taskId);
  if (!task || !taskModal) return;

  state.editingTaskId = taskId;
  if (modalTitleText) modalTitleText.textContent = 'Edit Goal / Task';
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
  const taskModal = document.getElementById('task-modal');
  if (taskModal) taskModal.style.display = 'none';
  state.editingTaskId = null;
}

function populateParentGoalDropdown(selectedParentId = null, currentTaskId = null) {
  const formParentSelect = document.getElementById('form-parent');
  if (!formParentSelect) return;
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
  downloadAnchor.setAttribute("download", `tesseract_matrix_${new Date().toISOString().split('T')[0]}.json`);
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
  let md = `# TESSERACT GOALS & TASKS MATRIX\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
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

// ── Profile View ──────────────────────────────────────────
function renderProfileView() {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) return;

  const tasks = state.tasks;
  const streak = state.streak || { count: 0, lastDate: null };
  const profile = state.profile || { name: 'Tesseract User', image: null };
  const completed = tasks.filter(t => t.completed);
  const total = tasks.length;
  const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // Best streak tracking
  const BEST_STREAK_KEY = 'tesseract_best_streak';
  let bestStreak = parseInt(localStorage.getItem(BEST_STREAK_KEY) || '0');
  if (streak.count > bestStreak) {
    bestStreak = streak.count;
    localStorage.setItem(BEST_STREAK_KEY, bestStreak.toString());
  }

  // Tagline based on stats (one word motivation)
  let tagline = 'Starter';
  if (streak.count >= 100) tagline = 'Legendary';
  else if (streak.count >= 50) tagline = 'Relentless';
  else if (streak.count >= 30) tagline = 'Disciplined';
  else if (streak.count >= 7) tagline = 'Consistent';
  else if (completed.length > 0) tagline = 'Initiator';

  // Populate hero
  const profileNameEl = document.getElementById('profile-name');
  const profileTaglineEl = document.getElementById('profile-tagline');
  if (profileNameEl) profileNameEl.textContent = profile.name;
  if (profileTaglineEl) profileTaglineEl.textContent = tagline;
  
  const avatarImg = document.getElementById('profile-avatar-img');
  const avatarFallback = document.getElementById('profile-avatar-fallback');
  if (avatarImg && avatarFallback) {
    if (profile.image) {
      avatarImg.src = profile.image;
      avatarImg.style.display = 'block';
      avatarFallback.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      avatarFallback.style.display = 'block';
    }
  }

  // Member since (earliest createdAt)
  const dates = tasks.map(t => t.createdAt).filter(Boolean).sort();
  const joinedDateEl = document.getElementById('profile-joined-date');
  if (dates.length > 0 && joinedDateEl) {
    const d = new Date(dates[0]);
    joinedDateEl.textContent = `Member since ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }

  // Stats cards
  const elTotal = document.getElementById('pstat-total-tasks');
  const elCompleted = document.getElementById('pstat-completed');
  const elRate = document.getElementById('pstat-completion-rate');
  const elStreak = document.getElementById('pstat-streak');
  const elBestStreak = document.getElementById('pstat-best-streak');

  if (elTotal) elTotal.textContent = total;
  if (elCompleted) elCompleted.textContent = completed.length;
  if (elRate) elRate.textContent = `${rate}%`;
  if (elStreak) elStreak.textContent = streak.count;
  if (elBestStreak) elBestStreak.textContent = bestStreak;

  // Badge showcase
  const badgeContainer = document.getElementById('profile-badge-showcase');
  if (badgeContainer) {
    badgeContainer.innerHTML = '';
    const count = streak.count;

    STREAK_BADGES.forEach((badge, idx) => {
      const earned = count >= badge.days;
      const isNext = !earned && (idx === 0 || count >= STREAK_BADGES[idx - 1].days);

      const remaining = badge.days - count;
      let statusText = '';
      let statusClass = '';
      if (earned) {
        statusText = '✓ Earned';
        statusClass = 'earned';
      } else if (isNext) {
        statusText = `${remaining} day${remaining !== 1 ? 's' : ''} to go`;
        statusClass = 'next';
      } else {
        statusText = `${badge.days} days`;
        statusClass = 'locked';
      }

      const el = document.createElement('div');
      el.className = `profile-badge-item ${statusClass}`;
      el.innerHTML = `
        <span class="badge-emoji">${badge.emoji}</span>
        <span class="badge-name">${badge.name}</span>
        <span class="badge-days">${badge.days} day streak</span>
        <span class="badge-status">${statusText}</span>
      `;
      badgeContainer.appendChild(el);
    });
  }

  // Horizon breakdown
  const breakdownContainer = document.getElementById('profile-horizon-breakdown');
  if (breakdownContainer) {
    breakdownContainer.innerHTML = '';
    TIERS.forEach(tier => {
      const tierTasks = tasks.filter(t => t.tier === tier.id);
      const tierDone = tierTasks.filter(t => t.completed).length;
      const tierTotal = tierTasks.length;
      const pct = tierTotal > 0 ? Math.round((tierDone / tierTotal) * 100) : 0;

      const row = document.createElement('div');
      row.className = 'profile-horizon-row';
      row.innerHTML = `
        <span class="profile-horizon-label">${tier.emoji} ${tier.name}</span>
        <div class="profile-horizon-bar-track">
          <div class="profile-horizon-bar-fill" style="width: ${pct}%; background: ${tier.color};"></div>
        </div>
        <span class="profile-horizon-pct">${tierDone}/${tierTotal} (${pct}%)</span>
      `;
      breakdownContainer.appendChild(row);
    });
  }

  // Recent activity (completed tasks, sorted by completedAt)
  const activityContainer = document.getElementById('profile-activity-list');
  if (activityContainer) {
    activityContainer.innerHTML = '';

    const recentCompleted = tasks
      .filter(t => t.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 15);

    if (recentCompleted.length === 0) {
      activityContainer.innerHTML = '<div class="profile-empty-activity">No completed tasks yet. Start checking off your goals!</div>';
    } else {
      recentCompleted.forEach(task => {
        const tier = TIERS.find(t => t.id === task.tier);
        const when = new Date(task.completedAt);
        const timeAgo = getTimeAgo(when);

        const item = document.createElement('div');
        item.className = 'profile-activity-item';
        item.innerHTML = `
          <div class="profile-activity-icon completed">✅</div>
          <div class="profile-activity-text">
            <span>${escapeHTML(task.title)}</span>
            <span style="color:var(--text-muted); font-size:0.75rem; margin-left:6px;">${tier ? tier.emoji : ''}</span>
          </div>
          <div class="profile-activity-time">${timeAgo}</div>
        `;
        activityContainer.appendChild(item);
      });
    }
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

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
