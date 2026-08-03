import api from './api';

/**
 * Wishlist Service — all wishlist-related API calls.
 * Bearer token attached automatically by api.js interceptor.
 */
const wishlistService = {

  /**
   * GET /api/v1/wishlist/
   * Get the current user's wishlist.
   * @returns {Promise<{ user_id, items }>}
   */
  async getWishlist() {
    try {
      const response = await api.get('/api/v1/wishlist/');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch wishlist.');
    }
  },

  /**
   * POST /api/v1/wishlist/
   * Add a product to the wishlist.
   * @param {string} product_id
   * @returns {Promise<{ user_id, items }>}
   */
  async addItem(product_id) {
    try {
      const response = await api.post('/api/v1/wishlist/', { product_id });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to add item to wishlist.');
    }
  },

  /**
   * DELETE /api/v1/wishlist/{product_id}
   * Remove a product from the wishlist.
   * @param {string} product_id
   * @returns {Promise<{ user_id, items }>}
   */
  async removeItem(product_id) {
    try {
      const response = await api.delete(`/api/v1/wishlist/${product_id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to remove item from wishlist.');
    }
  },

};

export default wishlistService;
