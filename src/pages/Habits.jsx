import { useEffect, useState } from 'react'
import { api } from '../api/client'
import TallyMarks from '../components/TallyMarks'
import './Habits.css'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', frequency: 'DAILY' })
  const [saving, setSaving] = useState(false)
  const [justCompleted, setJustCompleted] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      setHabits(await api.getHabits())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.createHabit(form)
      setForm({ name: '', frequency: 'DAILY' })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete(id) {
    setError('')
    try {
      const updated = await api.completeHabit(id)
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)))
      setJustCompleted(id)
      setTimeout(() => setJustCompleted(null), 500)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteHabit(id)
      setHabits((prev) => prev.filter((h) => h.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const isDoneToday = (h) => h.lastCompletedDate === new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="display">Habits</h1>
          <p className="page-sub">Every stroke is a day kept.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New habit'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form className="inline-form" onSubmit={handleCreate}>
            <input
              required
              placeholder="e.g. Read 20 minutes"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ flex: 1 }}
            />
            <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
            </select>
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>Add</button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="page-sub">Loading…</p>
      ) : habits.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="display">No habits yet.</p>
            <p>Start one — the first mark is the hardest.</p>
          </div>
        </div>
      ) : (
        <div className="habit-grid">
          {habits.map((h) => {
            const done = isDoneToday(h)
            return (
              <div className="card habit-card" key={h.id}>
                <div className="habit-card-top">
                  <div>
                    <h3 className="display habit-name">{h.name}</h3>
                    <span className="habit-freq">{h.frequency === 'DAILY' ? 'Daily' : 'Weekly'}</span>
                  </div>
                  <button className="chip-remove-btn" onClick={() => handleDelete(h.id)} aria-label={`Delete ${h.name}`}>×</button>
                </div>

                <div className="habit-tally-block">
                  <TallyMarks count={h.currentStreak} animateLast={justCompleted === h.id} />
                  <span className="habit-streak-label">
                    {h.currentStreak} {h.currentStreak === 1 ? 'day' : 'days'} running
                    {h.longestStreak > h.currentStreak && (
                      <span className="habit-best"> · best {h.longestStreak}</span>
                    )}
                  </span>
                </div>

                <button
                  className={`btn ${done ? 'btn-ghost' : 'btn-primary'} habit-complete-btn`}
                  onClick={() => handleComplete(h.id)}
                  disabled={done}
                >
                  {done ? '✓ Marked for today' : 'Mark today'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
