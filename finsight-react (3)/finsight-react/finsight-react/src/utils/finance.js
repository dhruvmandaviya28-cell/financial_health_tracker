// ── CATEGORY CONFIG ──────────────────────────────────────────────
export const CAT_COLORS = {
  'Food & Dining':    '#f59e0b',
  'Transportation':   '#60a5fa',
  'Shopping':         '#a78bfa',
  'Entertainment':    '#ec4899',
  'Health & Medical': '#10b981',
  'Utilities':        '#6ee7b7',
  'Education':        '#fbbf24',
  'Housing':          '#f97316',
  'Salary':           '#34d399',
  'Freelance':        '#4ade80',
  'Investment':       '#d4af37',
  'Business':         '#22d3ee',
  'Other':            '#94a3b8',
};

export const CAT_ICONS = {
  'Food & Dining':    '',
  'Transportation':   '',
  'Shopping':         '',
  'Entertainment':    '',
  'Health & Medical': '',
  'Utilities':        '',
  'Education':        '',
  'Housing':          '',
  'Salary':           '',
  'Freelance':        '',
  'Investment':       '',
  'Business':         '',
  'Other':            '',
};

export const EXPENSE_CATS = [
  'Food & Dining','Transportation','Shopping','Entertainment',
  'Health & Medical','Utilities','Education','Housing','Other',
];

export const INCOME_CATS = ['Salary','Freelance','Investment','Business','Other'];

export const DEBT_TYPES = ['Credit Card','Personal Loan','Home Loan','Car Loan','Education Loan','Other'];

// ── FORMAT HELPERS ────────────────────────────────────────────────
/** Format a number as Indian Rupees */
export function fmt(n) {
  if (n === undefined || n === null) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
}

/** Today's date as YYYY-MM-DD */
export function today() {
  return new Date().toISOString().split('T')[0];
}

/** Current month as YYYY-MM */
export function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Filter transactions to current month */
export function txThisMonth(txs) {
  const m = thisMonth();
  return txs.filter(t => t.date && t.date.startsWith(m));
}

/** Simple UID generator */
export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/** Simple (non-crypto) password hash */
export function hashPass(p) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = (Math.imul(31, h) + p.charCodeAt(i)) | 0;
  return h.toString(16) + p.length;
}

// ── FINANCIAL HEALTH SCORE ────────────────────────────────────────
/**
 * Calculates a 0–100 financial health score from state data.
 * @param {object} params - { transactions, budgets, debts, goals, profile }
 * @returns {{ score, grade, color, desc, breakdown }}
 */
