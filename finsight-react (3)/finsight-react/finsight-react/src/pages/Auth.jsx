import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../hooks/useAuth';
import { useToast }    from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { loadDemoAccount } from '../utils/demoData';

/** Full-page auth screen with Login / Signup tabs */
export default function Auth() {
  const [tab,        setTab]   = useState('login');
  const [loginForm,  setLogin] = useState({ email: '', password: '' });
  const [signupForm, setSignup] = useState({ firstName: '', lastName: '', email: '', password: '', income: '' });
  const [loading,    setLoading] = useState(false);

  const { login, signup } = useAuth();
  const [toasts, showToast] = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = login(loginForm);
      showToast(`Welcome back, ${user.name.split(' ')[0]}`, 'success');
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = signup(signupForm);
      showToast(`Welcome to FinSight, ${user.name.split(' ')[0]}`, 'success');
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      loadDemoAccount();
      const user = login({ email: 'demo@example.com', password: 'password' });
      showToast(`Demo loaded`, 'success');
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className="auth-wrap">

        {/* Left panel — branding */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-tagline">
              Master Your <span>Financial Future</span>
            </div>
            <p className="auth-desc">
              FinSight gives you a 360° view of your finances — track spending, manage debt, set goals, and get insights.
            </p>
            <div className="auth-features">
              {[
                { icon: 'fas fa-heartbeat', title: 'Health Score', desc: 'Real-time 0–100 financial wellness score' },
                { icon: 'fas fa-chart-line',     title: 'Insights',  desc: 'Personalised advice on your spending' },
                { icon: 'fas fa-chart-bar', title: 'Reports', desc: 'Monthly summaries and trend analysis' },
                { icon: 'fas fa-bullseye',  title: 'Goal Tracker', desc: 'Visualise progress towards savings milestones' },
              ].map(f => (
                <div key={f.title} className="auth-feat">
                  <div className="auth-feat-icon"><i className={f.icon} /></div>
                  <div className="auth-feat-text">
                    <strong>{f.title}</strong>{f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-brand">
              <div className="auth-brand-icon"><i className="fas fa-chart-line" /></div>
              FinSight
            </div>

            <div className="auth-title">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </div>
            <p className="auth-sub">
              {tab === 'login'
                ? 'Sign in to your FinSight account'
                : 'Start your financial health journey'}
            </p>

            {/* Tab toggle */}
            <div className="auth-tabs">
              <button className={`auth-tab${tab === 'login'  ? ' active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
              <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
            </div>

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" required
                    value={loginForm.email} onChange={e => setLogin(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" required
                    value={loginForm.password} onChange={e => setLogin(p => ({ ...p, password: e.target.value }))} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-sign-in-alt" />
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" type="text" placeholder="Alex" required
                      value={signupForm.firstName} onChange={e => setSignup(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" type="text" placeholder="Sharma"
                      value={signupForm.lastName} onChange={e => setSignup(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" placeholder="you@example.com" required
                    value={signupForm.email} onChange={e => setSignup(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" placeholder="Min 6 characters" required
                    value={signupForm.password} onChange={e => setSignup(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Income (₹)</label>
                  <input className="form-input" type="number" placeholder="e.g. 50000"
                    value={signupForm.income} onChange={e => setSignup(p => ({ ...p, income: e.target.value }))} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-rocket" />
                  {loading ? 'Creating account…' : 'Get Started Free'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text3)', marginBottom: '1rem' }}>Want to explore?</div>
              <button 
                className="btn btn-secondary" 
                onClick={handleDemoLogin} 
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <i className="fas fa-magic" />
                {loading ? 'Loading...' : 'Load Demo Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
