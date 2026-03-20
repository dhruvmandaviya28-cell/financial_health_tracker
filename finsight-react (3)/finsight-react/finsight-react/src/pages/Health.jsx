import { useFinance }  from '../hooks/useFinance';
import { calcHealthScore, generateLocalInsights, fmt, txThisMonth } from '../utils/finance';
import { useEffect, useRef } from 'react';

// Animated score ring
function ScoreRing({ score, color }) {
  const circ   = 2 * Math.PI * 60; // r=60
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-container">
      <svg className="score-ring-svg" viewBox="0 0 150 150" width="160" height="160">
        <circle className="score-ring-bg"   cx="75" cy="75" r="60" />
        <circle className="score-ring-fill" cx="75" cy="75" r="60"
          stroke={color} strokeDashoffset={offset} />
      </svg>
      <div className="score-ring-text">
        <div className="score-number" style={{ color }}>{score || '—'}</div>
        <div className="score-label">/ 100</div>
      </div>
    </div>
  );
}

export default function Health() {
  const { transactions, budgets, debts, goals, profile } = useFinance();
  const { score, grade, color, desc, breakdown } = calcHealthScore({ transactions, budgets, debts, goals, profile });

  const mTxs     = txThisMonth(transactions);
  const income   = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Risk factors
  const risks = [];
  if (income > 0 && (income - expenses) / income < 0.1) risks.push({ type:'bad', icon:'fas fa-exclamation-triangle', title:'Low Savings Rate', desc:`Saving less than 10% of income. Aim for 20%+.` });
  if (debts.filter(d => d.rate > 20).length > 0)        risks.push({ type:'bad', icon:'fas fa-fire', title:'High-Interest Debt', desc:'You have debt above 20% APR — prioritize paying these off.' });
  if (Object.keys(budgets).length === 0)                risks.push({ type:'warn', icon:'fas fa-wallet', title:'No Budget Set', desc:'Create category budgets to control your spending.' });
  if (goals.length === 0)                               risks.push({ type:'warn', icon:'fas fa-bullseye', title:'No Savings Goals', desc:'Set at least one goal to stay financially motivated.' });
  if (risks.length === 0)                               risks.push({ type:'good', icon:'fas fa-shield-alt', title:'No Critical Risks', desc:'Your finances look healthy! Keep maintaining good habits.' });

  // Action plan
  const actions = [
    ...(income === 0 ? [{ type:'tip', icon:'fas fa-plus', title:'Start Tracking Income', desc:'Add your salary or other income sources to get started.' }] : []),
    ...(Object.keys(budgets).length === 0 ? [{ type:'tip', icon:'fas fa-wallet', title:'Set Category Budgets', desc:'Use the Budget page to set monthly spending limits per category.' }] : []),
    ...(goals.length === 0 ? [{ type:'tip', icon:'fas fa-bullseye', title:'Create a Savings Goal', desc:'Even a small goal like an emergency fund improves your score.' }] : []),
    ...(score < 70 ? [{ type:'warn', icon:'fas fa-arrow-up', title:'Boost Your Score', desc:'Focus on: reducing discretionary spending, paying high-interest debt, and increasing savings rate.' }] : []),
    ...(score >= 85 ? [{ type:'good', icon:'fas fa-star', title:'Excellent Work!', desc:'You\'re in great financial shape. Consider investing surplus savings.' }] : []),
  ];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Financial <span>Health Score</span></div>
          <div className="page-sub">Your 360° financial wellness report</div>
        </div>
      </div>

      <div className="grid-35-65">
        {/* Score ring */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="section-title" style={{ justifyContent: 'center' }}>
            <i className="fas fa-heartbeat" /> Overall Score
          </div>
          <div className="score-wrap">
            <ScoreRing score={score} color={color} />
            <div className="score-grade" style={{ color }}>{grade || 'Calculating…'}</div>
            <div className="score-desc">{desc}</div>
          </div>
        </div>

        <div>
          {/* Breakdown */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title"><i className="fas fa-chart-bar" /> Score Breakdown <div className="title-line" /></div>
            <div className="bar-chart">
              {breakdown.map(b => (
                <div key={b.label} className="bar-item">
                  <div className="bar-meta">
                    <span className="bar-name">{b.label}</span>
                    <span className="bar-amount">{b.value}/{b.max}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(b.value/b.max)*100}%`, background: b.value/b.max > 0.7 ? 'var(--green)' : b.value/b.max > 0.4 ? 'var(--gold)' : 'var(--red)' }} />
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text3)', marginTop: 3 }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk factors */}
          <div className="card">
            <div className="section-title"><i className="fas fa-exclamation-triangle" /> Risk Factors <div className="title-line" /></div>
            <div className="insight-list">
              {risks.map((r, i) => (
                <div key={i} className="insight-card">
                  <div className={`insight-icon ${r.type}`}><i className={r.icon} /></div>
                  <div><div className="insight-title">{r.title}</div><div className="insight-desc">{r.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action plan */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title"><i className="fas fa-map-signs" /> Personalized Action Plan <div className="title-line" /></div>
        <div className="insight-list">
          {actions.map((a, i) => (
            <div key={i} className="insight-card">
              <div className={`insight-icon ${a.type}`}><i className={a.icon} /></div>
              <div><div className="insight-title">{a.title}</div><div className="insight-desc">{a.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
