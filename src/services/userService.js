import api from './api';

/**
 * User Service — admin user management API calls.
 * Bearer token attached automatically by api.js interceptor.
 */
const userService = {

  /**
   * GET /api/v1/users/
   * List all registered users (admin only) with pagination.
   * @param {number} skip  - offset (default 0)
   * @param {number} limit - page size (default 20)
   * @returns {Promise<Array<{ id, email, full_name, role, is_active }>>}
   */
  async getUsers(skip = 0, limit = 20) {
    try {
      const response = await api.get('/api/v1/users/', { params: { skip, limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users.');
    }
  },

};

export default userService;
