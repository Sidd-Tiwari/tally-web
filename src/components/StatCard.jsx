export default function StatCard({ label, value, tone = 'neutral', hint }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value mono">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}
