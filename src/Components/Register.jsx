import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())                        e.fullName        = 'Full name is required.';
    if (!form.email.trim())                           e.email           = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))        e.email           = 'Enter a valid email address.';
    if (!form.password)                               e.password        = 'Password is required.';
    else if (form.password.length < 8)                e.password        = 'Password must be at least 8 characters.';
    if (!form.confirmPassword)                        e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)  e.confirmPassword = 'Passwords do not match.';
    if (!form.agreed)                                 e.agreed          = 'You must agree to the Terms of Service.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError('');

    try {
      await authService.signup({
        email:     form.email,
        password:  form.password,
        full_name: form.fullName,
        role:      'user',
      });
      // Success → redirect to login
      navigate('/login');
    } catch (err) {
      // Show server error inside the form
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="auth-brand-btn">Timekey</Link>
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our exclusive community.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">Full Name</label>
            <div className={`auth-input-wrap ${errors.fullName ? 'auth-input-wrap--error' : ''}`}>
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input id="reg-name" name="fullName" type="text" placeholder="Enter your full name"
                className="auth-input" value={form.fullName} onChange={handleChange} autoComplete="name" />
            </div>
            {errors.fullName && <p className="auth-error">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Email Address</label>
            <div className={`auth-input-wrap ${errors.email ? 'auth-input-wrap--error' : ''}`}>
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
              <input id="reg-email" name="email" type="email" placeholder="name@example.com"
                className="auth-input" value={form.email} onChange={handleChange} autoComplete="email" />
            </div>
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div className={`auth-input-wrap ${errors.password ? 'auth-input-wrap--error' : ''}`}>
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password"
                className="auth-input" value={form.password} onChange={handleChange} autoComplete="new-password" />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className={`auth-input-wrap ${errors.confirmPassword ? 'auth-input-wrap--error' : ''}`}>
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <input id="reg-confirm" name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password"
                className="auth-input" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="auth-checkbox-wrap">
            <label className="auth-checkbox-label">
              <input type="checkbox" name="agreed" checked={form.agreed} onChange={handleChange} className="auth-checkbox" />
              <span className="auth-checkbox-box" aria-hidden="true" />
              <span className="auth-checkbox-text">
                I agree to the <a href="#" className="auth-link-bold">Terms of Service</a> and <a href="#" className="auth-link-bold">Privacy Policy</a>
              </span>
            </label>
            {errors.agreed && <p className="auth-error auth-error--checkbox">{errors.agreed}</p>}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="auth-api-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="auth-api-error-icon">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
          </button>

          <p className="auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-btn">Sign In</Link>
          </p>
        </form>

        <div className="auth-divider" />
        <div className="auth-trust">
          <span className="auth-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="auth-trust-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            SECURE SSL
          </span>
          <span className="auth-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="auth-trust-icon">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            LUXURY TIER
          </span>
        </div>
      </div>

      <p className="auth-footer-copy">© 2024 Timekey. All rights reserved.</p>
    </div>
  );
};

export default Register;
