import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import orderService from '../../services/orderService';
import './AdminLayout.css';

const NAV_ITEMS = [
  { label: 'Overview',   to: '/admin',              icon: 'Overview'    },
  { label: 'Orders',     to: '/admin/orders',        icon: 'Orders'      },
  { label: 'Categories', to: '/admin/categories',    icon: 'Categories'  },
  { label: 'Products',   to: '/admin/products',      icon: 'Products'    },
  { label: 'Customers',  to: '/admin/customers',     icon: 'Customers'   },
  { label: 'Analytics',  to: '/admin/analytics',     icon: 'Analytics'   },
  { label: 'Settings',   to: '/admin/settings',      icon: 'Settings'    },
];

/* Pure-CSS icon glyphs — no external icon library */
const NavIcon = ({ type }) => {
  const icons = {
    Overview:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Orders:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    Products:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    Categories: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Customers:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    Analytics:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Settings:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  };
  return icons[type] || null;
};

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [notifLoading,  setNotifLoading]  = useState(false);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  /* ── Fetch latest pending orders for notification bell ── */
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const all = await orderService.getOrders();
      const pending = Array.isArray(all)
        ? all.filter(o => o.status === 'pending' || o.status === 'processing').slice(0, 8)
        : [];
      setPendingOrders(pending);
    } catch { /* silent */ }
    finally { setNotifLoading(false); }
  }, []);

  /* Fetch on mount */
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  /* Close notif dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="adm-shell">
      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'adm-sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="adm-sidebar-logo">
          <div className="adm-logo-icon">T</div>
          <span className="adm-logo-text">Timekey</span>
        </div>

        {/* Admin badge */}
        <div className="adm-sidebar-role">
          <span className="adm-role-dot" />
          <span className="adm-role-label">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="adm-nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `adm-nav-link ${isActive ? 'adm-nav-link--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="adm-nav-icon"><NavIcon type={item.icon} /></span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="adm-sidebar-footer">
          <div className="adm-avatar-initials" aria-hidden="true">
            {(admin?.full_name || admin?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="adm-user-info">
            <p className="adm-user-name">{admin?.full_name || admin?.email || 'Admin'}</p>
            <p className="adm-user-role">Administrator</p>
          </div>
          <button className="adm-logout-btn" onClick={handleLogout} title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="adm-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* ── Main area ── */}
      <div className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <button
            className="adm-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="adm-topbar-search">
            <svg className="adm-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search orders, products..." className="adm-search-input" />
          </div>

          <div className="adm-topbar-actions">

            {/* ── Notification bell ── */}
            <div className="adm-notif-wrap" ref={notifRef}>
              <button
                className={`adm-topbar-btn${notifOpen ? ' adm-topbar-btn--active' : ''}`}
                aria-label="Notifications"
                onClick={() => { setNotifOpen(p => !p); if (!notifOpen) fetchNotifications(); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {pendingOrders.length > 0 && (
                  <span className="adm-notif-badge">{pendingOrders.length > 9 ? '9+' : pendingOrders.length}</span>
                )}
              </button>

              {notifOpen && (
                <div className="adm-notif-dropdown">
                  <div className="adm-notif-header">
                    <span className="adm-notif-title">Notifications</span>
                    <button
                      className="adm-notif-refresh"
                      onClick={fetchNotifications}
                      disabled={notifLoading}
                      aria-label="Refresh"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                        style={{ animation: notifLoading ? 'adm-spin 0.8s linear infinite' : 'none' }}>
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                      </svg>
                    </button>
                  </div>

                  {notifLoading && (
                    <div className="adm-notif-loading">
                      <div className="adm-notif-spinner" />
                      <span>Loading…</span>
                    </div>
                  )}

                  {!notifLoading && pendingOrders.length === 0 && (
                    <div className="adm-notif-empty">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 01-3.46 0"/>
                      </svg>
                      <p>No pending orders</p>
                    </div>
                  )}

                  {!notifLoading && pendingOrders.length > 0 && (
                    <div className="adm-notif-list">
                      {pendingOrders.map(order => (
                        <button
                          key={order.id}
                          className="adm-notif-item"
                          onClick={() => { setNotifOpen(false); navigate('/admin/orders'); }}
                        >
                          <div className="adm-notif-item-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 01-8 0"/>
                            </svg>
                          </div>
                          <div className="adm-notif-item-body">
                            <p className="adm-notif-item-title">New Order</p>
                            <p className="adm-notif-item-sub">
                              {order.id?.slice(0, 18)}… · ${(order.total ?? 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="adm-notif-item-right">
                            <span className={`adm-notif-status adm-notif-status--${order.status}`}>
                              {order.status}
                            </span>
                            <span className="adm-notif-date">{fmtDate(order.created_at)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="adm-notif-footer">
                    <button
                      className="adm-notif-view-all"
                      onClick={() => { setNotifOpen(false); navigate('/admin/orders'); }}
                    >
                      View all orders →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Orders bag — navigates to /admin/orders ── */}
            <button
              className="adm-topbar-btn"
              aria-label="Go to orders"
              title="Orders"
              onClick={() => navigate('/admin/orders')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>

          </div>
        </header>

        {/* Page content */}
        <div className="adm-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
