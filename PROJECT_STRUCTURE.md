# Pocket Ledger — Enterprise Production Architecture

This project is built using a **Feature-Driven (Domain-Driven) Frontend Architecture** and a **Layered Service-Repository Backend Architecture**, following the industry standards of modern fintech web applications.

---

## 1. Directory Tree

```
expense-tracker/
├── docker-compose.yml              # Local container orchestration (Postgres, FastAPI, Vite)
├── .env.example                    # Reference environment configuration
├── README.md
│
├── backend/                        # FastAPI Application
│   ├── Dockerfile                  # Python 3.11 container definition
│   ├── requirements.txt            # Production dependencies
│   ├── main.py                     # Non-breaking root entrypoint (points to app.main:app)
│   ├── .env                        # Local database credentials
│   │
│   └── app/                        # Production Layered Package
│       ├── main.py                 # FastAPI application factory, CORS, lifespan & router mounting
│       │
│       ├── core/                   # Core Infrastructure & Settings
│       │   ├── config.py           # Settings singleton (Database URL, Port, CORS)
│       │   └── database.py         # SQLAlchemy Engine, SessionLocal, get_db, init_db
│       │
│       ├── models/                 # SQLAlchemy ORM Entities
│       │   ├── user.py             # User table & credentials
│       │   ├── wallet.py           # Wallet table (Accounts, Cards, Cash)
│       │   └── expense.py          # Expense / Transaction table (Incomes, Expenses, Transfers)
│       │
│       ├── schemas/                # Pydantic v2 Input/Output Contracts
│       │   ├── auth.py             # UserRegister, UserLogin, UserResponse
│       │   ├── wallet.py           # WalletCreate, WalletUpdate, WalletResponse
│       │   └── expense.py          # ExpenseCreate, ExpenseUpdate, ExpenseResponse
│       │
│       ├── services/               # Decoupled Pure Business Logic
│       │   ├── auth_service.py     # User registration & verification
│       │   ├── wallet_service.py   # Multi-wallet balance math & transfer management
│       │   ├── expense_service.py  # Ledger filtering, pagination, sorting & CRUD
│       │   └── csv_service.py      # Bank statement parser, categorization & export
│       │
│       └── api/                    # API Delivery Layer
│           └── v1/
│               ├── router.py       # Master v1 router aggregating all endpoints
│               └── endpoints/
│                   ├── auth.py     # /auth/register, /auth/login
│                   ├── wallets.py  # /wallets CRUD
│                   ├── expenses.py # /expenses CRUD, search, filter
│                   ├── csv_tools.py# /csv/preview, /csv/confirm, /csv/export
│                   └── health.py   # /health probe
│
└── frontend/                       # React (Vite) Application
    ├── Dockerfile                  # Multi-stage production build (Node -> Nginx)
    ├── nginx.conf                  # Nginx proxy & SPA router fallback
    ├── package.json
    ├── vite.config.js
    │
    └── src/
        ├── main.jsx                # React root entrypoint
        ├── App.jsx                 # Dynamic feature router & provider wrapper
        ├── App.css
        ├── index.css               # Glassmorphic tokens & dark theme
        ├── api/                    # Centralized API layer
        │   ├── apiClient.js        # Core fetch client wrapper
        │   ├── endpoints.js        # API endpoint definitions
        │   ├── authApi.js          # Authentication API
        │   ├── walletApi.js        # Wallets API
        │   ├── transactionApi.js   # Transactions / Expenses API
        │   ├── dashboardApi.js     # Dashboard Analytics API
        │   ├── budgetApi.js        # Budgets API
        │   ├── csvApi.js           # CSV Import & Export API
        │   └── index.js            # API barrel export
        │
        ├── components/             # Reusable UI, Layout, & Feature Components
        │   ├── layout/             # Application Shell
        │   │   ├── AppLayout.jsx
        │   │   ├── Sidebar/        # App navigation sidebar, Month selector & Budget meter
        │   │   └── Topbar/         # Header with User profile, Search, & + Add Transaction
        │   ├── ui/                 # Atomic Design System Controls
        │   │   ├── AppLogo/        # Emerald squircle brand icon ($)
        │   │   ├── Button/         # Glassmorphic button
        │   │   ├── Card/           # Base glassmorphic card container
        │   │   ├── Input/          # Standard form input
        │   │   ├── Modal/          # Accessible dialog overlay wrapper
        │   │   └── Toast/          # Global notification alerts
        │   ├── wallets/            # Wallet Feature Components
        │   │   ├── WalletBar.jsx
        │   │   ├── WalletBar.css
        │   │   └── components/     # WalletCard, CreateWalletModal, EditWalletModal, DeleteWalletModal
        │   ├── transactions/       # Transaction Modals & Form Components
        │   │   ├── ExpenseModal.jsx
        │   │   ├── ExpenseModal.css
        │   │   ├── DeleteConfirmModal.jsx
        │   │   ├── DeleteConfirmModal.css
        │   │   └── components/     # AmountField, CategorySelectorField, DateAndNoteFields, etc.
        │   ├── budget/             # Budget Modals & Meter Components
        │   │   ├── BudgetConfirmModal.jsx
        │   │   ├── BudgetConfirmModal.css
        │   │   └── components/     # CurrentBudgetCard, BudgetDiffPreview, BudgetQuickAdjustChips
        │   ├── csv/                # Bank Statement Import Modals
        │   │   ├── CsvImportModal.jsx
        │   │   ├── CsvImportModal.css
        │   │   └── components/     # CsvDropzone, CsvPreviewTable
        │   └── filters/            # Advanced Filter Drawer Component
        │       ├── FilterDrawer.jsx
        │       ├── FilterDrawer.css
        │       └── components/     # AmountRangeFilterGroup, CategoryFilterGroup, DateRangeFilterGroup
        │
        ├── pages/                  # APPLICATION ROUTE SCREENS (ONLY PAGES)
        │   ├── auth/               # Authentication Screen
        │   │   ├── AuthPage.jsx    # Top-level screen entrypoint
        │   │   ├── AuthGateway.jsx # Split-screen auth layout
        │   │   ├── AuthGateway.css
        │   │   └── components/     # AuthHero, LoginForm, RegisterForm, AuthBackground
        │   ├── dashboard/          # Analytics & Insights Screen
        │   │   ├── DashboardPage.jsx # Top-level screen entrypoint
        │   │   ├── Dashboard.jsx   # Grid assembly
        │   │   ├── Dashboard.css
        │   │   └── components/     # DashboardKpis, BudgetOverviewCard, WeeklySpendingChart, etc.
        │   └── transactions/       # Ledger Table Screen
        │       ├── TransactionsPage.jsx # Top-level screen entrypoint
        │       ├── Expenses.jsx    # Ledger table, type tabs, pagination
        │       ├── Expenses.css
        │       └── components/     # TransactionTable, TransactionTableRow, TransactionPagination, etc.
        │
        ├── context/                # Modular State Management
        │   ├── AppContext.jsx
        │   └── modules/
        │       ├── useAuthSlice.js
        │       ├── useWalletsSlice.js
        │       ├── useExpensesSlice.js
        │       ├── useTransactionForm.js
        │       ├── useBudgetSlice.js
        │       ├── useAnalyticsSlice.js
        │       ├── useCsvSlice.js
        │       ├── useFilterSlice.js
        │       ├── useThemeSlice.js
        │       └── useToastSlice.js
        │
        ├── services/               # API Integration Services
        │   ├── api.js
        │   ├── authService.js
        │   ├── walletService.js
        │   └── expenseService.js
        │
        └── utils/                  # Pure Utility Helpers
            ├── formatters.js       # Currency & date formatting
            ├── csvParser.js
            └── initialData.js
```
