import { CAT_ICONS, CAT_COLORS, fmt } from '../../utils/finance';

/**
 * Renders a flat list of transaction rows.
 * onEdit / onDelete are optional action callbacks.
 */
export function TransactionList({ transactions, onEdit, onDelete, limit }) {
  const list = limit ? transactions.slice(0, limit) : transactions;

  if (!list.length) {
    return (
      <div className="empty-state">
        <i className="fas fa-receipt" />
        <p>No transactions yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="tx-list">
      {list.map(tx => (
        <div key={tx.id} className="tx-item">
          <div
            className="tx-icon"
            style={{ background: `${CAT_COLORS[tx.cat] || '#888'}22`, color: CAT_COLORS[tx.cat] || '#888' }}
          >
            {CAT_ICONS[tx.cat] || '📦'}
          </div>
          <div className="tx-info">
            <div className="tx-name">{tx.desc}</div>
            <div className="tx-meta">
              {tx.cat} · {tx.date}
              {tx.notes && ` · ${tx.notes}`}
            </div>
          </div>
          <div className={`tx-amount ${tx.type}`}>
            {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
          </div>
          {(onEdit || onDelete) && (
            <div className="tx-actions">
              {onEdit && (
                <button className="btn btn-sm btn-secondary" onClick={() => onEdit(tx)}>
                  <i className="fas fa-edit" />
                </button>
              )}
              {onDelete && (
                <button className="btn btn-sm btn-danger" onClick={() => onDelete(tx.id)}>
                  <i className="fas fa-trash" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
