// ── Category metadata ──────────────────────────────────────────
export const CAT_COLORS = {
  'Food & Dining':   '#f59e0b',
  'Transportation':  '#60a5fa',
  'Shopping':        '#a78bfa',
  'Entertainment':   '#ec4899',
  'Health & Medical':'#10b981',
  'Utilities':       '#6ee7b7',
  'Education':       '#fbbf24',
  'Housing':         '#f97316',
  'Salary':          '#34d399',
  'Freelance':       '#4ade80',
  'Investment':      '#d4af37',
  'Business':        '#22d3ee',
  'Other':           '#94a3b8',
};

export const CAT_ICONS = {
  'Food & Dining':   '🍽',
  'Transportation':  '🚗',
  'Shopping':        '🛍',
  'Entertainment':   '🎬',
  'Health & Medical':'💊',
  'Utilities':       '⚡',
  'Education':       '📚',
  'Housing':         '🏠',
  'Salary':          '💼',
  'Freelance':       '💻',
  'Investment':      '📈',
  'Business':        '🏢',
  'Other':           '📦',
};

export const EXPENSE_CATS = [
  'Food & Dining','Transportation','Shopping','Entertainment',
  'Health & Medical','Utilities','Education','Housing','Other',
];

export const INCOME_CATS = ['Salary','Freelance','Investment','Business','Other'];

export const ALL_CATS = [...new Set([...EXPENSE_CATS, ...INCOME_CATS])];

export const DEBT_TYPES = [
  'Credit Card','Personal Loan','Home Loan','Car Loan','Student Loan','Other',
];

export const GOAL_CATS = [
  'Emergency Fund','Vacation','Home Purchase','Car','Wedding','Education','Retirement','Other',
];

// ── Formatting helpers ─────────────────────────────────────────
export const fmt = (n) =>
  '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const fmtSigned = (n) =>
  (n >= 0 ? '+' : '-') + '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const today = () => new Date().toISOString().split('T')[0];

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// Simple password hash (matches original)
export function hashPass(p) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = (Math.imul(31, h) + p.charCodeAt(i)) | 0;
  return h.toString(16) + p.length;
}

// ── Date helpers ───────────────────────────────────────────────
export function txThisMonth(txs) {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return txs.filter((t) => t.date?.startsWith(prefix));
}

// ── Health score calculation ───────────────────────────────────
export function calcHealthScore(txs, budgets, debts, goals) {
  let score = 0;
  const mTxs = txThisMonth(txs);
  const income   = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // 1. Savings rate (max 30)
  if (income > 0) {
    const rate = (income - expenses) / income;
    score += rate >= 0.3 ? 30 : rate >= 0.2 ? 25 : rate >= 0.1 ? 15 : rate >= 0 ? 8 : 0;
  } else {
    score += 10;
  }

  // 2. Budget adherence (max 25)
  const cats = Object.keys(budgets);
  if (cats.length > 0) {
    const over = cats.filter(c => {
      const spent = mTxs.filter(t => t.type === 'expense' && t.cat === c)
                        .reduce((s, t) => s + t.amount, 0);
      return budgets[c] > 0 && spent > budgets[c];
    });
    score += Math.round((1 - over.length / cats.length) * 25);
  } else {
    score += 12;
  }

  // 3. Debt-to-income (max 25)
  const totalDebt = debts.reduce((s, d) => s + (d.total - d.paid), 0);
  if (income > 0) {
    const dti = totalDebt / (income * 12);
    score += dti < 0.2 ? 25 : dti < 0.4 ? 18 : dti < 0.6 ? 10 : 3;
  } else {
    score += debts.length === 0 ? 20 : 5;
  }

  // 4. Goal progress (max 20)
  if (goals.length > 0) {
    const avg = goals.reduce((s, g) => s + (g.target > 0 ? Math.min(1, g.current / g.target) : 0), 0) / goals.length;
    score += Math.round(avg * 20);
  } else {
    score += 10;
  }

  score = Math.min(100, Math.max(0, score));

  const grade =
    score >= 80 ? 'Excellent' :
    score >= 65 ? 'Good' :
    score >= 50 ? 'Fair' :
    score >= 35 ? 'Poor' : 'Critical';

  const color =
    score >= 80 ? '#10b981' :
    score >= 65 ? '#60a5fa' :
    score >= 50 ? '#d4af37' :
    score >= 35 ? '#f59e0b' : '#ef4444';

  return { score, grade, color };
}
