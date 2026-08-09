// app.js - Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI components
  window.UI.init();
  
  // Initialize Charts
  window.Charts.init();

  // Tab Navigation Logic
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');

      // Hide all views
      views.forEach(view => view.classList.remove('active'));
      
      // Show corresponding view
      const targetViewId = item.getAttribute('data-target');
      const targetView = document.getElementById(targetViewId);
      if (targetView) {
        targetView.classList.add('active');
        
        // Handle chart rendering for analytics tab
        if (targetViewId === 'view-analytics' && window.Charts) {
          window.Charts.renderAnalyticsCharts();
        }
      }
    });
  });

  // Modal Logic
  const modal = document.getElementById('modal-add-transaction');
  const btnAdd = document.getElementById('btn-add-transaction');
  const closeBtns = document.querySelectorAll('.close-btn, .close-modal-btn');
  const form = document.getElementById('form-add-transaction');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('active');
      form.reset();
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const type = document.getElementById('tx-type').value;
      const amount = parseFloat(document.getElementById('tx-amount').value);
      const category = document.getElementById('tx-category').value;
      const recipientName = document.getElementById('tx-name').value;
      const date = document.getElementById('tx-date').value;

      const newTx = { type, amount, category, recipientName, date };
      
      window.DataStore.addTransaction(newTx);
      window.UI.refreshAll();
      
      modal.classList.remove('active');
      form.reset();
    });
  }

  // Add Card Modal Logic
  const modalAddCard = document.getElementById('modal-add-card');
  const btnAddCard = document.getElementById('btn-add-card');
  const formAddCard = document.getElementById('form-add-card');

  if (btnAddCard && modalAddCard) {
    btnAddCard.addEventListener('click', () => modalAddCard.classList.add('active'));
  }

  if (formAddCard) {
    formAddCard.addEventListener('submit', (e) => {
      e.preventDefault();
      const cardType = document.getElementById('card-type').value;
      const cardNumber = document.getElementById('card-number').value;
      const cardholderName = document.getElementById('card-holder').value;
      const expiryDate = document.getElementById('card-expiry').value;

      window.DataStore.addCard({ cardType, cardNumber, cardholderName, expiryDate });
      window.UI.refreshAll();
      
      modalAddCard.classList.remove('active');
      formAddCard.reset();
    });
  }

  // Add Goal Modal Logic
  const modalAddGoal = document.getElementById('modal-add-goal');
  const btnAddGoal = document.getElementById('btn-add-goal');
  const formAddGoal = document.getElementById('form-add-goal');

  if (btnAddGoal && modalAddGoal) {
    btnAddGoal.addEventListener('click', () => modalAddGoal.classList.add('active'));
  }

  if (formAddGoal) {
    formAddGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('goal-name').value;
      const targetAmount = parseFloat(document.getElementById('goal-target').value);
      const currentAmount = parseFloat(document.getElementById('goal-current').value);
      const targetDate = document.getElementById('goal-date').value;

      window.DataStore.addGoal({ name, targetAmount, currentAmount, targetDate });
      window.UI.refreshAll();
      
      modalAddGoal.classList.remove('active');
      formAddGoal.reset();
    });
  }
});
