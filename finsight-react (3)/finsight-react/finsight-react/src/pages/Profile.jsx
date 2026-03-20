import { useState }      from 'react';
import { useAuth }       from '../hooks/useAuth';
import { useFinance }    from '../hooks/useFinance';
import { useToast }      from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { hashPass }      from '../utils/finance';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { profile, updateProfile, clearAllData } = useFinance();
  const [toasts, showToast] = useToast();

  const [profileForm, setProfileForm] = useState({
    name:          profile?.name  || user?.name  || '',
    email:         profile?.email || user?.email || '',
    income:        profile?.income        || '',
    savingsTarget: profile?.savingsTarget || '',
  });

  const [passForm, setPassForm] = useState({ newPass: '', confirmPass: '' });

  const displayName = (profile?.name || user?.name || 'U');
  const initial     = displayName[0].toUpperCase();

  const saveProfile = () => {
    if (!profileForm.name) { showToast('Name cannot be empty', 'error'); return; }
    updateProfile({
      name:          profileForm.name.trim(),
      email:         profileForm.email.trim(),
      income:        parseFloat(profileForm.income)        || 0,
      savingsTarget: parseFloat(profileForm.savingsTarget) || 0,
    });
    updateUser({ name: profileForm.name.trim(), email: profileForm.email.trim() });
    showToast('Profile saved!', 'success');
  };

  const changePassword = () => {
    const { newPass, confirmPass } = passForm;
    if (!newPass)            { showToast('Enter a new password', 'error'); return; }
    if (newPass !== confirmPass) { showToast("Passwords don't match", 'error'); return; }
    if (newPass.length < 6)  { showToast('Password must be 6+ characters', 'error'); return; }
    // Update in localStorage user store
    const users = JSON.parse(localStorage.getItem('fs_users') || '[]');
    const idx   = users.findIndex(u => u.id === user.id);
    if (idx > -1) { users[idx].passHash = hashPass(newPass); localStorage.setItem('fs_users', JSON.stringify(users)); }
    setPassForm({ newPass: '', confirmPass: '' });
    showToast('Password changed!', 'success');
  };

  const exportData = () => {
    const data = {
      transactions: JSON.parse(localStorage.getItem(`fs_${user.id}_txs`) || '[]'),
      budgets:      JSON.parse(localStorage.getItem(`fs_${user.id}_budgets`) || '{}'),
      debts:        JSON.parse(localStorage.getItem(`fs_${user.id}_debts`) || '[]'),
      goals:        JSON.parse(localStorage.getItem(`fs_${user.id}_goals`) || '[]'),
      profile,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `finsight_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Data exported!', 'success');
  };

  const handleClearData = () => {
    if (!window.confirm('Permanently delete all financial data?')) return;
    if (!window.confirm('Last chance — this cannot be undone!'))   return;
    clearAllData();
    showToast('All data cleared', 'info');
  };

  const handleLogout = () => {
    if (window.confirm('Sign out of FinSight?')) logout();
  };

  return (
    <div className="page-enter">
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div className="page-title">My <span>Profile</span></div>
      </div>

      {/* Profile header card */}
      <div className="profile-header-card">
        <div className="profile-avatar">{initial}</div>
        <div>
          <div className="profile-name">{displayName}</div>
          <div className="profile-email">{profile?.email || user?.email}</div>
        </div>
        <div className="ml-auto">
          <span className="badge badge-gold"><i className="fas fa-star" /> FinSight Member</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Edit profile */}
        <div className="card">
          <div className="section-title"><i className="fas fa-edit" /> Edit Profile <div className="title-line" /></div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={profileForm.name}
              onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={profileForm.email}
              onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Income (₹)</label>
            <input className="form-input" type="number" value={profileForm.income}
              onChange={e => setProfileForm(p => ({ ...p, income: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Savings Target (₹)</label>
            <input className="form-input" type="number" value={profileForm.savingsTarget}
              onChange={e => setProfileForm(p => ({ ...p, savingsTarget: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={saveProfile}>
            <i className="fas fa-save" /> Save Changes
          </button>
        </div>

        {/* Security + data */}
        <div className="card">
          <div className="section-title"><i className="fas fa-shield-alt" /> Account Security <div className="title-line" /></div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="Leave blank to keep current"
              value={passForm.newPass} onChange={e => setPassForm(p => ({ ...p, newPass: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="Confirm new password"
              value={passForm.confirmPass} onChange={e => setPassForm(p => ({ ...p, confirmPass: e.target.value }))} />
          </div>
          <button className="btn btn-secondary" onClick={changePassword}>
            <i className="fas fa-lock" /> Change Password
          </button>

          <div className="divider" />

          <div className="section-title"><i className="fas fa-database" /> Data Management <div className="title-line" /></div>
          <div className="flex-row">
            <button className="btn btn-sm btn-secondary" onClick={exportData}>
              <i className="fas fa-download" /> Export Data
            </button>
            <button className="btn btn-sm btn-danger" onClick={handleClearData}>
              <i className="fas fa-trash" /> Clear All Data
            </button>
          </div>

          <div className="divider" />

          <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
            <i className="fas fa-sign-out-alt" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
