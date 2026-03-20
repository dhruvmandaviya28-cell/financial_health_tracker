import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',    icon: 'fas fa-th-large',     label: 'Dashboard' },
      { to: '/health',       icon: 'fas fa-heartbeat',    label: 'Health Score' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
      { to: '/budget',       icon: 'fas fa-wallet',       label: 'Budget' },
      { to: '/debts',        icon: 'fas fa-credit-card',  label: 'Debts & Loans' },
      { to: '/goals',        icon: 'fas fa-bullseye',     label: 'Savings Goals' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/insights',     icon: 'fas fa-lightbulb',    label: 'Insights' },
      { to: '/reports',      icon: 'fas fa-chart-bar',    label: 'Reports' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',      icon: 'fas fa-user-circle',  label: 'Profile' },
    ],
  },
];

export function Sidebar() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Sign out of FinSight?')) logout();
  };

  return (
    <nav className="sidebar">
      {NAV_SECTIONS.map(section => (
        <div key={section.label}>
          <span className="sidebar-section-label">{section.label}</span>
          {section.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <i className={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      {/* Logout at bottom */}
      <div style={{ marginTop: 'auto' }}>
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <i className="fas fa-sign-out-alt" />
          Log Out
        </button>
      </div>
    </nav>
  );
}
