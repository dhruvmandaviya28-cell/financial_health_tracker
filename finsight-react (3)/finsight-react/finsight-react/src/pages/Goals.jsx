import { useState } from 'react';
import { useFinance }     from '../hooks/useFinance';
import { useToast }       from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { Modal }          from '../components/ui/Modal';
import { KPICard }        from '../components/dashboard/KPI';
import { fmt }            from '../utils/finance';

const GOAL_EMOJIS = ['🏠','🚗','✈️','💍','🎓','💻','🏖','📱','🏋️','💰','🎯','⭐'];

function GoalModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || {
    name: '', target: '', current: '0', deadline: '', emoji: '🎯', notes: ''
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    if (!form.name || !form.target) return;
    onSave({ ...form, target: parseFloat(form.target) || 0, current: parseFloat(form.current) || 0 });
    onClose();
  };
  return (
    <Modal title={initial ? 'Edit Goal' : 'Add Savings Goal'} onClose={onClose}>
      <div className="form-group">
        <label className="form-label">Goal Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Emergency Fund" />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="form-label">Icon</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          {GOAL_EMOJIS.map(em => (
            <button key={em} onClick={() => set('emoji', em)}
              style={{ fontSize: '1.2rem', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: form.emoji === em ? 'rgba(212,175,55,0.15)' : 'var(--card)',
                border: form.emoji === em ? '1px solid var(--border-bright)' : '1px solid var(--border)' }}>
              {em}
            </button>
          ))}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Target Amount (₹) *</label>
          <input className="form-input" type="number" min="0" value={form.target} onChange={e => set('target', e.target.value)} placeholder="100000" />
        </div>
        <div className="form-group">
          <label className="form-label">Already Saved (₹)</label>
          <input className="form-input" type="number" min="0" value={form.current} onChange={e => set('current', e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Target Date</label>
        <input className="form-input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary"   style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>
          <i className="fas fa-check" /> {initial ? 'Update' : 'Save Goal'}
        </button>
      </div>
    </Modal>
  );
}

function ContributeModal({ goal, onClose, onContribute }) {
  const [amount, setAmount] = useState('');
  const remaining = goal.target - goal.current;
  return (
    <Modal title={`Contribute — ${goal.name}`} onClose={onClose}>
      <div style={{ marginBottom: 16, color: 'var(--text2)', fontSize: '0.875rem' }}>
        Still needed: <strong style={{ color: 'var(--text)' }}>{fmt(remaining)}</strong>
      </div>
      <div className="form-group">
        <label className="form-label">Add Amount (₹)</label>
        <input className="form-input" type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Max: ${fmt(remaining)}`} />
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary"   style={{ flex:1, justifyContent:'center' }}
          onClick={() => { if (!amount) return; onContribute(parseFloat(amount)); onClose(); }}>
          <i className="fas fa-plus" /> Add Savings
        </button>
      </div>
    </Modal>
  );
}

export default function Goals() {
  const { goals, addGoal, editGoal, deleteGoal } = useFinance();
  const [toasts, showToast] = useToast();
  const [showAdd,       setShowAdd]       = useState(false);
  const [editGoalItem,  setEditGoalItem]  = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);

  const completed = goals.filter(g => g.current >= g.target);
  const totalSaved = goals.reduce((s, g) => s + (g.current || 0), 0);

  const onSave = (form) => {
    if (editGoalItem) { editGoal(editGoalItem.id, form); showToast('Goal updated','success'); }
    else              { addGoal(form);                    showToast('Goal added!','success');  }
    setEditGoalItem(null);
  };

  const onContribute = (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newAmt = Math.min(goal.target, goal.current + amount);
    editGoal(id, { current: newAmt });
    if (newAmt >= goal.target) showToast(`Goal "${goal.name}" completed!`, 'success');
    else showToast(`₹${amount.toLocaleString('en-IN')} added to ${goal.name}`, 'success');
  };

  const onDel = (id) => {
    if (window.confirm('Delete this goal?')) { deleteGoal(id); showToast('Goal removed', 'info'); }
  };

  return (
    <div className="page-enter">
      <ToastContainer toasts={toasts} />

      {(showAdd || editGoalItem) && (
        <GoalModal
          initial={editGoalItem}
          onClose={() => { setShowAdd(false); setEditGoalItem(null); }}
          onSave={onSave}
        />
      )}
      {contributeGoal && (
        <ContributeModal
          goal={contributeGoal}
          onClose={() => setContributeGoal(null)}
          onContribute={(amt) => onContribute(contributeGoal.id, amt)}
        />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Savings <span>Goals</span></div>
          <div className="page-sub">Work towards your financial milestones</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <i className="fas fa-plus" /> Add Goal
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KPICard variant="gold"  icon="fas fa-bullseye"   label="Total Goals"  value={goals.length} />
        <KPICard variant="green" icon="fas fa-check"      label="Completed"    value={completed.length} />
        <KPICard variant="blue"  icon="fas fa-piggy-bank" label="Total Saved"  value={fmt(totalSaved)} />
      </div>

      <div className="goal-grid">
        {goals.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bullseye" />
            <p>No goals yet. Set your first financial goal to get started!</p>
          </div>
        ) : goals.map(g => {
          const pct       = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
          const remaining = Math.max(0, g.target - g.current);
          const done      = g.current >= g.target;
          // Days left
          let daysLeft = null;
          if (g.deadline) {
            const diff = (new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24);
            daysLeft   = Math.ceil(diff);
          }
          return (
            <div key={g.id} className="goal-card">
              <div className="goal-header">
                <div className="goal-name">{g.emoji || '🎯'} {g.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="goal-pct">{pct.toFixed(0)}%</span>
                  {done && <span style={{ color: 'var(--green)', fontSize: '0.75rem', fontWeight: 600 }}>✅ Done!</span>}
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditGoalItem(g)}><i className="fas fa-edit" /></button>
                  <button className="btn btn-sm btn-danger"    onClick={() => onDel(g.id)}><i className="fas fa-trash" /></button>
                </div>
              </div>

              <div className="goal-row">
                <div>
                  <div className="goal-stat-label">Saved</div>
                  <div className="goal-stat-val" style={{ color: 'var(--green)' }}>{fmt(g.current)}</div>
                </div>
                <div>
                  <div className="goal-stat-label">Target</div>
                  <div className="goal-stat-val">{fmt(g.target)}</div>
                </div>
                <div>
                  <div className="goal-stat-label">Remaining</div>
                  <div className="goal-stat-val" style={{ color: 'var(--text2)' }}>{fmt(remaining)}</div>
                </div>
                {daysLeft !== null && (
                  <div>
                    <div className="goal-stat-label">Days Left</div>
                    <div className="goal-stat-val" style={{ color: daysLeft < 30 ? 'var(--red)' : 'var(--text)' }}>
                      {daysLeft > 0 ? daysLeft : 'Overdue'}
                    </div>
                  </div>
                )}
              </div>

              <div className="goal-prog-track">
                <div className="goal-prog-fill" style={{ width: `${pct}%` }} />
              </div>

              {g.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 8 }}>{g.notes}</div>}

              {!done && (
                <button className="btn btn-sm btn-secondary" style={{ marginTop: 12 }}
                  onClick={() => setContributeGoal(g)}>
                  <i className="fas fa-plus" /> Add Savings
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
