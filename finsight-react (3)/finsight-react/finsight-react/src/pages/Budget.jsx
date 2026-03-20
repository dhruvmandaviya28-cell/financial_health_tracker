import { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useToast }   from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { Modal }      from '../components/ui/Modal';
import { BudgetOverview } from '../components/dashboard/BudgetOverview';
import { EXPENSE_CATS, CAT_ICONS, fmt, txThisMonth } from '../utils/finance';

function BudgetModal({ onClose, onSave }) {
  const [cat,    setCat]    = useState(EXPENSE_CATS[0]);
  const [amount, setAmount] = useState('');
  return (
    <Modal title="Set Budget" onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
          {EXPENSE_CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Monthly Limit (₹)</label>
        <input className="form-input" type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 5000" />
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary"   style={{ flex:1, justifyContent:'center' }}
          onClick={() => { if (!amount) return; onSave(cat, parseFloat(amount)); onClose(); }}>
          <i className="fas fa-check" /> Save Budget
        </button>
      </div>
    </Modal>
  );
}

export default function Budget() {
  const { budgets, transactions, setBudgetForCat, deleteBudget } = useFinance();
  const [toasts, showToast] = useToast();
  const [showModal, setShowModal] = useState(false);

  const mTxs = txThisMonth(transactions);
  const catSpend = {};
  mTxs.filter(t => t.type==='expense').forEach(t => { catSpend[t.cat] = (catSpend[t.cat]||0) + t.amount; });

  const onSave = (cat, amount) => { setBudgetForCat(cat, amount); showToast(`Budget set for ${cat}`, 'success'); };
  const onDel  = (cat) => { if(window.confirm(`Remove budget for ${cat}?`)) { deleteBudget(cat); showToast('Budget removed','info'); } };

  // Recommendations
  const recs = [];
  EXPENSE_CATS.forEach(cat => {
    const spent = catSpend[cat] || 0;
    if (spent > 0 && !budgets[cat]) recs.push({ type:'tip', icon:'fas fa-plus-circle', title:`Set a budget for ${cat}`, desc:`You spent ${fmt(spent)} this month but have no limit set.` });
    if (budgets[cat] && spent > budgets[cat]) recs.push({ type:'warn', icon:'fas fa-exclamation-triangle', title:`Over budget: ${cat}`, desc:`Spent ${fmt(spent)} of ${fmt(budgets[cat])} limit (${Math.round(spent/budgets[cat]*100)}%).` });
  });

  return (
    <div className="page-enter">
      <ToastContainer toasts={toasts} />
      {showModal && <BudgetModal onClose={() => setShowModal(false)} onSave={onSave} />}

      <div className="page-header">
        <div>
          <div className="page-title">Budget <span>Planner</span></div>
          <div className="page-sub">Set and monitor category spending limits</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus" /> Set Budget
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title"><i className="fas fa-chart-bar" /> Monthly Budgets <div className="title-line" /></div>
          {Object.keys(budgets).length === 0 ? (
            <div className="empty-state" style={{ padding:20 }}>
              <i className="fas fa-wallet" /><p>No budgets yet. Click "Set Budget" to add one.</p>
            </div>
          ) : (
            <div className="budget-list">
              {Object.entries(budgets).map(([cat, limit]) => {
                const spent = catSpend[cat] || 0;
                const pct = Math.min(100, limit>0 ? spent/limit*100 : 0);
                const color = spent>limit ? 'var(--red)' : pct>75 ? 'var(--gold)' : 'var(--green)';
                return (
                  <div key={cat} className="budget-item">
                    <div className="budget-header">
                      <span className="budget-cat">{CAT_ICONS[cat]} {cat}</span>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span className="budget-amounts"><span style={{ color }}>{fmt(spent)}</span> / {fmt(limit)}</span>
                        <button className="btn btn-sm btn-danger" onClick={() => onDel(cat)} style={{ padding:'3px 8px' }}><i className="fas fa-times" /></button>
                      </div>
                    </div>
                    <div className="budget-track"><div className="budget-fill" style={{ width:`${pct}%`, background:color }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-title"><i className="fas fa-chart-pie" /> Budget vs Actual <div className="title-line" /></div>
          <div className="bar-chart">
            {Object.keys(budgets).length === 0 ? (
              <div className="empty-state" style={{ padding:20 }}><i className="fas fa-chart-bar" /><p>Set budgets to see comparison</p></div>
            ) : Object.entries(budgets).map(([cat, limit]) => {
              const spent = catSpend[cat]||0;
              const maxVal = Math.max(spent, limit, 1);
              return (
                <div key={cat} className="bar-item">
                  <div className="bar-meta">
                    <span className="bar-name">{CAT_ICONS[cat]} {cat}</span>
                    <span className="bar-amount">{fmt(spent)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width:`${spent/maxVal*100}%`, background: spent>limit?'var(--red)':'var(--green)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {recs.length > 0 && (
        <div className="card" style={{ marginTop:20 }}>
          <div className="section-title"><i className="fas fa-lightbulb" /> Budget Recommendations <div className="title-line" /></div>
          <div className="insight-list">
            {recs.map((r,i) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${r.type}`}><i className={r.icon} /></div>
                <div><div className="insight-title">{r.title}</div><div className="insight-desc">{r.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
