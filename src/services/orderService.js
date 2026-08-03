import api from './api';

/**
 * Order Service — all order-related API calls.
 * Bearer token attached automatically by api.js interceptor.
 */
const orderService = {

  /**
   * POST /api/v1/orders/
   * Place an order from the current cart.
   * @param {string} shipping_address  - full address as a single string
   * @returns {Promise<{ id, user_id, items, total, status, shipping_address, created_at }>}
   */
  async placeOrder(shipping_address) {
    try {
      const response = await api.post('/api/v1/orders/', { shipping_address });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to place order.');
    }
  },

  /**
   * GET /api/v1/orders/
   * Get all orders for the current user (admin gets all orders).
   * @returns {Promise<Array<{ id, user_id, items, total, status, shipping_address, created_at }>>}
   */
  async getOrders() {
    try {
      const response = await api.get('/api/v1/orders/');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders.');
    }
  },

  /**
   * PUT /api/v1/orders/:order_id/status
   * Update an order's status (admin only).
   * @param {string} id     - order ID
   * @param {string} status - new status value
   * @returns {Promise<Object>} updated order
   */
  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/api/v1/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order status.');
    }
  },

};

export default orderService;
