import { useState } from 'react';
import { useFinance }     from '../hooks/useFinance';
import { useToast }       from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { Modal }          from '../components/ui/Modal';
import { KPICard }        from '../components/dashboard/KPI';
import { DEBT_TYPES, fmt } from '../utils/finance';

// ── ADD / EDIT DEBT MODAL ──
function DebtModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || {
    name: '', type: DEBT_TYPES[0], total: '', paid: '0', rate: '', emi: '', dueDate: ''
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    if (!form.name || !form.total) return;
    onSave({
      ...form,
      total:   parseFloat(form.total)   || 0,
      paid:    parseFloat(form.paid)    || 0,
      rate:    parseFloat(form.rate)    || 0,
      emi:     parseFloat(form.emi)     || 0,
    });
    onClose();
  };
  return (
    <Modal title={initial ? 'Edit Debt' : 'Add Debt / Loan'} onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Debt Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. HDFC Credit Card" />
      </div>
      <div className="form-group">
        <label className="form-label">Type</label>
        <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
          {DEBT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Total Amount (₹) *</label>
          <input className="form-input" type="number" min="0" value={form.total} onChange={e => set('total', e.target.value)} placeholder="100000" />
        </div>
        <div className="form-group">
          <label className="form-label">Amount Paid (₹)</label>
          <input className="form-input" type="number" min="0" value={form.paid} onChange={e => set('paid', e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Interest Rate (%)</label>
          <input className="form-input" type="number" min="0" step="0.1" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="12.5" />
        </div>
        <div className="form-group">
          <label className="form-label">Monthly EMI (₹)</label>
          <input className="form-input" type="number" min="0" value={form.emi} onChange={e => set('emi', e.target.value)} placeholder="5000" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Due Date</label>
        <input className="form-input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary"   style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
          <i className="fas fa-check" /> {initial ? 'Update' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}

// ── MAKE PAYMENT MODAL ──
function PaymentModal({ debt, onClose, onPay }) {
  const [amount, setAmount] = useState(debt.emi || '');
  const remaining = debt.total - debt.paid;
  return (
    <Modal title={`Pay — ${debt.name}`} onClose={onClose}>
      <div style={{ marginBottom: 16, color: 'var(--text2)', fontSize: '0.875rem' }}>
        Remaining: <strong style={{ color: 'var(--text)' }}>{fmt(remaining)}</strong>
      </div>
      <div className="form-group">
        <label className="form-label">Payment Amount (₹)</label>
        <input className="form-input" type="number" min="0" max={remaining} value={amount}
          onChange={e => setAmount(e.target.value)} placeholder={`Max: ${fmt(remaining)}`} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary"   style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { if (!amount) return; onPay(parseFloat(amount)); onClose(); }}>
          <i className="fas fa-check" /> Record Payment
        </button>
      </div>
    </Modal>
  );
}

export default function Debts() {
  const { debts, addDebt, editDebt, deleteDebt } = useFinance();
  const [toasts, showToast] = useToast();
  const [showAdd,   setShowAdd]   = useState(false);
  const [editDebtItem, setEditDebtItem] = useState(null);
  const [payDebtItem,  setPayDebtItem]  = useState(null);
  const [strategy, setStrategy] = useState('avalanche');

  const totalDebt = debts.reduce((s, d) => s + Math.max(0, d.total - d.paid), 0);
  const totalPaid = debts.reduce((s, d) => s + (d.paid || 0), 0);
  const avgRate   = debts.length ? (debts.reduce((s, d) => s + (d.rate || 0), 0) / debts.length).toFixed(1) : 0;

  const onSave = (form) => {
    if (editDebtItem) { editDebt(editDebtItem.id, form); showToast('Debt updated', 'success'); }
    else              { addDebt(form);                    showToast('Debt added!',   'success'); }
    setEditDebtItem(null);
  };

  const onPay = (id, amount) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const newPaid = Math.min(debt.total, (debt.paid || 0) + amount);
    editDebt(id, { paid: newPaid });
    showToast(`Payment of ${fmt(amount)} recorded!`, 'success');
  };

  const onDel = (id) => {
    if (window.confirm('Delete this debt?')) { deleteDebt(id); showToast('Debt removed', 'info'); }
  };

  // Strategy: sort debts for payoff order
  const sortedDebts = [...debts.filter(d => d.total - d.paid > 0)].sort((a, b) =>
    strategy === 'avalanche' ? b.rate - a.rate : (a.total - a.paid) - (b.total - b.paid)
  );

  const strategyPlan = sortedDebts.map((d, i) => ({
    type: i === 0 ? 'bad' : 'tip',
    icon: i === 0 ? 'fas fa-fire' : 'fas fa-arrow-right',
    title: `${i + 1}. ${d.name}`,
    desc: `${fmt(d.total - d.paid)} remaining at ${d.rate}% — ${strategy === 'avalanche'
      ? (i === 0 ? 'Highest rate — pay this first!' : 'Pay minimums here')
      : (i === 0 ? 'Smallest balance — quick win!' : 'Pay minimums here')}`,
  }));

  return (
    <div className="page-enter">
      <ToastContainer toasts={toasts} />

      {(showAdd || editDebtItem) && (
        <DebtModal
          initial={editDebtItem}
          onClose={() => { setShowAdd(false); setEditDebtItem(null); }}
          onSave={onSave}
        />
      )}
      {payDebtItem && (
        <PaymentModal
          debt={payDebtItem}
          onClose={() => setPayDebtItem(null)}
          onPay={(amount) => onPay(payDebtItem.id, amount)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Debt <span>Manager</span></div>
          <div className="page-sub">Track and strategize debt reduction</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <i className="fas fa-plus" /> Add Debt
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KPICard variant="red"   icon="fas fa-credit-card"  label="Total Outstanding" value={fmt(totalDebt)} />
        <KPICard variant="green" icon="fas fa-check-circle" label="Total Paid"         value={fmt(totalPaid)} />
        <KPICard variant="gold"  icon="fas fa-percentage"   label="Avg Interest"       value={`${avgRate}%`} />
      </div>

      <div className="grid-65-35">
        {/* Debt list */}
        <div>
          <div className="section-title"><i className="fas fa-credit-card" /> Active Debts <div className="title-line" /></div>
          <div className="debt-grid">
            {debts.length === 0 ? (
              <div className="empty-state"><i className="fas fa-credit-card" /><p>No debts added. Great financial health!</p></div>
            ) : debts.map(d => {
              const remaining = d.total - d.paid;
              const pct       = d.total > 0 ? Math.min(100, (d.paid / d.total) * 100) : 0;
              return (
                <div key={d.id} className="debt-card">
                  <div className="debt-header">
                    <div>
                      <div className="debt-name">{d.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 2 }}>{d.type}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="debt-type">{d.rate}% APR</span>
                      <button className="btn btn-sm btn-secondary" onClick={() => { setEditDebtItem(d); }}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDel(d.id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                  <div className="debt-amounts">
                    <div className="debt-stat">
                      <div className="debt-stat-label">Total</div>
                      <div className="debt-stat-val">{fmt(d.total)}</div>
                    </div>
                    <div className="debt-stat">
                      <div className="debt-stat-label">Remaining</div>
                      <div className="debt-stat-val" style={{ color: 'var(--red)' }}>{fmt(remaining)}</div>
                    </div>
                    <div className="debt-stat">
                      <div className="debt-stat-label">EMI</div>
                      <div className="debt-stat-val">{d.emi ? fmt(d.emi) : '—'}</div>
                    </div>
                  </div>
                  <div className="debt-prog-label">
                    <span>Progress</span><span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="debt-prog-track">
                    <div className="debt-prog-fill" style={{ width: `${pct}%` }} />
                  </div>
                  {remaining > 0 && (
                    <button className="btn btn-sm btn-secondary" style={{ marginTop: 12 }}
                      onClick={() => setPayDebtItem(d)}>
                      <i className="fas fa-rupee-sign" /> Record Payment
                    </button>
                  )}
                  {remaining <= 0 && (
                    <div style={{ marginTop: 10, color: 'var(--green)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <i className="fas fa-check-circle" /> Fully Paid!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategy */}
        <div className="card">
          <div className="section-title"><i className="fas fa-chess" /> Payoff Strategy <div className="title-line" /></div>
          <div className="strategy-grid">
            <div className={`strategy-card${strategy === 'avalanche' ? ' selected' : ''}`} onClick={() => setStrategy('avalanche')}>
              <div className="strategy-card-title">🏔 Avalanche</div>
              <div className="strategy-card-desc">Pay highest-interest debt first. Saves the most money long-term.</div>
            </div>
            <div className={`strategy-card${strategy === 'snowball' ? ' selected' : ''}`} onClick={() => setStrategy('snowball')}>
              <div className="strategy-card-title">⛄ Snowball</div>
              <div className="strategy-card-desc">Pay smallest balance first. Builds momentum with quick wins.</div>
            </div>
          </div>
          <div className="insight-list">
            {sortedDebts.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <i className="fas fa-chess" /><p>Add debts to generate a payoff plan</p>
              </div>
            ) : strategyPlan.map((s, i) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${s.type}`}><i className={s.icon} /></div>
                <div><div className="insight-title">{s.title}</div><div className="insight-desc">{s.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
