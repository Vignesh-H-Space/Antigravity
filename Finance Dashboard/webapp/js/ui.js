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
    const tbody = document.getElementById('transactions-body');
    if (!tbody) return;
    
    const transactions = window.DataStore.getTransactions().slice(0, 5); // Recent 5
    tbody.innerHTML = '';

    transactions.forEach(t => {
      const isIncome = t.type === 'income';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${t.recipientName}</strong></td>
        <td>${t.id}</td>
        <td><span class="status-badge status-${t.status}">${t.status}</span></td>
        <td>${this.formatDate(t.date)}</td>
        <td class="${isIncome ? 'amt-positive' : 'amt-negative'}">
          ${isIncome ? '+' : '-'}${this.formatCurrency(t.amount)}
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  renderCardsWidget() {
    const container = document.getElementById('cards-widget-container');
    if (!container) return;

    const cards = window.DataStore.getCards();
    container.innerHTML = '';

    cards.forEach(c => {
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
      container.appendChild(cardEl);
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
    this.renderMetrics();
    this.renderTransactionsTable();
    this.renderCardsWidget();
    this.renderSpendingLimitWidget();
  }
};

window.UI = UI;
