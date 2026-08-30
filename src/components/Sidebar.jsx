import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/ledger', label: 'Ledger' },
  { to: '/habits', label: 'Habits' },
  { to: '/tasks', label: 'Tasks' }
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-mark">
        <span className="sidebar-mark-glyph">||||&#824;</span>
        <span className="sidebar-mark-text display">Tally</span>
      </div>
      <p className="sidebar-tagline">money and momentum, both counted</p>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-name">{user?.name}</span>
          <span className="sidebar-user-email">{user?.email}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
      </div>
    </aside>
  )
}
