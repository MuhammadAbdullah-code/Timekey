import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, CheckCircle, XCircle, LogOut, Package, Heart, Edit2, Lock, Save, X, Eye, EyeOff } from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import authService from '../services/authService';
import './Account.css';

const Account = ({ user, onLogout }) => {
  const navigate = useNavigate();

  /* ── Profile state ── */
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  /* ── Edit form state ── */
  const [editing,        setEditing]        = useState(false);
  const [editName,       setEditName]       = useState('');
  const [editOldPassword, setEditOldPassword] = useState('');
  const [editPassword,   setEditPassword]   = useState('');
  const [editConfirm,    setEditConfirm]    = useState('');
  const [editErrors,     setEditErrors]     = useState({});
  const [saving,         setSaving]         = useState(false);
  const [saveSuccess,    setSaveSuccess]    = useState(false);
  const [saveError,      setSaveError]      = useState('');
  const [showOldPw,      setShowOldPw]      = useState(false);
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [showConfirmPw,  setShowConfirmPw]  = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    authService.getMe()
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message || 'Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = () => { onLogout?.(); navigate('/'); };

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  /* ── Open edit form ── */
  const openEdit = () => {
    setEditName(profile?.full_name || '');
    setEditOldPassword('');
    setEditPassword('');
    setEditConfirm('');
    setEditErrors({});
    setSaveError('');
    setSaveSuccess(false);
    setShowOldPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSaveError(''); };

  /* ── Validate ── */
  const validate = () => {
    const errs = {};
    if (!editName.trim()) errs.name = 'Full name is required.';
    if (editPassword) {
      if (!editOldPassword) errs.oldPassword = 'Current password is required to set a new one.';
      if (editPassword.length < 6) errs.password = 'Password must be at least 6 characters.';
      if (editPassword !== editConfirm) errs.confirm = 'Passwords do not match.';
    }
    return errs;
  };

  /* ── Save ── */
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setEditErrors(errs); return; }

    setSaving(true);
    setSaveError('');
    const payload = { full_name: editName.trim() };
    if (editPassword) {
      payload.password = editPassword;
      payload.current_password = editOldPassword;
    }

    try {
      const updated = await authService.updateMe(payload);
      setProfile(updated);
      // Update localStorage user so header initials refresh
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, full_name: updated.full_name }));
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main className="account-main">

        {/* Hero */}
        <div className="account-hero">
          <div className="account-hero-overlay" aria-hidden="true" />
          <div className="container account-hero-content">
            <p className="account-hero-eyebrow">Dashboard</p>
            <h1 className="account-hero-title">My Account</h1>
          </div>
        </div>

        <div className="container account-body">

          {/* Loading */}
          {loading && (
            <div className="account-loading">
              <div className="account-spinner" />
              <p>Loading your profile…</p>
            </div>
          )}

          {/* Fetch error */}
          {!loading && error && (
            <div className="account-error">
              <XCircle size={18} />
              <span>{error}</span>
              <button className="account-retry-btn" onClick={() => {
                setError(''); setLoading(true);
                authService.getMe().then(setProfile).catch((e) => setError(e.message)).finally(() => setLoading(false));
              }}>Retry</button>
            </div>
          )}

          {/* Profile loaded */}
          {!loading && profile && (
            <div className="account-layout">

              {/* ── Left sidebar ── */}
              <aside className="account-sidebar">
                <div className="account-avatar-card">
                  <div className="account-avatar">{initials}</div>
                  <p className="account-avatar-name">{profile.full_name || '—'}</p>
                  <p className="account-avatar-email">{profile.email}</p>
                  <span className={`account-role-badge account-role-badge--${profile.role}`}>
                    {profile.role === 'admin' ? '⚙ Admin' : '✦ Member'}
                  </span>
                </div>

                <nav className="account-side-nav">
                  <Link to="/orders"   className="account-side-link"><Package  size={15} /> Order History</Link>
                  <Link to="/wishlist" className="account-side-link"><Heart    size={15} /> Wishlist</Link>
                  {profile.role === 'admin' && (
                    <Link to="/admin" className="account-side-link account-side-link--admin">
                      <Shield size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <button className="account-side-link account-side-link--logout" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </nav>
              </aside>

              {/* ── Right content ── */}
              <div className="account-content">

                {/* Save success toast */}
                {saveSuccess && (
                  <div className="account-toast account-toast--success">
                    <CheckCircle size={15} />
                    Profile updated successfully!
                  </div>
                )}

                {/* ── Profile Information section ── */}
                <div className="account-section">
                  <div className="account-section-header">
                    <div>
                      <h2 className="account-section-title">Profile Information</h2>
                      <p className="account-section-sub">
                        {editing ? 'Edit your name and optionally change your password.' : 'Your account details.'}
                      </p>
                    </div>
                    {!editing && (
                      <button className="account-edit-btn" onClick={openEdit}>
                        <Edit2 size={13} /> Edit Profile
                      </button>
                    )}
                  </div>

                  {/* ── View mode ── */}
                  {!editing && (
                    <div className="account-fields">
                      <div className="account-field">
                        <div className="account-field-icon"><User size={15} /></div>
                        <div className="account-field-body">
                          <p className="account-field-label">Full Name</p>
                          <p className="account-field-value">{profile.full_name || '—'}</p>
                        </div>
                      </div>
                      <div className="account-field">
                        <div className="account-field-icon"><Mail size={15} /></div>
                        <div className="account-field-body">
                          <p className="account-field-label">Email Address</p>
                          <p className="account-field-value">{profile.email}</p>
                        </div>
                      </div>
                      <div className="account-field">
                        <div className="account-field-icon"><Shield size={15} /></div>
                        <div className="account-field-body">
                          <p className="account-field-label">Role</p>
                          <p className="account-field-value" style={{ textTransform: 'capitalize' }}>{profile.role}</p>
                        </div>
                      </div>
                      <div className="account-field">
                        <div className="account-field-icon">
                          {profile.is_active
                            ? <CheckCircle size={15} color="var(--color-success)" />
                            : <XCircle     size={15} color="var(--color-error)"   />}
                        </div>
                        <div className="account-field-body">
                          <p className="account-field-label">Account Status</p>
                          <p className={`account-field-value account-status--${profile.is_active ? 'active' : 'inactive'}`}>
                            {profile.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <div className="account-field">
                        <div className="account-field-icon"><User size={15} /></div>
                        <div className="account-field-body">
                          <p className="account-field-label">User ID</p>
                          <p className="account-field-value account-field-value--mono">{profile.id}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Edit mode ── */}
                  {editing && (
                    <div className="account-edit-form">

                      {/* Full Name */}
                      <div className="account-edit-field">
                        <label className="account-edit-label">
                          <User size={13} /> Full Name
                        </label>
                        <input
                          type="text"
                          className={`account-edit-input${editErrors.name ? ' error' : ''}`}
                          placeholder="Your full name"
                          value={editName}
                          onChange={e => { setEditName(e.target.value); setEditErrors(p => ({ ...p, name: '' })); }}
                        />
                        {editErrors.name && <p className="account-edit-error">{editErrors.name}</p>}
                      </div>

                      {/* Email — read only */}
                      <div className="account-edit-field">
                        <label className="account-edit-label">
                          <Mail size={13} /> Email Address
                        </label>
                        <input
                          type="email"
                          className="account-edit-input account-edit-input--readonly"
                          value={profile.email}
                          readOnly
                          tabIndex={-1}
                        />
                        <p className="account-edit-hint">Email cannot be changed.</p>
                      </div>

                      {/* Current password */}
                      <div className="account-edit-field">
                        <label className="account-edit-label">
                          <Lock size={13} /> Current Password <span className="account-edit-optional">(required to change password)</span>
                        </label>
                        <div className={`account-pw-wrap${editErrors.oldPassword ? ' error' : ''}`}>
                          <input
                            type={showOldPw ? 'text' : 'password'}
                            className="account-pw-input"
                            placeholder="Enter your current password"
                            value={editOldPassword}
                            onChange={e => { setEditOldPassword(e.target.value); setEditErrors(p => ({ ...p, oldPassword: '' })); }}
                            autoComplete="current-password"
                          />
                          <button type="button" className="account-pw-toggle" onClick={() => setShowOldPw(v => !v)} aria-label={showOldPw ? 'Hide' : 'Show'}>
                            {showOldPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {editErrors.oldPassword && <p className="account-edit-error">{editErrors.oldPassword}</p>}
                      </div>

                      {/* New password */}
                      <div className="account-edit-field">
                        <label className="account-edit-label">
                          <Lock size={13} /> New Password <span className="account-edit-optional">(optional)</span>
                        </label>
                        <div className={`account-pw-wrap${editErrors.password ? ' error' : ''}`}>
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            className="account-pw-input"
                            placeholder="Leave blank to keep current password"
                            value={editPassword}
                            onChange={e => { setEditPassword(e.target.value); setEditErrors(p => ({ ...p, password: '', confirm: '' })); }}
                            autoComplete="new-password"
                          />
                          <button type="button" className="account-pw-toggle" onClick={() => setShowNewPw(v => !v)} aria-label={showNewPw ? 'Hide' : 'Show'}>
                            {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {editErrors.password && <p className="account-edit-error">{editErrors.password}</p>}
                      </div>

                      {/* Confirm password */}
                      {editPassword && (
                        <div className="account-edit-field">
                          <label className="account-edit-label">
                            <Lock size={13} /> Confirm New Password
                          </label>
                          <div className={`account-pw-wrap${editErrors.confirm ? ' error' : ''}`}>
                            <input
                              type={showConfirmPw ? 'text' : 'password'}
                              className="account-pw-input"
                              placeholder="Repeat new password"
                              value={editConfirm}
                              onChange={e => { setEditConfirm(e.target.value); setEditErrors(p => ({ ...p, confirm: '' })); }}
                              autoComplete="new-password"
                            />
                            <button type="button" className="account-pw-toggle" onClick={() => setShowConfirmPw(v => !v)} aria-label={showConfirmPw ? 'Hide' : 'Show'}>
                              {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {editErrors.confirm && <p className="account-edit-error">{editErrors.confirm}</p>}
                        </div>
                      )}

                      {/* API error */}
                      {saveError && (
                        <div className="account-save-error">
                          <XCircle size={14} />
                          {saveError}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="account-edit-actions">
                        <button className="account-edit-cancel-btn" onClick={cancelEdit} disabled={saving}>
                          <X size={13} /> Cancel
                        </button>
                        <button
                          className={`account-edit-save-btn${saving ? ' account-edit-save-btn--loading' : ''}`}
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving
                            ? <><span className="account-edit-spinner" /> Saving…</>
                            : <><Save size={13} /> Save Changes</>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div className="account-section">
                  <h2 className="account-section-title">Quick Links</h2>
                  <div className="account-quick-links">
                    <Link to="/orders" className="account-quick-card">
                      <Package size={22} />
                      <p className="account-quick-label">My Orders</p>
                      <p className="account-quick-sub">Track & view all orders</p>
                    </Link>
                    <Link to="/wishlist" className="account-quick-card">
                      <Heart size={22} />
                      <p className="account-quick-label">Wishlist</p>
                      <p className="account-quick-sub">Your saved products</p>
                    </Link>
                    <Link to="/products" className="account-quick-card">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
                      </svg>
                      <p className="account-quick-label">Shop</p>
                      <p className="account-quick-sub">Browse all products</p>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
