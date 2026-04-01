import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../hooks/useAuth';
import { useFinance }  from '../../hooks/useFinance';

export function Topbar() {
  const { user }   = useAuth();
  const { profile } = useFinance();
  const navigate   = useNavigate();

  const displayName = (profile?.name || user?.name || 'User').split(' ')[0];
  const initial     = (profile?.name || user?.name || 'U')[0].toUpperCase();

  const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));
  useEffect(() => {
    localStorage.setItem('fs_theme', isDark ? 'dark' : 'light');
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDark]);

  return (
    <header className="topbar">
      {/* Logo */}
      <div className="logo" onClick={() => navigate('/dashboard')}>
        <div className="logo-icon"><i className="fas fa-chart-line" /></div>
        FinSight
      </div>

      {/* Right side */}
      <div className="topbar-right">
        <button className="btn-icon" title="Toggle Theme" onClick={() => setIsDark(!isDark)}>
          <i className={`fas fa-${isDark ? 'sun' : 'moon'}`} />
        </button>
        <button className="btn-icon" title="Reports" onClick={() => navigate('/reports')}>
          <i className="fas fa-file-chart-line" />
        </button>

        <div className="topbar-user" onClick={() => navigate('/profile')}>
          <div className="avatar">{initial}</div>
          <span className="user-name">{displayName}</span>
          <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', color: 'var(--text3)' }} />
        </div>
      </div>
    </header>
  );
}
