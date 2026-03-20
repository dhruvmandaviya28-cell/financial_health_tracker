/**
 * ToastContext — provides a global toast notification system.
 * Usage: const { toast } = useToast();
 *        toast('Saved!', 'success');
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { uid } from '../utils/constants';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = uid();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Render toasts in a fixed portal-like container */}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onDismiss={() => setToasts(p => p.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ message, type, onDismiss }) {
  const icon =
    type === 'success' ? 'fa-check-circle' :
    type === 'error'   ? 'fa-times-circle' : 'fa-info-circle';

  return (
    <div className={`toast ${type}`} onClick={onDismiss} style={{ cursor: 'pointer' }}>
      <i className={`fas ${icon}`}></i>
      {message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
