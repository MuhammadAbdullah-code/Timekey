import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../../services/analyticsService';
import orderService from '../../services/orderService';
import './AdminOverview.css';

const STATUS_CLASS = {
  shipped:    'ov-status--shipped',
  processing: 'ov-status--processing',
  delivered:  'ov-status--delivered',
  pending:    'ov-status--pending',
  cancelled:  'ov-status--cancelled',
};

/* Map range selector value → group_by param */
const RANGE_TO_GROUP = {
  'Last 7 Days':  'daily',
  'Last 30 Days': 'daily',
  'Last 90 Days': 'daily',
  'This Year':    'monthly',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

const AdminOverview = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState('Last 30 Days');

  /* ── Stats ── */
  const [stats,      setStats]      = useState(null);
  const [statsErr,   setStatsErr]   = useState('');

  /* ── Revenue chart ── */
  const [chartData,  setChartData]  = useState([]);
  const [chartErr,   setChartErr]   = useState('');
  const [chartLoading, setChartLoading] = useState(false);

  /* ── Trending product ── */
  const [trending,   setTrending]   = useState(null);

  /* ── Orders ── */
  const [orders,     setOrders]     = useState([]);
  const [ordersErr,  setOrdersErr]  = useState('');
  const [loading,    setLoading]    = useState(true);

  /* ── Fetch summary + orders on mount ── */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      /* Summary stats */
      try {
        const s = await analyticsService.getSummary();
        setStats(s);
        setStatsErr('');
      } catch (e) {
        setStatsErr(e.message);
      }

      /* Recent orders */
      try {
        const all = await orderService.getOrders();
        const sorted = [...(Array.isArray(all) ? all : [])]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setOrders(sorted);
        setOrdersErr('');
      } catch (e) {
        setOrdersErr(e.message);
      }

      /* Top product */
      try {
        const res = await analyticsService.getTopProducts(1);
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (list.length > 0) setTrending(list[0]);
      } catch (_) {
        /* non-critical — trending card just stays hidden */
      }

      setLoading(false);
    };

    fetchAll();
  }, []);

  /* ── Fetch chart when range changes ── */
  const fetchChart = useCallback(async (selectedRange) => {
    setChartLoading(true);
    setChartErr('');
    try {
      const groupBy = RANGE_TO_GROUP[selectedRange] ?? 'daily';
      const res = await analyticsService.getRevenue(groupBy);
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      setChartData(raw);
    } catch (e) {
      setChartErr(e.message);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChart(range);
  }, [range, fetchChart]);

  /* ── Derived chart values ── */
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d) => d.revenue ?? 0)) : 1;
  const peakIdx = chartData.reduce((best, d, i) => (d.revenue > (chartData[best]?.revenue ?? 0) ? i : best), 0);

  /* ── Stat card definitions ── */
  const statCards = [
    { label: 'Total Revenue',    value: stats ? fmt(stats.total_revenue)   : '—' },
    { label: 'Total Orders',     value: stats ? (stats.total_orders ?? '—').toLocaleString() : '—' },
    { label: 'Avg. Order Value', value: stats ? fmt(stats.avg_order_value) : '—' },
    { label: 'Total Customers',  value: stats ? (stats.total_customers ?? '—').toLocaleString() : '—' },
  ];

  /* ── Helpers ── */
  const orderInitials = (name) =>
    (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="ov-root">

      {/* Page title */}
      <div className="ov-page-header">
        <div>
          <h1 className="ov-page-title">Overview</h1>
          <p className="ov-page-meta">
            {loading ? 'Fetching live data…' : 'Live data from database'}
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {statsErr && (
        <div className="ov-api-error">⚠ Could not load summary stats: {statsErr}</div>
      )}
      <div className="ov-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="ov-stat-card">
            <div className="ov-stat-top">
              <p className="ov-stat-label">{card.label}</p>
            </div>
            <p className="ov-stat-value">
              {loading ? <span className="ov-skeleton-val" /> : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Middle row: chart + trending product ── */}
      <div className="ov-mid-row">

        {/* Sales chart */}
        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <div>
              <h2 className="ov-chart-title">Revenue Overview</h2>
              <p className="ov-chart-sub">
                {chartData.length > 0
                  ? `${chartData.length} data points from the API`
                  : 'Historical revenue performance'}
              </p>
            </div>
            <select
              className="ov-range-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {chartErr && <p className="ov-chart-err">⚠ {chartErr}</p>}

          {chartLoading ? (
            <div className="ov-chart-loading">Loading chart…</div>
          ) : chartData.length === 0 && !chartErr ? (
            <div className="ov-chart-empty">No revenue data for this period yet.</div>
          ) : (
            <div className="ov-chart-area">
              <div className="ov-bars">
                {chartData.map((d, i) => (
                  <div key={i} className="ov-bar-col">
                    {i === peakIdx && chartData.length > 1 && (
                      <span className="ov-peak-label">Peak</span>
                    )}
                    <div
                      className={`ov-bar ${i === peakIdx && chartData.length > 1 ? 'ov-bar--peak' : ''}`}
                      style={{ height: `${((d.revenue ?? 0) / maxVal) * 100}%` }}
                      title={`${d.period ?? ''}: ${fmt(d.revenue)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="ov-chart-x-labels">
                {chartData
                  .filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 6)) === 0)
                  .map((d, i) => (
                    <span key={i} className="ov-x-label">
                      {d.period ? String(d.period).slice(-5) : ''}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Trending product */}
        {trending && (
          <div className="ov-trending-card">
            <div className="ov-trending-img-wrap">
              <img
                src={trending.image_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop'}
                alt={trending.name}
                className="ov-trending-img"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop'; }}
              />
              <span className="ov-trending-badge">Top Seller</span>
            </div>
            <div className="ov-trending-info">
              <h3 className="ov-trending-name">{trending.name}</h3>
              <p className="ov-trending-desc">
                {trending.total_sold != null
                  ? `${trending.total_sold} units sold — ${fmt(trending.total_revenue)} total revenue.`
                  : 'Best performing product this period.'}
              </p>
              <div className="ov-trending-footer">
                {trending.total_revenue != null && (
                  <span className="ov-trending-price">{fmt(trending.total_revenue)}</span>
                )}
                <button className="ov-trending-btn" onClick={() => navigate('/admin/products')}>
                  View Stock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div className="ov-orders-card">
        <div className="ov-orders-header">
          <div>
            <h2 className="ov-orders-title">Recent Orders</h2>
            <p className="ov-orders-sub">Latest {orders.length} customer transactions from the database</p>
          </div>
          <div className="ov-orders-actions">
            <button className="ov-viewall-btn" onClick={() => navigate('/admin/orders')}>
              View All
            </button>
          </div>
        </div>

        {ordersErr && (
          <div className="ov-api-error" style={{ margin: '12px 16px' }}>⚠ {ordersErr}</div>
        )}

        {!ordersErr && orders.length === 0 && !loading && (
          <div className="ov-orders-empty">No orders found in the database yet.</div>
        )}

        {orders.length > 0 && (
          <div className="ov-table-wrap">
            <table className="ov-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusKey = (order.status ?? '').toLowerCase();
                  const customerName = order.user_name || order.customer_name || order.user_email || `User ${String(order.user_id ?? '').slice(0, 6)}`;
                  return (
                    <tr key={order.id}>
                      <td className="ov-order-id">#{String(order.id).slice(0, 8).toUpperCase()}</td>
                      <td>
                        <div className="ov-customer-cell">
                          <div className="ov-customer-initials">{orderInitials(customerName)}</div>
                          <span>{customerName}</span>
                        </div>
                      </td>
                      <td className="ov-date">{fmtDate(order.created_at)}</td>
                      <td>
                        <span className={`ov-status ${STATUS_CLASS[statusKey] ?? 'ov-status--pending'}`}>
                          {order.status ?? 'pending'}
                        </span>
                      </td>
                      <td className="ov-total">{fmt(order.total)}</td>
                      <td>
                        <button
                          className="ov-action-btn"
                          aria-label="View order"
                          onClick={() => navigate('/admin/orders')}
                        >
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
      </div>
    </div>
  );
};

export default AdminOverview;
