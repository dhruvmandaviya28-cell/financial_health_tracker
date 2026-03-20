import { createContext, useState, useCallback } from 'react';
import { uid, hashPass } from '../utils/finance';

export const AuthContext = createContext(null);

const getUsers  = ()      => JSON.parse(localStorage.getItem('fs_users') || '[]');
const saveUsers = (users) => localStorage.setItem('fs_users', JSON.stringify(users));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signup = useCallback(({ firstName, lastName, email, password, income }) => {
    const users   = getUsers();
    const emailLc = email.trim().toLowerCase();
    if (!firstName || !emailLc || !password) throw new Error('Please fill all required fields');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    if (users.find(u => u.email === emailLc)) throw new Error('Email already registered');
    const newUser = { id: uid(), name: `${firstName} ${lastName}`.trim(), email: emailLc, passHash: hashPass(password), income: parseFloat(income) || 0, createdAt: new Date().toISOString().split('T')[0] };
    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(({ email, password }) => {
    if (!email || !password) throw new Error('Enter email and password');
    const users   = getUsers();
    const emailLc = email.trim().toLowerCase();
    const found   = users.find(u => u.email === emailLc && u.passHash === hashPass(password));
    if (!found) throw new Error('Invalid email or password');
    setUser(found);
    return found;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateUser = useCallback((updates) => {
    if (!user) return;
    const users = getUsers();
    const idx   = users.findIndex(u => u.id === user.id);
    if (idx > -1) { users[idx] = { ...users[idx], ...updates }; saveUsers(users); }
    setUser(prev => ({ ...prev, ...updates }));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
