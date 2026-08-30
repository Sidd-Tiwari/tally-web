import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { formatDate } from '../utils/format'
import './Tasks.css'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      setTasks(await api.getTasks())
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
      await api.createTask({ ...form, dueDate: form.dueDate || null })
      setForm(emptyForm())
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await api.toggleTask(id)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const pending = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="display">Tasks</h1>
          <p className="page-sub">One-off things, checked off.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New task'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleCreate}>
            <div className="entry-form-row">
              <div className="field" style={{ flex: 2, minWidth: 200 }}>
                <label>Title</label>
                <input required value={form.title} placeholder="What needs doing?"
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="field">
                <label>Due date</label>
                <input type="date" value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="field">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Notes (optional)</label>
              <textarea rows={2} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add task'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="page-sub">Loading…</p>
        ) : pending.length === 0 && completed.length === 0 ? (
          <div className="empty-state">
            <p className="display">Nothing on the list.</p>
            <p>Add a task to get started.</p>
          </div>
        ) : (
          <>
            {pending.length === 0 ? (
              <p className="page-sub">All caught up — nothing pending.</p>
            ) : (
              <ul className="task-list">
                {pending.map((t) => <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
              </ul>
            )}

            {completed.length > 0 && (
              <>
                <hr className="ruled-tight" />
                <button className="btn btn-ghost btn-sm" onClick={() => setShowCompleted((s) => !s)}>
                  {showCompleted ? 'Hide' : 'Show'} completed ({completed.length})
                </button>
                {showCompleted && (
                  <ul className="task-list" style={{ marginTop: 12 }}>
                    {completed.map((t) => <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />)}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <li className={`task-row ${task.completed ? 'task-row-done' : ''}`}>
      <label className="task-checkbox-label">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span className="task-title">{task.title}</span>
      </label>
      <div className="task-meta">
        {task.dueDate && <span className="task-due mono">{formatDate(task.dueDate)}</span>}
        <span className={`chip chip-priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </li>
  )
}

function emptyForm() {
  return { title: '', description: '', dueDate: '', priority: 'MEDIUM' }
}
