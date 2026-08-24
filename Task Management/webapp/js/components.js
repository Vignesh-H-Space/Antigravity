/**
 * Tesseract Shared Layout Components
 * Injects sidebar, header, modal, and toast container into pages
 */

const Components = {
  /**
   * Returns current page name (e.g., 'index', 'cascade', 'analytics', 'profile')
   */
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1).replace('.html', '').toLowerCase();
    if (!page || page === '' || page === 'index') return 'index';
    return page;
  },

  /**
   * Render Sidebar into an element with id="sidebar-mount" or prepend to .app-layout
   */
  renderSidebar(activeHorizon = 'general') {
    const page = this.getCurrentPage();
    const isHome = page === 'index';
    const isCascade = page === 'cascade';
    const isAnalytics = page === 'analytics';
    const isRoadmap = page === 'roadmap';
    const isBucketlist = page === 'bucketlist';

    const sidebarHTML = `
    <aside class="sidebar">
      <div class="brand-container" style="cursor: pointer;" onclick="window.location.href='index.html'">
        <div class="brand-logo">
          <div class="brand-icon-mesh">
            <i data-lucide="box" class="brand-svg"></i>
          </div>
          <div>
            <h1 class="brand-title">TESSERACT</h1>
            <span class="brand-subtitle">Multi-Horizon Matrix</span>
          </div>
        </div>
      </div>

      <div class="sidebar-section-title">TIME HORIZONS</div>
      <nav class="nav-menu">
        <button class="nav-item ${isHome && activeHorizon === 'general' ? 'active' : ''}" data-horizon="general" id="tab-general">
          <i data-lucide="home"></i>
          <span>Home</span>
          <span class="badge" id="badge-general">0</span>
        </button>
        <button class="nav-item ${isHome && activeHorizon === 'daily' ? 'active' : ''}" data-horizon="daily" id="tab-daily">
          <span class="nav-emoji">🌅</span>
          <span>Daily Tasks</span>
          <span class="badge" id="badge-daily">0</span>
        </button>
        <button class="nav-item ${isHome && activeHorizon === 'weekly' ? 'active' : ''}" data-horizon="weekly" id="tab-weekly">
          <span class="nav-emoji">📅</span>
          <span>Weekly Milestones</span>
          <span class="badge" id="badge-weekly">0</span>
        </button>
        <button class="nav-item ${isHome && activeHorizon === 'monthly' ? 'active' : ''}" data-horizon="monthly" id="tab-monthly">
          <span class="nav-emoji">🗓️</span>
          <span>Monthly Goals</span>
          <span class="badge" id="badge-monthly">0</span>
        </button>
        <button class="nav-item ${isHome && activeHorizon === 'quarterly' ? 'active' : ''}" data-horizon="quarterly" id="tab-quarterly">
          <span class="nav-emoji">🎯</span>
          <span>Quarterly Goals</span>
          <span class="badge" id="badge-quarterly">0</span>
        </button>
        <button class="nav-item ${isHome && activeHorizon === 'annual' ? 'active' : ''}" data-horizon="annual" id="tab-annual">
          <span class="nav-emoji">🏆</span>
          <span>Annual Vision</span>
          <span class="badge" id="badge-annual">0</span>
        </button>
        <button class="nav-item ${isHome && activeHorizon === 'all' ? 'active' : ''}" data-horizon="all" id="tab-all">
          <i data-lucide="layers"></i>
          <span>All 5 Horizons</span>
          <span class="badge" id="badge-all">0</span>
        </button>
      </nav>

      <div class="sidebar-section-title">VIEWS & TOOLS</div>
      <nav class="nav-menu secondary">
        <button class="nav-item" id="btn-sidebar-focus" onclick="FocusEngine.open();" title="Start Focus Mode Session">
          <i data-lucide="zap"></i>
          <span>Focus Mode</span>
        </button>
        <button class="nav-item ${isCascade ? 'active' : ''}" id="btn-view-cascade" onclick="if(Components.getCurrentPage()!=='cascade') window.location.href='cascade.html';">
          <i data-lucide="git-merge"></i>
          <span>Goal Cascade Tree</span>
        </button>
        <button class="nav-item ${isRoadmap ? 'active' : ''}" id="btn-view-roadmap" onclick="if(Components.getCurrentPage()!=='roadmap') window.location.href='roadmap.html';">
          <i data-lucide="calendar-range"></i>
          <span>Roadmap Timeline</span>
        </button>
        <button class="nav-item ${isBucketlist ? 'active' : ''}" id="btn-view-bucketlist" onclick="if(Components.getCurrentPage()!=='bucketlist') window.location.href='bucketlist.html';">
          <i data-lucide="sparkles"></i>
          <span>Life's Bucket List</span>
        </button>
        <button class="nav-item ${isAnalytics ? 'active' : ''}" id="btn-view-analytics" onclick="if(Components.getCurrentPage()!=='analytics') window.location.href='analytics.html';">
          <i data-lucide="bar-chart-3"></i>
          <span>Productivity Metrics</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="streak-card" id="streak-card">
          <div class="streak-header">
            <span class="streak-icon" id="streak-emoji">🔥</span>
            <div>
              <div class="streak-title">Daily Streak</div>
              <div class="streak-value" id="streak-counter">0 Days</div>
            </div>
          </div>
          <div class="streak-progress-bar">
            <div class="streak-fill" id="streak-fill" style="width: 0%"></div>
          </div>
          <div class="streak-badge-label" id="streak-badge-label">Next: 🏅 1 Week</div>
          <div class="streak-badges" id="streak-badges">
            <!-- Injected by JS -->
          </div>
        </div>

        <div class="user-controls">
          <button class="icon-btn" id="theme-toggle" title="Toggle Theme" aria-label="Toggle Theme">
            <i data-lucide="sun" class="sun-icon"></i>
            <i data-lucide="moon" class="moon-icon"></i>
          </button>
          <button class="icon-btn" id="btn-export-json" title="Export JSON Data" aria-label="Export Data">
            <i data-lucide="download"></i>
          </button>
          <button class="icon-btn" id="btn-import-trigger" title="Import JSON Data" aria-label="Import Data">
            <i data-lucide="upload"></i>
          </button>
          <input type="file" id="import-file-input" accept=".json" style="display:none;">
          <button class="icon-btn" id="btn-reset-data" title="Reset to Sample Data" aria-label="Reset Data">
            <i data-lucide="rotate-ccw"></i>
          </button>
        </div>
      </div>
    </aside>
    `;

    const mount = document.getElementById('sidebar-mount');
    if (mount) {
      mount.outerHTML = sidebarHTML;
    } else {
      const layout = document.querySelector('.app-layout');
      if (layout) layout.insertAdjacentHTML('afterbegin', sidebarHTML);
    }
  },

  /**
   * Render Top Header into #header-mount or main-content
   */
  renderHeader({ title = 'All Goals & Tasks', subtitle = 'Holistic overview across all 5 strategic horizons.', showSearch = true } = {}) {
    const headerHTML = `
    <header class="top-header">
      <div class="header-left">
        <h2 class="view-title" id="current-view-heading">${title}</h2>
        <p class="view-subtitle" id="current-view-desc">${subtitle}</p>
      </div>
      <div class="header-right">
        ${showSearch ? `
        <div class="search-box">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="search-input" placeholder="Search tasks, tags, categories... (Press /)" />
          <button class="clear-search" id="clear-search" style="display:none;">&times;</button>
        </div>
        ` : ''}
        
        <!-- Live Header XP & Rank Widget -->
        <div class="header-xp-pill" id="header-xp-pill" onclick="window.location.href='profile.html'" title="View Level, Badges & XP Profile">
          <span class="header-level-tag" id="header-level-badge">Lvl 1</span>
          <span class="header-xp-number" id="header-xp-val">120 XP</span>
          <span class="header-multiplier-tag" id="header-multiplier-badge" style="display:none;">1.2x 🔥</span>
        </div>

        <button class="btn btn-secondary" id="btn-header-focus" title="Open Focus Mode">
          <i data-lucide="zap"></i>
          <span>Focus Mode</span>
        </button>
        <button class="btn btn-primary" id="btn-open-add-modal">
          <i data-lucide="plus"></i>
          <span>Add Goal / Task</span>
        </button>
        <button class="profile-avatar-btn" id="btn-profile" title="Your Profile" onclick="window.location.href='profile.html'">
          <img id="header-avatar-img" src="" alt="" style="display:none; width:100%; height:100%; object-fit:cover; border-radius:50%;">
          <i data-lucide="user" class="profile-avatar-icon" id="header-avatar-fallback"></i>
        </button>
      </div>
    </header>
    `;

    const mount = document.getElementById('header-mount');
    if (mount) {
      mount.outerHTML = headerHTML;
    }
  },

  /**
   * Render Task Modal, Focus Overlay, and Toast Container at the bottom of the body
   */
  renderModalAndToasts() {
    const extraHTML = `
    <!-- Add / Edit Task Modal -->
    <div class="modal-backdrop" id="task-modal" style="display: none;">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title-text">Create Goal / Task</h3>
          <button class="modal-close-btn" id="modal-close-btn">&times;</button>
        </div>

        <form id="task-form">
          <input type="hidden" id="task-id-input" value="">

          <div class="form-group">
            <label for="form-tier">Time Horizon / Tier <span class="req">*</span></label>
            <select id="form-tier" class="form-control" required>
              <option value="daily">🌅 Daily Task (Today's To-Do)</option>
              <option value="weekly">📅 Weekly Milestone (This Week)</option>
              <option value="monthly">🗓️ Monthly Goal (This Month)</option>
              <option value="quarterly">🎯 Quarterly Goal (90-Day Objective)</option>
              <option value="annual">🏆 Annual Vision (Yearly Goal)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="form-title">Goal / Task Title <span class="req">*</span></label>
            <input type="text" id="form-title" class="form-control" placeholder="e.g., Ship high-throughput orchestrator" required autocomplete="off">
          </div>

          <div class="form-group">
            <label for="form-desc">Description / Success Criteria</label>
            <textarea id="form-desc" class="form-control" rows="3" placeholder="Key deliverables, quantitative metrics, or notes..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label for="form-priority">Priority</label>
              <select id="form-priority" class="form-control">
                <option value="low">🟢 Low</option>
                <option value="medium" selected>🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>

            <div class="form-group col">
              <label for="form-category">Category</label>
              <select id="form-category" class="form-control">
                <option value="Product">Product</option>
                <option value="Engineering">Engineering</option>
                <option value="Career">Career</option>
                <option value="Finance">Finance</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col">
              <label for="form-due">Due Date</label>
              <input type="date" id="form-due" class="form-control">
            </div>

            <div class="form-group col">
              <label for="form-parent">Cascade Parent (Link Upward)</label>
              <select id="form-parent" class="form-control">
                <option value="">None (Independent Goal)</option>
                <!-- Injected dynamically -->
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="form-tags">Tags (Comma-separated)</label>
            <input type="text" id="form-tags" class="form-control" placeholder="e.g. backend, q3, sprint">
          </div>

          <!-- Sub-Tasks / Milestones Checklist Builder -->
          <div class="form-group modal-subtasks-group">
            <label>Sub-Tasks & Milestones Checklist</label>
            <div class="modal-subtask-add-row">
              <input type="text" id="modal-subtask-input" class="form-control" placeholder="Add milestone step and press Enter...">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-add-modal-subtask">
                <i data-lucide="plus"></i> <span>Add Step</span>
              </button>
            </div>
            <div class="modal-subtasks-list" id="modal-subtasks-list">
              <!-- Dynamically populated -->
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="modal-save-btn">Save Goal</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Fullscreen Focus Mode Overlay (Zero Scrollbar / Single Screen Fit) -->
    <div class="focus-overlay" id="focus-mode-overlay" style="display: none;">
      <div class="focus-container">
        <!-- Top Toolbar with Goal Switcher -->
        <div class="focus-top-bar">
          <div class="focus-brand-pill">
            <i data-lucide="zap"></i>
            <span>FOCUS MODE</span>
          </div>
          <div class="focus-goal-picker">
            <label for="focus-task-select" class="focus-picker-label">Target:</label>
            <select id="focus-task-select" class="focus-task-select">
              <!-- Dynamically populated in JS -->
            </select>
          </div>
          <button class="focus-close-btn" id="focus-exit-btn" title="Exit Focus Mode (Esc)">&times;</button>
        </div>

        <!-- Active Task Spotlight Card -->
        <div class="focus-task-card" id="focus-task-card">
          <div class="focus-task-header-line">
            <span class="focus-task-tier" id="focus-task-tier">🌅 Daily Task</span>
          </div>
          <h2 class="focus-task-title" id="focus-task-title">Select a Goal to Execute</h2>
          <p class="focus-task-desc" id="focus-task-desc">Single-task execution. Zero distractions.</p>
          <div class="focus-subtasks-container" id="focus-subtasks-container" style="display:none;">
            <!-- Subtask checklist items in focus mode -->
          </div>
        </div>

        <!-- Circular Timer Ring -->
        <div class="focus-timer-wrapper">
          <svg class="focus-timer-svg" viewBox="0 0 240 240">
            <circle class="focus-ring-bg" cx="120" cy="120" r="105"></circle>
            <circle class="focus-ring-progress" id="focus-ring-progress" cx="120" cy="120" r="105"></circle>
          </svg>
          <div class="focus-time-display">
            <span class="focus-time-digits" id="focus-time-digits">25:00</span>
            <span class="focus-time-status" id="focus-time-status">READY</span>
          </div>
        </div>

        <!-- Timer Presets & Custom Duration -->
        <div class="focus-presets">
          <button class="focus-preset-chip" data-minutes="15">15m</button>
          <button class="focus-preset-chip active" data-minutes="25">25m</button>
          <button class="focus-preset-chip" data-minutes="45">45m</button>
          <button class="focus-preset-chip" data-minutes="60">60m</button>
          <button class="focus-preset-chip" data-minutes="90">90m</button>
          <button class="focus-preset-chip focus-custom-chip" id="focus-btn-custom-duration" title="Set exact custom minutes">
            <i data-lucide="sliders-horizontal"></i>
            <span>Custom...</span>
          </button>
        </div>

        <!-- Control Actions with -5m, Reset, Play/Pause, +5m -->
        <div class="focus-controls">
          <button class="btn btn-ghost btn-sm focus-adjust-btn" id="focus-btn-minus5" title="Subtract 5 Minutes (-5m)">
            <span>-5m</span>
          </button>
          <button class="btn btn-secondary btn-sm" id="focus-btn-reset" title="Reset (R)">
            <i data-lucide="rotate-ccw"></i>
            <span>Reset</span>
          </button>
          <button class="btn btn-primary focus-main-action" id="focus-btn-toggle" title="Space to Start/Pause">
            <i data-lucide="play" id="focus-play-icon"></i>
            <span id="focus-toggle-text">Start Focus</span>
          </button>
          <button class="btn btn-ghost btn-sm focus-adjust-btn" id="focus-btn-plus5" title="Add 5 Minutes (+5m)">
            <span>+5m</span>
          </button>
        </div>

        <!-- Ambient Sound Controls (Moved Downwards) -->
        <div class="focus-sound-bar">
          <div class="focus-sound-label-group">
            <i data-lucide="headphones"></i>
            <span>Soundscape:</span>
          </div>
          <select id="focus-sound-select" class="focus-sound-select">
            <option value="rain">🌧️ Gentle Rain</option>
            <option value="waves">🌊 Ocean Waves</option>
            <option value="binaural">🧠 Alpha Frequency (10Hz)</option>
            <option value="mute">🔕 Silence / Mute</option>
          </select>
          <div class="focus-volume-group">
            <i data-lucide="volume-2"></i>
            <input type="range" id="focus-volume-slider" min="0" max="1" step="0.05" value="0.5" class="focus-volume-slider" title="Soundscape Volume">
          </div>
        </div>

        <!-- Bottom Action: Mark Task Done & Shortcuts -->
        <div class="focus-bottom-action">
          <button class="btn btn-secondary btn-sm" id="focus-btn-complete-task">
            <i data-lucide="check-circle-2"></i>
            <span id="focus-complete-btn-text">Mark Goal Complete</span>
          </button>
          <span class="focus-shortcut-hint">Shortcuts: <b>Space</b> (play/pause) • <b>R</b> (reset) • <b>Esc</b> (exit)</span>
        </div>
      </div>
    </div>

    <!-- Rank Up Celebration Ceremony Modal -->
    <div class="modal-backdrop" id="rank-up-modal" style="display: none;">
      <div class="rank-up-card">
        <div class="rank-up-sparkle">👑</div>
        <span class="rank-up-super-label">EXECUTIVE LEVEL UP</span>
        <div class="rank-up-badge-container">
          <span class="rank-up-badge-old" id="rank-up-old-level">Lvl 1</span>
          <i data-lucide="arrow-right" class="rank-up-arrow"></i>
          <span class="rank-up-badge-new" id="rank-up-new-level">Lvl 2</span>
        </div>
        <h2 class="rank-up-title" id="rank-up-title">🎯 Operator</h2>
        <p class="rank-up-message">Your high-leverage execution velocity has unlocked an elite executive status.</p>
        <button class="btn btn-primary rank-up-btn" onclick="XPEngine.closeRankUpModal();">
          <span>Continue Execution</span>
          <i data-lucide="zap"></i>
        </button>
      </div>
    </div>

    <!-- 🌅 Morning Priming Modal (The Rule of 3) -->
    <div class="modal-backdrop" id="morning-priming-modal" style="display: none;">
      <div class="ritual-modal-card">
        <div class="ritual-modal-header">
          <div class="ritual-header-icon">🌅</div>
          <div>
            <h3 class="ritual-modal-title">Morning Priming: The Rule of 3</h3>
            <p class="ritual-modal-sub">Pick your Top 3 Non-Negotiable Wins for today to lock in your focus.</p>
          </div>
          <button class="modal-close-btn" onclick="RitualsEngine.closeModals();">&times;</button>
        </div>
        <div class="ritual-modal-body">
          <div class="ritual-tasks-picker-list" id="morning-tasks-picker-list">
            <!-- Injected by RitualsEngine.openMorningModal() -->
          </div>
        </div>
        <div class="ritual-modal-footer">
          <button type="button" class="btn btn-secondary" onclick="RitualsEngine.closeModals();">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="RitualsEngine.saveMorningWins();">
            <i data-lucide="lock"></i>
            <span>Lock in Top 3 Wins (+20 XP)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 🌙 Evening Shutdown Protocol Modal -->
    <div class="modal-backdrop" id="evening-shutdown-modal" style="display: none;">
      <div class="ritual-modal-card evening-modal">
        <div class="ritual-modal-header">
          <div class="ritual-header-icon">🌙</div>
          <div>
            <h3 class="ritual-modal-title">Evening Shutdown & Mind Sweep</h3>
            <p class="ritual-modal-sub">Debrief your day, record insights, and roll over unfinished tasks with zero guilt.</p>
          </div>
          <button class="modal-close-btn" onclick="RitualsEngine.closeModals();">&times;</button>
        </div>
        <div class="ritual-modal-body">
          <!-- Today's Execution Recap -->
          <div class="evening-recap-grid">
            <div class="recap-box">
              <span class="recap-val" id="evening-metric-tasks">0 Done</span>
              <span class="recap-lbl">Goals Cleared</span>
            </div>
            <div class="recap-box">
              <span class="recap-val" id="evening-metric-focus">0h</span>
              <span class="recap-lbl">Deep Work Hours</span>
            </div>
            <div class="recap-box accent">
              <span class="recap-val" id="evening-metric-xp">0 XP</span>
              <span class="recap-lbl">Total XP</span>
            </div>
          </div>

          <!-- 1-Sentence Executive Reflection -->
          <div class="evening-section">
            <label class="evening-label">📝 1-Sentence Executive Reflection / Key Takeaway</label>
            <textarea id="evening-reflection-text" class="form-control" rows="2" placeholder="What went well today? What is the single biggest win or learning?"></textarea>
          </div>

          <!-- Mind Sweep & Rollover -->
          <div class="evening-section">
            <label class="evening-label">🔄 Mind Sweep (Uncompleted Daily Tasks)</label>
            <div class="evening-rollover-list" id="evening-rollover-list">
              <!-- Injected by JS -->
            </div>
          </div>
        </div>
        <div class="ritual-modal-footer">
          <button type="button" class="btn btn-secondary" onclick="RitualsEngine.closeModals();">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="RitualsEngine.completeEveningShutdown();">
            <i data-lucide="check-circle"></i>
            <span>Complete Daily Shutdown (+50 XP)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Floating XP Burst Animation Container -->
    <div class="xp-burst-container" id="xp-burst-container"></div>

    <!-- Toast Notification Container -->
    <div class="toast-container" id="toast-container"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', extraHTML);
  }
};
