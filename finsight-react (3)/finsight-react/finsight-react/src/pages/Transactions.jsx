import { useState, useMemo } from 'react';
import { useFinance }        from '../hooks/useFinance';
import { useToast }          from '../hooks/useToast';
import { TransactionList }   from '../components/dashboard/TransactionList';
import { ToastContainer }    from '../components/ui/Toast';
import { Modal }             from '../components/ui/Modal';
import { CAT_ICONS, EXPENSE_CATS, INCOME_CATS, today, fmt } from '../utils/finance';

function TxModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { desc: '', amount: '', date: today(), type: 'expense', cat: 'Food & Dining', notes: '', tags: '' });
  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;
  const set  = (k, v) => setForm(p => ({ ...p, [k]: v, ...(k==='type'?{cat:v==='income'?'Salary':'Food & Dining'}:{}) }));

  return (
    <Modal title={initial ? 'Edit Transaction' : 'Add Transaction'} onClose={onClose}>
      <div className="type-toggle">
        <button className={`type-btn${form.type==='expense'?' expense-active':''}`} onClick={() => set('type','expense')}><i className="fas fa-arrow-up" /> Expense</button>
        <button className={`type-btn${form.type==='income'?' income-active':''}`}  onClick={() => set('type','income')}><i className="fas fa-arrow-down" /> Income</button>
      </div>
      <div className="form-group">
        <label className="form-label">Description *</label>
        <input className="form-input" value={form.desc} onChange={e => set('desc',e.target.value)} placeholder="e.g. Grocery shopping" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Amount (₹) *</label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount',e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input className="form-input" type="date" value={form.date} onChange={e => set('date',e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select className="form-select" value={form.cat} onChange={e => set('cat',e.target.value)}>
          {cats.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <input className="form-input" value={form.notes} onChange={e => set('notes',e.target.value)} placeholder="Optional" />
      </div>
      <div className="form-group">
        <label className="form-label">Tags</label>
        <input className="form-input" value={form.tags} onChange={e => set('tags',e.target.value)} placeholder="e.g. essential, recurring" />
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button className="btn btn-secondary" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary"   style={{ flex:1, justifyContent:'center' }} onClick={() => { if(!form.desc||!form.amount||!form.date) return; onSave({...form, amount:parseFloat(form.amount)}); onClose(); }}>
          <i className="fas fa-check" /> {initial ? 'Update' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}

export default function Transactions() {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useFinance();
  const [toasts, showToast] = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editTx,    setEditTx]    = useState(null);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType,setFilterType]= useState('');
  const [filterMonth,setFilterMonth] = useState('');

  // Build month options from transactions
  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date?.slice(0,7)).filter(Boolean));
    return [...set].sort().reverse();
  }, [transactions]);

  const allCats = useMemo(() => {
    const set = new Set(transactions.map(t => t.cat).filter(Boolean));
    return [...set].sort();
  }, [transactions]);

  const filtered = useMemo(() => transactions.filter(t => {
    if (search    && !t.desc?.toLowerCase().includes(search.toLowerCase()) && !t.cat?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat  && t.cat  !== filterCat)         return false;
    if (filterType && t.type !== filterType)         return false;
    if (filterMonth && !t.date?.startsWith(filterMonth)) return false;
    return true;
  }), [transactions, search, filterCat, filterType, filterMonth]);

  const onSave = (form) => {
    if (editTx) { editTransaction(editTx.id, form); showToast('Transaction updated','success'); }
    else        { addTransaction(form);              showToast('Transaction added!','success');  }
    setEditTx(null);
  };

  const handleEdit   = (tx) => { setEditTx(tx); setShowModal(true); };
  const handleDelete = (id) => { if (window.confirm('Delete this transaction?')) { deleteTransaction(id); showToast('Deleted','info'); } };

  return (
    <div className="page-enter">
      <ToastContainer toasts={toasts} />
      {(showModal || editTx) && (
        <TxModal initial={editTx} onClose={() => { setShowModal(false); setEditTx(null); }} onSave={onSave} />
      )}

      <div className="page-header">
        <div>
          <div className="page-title">All <span>Transactions</span></div>
          <div className="page-sub">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus" /> Add Transaction
        </button>
      </div>

      <div className="card">
        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
          <input className="form-input" placeholder="Search transactions…" style={{ width:220 }}
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ width:160 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {allCats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width:140 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="form-select" style={{ width:150 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{new Date(m+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th><th>Category</th><th>Type</th><th>Date</th><th>Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>No transactions found</td></tr>
              ) : filtered.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.desc}</td>
                  <td>{CAT_ICONS[tx.cat]} {tx.cat}</td>
                  <td><span style={{ color: tx.type==='income'?'var(--green)':'var(--red)', textTransform:'capitalize' }}>{tx.type}</span></td>
                  <td>{tx.date}</td>
                  <td style={{ fontFamily:'var(--font-mono)', color: tx.type==='income'?'var(--green)':'var(--red)', fontWeight:600 }}>
                    {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(tx)}><i className="fas fa-edit" /></button>
                      <button className="btn btn-sm btn-danger"    onClick={() => handleDelete(tx.id)}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
