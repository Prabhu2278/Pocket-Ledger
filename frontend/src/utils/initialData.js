export const INITIAL_TRANSACTIONS = [
  {
    id: 1,
    title: 'Grocery Supermarket',
    note: 'Weekly essentials and fresh vegetables',
    amount: 1420.0,
    category: 'Groceries',
    date: '2026-10-18',
    type: 'EXPENSE',
    wallet_id: 1,
  },
  {
    id: 2,
    title: 'Client Project Advance',
    note: 'Consulting milestone payout',
    amount: 35000.0,
    category: 'Salary',
    date: '2026-10-15',
    type: 'INCOME',
    wallet_id: 1,
  },
  {
    id: 3,
    title: 'Coffee and Snacks',
    note: 'Blue Tokai Roasters',
    amount: 320.0,
    category: 'Food',
    date: '2026-10-12',
    type: 'EXPENSE',
    wallet_id: 2,
  },
  {
    id: 4,
    title: 'Monthly Broadband',
    note: 'Fiber internet renewal',
    amount: 1180.0,
    category: 'Bills',
    date: '2026-10-05',
    type: 'EXPENSE',
    wallet_id: 1,
  },
]

export const INITIAL_WALLETS = [
  { id: 1, name: 'HDFC Bank', wallet_type: 'BANK', initial_balance: 45000.0, color: '#10b981' },
  { id: 2, name: 'Google Pay UPI', wallet_type: 'WALLET', initial_balance: 6400.0, color: '#3b82f6' },
  { id: 3, name: 'Emergency Cash', wallet_type: 'CASH', initial_balance: 5000.0, color: '#f59e0b' },
]
