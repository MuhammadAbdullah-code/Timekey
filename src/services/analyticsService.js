import api from './api';

/**
 * Analytics Service — admin-only analytics API calls.
 * Bearer token attached automatically by api.js interceptor.
 */
const analyticsService = {

  /**
   * GET /api/v1/analytics/summary
   * @returns {Promise<{ total_revenue, total_orders, total_customers, avg_order_value }>}
   */
  async getSummary() {
    try {
      const res = await api.get('/api/v1/analytics/summary');
      return res.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch analytics summary.');
    }
  },

  /**
   * GET /api/v1/analytics/revenue?group_by=daily|monthly
   * @param {'daily'|'monthly'} groupBy
   * @returns {Promise<{ group_by: string, data: Array<{ period, revenue, order_count }> }>}
   */
  async getRevenue(groupBy = 'monthly') {
    try {
      const res = await api.get('/api/v1/analytics/revenue', {
        params: { group_by: groupBy },
      });
      return res.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch revenue data.');
    }
  },

  /**
   * GET /api/v1/analytics/products?limit=10
   * @param {number} limit
   * @returns {Promise<{ data: Array<{ product_id, name, total_sold, total_revenue }> }>}
   */
  async getTopProducts(limit = 10) {
    try {
      const res = await api.get('/api/v1/analytics/products', {
        params: { limit },
      });
      return res.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch top products.');
    }
  },
};

export default analyticsService;
