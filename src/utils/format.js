const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
})

export function formatMoney(value) {
  return formatter.format(Number(value ?? 0))
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
