import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ChevronDown, CheckCircle, Truck, MapPin,
  Clock, ShoppingBag, ArrowRight, RotateCcw, MessageSquare,
} from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/footer';
import { useShop } from '../context/ShopContext';
import './Orders.css';

/* ── Status config ── */
const STATUS_CONFIG = {
  processing: { label: 'Processing',  badgeClass: 'order-status-badge--processing' },
  confirmed:  { label: 'Confirmed',   badgeClass: 'order-status-badge--confirmed'  },
  shipped:    { label: 'Shipped',     badgeClass: 'order-status-badge--shipped'    },
  delivered:  { label: 'Delivered',   badgeClass: 'order-status-badge--delivered'  },
  cancelled:  { label: 'Cancelled',   badgeClass: 'order-status-badge--cancelled'  },
};

const TIMELINE_STEPS = [
  { key: 'processing', label: 'Order\nPlaced',   icon: Clock       },
  { key: 'confirmed',  label: 'Confirmed',        icon: CheckCircle },
  { key: 'shipped',    label: 'Shipped',           icon: Truck       },
  { key: 'delivered',  label: 'Delivered',         icon: Package     },
];

const STATUS_ORDER = ['processing', 'confirmed', 'shipped', 'delivered'];

const PAYMENT_LABELS = {
  easypaisa: 'EasyPaisa',
  jazzcash:  'JazzCash',
  card:      'Card',
  cod:       'Cash on Delivery',
};

const FILTER_TABS = [
  { key: 'all',        label: 'All'       },
  { key: 'processing', label: 'Processing'},
  { key: 'shipped',    label: 'Shipped'   },
  { key: 'delivered',  label: 'Delivered' },
];

/* ── Helpers ── */
const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const getStepState = (stepKey, currentStatus) => {
  const stepIdx    = STATUS_ORDER.indexOf(stepKey);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentIdx === -1) return 'pending';
  if (stepIdx < currentIdx)  return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
};

