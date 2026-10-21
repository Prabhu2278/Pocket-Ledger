# Pocket Ledger — System Architecture & Design Documentation

## 1. Architectural Philosophy
Pocket Ledger is architected with a decoupled, modular design emphasizing predictable data flow, separation of concerns, and robust real-world production readiness:

```
┌────────────────────────────────────────────────────────┐
│                   React 18 Frontend                    │
│   (Vite SPA, CSS Glassmorphic Tokens, AppLayout Shell) │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│     (Master API Router: /api/v1, /api, Root Mounts)    │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Business Services     │ │      Security Engine      │
│ (Wallet, Expense, Budget) │ │ (Bcrypt, HS256 JWT, Auth) │
└─────────────┬─────────────┘ └───────────┬───────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SQLAlchemy 2.0 ORM                   │
│         (Declarative Base, Models, Sessions)           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              PostgreSQL / SQLite Database              │
│       (Automatic fallback for seamless local dev)      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture (`backend/app/`)

### A. Canonical Entrypoint
- `backend/app/main.py`: Official FastAPI application factory configuring CORS middleware, lifespan events, database table initialization, and mounting `api_router`.
- `backend/main.py`: Minimal root wrapper allowing `uvicorn main:app --reload` from the root or batch scripts.

### B. Core Layer (`backend/app/core/`)
- [config.py](file:///d:/expense-tracker/backend/app/core/config.py): Environment variable resolution (`DATABASE_URL`, `SECRET_KEY`, `PORT`).
- [database.py](file:///d:/expense-tracker/backend/app/core/database.py): Engine initialization with connection pooling (`pool_pre_ping=True`), automatic SQLite dev fallback, `SessionLocal` factory, and `get_db()` dependency generator.
- [security.py](file:///d:/expense-tracker/backend/app/core/security.py): Bcrypt salt hashing, timing-attack-safe password verification, and JWT access token encoding/decoding.

### C. Models Layer (`backend/app/models/`)
Modular entity definitions using SQLAlchemy Declarative Base:
- `user.py`: User accounts, hashed passwords, currency preference.
- `wallet.py`: Wallets and accounts (Bank, Digital/UPI, Cash, Credit Card) with foreign key relationships.
- `expense.py`: Unified transactions ledger (`EXPENSE`, `INCOME`, `TRANSFER`) with source/target wallet foreign keys.
- `income.py`: Dedicated income streams.
- `budget.py`: Monthly category and global budget targets.

### D. Schemas Layer (`backend/app/schemas/`)
Strict Pydantic validation contracts ensuring type safety between clients and database records:
- `auth.py`: Registration, login, profile updates, and JWT token models.
- `wallet.py`: Input/output contracts for wallet balances and configurations.
- `expense.py`: Validated transaction models with amount and category normalizers.
- `budget.py`: Budget target requests and responses.
- `analytics.py`: Aggregated cash flow, budget utilization, and category breakdown responses.

### E. Routers Layer (`backend/app/routers/` & `backend/app/api/v1/`)
- Master aggregator: `backend/app/api/v1/router.py` groups all endpoints under `/api/v1` and `/api`.
- Domain routers: `auth.py`, `transactions.py`, `wallets.py`, `expenses.py`, `income.py`, `insights.py`, `csv_tools.py`, `health.py`.

### F. Services Layer (`backend/app/services/`)
Encapsulates pure business logic independent of transport:
- `wallet_service.py`: Computes live wallet balances dynamically from transactions, auto-assigns orphaned entries, and manages wallet transfers.
- `expense_service.py`: Enforces transaction integrity.
- `budget_service.py`: Calculates budget utilization percentages and daily spend hints.
- `csv_service.py`: Parses bank statement uploads and bulk imports transactions.

### G. Automated Test Suite (`backend/tests/`)
Isolated test suite executed via `pytest`:
- Uses in-memory SQLite (`sqlite:///:memory:`) so production databases are never touched.
- Covers user registration, authentication, wallet CRUD, real-time balance calculations, budget updates, and financial analytics.

---

## 3. Frontend Architecture (`frontend/src/`)

### A. Application Shell & Layout (`src/components/layout/`)
- [AppLayout.jsx](file:///d:/expense-tracker/frontend/src/components/layout/AppLayout.jsx): The master responsive shell containing the sidebar, header, global transaction modal, filter drawer, and toast notification system.
- `Sidebar.jsx`: Accessible navigation menu with Month Navigator, Budget Meter, and Quick Logout.
- `Topbar.jsx` / `Header.jsx`: Header with real-time Search, Month Quick-Switch, and Action Buttons (+ Add Transaction, Import CSV).

### B. Canonical Pages (`src/pages/`)
- [Dashboard.jsx](file:///d:/expense-tracker/frontend/src/pages/Dashboard.jsx) & [Insights.jsx](file:///d:/expense-tracker/frontend/src/pages/Insights.jsx): Financial KPIs (Total Income, Total Expense, Net Cash Flow, Savings Rate), Budget Ring, 7-Day Spending Chart, and Category Breakdown.
- [Transactions.jsx](file:///d:/expense-tracker/frontend/src/pages/Transactions.jsx): High-performance transaction ledger with live search, advanced drawer filtering, multi-column sorting, pagination (10/20/50/100), and CSV export.
- [Wallets.jsx](file:///d:/expense-tracker/frontend/src/pages/Wallets.jsx): Multi-account management (Bank, Cash, UPI, Cards) with live calculated balances and creation/edit modals.
- [Settings.jsx](file:///d:/expense-tracker/frontend/src/pages/Settings.jsx): User profile, currency selector, monthly budget target, theme switcher, and secure password updates.
- [Login.jsx](file:///d:/expense-tracker/frontend/src/pages/Login.jsx) & [Register.jsx](file:///d:/expense-tracker/frontend/src/pages/Register.jsx): Fast, clean authentication views.

### C. API Layer (`src/api/`)
Centralized HTTP client functions with automatic authorization headers and error propagation:
- `authApi.js`: Login, register, profile, and JWT storage.
- `transactionApi.js`: Unified transaction CRUD, bulk CSV upload, and export.
- `walletApi.js`: Accounts and balances API.
- `expenseApi.js` & `incomeApi.js`: Domain-specific endpoints.

### D. Design System & CSS
- [index.css](file:///d:/expense-tracker/frontend/src/index.css): Centralized design tokens (colors, radii, shadows, fonts, glassmorphism).
- [App.css](file:///d:/expense-tracker/frontend/src/App.css): Responsive grid layouts, table styling, button states, and form elements.
