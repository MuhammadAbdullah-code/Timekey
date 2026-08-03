import React, { useState, useEffect, useCallback, useMemo } from 'react';
import orderService from '../../services/orderService';
import './AdminOrders.css';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    cls: 'ao-badge--pending'    },
  processing: { label: 'Processing', cls: 'ao-badge--processing' },
  confirmed:  { label: 'Confirmed',  cls: 'ao-badge--confirmed'  },
  shipped:    { label: 'Shipped',    cls: 'ao-badge--shipped'    },
  delivered:  { label: 'Delivered',  cls: 'ao-badge--delivered'  },
  cancelled:  { label: 'Cancelled',  cls: 'ao-badge--cancelled'  },
};

const STATUS_FILTERS = [
  { key: 'all',        label: 'All'        },
  { key: 'pending',    label: 'Pending'    },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped',    label: 'Shipped'    },
  { key: 'delivered',  label: 'Delivered'  },
  { key: 'cancelled',  label: 'Cancelled'  },
];

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const fmtTime = (iso) => iso
  ? new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
  : '';

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const [newStatus,    setNewStatus]    = React.useState(order.status ?? 'pending');
  const [saving,       setSaving]       = React.useState(false);
  const [saveError,    setSaveError]    = React.useState('');
  const [saveSuccess,  setSaveSuccess]  = React.useState(false);

  const handleStatusSave = async () => {
    if (newStatus === order.status) return;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await orderService.updateOrderStatus(order.id, newStatus);
      onStatusUpdate(order.id, newStatus, updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError(err.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  return (
  <div className="ao-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
    <div className="ao-modal" onClick={e => e.stopPropagation()}>
      <div className="ao-modal-header">
        <div>
          <p className="ao-modal-eyebrow">Order Details</p>
          <h2 className="ao-modal-title">{order.id}</h2>
        </div>
        <button className="ao-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="ao-modal-body">
        <div className="ao-modal-meta-row">
          <div className="ao-modal-meta-item">
            <p className="ao-modal-meta-label">Placed On</p>
            <p className="ao-modal-meta-value">{fmtDate(order.created_at)} {fmtTime(order.created_at)}</p>
          </div>
          <div className="ao-modal-meta-item">
            <p className="ao-modal-meta-label">Current Status</p>
            <span className={`ao-badge ${(STATUS_CONFIG[order.status] || STATUS_CONFIG.pending).cls}`}>
              <span className="ao-badge-dot" />
              {(STATUS_CONFIG[order.status] || STATUS_CONFIG.pending).label}
            </span>
          </div>
          <div className="ao-modal-meta-item">
            <p className="ao-modal-meta-label">Order Total</p>
            <p className="ao-modal-meta-value ao-modal-meta-value--total">${(order.total ?? 0).toFixed(2)}</p>
          </div>
          <div className="ao-modal-meta-item">
            <p className="ao-modal-meta-label">User ID</p>
            <p className="ao-modal-meta-value ao-modal-meta-value--mono">{order.user_id ?? '—'}</p>
          </div>
        </div>

        {/* ── Status update section ── */}
        <div className="ao-status-update-section">
          <p className="ao-modal-section-title">Update Order Status</p>
          <div className="ao-status-update-row">
            <select
              className="ao-status-select"
              value={newStatus}
              onChange={e => { setNewStatus(e.target.value); setSaveError(''); setSaveSuccess(false); }}
              disabled={saving}
            >
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <button
              className="ao-status-save-btn"
              onClick={handleStatusSave}
              disabled={saving || newStatus === order.status}
            >
              {saving ? 'Saving…' : 'Update Status'}
            </button>
          </div>
          {saveError && (
            <p className="ao-status-error">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p className="ao-status-success">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Status updated successfully!
            </p>
          )}
        </div>
        {order.shipping_address && (
          <div className="ao-modal-section">
            <p className="ao-modal-section-title">Shipping Address</p>
            <p className="ao-modal-address">{order.shipping_address}</p>
          </div>
        )}
        <div className="ao-modal-section">
          <p className="ao-modal-section-title">
            Items ({Array.isArray(order.items) ? order.items.length : 0})
          </p>
          {!Array.isArray(order.items) || order.items.length === 0 ? (
            <p className="ao-modal-no-items">No item details returned by the API.</p>
          ) : (
            <div className="ao-modal-items">
              {order.items.map((item, i) => (
                <div key={i} className="ao-modal-item-row">
                  <div className="ao-modal-item-img">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.product_name ?? ''} />
                      : <span>{(item.product_name ?? item.name ?? 'P')[0]}</span>}
                  </div>
                  <div className="ao-modal-item-info">
                    <p className="ao-modal-item-name">{item.product_name ?? item.name ?? item.product_id ?? '—'}</p>
                    <p className="ao-modal-item-meta">Qty: {item.quantity ?? 1}</p>
                  </div>
                  <p className="ao-modal-item-price">
                    ${((item.price ?? item.unit_price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ao-modal-total-row">
          <span>Total Paid</span>
          <strong>${(order.total ?? 0).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  </div>
  );
};

const AdminOrders = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected,     setSelected]     = useState(null);

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setSelected(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = useMemo(() => orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (o.id ?? '').toLowerCase().includes(q)
      || (o.user_id ?? '').toLowerCase().includes(q)
      || (o.shipping_address ?? '').toLowerCase().includes(q)
      || String(o.total ?? '').includes(q);
    return matchStatus && matchSearch;
  }), [orders, statusFilter, search]);

  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   orders.reduce((s, o) => s + (o.total ?? 0), 0),
  }), [orders]);

  return (
    <div className="ao-root">
      <style>{`@keyframes ao-spin { to { transform: rotate(360deg); } }`}</style>

      <div className="ao-header">
        <div>
          <h1 className="ao-title">Orders</h1>
          <p className="ao-sub">{loading ? 'Loading…' : `${orders.length} total orders`}</p>
        </div>
        <button className="ao-refresh-btn" onClick={fetchOrders} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
            style={{ animation: loading ? 'ao-spin 0.8s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {!loading && !fetchError && (
        <div className="ao-stats">
          {[
            { label: 'Total Orders', val: stats.total,                    color: '#0B1328' },
            { label: 'Pending',      val: stats.pending,                  color: '#d97706' },
            { label: 'Shipped',      val: stats.shipped,                  color: '#7c3aed' },
            { label: 'Delivered',    val: stats.delivered,                color: '#059669' },
            { label: 'Revenue',      val: `$${stats.revenue.toFixed(2)}`, color: '#D4AF37' },
          ].map(s => (
            <div key={s.label} className="ao-stat-card">
              <p className="ao-stat-val" style={{ color: s.color }}>{s.val}</p>
              <p className="ao-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="ao-filters">
        <div className="ao-search-wrap">
          <svg className="ao-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="ao-search-input"
            placeholder="Search by order ID, user, address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="ao-search-clear" onClick={() => setSearch('')} aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="ao-status-tabs">
          {STATUS_FILTERS.map(f => (
            <button key={f.key}
              className={`ao-status-tab${statusFilter === f.key ? ' ao-status-tab--active' : ''}`}
              onClick={() => setStatusFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        {!loading && (
          <p className="ao-results-label">
            Showing <strong>{filtered.length}</strong> of {orders.length}
          </p>
        )}
      </div>

      {loading && (
        <div className="ao-table-wrap">
          <table className="ao-table">
            <thead><tr><th>Order ID</th><th>User ID</th><th>Address</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} className="ao-table-row">
                  {[1,2,3,4,5,6,7,8].map(j => <td key={j}><div className="ao-skeleton" /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && fetchError && (
        <div className="ao-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{fetchError}</span>
          <button className="ao-retry-btn" onClick={fetchOrders}>Retry</button>
        </div>
      )}

      {!loading && !fetchError && filtered.length === 0 && (
        <div className="ao-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p>{orders.length === 0 ? 'No orders yet. Orders appear here once customers place them.' : 'No orders match your filters.'}</p>
        </div>
      )}

      {!loading && !fetchError && filtered.length > 0 && (
        <div className="ao-table-wrap">
          <table className="ao-table">
            <thead>
              <tr>
                <th>Order ID</th><th>User ID</th><th>Address</th>
                <th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                return (
                  <tr key={order.id} className="ao-table-row">
                    <td><p className="ao-order-id" title={order.id}>{order.id}</p></td>
                    <td><p className="ao-user-id" title={order.user_id ?? ''}>{order.user_id ?? '—'}</p></td>
                    <td>
                      <p className="ao-address-cell" title={order.shipping_address ?? ''}>
                        {order.shipping_address
                          ? order.shipping_address.length > 28
                            ? order.shipping_address.slice(0, 28) + '…'
                            : order.shipping_address
                          : '—'}
                      </p>
                    </td>
                    <td><span className="ao-items-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></td>
                    <td><span className="ao-total">${(order.total ?? 0).toFixed(2)}</span></td>
                    <td>
                      <span className={`ao-badge ${cfg.cls}`}>
                        <span className="ao-badge-dot" />{cfg.label}
                      </span>
                    </td>
                    <td>
                      <p className="ao-date">{fmtDate(order.created_at)}</p>
                      <p className="ao-time">{fmtTime(order.created_at)}</p>
                    </td>
                    <td>
                      <button className="ao-view-btn" onClick={() => setSelected(order)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default AdminOrders;
