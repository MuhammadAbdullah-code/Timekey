import api from './api';

/**
 * Auth Service - handles all authentication-related API calls
 */
const authService = {
  /**
   * Sign up a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.full_name - User full name
   * @param {string} [userData.role='user'] - User role (user or admin)
   * @returns {Promise<Object>} Created user object
   */
  async signup({ email, password, full_name, role = 'user' }) {
    try {
      const response = await api.post('/api/v1/auth/signup', {
        email,
        password,
        full_name,
        role,
      });
      return response.data;
    } catch (error) {
      // Re-throw with formatted error
      throw new Error(error.message || 'Registration failed');
    }
  },

  /**
   * Login user and get JWT access token
   * POST /api/v1/auth/login
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<Object>} user object { access_token, token_type, ...profile }
   */
  async login({ email, password }) {
    try {
      // Step 1 — get the token
      const tokenRes = await api.post('/api/v1/auth/login', { email, password });
      const { access_token, token_type } = tokenRes.data;

      // Step 2 — decode the JWT payload to extract role, email, etc.
      // JWT structure: header.payload.signature — payload is base64url encoded
      const payloadBase64 = access_token.split('.')[1];
      const payloadJson   = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload       = JSON.parse(payloadJson);

      // Payload contains: { sub: "email", exp: timestamp, role: "user"|"admin", ... }
      const user = {
        email:        payload.sub,
        role:         payload.role  ?? 'user',
        full_name:    payload.full_name ?? payload.name ?? '',
        id:           payload.id   ?? payload.user_id ?? null,
        access_token,
        token_type,
      };

      // Step 3 — persist token and user
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  },

  /**
   * GET /api/v1/users/me
   * Get the currently authenticated user's profile.
   * Requires valid JWT token in Authorization header (attached automatically).
   * @returns {Promise<{ id, email, full_name, role, is_active }>}
   */
  async getMe() {
    try {
      const response = await api.get('/api/v1/users/me');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch profile.');
    }
  },

  /**
   * PUT /api/v1/users/me
   * Update the currently authenticated user's profile.
   * @param {{ full_name?: string, password?: string }} data
   * @returns {Promise<{ id, email, full_name, role, is_active }>}
   */
  async updateMe(data) {
    try {
      const response = await api.put('/api/v1/users/me', data);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile.');
    }
  },

  /**
   * Sign out current user
   */
  signout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

export default authService;
