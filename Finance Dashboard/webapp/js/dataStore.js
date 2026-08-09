// dataStore.js - Local Storage Management & Mock Data

const STORE_KEY = 'jm_finance_data';

const initialMockData = {
  user: {
    name: "Jane Doe",
    monthlySpendingLimit: 5000
  },
  transactions: [
    { id: "TX1001", type: "income", amount: 8500, category: "Salary", recipientName: "JM Solutionss Inc.", status: "completed", date: new Date().toISOString() },
    { id: "TX1002", type: "expense", amount: 1200, category: "Food & Grocery", recipientName: "Whole Foods", status: "completed", date: new Date(Date.now() - 86400000).toISOString() },
    { id: "TX1003", type: "expense", amount: 150, category: "Entertainment", recipientName: "Netflix", status: "completed", date: new Date(Date.now() - 172800000).toISOString() },
    { id: "TX1004", type: "expense", amount: 2500, category: "Investment", recipientName: "Vanguard", status: "completed", date: new Date(Date.now() - 259200000).toISOString() }
  ],
  cards: [
    { id: "C1", cardNumber: "**** **** **** 4242", cardholderName: "Jane Doe", expiryDate: "12/26", cardType: "VISA" }
  ],
  goals: [],
  budgets: [
    { id: "B1", category: "Food & Grocery", allocatedAmount: 1500, spentAmount: 1200 },
    { id: "B2", category: "Entertainment", allocatedAmount: 500, spentAmount: 150 },
    { id: "B3", category: "Investment", allocatedAmount: 3000, spentAmount: 2500 }
  ]
};

class DataStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    const rawData = localStorage.getItem(STORE_KEY);
    if (!rawData) {
      this.saveData(initialMockData);
      return initialMockData;
    }
    return JSON.parse(rawData);
  }

  saveData(data = this.data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }

  getMetrics() {
    const currentMonth = new Date().getMonth();
    let totalIncome = 0;
    let totalExpense = 0;

    this.data.transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth) {
        if (t.type === 'income') totalIncome += t.amount;
        if (t.type === 'expense') totalExpense += t.amount;
      }
    });

    const totalBalance = totalIncome - totalExpense; // Simplified for MVP
    const totalSavings = totalIncome - totalExpense; // Same as balance for MVP logic if we consider month net savings

    return { totalBalance, totalIncome, totalExpense, totalSavings };
  }

  getTransactions() {
    return this.data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getCards() {
    return this.data.cards;
  }
  
  getBudgets() {
    return this.data.budgets;
  }
  
  getUser() {
    return this.data.user;
  }

  addTransaction(transaction) {
    transaction.id = 'TX' + Math.floor(Math.random() * 100000).toString();
    transaction.status = 'completed';
    this.data.transactions.unshift(transaction);
    this.saveData();
    
    if (transaction.type === 'expense') {
      const budget = this.data.budgets.find(b => b.category === transaction.category);
      if (budget) {
        budget.spentAmount += transaction.amount;
        this.saveData();
      }
    }
  }

  addCard(card) {
    card.id = 'C' + Math.floor(Math.random() * 100000).toString();
    this.data.cards.push(card);
    this.saveData();
  }

  getGoals() {
    return this.data.goals;
  }

  addGoal(goal) {
    goal.id = 'G' + Math.floor(Math.random() * 100000).toString();
    this.data.goals.push(goal);
    this.saveData();
  }
}

window.DataStore = new DataStore();
