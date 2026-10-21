# 💼 Pocket Ledger

> **Intelligent, beautifully designed personal finance & wealth tracker with multi-wallet balances, month-by-month budgeting, and bank statement CSV parsing.**

---

## ✨ Features at a Glance

- 🔐 **Privacy-First Manual Access**: Clean authentication requiring manual credential entry every session with zero default demo data or browser autofill.
- 💳 **Multi-Wallet Management**: Live balance tracking across Bank, UPI, Cash, and Savings accounts with funds transfer support.
- 🎯 **Month-Specific Isolated Budgeting**: Custom monthly budgets with visual SVG circular gauges and real-time cash flow analytics.
- 📊 **Insightful Financial Analytics**: 7-day spending trends, ranked category expenditure bars, and monthly cash flow metrics.
- 📂 **Bank CSV Importer**: Drag-and-drop CSV parser with intelligent auto-categorization.
- 🌓 **Dynamic Theme Engine**: Tailored Light and Dark modes with ambient background nebula layers and high-contrast accessibility.

---

## 🗂️ Project Structure & Flow

Pocket Ledger's frontend is organized cleanly around the **5-step User Journey Flow**:

```
frontend/src/flow/
├── 1-auth/         # Step 1: Authentication & Onboarding (AuthGateway, LoginForm, RegisterForm)
├── 2-navigation/   # Step 2: Main Application Shell (Sidebar, Topbar, Month Switcher)
├── 3-dashboard/    # Step 3: Financial Analytics & Overview (KPI Cards, Budget Ring, Trends)
├── 4-transactions/ # Step 4: Expense Ledger & Table (Sort, Filter, Pagination, Bulk Delete)
└── 5-features/     # Step 5: Modals & Feature Dialogs (ExpenseModal, WalletBar, BudgetModal, CsvImport)
```

For complete visual diagrams, data pipelines, and architectural maps, refer to:
- 📖 [PROJECT_FLOW.md](./PROJECT_FLOW.md)
- 🏛️ [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## ⚡ Quick Start

### 1. Backend Setup (FastAPI + SQLite)
```bash
cd backend
# Activate Python virtual environment
.\venv\Scripts\activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 9000
```
API docs available at: `http://localhost:9000/docs`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
# Install dependencies (if needed)
npm install

# Start the Vite development server
npm run dev
```
Application will be live at: `http://localhost:5173/`

### 3. Production Build Validation
```bash
cd frontend
npm run build
```
Builds cleanly with zero errors.
