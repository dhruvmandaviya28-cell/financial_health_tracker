/** Toast container — renders active notifications */
export function ToastContainer({ toasts }) {
  const icon = type => type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fas fa-${icon(t.type)}`} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
