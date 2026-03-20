import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { uid } from '../utils/finance';

// ── FINANCE CONTEXT ───────────────────────────────────────────────
// Provides all financial data scoped to the current user.
// Data is persisted to localStorage under a user-specific key.
export const FinanceContext = createContext(null);

const storeKey = (userId, key) => `fs_${userId}_${key}`;

const load = (userId, key, fallback) => {
  try { return JSON.parse(localStorage.getItem(storeKey(userId, key))) ?? fallback; }
  catch { return fallback; }
};

const save = (userId, key, val) => {
  localStorage.setItem(storeKey(userId, key), JSON.stringify(val));
};

export function FinanceProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [transactions, setTransactions] = useState([]);
  const [budgets,      setBudgets]      = useState({});   // { category: amount }
  const [debts,        setDebts]        = useState([]);
  const [goals,        setGoals]        = useState([]);
  const [profile,      setProfile]      = useState({});

  // Load data when user changes
  useEffect(() => {
    if (!user) return;
    setTransactions(load(user.id, 'txs',     []));
    setBudgets     (load(user.id, 'budgets', {}));
    setDebts       (load(user.id, 'debts',   []));
    setGoals       (load(user.id, 'goals',   []));
    setProfile     (load(user.id, 'profile', { name: user.name, email: user.email, income: user.income || 0, savingsTarget: (user.income || 0) * 0.2 }));
  }, [user]);

  // ── TRANSACTIONS ──
  const addTransaction = useCallback((tx) => {
    const newTx = { ...tx, id: uid() };
    setTransactions(prev => {
      const next = [newTx, ...prev];
      save(user.id, 'txs', next);
      return next;
    });
  }, [user]);

  const editTransaction = useCallback((id, updates) => {
    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      save(user.id, 'txs', next);
      return next;
    });
  }, [user]);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      save(user.id, 'txs', next);
      return next;
    });
  }, [user]);

  // ── BUDGETS ──
  const setBudgetForCat = useCallback((cat, amount) => {
    setBudgets(prev => {
      const next = { ...prev, [cat]: parseFloat(amount) || 0 };
      save(user.id, 'budgets', next);
      return next;
    });
  }, [user]);

  const deleteBudget = useCallback((cat) => {
    setBudgets(prev => {
      const next = { ...prev };
      delete next[cat];
      save(user.id, 'budgets', next);
      return next;
    });
  }, [user]);

  // ── DEBTS ──
  const addDebt = useCallback((debt) => {
    const newDebt = { ...debt, id: uid() };
    setDebts(prev => {
      const next = [...prev, newDebt];
      save(user.id, 'debts', next);
      return next;
    });
  }, [user]);

  const editDebt = useCallback((id, updates) => {
    setDebts(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...updates } : d);
      save(user.id, 'debts', next);
      return next;
    });
  }, [user]);

  const deleteDebt = useCallback((id) => {
    setDebts(prev => {
      const next = prev.filter(d => d.id !== id);
      save(user.id, 'debts', next);
      return next;
    });
  }, [user]);

  // ── GOALS ──
  const addGoal = useCallback((goal) => {
    const newGoal = { ...goal, id: uid() };
    setGoals(prev => {
      const next = [...prev, newGoal];
      save(user.id, 'goals', next);
      return next;
    });
  }, [user]);

  const editGoal = useCallback((id, updates) => {
    setGoals(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      save(user.id, 'goals', next);
      return next;
    });
  }, [user]);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id);
      save(user.id, 'goals', next);
      return next;
    });
  }, [user]);

  // ── PROFILE ──
  const updateProfile = useCallback((updates) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      save(user.id, 'profile', next);
      return next;
    });
  }, [user]);

  const clearAllData = useCallback(() => {
    const empty = { txs: [], budgets: {}, debts: [], goals: [] };
    setTransactions([]);
    setBudgets({});
    setDebts([]);
    setGoals([]);
    Object.entries(empty).forEach(([k, v]) => save(user.id, k, v));
  }, [user]);

  return (
    <FinanceContext.Provider value={{
      transactions, budgets, debts, goals, profile,
      addTransaction, editTransaction, deleteTransaction,
      setBudgetForCat, deleteBudget,
      addDebt, editDebt, deleteDebt,
      addGoal, editGoal, deleteGoal,
      updateProfile, clearAllData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}
