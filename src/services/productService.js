import api from './api';

/**
 * Product Service — handles all product-related API calls.
 * The shared axios instance (api.js) attaches the Bearer token automatically.
 */
const productService = {

  /**
   * Create a new product (admin only)
   * POST /api/v1/products/
   *
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.description
   * @param {number} data.price
   * @param {string} data.category_id   - maps to the selected category
   * @param {number} data.stock         - 0 = out of stock, >0 = in stock
   * @param {string} data.image_url
   * @param {boolean} data.is_active
   * @returns {Promise<Object>} Created product from API
   */
  async createProduct({ name, description, price, category_id, stock, image_url, is_active = true }) {
    try {
      const response = await api.post('/api/v1/products/', {
        name,
        description,
        price,
        category_id,
        stock,
        image_url,
        is_active,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create product.');
    }
  },

  /**
   * Get all products
   * GET /api/v1/products/
   * @param {number} skip  - offset (default 0)
   * @param {number} limit - max results (default 20)
   * @returns {Promise<Array>}
   */
  async getProducts({ skip = 0, limit = 20 } = {}) {
    try {
      const response = await api.get('/api/v1/products/', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch products.');
    }
  },

  /**
   * Update a product by ID (admin only)
   * PUT /api/v1/products/:id
   *
   * @param {string} id  - product ID
   * @param {Object} data - same shape as createProduct
   * @returns {Promise<Object>} Updated product from API
   */
  async updateProduct(id, { name, description, price, category_id, stock, image_url, is_active = true }) {
    try {
      const response = await api.put(`/api/v1/products/${id}`, {
        name,
        description,
        price,
        category_id,
        stock,
        image_url,
        is_active,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update product.');
    }
  },


  async getProduct(id) {
    try {
      const response = await api.get(`/api/v1/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch product.');
    }
  },

  /**
   * Delete a product by ID (admin only)
   * DELETE /api/v1/products/:id
   * @param {string} id - product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(id) {
    try {
      await api.delete(`/api/v1/products/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete product.');
    }
  },

  /**
   * Search products by query string
   * GET /api/v1/products/search?q=query
   * @param {string} q - search query
   * @returns {Promise<Array>}
   */
  async searchProducts(q) {
    try {
      const response = await api.get('/api/v1/products/search', { params: { q } });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Search failed.');
    }
  },

};

export default productService;
