import { useState }      from 'react';
import { useFinance }    from '../hooks/useFinance';
import { useToast }      from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { calcHealthScore, generateLocalInsights, txThisMonth, fmt } from '../utils/finance';

export default function Insights() {
  const finance = useFinance();
  const { transactions, budgets, debts, goals, profile } = finance;
  const [toasts, showToast] = useToast();
  const [loading,   setLoading]   = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const localInsights = generateLocalInsights({ transactions, budgets, debts, goals, profile });
  const { score, grade } = calcHealthScore({ transactions, budgets, debts, goals, profile });

  const mTxs    = txThisMonth(transactions);
  const income  = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Build context summary for the AI
  const catSpend = {};
  mTxs.filter(t => t.type === 'expense').forEach(t => { catSpend[t.cat] = (catSpend[t.cat]||0) + t.amount; });
  const topCats = Object.entries(catSpend).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k} ${fmt(v)}`).join(', ') || 'None';

  const generateInsights = async () => {
    setLoading(true);
    setAiInsights([]);

    const sysPrompt = `You are FinSight Assistant, an expert personal financial advisor. The user has shared their real financial data. Generate 5 specific, actionable insights. Return ONLY a JSON array with objects: {type, icon, title, desc}. Types: good, warn, bad, tip. Icons use Font Awesome class strings like "fas fa-lightbulb". Be concise (1-2 sentences per desc).`;
    const userMsg   = `Financial snapshot:
- Monthly Income: ${fmt(income)}, Expenses: ${fmt(expenses)}, Savings: ${fmt(income-expenses)}
- Health Score: ${score}/100 (${grade})
- Active Debts: ${debts.length}, total outstanding: ${fmt(debts.reduce((s,d)=>s+(d.total-d.paid),0))}
- Savings Goals: ${goals.length}
- Top expense categories: ${topCats}
Generate 5 personalised financial insights.`;

    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system:     sysPrompt,
          messages:   [{ role: 'user', content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '[]';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAiInsights(Array.isArray(parsed) ? parsed : []);
      showToast('Analysis complete!', 'success');
    } catch (e) {
      // Fallback
      setAiInsights(localInsights);
      showToast('Using local analysis', 'info');
    } finally {
      setLoading(false);
      setHasGenerated(true);
    }
  };

  const displayed = hasGenerated ? (aiInsights.length ? aiInsights : localInsights) : localInsights;

  return (
    <div className="page-enter">
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <div className="page-title">Personal <span>Insights</span></div>
          <div className="page-sub">Automated financial analysis</div>
        </div>
        <button className="btn btn-primary" onClick={generateInsights} disabled={loading}>
          {loading
            ? <><i className="fas fa-spinner" style={{ animation:'spin 1s linear infinite' }} /> Analysing…</>
            : <><i className="fas fa-sync" /> Generate Analysis</>}
        </button>
      </div>

      {/* Banner */}
      <div className="report-banner">
        <div className="report-banner-icon"><i className="fas fa-chart-bar" /></div>
        <div>
          <div style={{ fontWeight:600, fontSize:'1rem', marginBottom:4 }}>Automated Financial Analysis</div>
          <div style={{ fontSize:'0.85rem', color:'var(--text2)' }}>
            Click "Generate Analysis" for personalised insights based on your data — spending patterns, savings opportunities, and debt reduction strategies.
          </div>
        </div>
      </div>

      {/* Insights list */}
      <div className="insight-list">
        {displayed.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-lightbulb" />
            <p>Click "Generate Analysis" to get your personalised financial insights</p>
          </div>
        ) : displayed.map((ins, i) => (
          <div key={i} className="insight-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`insight-icon ${ins.type}`}><i className={ins.icon} /></div>
            <div>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-desc">{ins.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
