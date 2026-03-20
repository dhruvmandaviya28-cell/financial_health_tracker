/** KPI card — variant: gold | green | red | blue | purple */
export function KPICard({ variant = 'gold', icon, label, value, change, changeClass }) {
  return (
    <div className={`kpi-card ${variant}`}>
      <div className="kpi-label">
        <i className={icon} /> {label}
      </div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div className={`kpi-change ${changeClass || ''}`}>{change}</div>
      )}
    </div>
  );
}
