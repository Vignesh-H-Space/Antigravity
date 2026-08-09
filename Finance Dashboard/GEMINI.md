# System Instructions: Personal Finance Dashboard

## Project Overview

Build a **personal finance dashboard** for tracking income, expenses, savings, and budget. The app allows users to monitor their financial health, view transaction history, manage cards, and track spending against budget limits.

---

## Navigation Structure

### Top Navigation Tabs
- Dashboard (home/default view)
- Transactions
- Wallet
- Goals
- Analytics
- Reports

### Header Elements
- Dark/Light mode toggle
- Settings
- Search
- Notifications
- User profile with name and avatar

---

## Dashboard Page

### Key Metrics Section (4 Cards)

**Card 1: Total Balance**
- Display current total balance
- Show percentage change from last month
- Indicate if change is positive or negative

**Card 2: Income**
- Display total income for current month
- Show percentage change from last month

**Card 3: Expense**
- Display total expenses for current month
- Show percentage change from last month

**Card 4: Total Savings**
- Display total savings (income minus expenses)
- Show percentage change from last month

### Total Income Chart
- Bar chart showing monthly income
- Time period selector (dropdown): This month, Last 3 months, Last 6 months, This year
- Split data into two categories: Fixed income and Variable income
- Display months on X-axis (Jan - Dec)
- Display amounts on Y-axis
- Include legend for Fixed vs Variable

### Budget Chart
- Donut/pie chart showing budget allocation and spending
- Display total budget amount in center
- Display amount spent in center
- Break down by categories:
  - Investment
  - Travelling
  - Food & Grocery
  - Entertainment
  - Healthcare
- Time period selector: This month, Last month, This year
- Include legend with category names

### Recent Transactions Table
- Filter dropdown: This week, This month, All
- "See all" link to full transactions page
- Table columns:
  - Name (with avatar showing initials)
  - Transaction ID
  - Status (Completed, Pending, Failed)
  - Date and time
  - Amount (positive or negative)
- Show 5-10 most recent transactions

### Spending Limits Widget
- Display monthly payment/spending limit
- Show current amount spent
- Show limit amount
- Progress bar indicating usage percentage

### My Cards Widget
- Display saved payment cards
- "Add card" button
- Card preview showing:
  - Card network logo (Visa, Mastercard, etc.)
  - Masked card number (show last 4 digits)
  - Cardholder name
  - Expiry date
  - Contactless payment indicator

---

## Transactions Page

### Features
- Full list of all transactions
- Search by name, ID, or notes
- Filter by:
  - Transaction type (Income / Expense / All)
  - Category
  - Status (Completed / Pending / Failed)
  - Date range (custom date picker)
- Sort by: Date, Amount, Name
- Pagination or infinite scroll

### Transaction List Display
- Avatar with initials
- Recipient/source name
- Transaction ID
- Category
- Status badge
- Date and time
- Amount (show + for income, - for expense)

### Add Transaction
- Button to add new transaction
- Form fields:
  - Type: Income or Expense
  - Amount
  - Category (dropdown)
  - Recipient/Source name
  - Date (default to today)
  - Notes (optional)
- Save and Cancel buttons

### Edit/Delete Transaction
- Edit existing transactions
- Delete with confirmation

---

## Wallet Page

### My Cards Section
- List all saved cards
- Add new card button
- Each card displays:
  - Card network (Visa, Mastercard, Amex)
  - Masked card number
  - Cardholder name
  - Expiry date
- Edit card details
- Delete card with confirmation

### Add Card Form
- Card number input
- Cardholder name
- Expiry date (MM/YY)
- Card nickname (optional)
- Save and Cancel buttons

---

## Goals Page

### Savings Goals
- List of financial goals
- Add new goal button

### Goal Details
- Goal name (e.g., "Emergency Fund", "Vacation", "New Car")
- Target amount
- Current amount saved
- Progress percentage
- Target date/deadline
- Contribution history

### Add/Edit Goal Form
- Goal name
- Target amount
- Target date
- Initial deposit (optional)
- Save and Cancel buttons

### Goal Actions
- Add money to goal
- Edit goal
- Delete goal
- Mark as complete

---

## Analytics Page

### Spending Trends
- Line chart showing spending over time
- Time period selector: Weekly, Monthly, Yearly
- Compare current period to previous period

### Category Breakdown
- Bar chart or pie chart showing spending by category
- Rank categories by amount spent
- Show percentage of total for each category

