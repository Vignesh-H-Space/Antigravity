// charts.js - Chart.js Integration

const Charts = {
  incomeChart: null,
  budgetChart: null,

  init() {
    this.renderIncomeChart();
    this.renderBudgetChart();
  },

  renderIncomeChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Mock Data for Income Chart
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Fixed Income',
          data: [5000, 5000, 5000, 5000, 5000, 5000],
          backgroundColor: '#2E3A8C', // JM Dark Blue
          borderRadius: 4
        },
        {
          label: 'Variable Income',
          data: [1200, 800, 1500, 400, 2100, 950],
          backgroundColor: '#4A5FD9', // JM Light Blue
          borderRadius: 4
        }
      ]
    };

    if (this.incomeChart) {
      this.incomeChart.destroy();
    }

    this.incomeChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, border: { display: false } }
        }
      }
    });
  },

  renderBudgetChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    
    // Get budgets from dataStore
    const budgets = window.DataStore.getBudgets();
    const labels = budgets.map(b => b.category);
    const dataValues = budgets.map(b => b.spentAmount);

    const data = {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: [
          '#2E3A8C', // JM Dark Blue
          '#4A5FD9', // JM Light Blue
          '#1A2254', // JM Navy
          '#4A4A4A', // Dark Gray
          '#F5F7FA'  // Light Gray
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    };

    if (this.budgetChart) {
      this.budgetChart.destroy();
    }

    this.budgetChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'right' }
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: function(chart) {
          const width = chart.width, height = chart.height, ctx = chart.ctx;
          ctx.restore();
          
          let totalSpent = dataValues.reduce((a, b) => a + b, 0);
          
          const fontSize = (height / 150).toFixed(2);
          ctx.font = "bold " + fontSize + "em Inter, sans-serif";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#1A1A1A";

          const text = "$" + totalSpent;
          const textX = Math.round((width - ctx.measureText(text).width) / 2);
          const textY = height / 2;

          ctx.fillText(text, textX, textY);
          
          ctx.font = "300 " + (fontSize * 0.4).toFixed(2) + "em Inter, sans-serif";
          ctx.fillStyle = "#4A4A4A";
          const subText = "Total Spent";
          const subTextX = Math.round((width - ctx.measureText(subText).width) / 2);
          ctx.fillText(subText, subTextX, textY + 20);
          
          ctx.save();
        }
      }]
    });
  },

  renderAnalyticsCharts() {
    const ctxTrends = document.getElementById('analyticsTrendsChart');
    const ctxCategory = document.getElementById('analyticsCategoryChart');
    
    if (ctxTrends) {
      new Chart(ctxTrends.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Spending',
            data: [1200, 1900, 800, 1500],
            borderColor: '#2E3A8C',
            backgroundColor: 'rgba(46, 58, 140, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    if (ctxCategory) {
      new Chart(ctxCategory.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Other'],
          datasets: [{
            label: 'Amount ($)',
            data: [800, 300, 200, 450, 150],
            backgroundColor: '#4A5FD9'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }
};

window.Charts = Charts;
