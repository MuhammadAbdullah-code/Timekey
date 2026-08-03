import React, { useState, useEffect, useCallback, useMemo } from 'react';
import userService from '../../services/userService';
import './AdminCustomers.css';

const PAGE_SIZE = 20;

const ROLE_FILTERS = [
  { key: 'all',   label: 'All'   },
  { key: 'user',  label: 'Users' },
  { key: 'admin', label: 'Admins' },
];

const getInitials = (fullName, email) => {
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email ?? '?').slice(0, 2).toUpperCase();
};

const AdminCustomers = () => {
  const [customers,   setCustomers]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [page,        setPage]        = useState(0); // 0-indexed
  const [hasMore,     setHasMore]     = useState(false);

  const fetchCustomers = useCallback(async (pageIndex = 0) => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await userService.getUsers(pageIndex * PAGE_SIZE, PAGE_SIZE);
      const list = Array.isArray(data) ? data : [];
      setCustomers(list);
      setHasMore(list.length === PAGE_SIZE);
      setPage(pageIndex);
    } catch (err) {
      setFetchError(err.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(0); }, [fetchCustomers]);

  const filtered = useMemo(() => customers.filter(c => {
    const matchRole = roleFilter === 'all' || c.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (c.email ?? '').toLowerCase().includes(q)
      || (c.full_name ?? '').toLowerCase().includes(q)
      || (c.id ?? '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  }), [customers, roleFilter, search]);

  const stats = useMemo(() => ({
    total:    customers.length,
    active:   customers.filter(c => c.is_active).length,
    inactive: customers.filter(c => !c.is_active).length,
  }), [customers]);

  return (
    <div className="ac-root">
      <style>{`@keyframes ac-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div className="ac-header">
        <div>
          <h1 className="ac-title">Customers</h1>
          <p className="ac-sub">
            {loading ? 'Loading…' : `${customers.length} customers on this page`}
          </p>
        </div>
        <button className="ac-refresh-btn" onClick={() => fetchCustomers(page)} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
            style={{ animation: loading ? 'ac-spin 0.8s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* ── Stats strip ── */}
      {!loading && !fetchError && (
        <div className="ac-stats">
          {[
            { label: 'Total Customers', val: stats.total,    color: '#0B1328' },
            { label: 'Active',          val: stats.active,   color: '#059669' },
            { label: 'Inactive',        val: stats.inactive, color: '#dc2626' },
          ].map(s => (
            <div key={s.label} className="ac-stat-card">
              <p className="ac-stat-val" style={{ color: s.color }}>{s.val}</p>
              <p className="ac-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="ac-filters">
        <div className="ac-search-wrap">
          <svg className="ac-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="ac-search-input"
            placeholder="Search by name, email, or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="ac-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="ac-role-tabs">
          {ROLE_FILTERS.map(f => (
            <button key={f.key}
              className={`ac-role-tab${roleFilter === f.key ? ' ac-role-tab--active' : ''}`}
              onClick={() => setRoleFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        {!loading && (
          <p className="ac-results-label">
            Showing <strong>{filtered.length}</strong> of {customers.length}
          </p>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="ac-table-wrap">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Customer</th><th>Email</th><th>ID</th><th>Role</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} className="ac-table-row">
                  {[1,2,3,4,5].map(j => <td key={j}><div className="ac-skeleton" /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && fetchError && (
        <div className="ac-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{fetchError}</span>
          <button className="ac-retry-btn" onClick={() => fetchCustomers(page)}>Retry</button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !fetchError && filtered.length === 0 && (
        <div className="ac-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <p>
            {customers.length === 0
              ? 'No customers found. Registered users will appear here.'
              : 'No customers match your search or filter.'}
          </p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div className="ac-table-wrap">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(customer => {
                const initials = getInitials(customer.full_name, customer.email);
                return (
                  <tr key={customer.id} className="ac-table-row">
                    <td>
                      <div className="ac-customer-cell">
                        <div className="ac-avatar">{initials}</div>
                        <div>
                          <p className="ac-customer-name">
                            {customer.full_name || '—'}
                          </p>
                          <p className="ac-customer-email-sub">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="ac-email-cell" title={customer.email}>{customer.email}</p>
                    </td>
                    <td>
                      <p className="ac-id-cell" title={customer.id}>{customer.id}</p>
                    </td>
                    <td>
                      <span className={`ac-badge ${customer.role === 'admin' ? 'ac-badge--admin' : 'ac-badge--user'}`}>
                        <span className="ac-badge-dot" />
                        {customer.role ?? 'user'}
                      </span>
                    </td>
                    <td>
                      <span className={`ac-badge ${customer.is_active ? 'ac-badge--active' : 'ac-badge--inactive'}`}>
                        <span className="ac-badge-dot" />
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !fetchError && customers.length > 0 && (
        <div className="ac-pagination">
          <p className="ac-pagination-info">
            Page <strong>{page + 1}</strong> — showing {customers.length} customers
          </p>
          <div className="ac-pagination-btns">
            <button
              className="ac-page-btn"
              onClick={() => fetchCustomers(page - 1)}
              disabled={page === 0}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Previous
            </button>
            <button
              className="ac-page-btn"
              onClick={() => fetchCustomers(page + 1)}
              disabled={!hasMore}>
              Next
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
