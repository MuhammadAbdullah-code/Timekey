import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, CheckCircle, Lock, ArrowRight,
  Package, Tag,
} from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/footer';
import { useShop } from '../context/ShopContext';
import './Checkout.css';

/* ── Validation helpers ── */
const required = (v) => (!v || !v.trim() ? 'This field is required' : '');
const validEmail = (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email' : '');
const validPhone = (v) => (!/^[0-9]{10,11}$/.test(v.replace(/\s/g, '')) ? 'Enter a valid phone number' : '');
const PAYMENT_METHODS = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    desc: 'Pay in cash when your order is delivered. Please keep exact change ready.',
    iconClass: 'checkout-payment-icon--cod',
    iconText: <Package size={16} />,
    type: 'cod',
  },
];

const PAKISTANI_CITIES = [
  'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan',
  'Peshawar','Quetta','Sialkot','Gujranwala','Hyderabad','Abbottabad',
  'Bahawalpur','Sargodha','Sukkur','Other',
];

const VALID_COUPONS = { LUXE10: 0.10, SAVE20: 0.20 };

const Checkout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { cart, cartSubtotal, placeOrder, cartLoading } = useShop();

  const shipping = cartSubtotal >= 200 ? 0 : 15;

  /* ── Coupon state ── */
  const [couponInput, setCouponInput] = useState('LUXE10');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const discount = appliedCoupon ? cartSubtotal * VALID_COUPONS[appliedCoupon] : 0;
  const total = cartSubtotal + shipping - discount;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      setAppliedCoupon(code);
    } else {
      setAppliedCoupon(null);
      alert('Invalid promo code.');
    }
  };

  /* ── Shipping form ── */
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', country: 'Pakistan',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateShipping = () => {
    const errs = {};
    if (required(form.firstName))  errs.firstName  = required(form.firstName);
    if (required(form.lastName))   errs.lastName   = required(form.lastName);
    if (required(form.email) || validEmail(form.email)) errs.email = required(form.email) || validEmail(form.email);
    if (required(form.phone) || validPhone(form.phone)) errs.phone = required(form.phone) || validPhone(form.phone);
    if (required(form.address))    errs.address    = required(form.address);
    if (required(form.city))       errs.city       = required(form.city);
    if (required(form.postalCode)) errs.postalCode = required(form.postalCode);
    return errs;
  };

  /* ── Payment state ── */
  const [paymentMethod, setPaymentMethod] = useState('cod');
  /* ── Submit ── */
  const [submitting, setSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);

  const [apiError, setApiError] = useState('');

  const handlePlaceOrder = async () => {
    /* validate shipping */
    const shippingErrs = validateShipping();
    if (Object.keys(shippingErrs).length) {
      setFormErrors(shippingErrs);
      document.querySelector('.checkout-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    /* COD — no additional payment validation needed */

    setSubmitting(true);
    setApiError('');

    try {
      const orderId = await placeOrder({
        items:           cart,
        subtotal:        cartSubtotal,
        shipping,
        discount,
        total,
        coupon:          appliedCoupon,
        paymentMethod,
        shippingAddress: { ...form },
      });
      setSuccessOrderId(orderId);
    } catch (err) {
      setApiError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading guard — wait for cart API before deciding empty ── */
  if (cartLoading) {
    return (
      <div className="page-wrapper">
        <Header user={user} onLogout={onLogout} />
        <main className="checkout-main">
          <div className="checkout-hero">
            <div className="checkout-hero-overlay" aria-hidden="true" />
            <div className="container checkout-hero-content">
              <p className="checkout-hero-eyebrow">Secure Checkout</p>
              <h1 className="checkout-hero-title">Checkout</h1>
            </div>
          </div>
          <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0B1328', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ marginTop: 16, fontSize: 14, color: '#9CA3AF' }}>Loading your cart…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Empty cart guard ── */
  if (!cart.length && !successOrderId) {
    return (
      <div className="page-wrapper">
        <Header user={user} onLogout={onLogout} />
        <main className="checkout-main">
          <div className="checkout-hero">
            <div className="checkout-hero-overlay" aria-hidden="true" />
            <div className="container checkout-hero-content">
              <p className="checkout-hero-eyebrow">Secure Checkout</p>
              <h1 className="checkout-hero-title">Checkout</h1>
            </div>
          </div>
          <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Your cart is empty. Add some items before checking out.
            </p>
            <Link to="/products" style={{
              display: 'inline-block', padding: '13px 28px',
              backgroundColor: 'var(--color-primary)', color: '#fff',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none',
            }}>SHOP NOW</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />
      <main className="checkout-main">

        {/* ── Hero ── */}
        <div className="checkout-hero">
          <div className="checkout-hero-overlay" aria-hidden="true" />
          <div className="container checkout-hero-content">
            <p className="checkout-hero-eyebrow">Secure Checkout</p>
            <h1 className="checkout-hero-title">Complete Your Order</h1>
            <p className="checkout-hero-sub">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your order</p>
          </div>
        </div>

        {/* ── Steps ── */}
        <div className="checkout-steps-bar">
          <div className="container checkout-steps-inner">
            <div className="checkout-step checkout-step--done">
              <span className="checkout-step-num">✓</span>
              <span>Cart</span>
            </div>
            <div className="checkout-step-divider" />
            <div className="checkout-step checkout-step--active">
              <span className="checkout-step-num">2</span>
              <span>Checkout</span>
            </div>
            <div className="checkout-step-divider" />
            <div className="checkout-step">
              <span className="checkout-step-num">3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="container checkout-body">
          <div className="checkout-layout">

            {/* ── Left: Form ── */}
            <div className="checkout-form-col">

              {/* Shipping */}
              <div className="checkout-panel">
                <div className="checkout-panel-header">
                  <div className="checkout-panel-icon"><MapPin size={15} /></div>
                  <h2 className="checkout-panel-title">Shipping Information</h2>
                </div>
                <div className="checkout-panel-body">
                  <div className="checkout-form-grid">
                    {[
                      { name: 'firstName', label: 'First Name',   placeholder: 'John' },
                      { name: 'lastName',  label: 'Last Name',    placeholder: 'Doe'  },
                      { name: 'email',     label: 'Email Address',placeholder: 'john@example.com', full: true },
                      { name: 'phone',     label: 'Phone Number', placeholder: '03XX XXXXXXX' },
                      { name: 'address',   label: 'Street Address',placeholder: 'House #, Street, Area', full: true },
                    ].map(({ name, label, placeholder, full }) => (
                      <div key={name} className={`checkout-field${full ? ' checkout-form-full' : ''}`}>
                        <label className="checkout-label">{label}</label>
                        <input
                          name={name}
                          value={form[name]}
                          onChange={handleField}
                          placeholder={placeholder}
                          className={`checkout-input${formErrors[name] ? ' error' : ''}`}
                        />
                        {formErrors[name] && <span className="checkout-field-error">{formErrors[name]}</span>}
                      </div>
                    ))}

                    {/* City */}
                    <div className="checkout-field">
                      <label className="checkout-label">City</label>
                      <div className="checkout-select-wrap">
                        <select
                          name="city"
                          value={form.city}
                          onChange={handleField}
                          className={`checkout-select${formErrors.city ? ' error' : ''}`}
                        >
                          <option value="">Select city…</option>
                          {PAKISTANI_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {formErrors.city && <span className="checkout-field-error">{formErrors.city}</span>}
                    </div>

                    {/* Postal */}
                    <div className="checkout-field">
                      <label className="checkout-label">Postal Code</label>
                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleField}
                        placeholder="12345"
                        className={`checkout-input${formErrors.postalCode ? ' error' : ''}`}
                      />
                      {formErrors.postalCode && <span className="checkout-field-error">{formErrors.postalCode}</span>}
                    </div>

                    {/* Country */}
                    <div className="checkout-field checkout-form-full">
                      <label className="checkout-label">Country</label>
                      <div className="checkout-select-wrap">
                        <select name="country" value={form.country} onChange={handleField} className="checkout-select">
                          <option>Pakistan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="checkout-panel">
                <div className="checkout-panel-header">
                  <div className="checkout-panel-icon"><Package size={15} /></div>
                  <h2 className="checkout-panel-title">Payment Method</h2>
                </div>
                <div className="checkout-panel-body">
                  <div className="checkout-payment-methods">
                    {PAYMENT_METHODS.map((pm) => (
                      <div
                        key={pm.id}
                        className={`checkout-payment-option${paymentMethod === pm.id ? ' checkout-payment-option--selected' : ''}`}
                        onClick={() => { setPaymentMethod(pm.id); }}
                      >
                        <div className="checkout-payment-option-top">
                          <div className="checkout-payment-radio">
                            {paymentMethod === pm.id && <div className="checkout-payment-radio-dot" />}
                          </div>
                          <div className={`checkout-payment-icon ${pm.iconClass}`}>{pm.iconText}</div>
                          <div className="checkout-payment-info">
                            <p className="checkout-payment-name">{pm.name}</p>
                            <p className="checkout-payment-desc">{pm.desc}</p>
                          </div>
                          {pm.badges && (
                            <div className="checkout-payment-badge-row">
                              {pm.badges.map((b) => (
                                <span key={b} className="checkout-payment-card-badge">{b}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* COD note */}
                        {paymentMethod === pm.id && pm.type === 'cod' && (
                          <div className="checkout-payment-detail" onClick={(e) => e.stopPropagation()}>
                            <p className="checkout-otp-note">
                              Pay in cash when your order is delivered. Please keep exact change ready.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>{/* end form col */}

            {/* ── Right: Summary ── */}
            <aside className="checkout-summary">
              <div className="checkout-summary-card">
                <h2 className="checkout-summary-title">Order Summary</h2>

                <div className="checkout-summary-items">
                  {cart.map((item) => (
                    <div key={item.key} className="checkout-summary-item">
                      <img src={item.product.img} alt={item.product.name} className="checkout-summary-item-img" />
                      <div className="checkout-summary-item-info">
                        <p className="checkout-summary-item-name">{item.product.name}</p>
                        <p className="checkout-summary-item-meta">
                          Qty: {item.qty}
                          {item.size && ` · ${item.size}`}
                          {item.color && ` · ${item.color.name}`}
                        </p>
                      </div>
                      <span className="checkout-summary-item-price">
                        ${(item.product.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-divider" />

                {/* Coupon */}
                <div className="checkout-coupon">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="checkout-coupon-input"
                  />
                  <button className="checkout-coupon-btn" onClick={applyCoupon}>Apply</button>
                </div>
                {appliedCoupon && (
                  <div className="checkout-coupon-applied">
                    <Tag size={12} />
                    <span>{appliedCoupon} applied — {(VALID_COUPONS[appliedCoupon] * 100).toFixed(0)}% off</span>
                  </div>
                )}

                <div className="checkout-summary-rows" style={{ marginTop: 16 }}>
                  <div className="checkout-summary-row">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'checkout-summary-row--free' : ''}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="checkout-summary-row checkout-summary-row--free">
                      <span>Discount ({appliedCoupon})</span>
                      <span>−${discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="checkout-summary-total-row">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {apiError && (
                  <div style={{
                    padding: '10px 14px', marginBottom: 12,
                    background: '#fee2e2', border: '1px solid #fca5a5',
                    borderLeft: '3px solid #ef4444', borderRadius: 4,
                    fontSize: 13, color: '#7f1d1d',
                  }}>
                    {apiError}
                  </div>
                )}
                <button
                  className={`checkout-place-btn${submitting ? ' checkout-place-btn--loading' : ''}`}
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                >
                  {submitting ? 'Processing…' : (
                    <><Lock size={14} /> PLACE ORDER — ${total.toFixed(2)}</>
                  )}
                </button>

                <p className="checkout-secure-note">
                  <Lock size={11} /> Your payment info is encrypted and secure
                </p>
              </div>
            </aside>

          </div>
        </div>

      </main>
      <Footer />

      {/* ── Success modal ── */}
      {successOrderId && (
        <div className="checkout-success-overlay" role="dialog" aria-modal="true" aria-label="Order placed">
          <div className="checkout-success-card">
            <div className="checkout-success-icon-wrap">
              <CheckCircle size={36} className="checkout-success-icon" />
            </div>
            <p className="checkout-success-eyebrow">Order Confirmed</p>
            <h2 className="checkout-success-title">Thank You!</h2>
            <p className="checkout-success-sub">
              Your order has been placed successfully.<br />
              We'll send a confirmation to <strong>{form.email}</strong>.
            </p>
            <span className="checkout-success-order-id">{successOrderId}</span>
            <div className="checkout-success-actions">
              <Link to="/orders" className="checkout-success-btn-primary">
                <ArrowRight size={14} /> VIEW MY ORDERS
              </Link>
              <Link to="/products" className="checkout-success-btn-ghost">
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
