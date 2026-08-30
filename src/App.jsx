import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedLayout from './components/ProtectedLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Ledger from './pages/Ledger'
import Habits from './pages/Habits'
import Tasks from './pages/Tasks'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/ledger" element={<ProtectedLayout><Ledger /></ProtectedLayout>} />
          <Route path="/habits" element={<ProtectedLayout><Habits /></ProtectedLayout>} />
          <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
