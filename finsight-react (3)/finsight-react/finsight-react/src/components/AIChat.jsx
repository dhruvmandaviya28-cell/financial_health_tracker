import { useState, useRef, useEffect } from 'react';
import { useFinance }  from '../hooks/useFinance';
import { useAuth }     from '../hooks/useAuth';
import { calcHealthScore, txThisMonth, fmt } from '../utils/finance';

/**
 * Floating chat assistant — FinSight Assistant.
 * Falls back to local rule-based replies if the API is unavailable.
 */
export function AIChat() {
  const { user }  = useAuth();
  const finance   = useFinance();
  const { transactions, budgets, debts, goals, profile } = finance;

  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your FinSight Assistant. Ask me anything about your finances — budgeting, debt strategy, savings goals, or investment tips!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [history,  setHistory]  = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const mTxs    = txThisMonth(transactions);
  const income  = mTxs.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expenses = mTxs.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const { score, grade } = calcHealthScore({ transactions, budgets, debts, goals, profile });

  const catSpend = {};
  mTxs.filter(t=>t.type==='expense').forEach(t=>{ catSpend[t.cat]=(catSpend[t.cat]||0)+t.amount; });
  const topCats = Object.entries(catSpend).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${k} ${fmt(v)}`).join(', ') || 'None';

  const sysPrompt = `You are FinSight Assistant, a friendly expert personal financial advisor. You have access to the user's real financial data. Be specific, actionable, and encouraging. Keep responses concise (2–4 sentences max unless detailed analysis is requested).

User's Financial Snapshot:
- Name: ${profile?.name || user?.name}
- Monthly Income: ${fmt(income)} | Expenses: ${fmt(expenses)} | Savings: ${fmt(income - expenses)}
- Health Score: ${score}/100 (${grade})
- Active Debts: ${debts.length} (Total: ${fmt(debts.reduce((s,d)=>s+(d.total-d.paid),0))})
- Savings Goals: ${goals.length} (Total saved: ${fmt(goals.reduce((s,g)=>s+(g.current||0),0))})
- Top expense categories this month: ${topCats}`;

  // Rule-based fallback
  const fallback = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes('score') || m.includes('health')) return `Your financial health score is ${score}/100 — ${grade}. ${score < 70 ? 'Focus on increasing savings rate and reducing high-interest debt.' : "You're doing well! Keep maintaining your good habits."}`;
    if (m.includes('debt') || m.includes('loan'))    return debts.length ? `You have ${debts.length} active debt(s). The avalanche method recommends targeting the highest-rate debt first.` : 'No debts recorded. Add your debts in the Debts section for personalised payoff strategies.';
    if (m.includes('save') || m.includes('saving'))  return income > 0 ? `You're saving ${fmt(income-expenses)} this month (${((income-expenses)/income*100).toFixed(0)}% of income). Aim for 20% — that's ${fmt(income*0.2)}.` : 'Add income transactions to track your savings rate.';
    if (m.includes('budget'))   return 'Set category budgets in the Budget section. A good starting point: 50% needs, 30% wants, 20% savings & debt.';
    if (m.includes('goal'))     return goals.length ? `You have ${goals.length} savings goal(s). Keep contributing regularly!` : 'Set financial goals in the Goals section. Start with an emergency fund covering 3–6 months of expenses.';
    if (m.includes('invest'))   return 'For investing: 1) Build a 3–6 month emergency fund, 2) Pay off high-interest debt (>10%), 3) Invest in diversified index funds. Start with ₹500–1000/month.';
    return `Based on your data: income ${fmt(income)}, expenses ${fmt(expenses)}, health score ${score}/100. Ask me about budgeting, saving, debt strategy, or investment advice!`;
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 600,
          system: sysPrompt,
          messages: newHistory.slice(-10),
        }),
      });
      const data  = await res.json();
      const reply = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch {
      const reply = fallback(msg);
      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <>
      {/* Floating action button */}
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="FinSight Assistant">
        <i className={`fas fa-${open ? 'times' : 'comment-dots'}`} />
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-avatar"><i className="fas fa-headset" /></div>
            <div>
              <div className="chat-title">FinSight Assistant</div>
              <div className="chat-status">Online</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask about your finances…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send" onClick={sendMessage} disabled={loading}>
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
