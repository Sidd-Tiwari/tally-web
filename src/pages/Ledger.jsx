import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { formatMoney, formatDate, todayISO } from '../utils/format'
import './Ledger.css'

const DEFAULT_ICON = '💰'

export default function Ledger() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showCatForm, setShowCatForm] = useState(false)

  const [form, setForm] = useState(emptyForm())
  const [catForm, setCatForm] = useState({ name: '', type: 'EXPENSE', icon: DEFAULT_ICON })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const [exp, cats] = await Promise.all([api.getExpenses(), api.getCategories()])
      setExpenses(exp)
      setCategories(cats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.createExpense({
        amount: parseFloat(form.amount),
        description: form.description,
        categoryId: form.categoryId,
        type: form.type,
        expenseDate: form.expenseDate
      })
      setForm(emptyForm())
      setShowForm(false)
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteExpense(id) {
    try {
      await api.deleteExpense(id)
      setExpenses((prev) => prev.filter((x) => x.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.createCategory(catForm)
      setCatForm({ name: '', type: 'EXPENSE', icon: DEFAULT_ICON })
      setShowCatForm(false)
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCategory(id) {
    try {
      await api.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function categoryFor(id) {
    return categories.find((c) => c.id === id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="display">Ledger</h1>
          <p className="page-sub">Every entry, ruled and running.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCatForm((s) => !s)}>
            {showCatForm ? 'Close' : 'Manage categories'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ New entry'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showCatForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 className="display" style={{ fontSize: 16, marginBottom: 12 }}>Categories</h2>
          <div className="category-chip-row">
            {categories.map((c) => (
              <span key={c.id} className="category-chip">
                <span>{c.icon} {c.name}</span>
                <button className="chip-remove" onClick={() => handleDeleteCategory(c.id)} aria-label={`Delete ${c.name}`}>×</button>
              </span>
            ))}
            {categories.length === 0 && <span className="page-sub">No categories yet — add one below.</span>}
          </div>
          <form className="inline-form" onSubmit={handleAddCategory}>
            <input
              placeholder="Icon"
              value={catForm.icon}
              maxLength={2}
              onChange={(e) => setCatForm((f) => ({ ...f, icon: e.target.value }))}
              style={{ width: 50 }}
            />
            <input
              placeholder="Category name"
              required
              value={catForm.name}
              onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
            />
            <select value={catForm.type} onChange={(e) => setCatForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>Add</button>
          </form>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form className="entry-form" onSubmit={handleAddExpense}>
            <div className="entry-form-row">
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div className="field">
                <label>Amount</label>
                <input type="number" step="0.01" min="0" required value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" required value={form.expenseDate}
                  onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))} />
              </div>
            </div>
            <div className="entry-form-row">
              <div className="field" style={{ flex: 1 }}>
                <label>Description</label>
                <input required value={form.description} placeholder="What was this for?"
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="field">
                <label>Category</label>
                <select required value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                  <option value="" disabled>Choose…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving || categories.length === 0}>
              {saving ? 'Saving…' : 'Save entry'}
            </button>
            {categories.length === 0 && <p className="page-sub" style={{ marginTop: 8 }}>Add a category first.</p>}
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="page-sub">Loading…</p>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <p className="display">The ledger's blank.</p>
            <p>Add your first entry to start the running total.</p>
          </div>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="align-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const cat = categoryFor(e.categoryId)
                return (
                  <tr key={e.id}>
                    <td className="mono">{formatDate(e.expenseDate)}</td>
                    <td>{e.description}</td>
                    <td>
                      <span className={`chip ${e.type === 'INCOME' ? 'chip-credit' : 'chip-debit'}`}>
                        {cat ? `${cat.icon} ${cat.name}` : '—'}
                      </span>
                    </td>
                    <td className={`align-right mono ${e.type === 'INCOME' ? 'amount-credit' : 'amount-debit'}`}>
                      {e.type === 'INCOME' ? '+' : '−'}{formatMoney(e.amount)}
                    </td>
                    <td className="align-right">
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteExpense(e.id)}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function emptyForm() {
  return { amount: '', description: '', categoryId: '', type: 'EXPENSE', expenseDate: todayISO() }
}
