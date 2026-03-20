import { useContext } from 'react';
import { FinanceContext } from '../context/FinanceContext';

/** Convenience hook to access FinanceContext values */
export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used inside <FinanceProvider>');
  return ctx;
}
