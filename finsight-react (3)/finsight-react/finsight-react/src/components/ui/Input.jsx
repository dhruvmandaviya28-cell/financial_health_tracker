/** Form input with label */
export function Input({ label, hint, type = 'text', value, onChange, placeholder, name, min, max, step, required, style }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        min={min} max={max} step={step}
        required={required}
        style={style}
      />
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}

export function Select({ label, value, onChange, children, style }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className="form-select" value={value} onChange={onChange} style={style}>
        {children}
      </select>
    </div>
  );
}
