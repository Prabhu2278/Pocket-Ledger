# Pocket Ledger — Clean Production Architecture

Pocket Ledger is organized into a clean, decoupled **FastAPI Backend Architecture** and a **React + Vite Frontend Architecture** with centralized design tokens.

---

## Complete Project Directory Tree

```text
Pocket-Ledger/
├── .env.example                    # Reference environment configuration
├── .gitignore                      # Git ignored files & directories
├── docker-compose.yml              # Local container orchestration (PostgreSQL, FastAPI, Vite)
├── README.md                       # Project overview and setup instructions
├── PROJECT_STRUCTURE.md            # Clean project architecture and file map
├── reference_prototype.html        # Design reference prototype
├── start.bat                       # One-click Windows development startup script
│
├── docs/
│   └── ARCHITECTURE.md             # System architecture and design documentation
│
├── backend/
│   ├── .env                        # Local database credentials
│   ├── alembic.ini                 # Database migration configuration
│   ├── Dockerfile                  # Production container definition
│   ├── expenses.db                 # SQLite fallback database
│   ├── main.py                     # Non-breaking root entrypoint (points to app.main:app)
│   ├── pytest.ini                  # Pytest configuration
│   ├── requirements.txt            # Production dependencies (FastAPI, uvicorn, SQLAlchemy, bcrypt, PyJWT)
│   ├── requirements-dev.txt        # Development dependencies (pytest, httpx, black)
│   │
│   ├── alembic/                    # Alembic schema version history
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── app/                        # Production Layered Package
│   │   ├── __init__.py
│   │   ├── main.py                 # Canonical FastAPI application entrypoint, CORS & router mounting
│   │   ├── database.py             # Compatibility bridge re-exporting app.core.database
│   │   ├── security.py             # Compatibility bridge re-exporting app.core.security
│   │   ├── deps.py                 # Dependency injection (get_current_user, get_db)
│   │   ├── crud.py                 # Core database queries
│   │   │
│   │   ├── core/                   # Core Infrastructure & Configuration
│   │   │   ├── config.py           # Settings singleton (Database URL, Port, CORS)
│   │   │   ├── database.py         # Canonical SQLAlchemy Engine, SessionLocal, get_db
│   │   │   ├── security.py         # Canonical Bcrypt password hashing & JWT token handling
│   │   │   ├── exceptions.py       # Custom HTTP error classes
│   │   │   └── logging.py          # Structured application logger
│   │   │
│   │   ├── models/                 # SQLAlchemy ORM Entities (Declarative Base)
│   │   │   ├── __init__.py         # Model package exports (User, Wallet, Expense, Income, Budget)
│   │   │   ├── user.py             # Users table & authentication credentials
│   │   │   ├── wallet.py           # Wallets table (Bank, Cash, Digital/UPI, Cards)
│   │   │   ├── expense.py          # Unified transactions table (Expense, Income, Transfer)
│   │   │   ├── income.py           # Income streams table
│   │   │   └── budget.py           # Monthly budget targets table
│   │   │
│   │   ├── schemas/                # Pydantic v2 Input/Output Validation Contracts
│   │   │   ├── __init__.py         # Master schema exports
│   │   │   ├── auth.py             # UserRegister, UserLogin, UserResponse, TokenResponse
│   │   │   ├── wallet.py           # WalletCreate, WalletUpdate, WalletResponse
│   │   │   ├── expense.py          # ExpenseCreate, ExpenseUpdate, ExpenseResponse
│   │   │   ├── budget.py           # BudgetCreate, BudgetResponse
│   │   │   └── analytics.py        # AnalyticsSummaryResponse, CategoryBreakdownItem
│   │   │
│   │   ├── services/               # Decoupled Pure Business Logic
│   │   │   ├── auth_service.py     # User registration and verification
│   │   │   ├── wallet_service.py   # Multi-wallet balance math & transfer management
│   │   │   ├── expense_service.py  # Ledger filtering, pagination, sorting & CRUD
│   │   │   ├── budget_service.py   # Budget target tracking
│   │   │   └── csv_service.py      # Bank statement parser & export
│   │   │
│   │   ├── routers/                # API Domain Routers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # /auth/register, /auth/login, /auth/me, /auth/change-password
│   │   │   ├── transactions.py     # /transactions CRUD, pagination, filtering, CSV
│   │   │   ├── wallets.py          # /wallets CRUD & balance calculation
│   │   │   ├── expenses.py         # /expenses domain endpoints
│   │   │   ├── income.py           # /income domain endpoints
│   │   │   └── insights.py         # /insights monthly KPIs & /insights/budget
│   │   │
│   │   └── api/                    # Master Versioned API Aggregator
│   │       └── v1/
│   │           ├── router.py       # Master v1 router aggregating all endpoints
│   │           └── endpoints/
│   │               ├── analytics.py# /api/v1/analytics summary
│   │               ├── csv_tools.py# /api/v1/csv/preview, /api/v1/csv/import
│   │               └── health.py   # /api/v1/health probe
│   │
│   └── tests/                      # Automated Test Suite (Isolated In-Memory SQLite)
│       ├── conftest.py             # Test database fixture & TestClient setup
│       ├── test_auth.py            # Registration, login, and JWT token validation tests
│       ├── test_transactions.py    # Transaction CRUD & wallet balance deduction tests
│       ├── test_wallets.py         # Wallet management and balance calculation tests
│       ├── test_budgets.py         # Monthly budget update tests
│       └── test_analytics.py       # Insights and financial analytics tests
│
└── frontend/                       # React 18 (Vite) Application
    ├── .env                        # Local frontend environment variables
    ├── Dockerfile                  # Multi-stage production container
    ├── eslint.config.js            # Code quality and modern React 19 lint rules
    ├── index.html                  # Single-page HTML skeleton
    ├── nginx.conf                  # Nginx proxy & SPA router fallback
    ├── package.json                # Dependencies and scripts
    ├── package-lock.json           # Pinned dependency lockfile
    ├── README.md                   # Frontend template documentation
    ├── vite.config.js              # Vite configuration & path aliases
    │
    ├── public/
    │   └── favicon.svg             # Application brand favicon
    │
    └── src/
        ├── App.css                 # Application layout styles & components
        ├── App.jsx                 # Dynamic feature router & root shell assembly
        ├── index.css               # Central design system tokens & glassmorphic theme
        ├── main.jsx                # React root bootstrap entrypoint
        │
        ├── api/                    # Centralized Canonical HTTP API Layer
        │   ├── index.js            # Barrel export for all API services
        │   ├── apiClient.js        # Core fetch client wrapper
        │   ├── endpoints.js        # API endpoint constant definitions
        │   ├── authApi.js          # Authentication & user profile API
        │   ├── transactionApi.js   # Unified transactions & bulk CSV API
        │   ├── walletApi.js        # Wallets & accounts API
        │   ├── expenseApi.js       # Expenses & monthly budget API
        │   ├── incomeApi.js        # Income streams API
        │   ├── budgetApi.js        # Target budget management API
        │   ├── csvApi.js           # CSV preview & confirmation API
        │   └── dashboardApi.js     # Analytics endpoints API
        │
        ├── components/             # Reusable UI & Layout Components
        │   ├── BudgetRing.jsx      # Circular budget meter with percentage indicator
        │   ├── ConfirmDialog.jsx   # Generic confirmation dialog
        │   ├── CsvImportModal.jsx  # Rich bank statement CSV preview & import modal
        │   ├── ExpenseFilters.jsx  # Category filter chips
        │   ├── ExpenseForm.jsx     # Expense creation form
        │   ├── ExpenseList.jsx     # Expense cards list
        │   ├── FilterDrawer.jsx    # Right-side slide-over advanced filter drawer
        │   ├── Header.jsx          # Topbar with month switch, search, and action buttons
        │   ├── IncomeForm.jsx      # Income entry form
        │   ├── IncomeList.jsx      # Income records list
        │   ├── Sidebar.jsx         # Accessible navigation sidebar
        │   ├── TransactionForm.jsx # Add/Edit transaction modal (Expense, Income, Transfer)
        │   ├── TransactionTable.jsx# High-performance transaction ledger table
        │   │
        │   ├── auth/
        │   │   └── LogoutConfirmModal.jsx # Accessible logout confirmation dialog
        │   │
        │   ├── budget/
        │   │   └── BudgetConfirmModal.jsx # Budget threshold adjustment confirmation
        │   │
        │   ├── csv/
        │   │   └── CsvImportModal.jsx     # Re-export bridge to canonical CsvImportModal
        │   │
        │   ├── filters/
        │   │   └── FilterDrawer.jsx       # Re-export bridge to canonical FilterDrawer
        │   │
        │   ├── layout/             # Master Layout Shell Components
        │   │   ├── AppLayout.jsx   # Canonical application layout shell
        │   │   ├── Sidebar.jsx     # Layout navigation sidebar
        │   │   └── Topbar.jsx      # Layout top header
        │   │
        │   ├── transactions/
        │   │   ├── DeleteConfirmModal.jsx # Delete transaction confirmation modal
        │   │   ├── DeleteConfirmModal.css
        │   │   └── ExpenseModal.jsx       # Transaction dialog wrapper
        │   │
        │   ├── ui/                 # Atomic UI Controls
        │   │   ├── AppLogo/        # Brand logo component
        │   │   ├── CustomDatePicker/ # Styled datepicker popover
        │   │   ├── CustomDropdown/ # Accessible custom dropdown
        │   │   └── Toast/          # Global notification alerts
        │   │
        │   └── wallets/            # Wallet Feature Components
        │       ├── WalletBar.jsx   # Quick account balances bar
        │       ├── WalletBar.css
        │       └── components/     # WalletCard, CreateWalletModal, EditWalletModal, DeleteWalletModal
        │
        ├── constants/
        │   └── categories.js       # Expense & income categories with color palette
        │
        ├── context/                # Modular State Management
        │   ├── AppContext.jsx      # Unified context provider
        │   └── modules/            # Slices (auth, wallets, expenses, filter, theme, toast, etc.)
        │
        ├── hooks/
        │   └── useExpenses.js      # Primary application controller hook
        │
        ├── layouts/
        │   └── MainLayout.jsx      # Backward-compatible bridge to AppLayout
        │
        ├── pages/                  # Canonical Application Pages
        │   ├── Dashboard.jsx       # Overview screen alias
        │   ├── Insights.jsx        # Complete financial insights & budget metrics
        │   ├── Transactions.jsx    # Unified transactions ledger with search & pagination
        │   ├── Wallets.jsx         # Full wallet management page
        │   ├── Wallets.css         # Wallet cards styling
        │   ├── Expenses.jsx        # Dedicated expense tracking view
        │   ├── Income.jsx          # Dedicated income tracking view
        │   ├── Settings.jsx        # User settings, budget, currency & password update
        │   ├── Login.jsx           # Clean sign-in page
        │   └── Register.jsx        # Clean registration page
        │
        ├── routes/
        │   └── AppRoutes.jsx       # Routing definitions
        │
        ├── services/               # Backward-Compatible Service Bridges
        │   ├── authApi.js          # Points to src/api/authApi
        │   ├── transactionApi.js   # Points to src/api/transactionApi
        │   ├── walletApi.js        # Points to src/api/walletApi
        │   ├── expenseApi.js       # Points to src/api/expenseApi
        │   └── incomeApi.js        # Points to src/api/incomeApi
        │
        └── utils/                  # Central Utilities
            ├── formatCurrency.js   # Canonical multi-currency formatter (INR, USD, EUR, GBP)
            ├── currency.js         # Re-export bridge to formatCurrency
            ├── formatters.js       # Re-export bridge to formatCurrency & dateUtils
            ├── dateUtils.js        # Canonical date formatting & month shifting functions
            ├── dates.js            # Re-export bridge to dateUtils
            ├── csvParser.js        # CSV bank statement parsing utility
            ├── csvExporter.js      # CSV ledger export utility
            └── initialData.js      # Fallback mock data
```