export function calcHealthScore({ transactions = [], budgets = {}, debts = [], goals = [], profile = {} }) {
  const mTxs   = txThisMonth(transactions);
  const income  = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  let score = 50;
  const breakdown = [];

  // Savings rate (max 25 pts)
  const savRate = income > 0 ? (income - expenses) / income : 0;
  const savPts  = Math.min(25, Math.round(savRate * 100 * 0.25));
  breakdown.push({ label: 'Savings Rate', value: savPts, max: 25, desc: `${Math.round(savRate * 100)}% of income saved` });
  score = savPts + 25; // reset base

  // Budget adherence (max 20 pts)
  const budCats = Object.keys(budgets);
  let budPts = 10;
  if (budCats.length > 0) {
    const catSpend = {};
    mTxs.filter(t => t.type === 'expense').forEach(t => { catSpend[t.cat] = (catSpend[t.cat] || 0) + t.amount; });
    const overBudget = budCats.filter(c => (catSpend[c] || 0) > (budgets[c] || 0)).length;
    budPts = Math.max(0, 20 - overBudget * 5);
  }
  breakdown.push({ label: 'Budget Adherence', value: budPts, max: 20, desc: `${budCats.length} budget(s) set` });
  score += budPts;

  // Debt management (max 20 pts)
  const totalDebt = debts.reduce((s, d) => s + (d.total - d.paid), 0);
  const debtRatio  = income > 0 ? (totalDebt / (income * 12)) : 0;
  const debtPts    = debts.length === 0 ? 20 : Math.max(0, Math.round(20 - debtRatio * 10));
  breakdown.push({ label: 'Debt Management', value: debtPts, max: 20, desc: debts.length === 0 ? 'No debts' : `₹${totalDebt.toLocaleString('en-IN')} outstanding` });
  score += debtPts;

  // Goal progress (max 15 pts)
  const goalPts = goals.length === 0 ? 5 : Math.min(15, goals.length * 3 + goals.filter(g => g.current >= g.target).length * 3);
  breakdown.push({ label: 'Goal Progress', value: goalPts, max: 15, desc: `${goals.length} goal(s)` });
  score += goalPts;

  // Emergency fund (max 10 pts — basic heuristic)
  const monthlyExpenses = expenses || (profile.income || 0) * 0.7;
  const savingsGoal     = goals.find(g => g.name?.toLowerCase().includes('emergency'));
  const efPts           = savingsGoal && savingsGoal.current >= monthlyExpenses * 3 ? 10 : savingsGoal ? 5 : 2;
  breakdown.push({ label: 'Emergency Fund', value: efPts, max: 10, desc: savingsGoal ? `₹${savingsGoal.current.toLocaleString('en-IN')} saved` : 'Not started' });
  score += efPts;

  score = Math.min(100, Math.max(0, score));

  const grade =
    score >= 85 ? 'Excellent' :
    score >= 70 ? 'Good'      :
    score >= 55 ? 'Fair'      :
    score >= 40 ? 'Poor'      : 'Critical';

  const color =
    score >= 85 ? '#10b981' :
    score >= 70 ? '#d4af37' :
    score >= 55 ? '#f59e0b' : '#ef4444';

  const desc =
    score >= 85 ? 'Your finances are in excellent shape. Keep up the great work!' :
    score >= 70 ? 'Good financial health. A few tweaks and you\'ll be excellent.' :
    score >= 55 ? 'Room for improvement — focus on savings and debt reduction.' :
    'Financial health needs attention. Start with a budget today.';

  return { score, grade, color, desc, breakdown };
}

// ── AI INSIGHTS GENERATOR ─────────────────────────────────────────
export function generateLocalInsights({ transactions, budgets, debts, goals, profile }) {
  const insights = [];
  const mTxs    = txThisMonth(transactions);
  const income   = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savRate  = income > 0 ? ((income - expenses) / income) : 0;

  if (savRate < 0.1 && income > 0) {
    insights.push({ type: 'bad', icon: 'fas fa-exclamation-triangle', title: 'Low Savings Rate', desc: `You're saving only ${Math.round(savRate * 100)}% of income. Target 20% to build financial security.` });
  } else if (savRate >= 0.2) {
    insights.push({ type: 'good', icon: 'fas fa-star', title: 'Great Savings Rate!', desc: `${Math.round(savRate * 100)}% savings rate — well above the 20% benchmark!` });
  }

  // Over-budget categories
  const catSpend = {};
  mTxs.filter(t => t.type === 'expense').forEach(t => { catSpend[t.cat] = (catSpend[t.cat] || 0) + t.amount; });
  Object.keys(budgets).forEach(cat => {
    if ((catSpend[cat] || 0) > (budgets[cat] || 0)) {
      insights.push({ type: 'warn', icon: 'fas fa-wallet', title: `Over Budget: ${cat}`, desc: `Spent ${fmt(catSpend[cat])} vs budget of ${fmt(budgets[cat])}` });
    }
  });

  // High-interest debt
  const hiDebt = debts.filter(d => d.rate > 15 && (d.total - d.paid) > 0);
  if (hiDebt.length > 0) {
    insights.push({ type: 'bad', icon: 'fas fa-credit-card', title: 'High-Interest Debt Alert', desc: `You have ${hiDebt.length} debt(s) over 15% APR. Prioritize paying these off.` });
  }

  if (goals.length === 0) {
    insights.push({ type: 'tip', icon: 'fas fa-bullseye', title: 'Goals missing', desc: 'Set up clear goals to stay on track.' });
  }

  if (transactions.length === 0) {
    insights.push({ type: 'tip', icon: 'fas fa-plus-circle', title: 'No tracking data', desc: 'Add transactions to see analysis.' });
  }

  return insights;
}