/* ── Single order card ── */
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;

  return (
    <div className="order-card">

      {/* Header */}
      <div className="order-card-header">
        <div className="order-card-meta">
          <span className="order-card-id">{order.id}</span>
          <span className="order-card-date">Placed on {formatDate(order.placedAt)}</span>
        </div>

        <div className="order-card-header-right">
          <span className="order-payment-pill">
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
          </span>
          <span className={`order-status-badge ${cfg.badgeClass}`}>
            <span className="order-status-dot" />
            {cfg.label}
          </span>
          <span className="order-card-total">${order.total.toFixed(2)}</span>
          <button
            className="order-card-toggle"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse order' : 'Expand order'}
          >
            {expanded ? 'Hide' : 'Details'}
            <ChevronDown
              size={14}
              className={`order-card-chevron${expanded ? ' order-card-chevron--open' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Collapsed preview: first 2 item thumbnails */}
      {!expanded && (
        <div style={{ display: 'flex', gap: 10, padding: '14px 24px', alignItems: 'center' }}>
          {order.items.slice(0, 3).map((item) => (
            <img
              key={item.key}
              src={item.product.img}
              alt={item.product.name}
              style={{ width: 48, height: 58, objectFit: 'cover', backgroundColor: '#f3f4f6' }}
            />
          ))}
          {order.items.length > 3 && (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
              +{order.items.length - 3} more
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* Expanded body */}
      {expanded && (
        <div className="order-card-body">

          {/* Timeline */}
          <div className="order-timeline" role="list" aria-label="Order status timeline">
            {TIMELINE_STEPS.map((step) => {
              const state = getStepState(step.key, order.status);
              const StepIcon = step.icon;
              const timelineEntry = order.timeline?.find((t) => t.status === step.key);
              return (
                <div
                  key={step.key}
                  className={`order-timeline-step order-timeline-step--${state}`}
                  role="listitem"
                >
                  <div className="order-timeline-dot">
                    {(state === 'done' || state === 'active') && (
                      <StepIcon size={13} className="order-timeline-dot-icon" />
                    )}
                  </div>
                  <span className="order-timeline-label">{step.label}</span>
                  {timelineEntry?.date && (
                    <span className="order-timeline-date">{formatDate(timelineEntry.date)}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Items */}
          <p className="order-items-section-title">Items Ordered</p>
          <div className="order-items-list">
            {order.items.map((item) => (
              <div key={item.key} className="order-item-row">
                <Link to={`/product/${item.product.id}`}>
                  <img src={item.product.img} alt={item.product.name} className="order-item-img" />
                </Link>
                <div className="order-item-info">
                  <Link to={`/product/${item.product.id}`} className="order-item-name">
                    {item.product.name}
                  </Link>
                  <p className="order-item-meta">{item.product.category}</p>
                  <div className="order-item-variants">
                    {item.size  && <span className="order-item-tag">Size: {item.size}</span>}
                    {item.color && <span className="order-item-tag">{item.color.name}</span>}
                  </div>
                </div>
                <div className="order-item-price-col">
                  <p className="order-item-qty">× {item.qty}</p>
                  <p className="order-item-line-total">${(item.product.price * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="order-totals">
            <div className="order-totals-row">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className={`order-totals-row${order.shipping === 0 ? ' order-totals-row--free' : ''}`}>
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="order-totals-row order-totals-row--discount">
                <span>Discount {order.coupon && `(${order.coupon})`}</span>
                <span>−${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="order-totals-row order-totals-row--total">
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="order-address-section">
              <p className="order-address-title">
                <MapPin size={12} style={{ display:'inline', marginRight:4 }} />
                Delivery Address
              </p>
              <p className="order-address-text">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}

        </div>
      )}

      {/* Footer actions */}
      <div className="order-card-footer">
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
            Estimated delivery: 3–5 business days
          </span>
        )}
        {order.status === 'delivered' && (
          <Link to="/products" className="order-action-btn order-action-btn--primary">
            <RotateCcw size={12} /> Buy Again
          </Link>
        )}
        <Link to="/contact" className="order-action-btn order-action-btn--ghost">
          <MessageSquare size={12} /> Help
        </Link>
      </div>

    </div>
  );
};

/* ── Main page component ── */
const Orders = ({ user, onLogout }) => {
  const { orders, ordersLoading, loadOrders } = useShop();
  const [activeFilter, setActiveFilter] = useState('all');

  // Re-fetch orders when page mounts so it's always fresh
  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = activeFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="page-wrapper">
      <Header user={user} onLogout={onLogout} />

      <main className="orders-main">

        {/* ── Hero ── */}
        <div className="orders-hero">
          <div className="orders-hero-overlay" aria-hidden="true" />
          <div className="container orders-hero-content">
            <p className="orders-hero-eyebrow">Your Account</p>
            <h1 className="orders-hero-title">My Orders</h1>
            {orders.length > 0 && (
              <p className="orders-hero-sub">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
              </p>
            )}
          </div>
        </div>

        <div className="container orders-body">

          {ordersLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 24px' }}>
              <div style={{
                width: 40, height: 40,
                border: '3px solid #e5e7eb', borderTopColor: '#D4AF37',
                borderRadius: '50%', animation: 'orders-spin 0.7s linear infinite',
              }} />
              <p style={{ fontSize: 14, color: '#9CA3AF' }}>Loading your orders…</p>
              <style>{`@keyframes orders-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : orders.length === 0 ? (
            /* ── Empty state ── */
            <div className="orders-empty">
              <div className="orders-empty-icon-wrap">
                <ShoppingBag size={44} className="orders-empty-icon" />
              </div>
              <h2 className="orders-empty-title">No orders yet</h2>
              <p className="orders-empty-sub">
                You haven't placed any orders.<br />
                Start shopping to see your order history here.
              </p>
              <Link to="/products" className="orders-empty-btn">
                <ArrowRight size={14} /> SHOP NOW
              </Link>
            </div>
          ) : (
            <>
              {/* ── Filter bar ── */}
              <div className="orders-filter-bar">
                <div className="orders-filter-tabs" role="tablist" aria-label="Filter orders">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      role="tab"
                      aria-selected={activeFilter === tab.key}
                      className={`orders-filter-tab${activeFilter === tab.key ? ' orders-filter-tab--active' : ''}`}
                      onClick={() => setActiveFilter(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <p className="orders-count-label">
                  Showing <strong>{filtered.length}</strong> of {orders.length} orders
                </p>
              </div>

              {filtered.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '48px 24px',
                  background: '#fff', border: '1px solid var(--color-border)',
                  fontSize: 14, color: 'var(--color-text-secondary)',
                }}>
                  No orders match this filter.
                </div>
              ) : (
                <div className="orders-list">
                  {filtered.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
