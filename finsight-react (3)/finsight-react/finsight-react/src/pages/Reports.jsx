import { useState, useEffect, useRef, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { CAT_COLORS, CAT_ICONS, fmt } from '../utils/finance';
import { KPICard } from '../components/dashboard/KPI';

// Canvas trend chart (6-month line chart)
function TrendChart({ transactions }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    const incomeData = months.map(m => transactions.filter(t=>t.date?.startsWith(m)&&t.type==='income').reduce((s,t)=>s+t.amount,0));
    const expData    = months.map(m => transactions.filter(t=>t.date?.startsWith(m)&&t.type==='expense').reduce((s,t)=>s+t.amount,0));
    const labels     = months.map(m => { const [y,mo]=m.split('-'); return new Date(+y,+mo-1).toLocaleDateString('en-IN',{month:'short'}); });
    const maxVal     = Math.max(...incomeData, ...expData, 1);
    const W = canvas.offsetWidth || 600, H = 90;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    const pad = 24, cw = W - pad * 2, ch = H - 20;

    const drawLine = (data, color) => {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      data.forEach((v, i) => {
        const x = pad + i * (cw / (data.length - 1) || cw);
        const y = (H - 20) - (v / maxVal * ch);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      data.forEach((v, i) => {
        const x = pad + i * (cw / (data.length - 1) || cw);
        const y = (H - 20) - (v / maxVal * ch);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2);
        ctx.fillStyle = color; ctx.fill();
      });
    };

    drawLine(incomeData, '#10b981');
    drawLine(expData,    '#ef4444');

    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '10px DM Sans';
    labels.forEach((l, i) => {
      const x = pad + i * (cw / (labels.length - 1) || cw);
      ctx.fillText(l, x - 10, H - 2);
    });
  }, [transactions]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 90 }} />
      <div style={{ display:'flex', gap:16, marginTop:10, fontSize:'0.78rem' }}>
        <span style={{ color:'var(--green)', display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:12, height:3, background:'var(--green)', display:'inline-block', borderRadius:2 }} /> Income
        </span>
        <span style={{ color:'var(--red)', display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:12, height:3, background:'var(--red)', display:'inline-block', borderRadius:2 }} /> Expenses
        </span>
      </div>
    </div>
  );
}

export default function Reports() {
  const { transactions } = useFinance();

  // Build list of available months
  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date?.slice(0,7)).filter(Boolean));
    const arr = [...set].sort().reverse();
    // Ensure current month is always first option
    const cur = new Date();
    const cm  = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}`;
    if (!arr.includes(cm)) arr.unshift(cm);
    return arr;
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  const mTxs     = transactions.filter(t => t.date?.startsWith(selectedMonth));
  const income   = mTxs.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expenses = mTxs.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const savings  = income - expenses;
  const savRate  = income > 0 ? ((savings/income)*100).toFixed(0) : 0;

  // Category breakdown
  const catSpend = {};
  mTxs.filter(t=>t.type==='expense').forEach(t=>{ catSpend[t.cat]=(catSpend[t.cat]||0)+t.amount; });
  const catEntries = Object.entries(catSpend).sort((a,b)=>b[1]-a[1]);
  const maxCat     = catEntries[0]?.[1] || 1;

  const topExpenses = [...mTxs.filter(t=>t.type==='expense')].sort((a,b)=>b.amount-a.amount).slice(0,6);

  const monthLabel = (m) => {
    const [y, mo] = m.split('-');
    return new Date(+y, +mo-1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Financial <span>Reports</span></div>
          <div className="page-sub">Monthly summaries and trend analysis</div>
        </div>
        <select className="form-select" style={{ width:180 }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPICard variant="green"  icon="fas fa-arrow-down"  label="Income"       value={fmt(income)} />
        <KPICard variant="red"    icon="fas fa-arrow-up"    label="Expenses"     value={fmt(expenses)} />
        <KPICard variant="blue"   icon="fas fa-piggy-bank"  label="Net Savings"  value={fmt(savings)} />
        <KPICard variant="gold"   icon="fas fa-percentage"  label="Savings Rate" value={`${savRate}%`} />
      </div>

      {/* Category + Top Expenses */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title"><i className="fas fa-chart-bar" /> Category Breakdown <div className="title-line" /></div>
          <div className="bar-chart">
            {catEntries.length === 0 ? (
              <div className="empty-state" style={{ padding:20 }}>
                <i className="fas fa-chart-bar" /><p>No expense data for this period</p>
              </div>
            ) : catEntries.map(([cat, val]) => (
              <div key={cat} className="bar-item">
                <div className="bar-meta">
                  <span className="bar-name">{CAT_ICONS[cat]||'📦'} {cat}</span>
                  <span className="bar-amount">{fmt(val)}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width:`${(val/maxCat)*100}%`, background:CAT_COLORS[cat]||'#888' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title"><i className="fas fa-list" /> Top Expenses <div className="title-line" /></div>
          {topExpenses.length === 0 ? (
            <div className="empty-state" style={{ padding:20 }}><i className="fas fa-receipt" /><p>No expenses for this period</p></div>
          ) : (
            <div className="tx-list">
              {topExpenses.map(tx => (
                <div key={tx.id} className="tx-item">
                  <div className="tx-icon" style={{ background:`${CAT_COLORS[tx.cat]||'#888'}22`, color:CAT_COLORS[tx.cat]||'#888' }}>
                    {CAT_ICONS[tx.cat]||'📦'}
                  </div>
                  <div className="tx-info">
                    <div className="tx-name">{tx.desc}</div>
                    <div className="tx-meta">{tx.cat} · {tx.date}</div>
                  </div>
                  <div className="tx-amount expense">-{fmt(tx.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend chart */}
      <div className="card" style={{ marginTop:20 }}>
        <div className="section-title"><i className="fas fa-chart-line" /> Spending Trends — Last 6 Months <div className="title-line" /></div>
        <TrendChart transactions={transactions} />
      </div>
    </div>
  );
}
