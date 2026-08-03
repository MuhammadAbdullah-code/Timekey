import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Store, CheckCircle, XCircle, Shield } from 'lucide-react';
import authService from '../../services/authService';
import './AdminSettings.css';

const AdminSettings = () => {
  /* ── Admin profile ── */
  const [profile,       setProfile]       = useState(null);
  const [profileLoading,setProfileLoading]= useState(true);
  const [editName,      setEditName]      = useState('');
  const [nameError,     setNameError]     = useState('');
  const [nameSaving,    setNameSaving]    = useState(false);
  const [nameSuccess,   setNameSuccess]   = useState(false);

  /* ── Change password ── */
  const [oldPw,         setOldPw]         = useState('');
  const [newPw,         setNewPw]         = useState('');
  const [confirmPw,     setConfirmPw]     = useState('');
  const [showOld,       setShowOld]       = useState(false);
  const [showNew,       setShowNew]       = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [pwErrors,      setPwErrors]      = useState({});
  const [pwSaving,      setPwSaving]      = useState(false);
  const [pwSuccess,     setPwSuccess]     = useState(false);
  const [pwApiError,    setPwApiError]    = useState('');

  /* ── Store appearance ── */
  const [storeName,     setStoreName]     = useState('Timekey');
  const [storeEmail,    setStoreEmail]    = useState('admin@timekey.com');
  const [currency,      setCurrency]      = useState('USD');
  const [storeSaved,    setStoreSaved]    = useState(false);

  /* Load profile */
  useEffect(() => {
    authService.getMe()
      .then(data => {
        setProfile(data);
        setEditName(data.full_name || '');
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  /* Save name */
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { setNameError('Name cannot be empty.'); return; }
    setNameSaving(true);
    setNameError('');
    try {
      const updated = await authService.updateMe({ full_name: editName.trim() });
      setProfile(updated);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, full_name: updated.full_name }));
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(err.message || 'Failed to save.');
    } finally {
      setNameSaving(false);
    }
  };

  /* Save password */
  const handleSavePw = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!oldPw)                errs.old     = 'Current password is required.';
    if (!newPw)                errs.new     = 'New password is required.';
    else if (newPw.length < 6) errs.new     = 'Must be at least 6 characters.';
    if (newPw !== confirmPw)   errs.confirm = 'Passwords do not match.';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwSaving(true);
    setPwErrors({});
    setPwApiError('');
    try {
      await authService.updateMe({ password: newPw, current_password: oldPw });
      setOldPw(''); setNewPw(''); setConfirmPw('');
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwApiError(err.message || 'Failed to update password.');
    } finally {
      setPwSaving(false);
    }
  };

  /* Save store settings */
  const handleSaveStore = (e) => {
    e.preventDefault();
    setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 2500);
  };

  const initials = profile
    ? (profile.full_name || profile.email || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <div className="as-root">
      <div className="as-page-header">
        <h1 className="as-page-title">Settings</h1>
        <p className="as-page-sub">Manage your admin profile and store configuration</p>
      </div>

      <div className="as-layout">

        {/* ── LEFT COLUMN ── */}
        <div className="as-column">

          {/* Admin Profile Card */}
          <div className="as-card">
            <div className="as-card-header">
              <User size={16} className="as-card-icon" />
              <h2 className="as-card-title">Admin Profile</h2>
            </div>

            {profileLoading ? (
              <div className="as-loading">Loading profile…</div>
            ) : profile ? (
              <>
                {/* Avatar + meta */}
                <div className="as-avatar-row">
                  <div className="as-avatar">{initials}</div>
                  <div>
                    <p className="as-avatar-name">{profile.full_name || '—'}</p>
                    <p className="as-avatar-email">{profile.email}</p>
                    <span className="as-role-badge">
                      <Shield size={10} /> {profile.role}
                    </span>
                  </div>
                </div>

                {/* Edit name form */}
                <form onSubmit={handleSaveName} className="as-form">
                  <div className="as-field">
                    <label className="as-label">Full Name</label>
                    <div className="as-input-wrap">
                      <User size={14} className="as-input-icon" />
                      <input
                        className={`as-input${nameError ? ' as-input--error' : ''}`}
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setNameError(''); }}
                        placeholder="Your full name"
                      />
                    </div>
                    {nameError && <p className="as-field-error">{nameError}</p>}
                  </div>
                  <div className="as-field">
                    <label className="as-label">Email Address</label>
                    <div className="as-input-wrap">
                      <Mail size={14} className="as-input-icon" />
                      <input className="as-input as-input--readonly" value={profile.email} readOnly tabIndex={-1} />
                    </div>
                    <p className="as-field-hint">Email cannot be changed.</p>
                  </div>

                  {nameSuccess && (
                    <div className="as-success-toast">
                      <CheckCircle size={14} /> Profile updated successfully!
                    </div>
                  )}

                  <button type="submit" className="as-save-btn" disabled={nameSaving}>
                    {nameSaving ? 'Saving…' : 'Save Profile'}
                  </button>
                </form>
              </>
            ) : (
              <p className="as-loading">Could not load profile.</p>
            )}
          </div>

          {/* Change Password Card */}
          <div className="as-card">
            <div className="as-card-header">
              <Lock size={16} className="as-card-icon" />
              <h2 className="as-card-title">Change Password</h2>
            </div>

            <form onSubmit={handleSavePw} className="as-form">
              {/* Current password */}
              <div className="as-field">
                <label className="as-label">Current Password</label>
                <div className={`as-pw-wrap${pwErrors.old ? ' as-pw-wrap--error' : ''}`}>
                  <input
                    type={showOld ? 'text' : 'password'}
                    className="as-pw-input"
                    placeholder="Enter current password"
                    value={oldPw}
                    onChange={e => { setOldPw(e.target.value); setPwErrors(p => ({ ...p, old: '' })); }}
                    autoComplete="current-password"
                  />
                  <button type="button" className="as-pw-toggle" onClick={() => setShowOld(v => !v)} aria-label="Toggle">
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.old && <p className="as-field-error">{pwErrors.old}</p>}
              </div>

              {/* New password */}
              <div className="as-field">
                <label className="as-label">New Password</label>
                <div className={`as-pw-wrap${pwErrors.new ? ' as-pw-wrap--error' : ''}`}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    className="as-pw-input"
                    placeholder="Min. 6 characters"
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); setPwErrors(p => ({ ...p, new: '', confirm: '' })); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="as-pw-toggle" onClick={() => setShowNew(v => !v)} aria-label="Toggle">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.new && <p className="as-field-error">{pwErrors.new}</p>}
              </div>

              {/* Confirm password */}
              <div className="as-field">
                <label className="as-label">Confirm New Password</label>
                <div className={`as-pw-wrap${pwErrors.confirm ? ' as-pw-wrap--error' : ''}`}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="as-pw-input"
                    placeholder="Repeat new password"
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setPwErrors(p => ({ ...p, confirm: '' })); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="as-pw-toggle" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle">
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.confirm && <p className="as-field-error">{pwErrors.confirm}</p>}
              </div>

              {pwApiError && (
                <div className="as-error-toast">
                  <XCircle size={14} /> {pwApiError}
                </div>
              )}
              {pwSuccess && (
                <div className="as-success-toast">
                  <CheckCircle size={14} /> Password changed successfully!
                </div>
              )}

              <button type="submit" className="as-save-btn" disabled={pwSaving}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="as-column">

          {/* Store Appearance Card */}
          <div className="as-card">
            <div className="as-card-header">
              <Store size={16} className="as-card-icon" />
              <h2 className="as-card-title">Store Settings</h2>
            </div>

            <form onSubmit={handleSaveStore} className="as-form">
              <div className="as-field">
                <label className="as-label">Store Name</label>
                <input
                  className="as-input as-input--full"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="Your store name"
                />
              </div>
              <div className="as-field">
                <label className="as-label">Contact Email</label>
                <input
                  type="email"
                  className="as-input as-input--full"
                  value={storeEmail}
                  onChange={e => setStoreEmail(e.target.value)}
                  placeholder="store@example.com"
                />
              </div>
              <div className="as-field">
                <label className="as-label">Currency</label>
                <select
                  className="as-input as-input--full"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="PKR">PKR — Pakistani Rupee</option>
                  <option value="AED">AED — UAE Dirham</option>
                </select>
              </div>

              {storeSaved && (
                <div className="as-success-toast">
                  <CheckCircle size={14} /> Store settings saved!
                </div>
              )}

              <button type="submit" className="as-save-btn">
                {storeSaved ? '✓ Saved' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="as-card as-card--muted">
            <div className="as-card-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="as-card-icon">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <h2 className="as-card-title">Coming Soon</h2>
            </div>
            <p className="as-info-text">
              More configuration options are planned for future releases.
            </p>
            <div className="as-pill-list">
              {['Shipping Zones', 'Tax Rules', 'Payment Gateways', 'Email Templates', 'Notifications', 'API Keys'].map(f => (
                <span key={f} className="as-pill">{f}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
