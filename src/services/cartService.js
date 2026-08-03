import api from './api';

/**
 * Cart Service — all cart-related API calls.
 * Bearer token attached automatically by api.js interceptor.
 */
const cartService = {

  /**
   * GET /api/v1/cart/
   * Get the current user's cart.
   * @returns {Promise<{ user_id, items, total }>}
   */
  async getCart() {
    try {
      const response = await api.get('/api/v1/cart/');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch cart.');
    }
  },

  /**
   * POST /api/v1/cart/
   * Add an item to the cart.
   * @param {string} product_id
   * @param {number} quantity
   * @returns {Promise<{ user_id, items, total }>}
   */
  async addItem(product_id, quantity = 1) {
    try {
      const response = await api.post('/api/v1/cart/', { product_id, quantity });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to add item to cart.');
    }
  },

  /**
   * PUT /api/v1/cart/{product_id}
   * Update the quantity of a cart item.
   * @param {string} product_id
   * @param {number} quantity
   * @returns {Promise<{ user_id, items, total }>}
   */
  async updateItem(product_id, quantity) {
    try {
      const response = await api.put(`/api/v1/cart/${product_id}`, { quantity });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update cart item.');
    }
  },

  /**
   * DELETE /api/v1/cart/{product_id}
   * Remove a single item from the cart.
   * @param {string} product_id
   * @returns {Promise<{ user_id, items, total }>}
   */
  async removeItem(product_id) {
    try {
      const response = await api.delete(`/api/v1/cart/${product_id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to remove cart item.');
    }
  },

};

export default cartService;
