import { createContext, useContext, useState, useCallback } from 'react'
import { api, setSession, clearSession, getStoredUser, getToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())
  const [token, setToken] = useState(getToken())

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password })
    setSession(res.token, { id: res.userId, name: res.name, email: res.email })
    setToken(res.token)
    setUser({ id: res.userId, name: res.name, email: res.email })
    return res
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await api.register({ name, email, password })
    setSession(res.token, { id: res.userId, name: res.name, email: res.email })
    setToken(res.token)
    setUser({ id: res.userId, name: res.name, email: res.email })
    return res
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
