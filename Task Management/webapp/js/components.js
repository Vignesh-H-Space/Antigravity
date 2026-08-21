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
          <span>Quarterly OKRs</span>
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
        <button class="nav-item ${isCascade ? 'active' : ''}" id="btn-view-cascade" onclick="if(Components.getCurrentPage()!=='cascade') window.location.href='cascade.html';">
          <i data-lucide="git-merge"></i>
          <span>Goal Cascade Tree</span>
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
   * Render Task Modal and Toast Container at the bottom of the body
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
              <option value="quarterly">🎯 Quarterly OKR (90-Day Objective)</option>
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

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="modal-save-btn">Save Goal</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification Container -->
    <div class="toast-container" id="toast-container"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', extraHTML);
  }
};
