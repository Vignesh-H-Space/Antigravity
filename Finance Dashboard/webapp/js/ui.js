// ui.js - User Interface Rendering

const UI = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  },

  formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  },

  renderMetrics() {
    const metrics = window.DataStore.getMetrics();
    
    document.getElementById('metric-balance').innerText = this.formatCurrency(metrics.totalBalance);
    document.getElementById('metric-income').innerText = this.formatCurrency(metrics.totalIncome);
    document.getElementById('metric-expense').innerText = this.formatCurrency(metrics.totalExpense);
    document.getElementById('metric-savings').innerText = this.formatCurrency(metrics.totalSavings);
  },

  renderTransactionsTable() {
    // Render dashboard recent transactions (5 items)
    const dashboardTbody = document.getElementById('transactions-body');
    const fullTbody = document.getElementById('full-transactions-body');
    const allTransactions = window.DataStore.getTransactions();

    if (dashboardTbody) {
      const recent = allTransactions.slice(0, 5);
      dashboardTbody.innerHTML = '';
      recent.forEach(t => dashboardTbody.appendChild(this.createTransactionRow(t)));
    }

    // Render full transactions list in Transactions Tab
    if (fullTbody) {
      fullTbody.innerHTML = '';
      allTransactions.forEach(t => fullTbody.appendChild(this.createTransactionRow(t, true)));
      const txCount = document.getElementById('report-tx-count');
      if (txCount) txCount.innerText = allTransactions.length;
    }
  },

  createTransactionRow(t, isFull = false) {
    const isIncome = t.type === 'income';
    const tr = document.createElement('tr');
    
    let actionsHtml = '';
    if (isFull) {
      actionsHtml = `<td><button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;">Edit</button></td>`;
    }

    tr.innerHTML = `
      <td><strong>${t.recipientName}</strong></td>
      <td>${t.id}</td>
      ${isFull ? `<td>${t.category}</td>` : ''}
      <td><span class="status-badge status-${t.status}">${t.status}</span></td>
      <td>${this.formatDate(t.date)}</td>
      <td class="${isIncome ? 'amt-positive' : 'amt-negative'}">
        ${isIncome ? '+' : '-'}${this.formatCurrency(t.amount)}
      </td>
      ${actionsHtml}
    `;
    return tr;
  },

  renderCardsWidget() {
    const containerDashboard = document.getElementById('cards-widget-container');
    const containerWallet = document.getElementById('wallet-cards-container');
    
    const cards = window.DataStore.getCards();
    
    if (containerDashboard) {
      containerDashboard.innerHTML = '';
      cards.forEach(c => containerDashboard.appendChild(this.createCardElement(c)));
    }

    if (containerWallet) {
      containerWallet.innerHTML = '';
      cards.forEach(c => containerWallet.appendChild(this.createCardElement(c)));
    }
  },

  createCardElement(c) {
    const cardEl = document.createElement('div');
    cardEl.className = 'payment-card';
    cardEl.innerHTML = `
      <div class="card-network">${c.cardType}</div>
      <div class="card-number">${c.cardNumber}</div>
      <div class="card-details">
        <span>${c.cardholderName}</span>
        <span>${c.expiryDate}</span>
      </div>
    `;
    return cardEl;
  },
  
  renderGoals() {
    const container = document.getElementById('goals-container');
    if (!container) return;
    
    const goals = window.DataStore.getGoals();
    container.innerHTML = '';
    
    if (goals.length === 0) {
      container.innerHTML = '<p>No goals set yet. Add one to start tracking!</p>';
      return;
    }

    goals.forEach(g => {
      const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100).toFixed(1);
      const goalEl = document.createElement('div');
      goalEl.className = 'card';
      goalEl.innerHTML = `
        <div class="card-header">
          <h3>${g.name}</h3>
          <span style="font-weight: 600;">${percent}%</span>
        </div>
        <div class="progress-info">
          <span class="caption">${this.formatCurrency(g.currentAmount)} of ${this.formatCurrency(g.targetAmount)} Saved</span>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${percent}%;"></div>
          </div>
        </div>
        <div style="margin-top: 12px; font-size: 0.75rem; color: var(--jm-dark-gray);">
          Target Date: ${g.targetDate}
        </div>
      `;
      container.appendChild(goalEl);
    });
  },

  renderSpendingLimitWidget() {
    const user = window.DataStore.getUser();
    const metrics = window.DataStore.getMetrics();
    const spent = metrics.totalExpense;
    const limit = user.monthlySpendingLimit;
    const percent = Math.min((spent / limit) * 100, 100);
    
    const limitLabel = document.getElementById('spending-limit-label');
    const limitBar = document.getElementById('spending-limit-bar');
    
    if (limitLabel && limitBar) {
      limitLabel.innerText = `${this.formatCurrency(spent)} of ${this.formatCurrency(limit)} Spent`;
      limitBar.style.width = `${percent}%`;
      if (percent >= 90) {
        limitBar.style.backgroundColor = '#C62828'; // Warning color if near limit
      }
    }
  },

  init() {
    this.refreshAll();
  },

  refreshAll() {
    this.renderMetrics();
    this.renderTransactionsTable();
    this.renderCardsWidget();
    this.renderGoals();
    this.renderSpendingLimitWidget();
    if (window.Charts) {
      window.Charts.init(); // re-render charts to pick up new budget/income
    }
  }
};

window.UI = UI;
