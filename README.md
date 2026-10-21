# 💼 Pocket Ledger — Full-Stack Expense Tracker

Pocket Ledger is a full-stack personal finance web application built using a clean, modern UI prototype as its exact design authority. It enables intuitive daily expense management, dynamic monthly budget tracking, and real-time spending insights with PostgreSQL persistence and a FastAPI REST API.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (v18), Vite, Vanilla CSS (preserving design prototype tokens)
- **Backend**: Python 3.12, FastAPI, Uvicorn
- **Database**: PostgreSQL (with SQLAlchemy ORM)
- **Data Validation**: Pydantic (v2)
- **API Communication**: HTTP REST API

---

## 📁 Project Structure

```
expense-tracker/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application, CORS, and router registration
│   │   ├── database.py      # PostgreSQL connection, session factory, Base
│   │   ├── models.py        # SQLAlchemy models (Expense, Budget)
│   │   ├── schemas.py       # Pydantic schemas (Expense, Budget, Insights)
│   │   ├── crud.py          # Database operations for expenses, budgets, insights
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── expenses.py  # REST endpoints for CRUD operations
│   │       └── insights.py  # Analytics, budget gauges, and trend endpoints
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # Sidebar, Header, BudgetRing, ExpenseList, ExpenseForm, ExpenseFilters
│   │   ├── pages/           # Expenses, Insights
│   │   ├── layouts/         # MainLayout shell
│   │   ├── services/        # Centralized API service (expenseApi.js)
│   │   ├── hooks/           # useExpenses state & sync hook
│   │   ├── utils/           # Currency and date utilities
│   │   ├── styles/
│   │   ├── App.jsx
│   │   ├── App.css          # Design reference prototype styling
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .gitignore
└── README.md
```

---

## 🚀 Prerequisites

1. **Node.js** (v18+ recommended) & `npm`
2. **Python** (v3.10+ recommended)
3. **PostgreSQL** installed and running on `localhost:5432`

---

## ⚙️ Configuration & Environment Variables

### 1. PostgreSQL Database Setup
Ensure PostgreSQL is running and create the `expense_tracker` database:
```sql
CREATE DATABASE expense_tracker;
```

### 2. Backend Environment Variables (`backend/.env`)
Create or edit `backend/.env`:
```env
DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker
PORT=8000
```
*(Replace `YOUR_PASSWORD` with your local PostgreSQL user password)*

### 3. Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api
```

---

## 🏃 Quick Start Guide

### Step 1: Start the FastAPI Backend
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # macOS/Linux

# Install dependencies (if first time)
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API Base: `http://localhost:8000`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

### Step 2: Start the React Frontend
Open a second terminal window:
```bash
cd frontend

# Install dependencies (if first time)
npm install

# Start Vite dev server
npm run dev
```
- Web Application: `http://localhost:5173/`

### Step 3: Production Build Validation
To verify frontend build correctness:
```bash
cd frontend
npm run build
```

---

## 🌟 Key Application Features

1. **Design Prototype Fidelity**: Exact colors, Manrope typography, card border-radii, spacing, and responsive layout matching the reference UI prototype.
2. **Expense Management**:
   - Add new expenses with amount, category chips, notes, and dates.
   - Edit existing expenses with instant ledger recalculation.
   - Delete expenses with a 5-second **Undo** toast notification.
   - Search expenses by keyword or notes.
   - Filter by categories (`All`, `Food`, `Transport`, `Home`, `Fun`, `Health`, `Shopping`, `Other`).
   - Sort by Date (ascending/descending) and Amount (ascending/descending).
3. **Monthly Budgets**:
   - Month-by-month navigation (‹ Month Year ›).
   - Dynamic SVG Budget Ring with threshold color alerts (`<80%`: Accent, `80%-100%`: Warning, `>100%`: Over budget).
   - Persistent monthly budget targets stored in PostgreSQL.
4. **Insights & Analytics**:
   - **Where your money went**: Category progress breakdown with direct click-to-filter navigation to Expenses.
   - **Last 7 days**: Interactive spending bar chart with today highlighted.
   - **Recent activity**: Chronological feed of ledger events with relative timestamps.

<!-- updated -->

<!-- updated -->
