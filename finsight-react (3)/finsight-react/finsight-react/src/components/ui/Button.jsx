/** Reusable Button — variant: primary | secondary | danger | icon */
export function Button({ children, variant = 'primary', size, onClick, disabled, className = '', type = 'button', style }) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}
