import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, RefreshCw, Shield, Lock } from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { useShop } from '../context/ShopContext';
import './Cart.css';

const TRUST_ITEMS = [
  { icon: Truck,     text: 'Free shipping over $200' },
  { icon: RefreshCw, text: '30-day free returns'     },
  { icon: Shield,    text: 'Buyer protection'        },
  { icon: Lock,      text: 'Secure checkout'         },
];

const Cart = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { cart, cartCount, cartSubtotal, cartLoading, removeFromCart, updateCartQty, clearCart } = useShop();

  const shipping        = cartSubtotal >= 200 ? 0 : 15;
  const total           = cartSubtotal + shipping;
  const freeShipLeft    = Math.max(0, 200 - cartSubtotal);
  const freeShipPercent = Math.min(100, (cartSubtotal / 200) * 100);

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main className="cart-main">

        {/* ── Hero Banner ── */}
        <div className="cart-hero">
          <div className="cart-hero-overlay" aria-hidden="true" />
          <div className="container cart-hero-content">
            <p className="cart-hero-eyebrow">Your Selection</p>
            <h1 className="cart-hero-title">Shopping Cart</h1>
            {cartCount > 0 && (
              <p className="cart-hero-sub">{cartCount} {cartCount === 1 ? 'item' : 'items'} ready for checkout</p>
            )}
          </div>
        </div>

        {/* ── Promo banner ── */}
        <div className="cart-promo-bar">
          <Tag size={14} />
          <span>Use code <strong>LUXE10</strong> at checkout for 10% off your first order</span>
        </div>

        <div className="container cart-body">

          {cartLoading ? (
            /* ── Loading state ── */
            <div className="cart-loading">
              <div className="cart-loading-spinner" />
              <p className="cart-loading-text">Loading your cart…</p>
            </div>
          ) : cart.length === 0 ? (
            /* ── Empty state ── */
            <div className="cart-empty">
              <div className="cart-empty-illustration">
                <div className="cart-empty-circle cart-empty-circle--outer" />
                <div className="cart-empty-circle cart-empty-circle--inner" />
                <ShoppingBag size={52} className="cart-empty-bag-icon" />
              </div>
              <h2 className="cart-empty-title">Your cart is empty</h2>
              <p className="cart-empty-sub">
                Looks like you haven't added anything yet.<br />
                Explore our curated collections to find something you'll love.
              </p>
              <div className="cart-empty-actions">
                <Link to="/" className="cart-empty-btn-primary">SHOP ALL PRODUCTS</Link>
                <Link to="/categories" className="cart-empty-btn-ghost">Browse Categories</Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── Free shipping progress ── */}
              {freeShipLeft > 0 ? (
                <div className="cart-ship-progress">
                  <div className="cart-ship-progress-text">
                    <Truck size={15} />
                    <span>Add <strong>${freeShipLeft.toFixed(2)}</strong> more for free shipping</span>
                  </div>
                  <div className="cart-ship-bar">
                    <div className="cart-ship-bar-fill" style={{ width: `${freeShipPercent}%` }} />
                  </div>
                </div>
              ) : (
                <div className="cart-ship-progress cart-ship-progress--achieved">
                  <Truck size={15} />
                  <span>🎉 You've unlocked <strong>free shipping!</strong></span>
                </div>
              )}

              <div className="cart-layout">

                {/* ── Left: Items ── */}
                <div className="cart-items-col">
                  <div className="cart-items-header">
                    <span className="cart-items-heading">Order Items</span>
                    <button className="cart-clear-btn" onClick={clearCart}>Clear all</button>
                  </div>

                  {cart.map((item) => (
                    <div key={item.key} className="cart-item">
                      {/* Image */}
                      <Link to={`/product/${item.product.id}`} className="cart-item-img-wrap">
                        <img src={item.product.img} alt={item.product.name} className="cart-item-img" />
                      </Link>

                      {/* Info */}
                      <div className="cart-item-body">
                        <div className="cart-item-top">
                          <div>
                            <p className="cart-item-category">{item.product.category}</p>
                            <Link to={`/product/${item.product.id}`} className="cart-item-name">
                              {item.product.name}
                            </Link>
                            <div className="cart-item-variants">
                              {item.size && (
                                <span className="cart-item-tag">Size: {item.size}</span>
                              )}
                              {item.color && (
                                <span className="cart-item-tag cart-item-tag--color">
                                  <span
                                    className="cart-item-color-dot"
                                    style={{ backgroundColor: item.color.hex }}
                                  />
                                  {item.color.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            className="cart-item-remove"
                            onClick={() => removeFromCart(item.key)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="cart-item-bottom">
                          {/* Qty */}
                          <div className="cart-item-qty">
                            <button
                              className="cart-qty-btn"
                              onClick={() => updateCartQty(item.key, item.qty - 1)}
                              disabled={item.qty <= 1}
                              aria-label="Decrease"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="cart-qty-val">{item.qty}</span>
                            <button
                              className="cart-qty-btn"
                              onClick={() => updateCartQty(item.key, item.qty + 1)}
                              aria-label="Increase"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="cart-item-pricing">
                            <span className="cart-item-unit-price">${item.product.price} each</span>
                            <span className="cart-item-line-total">
                              ${(item.product.price * item.qty).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Right: Summary ── */}
                <aside className="cart-summary">
                  <div className="cart-summary-card">
                    <h2 className="cart-summary-title">Order Summary</h2>

                    <div className="cart-summary-rows">
                      <div className="cart-summary-row">
                        <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                        <span>${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span className={shipping === 0 ? 'cart-free-tag' : ''}>
                          {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="cart-summary-row">
                        <span>Tax (est.)</span>
                        <span>Calculated at checkout</span>
                      </div>
                    </div>

                    <div className="cart-summary-total-row">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>

                    {/* Coupon */}
                    <div className="cart-coupon">
                      <input
                        type="text"
                        placeholder="Promo code"
                        className="cart-coupon-input"
                        defaultValue="LUXE10"
                      />
                      <button className="cart-coupon-btn">Apply</button>
                    </div>

                    <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
                      PROCEED TO CHECKOUT
                      <ArrowRight size={16} />
                    </button>

                    <Link to="/" className="cart-continue-link">← Continue Shopping</Link>

                    {/* Trust mini badges */}
                    <div className="cart-summary-trust">
                      <Lock size={12} />
                      <span>256-bit SSL encrypted checkout</span>
                    </div>
                  </div>

                  {/* Accepted payments */}
                  <div className="cart-payments">
                    {['Visa', 'Mastercard', 'EasyPaisa', 'JazzCash', 'PayPal'].map((m) => (
                      <span key={m} className="cart-payment-badge">{m}</span>
                    ))}
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>

        {/* ── Trust strip ── */}
        <div className="cart-trust-strip">
          <div className="container cart-trust-inner">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="cart-trust-item">
                <Icon size={18} className="cart-trust-icon" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Cart;
