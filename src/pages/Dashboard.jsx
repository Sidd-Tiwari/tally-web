import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatMoney, formatDate } from '../utils/format'
import StatCard from '../components/StatCard'
import TallyMarks from '../components/TallyMarks'
import './Dashboard.css'
import '../components/StatCard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [habits, setHabits] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const now = new Date()
        const [summaryRes, expensesRes, habitsRes, tasksRes] = await Promise.all([
          api.getSummary(now.getFullYear(), now.getMonth() + 1),
          api.getExpenses(),
          api.getHabits(),
          api.getTasks()
        ])
        if (cancelled) return
        setSummary(summaryRes)
        setExpenses(expensesRes.slice(0, 6))
        setHabits(habitsRes)
        setTasks(tasksRes.filter((t) => !t.completed).slice(0, 5))
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const greeting = getGreeting()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="display">{greeting}, {user?.name?.split(' ')[0]}</h1>
          <p className="page-sub">Here's where your month stands.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!loading && summary && (
        <div className="stat-row">
          <StatCard label="Income this month" value={formatMoney(summary.totalIncome)} tone="credit" />
          <StatCard label="Spent this month" value={formatMoney(summary.totalExpense)} tone="debit" />
          <StatCard
            label="Net balance"
            value={formatMoney(summary.netBalance)}
            tone={Number(summary.netBalance) >= 0 ? 'credit' : 'debit'}
            hint={`${formatDate(summary.periodStart)} – ${formatDate(summary.periodEnd)}`}
          />
        </div>
      )}

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-heading">
            <h2 className="display">Recent entries</h2>
            <Link className="btn btn-ghost btn-sm" to="/ledger">Open ledger →</Link>
          </div>
          <hr className="ruled-tight" />
          {expenses.length === 0 ? (
            <EmptyState line1="No entries yet." line2="Add your first one from the Ledger page." />
          ) : (
            <ul className="entry-list">
              {expenses.map((e) => (
                <li key={e.id} className="entry-row">
                  <div className="entry-main">
                    <span className="entry-desc">{e.description}</span>
                    <span className="entry-date">{formatDate(e.expenseDate)}</span>
                  </div>
                  <span className={`entry-amount mono ${e.type === 'INCOME' ? 'amount-credit' : 'amount-debit'}`}>
                    {e.type === 'INCOME' ? '+' : '−'}{formatMoney(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="section-heading">
            <h2 className="display">Habits &amp; tasks</h2>
            <Link className="btn btn-ghost btn-sm" to="/habits">Open →</Link>
          </div>
          <hr className="ruled-tight" />
          {habits.length === 0 && tasks.length === 0 ? (
            <EmptyState line1="Nothing tracked yet." line2="Start a habit or add a task." />
          ) : (
            <>
              {habits.slice(0, 4).map((h) => (
                <div key={h.id} className="habit-preview-row">
                  <span className="habit-preview-name">{h.name}</span>
                  <TallyMarks count={h.currentStreak} />
                </div>
              ))}
              {tasks.length > 0 && (
                <>
                  <hr className="ruled-tight" />
                  <p className="mini-label">Due soon</p>
                  {tasks.map((t) => (
                    <div key={t.id} className="task-preview-row">
                      <span>{t.title}</span>
                      <span className="task-preview-date">{formatDate(t.dueDate)}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function EmptyState({ line1, line2 }) {
  return (
    <div className="empty-state">
      <p className="display">{line1}</p>
      <p>{line2}</p>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
