import { useState, useCallback } from 'react';

/** Returns [toasts, showToast] — manages a list of toast notifications */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return [toasts, showToast];
}
