import React from 'react'
import { money } from '../utils/formatCurrency'
import { INCOME_CATEGORIES } from '../constants/categories'
import { IncomeList } from '../components/IncomeList'

export function Income({
  totalIncome = 0,
  monthIncomes = [],
  rankedIncomeCategories = [],
  filter = 'All',
  setFilter,
  visibleIncomes = [],
  sort = { key: 'date', direction: -1 },
  currency = 'INR',
  onSort,
  openIncomeDialog,
  onDeleteIncome,
}) {
  const topSource = rankedIncomeCategories[0] || 'None yet'
  const count = monthIncomes.length
  const avg = count > 0 ? totalIncome / count : 0

  const filterOptions = ['All', ...INCOME_CATEGORIES.map((c) => c[0])]

  return (
    <section className="view on" id="v-income" aria-label="Income module">
      <div className="kpis">
        <div className="card kpi">
          <span>Income this month</span>
          <b id="k-inc-1" className="pos">
            +{money(totalIncome, currency)}
          </b>
        </div>
        <div className="card kpi">
          <span>Top source</span>
          <b id="k-inc-2">{topSource}</b>
        </div>
        <div className="card kpi">
          <span>Transactions</span>
          <b id="k-inc-3">{count}</b>
        </div>
        <div className="card kpi">
          <span>Average income</span>
          <b id="k-inc-4">{money(avg, currency)}</b>
        </div>
      </div>

      <div className="card">
        <div className="chips" role="group" aria-label="Filter by income category">
          {filterOptions.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <IncomeList
          visibleIncomes={visibleIncomes}
          monthIncomes={monthIncomes}
          sort={sort}
          currency={currency}
          onSort={onSort}
          onEdit={openIncomeDialog}
          onDelete={onDeleteIncome}
        />
      </div>
    </section>
  )
}

export default Income