### Income vs Expenses
- Side-by-side or stacked bar chart
- Monthly comparison
- Show net savings per month

### Top Expenses
- List of highest individual expenses
- Filter by time period

---

## Reports Page

### Monthly Summary Report
- Select month and year
- Display:
  - Total income
  - Total expenses
  - Net savings
  - Top spending categories
  - Number of transactions

### Yearly Summary Report
- Select year
- Month-by-month breakdown
- Annual totals
- Year-over-year comparison

### Export Options
- Export to CSV
- Export to PDF
- Select date range for export

---

## Data Model

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "avatar": "string | null",
  "currency": "string (USD, EUR, etc.)",
  "monthlySpendingLimit": "number",
  "createdAt": "timestamp"
}
```

### Transaction
```json
{
  "id": "string",
  "type": "income | expense",
  "amount": "number",
  "category": "string",
  "recipientName": "string",
  "status": "completed | pending | failed",
  "date": "timestamp",
  "notes": "string | null",
  "createdAt": "timestamp"
}
```

### Category
```json
{
  "id": "string",
  "name": "string",
  "type": "income | expense | budget",
  "icon": "string"
}
```

### Card
```json
{
  "id": "string",
  "cardNumber": "string (masked, store only last 4)",
  "cardholderName": "string",
  "expiryDate": "string (MM/YY)",
  "cardType": "visa | mastercard | amex | other",
  "nickname": "string | null",
  "createdAt": "timestamp"
}
```

### Goal
```json
{
  "id": "string",
  "name": "string",
  "targetAmount": "number",
  "currentAmount": "number",
  "targetDate": "timestamp",
  "createdAt": "timestamp"
}
```

### Budget
```json
{
  "id": "string",
  "category": "string",
  "allocatedAmount": "number",
  "spentAmount": "number",
  "month": "string (YYYY-MM)"
}
```

---

## Default Categories

### Expense Categories
- Food & Grocery
- Transportation
- Entertainment
- Healthcare
- Shopping
- Bills & Utilities
- Travel
- Education
- Subscriptions
- Other

### Income Categories
- Salary
- Freelance
- Investments
- Rental Income
- Gifts
- Refunds
- Other

### Budget Categories
- Investment
- Travelling
- Food & Grocery
- Entertainment
- Healthcare

---

## Core Functionalities

### Transaction Management
- Create new income/expense transactions
- Edit existing transactions
- Delete transactions
- View transaction history with filters and search
- Categorize transactions

### Balance Calculation
- Automatically calculate total balance from all transactions
- Calculate monthly income (sum of income transactions)
- Calculate monthly expenses (sum of expense transactions)
- Calculate savings (income - expenses)
- Calculate percentage changes month-over-month

### Budget Tracking
- Set monthly spending limit
- Track spending against limit
- Allocate budget to categories
- Show remaining budget per category

### Card Management
- Add payment cards (display only, not functional payments)
- Edit card details
- Delete cards
- Display masked card numbers for security

### Goals Management
- Create savings goals
- Track progress toward goals
- Add contributions to goals
- Edit and delete goals

### Analytics & Reporting
- Generate spending breakdowns by category
- Show income vs expense trends
- Provide monthly and yearly summaries
- Export data to CSV or PDF

---

## Features for MVP

- Dashboard with key metrics (Balance, Income, Expense, Savings)
- Income bar chart (Fixed vs Variable)
- Budget donut chart by category
- Recent transactions table
- Spending limit tracker
- Card display widget
- Add/edit/delete transactions
- Transaction history with filters
- Basic analytics charts
- Local data storage

## Features to Exclude from MVP

- Bank account sync / Plaid integration
- Real payment processing
- Multi-user / shared accounts
- Notifications and reminders
- Receipt scanning / OCR
- Cloud sync and backup
- Currency conversion
- Investment portfolio tracking

---

## Technical Requirements

### Data Storage
- Persist all data locally (localStorage or IndexedDB)
- Data should survive browser refresh
- Structure data for potential future cloud migration

### Charts
- Interactive charts with tooltips
- Responsive sizing
- Time period filtering

### Forms
- Input validation on all forms
- Error messages for invalid inputs
- Confirmation dialogs for delete actions

### Performance
- Fast load times
- Smooth interactions
- Handle 1000+ transactions without lag

---

## Summary

Build a personal finance dashboard with the following core features: financial overview with key metrics, income and budget charts, transaction management, card display, spending limits, savings goals, and basic analytics. Focus on clean organization and intuitive functionality. All data stored locally.