import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../hooks/useAuth';
import { useFinance }          from '../hooks/useFinance';
import { useToast }            from '../hooks/useToast';
import { KPICard }             from '../components/dashboard/KPI';
import { TransactionList }     from '../components/dashboard/TransactionList';
import { BudgetOverview }      from '../components/dashboard/BudgetOverview';
import { ToastContainer }      from '../components/ui/Toast';
import { Modal }               from '../components/ui/Modal';
import { CAT_COLORS, CAT_ICONS, fmt, txThisMonth, today, calcHealthScore, generateLocalInsights, EXPENSE_CATS, INCOME_CATS } from '../utils/finance';

// ── DONUT CHART ──
function DonutChart({ transactions }) {
  const mTxs = txThisMonth(transactions);
  const catSpend = {};
  mTxs.filter(t => t.type === 'expense').forEach(t => { catSpend[t.cat] = (catSpend[t.cat] || 0) + t.amount; });
  const total  = Object.values(catSpend).reduce((s, v) => s + v, 0);
  const entries = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const r = 60, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = entries.map(([cat, val]) => {
    const pct  = total > 0 ? val / total : 0;
    const dash = pct * circ;
    const slice = { cat, val, dash, offset, color: CAT_COLORS[cat] || '#888' };
    offset += dash;
    return slice;
  });
  return (
    <div>
      <div className="donut-wrap">
        <svg className="donut-svg" viewBox="0 0 140 140" width="140" height="140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="18" />
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="18" />
          ) : slices.map(s => (
            <circle key={s.cat} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="18"
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 500 }}>{fmt(total)}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text3)', marginTop: 2 }}>TOTAL</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slices.map(s => (
          <div key={s.cat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text2)', flex: 1 }}>{CAT_ICONS[s.cat]} {s.cat}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>{fmt(s.val)}</span>
          </div>
        ))}
        {total === 0 && <div style={{ color: 'var(--text3)', fontSize: '0.78rem', textAlign: 'center' }}>No expense data</div>}
      </div>
    </div>
  );
}

// ── ADD TRANSACTION MODAL ──
function AddTransactionModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { desc: '', amount: '', date: today(), type: 'expense', cat: 'Food & Dining', notes: '', tags: '' });
  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v, ...(k === 'type' ? { cat: v === 'income' ? 'Salary' : 'Food & Dining' } : {}) }));

  const handleSave = () => {
    if (!form.desc || !form.amount || !form.date) { alert('Fill all required fields'); return; }
    onSave({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  return (
    <Modal title={initial ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose}>
      <div className="type-toggle">
        <button className={`type-btn${form.type === 'expense' ? ' expense-active' : ''}`} onClick={() => set('type', 'expense')}>
          <i className="fas fa-arrow-up" /> Expense
        </button>
        <button className={`type-btn${form.type === 'income' ? ' income-active' : ''}`} onClick={() => set('type', 'income')}>
          <i className="fas fa-arrow-down" /> Income
        </button>
      </div>
      <div className="form-group">
        <label className="form-label">Description *</label>
        <input className="form-input" value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="e.g. Grocery shopping" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount (₹) *</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.cat} onChange={e => set('cat', e.target.value)}>
          {cats.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
          <i className="fas fa-check" /> {initial ? 'Update' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}

// ── MAIN DASHBOARD ──
export default function Dashboard() {
  const { user }  = useAuth();
  const finance   = useFinance();
  const navigate  = useNavigate();
  const [toasts, showToast] = useToast();
  const [showTxModal, setShowTxModal] = useState(false);
  const [editTx,      setEditTx]      = useState(null);

  const { transactions, budgets, debts, goals, profile, addTransaction, editTransaction, deleteTransaction } = finance;

  const mTxs    = txThisMonth(transactions);
  const income  = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings  = income - expenses;
  const { score, grade, color } = calcHealthScore({ transactions, budgets, debts, goals, profile });
  const insights = generateLocalInsights({ transactions, budgets, debts, goals, profile }).slice(0, 3);

  const displayName = (profile?.name || user?.name || 'User').split(' ')[0];
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const onSaveTx = (form) => {
    if (editTx) { editTransaction(editTx.id, form); showToast('Transaction updated', 'success'); }
    else { addTransaction(form); showToast('Transaction added!', 'success'); }
    setEditTx(null);
  };

  const handleDelete = (id) => { if (window.confirm('Delete transaction?')) { deleteTransaction(id); showToast('Transaction deleted', 'info'); } };
  const handleEdit   = (tx)  => { setEditTx(tx); setShowTxModal(true); };

  return (
    <div className="page-enter">
      <ToastContainer toasts={toasts} />

      {(showTxModal || editTx) && (
        <AddTransactionModal
          initial={editTx}
          onClose={() => { setShowTxModal(false); setEditTx(null); }}
          onSave={onSaveTx}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Good morning, <span>{displayName}</span></div>
          <div className="page-sub">{dateStr}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowTxModal(true)}>
          <i className="fas fa-plus" /> Add Transaction
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPICard variant="gold"   icon="fas fa-wallet"    label="Net Balance"      value={fmt(transactions.reduce((s,t) => s + (t.type==='income'?t.amount:-t.amount),0))} />
        <KPICard variant="green"  icon="fas fa-arrow-down" label="Monthly Income"  value={fmt(income)} />
        <KPICard variant="red"    icon="fas fa-arrow-up"  label="Monthly Expenses" value={fmt(expenses)} />
        <KPICard variant="blue"   icon="fas fa-piggy-bank" label="Net Savings"     value={fmt(savings)} />
        <KPICard variant="purple" icon="fas fa-heartbeat" label="Health Score"     value={score ? `${score}/100` : '—'} change={grade} />
      </div>

      {/* Recent transactions + donut */}
      <div className="grid-65-35">
        <div className="card">
          <div className="section-title">
            <i className="fas fa-list-ul" /> Recent Transactions
            <div className="title-line" />
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/transactions')}>View All</button>
          </div>
          <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} limit={8} />
        </div>
        <div className="card">
          <div className="section-title"><i className="fas fa-chart-pie" /> Spending Breakdown <div className="title-line" /></div>
          <DonutChart transactions={transactions} />
        </div>
      </div>

      {/* Budget + insights */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="section-title"><i className="fas fa-wallet" /> Budget Overview <div className="title-line" /></div>
          <BudgetOverview budgets={budgets} transactions={transactions} />
        </div>
        <div className="card">
          <div className="section-title"><i className="fas fa-lightbulb" /> Quick Insights <div className="title-line" /></div>
          <div className="insight-list">
            {insights.length === 0 && (
              <div className="empty-state" style={{ padding: 20 }}>
                <i className="fas fa-chart-line" />
                <p>Add transactions to view analysis</p>
              </div>
            )}
            {insights.map((ins, i) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${ins.type}`}><i className={ins.icon} /></div>
                <div>
                  <div className="insight-title">{ins.title}</div>
                  <div className="insight-desc">{ins.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
