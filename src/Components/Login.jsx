import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';
import './Register.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm]             = useState({ email: '', password: '', remember: false });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim())                    e.email    = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email address.';
    if (!form.password)                        e.password = 'Password is required.';
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
      const user = await authService.login({
        email:    form.email,
        password: form.password,
      });

      // Lift user state up to Root so Header/other pages can access it
      onLogin?.(user);

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to access your account.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <div className={`auth-input-wrap ${errors.email ? 'auth-input-wrap--error' : ''}`}>
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
              <input id="login-email" name="email" type="email" placeholder="name@example.com"
                className="auth-input" value={form.email} onChange={handleChange} autoComplete="email" />
            </div>
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <a href="#" className="auth-forgot-link">Forgot password?</a>
            </div>
            <div className={`auth-input-wrap ${errors.password ? 'auth-input-wrap--error' : ''}`}>
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                className="auth-input" value={form.password} onChange={handleChange} autoComplete="current-password" />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          {/* Remember me */}
          <div className="auth-checkbox-wrap auth-checkbox-wrap--slim">
            <label className="auth-checkbox-label">
              <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="auth-checkbox" />
              <span className="auth-checkbox-box" aria-hidden="true" />
              <span className="auth-checkbox-text">Remember me</span>
            </label>
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
            {submitting ? 'SIGNING IN…' : 'SIGN IN'}
          </button>

          <p className="auth-switch-text">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-btn">Create Account</Link>
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

export default Login;
