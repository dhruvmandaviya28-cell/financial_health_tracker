import { uid, hashPass } from './finance';

export const loadDemoAccount = () => {
  const users = JSON.parse(localStorage.getItem('fs_users') || '[]');
  const email = 'demo@example.com';
  const password = 'password';

  let demoUser = users.find(u => u.email === email);
  if (!demoUser) {
    demoUser = {
      id: uid(),
      name: 'Demo User',
      email,
      passHash: hashPass(password),
      income: 80000,
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(demoUser);
    localStorage.setItem('fs_users', JSON.stringify(users));
  }

  const userId = demoUser.id;

  // Generate some realistic dates
  const today = new Date();
  const d1 = new Date(today); d1.setDate(today.getDate() - 2);
  const d2 = new Date(today); d2.setDate(today.getDate() - 5);
  const d3 = new Date(today); d3.setDate(today.getDate() - 10);
  const d4 = new Date(today); d4.setDate(today.getDate() - 15);
  const d5 = new Date(today); d5.setDate(today.getDate() - 20);

  const fmtDate = (d) => d.toISOString().split('T')[0];

  const transactions = [
    { id: uid(), type: 'income', amount: 80000, cat: 'Salary', note: 'Monthly Salary', date: fmtDate(d5) },
    { id: uid(), type: 'expense', amount: 25000, cat: 'Housing', note: 'Rent', date: fmtDate(d4) },
    { id: uid(), type: 'expense', amount: 5000, cat: 'Food & Dining', note: 'Groceries', date: fmtDate(d3) },
    { id: uid(), type: 'expense', amount: 3000, cat: 'Utilities', note: 'Electricity Bill', date: fmtDate(d2) },
    { id: uid(), type: 'expense', amount: 8000, cat: 'Transportation', note: 'Fuel & Commute', date: fmtDate(d3) },
    { id: uid(), type: 'expense', amount: 4500, cat: 'Shopping', note: 'Clothing', date: fmtDate(d1) },
    { id: uid(), type: 'income', amount: 15000, cat: 'Freelance', note: 'Project Payment', date: fmtDate(d2) }
  ];

  const budgets = {
    'Food & Dining': 10000,
    'Housing': 26000,
    'Transportation': 10000,
    'Shopping': 5000,
    'Utilities': 4000
  };

  const debts = [
    { id: uid(), name: 'Car Loan', type: 'Car Loan', total: 500000, paid: 150000, rate: 8.5, emi: 12000, date: '2022-01-15' },
    { id: uid(), name: 'Credit Card', type: 'Credit Card', total: 45000, paid: 10000, rate: 18, emi: 5000, date: '2023-11-20' }
  ];

  const goals = [
    { id: uid(), name: 'Emergency Fund', target: 300000, current: 80000, date: '2025-12-31' },
    { id: uid(), name: 'Vacation', target: 100000, current: 40000, date: '2024-08-15' }
  ];

  const profile = { name: demoUser.name, email, income: demoUser.income, savingsTarget: 16000 };

  localStorage.setItem(`fs_${userId}_txs`, JSON.stringify(transactions));
  localStorage.setItem(`fs_${userId}_budgets`, JSON.stringify(budgets));
  localStorage.setItem(`fs_${userId}_debts`, JSON.stringify(debts));
  localStorage.setItem(`fs_${userId}_goals`, JSON.stringify(goals));
  localStorage.setItem(`fs_${userId}_profile`, JSON.stringify(profile));

  return demoUser;
};
