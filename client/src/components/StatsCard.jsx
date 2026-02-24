export default function StatsCard({ icon, label, value, color = '#3B82F6', bg = 'rgba(59,130,246,0.15)' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
