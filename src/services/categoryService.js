import api from './api';

/**
 * Category Service — all category-related API calls.
 * Bearer token is attached automatically by the api.js interceptor.
 */
const categoryService = {

  /**
   * GET /api/v1/categories/
   * Returns all categories — no pagination params.
   * @returns {Promise<Array<{ id: string, name: string, description: string }>>}
   */
  async getCategories() {
    try {
      const res = await api.get('/api/v1/categories/');
      return res.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch categories.');
    }
  },

  /**
   * POST /api/v1/categories/
   * @param {{ name: string, description?: string }} data
   * @returns {Promise<Object>}
   */
  async createCategory({ name, description = '' }) {
    try {
      const res = await api.post('/api/v1/categories/', { name, description });
      return res.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to create category.');
    }
  },

  /**
   * PUT /api/v1/categories/:id
   * @param {string} id
   * @param {{ name: string, description?: string }} data
   * @returns {Promise<Object>}
   */
  async updateCategory(id, { name, description = '' }) {
    try {
      const res = await api.put(`/api/v1/categories/${id}`, { name, description });
      return res.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to update category.');
    }
  },

  /**
   * DELETE /api/v1/categories/{category_id}
   * Returns 204 No Content on success.
   * @param {string} category_id
   * @returns {Promise<void>}
   */
  async deleteCategory(category_id) {
    try {
      await api.delete(`/api/v1/categories/${category_id}`);
    } catch (err) {
      throw new Error(err.message || 'Failed to delete category.');
    }
  },

};

export default categoryService;
