import { CAT_ICONS, fmt, txThisMonth } from '../../utils/finance';

/** Shows budget bars for each category with spending progress */
export function BudgetOverview({ budgets, transactions }) {
  const mTxs = txThisMonth(transactions);
  const catSpend = {};
  mTxs.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.cat] = (catSpend[t.cat] || 0) + t.amount;
  });

  const entries = Object.entries(budgets);
  if (!entries.length) {
    return (
      <div className="empty-state" style={{ padding: '20px' }}>
        <i className="fas fa-wallet" />
        <p>No budgets set. Go to Budget page to add one.</p>
      </div>
    );
  }

  return (
    <div className="budget-list">
      {entries.map(([cat, limit]) => {
        const spent = catSpend[cat] || 0;
        const pct   = Math.min(100, limit > 0 ? (spent / limit) * 100 : 0);
        const over  = spent > limit;
        const color = over ? 'var(--red)' : pct > 75 ? 'var(--gold)' : 'var(--green)';
        return (
          <div key={cat} className="budget-item">
            <div className="budget-header">
              <span className="budget-cat">{CAT_ICONS[cat] || '📦'} {cat}</span>
              <span className="budget-amounts">
                <span style={{ color }}>{fmt(spent)}</span> / {fmt(limit)}
              </span>
            </div>
            <div className="budget-track">
              <div className="budget-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
