const TOKEN_KEY = 'tally_token'
const USER_KEY = 'tally_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Thin fetch wrapper: prefixes /api, attaches the bearer token, and
 * throws a normalized Error with the server's message on failure so
 * every page can just try/catch and show err.message.
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  if (res.status === 204) return null

  let data = null
  try {
    data = await res.json()
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    if (res.status === 401) {
      clearSession()
    }
    throw new Error(message)
  }

  return data
}

export const api = {
  // auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),

  // categories
  getCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: payload }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // expenses
  getExpenses: () => request('/expenses'),
  createExpense: (payload) => request('/expenses', { method: 'POST', body: payload }),
  updateExpense: (id, payload) => request(`/expenses/${id}`, { method: 'PUT', body: payload }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  getSummary: (year, month) => request(`/expenses/summary?year=${year}&month=${month}`),

  // habits
  getHabits: () => request('/habits'),
  createHabit: (payload) => request('/habits', { method: 'POST', body: payload }),
  completeHabit: (id) => request(`/habits/${id}/complete`, { method: 'POST' }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: 'DELETE' }),

  // tasks
  getTasks: () => request('/tasks'),
  createTask: (payload) => request('/tasks', { method: 'POST', body: payload }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: 'PUT', body: payload }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: 'POST' }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
}
