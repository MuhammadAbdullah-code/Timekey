import React, { useState, useEffect, useCallback } from 'react';
import analyticsService from '../../services/analyticsService';
import './AdminAnalytics.css';

/* ── Helpers ── */
const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const fmtCurrency = (n) => n == null ? '—' : `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPeriod = (p, groupBy) => {
  if (!p) return '';
  if (groupBy === 'daily') {
    try { return new Date(p).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }); } catch { return p; }
  }
  return p;
};

/* ── Summary stat cards config ── */
const STAT_CARDS = [
  {
    key: 'total_revenue',
    label: 'Total Revenue',
    format: fmtCurrency,
    iconCls: 'aa-stat-icon--green',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
  },
  {
    key: 'total_orders',
    label: 'Total Orders',
    format: fmt,
    iconCls: 'aa-stat-icon--blue',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    key: 'total_customers',
    label: 'Total Customers',
    format: fmt,
    iconCls: 'aa-stat-icon--purple',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    key: 'avg_order_value',
    label: 'Avg Order Value',
    format: fmtCurrency,
    iconCls: 'aa-stat-icon--gold',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

const AdminAnalytics = () => {
  const [groupBy,      setGroupBy]      = useState('monthly');
  const [summary,      setSummary]      = useState(null);
  const [revenue,      setRevenue]      = useState(null);
  const [topProducts,  setTopProducts]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [revenueLoad,  setRevenueLoad]  = useState(false);
  const [error,        setError]        = useState('');

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async (gb = groupBy) => {
    setLoading(true);
    setError('');
    try {
      const [sumData, revData, prodData] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getRevenue(gb),
        analyticsService.getTopProducts(10),
      ]);
      setSummary(sumData);
      setRevenue(revData);
      setTopProducts(prodData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [groupBy]);

  useEffect(() => { fetchAll(); }, []);

  /* ── Switch group_by ── */
  const switchGroup = async (gb) => {
    if (gb === groupBy) return;
    setGroupBy(gb);
    setRevenueLoad(true);
    try {
      const revData = await analyticsService.getRevenue(gb);
      setRevenue(revData);
    } catch { /* keep existing */ }
    finally { setRevenueLoad(false); }
  };

  /* ── Chart helpers ── */
  const revenueData = revenue?.data ?? [];
  const maxRevenue  = Math.max(...revenueData.map(d => d.revenue ?? 0), 1);
  const prodData    = topProducts?.data ?? [];
  const maxSold     = Math.max(...prodData.map(p => p.total_sold ?? 0), 1);

  return (
    <div className="aa-root">
      <style>{`@keyframes aa-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div className="aa-header">
        <div>
          <h1 className="aa-title">Analytics</h1>
          <p className="aa-sub">Store performance overview</p>
        </div>
        <div className="aa-header-right">
          <div className="aa-group-tabs">
            <button
              className={`aa-group-tab${groupBy === 'daily' ? ' aa-group-tab--active' : ''}`}
              onClick={() => switchGroup('daily')}
            >Daily</button>
            <button
              className={`aa-group-tab${groupBy === 'monthly' ? ' aa-group-tab--active' : ''}`}
              onClick={() => switchGroup('monthly')}
            >Monthly</button>
          </div>
          <button
            className="aa-refresh-btn"
            onClick={() => fetchAll(groupBy)}
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              style={{ animation: loading ? 'aa-spin 0.8s linear infinite' : 'none' }}>
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {!loading && error && (
        <div className="aa-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
          <button className="aa-retry-btn" onClick={() => fetchAll(groupBy)}>Retry</button>
        </div>
      )}

      {/* ── Summary stat cards ── */}
      <div className="aa-stats">
        {STAT_CARDS.map(card => (
          <div key={card.key} className="aa-stat-card">
            <div className={`aa-stat-icon ${card.iconCls}`}>{card.icon}</div>
            <div className="aa-stat-body">
              {loading
                ? <div className="aa-skeleton aa-stat-skeleton" />
                : <p className="aa-stat-val">{card.format(summary?.[card.key])}</p>
              }
              <p className="aa-stat-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="aa-grid">

        {/* Revenue chart */}
        <div className="aa-panel">
          <div className="aa-panel-header">
            <div>
              <p className="aa-panel-title">Revenue Over Time</p>
              <p className="aa-panel-sub">
                {groupBy === 'daily' ? 'Daily revenue' : 'Monthly revenue'} — {revenueData.length} periods
              </p>
            </div>
          </div>
          <div className="aa-panel-body">
            {loading || revenueLoad
              ? <div className="aa-skeleton aa-chart-skeleton" />
              : revenueData.length === 0
                ? <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '40px 0' }}>No revenue data yet.</p>
                : (
                  <div className="aa-chart">
                    <div className="aa-chart-bars">
                      {revenueData.map((d, i) => {
                        const pct = maxRevenue > 0 ? ((d.revenue ?? 0) / maxRevenue) * 100 : 0;
                        return (
                          <div key={i} className="aa-bar-wrap">
                            <div
                              className="aa-bar"
                              style={{ height: `${Math.max(pct, 2)}%` }}
                            >
                              <span className="aa-bar-tooltip">
                                {fmtCurrency(d.revenue)} · {d.order_count} orders
                              </span>
                            </div>
                            <span className="aa-bar-label">{fmtPeriod(d.period, groupBy)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="aa-chart-meta">
                      <span>{revenueData.length > 0 ? fmtPeriod(revenueData[0]?.period, groupBy) : ''}</span>
                      <span>Total: {fmtCurrency(revenueData.reduce((s, d) => s + (d.revenue ?? 0), 0))}</span>
                      <span>{revenueData.length > 0 ? fmtPeriod(revenueData[revenueData.length - 1]?.period, groupBy) : ''}</span>
                    </div>
                  </div>
                )
            }
          </div>
        </div>

        {/* Top products */}
        <div className="aa-panel">
          <div className="aa-panel-header">
            <div>
              <p className="aa-panel-title">Top Products</p>
              <p className="aa-panel-sub">Ranked by units sold</p>
            </div>
          </div>
          {loading
            ? <div className="aa-panel-body"><div className="aa-skeleton aa-list-skeleton" /></div>
            : prodData.length === 0
              ? <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: '40px 20px' }}>No product data yet.</p>
              : (
                <div className="aa-products-list">
                  {prodData.map((p, i) => (
                    <div key={p.product_id ?? i} className="aa-product-row">
                      <div className={`aa-product-rank aa-product-rank--${i + 1}`}>{i + 1}</div>
                      <div className="aa-product-info">
                        <p className="aa-product-name">{p.name ?? p.product_id ?? '—'}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <div style={{ flex: 1, height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${maxSold > 0 ? ((p.total_sold ?? 0) / maxSold) * 100 : 0}%`,
                              background: 'linear-gradient(90deg, #D4AF37, #b8941f)',
                              borderRadius: 3,
                            }} />
                          </div>
                          <span className="aa-product-sold">{fmt(p.total_sold)} sold</span>
                        </div>
                      </div>
                      <p className="aa-product-revenue">{fmtCurrency(p.total_revenue)}</p>
                    </div>
                  ))}
                </div>
              )
          }
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;
